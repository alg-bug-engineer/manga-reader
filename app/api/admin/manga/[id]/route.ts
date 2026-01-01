import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/manga/[id] - 更新漫画信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 这里只是模拟更新，实际应该修改 JSON 文件或数据库
    // 因为漫画数据是从文件系统扫描的，所以我们创建一个元数据文件来存储额外的信息

    const fs = await import('fs/promises');
    const path = await import('path');

    const metadataPath = path.join(process.cwd(), 'data', 'manga-metadata.json');
    let metadata: Record<string, any> = {};

    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(metadataContent);
    } catch (error) {
      // 文件不存在，创建新的
      metadata = {};
    }

    // 更新元数据
    metadata[id] = {
      ...(metadata[id] || {}),
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      success: true,
      message: '漫画信息已更新',
      manga: metadata[id],
    });
  } catch (error) {
    console.error('Update manga error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/admin/manga/[id] - 下架漫画（软删除）
export async function DELETE(
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

    // 添加到下架列表
    if (!inactiveData.inactiveManga.includes(id)) {
      inactiveData.inactiveManga.push(id);
    }

    await fs.writeFile(inactiveDataPath, JSON.stringify(inactiveData, null, 2));

    return NextResponse.json({
      success: true,
      message: '漫画已下架',
    });
  } catch (error) {
    console.error('Delete manga error:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
