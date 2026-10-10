# API 调试优化方案

状态：2026-10-10 用户已选择固定配置区并完成本地实施。本文保留调研与设计决策，现行实施契约见 [playground.md](playground.md)。本轮未修改公共组件的 Props 与事件契约。

## 目标与范围

优化 `local/site/` 的组件调试、配置元数据与用法生成。继续以 `src/ui/` 的公开 Props 为能力依据，不将调试工具打入组件包，不新增案例页。公开展示站仍只保留规范、Token、预览和静态用法。本轮不引入 Storybook 或运行时 TypeScript 反射，不批量修改公共组件事件名称。

## 官方参考与取舍

- [Storybook Controls](https://storybook.js.org/docs/essentials/controls)：根据参数提供可编辑控件，可显式指定类型、条件显示，复杂值通过映射和 render 转换。借鉴元数据驱动及条件显示，不要求每个参数都有编辑器。
- [Storybook ArgTypes](https://storybook.js.org/docs/api/arg-types)：通过参数元数据描述控制器、类型与文档信息。借鉴真实类型与配置能力分开声明的做法。
- [Radix Button](https://www.radix-ui.com/themes/docs/components/button)：API Reference 明列 Prop、Type、Default，示例按能力展开。借鉴文档和调试分工，避免示例初值冒充组件默认值。
- [Carbon Button](https://www.carbondesignsystem.com/building-blocks/core/components/button/code)：网站提供精简 live demo，完整 controls 和 API 文档链接至 Storybook。保持 Uagray 公开展示与本地调试的现有源码边界。

以下布局与交互是针对 Uagray 的工程判断，不声称是上述系统的统一规范。

## 改造前的源码问题

1. catalog 的 `initial` 同时承担示例初值和编辑器类型推断；没有组件默认、必填、真实类型与短说明。
2. `action`、`lastDisabled` 等演示辅助项与真实 Props 混列。
3. 数组参数被简化成按行文本，事件与插槽缺少结构说明。
4. Button 配置仍消费旧 `variant`，不能直接调试新版 `emphasis/tone`。
5. 参数条件和合法值处理散落在预览 switch、配置器与生成器中，维护容易失配。
6. 原浮动面板同时管理参数编辑与窗口移动/缩放；本次按用户选择改为固定配置区。

## 调试契约

- 状态分为组件配置、示例配置与预览环境。环境切换只改变承载，不改属性值与生成代码。
- 元数据显式记录 scope、参数名、真实 type、required、componentDefault、exampleValue、control、options 与必要约束。可编辑类型不得仅靠初值推断。
- componentDefault 无默认时明确记录“无默认”；未传、空字符串、false 与 0 分别表达。重置恢复示例初值，名称为“重置示例”。
- 简短枚举使用现有 SegmentedControl；较多选项使用 Select；布尔 Switch；数字 NumberInput；短文本 Input，长文本按需展开 Textarea。不为统一外观给所有控件增加新变体。
- options/items 等数组采用保留真实字段含义的编辑方式，例如 label/value/disabled。Tabs 内容属于示例组合。复杂 ReactNode 与回调以签名、插槽说明及生成代码呈现，不伪装成普通字符串属性。
- 参数之间的条件和合法值在条目级规则中集中处理，预览与生成器共用转换结果。禁止在配置器中暗示公共组件支持不存在的参数。
- 当前 args 是实时状态的唯一来源；实例交互回写 args，配置修改更新实例。文本草稿可以暂存，但不能让代码与已提交配置长期不一致。
- 生成代码采用真实公开包导入与 CSS 入口，包含必需状态及回调；默认值可省略，显式的 false / 0 不丢失。不包含环境和面板布局状态、模拟计数或事件流水。
- 不默认添加事件日志、业务成功消息和额外状态旁注。真实错误与必要无障碍语义保留。

## 视觉与布局

已采用固定配置区，并按后续反馈嵌入同一个 Preview 容器：配置始终位于实例下方，分组内部采用响应式多栏，名称与控件同行，长文本与数组占整行，配置按内容自然展开，不设内部滚动。预览环境可切换，配置区独立保持白色层环境。旧浮动面板的拖动、缩放和窗口状态代码已移除。

每条配置保留原始参数名与编辑器；用户要求移除“契约”入口，类型与默认等信息仅保留在元数据中。展开编辑使用系统 Disclosure。优先呈现常用属性，复杂内容和低频配置渐进展开，不把每条属性做成卡片。编辑器消费环境 control，独立工具层按实际用途消费 raised；圆角遵循现行组合几何契约。

组件 Props 与示例配置有明确分组，环境与主题放在预览工具栏。用法代码由同一配置生成，可复制，默认收起，折叠不丢状态。

## 实施顺序与验收

1. 确认布局，修订 playground 规范和元数据契约。
2. 用 Button、Input、Slider、Select、Tabs 验证枚举、文本、数值约束、数组与插槽五类代表能力。
3. 按同一规则迁移全部条目，移除旧配置器重复分支；保留各组件必要的语义适配。
4. 完成类型检查与必要的定向测试：实例与配置同步、代码等价、条件显示、未传/false/0、约束及重置独立性。公共 API 不作未确认的破坏性迁移。

不自动启动浏览器验证或大规模兜底检查；视觉由用户在现有本地页面查看。
