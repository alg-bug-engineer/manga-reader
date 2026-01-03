'use client';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const checkAuth = async () => {
    try {
      // 1. 检查Cookie
      const cookies = document.cookie;
      console.log('Document cookies:', cookies);

      const hasSession = cookies.includes('session=');
      setDebugInfo(prev => ({ ...prev, hasSession, cookies }));

      // 2. 测试Token API
      const response = await fetch('/api/images/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePaths: ['/api/images/test/封面.jpg']
        }),
      });

      const data = await response.json();

      setDebugInfo(prev => ({
        ...prev,
        tokenResponse: {
          status: response.status,
          ok: response.ok,
          data
        }
      }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const checkSingleToken = async () => {
    try {
      const response = await fetch('/api/images/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePath: '/api/images/test/封面.jpg'
        }),
      });

      const data = await response.json();

      setDebugInfo(prev => ({
        ...prev,
        singleTokenResponse: {
          status: response.status,
          ok: response.ok,
          data
        }
      }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">图片Token调试工具</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">诊断步骤</h2>

          <div className="space-y-4">
            <button
              onClick={checkAuth}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              1. 检查登录状态和Token API
            </button>

            <button
              onClick={checkSingleToken}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              2. 测试单个Token API
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">错误</h3>
            <pre className="text-red-700 text-sm">{error}</pre>
          </div>
        )}

        {debugInfo && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">调试信息</h2>
            <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">常见问题</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h3 className="font-semibold">401 Unauthorized</h3>
              <p className="text-gray-600">
                原因: 未登录或Session过期<br />
                解决: 重新登录系统
              </p>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
              <h3 className="font-semibold">Cookie未设置</h3>
              <p className="text-gray-600">
                检查浏览器控制台的Application > Cookies<br />
                确认域名是否正确
              </p>
            </div>

            <div className="border-l-4 border-green-400 pl-4">
              <h3 className="font-semibold">Token验证失败</h3>
              <p className="text-gray-600">
                检查服务器日志: pm2 logs manga-reader<br />
                查找 "[Image Tokens Batch]" 或 "[Image Token]" 日志
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
