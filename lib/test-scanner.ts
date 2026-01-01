/**
 * 测试脚本：验证data文件夹扫描功能
 * 运行方式：npx tsx lib/test-scanner.ts
 */

import { scanDataFolder, getAllMangaData, convertToManga } from './scanner';

console.log('========================================');
console.log('📚 本地漫画数据扫描测试');
console.log('========================================\n');

// 1. 测试扫描功能
console.log('1️⃣ 扫描 data 文件夹...\n');
const scanResults = scanDataFolder();

console.log(`✅ 扫描完成！找到 ${scanResults.length} 个系列\n`);

// 2. 显示扫描结果
scanResults.forEach((result, index) => {
  console.log(`📖 系列 ${index + 1}: ${result.series}`);
  console.log(`   章节: ${result.chapters.length} 个`);

  result.chapters.forEach((chapter, chapterIndex) => {
    console.log(`\n   📄 第${chapterIndex + 1}章: ${chapter.title}`);
    console.log(`      封面: ${chapter.cover}`);
    console.log(`      页数: ${chapter.pages.length} 页`);
    console.log(`      文件:`);
    chapter.pages.slice(0, 3).forEach((page, pageIndex) => {
      console.log(`         ${pageIndex + 1}. ${page}`);
    });
    if (chapter.pages.length > 3) {
      console.log(`         ... 还有 ${chapter.pages.length - 3} 个文件`);
    }
  });
  console.log('');
});

// 3. 测试转换为Manga对象
console.log('\n2️⃣ 转换为 Manga 对象...\n');
const mangaData = getAllMangaData();

mangaData.forEach((manga, index) => {
  console.log(`\n📚 漫画 ${index + 1}:`);
  console.log(`   ID: ${manga.id}`);
  console.log(`   标题: ${manga.title}`);
  console.log(`   作者: ${manga.author}`);
  console.log(`   状态: ${manga.status}`);
  console.log(`   分类: ${manga.categories.join(', ')}`);
  console.log(`   封面: ${manga.coverImage}`);
  console.log(`   章节数: ${manga.chapters.length}`);

  manga.chapters.forEach((chapter) => {
    console.log(`\n   📖 章节: ${chapter.title}`);
    console.log(`      ID: ${chapter.id}`);
    console.log(`      页数: ${chapter.pages.length}`);
    console.log(`      第一页: ${chapter.pages[0]}`);
  });
});

// 4. 显示API路径示例
console.log('\n\n3️⃣ 图片访问路径示例：\n');
if (mangaData.length > 0 && mangaData[0].chapters.length > 0) {
  const firstManga = mangaData[0];
  const firstChapter = firstManga.chapters[0];

  console.log(`✨ 系列：${firstManga.title}`);
  console.log(`✨ 章节：${firstChapter.title}\n`);
  console.log('🖼️  图片访问URL（在浏览器中访问）：');

  if (firstChapter.pages.length > 0) {
    firstChapter.pages.slice(0, 3).forEach((page, index) => {
      console.log(`   第${index + 1}页: http://localhost:3000${page}`);
    });
  }
}

console.log('\n\n========================================');
console.log('✅ 测试完成！');
console.log('========================================\n');

console.log('📝 下一步：');
console.log('   1. 启动开发服务器: npm run dev');
console.log('   2. 访问: http://localhost:3000');
console.log('   3. 查看您的本地漫画数据是否正常显示\n');
