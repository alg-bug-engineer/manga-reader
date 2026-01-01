import { Manga, MangaListItem } from '@/types/manga';

// ============================================
// 客户端安全的数据导出
// ============================================
// 注意：这个文件不能使用 fs 等服务器端模块
// 所有服务器端操作都在 scanner.ts 中完成

// AI科普漫画示例数据（客户端可访问）
export const sampleMangaData: Manga[] = [
  {
    id: '1',
    title: '大语言模型入门',
    author: 'AI科普团队',
    description: '从GPT到ChatGPT，用生动的漫画带你了解大语言模型的工作原理、训练过程和惊人能力。探索Transformer架构的奥秘！',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=600&fit=crop',
    status: 'ongoing',
    categories: ['大模型', 'NLP', '深度学习'],
    tags: ['大模型', 'NLP', '深度学习', '入门', '科普', '理论', '热门'],
    updateTime: '2025-12-29',
    views: 28560,
    likes: 0,
    chapters: [
      {
        id: '1-1',
        mangaId: '1',
        chapterNumber: 1,
        title: '第1话：什么是大语言模型',
        pages: [
          'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=1200&fit=crop',
        ],
        updateTime: '2025-12-20',
      },
      {
        id: '1-2',
        mangaId: '1',
        chapterNumber: 2,
        title: '第2话：Transformer架构揭秘',
        pages: [
          'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=1200&fit=crop',
        ],
        updateTime: '2025-12-25',
      },
    ],
  },
  {
    id: '2',
    title: '计算机视觉之旅',
    author: 'AI科普团队',
    description: '从图像识别到目标检测，从人脸识别到自动驾驶，带你领略计算机视觉的神奇世界。卷积神经网络如何"看"懂世界？',
    coverImage: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=600&fit=crop',
    status: 'ongoing',
    categories: ['CV', '深度学习', '图像处理'],
    tags: ['CV', '深度学习', '图像处理', '入门', '科普', '实战', '计算机视觉'],
    updateTime: '2025-12-28',
    views: 34230,
    likes: 0,
    chapters: [
      {
        id: '2-1',
        mangaId: '2',
        chapterNumber: 1,
        title: '第1话：计算机如何"看见"世界',
        pages: [
          'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=1200&fit=crop',
        ],
        updateTime: '2025-12-15',
      },
      {
        id: '2-2',
        mangaId: '2',
        chapterNumber: 2,
        title: '第2话：卷积神经网络的威力',
        pages: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1200&fit=crop',
        ],
        updateTime: '2025-12-22',
      },
    ],
  },
  {
    id: '3',
    title: '自然语言处理实战',
    author: 'AI科普团队',
    description: '机器如何理解人类的语言？从分词、词向量到BERT，深入浅出讲解NLP技术。聊天机器人、机器翻译背后的秘密。',
    coverImage: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=400&h=600&fit=crop',
    status: 'completed',
    categories: ['NLP', '机器学习', '文本分析'],
    tags: ['NLP', '机器学习', '文本分析', '进阶', '实战', 'BERT', '词向量'],
    updateTime: '2025-12-10',
    views: 19870,
    likes: 0,
    chapters: [
      {
        id: '3-1',
        mangaId: '3',
        chapterNumber: 1,
        title: '第1话：词向量的奥秘',
        pages: [
          'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=1200&fit=crop',
        ],
        updateTime: '2025-11-01',
      },
      {
        id: '3-2',
        mangaId: '3',
        chapterNumber: 2,
        title: '第2话：BERT的革命性突破',
        pages: [
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=800&h=1200&fit=crop',
        ],
        updateTime: '2025-11-10',
      },
    ],
  },
  {
    id: '4',
    title: '强化学习冒险记',
    author: 'AI科普团队',
    description: 'AlphaGo如何击败世界冠军？智能体如何通过试错学习最优策略？跟随主角一起探索强化学习的精彩世界！',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
    status: 'ongoing',
    categories: ['强化学习', '机器学习', '智能决策'],
    tags: ['强化学习', '机器学习', '智能决策', '进阶', '科普', 'AlphaGo', '决策'],
    updateTime: '2025-12-29',
    views: 42150,
    likes: 0,
    chapters: [
      {
        id: '4-1',
        mangaId: '4',
        chapterNumber: 1,
        title: '第1话：智能体的诞生',
        pages: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=1200&fit=crop',
        ],
        updateTime: '2025-12-01',
      },
    ],
  },
  {
    id: '5',
    title: '机器学习基础',
    author: 'AI科普团队',
    description: '什么是监督学习、无监督学习？回归、分类算法如何工作？从零开始学习机器学习的核心概念，轻松入门AI领域！',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop',
    status: 'ongoing',
    categories: ['机器学习', '基础教程', '数据分析'],
    tags: ['机器学习', '基础教程', '数据分析', '入门', '系统', '监督学习', '算法'],
    updateTime: '2025-12-27',
    views: 38920,
    likes: 0,
    chapters: [
      {
        id: '5-1',
        mangaId: '5',
        chapterNumber: 1,
        title: '第1话：机器学习是什么',
        pages: [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1200&fit=crop',
        ],
        updateTime: '2025-12-05',
      },
    ],
  },
  {
    id: '6',
    title: '深度学习探索',
    author: 'AI科普团队',
    description: '神经网络是如何模拟人脑工作的？反向传播算法如何训练网络？深入理解深度学习的核心原理和前沿应用。',
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=600&fit=crop',
    status: 'ongoing',
    categories: ['深度学习', '神经网络', 'AI原理'],
    tags: ['深度学习', '神经网络', 'AI原理', '进阶', '理论', '反向传播', '架构'],
    updateTime: '2025-12-26',
    views: 35680,
    likes: 0,
    chapters: [
      {
        id: '6-1',
        mangaId: '6',
        chapterNumber: 1,
        title: '第1话：神经元与感知机',
        pages: [
          'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=1200&fit=crop',
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=1200&fit=crop',
        ],
        updateTime: '2025-12-03',
      },
    ],
  },
];

