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
  const [loading, setLoading] = useState(true);

  // 如果提供了imagePath,获取访问token
  useEffect(() => {
    if (!imagePath) {
      setTokenUrl(src);
      setLoading(false);
      return;
    }

    const fetchToken = async () => {
      try {
        const response = await fetch('/api/images/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imagePath }),
        });

        const data = await response.json();

        if (data.success && data.token) {
          // 构建带token的图片URL
          const url = `/api/images/${imagePath}?token=${data.token}`;
          setTokenUrl(url);
        } else {
          console.error('Failed to get image token:', data.error);
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
