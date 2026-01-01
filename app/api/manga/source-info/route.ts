import { NextResponse } from 'next/server';
import { getDataSourceInfo } from '@/lib/data';

/**
 * API 路由：获取数据源信息
 * GET /api/manga/source-info
 */
export async function GET() {
  try {
    const info = getDataSourceInfo();

    return NextResponse.json({
      success: true,
      info,
    });
  } catch (error) {
    console.error('Error getting data source info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get data source info',
      },
      { status: 500 }
    );
  }
}
