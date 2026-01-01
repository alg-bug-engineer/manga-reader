import fs from 'fs';
import path from 'path';
import { Manga, Chapter } from '@/types/manga';

const DATA_ROOT = path.join(process.cwd(), 'data');
const VIEWS_FILE = path.join(DATA_ROOT, 'views.json');

interface ViewsData {
  [mangaId: string]: number;
}

/**
 * 读取浏览量数据
 */
function getViewsData(): ViewsData {
  try {
    if (fs.existsSync(VIEWS_FILE)) {
      const data = fs.readFileSync(VIEWS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading views file:', error);
  }
  return {};
}

interface ScanResult {
  series: string;
  chapters: {
    title: string;
    cover: string;
    pages: string[];
  }[];
}

/**
 * 检查文件夹是否包含图片文件
 */
function hasImageFiles(dirPath: string): boolean {
  try {
    const files = fs.readdirSync(dirPath);
    return files.some(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    });
  } catch {
    return false;
  }
}

/**
 * 递归扫描data文件夹，自动生成漫画数据
 * 支持两种数据组织方式：
 *
 * 方式1（多章节）：
 * data/
 *   系列名称/
 *     第X话 标题/
 *       封面.png
 *       1.png
 *       2.png
 *       ...
 *
 * 方式2（单章节）：
 * data/
 *   系列名称/
 *     封面.png
 *     1.png
 *     2.png
 *     ...
 */
export function scanDataFolder(): ScanResult[] {
  const results: ScanResult[] = [];

  if (!fs.existsSync(DATA_ROOT)) {
    console.warn('Data folder not found:', DATA_ROOT);
    return results;
  }

  // 读取所有系列文件夹
  const seriesFolders = fs.readdirSync(DATA_ROOT, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => !dirent.name.startsWith('.'))
    .map(dirent => dirent.name);

  for (const seriesName of seriesFolders) {
    const seriesPath = path.join(DATA_ROOT, seriesName);

    // 读取该系列下的所有子文件夹
    const subFolders = fs.readdirSync(seriesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .filter(dirent => !dirent.name.startsWith('.'))
      .map(dirent => dirent.name)
      .sort();

    // 检查是否直接包含图片文件（方式2：单章节模式）
    const hasDirectImages = hasImageFiles(seriesPath);

    if (hasDirectImages && subFolders.length === 0) {
      // 方式2：单章节模式 - 文件夹直接包含图片
      const files = fs.readdirSync(seriesPath)
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
        })
        .sort((a, b) => {
          // 自定义排序：封面.png在最前，然后按数字排序
          const aIsCover = a.includes('封面');
          const bIsCover = b.includes('封面');

          if (aIsCover && !bIsCover) return -1;
          if (!aIsCover && bIsCover) return 1;

          // 数字文件名排序
          const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
          const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
          return aNum - bNum;
        });

      if (files.length > 0) {
        results.push({
          series: seriesName,
          chapters: [
            {
              title: seriesName, // 单章节模式，章节名=系列名
              cover: path.join(seriesName, files[0]),
              pages: files.map(file => path.join(seriesName, file)),
            }
          ]
        });
      }
    } else {
      // 方式1：多章节模式 - 子文件夹包含章节
      const chapters: ScanResult['chapters'] = [];

      for (const chapterFolder of subFolders) {
        const chapterPath = path.join(seriesPath, chapterFolder);

        // 读取章节内的所有图片文件
        const files = fs.readdirSync(chapterPath)
          .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
          })
          .sort((a, b) => {
            // 自定义排序：封面.png在最前，然后按数字排序
            const aIsCover = a.includes('封面');
            const bIsCover = b.includes('封面');

            if (aIsCover && !bIsCover) return -1;
            if (!aIsCover && bIsCover) return 1;

            // 数字文件名排序
            const aNum = parseInt(a.match(/\d+/)?.[0] || '0');
            const bNum = parseInt(b.match(/\d+/)?.[0] || '0');
            return aNum - bNum;
          });

        if (files.length > 0) {
          chapters.push({
            title: chapterFolder,
            cover: path.join(seriesName, chapterFolder, files[0]),
            pages: files.map(file => path.join(seriesName, chapterFolder, file)),
          });
        }
      }

      if (chapters.length > 0) {
        results.push({
          series: seriesName,
          chapters,
        });
      }
    }
  }

  return results;
}

/**
 * 将扫描结果转换为Manga对象
 */
