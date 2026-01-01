import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const comicData = await request.json();

    const {
      title,
      description,
      author,
      categories,
      tags,
      panels,
      style
    } = comicData;

    if (!title || !author || !panels || panels.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 生成唯一ID
    const id = `comic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 保存漫画数据到 data 文件夹
    const dataDir = join(process.cwd(), 'data');
    const filepath = join(dataDir, `${id}.json`);

    const mangaEntry = {
      id,
      title,
      description: description || '',
      author,
      categories: categories || ['AI知识'],
      tags: tags || [],
      coverImage: panels[0]?.generatedImage || '',
      chapters: [{
        id: 'chapter-1',
        title: '第1话',
        panels: panels.map((panel: any, index: number) => ({
          panelNumber: index + 1,
          image: panel.generatedImage || '',
          dialogue: panel.dialogue || ''
        }))
      }],
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      views: 0,
      likes: 0,
      published: true,
      style
    };

    await writeFile(filepath, JSON.stringify(mangaEntry, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      id,
      message: '漫画发布成功'
    });
  } catch (error) {
    console.error('Error publishing comic:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '发布漫画失败'
      },
      { status: 500 }
    );
  }
}
