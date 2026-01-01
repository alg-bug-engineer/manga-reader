import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VIEWS_FILE = path.join(process.cwd(), 'data', 'views.json');

interface ViewsData {
  [mangaId: string]: number;
}

/**
 * 确保views文件存在
 */
function ensureViewsFile(): ViewsData {
  if (!fs.existsSync(VIEWS_FILE)) {
    fs.writeFileSync(VIEWS_FILE, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    const data = fs.readFileSync(VIEWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * 保存浏览量
 */
function saveViews(data: ViewsData) {
  fs.writeFileSync(VIEWS_FILE, JSON.stringify(data, null, 2));
}

/**
 * 获取漫画浏览量
 * GET /api/manga/[id]/views
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const viewsData = ensureViewsFile();
    const views = viewsData[id] || 0;

    return NextResponse.json({
      success: true,
      views,
    });
  } catch (error) {
    console.error('Get views error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get views' },
      { status: 500 }
    );
  }
}

/**
 * 增加漫画浏览量
 * POST /api/manga/[id]/view
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const viewsData = ensureViewsFile();

    // 浏览量+1
    viewsData[id] = (viewsData[id] || 0) + 1;
    saveViews(viewsData);

    return NextResponse.json({
      success: true,
      views: viewsData[id],
    });
  } catch (error) {
    console.error('Increment views error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to increment views' },
      { status: 500 }
    );
  }
}
