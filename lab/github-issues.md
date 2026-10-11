# 第三题：GitHub Issues

## 来源与范围

参考 GitHub 官方的 [Issues 查询与筛选说明](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/filtering-and-searching-issues-and-pull-requests)，承接仓库、问题列表、问题详情、标签和里程碑的信息关系。原型名为 Forge，仓库与问题均为虚构内容，不加载 GitHub 品牌、素材或服务。

官方说明用于确认任务模型，不证明已完成原站视觉对齐。页面视觉遵循 Uagray 主规范，代码只在内部 `lab/`。

## 组件与任务

| 页面职责 | 组件与宿主处理 |
| --- | --- |
| 仓库分区 | Tabs；宿主切换问题、标签、里程碑与 Readme |
| 查询与筛选 | SearchField、Select；宿主处理状态、标签、成员、排序与结果计数 |
| 问题列表 | 原生列表与链接、Checkbox、Badge、Icon；链接进入可直接访问的详情 |
| 批量状态操作 | SelectionBar、Button；只更新当前选择，筛选变化清空选择 |
| 新建与属性编辑 | Dialog、Field、Input、Textarea、Select、Checkbox |
| 讨论与状态 | 原生表单、Textarea、Button；评论和属性独立更新 |
| 本机保存异常 | Alert；实际写入失败才显示 |

问题行以 36px 控件加上下各 16px inset 派生 68px 最低外高，定向源码检查登记此关系。没有为该题扩充库 API 或引入依赖。

## 已实现与差距

查询支持普通文本 / 编号、`is:issue`、`is:` / `state:open|closed`、`label:`、`assignee:`、`author:` 与 `@me`；空格分隔条件取交集。没有实现 GitHub 的完整查询语言、引号、布尔表达式或查询补全。

问题可创建、编辑、评论、关闭与重开；负责人、标签与里程碑立即保存，正文编辑显式保存或取消。标签与里程碑分区提供信息目录和筛选入口，没有新增 / 编辑这些仓库配置。Readme 为静态内容。

正文与评论使用纯文本，缺少 Markdown、附件、引用和编辑历史。成员选择使用现有 Select，没有可搜索的成员菜单。讨论按原生段落排列，没有时间线活动组件。数据保存在本机，不包含权限、通知、多人同步或服务端分页。上述差距区分宿主功能范围与组件能力，不自动授权扩充整个组件库。

定向测试覆盖限定符筛选、筛选后批量操作范围、新建校验与详情路由、评论和重开。真实键盘焦点、窄屏密度、长标题和列表视觉仍需用户授权后进行浏览器观察；当前未进行浏览器验收。
