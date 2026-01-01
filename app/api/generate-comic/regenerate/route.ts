import { NextRequest, NextResponse } from 'next/server';
import { regeneratePanelImage } from '@/lib/services/geminiServiceProxy';

export async function POST(request: NextRequest) {
  try {
    const { panel, style, referenceImageData } = await request.json();

    if (!panel || !style) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 重新生成图片
    const imageData = await regeneratePanelImage(panel, style, referenceImageData);

    return NextResponse.json({
      success: true,
      imageData
    });
  } catch (error) {
    console.error('Error regenerating image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '重新生成图片失败'
      },
      { status: 500 }
    );
  }
}
