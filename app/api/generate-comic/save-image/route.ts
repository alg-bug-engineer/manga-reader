import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageData, filename } = await request.json();

    if (!imageData || !filename) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 将 base64 数据转换为 Buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 确定保存路径
    const publicDir = require('path').join(process.cwd(), 'public', 'generated-comics');
    const fs = require('fs');

    // 确保目录存在
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 保存文件
    const filepath = require('path').join(publicDir, filename);
    fs.writeFileSync(filepath, buffer);

    // 返回公开访问 URL
    const publicUrl = `/generated-comics/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl
    });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save image'
      },
      { status: 500 }
    );
  }
}
