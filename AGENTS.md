# AGENTS.md

本文件为在本仓库中工作的 AI 编码助手提供指引。开始任何任务前，请先完整阅读本文件。

## 项目概览

Awesome Cangjie Competitive 是一个用仓颉语言刷竞赛题的开源站点：

- 技术栈：Astro 7 + TypeScript + Tailwind CSS 4（Vite 插件）+ Shiki + KaTeX
- 包管理器：pnpm（pnpm workspace）
- 构建输出目录：`dist/`，勿手动提交

## 常用命令

```bash
pnpm dev        # 本地开发
pnpm build      # 类型检查（astro check）+ 生产构建
pnpm preview    # 预览生产构建
pnpm astro      # 直接调用 astro CLI
```

修改代码后建议运行 `pnpm build` 确认类型检查与构建通过。

## 依赖管理（重要）

- **禁止手动在 `package.json` 中编写或修改依赖的版本号。**
- 安装新依赖一律使用 `pnpm add <pkg>`（运行时依赖）或 `pnpm add -D <pkg>`（开发依赖），由 pnpm 负责写入正确的版本范围并更新 `pnpm-lock.yaml`。
- 卸载依赖使用 `pnpm remove <pkg>`。
- 不要手动编辑 `pnpm-lock.yaml`，对 lockfile 的任何更新都必须通过 pnpm 命令完成。
- 引入新依赖前，先确认是否真的必要，以及是否有更合适的替代方案。

## 目录结构

- `src/content/problems/<oj>/<pid>/index.md`：题目内容集合，frontmatter schema 定义在 `src/content.config.ts`
- `src/adapters/`：OJ 适配器。`types.ts` 定义 `OjAdapter` 接口，`registry.ts` 通过 `import.meta.glob` 自动发现并注册，新增适配器无需手动注册
- `src/grammars/cangjie.json`：仓颉语言语法高亮 grammar，供 Shiki 使用（别名为 `cangjie` / `cj`）
- `src/lib/`：题目视图转换（`problem.ts`）、git 提交日期（`gitDate.ts`）等工具
- `src/layouts/`、`src/components/`、`src/pages/`：Astro 布局、组件与路由

## 内容约定

新增题目：

1. 在 `src/content/problems/<oj>/<pid>/index.md` 创建文件。frontmatter 必须满足 `src/content.config.ts` 的 schema：必填 `oj`、`pid`、`title`；可选 `difficulty`、`tags`、`timeLimit`、`memoryLimit`、`sourceUrl`、`date`（不填时自动回退到 git 提交日期）。
2. `oj` 必须与 `src/adapters/` 中已注册的适配器 id 一致；未注册的 OJ 会在 `assertOjRegistered` 处抛错。
3. 题解正文建议按「数据规模 / 思路 / 复杂度 / 仓颉实现」组织。仓颉代码块使用 ` ```cangjie ` 语言标记，数学公式使用 KaTeX（`$...$` 行内、`$$...$$` 块级）。

新增 OJ：

- 在 `src/adapters/` 新建 `<oj>.ts`，用 `defineOjAdapter` 导出实现。必填字段：`id`、`displayName`、`normalizeId`、`validateId`、`problemUrl`；可选：`fetchMetadata`。

## 代码风格

- TypeScript 严格模式（`astro/tsconfigs/strict`），类型不通过不允许提交。
- 组件使用 Astro；样式走全局 CSS 变量（如 `--text`、`--text-dim`、`--border`），支持明暗主题。
- 移除无用代码与注释，保持代码整洁。
- 提交信息遵循 Conventional Commits（如 `feat:` / `fix:` / `refactor:` / `docs:`），描述使用中文。

## 其他

- 线上站点：https://competitive.awesomecangjie.com
- 环境要求：Node.js ≥ 24，pnpm ≥ 11
