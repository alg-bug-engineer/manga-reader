import { NextResponse } from 'next/server';
import { getAllMangaData, scanDataFolder } from '@/lib/scanner';

/**
 * API 路由：获取本地扫描的漫画数据（仅包含已上架的漫画）
 * GET /api/manga/local
 */
export async function GET() {
  try {
    // 扫描本地 data 文件夹
    let mangaData = getAllMangaData();
    const scanResults = scanDataFolder();

    // 读取下架列表并过滤
    const fs = await import('fs/promises');
    const path = await import('path');

    try {
      const inactiveDataPath = path.join(process.cwd(), 'data', 'inactive-manga.json');
      const inactiveData = JSON.parse(await fs.readFile(inactiveDataPath, 'utf-8'));
      const inactiveMangaIds = inactiveData.inactiveManga || [];

      // 过滤掉下架的漫画
      mangaData = mangaData.filter((manga: any) => !inactiveMangaIds.includes(manga.id));
    } catch (error) {
      // 如果文件不存在，返回所有漫画（默认都是上架状态）
      console.log('No inactive manga file found, returning all manga');
    }

    // 返回数据和元信息
    return NextResponse.json({
      success: true,
      data: mangaData,
      meta: {
        count: mangaData.length,
        series: scanResults.map(r => ({
          name: r.series,
          chapters: r.chapters.length,
        })),
        updateTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error scanning data folder:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load local manga data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
