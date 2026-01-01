import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/categories - 获取所有分类
export async function GET() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    let categories = [];

    try {
      const content = await fs.readFile(categoriesPath, 'utf-8');
      const data = JSON.parse(content);
      categories = data.categories || [];
    } catch (error) {
      // 文件不存在，返回默认分类
      categories = [
        '机器学习',
        '深度学习',
        '自然语言处理',
        '计算机视觉',
        '强化学习',
        '大语言模型',
        'AI伦理',
        '生成式AI',
      ];
    }

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// POST /api/admin/categories - 创建分类
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: '分类名称不能为空' }, { status: 400 });
    }

    const fs = await import('fs/promises');
    const path = await import('path');

    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    let categories = [];

    try {
      const content = await fs.readFile(categoriesPath, 'utf-8');
      const data = JSON.parse(content);
      categories = data.categories || [];
    } catch (error) {
      // 文件不存在，使用默认分类
      categories = [
        '机器学习',
        '深度学习',
        '自然语言处理',
        '计算机视觉',
        '强化学习',
        '大语言模型',
        'AI伦理',
        '生成式AI',
      ];
    }

    // 检查是否已存在
    if (categories.includes(name.trim())) {
      return NextResponse.json({ success: false, error: '分类已存在' }, { status: 400 });
    }

    // 添加新分类
    categories.push(name.trim());

    // 保存到文件
    await fs.writeFile(categoriesPath, JSON.stringify({ categories }, null, 2));

    return NextResponse.json({
      success: true,
      message: '分类创建成功',
      category: name.trim(),
    });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/admin/categories - 删除分类
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ success: false, error: '分类名称不能为空' }, { status: 400 });
    }

    const fs = await import('fs/promises');
    const path = await import('path');

    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    let categories = [];

    try {
      const content = await fs.readFile(categoriesPath, 'utf-8');
      const data = JSON.parse(content);
      categories = data.categories || [];
    } catch (error) {
      return NextResponse.json({ success: false, error: '分类文件不存在' }, { status: 404 });
    }

    // 删除分类
    categories = categories.filter((c: string) => c !== name);

    // 保存到文件
    await fs.writeFile(categoriesPath, JSON.stringify({ categories }, null, 2));

    return NextResponse.json({
      success: true,
      message: '分类删除成功',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
