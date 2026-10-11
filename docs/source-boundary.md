# 源码推送边界

远端保留组件库和展示站。展示站提供规范、Token、组件目录、可交互组件预览、API 配置和由当前配置生成的用法。公开案例页面与入口已删除，不恢复公开案例入口。内部产品原型位于 `lab/`，源码随 Git 保存，不部署。

API 调试实现位于 `src/playground.tsx`、`src/playground-catalog.ts`、`src/playground-code.ts`、`src/api-panel.tsx` 与 `src/options-editor.tsx`，由公开展示站直接使用，不进入组件包。`local/site/` 仍由 Git 忽略，只作为启动公开展示站的本机入口，不再保存第二套页面、样式或字体。`local/beta-consumer/` 继续保留本机消费目录，不进入远端；可复现的安装验证是 `npm run verify:consumer`。

`npm run dev` 运行公开展示站，`npm run build` 输出到 `dist-site/`。`npm run build:lib` 输出 ESM、类型声明、组件样式和 `fonts.css` 到 `dist/`。组件包收录 `dist/fonts/` 中的界面字体，不收录展示站。React 与 React DOM 由宿主提供。

首次提交已经包含未完成页面。旧公开案例页已从当前源码删除。API 配置随展示站保留在当前源码中，不使用强制推送改写历史。

## 内部产品原型

`lab/` 使用 `vite.lab.config.ts` 独立启动，`npm run dev:lab` 仅监听 `127.0.0.1`，默认端口 5174，被占用时自动选择后续可用端口。实验室直接导入 `src/ui/`，不被公开站入口与库入口导入；不新增公开路由。独立配置拒绝构建，公开站仍仅从根 `index.html` 构建到 `dist-site/`，组件包仍由 `files` 白名单控制。

内部根入口保留项目原型，`/anish/` 提供作品展厅，`/github/` 提供仓库问题管理，`/vercel/` 提供项目设置，`/prototypes/` 提供四题的独立选题目录；这些入口全部位于 `lab/` 内，不进入公开站。

选题、业务操作与差距记录见 [内部原型](../lab/README.md)。实验室纳入类型检查，交互测试使用 `npx vitest run lab`，设计检查登记了任务行外高与上下 inset、工具行间距与换行、交互作品宿主 inset / 圆角关系、问题列表行外高 / inset，以及设置保存行间距 / 换行。
