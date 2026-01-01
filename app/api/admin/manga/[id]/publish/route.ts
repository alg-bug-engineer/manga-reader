import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/manga/[id]/publish - 上架漫画
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const fs = await import('fs/promises');
    const path = await import('path');

    const inactiveDataPath = path.join(process.cwd(), 'data', 'inactive-manga.json');
    let inactiveData = { inactiveManga: [] as string[] };

    try {
      const content = await fs.readFile(inactiveDataPath, 'utf-8');
      inactiveData = JSON.parse(content);
    } catch (error) {
      // 文件不存在，创建新的
    }

    // 从下架列表中移除
    inactiveData.inactiveManga = inactiveData.inactiveManga.filter((mangaId) => mangaId !== id);

    await fs.writeFile(inactiveDataPath, JSON.stringify(inactiveData, null, 2));

    return NextResponse.json({
      success: true,
      message: '漫画已上架',
    });
  } catch (error) {
    console.error('Publish manga error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
