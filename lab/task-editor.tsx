import { useId, useState } from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  Select,
  Textarea,
} from "../src/ui";
import {
  labels,
  members,
  priorities,
  projects,
  statuses,
  type Task,
} from "./model";

type Props = {
  task: Task;
  isNew?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task) => void;
  onComment: (id: number, text: string) => void;
};
export default function TaskEditor({
  task,
  isNew = false,
  open,
  onOpenChange,
  onSave,
  onComment,
}: Props) {
  const [draft, setDraft] = useState(task);
  const [attempted, setAttempted] = useState(false);
  const [comment, setComment] = useState("");
  const formId = useId();
  const project = projects.find((item) => item.id === draft.project)!;
  function update<K extends keyof Task>(key: K, value: Task[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  return (
    <Dialog
      variant={isNew ? "dialog" : "drawer"}
      open={open}
      onOpenChange={onOpenChange}
      className="prototype-task-layer"
    >
      <Dialog.Header>
        <Dialog.Title>{isNew ? "新建任务" : `ATL-${task.id}`}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
      <form
        id={formId}
        className="prototype-editor"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setAttempted(true);
          if (!draft.title.trim()) return;
          onSave({
            ...draft,
            title: draft.title.trim(),
            comments: task.comments,
          });
        }}
      >
        <Field required><Field.Label>任务标题</Field.Label><Field.Control>
          <Input value={draft.title} onChange={(event) => update("title", event.target.value)} autoFocus={isNew}/>
        </Field.Control>{(attempted && !draft.title.trim() ? "请输入任务标题" : undefined) ? <Field.Error>{attempted && !draft.title.trim() ? "请输入任务标题" : undefined}</Field.Error> : null}</Field>
        <Field><Field.Label>描述</Field.Label><Field.Control>
          <Textarea rows={7} value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="描述目标、背景与验收标准…"/>
        </Field.Control></Field>
        <div className="prototype-properties">
          <Field><Field.Label>状态</Field.Label><Field.Control>
            <Select value={draft.status} onValueChange={(value) => update("status", value as Task["status"])}>{statuses.map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
          </Field.Control></Field>
          <Field><Field.Label>优先级</Field.Label><Field.Control>
            <Select value={draft.priority} onValueChange={(value) => update("priority", value as Task["priority"])}>{priorities.map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
          </Field.Control></Field>
          <Field><Field.Label>负责人</Field.Label><Field.Control>
            <Select value={draft.assignee} onValueChange={(value) => update("assignee", value)}>{members.map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
          </Field.Control></Field>
          <Field><Field.Label>标签</Field.Label><Field.Control>
            <Select value={draft.label} onValueChange={(value) => update("label", value)}>{labels.map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
          </Field.Control></Field>
          <Field><Field.Label>项目</Field.Label><Field.Control>
            <Select value={draft.project} onValueChange={(value) => setDraft((previous) => ({
        ...previous,
        project: value,
        milestone: projects.find((item) => item.id === value)!
            .milestones[0],
    }))}>{projects.map((item) => ({
    value: item.id,
    label: item.name,
})).map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
          </Field.Control></Field>
          <Field><Field.Label>里程碑</Field.Label><Field.Control>
            <Select key={draft.project} value={draft.milestone} onValueChange={(value) => {
        // Dynamic native select options can emit a transient empty value.
        if (project.milestones.includes(value))
            update("milestone", value);
    }}>{project.milestones.map((value) => ({
    value,
    label: value,
})).map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
          </Field.Control></Field>
          <Field><Field.Label>截止日期</Field.Label><Field.Control>
            <Input type="date" value={draft.due} onChange={(event) => update("due", event.target.value)}/>
          </Field.Control></Field>
        </div>
      </form>
      {!isNew && (
        <section className="prototype-discussion" aria-label="任务讨论">
          <h3>讨论</h3>
          {task.comments.length ? (
            <ul>
              {task.comments.map((item) => (
                <li key={item.id}>
                  <span className="prototype-comment-author">
                    {item.author}
                  </span>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="prototype-muted">还没有评论。</p>
          )}
          <form
            className="prototype-editor"
            onSubmit={(event) => {
              event.preventDefault();
              if (!comment.trim()) return;
              onComment(task.id, comment.trim());
              setComment("");
            }}
          >
            <Field><Field.Label>添加评论</Field.Label><Field.Control>
              <Textarea rows={3} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="分享进展或补充上下文…"/>
            </Field.Control></Field>
            <Button type="submit" disabled={!comment.trim()}>
              发送评论
            </Button>
          </form>
        </section>
      )}
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={() => onOpenChange(false)}>取消</Button>
        <Button emphasis="strong" type="submit" form={formId}>
          {isNew ? "创建任务" : "保存更改"}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
