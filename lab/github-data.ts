export type Issue = {
  id: number;
  title: string;
  body: string;
  state: "open" | "closed";
  author: string;
  assignee: string;
  labels: string[];
  milestone: string;
  created: string;
  comments: { id: string; author: string; text: string }[];
};
export const issueLabels = [
  { value: "bug", label: "bug", description: "需要修复的异常行为" },
  { value: "enhancement", label: "enhancement", description: "新增或改进功能" },
  {
    value: "accessibility",
    label: "accessibility",
    description: "键盘与辅助技术体验",
  },
  {
    value: "documentation",
    label: "documentation",
    description: "使用说明与接入文档",
  },
];
export const issueMembers = [
  { value: "none", label: "未分配" },
  { value: "lin", label: "林乔" },
  { value: "chen", label: "陈序" },
  { value: "zhou", label: "周宁" },
];
export const milestones = [
  { value: "none", label: "无里程碑" },
  { value: "beta", label: "Beta 发布" },
  { value: "1.0", label: "1.0 正式版" },
];
export const issuesKey = "uagray-issues-prototype-v1";
export function initialIssues(): Issue[] {
  const titles = [
    "长组织名称导致顶部导航的主要操作被遮挡",
    "为成员邀请增加过期提示",
    "无法通过键盘访问筛选后的列表项",
    "补充工作空间权限的接入说明",
    "支持按负责人过滤订阅变更记录",
    "空结果页面应保留清除筛选入口",
    "移动端弹窗中的描述文字没有完整换行",
    "改进账单明细的排序与分页",
    "修复切换组织后保留旧成员选项的问题",
    "为新建项目添加标题长度检查",
    "整理环境变量的使用示例",
    "增加账户停用操作的确认步骤",
  ];
  return titles.map((title, index) => ({
    id: 284 + index,
    title,
    body: `背景\n${title}。\n\n预期表现\n主要内容与操作保持可读、可达；状态变化可以理解。\n\n复现步骤\n1. 进入客户门户\n2. 使用相应入口\n3. 检查当前结果`,
    state: index % 4 === 3 ? "closed" : "open",
    author: index % 2 ? "chen" : "lin",
    assignee: ["chen", "lin", "none", "zhou"][index % 4],
    labels: [issueLabels[index % 4].value, ...(index === 2 ? ["bug"] : [])],
    milestone: index % 3 === 0 ? "beta" : "1.0",
    created: "2026-10-09",
    comments:
      index === 0
        ? [
            {
              id: "seed",
              author: "chen",
              text: "名称包含连续英文标识符时也能复现，需要保留长内容的访问方式。",
            },
          ]
        : [],
  }));
}
export function readIssues(raw: string): Issue[] {
  const data: unknown = JSON.parse(raw);
  if (
    !Array.isArray(data) ||
    !data.every(
      (item: Issue) =>
        item &&
        Number.isSafeInteger(item.id) &&
        item.id > 0 &&
        typeof item.title === "string" &&
        item.title.trim() &&
        typeof item.body === "string" &&
        ["open", "closed"].includes(item.state) &&
        ["lin", "chen", "zhou"].includes(item.author) &&
        issueMembers.some((option) => option.value === item.assignee) &&
        milestones.some((option) => option.value === item.milestone) &&
        typeof item.created === "string" &&
        Array.isArray(item.labels) &&
        item.labels.every((label) =>
          issueLabels.some((option) => option.value === label),
        ) &&
        Array.isArray(item.comments) &&
        item.comments.every(
          (comment) =>
            comment &&
            [comment.id, comment.text, comment.author].every(
              (value) => typeof value === "string",
            ),
        ),
    ) ||
    new Set(data.map((item) => item.id)).size !== data.length
  )
    throw new Error("Invalid issue data");
  return data;
}
export function matchIssue(issue: Issue, query: string) {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((token) => {
      if (!token || token === "is:issue") return true;
      const [key, value] = token.split(":");
      if (key === "is" || key === "state") return issue.state === value;
      if (key === "label") return issue.labels.includes(value);
      if (key === "assignee")
        return issue.assignee === (value === "@me" ? "lin" : value);
      if (key === "author")
        return issue.author === (value === "@me" ? "lin" : value);
      return `${issue.title} ${issue.body} #${issue.id}`
        .toLowerCase()
        .includes(token);
    });
}
export function issueHref(id?: number) {
  return id === undefined ? "/github/#/" : `/github/#/issues/${id}`;
}
export function issueRoute(hash: string) {
  const value = hash.match(/^#\/issues\/(\d+)$/)?.[1];
  return value ? Number(value) : null;
}
