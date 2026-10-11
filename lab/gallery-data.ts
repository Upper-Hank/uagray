export type Piece = {
  id: string;
  title: string;
  category: "component" | "tool";
  aspect: number;
  summary: string;
  about: string;
  features: string[];
  components: string[];
};
export const pieces: Piece[] = [
  {
    id: "pulse",
    title: "进度面板",
    category: "component",
    aspect: 1.08,
    summary: "把目标、完成量和下一步放在一起，让进度变化有清楚的上下文。",
    about:
      "一个用于短期项目的进度面板。输入完成量，进度和状态会同步变化；完成目标后可以开始下一轮。信息与操作共享阅读轴，不必为每个数值建立独立卡片。",
    features: ["目标与完成量", "状态随数据变化", "开始下一轮"],
    components: ["Progress", "NumberInput", "Badge", "ButtonGroup"],
  },
  {
    id: "reading",
    title: "阅读便笺",
    category: "component",
    aspect: 0.88,
    summary: "为一段连续内容安排标题、正文和阅读尺度，让文字保持自己的节奏。",
    about:
      "一张可调整阅读尺度的便笺。选择紧凑、标准或宽松字号，正文即时响应。工具仅影响内容呈现，正文仍然可以选择与复制。",
    features: ["连续正文", "三种阅读尺度", "复制内容"],
    components: ["SegmentedControl", "CopyButton", "ButtonGroup"],
  },
  {
    id: "palette",
    title: "调色工作室",
    category: "tool",
    aspect: 1.3,
    summary: "从一个基准色开始，调整颜色并查看色样，复制可直接使用的颜色值。",
    about:
      "为单个颜色提供完整编辑路径。色样是真实内容，可以使用彩色；外围操作仍保持统一灰阶。编辑器使用 Uagray 的现有 ColorPicker，不另写一套颜色字段。",
    features: ["颜色直接编辑", "即时色样", "复制颜色值"],
    components: ["ColorPicker", "CopyButton", "Button"],
  },
  {
    id: "focus",
    title: "专注计时",
    category: "tool",
    aspect: 1.04,
    summary: "为一段专注时间设定长度，开始、暂停或重新计时。",
    about:
      "一个本地运行的倒计时器。计时以结束时间计算，浏览器短暂挂起后继续按经过的时间校准；离开页面会取消计时。暂停保留剩余时间，重置回到所选时长。",
    features: ["选择时长", "暂停与继续", "重置计时"],
    components: ["Select", "Progress", "ButtonGroup"],
  },
  {
    id: "profile",
    title: "成员名片",
    category: "component",
    aspect: 1.25,
    summary: "用最少的信息描述一个成员，以及当下是否适合发起协作。",
    about:
      "成员身份、职责和可用状态组成一个完整信息单元。切换成员不会增加装饰层，可协作状态由开关控制并直接反映在名片中。",
    features: ["成员切换", "可协作状态", "复制联系信息"],
    components: ["Select", "Switch", "Badge", "CopyButton"],
  },
  {
    id: "checklist",
    title: "发布清单",
    category: "tool",
    aspect: 0.9,
    summary: "把发布前的检查变成一份可编辑的清单，逐项完成并保留进度。",
    about:
      "一个轻量的清单编辑器。添加事项、勾选完成或清除已完成项，每次操作都改变实际内容；计数与进度由当前清单计算，不模拟额外的成功提示。",
    features: ["新增事项", "逐项完成", "清除完成项"],
    components: ["Input", "Checkbox", "Progress", "ButtonGroup"],
  },
];
export function pieceHref(id?: string) {
  return id ? `/anish/#/piece/${id}` : "/anish/#/";
}
export function readPieceId(hash: string) {
  return hash.startsWith("#/piece/") ? hash.slice("#/piece/".length) : null;
}
export function findPieces(query: string, category: string) {
  const search = query.trim().toLowerCase();
  return pieces.filter(
    (piece) =>
      (category === "all" || piece.category === category) &&
      `${piece.title} ${piece.summary} ${piece.components.join(" ")}`
        .toLowerCase()
        .includes(search),
  );
}
