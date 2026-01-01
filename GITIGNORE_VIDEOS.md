# .gitignore 更新 - 视频文件

## 已添加的规则

在 `.gitignore` 文件中添加了以下视频文件格式：

```gitignore
# data directory - video files
data/**/*.mp4
data/**/*.mov
data/**/*.avi
data/**/*.mkv
data/**/*.webm
data/**/*.flv
data/**/*.wmv
data/**/*.m4v
data/**/*.mpeg
data/**/*.mpg
```

## 覆盖的视频格式

| 扩展名 | 格式名称 |
|--------|----------|
| `.mp4` | MPEG-4 视频 |
| `.mov` | QuickTime 视频 |
| `.avi` | Audio Video Interleave |
| `.mkv` | Matroska 视频 |
| `.webm` | WebM 视频 |
| `.flv` | Flash 视频 |
| `.wmv` | Windows Media 视频 |
| `.m4v` | iTunes 视频 |
| `.mpeg` | MPEG 视频 |
| `.mpg` | MPEG 视频 |

## 发现的视频文件

在 `data` 目录中找到的视频文件：
- `data/智能体历史/video/*.mp4` (8个文件)
- `data/智能体历史/智能体历史.mp4`

## 效果

所有位于 `data` 目录及其子目录下的视频文件都会被 Git 忽略，不会被提交到版本控制中。

## 示例

- ✅ 会被忽略：`data/智能体历史/video/1.mp4`
- ✅ 会被忽略：`data/some/manga/video/intro.mov`
- ✅ 会被忽略：`data/任何/子目录/video.mkv`
- ❌ 不会被忽略：`public/videos/intro.mp4` (不在 data 目录)

## 注意事项

1. **只忽略 data 目录**: 规则使用 `data/**/*` 模式，只影响 data 目录下的视频
2. **其他目录不受影响**: `public/`、`assets/` 等目录的视频文件不会被忽略
3. **已跟踪的文件**: 如果视频文件已经被 Git 跟踪，需要先从缓存中移除：
   ```bash
   git rm --cached data/**/*.mp4
   git commit -m "Remove video files from tracking"
   ```

## 完整的 .gitignore

当前的 `.gitignore` 文件包含以下主要部分：
1. 依赖 (`node_modules`)
2. 测试 (`coverage`)
3. Next.js 构建文件 (`.next/`, `/out/`)
4. 生产构建 (`/build`)
5. 环境变量 (`.env*`)
6. **视频文件** (`data/**/*.mp4` 等) ← 新增

## 如果需要忽略其他目录的视频

如果需要忽略其他目录的视频文件，可以添加：

```gitignore
# 所有目录的视频文件
**/*.mp4
**/*.mov
**/*.avi
```

或者添加特定目录：

```gitignore
# public 目录的视频
public/videos/*.mp4
public/assets/*.mov
```

---

**更新日期**: 2025-12-31
**状态**: ✅ 已完成
