# 本地漫画数据加载说明

## 📁 文件夹结构

在项目根目录下的 `data` 文件夹中按照以下结构组织您的漫画：

```
data/
├── 系列名称1/
│   ├── 第一话 标题/
│   │   ├── 封面.png
│   │   ├── 1.png
│   │   ├── 2.png
│   │   └── ...
│   └── 第二话 标题/
│       ├── 封面.png
│       ├── 1.png
│       └── ...
└── 系列名称2/
    └── ...
```

### 示例结构（基于您的实际数据）

```
data/
└── 大模型入门/
    ├── 第一话 强化学习求生记/
    │   ├── 封面.png
    │   ├── 1.png
    │   ├── 2.png
    │   ├── 3.png
    │   └── 4.png
    └── 第二话 RAG外挂拯救智商记/
        ├── 封面.png
        ├── 1.png
        ├── 2.png
        ├── 3.png
        ├── 4.png
        ├── 5.png
        ├── 6.png
        └── 7.png
```

## 🚀 功能说明

### 1. 自动扫描数据

系统会自动扫描 `data` 文件夹，读取所有漫画系列和章节。

- **扫描位置**：`lib/scanner.ts`
- **主要函数**：
  - `scanDataFolder()`: 扫描data文件夹并返回结构化数据
  - `getAllMangaData()`: 获取完整的漫画数据（包含API路径）
  - `convertToManga()`: 将扫描结果转换为Manga对象

### 2. 本地图片访问

通过 Next.js API 路由实现本地图片的访问：

- **API路径**：`app/api/images/[...path]/route.ts`
- **访问格式**：`http://localhost:3000/api/images/系列名称/章节名/图片文件名.png`

**示例**：
```
封面图片访问路径：
/api/images/大模型入门/第一话 强化学习求生记/封面.png

第一页访问路径：
/api/images/大模型入门/第一话 强化学习求生记/1.png
```

### 3. 数据源切换

在 `lib/data.ts` 中配置数据源：

```typescript
// 设置为 true 使用自动扫描的本地 data 文件夹
// 设置为 false 使用内置示例数据
const USE_LOCAL_DATA = true;
```

## 📝 使用步骤

### 方式一：使用本地数据（推荐）

1. **准备数据**：将您的漫画按照上述文件夹结构放入 `data/` 目录
2. **确认配置**：在 `lib/data.ts` 中设置 `USE_LOCAL_DATA = true`
3. **启动服务**：
   ```bash
   cd manga-reader
   npm run dev
   ```
4. **访问网站**：打开 `http://localhost:3000`

### 方式二：使用示例数据

1. **修改配置**：在 `lib/data.ts` 中设置 `USE_LOCAL_DATA = false`
2. **启动服务**：
   ```bash
   cd manga-reader
   npm run dev
   ```
3. **访问网站**：打开 `http://localhost:3000`（将显示示例数据）

## 🔧 工具函数

### 获取数据源信息

```typescript
import { getDataSourceInfo } from '@/lib/data';

const info = getDataSourceInfo();
console.log(info);
// 输出示例：
// {
//   source: 'local',
//   type: '自动扫描 data 文件夹',
//   count: 1,
//   series: ['大模型入门']
// }
```

### 刷新数据（用于开发时动态更新）

```typescript
import { refreshMangaData } from '@/lib/data';

// 重新扫描data文件夹
const updatedData = refreshMangaData();
```

## 🖼️ 支持的图片格式

- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- WebP (`.webp`)
- GIF (`.gif`)

## ⚠️ 注意事项

1. **文件命名规范**：
   - 封面图片应命名为 `封面.png`（可带空格）
   - 内容页按数字命名：`1.png`, `2.png`, `3.png`...
   - 系统会自动排序：封面在最前，然后按数字顺序

2. **性能优化**：
   - 图片API已设置缓存策略：`Cache-Control: public, max-age=31536000, immutable`
   - 图片会在浏览器缓存一年，提高加载速度

3. **部署到ECS服务器**：
   - 确保 `data` 文件夹随项目一起部署
   - 无需额外配置，API路由会自动处理图片访问
   - 建议将图片文件优化压缩（使用 TinyPNG 等工具）

4. **安全措施**：
   - API路由已实现路径遍历防护
   - 仅允许访问 `data` 文件夹内的文件

## 📊 当前数据状态

根据扫描结果，当前检测到的数据：

- **系列数量**：1 个（大模型入门）
- **章节数量**：2 个
  - 第一话：强化学习求生记（4页）
  - 第二话：RAG外挂拯救智商记（7页）

## 🎯 下一步优化建议

1. **添加更多系列**：在 `data` 文件夹下创建更多系列文件夹
2. **元数据配置**：可以创建 JSON 配置文件来指定每个系列的详细信息（描述、分类标签等）
3. **图片优化**：压缩图片以减少带宽使用
4. **CDN集成**：如需更高性能，可以考虑将图片上传到CDN

## 🐛 故障排除

### 问题：图片无法显示

**解决方案**：
1. 检查 `data` 文件夹是否存在
2. 确认图片路径正确
3. 查看浏览器控制台错误信息
4. 验证 API 路由是否正常工作

### 问题：扫描不到数据

**解决方案**：
1. 确认 `USE_LOCAL_DATA = true`
2. 检查文件夹结构是否正确
3. 查看终端是否有错误输出
4. 确保图片文件扩展名为小写（`.png` 而不是 `.PNG`）

### 问题：封面图片显示为第一页

**解决方案**：
确保封面图片名称包含"封面"二字，例如：
- ✅ `封面.png`
- ✅ ` 封面.png`（带空格也可以）
- ❌ `cover.png`（不会被识别为封面）
