export const statuses = [
  { value: "backlog", label: "待规划" },
  { value: "todo", label: "待处理" },
  { value: "progress", label: "进行中" },
  { value: "done", label: "已完成" },
] as const;
export const priorities = [
  { value: "urgent", label: "紧急" },
  { value: "high", label: "高" },
  { value: "normal", label: "普通" },
  { value: "low", label: "低" },
] as const;
export const members = [
  { value: "none", label: "未分配" },
  { value: "lin", label: "林乔" },
  { value: "chen", label: "陈序" },
  { value: "zhou", label: "周宁" },
];
export const labels = [
  { value: "feature", label: "功能" },
  { value: "design", label: "设计" },
  { value: "bug", label: "缺陷" },
  { value: "infra", label: "工程" },
];
export const projects = [
  {
    id: "portal",
    name: "客户门户 2.0",
    summary: "让客户在一个地方管理订阅、查看使用情况，并与团队保持同步。",
    lead: "林乔",
    target: "2026-11-06",
    milestones: ["基础体验", "内测发布", "正式上线"],
  },
  {
    id: "mobile",
    name: "移动端体验",
    summary: "完善移动端核心操作，帮助客户随时掌握项目进展。",
    lead: "周宁",
    target: "2026-11-20",
    milestones: ["交互梳理", "体验验证", "正式上线"],
  },
];
export type Task = {
  id: number;
  project: string;
  title: string;
  description: string;
  status: (typeof statuses)[number]["value"];
  priority: (typeof priorities)[number]["value"];
  assignee: string;
  label: string;
  due: string;
  milestone: string;
  comments: { id: string; text: string; author: string }[];
};
export type Scope = "project" | "mine" | "all";
export const storageKey = "uagray-project-prototype-v1";
const titles = [
  "完成工作空间导航与页面结构",
  "梳理客户首次登录的引导流程",
  "接入订阅与账单摘要",
  "支持成员邀请与权限管理",
  "修复长组织名称在导航中溢出的问题",
  "为使用量明细增加日期筛选",
  "完善空工作空间的引导内容",
  "整理客户通知的发送规则",
  "统一发票下载与历史记录入口",
  "支持导出月度使用量报告",
  "优化组织切换后的加载反馈",
  "完成订阅升级的确认流程",
  "建立核心页面的键盘操作路径",
  "补齐账户停用与恢复的操作说明",
  "验证小屏幕上的任务详情与属性排列",
  "完成客户门户内测发布清单",
  "整理移动端导航层级",
  "完成移动端消息列表",
  "优化窄屏表单的输入与校验",
  "支持移动端项目进度查看",
];
export function initialTasks(): Task[] {
  return titles.map((title, index) => ({
    id: 101 + index,
    project: index < 16 ? "portal" : "mobile",
    title,
    description:
      index === 4
        ? "客户的组织名称可能包含较长的英文标识符。\n\n在导航与组织切换入口保留完整名称的访问方式，同时确保主要操作在窄宽下仍然可见。\n\n验收：长中文名称、连续英文标识符和移动端宽度均可正常操作。"
        : "目标\n" +
          title +
          "，保持客户操作路径清晰。\n\n验收标准\n• 正常流程可以完成\n• 空内容与异常输入有明确反馈\n• 键盘操作能够到达主要动作",
    status: (["done", "progress", "todo", "backlog"] as const)[index % 4],
    priority: (["normal", "high", "normal", "low", "urgent"] as const)[
      index % 5
    ],
    assignee: ["lin", "chen", "zhou", "none"][index % 4],
    label: index === 4 ? "bug" : ["design", "feature", "infra"][index % 3],
    due: index % 3 === 0 ? "2026-10-23" : "",
    milestone:
      index < 16
        ? projects[0].milestones[index % 3]
        : projects[1].milestones[index % 3],
    comments:
      index === 4
        ? [
            {
              id: "seed",
              author: "陈序",
              text: "需要同时检查名称很长且操作按钮较多的情况，避免只对单个标题做截断。",
            },
          ]
        : [],
  }));
}
export function taskLabel(
  value: string,
  options: readonly { value: string; label: string }[],
) {
  return options.find((option) => option.value === value)?.label ?? value;
}
export function filterTasks(
  tasks: Task[],
  scope: Scope,
  project: string,
  query: string,
  status: string,
  assignee: string,
) {
  const search = query.trim().toLowerCase();
  return tasks.filter(
    (task) =>
      (scope !== "project" || task.project === project) &&
      (scope !== "mine" || task.assignee === "lin") &&
      (!search ||
        `${task.title} ATL-${task.id} ${task.description}`
          .toLowerCase()
          .includes(search)) &&
      (status === "all" || task.status === status) &&
      (assignee === "all" || task.assignee === assignee),
  );
}
export function readTasks(raw: string | null): Task[] {
  if (!raw) return initialTasks();
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data) || data.length > 5000) return initialTasks();
    const valid = data.every(
      (task: Task) =>
        task &&
        Number.isSafeInteger(task.id) &&
        task.id > 0 &&
        projects.some((project) => project.id === task.project) &&
        [task.title, task.description, task.due, task.milestone].every(
          (value) => typeof value === "string",
        ) &&
        task.title.trim().length > 0 &&
        statuses.some((option) => option.value === task.status) &&
        priorities.some((option) => option.value === task.priority) &&
        members.some((option) => option.value === task.assignee) &&
        labels.some((option) => option.value === task.label) &&
        projects
          .find((project) => project.id === task.project)!
          .milestones.includes(task.milestone) &&
        (!task.due || /^\d{4}-\d{2}-\d{2}$/.test(task.due)) &&
        Array.isArray(task.comments) &&
        task.comments.every(
          (comment) =>
            comment &&
            [comment.id, comment.text, comment.author].every(
              (value) => typeof value === "string",
            ),
        ),
    );
    return valid && new Set(data.map((task) => task.id)).size === data.length
      ? data
      : initialTasks();
  } catch {
    return initialTasks();
  }
}
