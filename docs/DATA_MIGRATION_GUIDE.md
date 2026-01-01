# 🗄️ Manga-Reader 数据持久化方案

## 📊 当前状态分析

### 现有存储方式
- **文件系统存储** (`data/*.json`)
  - ✅ 简单易用
  - ✅ 开发阶段够用
  - ❌ 并发性能差
  - ❌ 无法水平扩展
  - ❌ 数据查询效率低
  - ❌ 缺少事务支持

## 🎯 推荐方案（按优先级）

### 方案一：SQLite + Prisma（推荐⭐⭐⭐⭐⭐）

**优点：**
- 🚀 零配置，无需额外服务
- 📦 单文件存储，易于备份
- ⚡ 性能优秀，支持索引
- 🔍 SQL查询，功能强大
- 💰 成本低，资源占用少
- 🛠️ Prisma ORM，开发体验好

**适用场景：**
- 中小型项目（< 10万用户）
- 单机部署
- 预算有限

**实施步骤：**

#### 1. 安装依赖
```bash
npm install prisma @prisma/client
npx prisma init
```

#### 2. 配置 Prisma (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./data.db"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
  favorites Favorite[]
  comments  Comment[]
  sessions  Session[]
}

model Manga {
  id          String    @id
  title       String
  author      String
  description String
  coverImage  String
  status      String
  categories  String
  updateTime  String
  views       Int       @default(0)
  chapters    Chapter[]
  favorites   Favorite[]
  comments    Comment[]
}

model Chapter {
  id            String   @id
  mangaId       String
  chapterNumber Int
  title         String
  pages         String // JSON array
  updateTime    String
  manga         Manga    @relation(fields: [mangaId], references: [id])
}

model Favorite {
  id        String   @id @default(uuid())
  userId    String
  mangaId   String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  manga     Manga    @relation(fields: [mangaId], references: [id])

  @@unique([userId, mangaId])
}

model Comment {
  id        String   @id @default(uuid())
  mangaId   String
  content   String
  likes     Int      @default(0)
  createdAt DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  manga     Manga    @relation(fields: [mangaId], references: [id])
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id])
}
```

#### 3. 初始化数据库
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### 4. 创建数据库工具 (`lib/db.ts`)
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### 5. 迁移示例 - 用户注册
```typescript
// 原代码
const added = addUser(newUser);

// 新代码
const user = await prisma.user.create({
  data: {
    email: newUser.email,
    username: newUser.username,
    password: newUser.password,
  },
});
```

---

### 方案二：PostgreSQL + Docker（推荐⭐⭐⭐⭐）

**优点：**
- 🐘 成熟稳定的数据库
- 🔐 ACID事务支持
- 📈 支持水平扩展
- 🔍 全文搜索强大
- 🌐 生产环境标准

**适用场景：**
- 大型项目（> 10万用户）
- 需要高可用性
- 团队规模较大

**实施步骤：**

#### 1. Docker Compose 配置 (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: manga-reader-db
    restart: always
    environment:
      POSTGRES_USER: manga_user
      POSTGRES_PASSWORD: manga_pass
      POSTGRES_DB: manga_reader
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U manga_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: manga-reader-pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@manga.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### 2. Prisma Schema 配置
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// DATABASE_URL="postgresql://manga_user:manga_pass@localhost:5432/manga_reader"
```

#### 3. 启动服务
```bash
docker-compose up -d
npx prisma migrate dev
```

---

### 方案三：MongoDB（推荐⭐⭐⭐）

**优点：**
- 📄 文档型数据库，灵活
- 🚀 写入性能高
- 🔄 Schema灵活，易于迭代
- ☁️ Atlas免费托管

**适用场景：**
- 数据结构频繁变化
- 需要灵活的Schema
- 读写比例高

**实施步骤：**

#### 1. 安装 Mongoose
```bash
npm install mongoose
```

