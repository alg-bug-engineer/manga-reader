// 漫画数据结构定义

export interface Manga {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  categories: string[];
  tags: string[]; // 标签，支持多维度分类
  updateTime: string;
  views: number;
  likes: number; // 点赞数
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  mangaId: string;
  chapterNumber: number;
  title: string;
  pages: string[]; // 图片URL数组
  updateTime: string;
}

export interface ReaderMode {
  type: 'page' | 'strip'; // page: 翻页模式, strip: 条漫模式
  currentPage: number;
}

export interface MangaListItem {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  categories: string[];
  tags: string[]; // 标签，支持多维度分类
  latestChapter: string;
  updateTime: string;
  views: number;
  likes: number; // 点赞数
}

// 书架相关类型定义
export interface BookshelfItem {
  id: string; // 书架项ID
  userId: string; // 用户ID
  mangaId: string; // 漫画ID
  mangaTitle: string; // 漫画标题（冗余存储，提高查询性能）
  mangaCover: string; // 漫画封面（冗余存储）
  author: string; // 作者（冗余存储）
  status: 'reading' | 'completed' | 'planned' | 'dropped'; // 阅读状态
  addedAt: string; // 添加到书架的时间
  updatedAt: string; // 最后更新时间
  note?: string; // 用户备注（可选）
}

// 阅读进度相关类型定义
export interface ReadingProgress {
  id: string; // 进度记录ID
  userId: string; // 用户ID
  mangaId: string; // 漫画ID
  mangaTitle: string; // 漫画标题（冗余存储）
  currentChapter: number; // 当前章节号
  currentPage: number; // 当前页码
  totalPages: number; // 总页数
  progressPercentage: number; // 阅读进度百分比（0-100）
  lastReadAt: string; // 最后阅读时间
  isCompleted: boolean; // 是否已读完
  readTime: number; // 阅读时长（秒）
}

// 用户书架统计
export interface BookshelfStats {
  total: number; // 书架总数
  reading: number; // 阅读中
  completed: number; // 已完成
  planned: number; // 计划阅读
  dropped: number; // 已放弃
}
