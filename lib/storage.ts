import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');
const BOOKSHELF_FILE = path.join(DATA_DIR, 'bookshelf.json');
const READING_PROGRESS_FILE = path.join(DATA_DIR, 'reading-progress.json');
const USER_MANGA_FILE = path.join(DATA_DIR, 'user-manga.json');
const REVIEW_RECORDS_FILE = path.join(DATA_DIR, 'review-records.json');

// 确保数据目录存在
export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export interface User {
  id: string;
  email: string;
  username: string;
  password: string; // 实际应该存储哈希值
  createdAt: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  expiresAt: number;
}

interface Favorite {
  userId: string;
  mangaId: string;
  createdAt: string;
}

interface FavoritesData {
  [userId: string]: string[]; // userId -> mangaId[]
}

/**
 * 读取用户数据
 */
export function readUsers(): User[] {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading users file:', error);
  }
  return [];
}

/**
 * 保存用户数据
 */
export function saveUsers(users: User[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users file:', error);
    throw error;
  }
}

/**
 * 添加新用户
 */
export function addUser(user: User): boolean {
  try {
    const users = readUsers();
    // 检查邮箱是否已存在
    if (users.find(u => u.email === user.email)) {
      return false;
    }
    users.push(user);
    saveUsers(users);
    return true;
  } catch (error) {
    console.error('Error adding user:', error);
    return false;
  }
}

/**
 * 根据邮箱查找用户
 */
export function findUserByEmail(email: string): User | undefined {
  const users = readUsers();
  return users.find(u => u.email === email);
}

/**
 * 根据ID查找用户
 */
export function findUserById(id: string): User | undefined {
  const users = readUsers();
  return users.find(u => u.id === id);
}

/**
 * 获取用户总数
 */
export function getUserCount(): number {
  return readUsers().length;
}

// ==================== 收藏功能 ====================

/**
 * 读取收藏数据
 */
