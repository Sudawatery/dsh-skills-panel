(function () {
  if (window.__dshSkillsPanel) return
  window.__dshSkillsPanel = true

  // ---- 中文描述映射 ----
  var CN = {
    'ppt-design-skill': 'AI 驱动的 PPT 生成与设计',
    'animate': '创建交互动画效果',
    'animate-expo': 'Expo React Native 动画',
    'animation-performance': '动画性能优化',
    'animation-vocabulary': '动画术语速查',
    'apple-design': 'Apple 设计规范',
    'ask-sonner': 'Sonner 通知 Toast 组件',
    'break-ui': '界面断点与响应式分析',
    'choreograph': '动画编排与节奏设计',
    'emil-design-eng': '设计工程最佳实践',
    'find-animation-opportunities': '识别界面可加动画的位置',
    'find-skills': '搜索可用的 Skill',
    'gestures': '手势交互（拖拽/滑动/长按）',
    'improve-animations': '审查并改进现有动画',
    'mobile-native': '移动端原生体验优化',
    'pick-ui-library': '选择合适的 UI 组件库',
    'prototype': '快速交互原型',
    'remove-animations': '移除冗余动画',
    'review-animations': '动画代码审查',
    'write-swift': 'Swift/iOS 代码编写',
  }

  // ---- 颜色设置（只控制弹出面板，不控制侧边栏按钮）----
  var defaultTheme = {
    bg: '#ffffff', card: '#f5f6f8', text: '#1a1a1a', muted: '#888',
    accent: '#4a9eff', border: '#e5e5e5',
  }
  var theme = loadTheme()
  // 侧边栏菜单位置（0=插件前, 1=插件后, 2=自动化任务后, 3=上下文洞察后, 4=更多后）
  var menuPos = parseInt(localStorage.getItem('dsh-skills-pos') || '2', 10)

  function loadTheme() {
    try {
      var saved = localStorage.getItem('dsh-skills-theme')
      if (saved) return Object.assign({}, defaultTheme, JSON.parse(saved))
    } catch {}
    return Object.assign({}, defaultTheme)
  }
  function saveTheme() {
    try { localStorage.setItem('dsh-skills-theme', JSON.stringify(theme)) } catch {}
    applyTheme()
  }

  var started = false
  function tryStart() {
    if (started) return true
    var root = document.getElementById('root')
    if (!root) return false
    if (!root.querySelector('[data-composer-input], textarea, [contenteditable="true"]')) return false
    started = true
    init()
    return true
  }

  var observer = new MutationObserver(function () {
    if (tryStart()) observer.disconnect()
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  setInterval(tryStart, 2000)
  // 偶尔检查 menuBtn 是否被 React 删掉，删掉了就重新注入
  setInterval(function () {
    if (started && (!menuBtn || !menuBtn.isConnected)) tryInjectSidebar()
  }, 3000)

  // ---- 侧边栏菜单注入 ----
  var menuBtn = null
  var cachedAnchors = null
  var openPanel = function () {}

  function findMenuAnchors() {
    if (cachedAnchors && cachedAnchors.more && cachedAnchors.more.isConnected) return cachedAnchors
    var all = document.body.querySelectorAll('*')
    var anchors = {}
    for (var i = 0; i < all.length; i++) {
      var el = all[i]
      var t = (el.textContent || '').trim()
      if (t.length > 10 || t.length === 0) continue
      if (t === '插件' && !anchors.plugin) anchors.plugin = el
      else if (t === '自动化任务' && !anchors.automation) anchors.automation = el
      else if (t === '上下文洞察' && !anchors.context) anchors.context = el
      else if (t === '更多' && !anchors.more) anchors.more = el
    }
    var result = {}
    for (var k in anchors) result[k] = anchors[k].parentElement || anchors[k]
    cachedAnchors = result
    return result
  }

  function tryInjectSidebar() {
    if (menuBtn && menuBtn.isConnected) return
    menuBtn = null

    var anchors = findMenuAnchors()
    if (!anchors.more && !anchors.automation) return // 菜单还没渲染

    menuBtn = document.createElement('div')
    menuBtn.id = 'dsh-skills-menubtn'
    menuBtn.style.cssText = 'display:flex;align-items:center;gap:6px;padding:7px 12px;cursor:pointer;border-radius:8px;font-size:14px;color:inherit;user-select:none;line-height:1.5;'
    menuBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>Skills</span>'
    menuBtn.addEventListener('mouseenter', function () { menuBtn.style.background = 'rgba(128,128,128,.1)' })
    menuBtn.addEventListener('mouseleave', function () { menuBtn.style.background = '' })
    menuBtn.addEventListener('click', openPanel)

    // menuPos: 0=插件前, 1=插件后(自动化任务前), 2=自动化任务后(上下文洞察前), 3=上下文洞察后(更多前), 4=更多后
    if (menuPos <= 0 && anchors.plugin) {
      anchors.plugin.before(menuBtn)
    } else if (menuPos === 1 && anchors.automation) {
      anchors.automation.before(menuBtn)
    } else if (menuPos === 2 && anchors.context) {
      anchors.context.before(menuBtn)
    } else if (menuPos === 3 && anchors.more) {
      anchors.more.before(menuBtn)
    } else if (anchors.more) {
      anchors.more.after(menuBtn)
    } else if (anchors.automation) {
      anchors.automation.after(menuBtn)
    }
  }

  function moveMenu(dir) {
    if (dir === 'up') menuPos = menuPos <= 0 ? 4 : menuPos - 1
    if (dir === 'down') menuPos = menuPos >= 4 ? 0 : menuPos + 1
    localStorage.setItem('dsh-skills-pos', String(menuPos))
    if (!menuBtn) return
    // 每次都重新找 anchors，确保位置准确
    cachedAnchors = null
    var anchors = findMenuAnchors()
    // 按优先级插入，找不到当前位置的 anchor 就往最近的位置靠
    var insertBeforeEl = null
    if (menuPos <= 0) insertBeforeEl = anchors.plugin
    else if (menuPos === 1) insertBeforeEl = anchors.automation
    else if (menuPos === 2) insertBeforeEl = anchors.context || anchors.automation
    else if (menuPos === 3) insertBeforeEl = anchors.more
    if (insertBeforeEl) {
      insertBeforeEl.before(menuBtn)
    } else if (anchors.more) {
      anchors.more.after(menuBtn)
    } else if (anchors.automation) {
      anchors.automation.after(menuBtn)
    }
  }

  // ---- 弹出面板样式 ----
  function cssStr() {
    return `
#dsh-skills-panel {
  position: fixed; top: 0; right: -420px; width: 400px; height: 100vh; z-index: 99999;
  background: ${theme.bg}; color: ${theme.text}; border-left: 1px solid ${theme.border};
  transition: right .3s ease; display: flex; flex-direction: column;
  box-shadow: -4px 0 20px rgba(0,0,0,.1);
}
#dsh-skills-panel.open { right: 0; }
#dsh-skills-header {
  padding: 14px 16px; border-bottom: 1px solid ${theme.border};
  display: flex; align-items: center; justify-content: space-between;
}
#dsh-skills-header h2 { margin: 0; font-size: 15px; font-weight: 600; }
#dsh-skills-header-btns { display: flex; gap: 6px; }
#dsh-skills-settings, #dsh-skills-close {
  background: none; border: none; color: ${theme.muted}; font-size: 16px; cursor: pointer;
  padding: 4px 8px; line-height: 1; border-radius: 6px;
}
#dsh-skills-settings:hover, #dsh-skills-close:hover { color: ${theme.text}; background: ${theme.card}; }
#dsh-skills-search {
  margin: 10px 16px; padding: 8px 12px; border-radius: 8px;
  background: ${theme.card}; border: 1px solid ${theme.border}; color: ${theme.text};
  font-size: 13px; outline: none;
}
#dsh-skills-search::placeholder { color: ${theme.muted}; }
#dsh-skills-list { flex: 1; overflow-y: auto; padding: 0 16px 16px; }
.dsh-skill-item {
  padding: 10px 12px; margin-bottom: 6px; border-radius: 8px;
  background: ${theme.card}; border: 1px solid transparent;
}
.dsh-skill-name { font-size: 13px; font-weight: 600; color: ${theme.accent}; margin-bottom: 3px; }
.dsh-skill-cn { font-size: 12px; color: ${theme.text}; margin-bottom: 2px; }
.dsh-skill-desc { font-size: 11px; color: ${theme.muted}; line-height: 1.4; }
#dsh-skills-empty { text-align: center; color: ${theme.muted}; padding: 40px 20px; font-size: 13px; }
#dsh-skills-backdrop {
  position: fixed; top:0; left:0; width:100%; height:100%;
  background: rgba(0,0,0,.15); z-index: 99997; display: none;
}
#dsh-skills-backdrop.show { display: block; }
#dsh-skills-settings-panel {
  padding: 12px 16px; border-bottom: 1px solid ${theme.border}; display: none;
}
#dsh-skills-settings-panel.show { display: block; }
.dsh-skills-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.dsh-skills-row label { font-size: 12px; color: ${theme.muted}; width: 70px; flex-shrink: 0; }
.dsh-skills-row input[type=color] {
  width: 36px; height: 28px; border: 1px solid ${theme.border}; border-radius: 6px;
  cursor: pointer; background: none; padding: 2px;
}
.dsh-skills-row input[type=text] {
  flex: 1; padding: 4px 8px; border-radius: 6px; font-size: 12px;
  background: ${theme.bg}; border: 1px solid ${theme.border}; color: ${theme.text};
}
.dsh-skills-presets { display: flex; gap: 6px; margin-top: 4px; padding-left: 78px; }
.dsh-preset {
  width: 24px; height: 24px; border-radius: 6px; cursor: pointer;
  border: 1px solid ${theme.border};
}
.dsh-pos-btns { display: flex; gap: 8px; margin-top: 8px; padding-left: 78px; }
.dsh-pos-btn {
  padding: 4px 14px; border-radius: 6px; font-size: 12px; cursor: pointer;
  background: ${theme.card}; border: 1px solid ${theme.border}; color: ${theme.text};
}
.dsh-pos-btn:hover { background: ${theme.border}; }
`
  }

  var styleEl = null
  function applyTheme() {
    if (styleEl) styleEl.textContent = cssStr()
  }

  function init() {
    styleEl = document.createElement('style')
    styleEl.textContent = cssStr()
    document.head.appendChild(styleEl)

    // 遮罩
    var backdrop = document.createElement('div')
    backdrop.id = 'dsh-skills-backdrop'
    document.body.appendChild(backdrop)

    // 面板
    var panel = document.createElement('div')
    panel.id = 'dsh-skills-panel'
    panel.innerHTML = `
      <div id="dsh-skills-header">
        <h2>已安装的 Skills</h2>
        <div id="dsh-skills-header-btns">
          <button id="dsh-skills-settings">⚙</button>
          <button id="dsh-skills-close">✕</button>
        </div>
      </div>
      <div id="dsh-skills-settings-panel">
        <div class="dsh-skills-row">
          <label>背景色</label>
          <input type="color" id="dsh-c-bg" value="${theme.bg}">
          <input type="text" id="dsh-c-bg-hex" value="${theme.bg}">
        </div>
        <div class="dsh-skills-row">
          <label>卡片色</label>
          <input type="color" id="dsh-c-card" value="${theme.card}">
          <input type="text" id="dsh-c-card-hex" value="${theme.card}">
        </div>
        <div class="dsh-skills-row">
          <label>强调色</label>
          <input type="color" id="dsh-c-accent" value="${theme.accent}">
          <input type="text" id="dsh-c-accent-hex" value="${theme.accent}">
        </div>
        <div class="dsh-skills-row">
          <label>文字色</label>
          <input type="color" id="dsh-c-text" value="${theme.text}">
          <input type="text" id="dsh-c-text-hex" value="${theme.text}">
        </div>
        <div class="dsh-skills-presets">
          <div class="dsh-preset" style="background:#ffffff" data-preset="light" title="浅色"></div>
          <div class="dsh-preset" style="background:#1e1e2e" data-preset="dark" title="深色"></div>
          <div class="dsh-preset" style="background:#fdf6ec" data-preset="warm" title="暖色"></div>
          <div class="dsh-preset" style="background:#eef5ff" data-preset="blue" title="蓝色"></div>
          <div class="dsh-preset" style="background:#f0f7f0" data-preset="green" title="绿色"></div>
        </div>
        <div class="dsh-pos-btns">
          <button class="dsh-pos-btn" id="dsh-pos-up">↑ 上移菜单位置</button>
          <button class="dsh-pos-btn" id="dsh-pos-down">↓ 下移菜单位置</button>
        </div>
      </div>
      <input id="dsh-skills-search" type="text" placeholder="搜索 skill...">
      <div id="dsh-skills-list"><div id="dsh-skills-empty">加载中...</div></div>
    `
    document.body.appendChild(panel)

    var listEl = panel.querySelector('#dsh-skills-list')
    var searchEl = panel.querySelector('#dsh-skills-search')
    var settingsPanel = panel.querySelector('#dsh-skills-settings-panel')
    var allSkills = []

    function shortDesc(d) {
      if (!d) return ''
      var first = d.split(/[.;。；]/)[0]
      if (first.length > 80) first = first.substring(0, 77) + '...'
      return first
    }

    function escapeHtml(t) {
      var d = document.createElement('div')
      d.textContent = t
      return d.innerHTML
    }

    function render(filter) {
      var f = (filter || '').toLowerCase()
      var filtered = allSkills.filter(function (s) {
        var cn = CN[s.dir] || ''
        return !f ||
          s.name.toLowerCase().indexOf(f) >= 0 ||
          (cn && cn.toLowerCase().indexOf(f) >= 0) ||
          (s.description || '').toLowerCase().indexOf(f) >= 0
      })
      if (filtered.length === 0) {
        listEl.innerHTML = '<div id="dsh-skills-empty">没有匹配的 skill</div>'
        return
      }
      listEl.innerHTML = filtered.map(function (s) {
        var cn = CN[s.dir] || ''
        var desc = shortDesc(s.description)
        return '<div class="dsh-skill-item">' +
          '<div class="dsh-skill-name">' + escapeHtml(s.name) + '</div>' +
          (cn ? '<div class="dsh-skill-cn">' + escapeHtml(cn) + '</div>' : '') +
          (desc ? '<div class="dsh-skill-desc">' + escapeHtml(desc) + '</div>' : '') +
          '</div>'
      }).join('')
    }

    window.__openSkillsPanel = openPanel
    openPanel = function () {
      panel.classList.add('open')
      backdrop.classList.add('show')
      searchEl.focus()
    }
    function closePanel() {
      panel.classList.remove('open')
      backdrop.classList.remove('show')
      settingsPanel.classList.remove('show')
    }

    panel.querySelector('#dsh-skills-close').addEventListener('click', closePanel)
    backdrop.addEventListener('click', closePanel)
    searchEl.addEventListener('input', function () { render(this.value) })

    panel.querySelector('#dsh-skills-settings').addEventListener('click', function () {
      settingsPanel.classList.toggle('show')
    })

    // 上下移动菜单
    panel.querySelector('#dsh-pos-up').addEventListener('click', function () { moveMenu('up') })
    panel.querySelector('#dsh-pos-down').addEventListener('click', function () { moveMenu('down') })

    // 颜色绑定
    var colorMap = [
      ['bg', '#dsh-c-bg', '#dsh-c-bg-hex'],
      ['card', '#dsh-c-card', '#dsh-c-card-hex'],
      ['accent', '#dsh-c-accent', '#dsh-c-accent-hex'],
      ['text', '#dsh-c-text', '#dsh-c-text-hex'],
    ]
    colorMap.forEach(function ([key, pickerId, hexId]) {
      var picker = panel.querySelector(pickerId)
      var hexInput = panel.querySelector(hexId)
      picker.addEventListener('input', function () {
        theme[key] = this.value
        hexInput.value = this.value
        saveTheme()
      })
      hexInput.addEventListener('change', function () {
        var v = this.value.trim()
        if (/^#[0-9a-fA-F]{6}$/.test(v)) {
          theme[key] = v
          picker.value = v
          saveTheme()
        }
      })
    })

    var presets = {
      light: { bg: '#ffffff', card: '#f5f6f8', text: '#1a1a1a', accent: '#4a9eff', border: '#e5e5e5', muted: '#888' },
      dark: { bg: '#1e1e2e', card: '#2a2a3e', text: '#e0e0e0', accent: '#7eb8ff', border: '#333344', muted: '#999' },
      warm: { bg: '#fdf6ec', card: '#faf0e0', text: '#3d2b1f', accent: '#e8944a', border: '#e8d5c0', muted: '#998' },
      blue: { bg: '#eef5ff', card: '#e0ecff', text: '#1a2a4a', accent: '#3b7ddd', border: '#c5d9f5', muted: '#789' },
      green: { bg: '#f0f7f0', card: '#e0f0e0', text: '#1a3a1a', accent: '#4a9e4a', border: '#c5e5c5', muted: '#798' },
    }
    panel.querySelectorAll('.dsh-preset').forEach(function (el) {
      el.addEventListener('click', function () {
        var p = presets[this.dataset.preset]
        if (!p) return
        theme = Object.assign({}, p)
        colorMap.forEach(function ([key, pickerId, hexId]) {
          if (theme[key]) {
            panel.querySelector(pickerId).value = theme[key]
            panel.querySelector(hexId).value = theme[key]
          }
        })
        saveTheme()
      })
    })

    // 加载数据
    fetch('/dsh-skills/list')
      .then(function (r) { return r.json() })
      .then(function (data) {
        allSkills = data.skills || []
        render('')
      })
      .catch(function () {
        listEl.innerHTML = '<div id="dsh-skills-empty">加载失败，请重启 dsh web</div>'
      })

    // 注入侧边栏菜单
    tryInjectSidebar()
  }
})()
