import { ComicPanel, ComicScript, MangaStyle } from '@/types/manga-generation';
import { logger } from '@/lib/utils/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_SCRIPT_MODEL = process.env.GEMINI_SCRIPT_MODEL || 'gemini-2.0-flash-exp';
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-exp';
const RATE_LIMIT_DELAY = parseInt(process.env.GEMINI_RATE_LIMIT_DELAY || '2000');

// 记录配置信息
logger.info('Gemini Service Initialized', {
  hasApiKey: !!GEMINI_API_KEY,
  apiKeyLength: GEMINI_API_KEY.length,
  scriptModel: GEMINI_SCRIPT_MODEL,
  imageModel: GEMINI_IMAGE_MODEL,
  rateLimitDelay: RATE_LIMIT_DELAY,
});

// 脚本生成的系统提示词
const SCRIPT_SYSTEM_PROMPT = `**角色设定：**
你现在是顶流科普公众号"芝士"的首席脚本作家。你的专长是把极其枯燥、抽象的 AI 技术概念，翻译成连隔壁二傻子都能听懂的爆笑漫画脚本。

**核心任务：**
接收用户输入的一个 AI 概念（如"Embedding"、"Transformer"），创作一个多格漫画脚本（通常为 24-32 格，根据复杂程度定）。

**风格铁律（必须遵守）：**
1.  **强制比喻：** 绝不能直接解释技术！必须找到一个极其生活化、甚至有点荒诞的实体比喻。例如：Token 是"切碎的积木"，算力是"厨师的做菜速度"，模型训练是"填鸭式教育"。
2.  **固定人设：** 故事必须由【呆萌屏脸机器人】（代表死板的 AI 逻辑）和【暴躁吐槽猫】（代表常识人类）共同演绎。猫负责提问、质疑和吐槽，机器人负责用奇葩方式演示，最后出糗。
3.  **语言风格：** 极度口语化、接地气，使用短句、感叹句。夹杂一些网络热梗或略带贱兮兮的语气。拒绝任何专业术语堆砌，除非马上用人话解释它。
4.  **结构要求：** 脚本必须包含四个阶段：起因（猫提出离谱需求）-> 解释（机器人用奇葩比喻演示）-> 冲突/出糗（比喻带来的搞笑副作用）-> 总结（猫的精辟吐槽和一句话知识点）。

**输出格式：**
输出 JSON 数组形式的脚本，每个元素包含：
- panelNumber: 格数（从1开始）
- sceneDescription: 画面描述（供画师参考，详细描述场景、人物动作、表情）
- dialogue: 台词/旁白（混知风文案，包含对话和旁白）

**示例参考（Token 篇）：**
核心比喻：把阅读比作"吃东西"，Token 就是为了好消化而切碎的"食物渣渣"。
[
  {
    "panelNumber": 1,
    "sceneDescription": "猫丢给机器人一本厚书《红楼梦》，猫拿着茶杯一脸轻松",
    "dialogue": "猫：把这书读了，给我出个"林黛玉怼人语录"。"
  },
  {
    "panelNumber": 10,
    "sceneDescription": "机器人拿着菜刀疯狂剁"人工智能"四个大字，案板上全是碎渣",
    "dialogue": "机器人：为了消化，得把它们剁成最小单位！这些"文字渣渣"就叫 Token！"
  }
]

请严格按照 JSON 格式输出，不要添加任何其他文字说明。`;

// 图片生成的提示词模板
function getImagePrompt(
  panel: ComicPanel,
  style: MangaStyle,
  referenceCharacter: string
): string {
  const stylePrompts = {
    peach: '蜜桃灰灰风格，可爱粉嫩配色，圆润线条，温馨治愈氛围',
    cat: '暴躁猫风格，夸张表情，动感线条，搞笑逗趣',
    doraemon: '哆啦A梦风格，蓝白色调，简约线条，温馨友好'
  };

  return `Create a manga panel illustration in ${stylePrompts[style]}.
Scene: ${panel.sceneDescription}
Characters: A cute robot with a screen face and a grumpy cat.
Style reference: ${referenceCharacter}
Visual requirements: High quality, detailed, expressive characters, comic book style, manga format.`;
}

/**
 * 延迟函数，用于速率限制
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 调用 Gemini API 生成漫画脚本
 */
