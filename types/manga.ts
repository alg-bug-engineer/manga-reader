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
