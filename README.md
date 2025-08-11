# AI 智能搜索引擎

一个基于 React + TypeScript + Vite 构建的现代化 AI 搜索引擎前端项目，具有美观的 UI 设计和流畅的用户体验。

## 🚀 项目特性

- **现代化技术栈**: React 18 + TypeScript + Vite
- **响应式设计**: 完美适配桌面端和移动端
- **流畅动画**: 使用 Framer Motion 实现丝滑的动画效果
- **组件化架构**: 高度可复用的组件设计
- **状态管理**: 使用 React Context 进行状态管理
- **类型安全**: 完整的 TypeScript 类型定义
- **UI 框架**: Tailwind CSS 实现现代化设计

## 🎨 功能特性

- 🔍 **智能搜索**: 支持多种内容类型的搜索
- 📱 **响应式布局**: 适配各种设备尺寸
- 🎯 **搜索历史**: 记录和管理搜索历史
- 🔧 **筛选功能**: 按类型、时间、相关性筛选结果
- 📊 **结果展示**: 列表和网格两种视图模式
- ⚡ **快速响应**: 优化的搜索体验

## 🛠️ 技术栈

- **前端框架**: React 18
- **开发语言**: TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **动画库**: Framer Motion
- **图标库**: Lucide React
- **工具库**: clsx, tailwind-merge

## 📦 安装和运行

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── HomePage.tsx     # 首页组件
│   ├── SearchBar.tsx    # 搜索栏组件
│   ├── SearchResultsPage.tsx  # 搜索结果页面
│   ├── SearchResultCard.tsx   # 搜索结果卡片
│   └── SearchHistory.tsx      # 搜索历史组件
├── contexts/            # React Context
│   └── SearchContext.tsx      # 搜索状态管理
├── types/               # TypeScript 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   └── index.ts
├── App.tsx              # 主应用组件
└── index.css            # 全局样式
```

## 🎯 核心组件

### SearchBar
现代化的搜索栏组件，支持语音搜索和图片搜索功能。

### SearchResultsPage
搜索结果展示页面，包含筛选、排序和视图切换功能。

### SearchResultCard
搜索结果卡片组件，展示搜索结果的详细信息。

### SearchHistory
搜索历史管理组件，支持历史记录的查看和删除。

## 🔧 自定义配置

### Tailwind CSS 配置
项目使用自定义的 Tailwind CSS 配置，包含：
- 自定义颜色主题
- 响应式断点
- 动画效果
- 组件样式

### 类型定义
完整的 TypeScript 类型定义，确保代码的类型安全。

## 🚀 部署

项目可以部署到任何支持静态网站的平台上：

- Vercel
- Netlify
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

## 📝 开发说明

### 添加新功能
1. 在 `src/types/index.ts` 中定义相关类型
2. 在 `src/components/` 中创建新组件
3. 在 `src/contexts/` 中添加状态管理逻辑
4. 更新相关组件以集成新功能

### 样式修改
项目使用 Tailwind CSS，可以通过以下方式修改样式：
- 修改 `tailwind.config.js` 中的主题配置
- 在 `src/index.css` 中添加自定义样式
- 在组件中使用 Tailwind 类名

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！