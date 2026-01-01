'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function TestPage() {
  const [testImages, setTestImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [nativeImgResults, setNativeImgResults] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch('/api/manga/local')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          const firstManga = data.data[0];
          console.log('=== Test manga ===', firstManga);
          setTestImages([
            firstManga.coverImage,
            ...(firstManga.chapters[0]?.pages?.slice(0, 2) || [])
          ]);
        }
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleNativeImgLoad = (index: number) => {
    console.log(`✅ Native img ${index} loaded successfully`);
    setNativeImgResults(prev => ({ ...prev, [index]: true }));
  };

  const handleNativeImgError = (index: number, src: string) => {
    console.error(`❌ Native img ${index} failed to load:`, src);
    setNativeImgResults(prev => ({ ...prev, [index]: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">图片加载测试页面</h1>

      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="space-y-8">
          {testImages.map((src, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">测试图片 {index + 1}</h2>

              <div className="mb-4 p-3 bg-gray-100 rounded">
                <p className="text-sm font-mono break-all text-red-600 font-bold">{src}</p>
              </div>

              {/* 测试1: 原生 img 标签 */}
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-lg">测试1: 原生 &lt;img&gt; 标签</h3>
                <div className="w-full h-64 bg-gray-200 rounded overflow-hidden border-2 border-blue-500">
                  <img
                    src={src}
                    alt={`Native test ${index}`}
                    className="w-full h-full object-contain"
                    onLoad={() => handleNativeImgLoad(index)}
                    onError={() => handleNativeImgError(index, src)}
                  />
                </div>
                <p className="mt-2 text-sm">
                  状态: {nativeImgResults[index] === true ? '✅ 成功加载' : nativeImgResults[index] === false ? '❌ 加载失败' : '⏳ 等待中...'}
                </p>
              </div>

              {/* 测试2: Next.js Image (不使用 ProtectedImage) */}
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-lg">测试2: Next.js Image (unoptimized)</h3>
                <div className="relative w-full h-64 bg-gray-200 rounded overflow-hidden border-2 border-green-500">
                  <Image
                    src={src}
                    alt={`Next.js test ${index}`}
                    fill
                    className="object-contain"
                    unoptimized={true}
                  />
                </div>
              </div>

              {/* 测试3: Next.js Image with loader */}
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-lg">测试3: Next.js Image (with custom loader)</h3>
                <div className="relative w-full h-64 bg-gray-200 rounded overflow-hidden border-2 border-purple-500">
                  <Image
                    src={src}
                    alt={`Next.js loader test ${index}`}
                    fill
                    className="object-contain"
                    loader={({ src }) => src}
                    unoptimized={true}
                  />
                </div>
              </div>

              {/* 测试4: 直接链接 */}
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-lg">测试4: 在新窗口打开</h3>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  在新标签页打开此图片
                </a>
              </div>

              {/* 调试信息 */}
              <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
                <h4 className="font-medium mb-2">调试信息:</h4>
                <ul className="text-sm space-y-1">
                  <li>URL长度: {src.length}</li>
                  <li>是否以/api/images开头: {src.startsWith('/api/images') ? '是' : '否'}</li>
                  <li>URL编码: {encodeURIComponent(src)}</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {testImages.length === 0 && !loading && (
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-red-600">❌ 没有找到测试图片</p>
        </div>
      )}
    </div>
  );
}
