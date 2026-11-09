# dsh-skills-panel

DSH（DeepSeek Harness）侧边栏 Skills 面板插件。在左侧边栏添加一个 "⭐ Skills" 入口，点击后从右侧滑出面板，浏览和搜索你已安装的所有 Skill。

## 这是什么？

如果你用过 DSH（DeepSeek Harness），你会发现插件管理页面只能看到 npm 插件，看不到你安装的 Skill 文件包（比如 ppt-design-skill 这种）。这个插件就是解决这个问题的——在侧边栏加一个入口，点进去就能看到所有已安装的 Skill，还能搜索、看中文简介。

## 前置要求

- 已安装 [DSH](https://github.com/)（DeepSeek Harness）并能正常启动 `dsh --profile web`
- 已安装 Node.js 18+
- 你的 DSH 里已经装了一些 Skill（在 `$DSH_HOME/skills/` 目录下）

## 功能

- 📋 **侧边栏入口**：在 DSH 左侧边栏（插件/自动化任务/上下文洞察/更多）旁添加 "Skills" 菜单项
- 🔍 **搜索 Skill**：按名称或中文描述快速搜索
- 🇨🇳 **中文简介**：内置常用 Skill 的中文翻译
- 🎨 **自定义配色**：4 项颜色调节（背景/卡片/强调/文字）+ 5 套预设主题，只控制面板不影响 DSH 原生 UI
- 📍 **菜单位置可调**：5 个位置上下移动，循环切换
- 💾 **设置持久化**：颜色和位置自动保存在浏览器 localStorage

## 截图

<p align="center"><b>侧边栏入口</b></p>
<p align="center"><img src="https://aka.doubaocdn.com/s/G2R7YN5Vv0" width="350"></p>

<p align="center"><b>弹出面板</b></p>
<p align="center"><img src="https://aka.doubaocdn.com/s/w2F4Vcgl5f" width="350"></p>

<p align="center"><b>颜色自定义</b></p>
<p align="center"><img src="https://aka.doubaocdn.com/s/RqlaqWmXwS" width="350"></p>

<p align="center"><b>设置面板</b></p>
<p align="center"><img src="https://aka.doubaocdn.com/s/rhYA2HefCi" width="350"></p>

## 安装

### 方法一：直接下载 ZIP（推荐小白）

1. 点页面右上角绿色 **Code** 按钮 → **Download ZIP**
2. 解压到任意目录，比如 `E:\Study\dsh\plugins\dsh-skills-panel`
3. 打开终端（PowerShell 或 cmd），执行：

```bash
dsh plugin --profile web add "link:E:\Study\dsh\plugins\dsh-skills-panel"
```

4. 重启 DSH：

```bash
dsh --profile web
```

5. 浏览器打开 DSH 页面，**Ctrl+Shift+R** 硬刷新，侧边栏就能看到 "⭐ Skills" 了

### 方法二：git clone（会用 git 的）

```bash
git clone https://github.com/Sudawatery/dsh-skills-panel.git
dsh plugin --profile web add "link:/path/to/dsh-skills-panel"
dsh --profile web
```

## 常见问题

**Q: 侧边栏没看到 Skills 按钮？**
A: 按 Ctrl+Shift+R 硬刷新浏览器。如果还不行，重启 `dsh --profile web`。

**Q: 面板打开是空的/加载失败？**
A: 确认你的 DSH_HOME 环境变量正确设置，且 `$DSH_HOME/skills/` 目录下有 Skill 文件夹（每个里面有 SKILL.md）。

**Q: 怎么改图标和文字的间距？**
A: 编辑 `assets/panel.js`，找到 `gap:6px` 和 `padding:7px 12px`，改数字即可。

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
├── cordis.patch.yml    # DSH 插件挂载声明
├── package.json
└── README.md
```

## License

[MIT](./LICENSE)
