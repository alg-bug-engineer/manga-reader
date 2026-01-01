/**
 * Gemini API 服务客户端（Node.js）
 * 通过 Python 代理服务器调用 Gemini API
 */

const PROXY_SERVER_URL = process.env.GEMINI_PROXY_SERVER || 'http://127.0.0.1:3001';
const REQUEST_TIMEOUT = parseInt(process.env.GEMINI_REQUEST_TIMEOUT || '120000'); // 120秒

/**
 * 通用请求处理函数
 */
async function proxyRequest(
  endpoint: string,
  data: any,
  timeout: number = REQUEST_TIMEOUT
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[Proxy] → 请求开始`);
    console.log(`[Proxy] → 端点: ${endpoint}`);
    console.log(`[Proxy] → 服务器: ${PROXY_SERVER_URL}`);
    console.log(`[Proxy] → 超时设置: ${timeout/1000}秒`);
    console.log(`[Proxy] → 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
    console.log(`[Proxy] → 请求数据:`, JSON.stringify(data, null, 2));
    console.log(`${'='.repeat(60)}\n`);

    const startTime = Date.now();

    const response = await fetch(`${PROXY_SERVER_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    clearTimeout(timeoutId);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[Proxy] ← 响应接收`);
    console.log(`[Proxy] ← HTTP 状态: ${response.status} ${response.statusText}`);
    console.log(`[Proxy] ← 耗时: ${duration}ms`);
    console.log(`${'='.repeat(60)}\n`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Proxy] ❌ 请求失败`);
      console.error(`[Proxy] ❌ 错误详情:`, JSON.stringify(errorData, null, 2));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`[Proxy] ✅ 响应解析成功`);
    return result;
  } catch (error: any) {
    clearTimeout(timeoutId);

    console.error(`\n${'='.repeat(60)}`);
    console.error(`[Proxy] ❌ 请求异常`);
    console.error(`${'='.repeat(60)}`);

    if (error.name === 'AbortError') {
      console.error(`[Proxy] ❌ 请求超时 (${timeout/1000}秒)`);
      throw new Error(`请求超时 (${timeout/1000}秒)`);
    }

    if (error instanceof TypeError && error.message.includes('ECONNREFUSED')) {
      console.error(`[Proxy] ❌ 无法连接到 Python 代理服务器`);
      console.error(`[Proxy] 💡 请确保服务器正在运行: ./start-proxy-server.sh`);
      throw new Error('无法连接到 Python 代理服务器。请确保服务器正在运行：./start-proxy-server.sh');
    }

    console.error(`[Proxy] ❌ 错误类型: ${error.name}`);
    console.error(`[Proxy] ❌ 错误信息: ${error.message}`);
    console.error(`${'='.repeat(60)}\n`);

    throw error;
  }
}

/**
 * 调用 Gemini API 生成漫画脚本
 */
export async function generateComicScript(concept: string): Promise<any> {
  const model = process.env.GEMINI_SCRIPT_MODEL || 'gemini-2.0-flash-exp';

  console.log(`[Proxy] 📝 正在生成脚本...`);
  console.log(`[Proxy]    概念: ${concept}`);
  console.log(`[Proxy]    模型: ${model}`);

  try {
    const data = await proxyRequest('/api/generate-script', {
      concept,
      model,
    });

    if (!data.success) {
      throw new Error(data.error || '生成脚本失败');
    }

    console.log(`[Proxy] ✅ 脚本生成成功，共 ${data.totalPanels} 格`);
    return data.panels;
  } catch (error) {
    console.error(`[Proxy] ❌ 脚本生成失败:`, error);
    throw error;
  }
}

/**
 * 调用 Gemini API 生成图片
 */
export async function generatePanelImage(
  panel: any,
  style: string,
  referenceImageData?: string
): Promise<string> {
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-exp';

  console.log(`[Proxy] 🎨 正在生成第 ${panel.panelNumber} 格图片...`);
  console.log(`[Proxy]    风格: ${style}`);
  console.log(`[Proxy]    参考: ${referenceImageData ? '有' : '无'}`);

  try {
    const data = await proxyRequest('/api/generate-image', {
      panel,
      style,
      model,
      referenceImageData,
    });

    if (!data.success) {
      throw new Error(data.error || '生成图片失败');
    }

    console.log(`[Proxy] ✅ 图片生成成功 (${(data.imageData.length / 1024).toFixed(1)} KB)`);
    return data.imageData;
  } catch (error) {
    console.error(`[Proxy] ❌ 图片生成失败:`, error);
    throw error;
  }
}

/**
 * 重新生成图片
 */
export async function regeneratePanelImage(
  panel: any,
  style: string,
  referenceImageData?: string
): Promise<string> {
  console.log(`[Proxy] 🔄 重新生成第 ${panel.panelNumber} 格图片...`);

  try {
    const data = await proxyRequest('/api/regenerate-image', {
      panel,
      style,
      referenceImageData,
    });

    if (!data.success) {
      throw new Error(data.error || '重新生成失败');
    }

    console.log(`[Proxy] ✅ 重新生成成功`);
    return data.imageData;
  } catch (error) {
    console.error(`[Proxy] ❌ 重新生成失败:`, error);
    throw error;
  }
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${PROXY_SERVER_URL}/health`, {
      signal: AbortSignal.timeout(5000), // 5秒超时
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'ok' && data.client_initialized && data.has_api_key;
  } catch (error) {
    console.error('[Proxy] ❌ 健康检查失败:', error);
    return false;
  }
}
