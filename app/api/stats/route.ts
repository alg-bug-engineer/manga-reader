import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAllMangaData } from '@/lib/scanner';
import { getUserCount } from '@/lib/storage';

const DATA_ROOT = path.join(process.cwd(), 'data');
const VIEWS_FILE = path.join(DATA_ROOT, 'views.json');

interface ViewsData {
  [mangaId: string]: number;
}

/**
 * 获取网站统计数据
 * GET /api/stats
 */
export async function GET() {
  try {
    // 获取注册用户数
    const userCount = getUserCount();

    // 获取总浏览量
    let totalViews = 0;
    try {
      if (fs.existsSync(VIEWS_FILE)) {
        const data = fs.readFileSync(VIEWS_FILE, 'utf-8');
        const viewsData: ViewsData = JSON.parse(data);
        totalViews = Object.values(viewsData).reduce((sum: number, val: number) => sum + (val || 0), 0);
      }
    } catch (error) {
      console.error('Error reading views file:', error);
    }

    // 获取漫画数量
    const mangaData = getAllMangaData();
    const mangaCount = mangaData.length;

    return NextResponse.json({
      success: true,
      stats: {
        userCount,
        totalViews,
        mangaCount,
        updateTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      {
        success: true,
        stats: {
          userCount: 0,
          totalViews: 0,
          mangaCount: 0,
        },
      },
      { status: 200 } // 即使失败也返回默认值
    );
  }
}
