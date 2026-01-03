'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ProtectedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  imagePath?: string; // 图片路径,用于获取token
}

// 全局token缓存（在组件实例间共享）
const tokenCache = new Map<string, { token: string; expiresAt: number }>();
const pendingRequests = new Map<string, Promise<string | null>>();

// 批量获取token的请求队列
let batchQueue: string[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

/**
 * 清理过期的token
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [key, value] of tokenCache.entries()) {
    if (value.expiresAt < now) {
      tokenCache.delete(key);
    }
  }
}

// 每分钟清理一次过期token
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredTokens, 60000);
}

/**
 * 批量获取token
 */
async function batchFetchTokens(imagePaths: string[]): Promise<Record<string, string>> {
  try {
    const response = await fetch('/api/images/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imagePaths }),
    });

    const data = await response.json();

    if (data.success && data.tokens) {
      // 缓存所有token
      const now = Date.now();
      for (const [path, token] of Object.entries(data.tokens)) {
        tokenCache.set(path, {
          token: token as string,
          expiresAt: now + 5 * 60 * 1000, // 5分钟
        });
      }
      return data.tokens as Record<string, string>;
    }

    return {};
  } catch (error) {
    console.error('Batch fetch tokens error:', error);
    return {};
  }
}

/**
 * 获取单个图片的token（使用缓存和批量请求）
 */
async function getImageToken(imagePath: string): Promise<string | null> {
  // 检查缓存
  const cached = tokenCache.get(imagePath);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  // 如果有正在进行的请求，等待它完成
  const existingRequest = pendingRequests.get(imagePath);
  if (existingRequest) {
    return existingRequest;
  }

  // 创建新的请求Promise
  const requestPromise = (async () => {
    // 添加到批量队列
    batchQueue.push(imagePath);

    // 如果已经有定时器，等待它；否则创建新的定时器
    if (!batchTimeout) {
      batchTimeout = setTimeout(async () => {
        const pathsToFetch = [...batchQueue];
        batchQueue = [];
        batchTimeout = null;

        // 批量获取token
        await batchFetchTokens(pathsToFetch);
      }, 50); // 50ms内的请求会合并为一次批量请求
    }

    // 等待批量请求完成
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (tokenCache.has(imagePath)) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 10);

      // 超时保护（1秒）
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(null);
      }, 1000);
    });

    // 从缓存获取token
    const cached = tokenCache.get(imagePath);
    pendingRequests.delete(imagePath);

    return cached?.token || null;
  })();

  pendingRequests.set(imagePath, requestPromise);
  return requestPromise;
}

/**
 * 受保护的图片组件
 * 禁止右键、拖拽、长按保存等操作
 * 支持Token验证的图片访问
 *
 * 注意：对于 /api/images 路径的本地图片，使用自定义 loader
 */
export default function ProtectedImage(props: ProtectedImageProps) {
  const { src, imagePath, ...rest } = props;
  const imgRef = useRef<HTMLImageElement>(null);
  const [tokenUrl, setTokenUrl] = useState<string>(src);
  const [loading, setLoading] = useState(imagePath ? true : false);

  // 如果提供了imagePath,获取访问token
  useEffect(() => {
    if (!imagePath) {
      setTokenUrl(src);
      setLoading(false);
      return;
    }

    const fetchToken = async () => {
      try {
        const token = await getImageToken(imagePath);

        if (token) {
          // 构建带token的图片URL
          const url = `/api/images/${imagePath}?token=${token}`;
          setTokenUrl(url);
        } else {
          // Token获取失败，使用原始src
          console.error('Failed to get image token for:', imagePath);
          setTokenUrl(src);
        }
      } catch (err) {
        console.error('Failed to fetch image token:', err);
        setTokenUrl(src);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [imagePath, src]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // 禁用右键菜单
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 禁用拖拽
    const handleDragStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 禁用触摸长按
    const handleTouchStart = (e: Event) => {
      // 延迟执行,如果只是快速点击则不阻止
      const touchTimer = setTimeout(() => {
        (e as any).preventDefault();
      }, 500);

      // 清理定时器
      const clearTouchTimer = () => {
        clearTimeout(touchTimer);
        img.removeEventListener('touchend', clearTouchTimer);
        img.removeEventListener('touchmove', clearTouchTimer);
      };

      img.addEventListener('touchend', clearTouchTimer);
      img.addEventListener('touchmove', clearTouchTimer);
    };

    // 添加事件监听
    img.addEventListener('contextmenu', handleContextMenu);
    img.addEventListener('dragstart', handleDragStart);
    img.addEventListener('touchstart', handleTouchStart, { passive: true });

    // 添加CSS样式
    (img.style as any).webkitUserSelect = 'none';
    img.style.userSelect = 'none';
    (img.style as any).webkitTouchCallout = 'none';
    (img.style as any).webkitUserDrag = 'none';

    return () => {
      img.removeEventListener('contextmenu', handleContextMenu);
      img.removeEventListener('dragstart', handleDragStart);
      img.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  if (loading && imagePath) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${props.className || ''}`}
        style={props.fill ? { position: 'absolute', inset: 0 } : {}}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
    >
      <Image
        ref={imgRef}
        src={tokenUrl}
        alt={props.alt}
        width={props.width}
        height={props.height}
        fill={props.fill}
        className={props.className}
        priority={props.priority}
        sizes={props.sizes}
        loader={({ src }) => src}
        unoptimized={true}
        draggable={false}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          pointerEvents: loading ? 'none' : 'auto',
        }}
      />
    </div>
  );
}
