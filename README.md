# Awesome Cangjie Competitive

用仓颉语言（Cangjie）刷竞赛题的开源站点。

收录各大 OJ（在线评测平台）的经典竞赛题目，每道题提供思路解析与仓颉语言实现，帮助仓颉开发者练习算法与数据结构。

在线访问：<https://competitive.awesomecangjie.com>

## 特性

- **题目与题解合集**：以 Markdown 内容集合组织，覆盖题目描述、思路、复杂度分析与仓颉实现
- **仓颉语法高亮**：内置自定义仓颉 TextMate grammar，配合 Shiki 提供明暗双主题
- **数学公式渲染**：基于 KaTeX，支持题解中的 LaTeX 公式
- **多 OJ 支持**：通过可插拔的 OJ 适配器扩展评测平台
- **纯静态生成**：基于 Astro 构建，全站静态输出，零运行时依赖

## 快速开始

要求：Node.js ≥ 24，pnpm ≥ 11（本仓库使用 pnpm workspace）。

```bash
pnpm install    # 安装依赖
pnpm dev        # 本地开发，默认 http://localhost:4321
pnpm build      # 类型检查（astro check）+ 生产构建，输出到 dist/
pnpm preview    # 本地预览生产构建
```

## 如何添加题目

1. 在 `src/content/problems/<oj>/<pid>/index.md` 新建文件
2. frontmatter 需符合 `src/content.config.ts` 中的 schema（`oj`、`pid`、`title` 为必填）
3. 正文建议按「数据规模 / 思路 / 复杂度 / 仓颉实现」组织，仓颉代码使用 `cangjie` 语言标记，公式使用 KaTeX 语法
4. 本地 `pnpm dev` 验证页面，提交前运行 `pnpm build` 保证类型检查通过

### 按需折叠代码

完整仓颉实现默认用 `<details>` / `<summary>` 包裹并折叠，正文中的短代码片段按需决定是否折叠。摘要文字可自定义：

````markdown
<details>
<summary>查看仓颉实现</summary>

```cangjie
main() {
    println("Hello, Cangjie!")
}
```

</details>
````

保留代码块前后的空行以正确解析 Markdown。未包裹的代码块正常展示；在 `<details>` 上添加 `open` 属性可默认展开。

## 如何新增 OJ

在 `src/adapters/` 下新建 `<oj>.ts`，用 `defineOjAdapter` 导出一个 `OjAdapter` 实现（`id`、`displayName`、`normalizeId`、`validateId`、`problemUrl` 为必填，`fetchMetadata` 可选）。无需手动注册，registry 会自动发现。

## 技术栈

- [Astro](https://astro.build/) 7 + TypeScript（严格模式）
- [Tailwind CSS](https://tailwindcss.com/) 4（Vite 插件方式）
- [Shiki](https://shiki.style/) 语法高亮 + 自定义仓颉 grammar
- [KaTeX](https://katex.org/) 数学公式
- [pnpm](https://pnpm.io/) 包管理
