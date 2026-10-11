# Uagray Token 工程映射

设计含义、合法外观和组合规则统一见 [设计参考规范与开发指南](design-system.md)。本文只记录变量、消费位置与工程接入，不另设视觉规则。

## 值来源与分类

唯一值来源是 `src/ui/tokens.css`。基础变量提供尺度，语义别名表达用途；展示站 `src/token-practice.tsx` 读取实际 CSS 值，不维护第二份数值表。调整同一角色时修改值来源或角色映射，不逐组件覆盖。

| 类别       | 基础变量                                                                             | 主要语义别名                                                                     |
| ---------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Color      | gray-* 与状态色                                                                      | background、surface、raised、control、body、muted、disabled、action 与 on-action |
| Typography | font、mono、font-size-_、font-weight-_、line-height-*                                | label、control-value、status-title、reading-*                                    |
| Space      | space-0…12                                                                           | gap-control、gap-stack、padding-control、padding-panel                           |
| Radius     | radius-0…5、radius-full                                                              | radius-sm、radius-control、radius-card、radius-surface                           |
| Size       | size-control-sm、size-control、size-control-lg、size-icon-*、size-choice、size-thumb | size-content、size-dialog、size-drawer、size-scrollbar                           |

Space 编号表示尺度顺序，不表示编号乘以 4。Size 与 Space 分开定义，修改间距不应意外改变控件高度。圆角按 [组合几何契约](design-system.md#圆角与组合几何契约)用现有尺度及实际 inset 派生；Motion 读取同一个 CSS 局部变量，不重复维护数值。

## 环境变量映射

环境容器重新指向语义变量；组件读取语义入口，不直接写基础环境色。

| 消费入口                       | 页面                                                | 灰色区域                                      | 白色层                                      |
| ------------------------------ | --------------------------------------------------- | --------------------------------------------- | ------------------------------------------- |
| control / control-hover        | control-on-background / control-hover-on-background | control-on-surface / control-hover-on-surface | control-on-raised / control-hover-on-raised |
| selected                       | 当前 control                                        | 当前 control                                  | 当前 control                                |
| success-fill / danger-fill     | 对应状态 surface                                    | 对应 surface-on-gray                          | 对应状态 surface                            |
| region / region-hover          | surface / surface-hover                             | raised / raised-hover                         | surface / surface-hover                     |
| region-control*、region-*-fill | 对应区块内部环境资源                                | 同左                                          | 同左                                        |

区块读取 region，并把 region-* 应用为子项的 control、selected 与状态填充。控件与区块的职责、合法嵌套及强调见 [环境与表面](design-system.md#环境与表面)。Slider 的 track、Switch 的 switch-surface 与 thumb 使用各自语义入口，不能用区块交替规则替代控件内部状态。

edge、elevation 分别定义内侧 1px 边缘与外侧投影；shadow 是其组合便利值，不授权每个对象同时使用。border-soft 可用于合法对象边缘或内容分隔；preview-border 保留为兼容别名。使用条件见 [边界语言](design-system.md#边界语言)。

旧 element、action-surface、reading-surface、object-surface、selected-surface、range-fill、choice-edge、group-hover、feedback-*-surface 已删除，宿主不得继续覆盖。

## 字体与图标入口

`uagray/fonts.css` 提供 IBM Plex Sans、Sans SC 的 400/500 和 JetBrains Mono 400，展示站与组件包使用同一份资源。中文保留官方 Unicode 分片；不注册 450，不使用 local() 替换包内资源。授权见 `fonts/licenses/`。宿主更换字体时不引入该入口，并覆盖 font / mono。

图标适配在 `src/ui/icons.tsx`，默认描边常量由该文件维护；使用官方包，不复制或修改 SVG。字体角色与状态重量规则见 [文字、图标与信息](design-system.md#文字图标与信息)。

## 动效与工程入口

CSS 与 `src/ui/motion.tsx` 使用同一组语义角色。具体设计规则与参数基线只在 [动效语言](design-system.md#动效语言)维护。

| CSS 入口         | Motion 工程映射                                                                    |
| ---------------- | ---------------------------------------------------------------------------------- |
| fast / press     | 颜色与释放 / 按压；内部 ui-pressable 通过原生 `:active` 共享反馈，不新增逐组件状态 |
| move / ease      | layoutTransition；位置、尺寸与选择标记                                             |
| enter / ease     | useUiMotion().enter；出现、展开与内容进入                                          |
| exit / ease-exit | useUiMotion().exit；离开、收起与内容退出                                           |
| reduced-fade     | motionTiming.reduced；减少动态效果下的必要淡化，布局 transition 为 0               |

ChangingText 使用两层短文本交接，最新内容参与布局和可访问名称；TransitionPanel 保留隐藏面板状态，退出时立即 inert；PresenceSurface 根据 Motion presence 管理退出内容的操作资格。它们是内部实现辅助，不新增公共组件 API。Dialog 保留原生模态生命周期，退出完成后关闭；遮罩使用原生 `::backdrop` 透明度过渡。Select 保留 Radix 定位和焦点职责，Motion 负责可见过渡，CSS 退出生命周期标记让 Radix 延迟卸载；标记不绘制运动。定位方向通过实际 data-side 映射，减少动态效果时取消位移。Radix 的生命周期依据见 [官方动画指南](https://www.radix-ui.com/primitives/docs/guides/animation)。

修改共享参数时同步 CSS 与 JS，并运行登记的映射检查；不能新增互相偏离的逐组件常量。

`src/ui/focus.ts` 维护键盘导航意图，不通过 blur 清理输入焦点。`src/ui/scrollbars.css` 使用 scrollbar-thumb、scrollbar-thumb-hover 与 size-scrollbar，适配需要内部滚动的字段、弹层与 ui-scroll-area；高对比模式保留系统颜色。展示工作台的滚动安排属于宿主，不全局覆盖所有元素。

## 主题接入

库以 `html[data-theme="dark"]` 启用暗色，默认浅色；color-scheme 同步原生控件。主题设在根元素，使 Portal 继承相同资源，不要求主题 Provider，也不整体反转基础灰阶。

展示站没有手动选择时跟随系统，切换后保存 uagray-theme 并停止跟随；存储受限时仍能在当前页面切换。首次渲染前应用主题，Token 示例在主题变化后重新读取 CSS 值，不引入全局主题过渡。

## 维护边界

设计决策更新主规范，数值调整更新 tokens.css，工程消费方式更新本文。几何定位、原生滑块命中范围及弹层定位等必要局部数值不机械抽成 Token；一个示例中的数字不足以建立全局尺度。展示页排布与代码生成见 [playground.md](playground.md)，发布入口见 [source-boundary.md](source-boundary.md)。
