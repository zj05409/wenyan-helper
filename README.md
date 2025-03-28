# 文言文助手 (WenYan Helper)

<div align="center">
  <img src="./public/logo512.png" width="200" alt="文言文助手">
  <h3>让文言文学习更简单、更高效</h3>
</div>

## 项目介绍

文言文助手是一个帮助用户学习和理解文言文虚词的桌面应用程序。本应用基于React和Electron构建，提供了虚词查询、学习进度跟踪等功能，适合中学生和古文爱好者使用。

### 主要功能

- **虚词学习**：提供常见文言文虚词的详细释义、用法和例句
- **智能搜索**：快速查找需要的虚词及其用法
- **学习进度跟踪**：基于艾宾浩斯遗忘曲线的记忆复习提醒
- **每日学习计划**：自动安排当天需要学习和复习的内容
- **跨平台支持**：Windows、macOS和Linux全平台支持

## 应用截图

![应用截图](./screenshots/app-preview.png)

## 安装与使用

### 下载安装包

您可以在[Releases](https://github.com/zj05409/wenyan-helper/releases)页面下载最新的桌面应用安装包。

支持的平台：
- **Windows**: 提供.exe安装包，支持Windows 7/8/10/11
- **macOS**: 提供.dmg安装包，支持macOS 10.14+
- **Linux**: 提供.AppImage、.deb和.tar.gz包，兼容大多数Linux发行版

### 从源码安装

#### 开发环境需求：
- Node.js 18.0.0+
- npm 7.0.0+
- Git

#### 克隆项目并安装依赖：

```bash
git clone https://github.com/zj05409/wenyan-helper.git
cd wenyan-helper
npm install
```

## 开发指南

### 开发命令

```bash
# 启动开发服务器（仅Web版本）
npm run dev

# 启动Electron开发环境
npm run electron:dev

# 运行测试
npm run test
```

### 构建命令

```bash
# 构建Web版本
npm run build

# 构建所有平台的桌面应用
npm run electron:build:all

# 仅构建macOS版本
npm run electron:build:mac

# 仅构建Windows版本
npm run electron:build:win

# 仅构建Linux版本
npm run electron:build:linux
```

### 项目结构

```
wenyan-helper/
├── electron/             # Electron主进程代码
├── public/               # 静态资源
├── src/                  # 前端源代码
│   ├── components/       # React组件
│   ├── contexts/         # React上下文
│   ├── data/             # 虚词数据
│   ├── hooks/            # 自定义React钩子
│   ├── utils/            # 工具函数
│   ├── App.jsx           # 应用主组件
│   └── index.jsx         # 应用入口
├── scripts/              # 辅助脚本
├── package.json          # 项目配置
└── vite.config.js        # Vite配置
```

## 技术栈

- **前端框架**: React 19
- **路由**: React Router 6
- **构建工具**: Vite
- **桌面应用框架**: Electron 30
- **中文分词**: Segmentit
- **拼音转换**: Pinyin

## 数据来源

应用中的文言文虚词数据来源于多种古籍和现代文言文工具书，经过整理和优化，保证内容的准确性和权威性。主要参考：

- 《古代汉语虚词词典》
- 《古汉语常用字字典》
- 《文言文虚词大词典》

## 贡献指南

欢迎贡献代码、提出问题或建议！请遵循以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

### 代码规范

- 使用ESLint进行代码检查
- 遵循React最佳实践
- 组件和函数应有清晰的注释

## 常见问题

**Q: 为什么应用启动时报错?**  
A: 请确保您已安装所有依赖 (`npm install`)，且Node.js版本 >= 18.0.0。

**Q: 如何添加新的虚词数据?**  
A: 新的虚词数据可以添加到 `src/data` 目录下的相应JSON文件中。

**Q: 应用支持离线使用吗?**  
A: 是的，应用完全支持离线使用，所有数据都存储在本地。

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解更多详情。

## 联系方式

- **项目维护者**: [开发者](mailto:your.email@example.com)
- **项目议题**: [GitHub Issues](https://github.com/zj05409/wenyan-helper/issues)
- **项目链接**: [https://github.com/zj05409/wenyan-helper](https://github.com/zj05409/wenyan-helper)

---

<div align="center">
  <p>Copyright © 2024 文言文助手 - 学古文，知文化</p>
  <p>
    <a href="https://github.com/zj05409/wenyan-helper/stargazers">
      <img src="https://img.shields.io/github/stars/zj05409/wenyan-helper" alt="Stars">
    </a>
    <a href="https://github.com/zj05409/wenyan-helper/issues">
      <img src="https://img.shields.io/github/issues/zj05409/wenyan-helper" alt="Issues">
    </a>
    <a href="https://github.com/zj05409/wenyan-helper/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/zj05409/wenyan-helper" alt="License">
    </a>
  </p>
</div>
