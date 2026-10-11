# Uagray 工程架构

本文件描述工程边界，不另设设计规则。设计与组合统一依据 [设计参考规范与开发指南](design-system.md)，公共属性依据 [API 名单](api-contract.md)。

## 源码与依赖边界

- `src/ui/` 提供可复用组件、语义变量、图标适配与共享动效，不导入展示站或本地消费项目。
- `src/App.tsx`、`src/app.css`、`src/playground*.ts*`、`src/api-panel.tsx`、`src/content-tree-editor.tsx` 与 `src/api-editors.tsx` 提供公开展示和调试工具，不进入组件包。
- `local/site/` 是 Git 忽略的本机入口，直接启动仓库里的公开展示站。`local/beta-consumer/` 是本机消费目录。远端用 `npm run verify:consumer` 安装当前打包结果并完成类型检查与生产构建。
- 公开案例页已删除，不恢复旧路由或依赖。`lab/` 是随 Git 维护的内部产品原型，独立 Vite 开发入口直接消费 `src/ui/`，不进入公开站依赖图、组件包或部署产物。

按实际交互与维护职责拆文件，不要求每个组件一个目录，不引入多包工作区。一个包、少量共享语义变量、原生 CSS 与必要交互基础即可支撑当前规模。

React 19 由宿主提供；Framer Motion 处理现有布局与交互，Radix 提供 Select 的无样式焦点和定位，React Aria 支撑取色交互，Uplus Icon 提供官方图标。不要为简单排列或颜色反馈新增依赖。

## 构建与消费

展示站由 vite.config.ts 构建到 dist-site；组件库由 vite.lib.config.ts 与 tsconfig.lib.json 构建到 dist，包含 ESM、类型声明、样式和字体入口。package.json 的 exports、types、files 与依赖声明是实际打包契约，不在文档中另列一套未来接口。

宿主从 uagray 导入组件，显式导入 uagray/styles.css；需要配套字体时导入 uagray/fonts.css。不复制展示页、字体路径或本地调试源码到宿主。

样式作用于本库组件及其语义资源，不修改宿主无关元素的字体、盒模型或动效。组件状态不依赖特定 router、业务事件总线或全局 Provider。

## 验证与维护

按改动运行类型检查和必要定向测试；库入口或打包变更才进行相关产物/消费检查。浏览器和大规模兜底验证须用户授权。源码检查不证明实际字体、焦点、色差或动画已经验收；SSR、多框架与复杂数据模块按真实接入需求另行确认。

工程扩展优先解决真实复用障碍，不按历史评估表自动实施所有待办。需求驱动与候选顺序见 [组件演进](component-roadmap.md)，源码范围见 [source-boundary.md](source-boundary.md)，发布见 [beta-release.md](beta-release.md)。npm 发布只通过仓库 publish 工作流，不在本机 npm publish。

文本体例集中在 `src/ui/typography.tsx` 与 `typography.css`，通过公共入口导出 Heading、Text、TextList、DescriptionList。展示配置和压力页消费同一实现，不维护页面内的第二套基础排版。
