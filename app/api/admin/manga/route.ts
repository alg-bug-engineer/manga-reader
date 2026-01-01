import { NextRequest, NextResponse } from 'next/server';
import { getAllMangaData } from '@/lib/scanner';

// GET /api/admin/manga - 获取所有漫画（用于管理后台，包括下架的）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // all, active, inactive

    // 直接从扫描器获取所有漫画（不过滤）
    let mangaList = getAllMangaData();

    // 读取下架列表
    const fs = await import('fs/promises');
    const path = await import('path');

    try {
      const inactiveDataPath = path.join(process.cwd(), 'data', 'inactive-manga.json');
      const inactiveData = JSON.parse(await fs.readFile(inactiveDataPath, 'utf-8'));
      const inactiveMangaIds = inactiveData.inactiveManga || [];

      // 标记下架状态
      mangaList = mangaList.map((manga: any) => ({
        ...manga,
        isActive: !inactiveMangaIds.includes(manga.id),
        chapterCount: manga.chapters?.length || 0,
      }));

      // 根据状态筛选
      if (status === 'active') {
        mangaList = mangaList.filter((m: any) => m.isActive);
      } else if (status === 'inactive') {
        mangaList = mangaList.filter((m: any) => !m.isActive);
      }
    } catch (error) {
      // 如果文件不存在，默认都是上架状态
      mangaList = mangaList.map((manga: any) => ({
        ...manga,
        isActive: true,
        chapterCount: manga.chapters?.length || 0,
      }));
    }

    return NextResponse.json({
      success: true,
      manga: mangaList,
      total: mangaList.length,
    });
  } catch (error) {
    console.error('Get manga list error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
