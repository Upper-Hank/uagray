# Uagray 项目规范

## 产品目标

构建供其他项目复用的轻量设计系统。优先简洁、视觉气质一致和有实际用途的组件扩充。展示页是组件示例，不是核心产品。

最初从 anish’s lab 学习气质与部分设计细节。后续依据 Uagray 自身的设计原则和实际需求独立展开，不以原站组件清单、尺寸或布局为固定边界；必要时重新设计。

## 工程边界

- `src/ui/`：可复用组件、图标适配、tokens 与组件样式。
- `src/App.tsx`、`src/app.css`、`src/component-preview.tsx`：公开展示页，保留规范、Token 与可交互组件预览，不包含案例入口或 API 调试配置。
- `local/site/`：保留完整 API 调试、案例及相关页面测试，由 Git 忽略；不让组件库或公开展示页依赖它们。
- `vite.config.ts`：展示站构建至 `dist-site/`。
- `vite.lib.config.ts`、`tsconfig.lib.json`：组件包构建与类型声明至 `dist/`；产物由 `package.json` 白名单控制。
- `docs/source-boundary.md`：源码推送范围与本地目录约定。
- `docs/playground.md`：单件实践、API 配置、代码生成和输入焦点契约。
- `docs/tokens.md`：五类 Token 的尺度、别名与消费契约。
- `docs/design-system.md`：视觉规则与组件契约。
- `docs/component-roadmap.md`：扩充准则和待办顺序。
- `docs/component-batch.md`：本次需求来源、新增 API 与动效契约。
- `docs/architecture.md`：轻量设计系统架构、当前缺口及实施顺序。
- 图标采用与 uplus-ui 一致的 `@uplus-icon/react`；不得复制参考站 SVG 或自行修改上游 SVG。
- 用户已授权 Framer Motion 处理布局与交互动效，统一配置在 `src/ui/motion.tsx`；纯颜色反馈保持 CSS，并支持减少动态效果。
- Select 使用 `@radix-ui/react-select` 无样式基础处理焦点与定位，API 为 `onValueChange(value)` 与 trigger button ref；其他字段保留原生语义。
- 优先使用原生语义、组件组合与 CSS。避免为简单需求新增依赖或过多变体。
- 展示条目尽量为单件，基础 API 配置与实例及代码同步；组件预览与教学示例默认直接使用灰色承载，不套白底描边画布；独立编辑画布按任务选择表面，暗色使用对应主题环境。字段只在 Tab 定位时显示轻量提示，不能取消真实输入焦点。
- 新组件按实际复用需求独立设计，维护统一灰阶、留白、圆角与反馈规则。
- 颜色遵循 `docs/surface-contract.md` 的环境契约：组件声明意图，控件读取 control，区块读取 region 并建立子项环境；区块不嵌套。Button 使用 emphasis 与 tone，旧 variant 仅作兼容。
- 界面与正文使用 400，标题使用 500；交互状态不改变字重。
- 复杂需求先明确用户意愿，提出方案后执行；路线图不是对全部待办的实施授权。

## 发布与部署

- 后续 npm 发布必须通过 `.github/workflows/publish.yml`，不得在本机执行 `npm publish`。
- 版本标签必须匹配 package.json，且提交来自 main；beta 发布到 beta，正式版本发布到 latest。
- Vercel 展示页使用 `vercel.json` 中的 `dist-site/`；组件库产物 `dist/` 不用于站点部署。

## 验证

遵守用户要求：浏览器相关工具/技能及大规模兜底验证须先获得用户同意。默认使用类型检查与必要的定向交互测试。纯文档变更不运行构建或测试。

## 来源

如实保留设计参考说明，避免宣称参考站的整体视觉为原创；不引入其品牌标识、作品或作者身份作为本系统内容。