export async function generateComicScript(concept: string): Promise<ComicPanel[]> {
  const startTime = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_SCRIPT_MODEL}:generateContent`;

  try {
    // 验证 API Key
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      logger.error('Invalid API Key', {
        hasApiKey: !!GEMINI_API_KEY,
        keyValue: GEMINI_API_KEY.substring(0, 10) + '...',
      });
      throw new Error('请先配置有效的 GEMINI_API_KEY 环境变量');
    }

    logger.scriptGenerationStart(concept, GEMINI_SCRIPT_MODEL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时

    const requestBody = {
      contents: [{
        parts: [{
          text: `${SCRIPT_SYSTEM_PROMPT}\n\n请为以下AI概念创作漫画脚本：${concept}`
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    };

    // 记录请求日志
    logger.apiRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: requestBody,
    });

    logger.debug('Sending script generation request', {
      concept,
      promptLength: requestBody.contents[0].parts[0].text.length,
      model: GEMINI_SCRIPT_MODEL,
    });

    const response = await fetch(endpoint + `?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;

    // 记录响应日志
    logger.apiResponse(endpoint, {
      status: response.status,
      statusText: response.statusText,
      duration,
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.apiError(endpoint, errorData);
      throw new Error(errorData.error?.message || 'Failed to generate script');
    }

    const data = await response.json();

    logger.debug('Gemini API response received', {
      hasCandidates: !!data.candidates,
      candidateCount: data.candidates?.length,
      finishReason: data.candidates?.[0]?.finishReason,
    });

    const text = data.candidates[0].content.parts[0].text;

    logger.debug('Generated script text length', {
      textLength: text.length,
      preview: text.substring(0, 200),
    });

    // 尝试解析 JSON
    let panels: ComicPanel[];
    try {
      // 提取 JSON 部分（可能包含 markdown 代码块）
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        panels = JSON.parse(jsonMatch[0]);
        logger.debug('Parsed script from JSON match', {
          panelCount: panels.length,
        });
      } else {
        panels = JSON.parse(text);
        logger.debug('Parsed script from full text', {
          panelCount: panels.length,
        });
      }
    } catch (parseError) {
      logger.error('Failed to parse generated script', {
        error: parseError instanceof Error ? parseError.message : String(parseError),
        textLength: text.length,
        textPreview: text.substring(0, 500),
      });
      throw new Error('生成的脚本格式错误，请重试');
    }

    // 验证和转换数据
    const result = panels.map((panel: any, index: number) => ({
      panelNumber: index + 1,
      sceneDescription: panel.sceneDescription || '',
      dialogue: panel.dialogue || ''
    }));

    logger.scriptGenerationSuccess(result.length, duration);
    logger.info('Script panels processed', {
      totalPanels: result.length,
      firstPanel: result[0],
      lastPanel: result[result.length - 1],
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.scriptGenerationFailure(error, duration);

    // 判断错误类型
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        logger.error('Request timeout', {
          endpoint,
          timeout: 120000,
          duration,
        });
      } else if (error.message.includes('fetch')) {
        logger.error('Network error', {
          endpoint,
          message: error.message,
        });
      }
    }

    throw error;
  }
}

/**
 * 调用 Gemini API 生成单张图片
 */
