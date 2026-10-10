# 源码推送边界

远端保留组件库和展示站。展示站提供规范、Token、组件目录、可交互组件预览及静态用法示例。案例页面与入口已全部删除；API 属性配置面板、Slider 调试工具和动态代码生成暂不进入远端源码。

组件展示与 API 调试实现保存在 Git 忽略的 `local/site/`，仍可使用 `npm --prefix local/site run dev` 查看。公开展示页不导入该目录；示例目录只包含初始示例数据和静态用法代码，不包含配置控件元数据。

`npm run dev` 运行公开展示站，`npm run build` 输出到 `dist-site/`。`npm run build:lib` 输出 ESM、类型声明和 CSS 到 `dist/`；`npm pack` 自动构建组件包，包文件白名单不会收录展示站及其字体。React 与 React DOM 由宿主提供。

首次提交已经包含未完成页面。本轮普通提交保证远端最新版本排除这些页面和配置，保留既有 Git 历史，不使用强制推送。