// AI技术分类列表
export const aiCategories = [
  '全部',
  'NLP',
  'CV',
  '大模型',
  '机器学习',
  '深度学习',
  '强化学习',
  '神经网络',
  '智能决策',
  '文本分析',
  '图像处理',
  '基础教程',
  'AI原理',
];

// 标签体系（按维度分类）
export const tagSystem = {
  difficulty: ['入门', '进阶', '高级'],
  type: ['理论', '实战', '科普', '教程', '系统'],
  domain: ['NLP', 'CV', '深度学习', '机器学习', '强化学习', '大模型', '神经网络'],
  application: ['图像识别', '自然语言', '智能决策', '数据分析', '计算机视觉'],
  features: ['热门', '经典', '前沿'],
};

// 获取所有唯一标签
export function getAllTags(): string[] {
  const tagsSet = new Set<string>();
  sampleMangaData.forEach((manga) => {
    manga.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}

// 默认使用示例数据（客户端安全）
export function getMangaList(): MangaListItem[] {
  return sampleMangaData.map((manga) => ({
    id: manga.id,
    title: manga.title,
    author: manga.author,
    coverImage: manga.coverImage,
    status: manga.status,
    categories: manga.categories,
    tags: manga.tags,
    latestChapter: manga.chapters[manga.chapters.length - 1]?.title || '暂无章节',
    updateTime: manga.updateTime,
    views: manga.views,
    likes: manga.likes,
  }));
}

// 根据分类筛选漫画
export function getMangaByCategory(category: string): MangaListItem[] {
  if (category === '全部') {
    return getMangaList();
  }
  return getMangaList().filter((manga) =>
    manga.categories.includes(category)
  );
}

// 根据ID获取漫画详情
export function getMangaById(id: string): Manga | undefined {
  return sampleMangaData.find((manga) => manga.id === id);
}

// 获取漫画的所有章节
export function getChaptersByMangaId(mangaId: string) {
  const manga = getMangaById(mangaId);
  return manga?.chapters || [];
}

// 根据章节ID获取章节详情
export function getChapterById(chapterId: string) {
  for (const manga of sampleMangaData) {
    const chapter = manga.chapters.find((ch) => ch.id === chapterId);
    if (chapter) return chapter;
  }
  return undefined;
}

/**
 * 获取数据源信息
 */
export function getDataSourceInfo() {
  return {
    type: 'local',
    description: '本地文件系统',
    scanPath: './data',
    supportedFormats: ['.png', '.jpg', '.jpeg', '.webp'],
    lastScan: new Date().toISOString(),
  };
}
