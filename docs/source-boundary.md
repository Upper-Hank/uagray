# 源码推送边界

远端保留组件库和展示站。展示站提供规范、Token、组件目录、可交互组件预览、API 配置和由当前配置生成的用法。案例页面与入口已全部删除，不再恢复。

API 调试实现位于 `src/playground.tsx`、`src/playground-catalog.ts`、`src/playground-code.ts`、`src/api-panel.tsx` 与 `src/options-editor.tsx`，由公开展示站直接使用，不进入组件包。`local/site/` 仍由 Git 忽略，只保留本机入口并转引上述源码；`local/beta-consumer/` 继续保留独立消费验证，不进入远端。

`npm run dev` 运行公开展示站，`npm run build` 输出到 `dist-site/`。`npm run build:lib` 输出 ESM、类型声明、组件样式和 `fonts.css` 到 `dist/`。组件包收录 `dist/fonts/` 中的界面字体，不收录展示站。React 与 React DOM 由宿主提供。

首次提交已经包含未完成页面。案例页已从当前源码删除。API 配置随展示站保留在当前源码中，不使用强制推送改写历史。