function readFavoritesData(): FavoritesData {
  try {
    ensureDataDir();
    if (fs.existsSync(FAVORITES_FILE)) {
      const data = fs.readFileSync(FAVORITES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading favorites file:', error);
  }
  return {};
}

/**
 * 保存收藏数据
 */
function saveFavoritesData(data: FavoritesData) {
  try {
    ensureDataDir();
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving favorites file:', error);
    throw error;
  }
}

/**
 * 获取用户的收藏列表
 */
export function getUserFavorites(userId: string): string[] {
  const data = readFavoritesData();
  return data[userId] || [];
}

/**
 * 检查用户是否收藏了某漫画
 */
export function isFavorited(userId: string, mangaId: string): boolean {
  const favorites = getUserFavorites(userId);
  return favorites.includes(mangaId);
}

/**
 * 添加收藏
 */
export function addFavorite(userId: string, mangaId: string): boolean {
  try {
    const data = readFavoritesData();
    if (!data[userId]) {
      data[userId] = [];
    }
    if (!data[userId].includes(mangaId)) {
      data[userId].push(mangaId);
      saveFavoritesData(data);
    }
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
}

/**
 * 取消收藏
 */
export function removeFavorite(userId: string, mangaId: string): boolean {
  try {
    const data = readFavoritesData();
    if (data[userId]) {
      data[userId] = data[userId].filter(id => id !== mangaId);
      saveFavoritesData(data);
    }
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
}

/**
 * 切换收藏状态
 */
export function toggleFavorite(userId: string, mangaId: string): { isFavorited: boolean } {
  if (isFavorited(userId, mangaId)) {
    removeFavorite(userId, mangaId);
    return { isFavorited: false };
  } else {
    addFavorite(userId, mangaId);
    return { isFavorited: true };
  }
}

// ==================== Session 管理 ====================

interface SessionsData {
  [sessionId: string]: Session;
}

/**
 * 读取 session 数据
 */
function readSessionsData(): SessionsData {
  try {
    ensureDataDir();
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const parsed: SessionsData = JSON.parse(data);

      // 清理过期的 sessions
      const now = Date.now();
      const cleaned: SessionsData = {};
      for (const [id, session] of Object.entries(parsed)) {
        if (session.expiresAt > now) {
          cleaned[id] = session;
        }
      }

      // 如果有清理，保存回去
      if (Object.keys(cleaned).length !== Object.keys(parsed).length) {
        saveSessionsData(cleaned);
      }

      return cleaned;
    }
  } catch (error) {
    console.error('Error reading sessions file:', error);
  }
  return {};
}

/**
 * 保存 session 数据
 */
function saveSessionsData(data: SessionsData) {
  try {
    ensureDataDir();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving sessions file:', error);
    throw error;
  }
}

/**
 * 创建 session
 */
export function createSession(userId: string, sessionId: string): void {
  const data = readSessionsData();

  // session 7天后过期
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  data[sessionId] = {
    sessionId,
    userId,
    expiresAt,
  };

  saveSessionsData(data);
}

/**
 * 获取 session 对应的用户ID
 */
export function getSessionUserId(sessionId: string): string | null {
  const data = readSessionsData();
  const session = data[sessionId];

  if (!session) {
    return null;
  }

  // 检查是否过期
  if (session.expiresAt < Date.now()) {
    // 删除过期的 session
    delete data[sessionId];
    saveSessionsData(data);
    return null;
  }

  return session.userId;
}

/**
 * 删除 session
 */
export function deleteSession(sessionId: string): void {
  const data = readSessionsData();
  delete data[sessionId];
  saveSessionsData(data);
}

// ==================== 点赞功能 ====================

interface LikesData {
  userLikes: {
    [userId: string]: string[]; // userId -> mangaId[]
  };
  counts: {
    [mangaId: string]: number; // mangaId -> like count
  };
}

/**
 * 读取点赞数据
 */
function readLikesData(): LikesData {
  try {
    ensureDataDir();
    if (fs.existsSync(LIKES_FILE)) {
      const data = fs.readFileSync(LIKES_FILE, 'utf-8');
      const parsed = JSON.parse(data);

      // 确保数据结构完整
      if (!parsed.userLikes) parsed.userLikes = {};
      if (!parsed.counts) parsed.counts = {};

      return parsed;
    }
  } catch (error) {
    console.error('Error reading likes file:', error);
  }

  return {
    userLikes: {},
    counts: {},
  };
}

/**
 * 保存点赞数据
 */
function saveLikesData(data: LikesData) {
  try {
    ensureDataDir();
    fs.writeFileSync(LIKES_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving likes file:', error);
    throw error;
  }
}

/**
 * 检查用户是否点赞了某漫画
 */
export function hasUserLiked(userId: string, mangaId: string): boolean {
  const data = readLikesData();
  return data.userLikes[userId]?.includes(mangaId) || false;
}

/**
 * 获取漫画的点赞数
 */
export function getMangaLikes(mangaId: string): number {
  const data = readLikesData();
  return data.counts[mangaId] || 0;
}

/**
 * 获取用户点赞的所有漫画ID
 */
export function getUserLikedMangas(userId: string): string[] {
  const data = readLikesData();
  return data.userLikes[userId] || [];
}

/**
 * 切换点赞状态
 */
export function toggleMangaLike(userId: string, mangaId: string): { liked: boolean; count: number } {
  const data = readLikesData();

  // 初始化用户点赞列表
  if (!data.userLikes[userId]) {
    data.userLikes[userId] = [];
  }

  const userLikes = data.userLikes[userId];
  const currentlyLiked = userLikes.includes(mangaId);

  if (currentlyLiked) {
    // 取消点赞
    data.userLikes[userId] = userLikes.filter(id => id !== mangaId);
    data.counts[mangaId] = Math.max(0, (data.counts[mangaId] || 0) - 1);
  } else {
    // 添加点赞
    data.userLikes[userId].push(mangaId);
    data.counts[mangaId] = (data.counts[mangaId] || 0) + 1;
  }

  saveLikesData(data);

  return {
    liked: !currentlyLiked,
    count: data.counts[mangaId] || 0,
  };
}

/**
 * 获取所有漫画的点赞数据（用于人气推荐）
 */
export function getAllMangaLikes(): { [mangaId: string]: number } {
  const data = readLikesData();
  return data.counts;
}

// ==================== 书架功能 ====================

export interface BookshelfItem {
  id: string;
  userId: string;
  mangaId: string;
  mangaTitle: string;
  mangaCover: string;
  author: string;
  status: 'reading' | 'completed' | 'planned' | 'dropped';
  addedAt: string;
  updatedAt: string;
  note?: string;
}

/**
 * 读取书架数据
 */
function readBookshelfData(): BookshelfItem[] {
  try {
    if (fs.existsSync(BOOKSHELF_FILE)) {
      const data = fs.readFileSync(BOOKSHELF_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading bookshelf file:', error);
  }
  return [];
}

/**
 * 保存书架数据
 */
function saveBookshelfData(data: BookshelfItem[]) {
  try {
    fs.writeFileSync(BOOKSHELF_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving bookshelf file:', error);
    throw error;
  }
}

/**
 * 获取用户书架
 */
export function getUserBookshelf(userId: string): BookshelfItem[] {
  const data = readBookshelfData();
  return data.filter(item => item.userId === userId);
}

/**
 * 检查漫画是否在用户书架中
 */
export function isInBookshelf(userId: string, mangaId: string): boolean {
  const bookshelf = getUserBookshelf(userId);
  return bookshelf.some(item => item.mangaId === mangaId);
}

/**
 * 添加到书架
 */
export function addToBookshelf(item: Omit<BookshelfItem, 'id' | 'addedAt' | 'updatedAt'>): BookshelfItem {
  const data = readBookshelfData();

  // 检查是否已存在
  const existingIndex = data.findIndex(
    i => i.userId === item.userId && i.mangaId === item.mangaId
  );

  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    // 已存在，更新状态
    data[existingIndex].status = item.status;
    data[existingIndex].note = item.note;
    data[existingIndex].updatedAt = now;
    saveBookshelfData(data);
    return data[existingIndex];
  }

  // 创建新书架项
  const newItem: BookshelfItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    addedAt: now,
    updatedAt: now,
  };

  data.push(newItem);
  saveBookshelfData(data);
  return newItem;
}

/**
 * 从书架移除
 */
export function removeFromBookshelf(userId: string, mangaId: string): boolean {
  const data = readBookshelfData();
  const initialLength = data.length;

  const filtered = data.filter(item => !(item.userId === userId && item.mangaId === mangaId));

  if (filtered.length === initialLength) {
    return false; // 未找到要删除的项
  }

  saveBookshelfData(filtered);
  return true;
}

/**
 * 更新书架项状态
 */
export function updateBookshelfStatus(
  userId: string,
  mangaId: string,
  status: BookshelfItem['status'],
  note?: string
): BookshelfItem | null {
  const data = readBookshelfData();
  const item = data.find(i => i.userId === userId && i.mangaId === mangaId);

  if (!item) {
    return null;
  }

  item.status = status;
  item.updatedAt = new Date().toISOString();
  if (note !== undefined) {
    item.note = note;
  }

  saveBookshelfData(data);
  return item;
}

/**
 * 获取书架统计
 */
export function getBookshelfStats(userId: string): {
  total: number;
  reading: number;
  completed: number;
  planned: number;
  dropped: number;
} {
  const bookshelf = getUserBookshelf(userId);

  return {
    total: bookshelf.length,
    reading: bookshelf.filter(item => item.status === 'reading').length,
    completed: bookshelf.filter(item => item.status === 'completed').length,
    planned: bookshelf.filter(item => item.status === 'planned').length,
    dropped: bookshelf.filter(item => item.status === 'dropped').length,
  };
}

// ==================== 阅读进度功能 ====================

export interface ReadingProgress {
  id: string;
  userId: string;
  mangaId: string;
  mangaTitle: string;
  currentChapter: number;
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  lastReadAt: string;
  isCompleted: boolean;
  readTime: number;
}

/**
 * 读取阅读进度数据
 */
function readReadingProgressData(): ReadingProgress[] {
  try {
    if (fs.existsSync(READING_PROGRESS_FILE)) {
      const data = fs.readFileSync(READING_PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading reading progress file:', error);
  }
  return [];
}

/**
 * 保存阅读进度数据
 */
function saveReadingProgressData(data: ReadingProgress[]) {
  try {
    fs.writeFileSync(READING_PROGRESS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving reading progress file:', error);
    throw error;
  }
}

/**
 * 获取用户的阅读进度列表
 */
export function getUserReadingProgress(userId: string): ReadingProgress[] {
  const data = readReadingProgressData();
  return data.filter(item => item.userId === userId);
}

/**
 * 获取用户对某漫画的阅读进度
 */
export function getMangaReadingProgress(userId: string, mangaId: string): ReadingProgress | null {
  const data = readReadingProgressData();
  return data.find(item => item.userId === userId && item.mangaId === mangaId) || null;
}

/**
 * 更新或创建阅读进度
 */
export function updateReadingProgress(progress: Omit<ReadingProgress, 'id' | 'lastReadAt'>): ReadingProgress {
  const data = readReadingProgressData();

  // 查找是否已存在进度记录
  const existingIndex = data.findIndex(
    item => item.userId === progress.userId && item.mangaId === progress.mangaId
  );

  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    // 更新现有记录
    data[existingIndex] = {
      ...progress,
      id: data[existingIndex].id,
      lastReadAt: now,
    };
    saveReadingProgressData(data);
    return data[existingIndex];
  }

  // 创建新进度记录
  const newProgress: ReadingProgress = {
    ...progress,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    lastReadAt: now,
  };

  data.push(newProgress);
  saveReadingProgressData(data);
  return newProgress;
}

/**
 * 删除阅读进度
 */
export function deleteReadingProgress(userId: string, mangaId: string): boolean {
  const data = readReadingProgressData();
  const initialLength = data.length;

  const filtered = data.filter(item => !(item.userId === userId && item.mangaId === mangaId));

  if (filtered.length === initialLength) {
    return false;
  }

  saveReadingProgressData(filtered);
  return true;
}

/**
 * 获取用户最近阅读的漫画
 */
export function getRecentReads(userId: string, limit: number = 10): ReadingProgress[] {
  const progressList = getUserReadingProgress(userId);
  return progressList
    .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())
    .slice(0, limit);
}

// ==================== 用户上传漫画功能 ====================

export interface UserChapter {
  id: string;
  title: string;
  pages: string[];
  createdAt: string;
}

export interface UserManga {
  id: string;
  uploaderId: string;
  title: string;
  description: string;
  coverImage: string;
  categories: string[];
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  chapters: UserChapter[];
}

export interface ReviewRecord {
  id: string;
  mangaId: string;
  reviewerId: string;
  action: 'approve' | 'reject';
  reason?: string;
  reviewedAt: string;
}

/**
 * 读取用户上传漫画数据
 */
function readUserMangaData(): UserManga[] {
  try {
    if (fs.existsSync(USER_MANGA_FILE)) {
      const data = fs.readFileSync(USER_MANGA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading user manga file:', error);
  }
  return [];
}

/**
 * 保存用户上传漫画数据
 */
function saveUserMangaData(data: UserManga[]) {
  try {
    fs.writeFileSync(USER_MANGA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving user manga file:', error);
    throw error;
  }
}

/**
 * 获取所有用户上传漫画
 */
export function getAllUserManga(): UserManga[] {
  return readUserMangaData();
}

/**
 * 根据ID获取用户上传漫画
 */
export function getUserMangaById(id: string): UserManga | undefined {
  const data = readUserMangaData();
  return data.find(manga => manga.id === id);
}

/**
 * 获取用户上传的所有漫画
 */
export function getUserMangaByUploader(uploaderId: string): UserManga[] {
  const data = readUserMangaData();
  return data.filter(manga => manga.uploaderId === uploaderId);
}

/**
 * 根据状态获取用户上传漫画
 */
export function getUserMangaByStatus(status: UserManga['status']): UserManga[] {
  const data = readUserMangaData();
  return data.filter(manga => manga.status === status);
}

/**
 * 创建用户上传漫画
 */
export function createUserManga(manga: Omit<UserManga, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>): UserManga {
  const data = readUserMangaData();

  const newManga: UserManga = {
    ...manga,
    id: `user-manga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    views: 0,
    likes: 0,
  };

  data.push(newManga);
  saveUserMangaData(data);
  return newManga;
}

/**
 * 更新用户上传漫画
 */
export function updateUserManga(id: string, updates: Partial<Omit<UserManga, 'id' | 'uploaderId' | 'createdAt'>>): UserManga | null {
  const data = readUserMangaData();
  const index = data.findIndex(manga => manga.id === id);

  if (index === -1) {
    return null;
  }

  data[index] = {
    ...data[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveUserMangaData(data);
  return data[index];
}

/**
 * 删除用户上传漫画
 */
export function deleteUserManga(id: string): boolean {
  const data = readUserMangaData();
  const initialLength = data.length;
  const filtered = data.filter(manga => manga.id !== id);

  if (filtered.length === initialLength) {
    return false;
  }

  saveUserMangaData(filtered);
  return true;
}

/**
 * 获取待审核漫画数量
 */
export function getPendingMangaCount(): number {
  const data = readUserMangaData();
  return data.filter(manga => manga.status === 'pending').length;
}

// ==================== 审核记录功能 ====================

/**
 * 读取审核记录数据
 */
function readReviewRecordsData(): ReviewRecord[] {
  try {
    if (fs.existsSync(REVIEW_RECORDS_FILE)) {
      const data = fs.readFileSync(REVIEW_RECORDS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading review records file:', error);
  }
  return [];
}

/**
 * 保存审核记录数据
 */
function saveReviewRecordsData(data: ReviewRecord[]) {
  try {
    fs.writeFileSync(REVIEW_RECORDS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving review records file:', error);
    throw error;
  }
}

/**
 * 创建审核记录
 */
export function createReviewRecord(record: Omit<ReviewRecord, 'id' | 'reviewedAt'>): ReviewRecord {
  const data = readReviewRecordsData();

  const newRecord: ReviewRecord = {
    ...record,
    id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    reviewedAt: new Date().toISOString(),
  };

  data.push(newRecord);
  saveReviewRecordsData(data);
  return newRecord;
}

/**
 * 获取漫画的审核记录
 */
export function getReviewRecordsByManga(mangaId: string): ReviewRecord[] {
  const data = readReviewRecordsData();
  return data.filter(record => record.mangaId === mangaId);
}

/**
 * 获取所有审核记录
 */
export function getAllReviewRecords(): ReviewRecord[] {
  return readReviewRecordsData();
}