export async function generatePanelImage(
  panel: ComicPanel,
  style: MangaStyle,
  referenceImageData?: string
): Promise<string> {
  const startTime = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

  try {
    // 验证 API Key
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      logger.error('Invalid API Key for image generation', {
        hasApiKey: !!GEMINI_API_KEY,
      });
      throw new Error('请先配置有效的 GEMINI_API_KEY 环境变量');
    }

    logger.imageGenerationStart(panel.panelNumber, style);

    const prompt = getImagePrompt(panel, style, 'character reference');

    const requestBody: any = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      },
    };

    // 如果有参考图片，添加到请求中
    if (referenceImageData) {
      requestBody.contents[0].parts.unshift({
        inline_data: {
          mime_type: 'image/png',
          data: referenceImageData
        }
      });
      logger.debug('Image generation with reference', {
        panelNumber: panel.panelNumber,
        hasReference: true,
        referenceSize: referenceImageData.length,
      });
    }

    logger.debug('Sending image generation request', {
      panelNumber: panel.panelNumber,
      style,
      promptLength: prompt.length,
      hasReference: !!referenceImageData,
      model: GEMINI_IMAGE_MODEL,
    });

    // 记录请求日志
    logger.apiRequest(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: {
        ...requestBody,
        // 不记录完整的参考图片数据
        contents: referenceImageData
          ? [{ parts: ['<reference image data>', { text: prompt }] }]
          : requestBody.contents,
      },
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时

    const response = await fetch(endpoint + `?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;

    // 记录响应日志
    logger.apiResponse(endpoint, {
      status: response.status,
      statusText: response.statusText,
      duration,
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.apiError(endpoint, errorData);
      throw new Error(errorData.error?.message || 'Failed to generate image');
    }

    const data = await response.json();

    logger.debug('Image generation response received', {
      panelNumber: panel.panelNumber,
      hasCandidates: !!data.candidates,
      candidateCount: data.candidates?.length,
      finishReason: data.candidates?.[0]?.finishReason,
    });

    // 提取 base64 图片数据
    if (data.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data) {
      const imageData = data.candidates[0].content.parts[0].inline_data.data;
      const imageSize = Buffer.from(imageData, 'base64').length;

      logger.imageGenerationSuccess(panel.panelNumber, duration, imageSize);
      logger.debug('Image generated successfully', {
        panelNumber: panel.panelNumber,
        imageSize: `${Math.round(imageSize / 1024)}KB`,
        base64Length: imageData.length,
      });

      return imageData;
    } else {
      logger.error('No image data in response', {
        panelNumber: panel.panelNumber,
        responseStructure: Object.keys(data),
      });
      throw new Error('No image data in response');
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.imageGenerationFailure(panel.panelNumber, error, duration);

    // 判断错误类型
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        logger.error('Image generation timeout', {
          panelNumber: panel.panelNumber,
          timeout: 120000,
          duration,
        });
      } else if (error.message.includes('fetch')) {
        logger.error('Image generation network error', {
          panelNumber: panel.panelNumber,
          message: error.message,
        });
      }
    }

    throw error;
  }
}

/**
 * 顺序生成所有漫画图片（带速率限制）
 */
export async function generateAllComicImages(
  panels: ComicPanel[],
  style: MangaStyle,
  referenceImageData: string | undefined,
  onProgress?: (current: number, total: number) => void
): Promise<ComicPanel[]> {
  const batchStartTime = Date.now();
  const results = [...panels];
  let successCount = 0;
  let failureCount = 0;

  logger.info('Batch image generation started', {
    totalPanels: panels.length,
    style,
    hasReference: !!referenceImageData,
    rateLimitDelay: RATE_LIMIT_DELAY,
  });

  for (let i = 0; i < results.length; i++) {
    try {
      // 速率限制延迟
      if (i > 0) {
        logger.debug(`Rate limit delay before panel ${i + 1}`, {
          delay: RATE_LIMIT_DELAY,
        });
        await delay(RATE_LIMIT_DELAY);
      }

      logger.batchProgress(i + 1, results.length, `Generating panel ${i + 1}`);

      // 更新进度
      if (onProgress) {
        onProgress(i + 1, results.length);
      }

      // 生成图片
      const imageData = await generatePanelImage(results[i], style, referenceImageData);
      results[i].generatedImage = imageData;
      successCount++;

      logger.debug(`Panel ${i + 1} completed successfully`, {
        progress: `${i + 1}/${results.length}`,
        successRate: `${Math.round((successCount / (i + 1)) * 100)}%`,
      });
    } catch (error) {
      failureCount++;
      logger.error(`Failed to generate image for panel ${i + 1}`, {
        error: error instanceof Error ? error.message : String(error),
        progress: `${i + 1}/${results.length}`,
        successCount,
        failureCount,
      });
      results[i].generationError = error instanceof Error ? error.message : '生成失败';
    }
  }

  const totalDuration = Date.now() - batchStartTime;

  logger.info('Batch image generation completed', {
    totalPanels: panels.length,
    successCount,
    failureCount,
    totalDuration: `${totalDuration}ms`,
    avgTimePerPanel: `${Math.round(totalDuration / panels.length)}ms`,
    successRate: `${Math.round((successCount / panels.length) * 100)}%`,
  });

  return results;
}

/**
 * 重新生成指定面板的图片
 */
export async function regeneratePanelImage(
  panel: ComicPanel,
  style: MangaStyle,
  referenceImageData?: string
): Promise<string> {
  logger.info('Regenerating panel image', {
    panelNumber: panel.panelNumber,
    style,
    hasReference: !!referenceImageData,
  });

  // 速率限制延迟
  logger.debug('Rate limit delay before regeneration', {
    delay: RATE_LIMIT_DELAY,
  });
  await delay(RATE_LIMIT_DELAY);

  return generatePanelImage(panel, style, referenceImageData);
}

/**
 * 将 base64 图片数据保存为文件（服务端使用）
 */
export async function saveBase64Image(
  base64Data: string,
  filename: string
): Promise<string> {
  // 这个函数会在 API 路由中使用
  // 返回保存后的文件路径或 URL
  return `/api/images/${filename}`;
}
