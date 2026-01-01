import { NextRequest, NextResponse } from 'next/server';
import { generatePanelImage } from '@/lib/services/geminiServiceProxy';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`[API] 🎨 /api/generate-comic/image 请求开始`);
  console.log(`[API] ⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const { panel, style, referenceImageData } = await request.json();

    console.log(`[API] 📥 请求参数:`);
    console.log(`[API]    - panelNumber: ${panel?.panelNumber}`);
    console.log(`[API]    - style: ${style}`);
    console.log(`[API]    - referenceImageData: ${referenceImageData ? '有' : '无'}`);

    if (!panel || !style) {
      console.error(`[API] ❌ 缺少必需参数`);
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`[API] ✅ 参数验证通过`);

    // 生成图片
    console.log(`[API] 🎨 调用 generatePanelImage...`);
    const imageData = await generatePanelImage(panel, style, referenceImageData);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[API] ✅ 图片生成成功`);
    console.log(`[API] 📊 图片大小: ${(imageData.length / 1024).toFixed(1)} KB`);
    console.log(`[API] ⏱️  总耗时: ${duration}ms`);
    console.log(`${'='.repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      imageData
    });
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.error(`\n${'='.repeat(60)}`);
    console.error(`[API] ❌ /api/generate-comic/image 请求失败`);
    console.error(`[API] ⏱️  耗时: ${duration}ms`);
    console.error(`[API] ❌ 错误信息:`, error);
    console.error(`${'='.repeat(60)}\n`);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成图片失败'
      },
      { status: 500 }
    );
  }
}
