import { NextRequest, NextResponse } from 'next/server';
import { generateComicScript } from '@/lib/services/geminiServiceProxy';
import { MangaStyle } from '@/types/manga-generation';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`[API] 📝 /api/generate-comic/script 请求开始`);
  console.log(`[API] ⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const { concept, style } = await request.json();

    console.log(`[API] 📥 请求参数:`);
    console.log(`[API]    - concept: ${concept}`);
    console.log(`[API]    - style: ${style}`);

    if (!concept) {
      console.error(`[API] ❌ 缺少 concept 参数`);
      return NextResponse.json(
        { success: false, error: '请提供AI概念' },
        { status: 400 }
      );
    }

    if (!style || !['peach', 'cat', 'doraemon'].includes(style)) {
      console.error(`[API] ❌ 无效的 style 参数: ${style}`);
      return NextResponse.json(
        { success: false, error: '请选择有效的风格' },
        { status: 400 }
      );
    }

    console.log(`[API] ✅ 参数验证通过`);

    // 生成脚本
    console.log(`[API] 📝 调用 generateComicScript...`);
    const panels = await generateComicScript(concept);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[API] ✅ 脚本生成成功`);
    console.log(`[API] 📊 返回面板数: ${panels.length}`);
    console.log(`[API] ⏱️  总耗时: ${duration}ms`);
    console.log(`${'='.repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      panels: panels,
      totalPanels: panels.length
    });
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.error(`\n${'='.repeat(60)}`);
    console.error(`[API] ❌ /api/generate-comic/script 请求失败`);
    console.error(`[API] ⏱️  耗时: ${duration}ms`);
    console.error(`[API] ❌ 错误信息:`, error);
    console.error(`${'='.repeat(60)}\n`);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成脚本失败'
      },
      { status: 500 }
    );
  }
}
