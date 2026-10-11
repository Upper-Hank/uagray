import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  ColorPicker,
  CopyButton,
  Field,
  Heading,
  Text,
  Input,
  NumberInput,
  Progress,
  SegmentedControl,
  Select,
  Switch,
} from "../src/ui";

export const readingText =
  "好的工具会把复杂度留在自己内部，让使用者把注意力放在真正的事情上。\n\n一段内容可以依靠标题、行距和留白建立层次。当文字需要连续阅读时，共享一个清楚的阅读轴，往往比反复增加表面更有效。\n\n清楚并不意味着每处都需要强调。把操作放在需要它的地方，让反馈说明变化，让内容保留自己的节奏。";
export function PieceExperience({ id }: { id: string }) {
  switch (id) {
    case "pulse":
      return <Pulse />;
    case "reading":
      return <Reading />;
    case "palette":
      return <Palette />;
    case "focus":
      return <FocusTimer />;
    case "profile":
      return <Profile />;
    case "checklist":
      return <Checklist />;
    default:
      return null;
  }
}
function Pulse() {
  const [done, setDone] = useState(6);
  return (
    <div className="gallery-experience">
      <section className="gallery-progress-content">
        <Badge tone={done === 12 ? "success" : "neutral"}>
          {done === 12 ? "目标已完成" : "持续推进"}
        </Badge>
        <Heading>本周阅读计划</Heading>
        <p className="gallery-number">
          {done}
          <span> / 12 篇</span>
        </p>
        <Progress aria-label="阅读计划进度" value={done} max={12} />
      </section>
      <div className="gallery-tool-row">
        <Field><Field.Label>已读篇数</Field.Label><Field.Control>
          <NumberInput value={done} onValueChange={setDone} min={0} max={12}/>
        </Field.Control></Field>
        <ButtonGroup variant="plain" aria-label="阅读计划操作">
          <Button
            onClick={() => setDone((value) => Math.min(12, value + 1))}
            disabled={done === 12}
          >
            完成一篇
          </Button>
          <Button onClick={() => setDone(0)}>下一轮</Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
function Reading() {
  const [size, setSize] = useState("standard");
  return (
    <div className="gallery-experience">
      <article className={`gallery-reading gallery-reading--${size}`}>
        <small>随手记录 / 01</small>
        <Heading variant="page">留一点空间给内容</Heading>
        {readingText.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
      <div className="gallery-tool-row">
        <SegmentedControl aria-label="阅读尺度" value={size} onValueChange={setSize}>{[
    { value: "compact", label: "紧凑" },
    { value: "standard", label: "标准" },
    { value: "relaxed", label: "宽松" },
].map(item => <SegmentedControl.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}><SegmentedControl.Label>{item.label}</SegmentedControl.Label>{(item as { count?: number | string }).count != null ? <SegmentedControl.Count>{(item as { count?: number | string }).count}</SegmentedControl.Count> : null}</SegmentedControl.Item>)}</SegmentedControl>
        <CopyButton text={readingText}>复制便笺</CopyButton>
      </div>
    </div>
  );
}
function Palette() {
  const [color, setColor] = useState("#6B7F73");
  return (
    <div className="gallery-experience">
      <div className="gallery-color-layout">
        <div
          className="gallery-color-preview"
          role="img"
          aria-label={`当前色样 ${color}`}
          style={{ background: color }}
        />
        <ColorPicker
          aria-label="基准色"
          value={color}
          onValueChange={setColor}
        />
      </div>
      <div className="gallery-tool-row">
        <span className="gallery-color-value">{color}</span>
        <ButtonGroup variant="plain" aria-label="颜色操作">
          <CopyButton text={color} size="md">
            复制颜色
          </CopyButton>
          <Button onClick={() => setColor("#6B7F73")}>恢复基准色</Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export function FocusTimer() {
  const [minutes, setMinutes] = useState(15);
  const [remaining, setRemaining] = useState(900);
  const [deadline, setDeadline] = useState<number | null>(null);
  useEffect(() => {
    if (deadline === null) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) setDeadline(null);
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [deadline]);
  return (
    <div className="gallery-experience">
      <section className="gallery-timer">
        <Badge>
          {remaining === 0
            ? "本次专注结束"
            : deadline !== null
              ? "专注中"
              : remaining < minutes * 60
                ? "已暂停"
                : "准备开始"}
        </Badge>
        <Heading>留一段时间给重要的事</Heading>
        <p className="gallery-clock" aria-label={`剩余 ${remaining} 秒`}>
          {formatTime(remaining)}
        </p>
        <Progress
          aria-label="专注进度"
          value={minutes * 60 - remaining}
          max={minutes * 60}
        />
      </section>
      <div className="gallery-tool-row">
        <Select aria-label="专注时长" value={String(minutes)} disabled={deadline !== null} onValueChange={(value) => {
        const next = Number(value);
        setMinutes(next);
        setRemaining(next * 60);
    }}>{[
    { value: "1", label: "1 分钟" },
    { value: "15", label: "15 分钟" },
    { value: "25", label: "25 分钟" },
].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
        <ButtonGroup variant="plain" aria-label="计时操作">
          <Button
            emphasis="strong"
            onClick={() => {
              if (deadline !== null) {
                setRemaining(
                  Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
                );
                setDeadline(null);
              } else {
                const next = remaining || minutes * 60;
                setRemaining(next);
                setDeadline(Date.now() + next * 1000);
              }
            }}
          >
            {deadline !== null
              ? "暂停"
              : remaining < minutes * 60 && remaining > 0
                ? "继续"
                : "开始"}
          </Button>
          <Button
            onClick={() => {
              setDeadline(null);
              setRemaining(minutes * 60);
            }}
          >
            重置
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
const people = [
  { value: "lin", label: "林乔", role: "产品设计", email: "lin@example.com" },
  { value: "chen", label: "陈序", role: "前端工程", email: "chen@example.com" },
  { value: "zhou", label: "周宁", role: "交互设计", email: "zhou@example.com" },
];
function Profile() {
  const [person, setPerson] = useState("lin");
  const [available, setAvailable] = useState(true);
  const member = people.find((item) => item.value === person)!;
  return (
    <div className="gallery-experience">
      <section className="gallery-profile">
        <span className="gallery-person-mark">{member.label[0]}</span>
        <Heading>{member.label}</Heading>
        <Text variant="supporting">{member.role}</Text>
        <Badge tone={available ? "success" : "neutral"}>
          {available ? "可以协作" : "暂时忙碌"}
        </Badge>
        <Text variant="supporting">{member.email}</Text>
      </section>
      <div className="gallery-tool-row">
        <Select aria-label="成员" value={person} onValueChange={setPerson}>{people.map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
        <Switch checked={available} onChange={(event) => setAvailable(event.target.checked)}>可以协作</Switch>
        <CopyButton text={`${member.label} · ${member.role} · ${member.email}`}>
          复制联系信息
        </CopyButton>
      </div>
    </div>
  );
}
function Checklist() {
  const [items, setItems] = useState([
    { id: 1, text: "确认发布范围", done: true },
    { id: 2, text: "核对核心操作", done: false },
    { id: 3, text: "准备更新说明", done: false },
  ]);
  const [draft, setDraft] = useState("");
  const [sequence, setSequence] = useState(4);
  const done = items.filter((item) => item.done).length;
  return (
    <div className="gallery-experience">
      <section className="gallery-checklist">
        <Heading>发布前的最后几件事</Heading>
        <Progress value={done} max={Math.max(1, items.length)}><Progress.Label>准备进度</Progress.Label>{`${done} / ${items.length}` ? <Progress.Value>{`${done} / ${items.length}`}</Progress.Value> : null}</Progress>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Checkbox checked={item.done} onChange={(event) => {
        const checked = event.target.checked;
        setItems((previous) => previous.map((row) => row.id === item.id ? { ...row, done: checked } : row));
    }}>{item.text}</Checkbox>
            </li>
          ))}
        </ul>
      </section>
      <form
        className="gallery-tool-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          setItems((previous) => [
            ...previous,
            { id: sequence, text: draft.trim(), done: false },
          ]);
          setSequence((value) => value + 1);
          setDraft("");
        }}
      >
        <Input
          aria-label="新增事项"
          placeholder="还有什么需要完成？"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <ButtonGroup variant="plain" aria-label="清单操作">
          <Button type="submit" emphasis="strong" disabled={!draft.trim()}>
            添加
          </Button>
          <Button
            onClick={() =>
              setItems((previous) => previous.filter((item) => !item.done))
            }
            disabled={done === 0}
          >
            清除已完成
          </Button>
        </ButtonGroup>
      </form>
    </div>
  );
}
