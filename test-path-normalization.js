// 测试路径规范化
const testPaths = [
  '/api/images/强化学习求生记/ 封面.jpg',
  '/api/images/什么是内存/封面.jpg',
  '强化学习求生记/ 封面.jpg',
  ' 什么是内存/封面.jpg',
];

function normalizePath(path) {
  // 移除 /api/images/ 前缀
  let clean = path.replace(/^\/api\/images\//, '');

  // 规范化: trim + split + trim + join
  clean = clean.trim().split('/').map(segment => segment.trim()).join('/');

  return clean;
}

console.log('路径规范化测试:\n');
testPaths.forEach(path => {
  console.log(`原始: [${path}]`);
  console.log(`结果: [${normalizePath(path)}]`);
  console.log('');
});