#### 2. 配置 MongoDB (`lib/mongodb.ts`)
```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/manga-reader';

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

#### 3. 定义模型 (`models/User.ts`)
```typescript
import mongoose, { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model('User', UserSchema);
```

---

## 🔄 数据迁移策略

### 阶段一：准备阶段（1-2天）
1. ✅ 选择数据库方案
2. ✅ 安装依赖和工具
3. ✅ 设计数据库Schema
4. ✅ 配置开发环境

### 阶段二：迁移阶段（3-5天）
1. ✅ 创建数据迁移脚本
2. ✅ 迁移用户数据
3. ✅ 迁移漫画数据
4. ✅ 迁移评论和收藏

### 阶段三：测试阶段（2-3天）
1. ✅ 单元测试
2. ✅ 集成测试
3. ✅ 性能测试
4. ✅ 数据一致性验证

### 阶段四：上线阶段（1天）
1. ✅ 数据备份
2. ✅ 停机维护
3. ✅ 执行最终迁移
4. ✅ 切换到新系统
5. ✅ 验证运行

---

## 📝 数据迁移脚本示例

```typescript
// scripts/migrate-to-db.ts
import { prisma } from '../lib/db';
import fs from 'fs';

async function migrateUsers() {
  // 读取现有JSON数据
  const usersData = JSON.parse(fs.readFileSync('data/users.json', 'utf-8'));

  for (const user of usersData) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        password: user.password,
        createdAt: new Date(user.createdAt),
      },
    });
  }

  console.log(`✅ Migrated ${usersData.length} users`);
}

async function migrateManga() {
  const mangaData = await getAllMangaData();

  for (const manga of mangaData) {
    await prisma.manga.create({
      data: {
        id: manga.id,
        title: manga.title,
        author: manga.author,
        description: manga.description,
        coverImage: manga.coverImage,
        status: manga.status,
        categories: manga.categories.join(','),
        updateTime: manga.updateTime,
        views: manga.views,
        chapters: {
          create: manga.chapters.map(ch => ({
            id: ch.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            pages: JSON.stringify(ch.pages),
            updateTime: ch.updateTime,
          })),
        },
      },
    });
  }

  console.log(`✅ Migrated ${mangaData.length} manga`);
}

async function main() {
  await migrateUsers();
  await migrateManga();
  await migrateFavorites();
  await migrateComments();
  console.log('🎉 Migration completed!');
}

main().catch(console.error);
```

---

## 🎯 最终建议

### 当前阶段（开发/测试）
**推荐使用：SQLite**
- 无需额外服务
- 快速迭代
- 易于调试

### 生产环境初期（< 1万用户）
**推荐使用：SQLite**
- 性能足够
- 维护简单
- 成本低

### 生产环境成长期（1-10万用户）
**推荐使用：PostgreSQL + Docker**
- 稳定可靠
- 易于扩展
- 社区支持好

### 生产环境成熟期（> 10万用户）
**推荐使用：PostgreSQL 集群**
- 主从复制
- 读写分离
- 缓存层（Redis）

---

## 📦 快速开始包

创建一个完整的环境配置文件：

```bash
# 安装所有依赖
npm install prisma @prisma/client bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# 初始化 Prisma
npx prisma init

# 复制 schema
# (复制上面的 schema 到 prisma/schema.prisma)

# 创建迁移
npx prisma migrate dev --name init

# 生成客户端
npx prisma generate
```

---

## 🔒 安全建议

1. **密码加密**：使用 bcrypt
2. **JWT Token**：用于API认证
3. **SQL注入防护**：Prisma自动处理
4. **XSS防护**：输入验证和输出转义
5. **CSRF防护**：使用CSRF Token
6. **速率限制**：防止API滥用

---

## 📚 相关资源

- [Prisma 文档](https://www.prisma.io/docs)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Next.js 数据库最佳实践](https://nextjs.org/docs/app/building-your-application/data-fetching)
