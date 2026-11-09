import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = path.dirname(fileURLToPath(import.meta.url))
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const SKILLS_DIR = path.join(DSH_HOME, 'skills')

// 解析 SKILL.md 的 frontmatter（--- 包裹的 YAML 头）
function parseSkillFrontmatter(skillDir) {
  const mdPath = path.join(skillDir, 'SKILL.md')
  try {
    const raw = fs.readFileSync(mdPath, 'utf8')
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    let name = path.basename(skillDir)
    let description = ''
    if (fmMatch) {
      const fm = fmMatch[1]
      const nameMatch = fm.match(/^name:\s*(.+)$/m)
      const descMatch = fm.match(/^description:\s*["']?([\s\S]*?)["']?$/m)
      if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, '')
      if (descMatch) description = descMatch[1].trim().replace(/^["']|["']$/g, '')
    }
    return { name, description, dir: path.basename(skillDir) }
  } catch {
    return { name: path.basename(skillDir), description: '(无法读取 SKILL.md)', dir: path.basename(skillDir) }
  }
}

function listSkills() {
  try {
    const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    return entries
      .filter(e => e.isDirectory())
      .map(e => parseSkillFrontmatter(path.join(SKILLS_DIR, e.name)))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
  } catch {
    return []
  }
}

export default {
  apply(root) {
    // ① 注册 index-inject（桌面端兼容）
    root.on('webserver/index-inject', (table) => {
      try {
        if (!Array.isArray(table)) return
        table.push({ kind: 'script', placement: 'body', text: 'var s=document.createElement("script");s.src="/dsh-skills/panel.js";document.body.appendChild(s);' })
      } catch {}
    })

    // ② 等 webServer 就绪后注册路由和 tapIndex
    root.inject(['webServer'], (ctx) => {
      const disposers = []

      // API: 获取 skills 列表
      disposers.push(ctx.webServer.register({
        kind: 'exact',
        path: '/dsh-skills/list',
        handler: async (req, res) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ skills: listSkills(), skillsDir: SKILLS_DIR }))
        },
      }))

      // API: 前端 panel.js
      disposers.push(ctx.webServer.register({
        kind: 'exact',
        path: '/dsh-skills/panel.js',
        handler: async (req, res) => {
          try {
            const js = fs.readFileSync(path.join(PACKAGE_ROOT, 'assets', 'panel.js'), 'utf8')
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
            res.end(js)
          } catch {
            res.statusCode = 404
            res.end('// panel.js not found')
          }
        },
      }))

      // Web 端：tapIndex 注入 script 标签
      disposers.push(ctx.webServer.tapIndex((html) => {
        if (html.indexOf('/dsh-skills/panel.js') !== -1) return html
        const tag = '<script defer src="/dsh-skills/panel.js"></script>'
        if (html.indexOf('</body>') !== -1) return html.replace('</body>', tag + '</body>')
        return html + tag
      }))

      ctx.effect(() => () => { disposers.forEach(d => { try { d() } catch {} }) })
    })
  },
}
