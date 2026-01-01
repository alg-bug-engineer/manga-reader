import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/tags - 获取所有标签
export async function GET() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const tagsPath = path.join(process.cwd(), 'data', 'tags.json');
    let tags = [];

    try {
      const content = await fs.readFile(tagsPath, 'utf-8');
      const data = JSON.parse(content);
      tags = data.tags || [];
    } catch (error) {
      // 文件不存在，返回默认标签
      tags = [
        '入门',
        '进阶',
        '基础',
        '实战',
        '理论',
        '应用',
        '前沿',
        '经典',
      ];
    }

    return NextResponse.json({
      success: true,
      tags,
    });
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// POST /api/admin/tags - 创建标签
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: '标签名称不能为空' }, { status: 400 });
    }

    const fs = await import('fs/promises');
    const path = await import('path');

    const tagsPath = path.join(process.cwd(), 'data', 'tags.json');
    let tags = [];

    try {
      const content = await fs.readFile(tagsPath, 'utf-8');
      const data = JSON.parse(content);
      tags = data.tags || [];
    } catch (error) {
      // 文件不存在，使用默认标签
      tags = [
        '入门',
        '进阶',
        '基础',
        '实战',
        '理论',
        '应用',
        '前沿',
        '经典',
      ];
    }

    // 检查是否已存在
    if (tags.includes(name.trim())) {
      return NextResponse.json({ success: false, error: '标签已存在' }, { status: 400 });
    }

    // 添加新标签
    tags.push(name.trim());

    // 保存到文件
    await fs.writeFile(tagsPath, JSON.stringify({ tags }, null, 2));

    return NextResponse.json({
      success: true,
      message: '标签创建成功',
      tag: name.trim(),
    });
  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/admin/tags - 删除标签
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ success: false, error: '标签名称不能为空' }, { status: 400 });
    }

    const fs = await import('fs/promises');
    const path = await import('path');

    const tagsPath = path.join(process.cwd(), 'data', 'tags.json');
    let tags = [];

    try {
      const content = await fs.readFile(tagsPath, 'utf-8');
      const data = JSON.parse(content);
      tags = data.tags || [];
    } catch (error) {
      return NextResponse.json({ success: false, error: '标签文件不存在' }, { status: 404 });
    }

    // 删除标签
    tags = tags.filter((t: string) => t !== name);

    // 保存到文件
    await fs.writeFile(tagsPath, JSON.stringify({ tags }, null, 2));

    return NextResponse.json({
      success: true,
      message: '标签删除成功',
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
