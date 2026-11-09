# dsh-skills-panel

DSH（DeepSeek Harness）侧边栏 Skills 面板插件。在左侧边栏添加一个 "⭐ Skills" 入口，点击后从右侧滑出面板，浏览和搜索你已安装的所有 Skill。

## 功能

- 📋 **侧边栏入口**：在 DSH 左侧边栏（插件/自动化任务/上下文洞察/更多）旁添加 "Skills" 菜单项
- 🔍 **搜索 Skill**：按名称或中文描述快速搜索
- 🇨🇳 **中文简介**：内置常用 Skill 的中文翻译
- 🎨 **自定义配色**：4 项颜色调节（背景/卡片/强调/文字）+ 5 套预设主题，只控制面板不影响 DSH 原生 UI
- 📍 **菜单位置可调**：5 个位置上下移动，循环切换
- 💾 **设置持久化**：颜色和位置自动保存在浏览器 localStorage

## 截图

![侧边栏入口](https://aka.doubaocdn.com/s/G2R7YN5Vv0)

## 安装

```bash
# 从 GitHub 克隆或下载
git clone https://github.com/Sudawatery/dsh-skills-panel.git

# 在 DSH 中安装（link 模式）
dsh plugin --profile web add "link:/path/to/dsh-skills-panel"

# 重启 DSH
dsh --profile web
```

## 开发

```bash
# 本插件无构建步骤，纯前端 JS + Node 后端
# 修改 assets/panel.js 后，浏览器 Ctrl+Shift+R 硬刷新即可
# 修改 index.js 后需重启 dsh web
```

## 项目结构

```
dsh-skills-panel/
├── index.js           # Node 后端：扫描 skills 目录，提供 API
├── assets/
│   └── panel.js       # 前端：侧边栏注入 + 弹出面板
├── cordis.patch.yml   # DSH 插件挂载声明
├── package.json
└── README.md
```

## License

[MIT](./LICENSE)