export function convertToManga(
  scanResult: ScanResult,
  index: number
): Omit<Manga, 'chapters'> & { chapters: Chapter[] } {
  const firstChapter = scanResult.chapters[0];
  // 使用正斜杠拼接 URL 路径，确保跨平台兼容性
  const normalizePath = (p: string) => p.replace(/\\/g, '/');
  const coverImage = `/api/images/${normalizePath(firstChapter.cover)}`;

  // 读取真实的浏览量数据
  const viewsData = getViewsData();
  const mangaId = `manga-${index + 1}`;
  const views = viewsData[mangaId] || 0;

  // 读取点赞数据
  const likesData = (() => {
    try {
      const likesFilePath = path.join(process.cwd(), 'data', 'likes.json');
      if (fs.existsSync(likesFilePath)) {
        const data = fs.readFileSync(likesFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        return parsed.counts || {};
      }
    } catch (error) {
      console.error('Error reading likes file:', error);
    }
    return {};
  })();
  const likes = likesData[mangaId] || 0;

  // 生成标签（基于分类和漫画特征）
  const tags = generateTags(scanResult.series);

  // 确定分类（根据系列名称匹配，如果没匹配到则使用"大模型"作为默认分类）
  const category = getCategoryFromSeries(scanResult.series);

  return {
    id: mangaId,
    title: scanResult.series,
    author: '芝士AI吃鱼',
    description: `通过生动有趣的漫画形式，轻松掌握${scanResult.series}相关知识。`,
    coverImage,
    status: 'ongoing' as const,
    categories: [category],
    tags,
    updateTime: new Date().toISOString().split('T')[0],
    views,
    likes,
    chapters: scanResult.chapters.map((chapter, chapterIndex) => ({
      id: `chapter-${index + 1}-${chapterIndex + 1}`,
      mangaId: `manga-${index + 1}`,
      chapterNumber: chapterIndex + 1,
      title: chapter.title,
      pages: chapter.pages.map(page => `/api/images/${normalizePath(page)}`),
      updateTime: new Date().toISOString().split('T')[0],
    })),
  };
}

/**
 * 根据分类生成标签
 */
function generateTags(category: string): string[] {
  const tags: string[] = [category];

  // 根据分类添加相关标签
  const categoryTagMap: { [key: string]: string[] } = {
    'NLP': ['自然语言处理', '文本分析', '科普', '入门'],
    'CV': ['计算机视觉', '图像处理', '科普', '入门'],
    '大模型': ['GPT', 'Transformer', '热门', '科普'],
    '深度学习': ['神经网络', 'AI', '理论', '入门'],
    '机器学习': ['算法', '数据', '教程', '系统'],
    '强化学习': ['智能决策', 'AlphaGo', '科普', '进阶'],
    '神经网络': ['深度学习', '架构', '理论', '进阶'],
    '智能决策': ['强化学习', '应用', '实战'],
    '文本分析': ['NLP', '实战', '进阶'],
    '图像处理': ['CV', '实战', '应用'],
    '基础教程': ['入门', '系统', '教程'],
    'AI原理': ['理论', '系统', '进阶'],
  };

  const additionalTags = categoryTagMap[category] || ['科普', '入门'];
  tags.push(...additionalTags);

  return tags;
}

/**
 * 根据系列名称确定分类
 */
function getCategoryFromSeries(seriesName: string): string {
  // 定义系列名称到分类的映射
  const seriesCategoryMap: { [key: string]: string } = {
    'NLP': 'NLP',
    'CV': 'CV',
    '大模型': '大模型',
    '深度学习': '深度学习',
    '机器学习': '机器学习',
    '强化学习': '强化学习',
    '神经网络': '神经网络',
    '智能决策': '强化学习',
    '文本分析': 'NLP',
    '图像处理': 'CV',
    '基础教程': '深度学习',
    'AI原理': '机器学习',
  };

  // 尝试精确匹配
  if (seriesCategoryMap[seriesName]) {
    return seriesCategoryMap[seriesName];
  }

  // 尝试模糊匹配（包含关键词）
  for (const [keyword, category] of Object.entries(seriesCategoryMap)) {
    if (seriesName.includes(keyword)) {
      return category;
    }
  }

  // 默认分类
  return '大模型';
}

/**
 * 获取所有漫画数据（自动扫描）
 */
export function getAllMangaData(): Manga[] {
  const scanResults = scanDataFolder();
  return scanResults.map((result, index) => convertToManga(result, index));
}

// 导出扫描结果供data.ts使用
export { scanDataFolder as scanMangaData };
