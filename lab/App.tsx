import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Icon,
  IconButton,
  Progress,
  SearchField,
  Select,
  SelectionBar,
  Surface,
  Tabs,
} from "../src/ui";
import {
  filterTasks,
  initialTasks,
  labels,
  members,
  priorities,
  projects,
  readTasks,
  statuses,
  storageKey,
  taskLabel,
  type Scope,
  type Task,
} from "./model";
import TaskEditor from "./task-editor";
import "./lab.css";

export default function LabApp() {
  const [tasks, setTasks] = useState(() => {
    try {
      return readTasks(localStorage.getItem(storageKey));
    } catch {
      return initialTasks();
    }
  });
  const [storageFailed, setStorageFailed] = useState(false);
  const [projectId, setProjectId] = useState("portal");
  const [scope, setScope] = useState<Scope>("project");
  const [tab, setTab] = useState("issues");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [grouping, setGrouping] = useState("status");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [createSession, setCreateSession] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("uagray-project-theme") === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      setStorageFailed(false);
    } catch {
      setStorageFailed(true);
    }
  }, [tasks]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("uagray-project-theme", dark ? "dark" : "light");
    } catch {
      /* Appearance is still applied for this session. */
    }
  }, [dark]);
  const project = projects.find((item) => item.id === projectId)!;
  const projectTasks = tasks.filter((task) => task.project === projectId);
  const completed = projectTasks.filter(
    (task) => task.status === "done",
  ).length;
  const visible = filterTasks(tasks, scope, projectId, query, status, assignee);
  const activeTask = tasks.find((task) => task.id === editing);
  const title =
    scope === "project"
      ? project.name
      : scope === "mine"
        ? "我的任务"
        : "所有任务";
  const groups =
    grouping === "status"
      ? statuses.map((item) => ({
          ...item,
          tasks: visible.filter((task) => task.status === item.value),
        }))
      : [{ value: "all", label: "所有任务", tasks: visible }];
  function navigate(nextScope: Scope, id = projectId) {
    setScope(nextScope);
    setProjectId(id);
    setTab("issues");
    setQuery("");
    setStatus("all");
    setAssignee("all");
    setSelected(new Set());
    setNavOpen(false);
  }
  function updateFilter(change: () => void) {
    change();
    setSelected(new Set());
  }
  function toggle(id: number) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function updateSelected(patch: Partial<Task>) {
    setTasks((previous) =>
      previous.map((task) =>
        selected.has(task.id) ? { ...task, ...patch } : task,
      ),
    );
    setSelected(new Set());
  }
  function save(task: Task) {
    setTasks((previous) =>
      previous.some((item) => item.id === task.id)
        ? previous.map((item) => (item.id === task.id ? task : item))
        : [...previous, task],
    );
    setEditing(null);
    setCreating(false);
    setSelected(new Set());
  }
  const nextId = Math.max(100, ...tasks.map((task) => task.id)) + 1;
  const newTask: Task = {
    id: nextId,
    project: projectId,
    title: "",
    description: "",
    status: "todo",
    priority: "normal",
    assignee: scope === "mine" ? "lin" : "none",
    label: "feature",
    due: "",
    milestone: project.milestones[0],
    comments: [],
  };
  return (
    <div className="prototype-shell">
      <Surface
        role="complementary"
        aria-label="工作空间导航"
        id="workspace-navigation"
        className={`prototype-sidebar ui-scroll-area${navOpen ? " is-open" : ""}`}
      >
        <div className="prototype-workspace">
          <span className="prototype-workspace-mark">A</span>
          <div>
            <strong>Atlas</strong>
            <small>产品与工程</small>
          </div>
          <IconButton
            className="prototype-mobile-close"
            emphasis="quiet"
            icon="close"
            aria-label="关闭导航"
            onClick={() => setNavOpen(false)}
          />
        </div>
        <Button emphasis="default" className="prototype-create" onClick={() => {
            setCreateSession((value) => value + 1);
            setCreating(true);
            setNavOpen(false);
          }}>{((icon) => icon === undefined ? null : <Button.Icon><Icon name={icon as Parameters<typeof Icon>[0]["name"]} /></Button.Icon>)("plus")}<Button.Label>
          新建任务
        </Button.Label></Button>
        <nav aria-label="工作空间">
          <Button emphasis="quiet" className="prototype-nav-item" aria-current={scope === "mine" ? "page" : undefined} onClick={() => navigate("mine")}>{((icon) => icon === undefined ? null : <Button.Icon><Icon name={icon as Parameters<typeof Icon>[0]["name"]} /></Button.Icon>)("check")}<Button.Label>
            我的任务
          </Button.Label></Button>
          <Button emphasis="quiet" className="prototype-nav-item" aria-current={scope === "all" ? "page" : undefined} onClick={() => navigate("all")}>{((icon) => icon === undefined ? null : <Button.Icon><Icon name={icon as Parameters<typeof Icon>[0]["name"]} /></Button.Icon>)("grid")}<Button.Label>
            所有任务
          </Button.Label></Button>
        </nav>
        <nav aria-label="项目">
          <h2>项目</h2>
          {projects.map((item) => (<Button key={item.id} emphasis="quiet" className="prototype-nav-item" aria-current={scope === "project" && item.id === projectId ? "page" : undefined} onClick={() => navigate("project", item.id)}><Button.Icon><Icon name="grid" /></Button.Icon><Button.Label>{item.name}</Button.Label></Button>))}
        </nav>
        <div className="prototype-team">
          <h2>团队</h2>
          <span>产品设计</span>
          <span>工程研发</span>
        </div>
        <div className="prototype-account">
          <div>
            <span>林乔</span>
            <small>产品设计</small>
          </div>
          <IconButton
            icon={dark ? "sun" : "moon"}
            emphasis="quiet"
            aria-label={dark ? "切换浅色外观" : "切换深色外观"}
            onClick={() => setDark((value) => !value)}
          />
        </div>
      </Surface>
      <main className="prototype-main">
        <header className="prototype-topbar">
          <div className="prototype-breadcrumb">
            <IconButton
              className="prototype-mobile-menu"
              icon="menu"
              emphasis="quiet"
              aria-label="打开导航"
              aria-expanded={navOpen}
              aria-controls="workspace-navigation"
              onClick={() => setNavOpen((value) => !value)}
            />
            <span>Atlas</span>
            <Icon name="chevron-right" size={14} />
            <span>{scope === "project" ? "项目" : "工作空间"}</span>
            <Icon name="chevron-right" size={14} />
            <span className="prototype-current-crumb">{title}</span>
          </div>
          <span className="prototype-team-name">产品与工程</span>
        </header>
        <div className="prototype-content ui-scroll-area">
          <header className="prototype-project-heading">
            <div>
              <div className="prototype-eyebrow">
                {scope === "project" ? "产品体验 / 项目" : "工作空间 / 任务"}
              </div>
              <h1>{title}</h1>
              <p>
                {scope === "project"
                  ? project.summary
                  : scope === "mine"
                    ? "分配给你的工作，以及下一步需要推进的事项。"
                    : "跨项目查看团队的工作进展与待办事项。"}
              </p>
            </div>
            <Button emphasis="strong" onClick={() => {
                setCreateSession((value) => value + 1);
                setCreating(true);
              }}>{((icon) => icon === undefined ? null : <Button.Icon><Icon name={icon as Parameters<typeof Icon>[0]["name"]} /></Button.Icon>)("plus")}<Button.Label>
              新建任务
            </Button.Label></Button>
          </header>
          {storageFailed && (
            <Alert tone="danger"><Alert.Icon><Icon name="close" size={16}/></Alert.Icon><Alert.Title>更改暂未保存</Alert.Title><Alert.Body>
              浏览器存储不可用。当前更改仍在页面中，刷新可能丢失。
            </Alert.Body></Alert>
          )}
          <Tabs
            aria-label="项目内容"
            className="prototype-tabs"
            value={tab}
            onValueChange={(value) => {
              setTab(value);
              setSelected(new Set());
            }}
          >
            <Tabs.List>
              {(scope === "project"
                ? [
                    { value: "overview", label: "概览" },
                    { value: "issues", label: "任务" },
                  ]
                : [{ value: "issues", label: "任务" }]
              ).map((item) => (
                <Tabs.Trigger key={item.value} value={item.value}>
                  {item.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value={tab}>
            {tab === "overview" && scope === "project" ? (
              <div className="prototype-overview">
                <article className="prototype-overview-body">
                  <h2>项目简介</h2>
                  <p>{project.summary}</p>
                  <p>
                    {projectId === "portal"
                      ? "我们希望客户可以独立完成账户与订阅管理，把分散的信息和操作收敛到一个清晰的工作空间。优先完善高频路径，再逐步覆盖边界情况。"
                      : "围绕客户在移动端的高频任务，梳理导航、消息与进度查看的路径。让客户在小屏幕上也能快速找到信息并完成操作。"}
                  </p>
                  <h2>成功标准</h2>
                  <ul>
                    <li>
                      {projectId === "portal"
                        ? "客户能够独立完成首次登录和团队邀请。"
                        : "导航与消息入口在窄屏下清晰可达。"}
                    </li>
                    <li>
                      {projectId === "portal"
                        ? "订阅、使用量和账单信息可以在同一处找到。"
                        : "客户可以在移动端查看项目进度并提交表单。"}
                    </li>
                    <li>核心操作在小屏幕和键盘导航下保持可用。</li>
                  </ul>
                  <h2>里程碑</h2>
                  <div className="prototype-milestones">
                    {project.milestones.map((name) => {
                      const items = projectTasks.filter(
                        (task) => task.milestone === name,
                      );
                      const done = items.filter(
                        (task) => task.status === "done",
                      ).length;
                      return (
                        <section key={name}>
                          <h3>{name}</h3>
                          <p>
                            {done} / {items.length} 个任务已完成
                          </p>
                          <Progress
                            aria-label={`${name}进度`}
                            value={done}
                            max={Math.max(1, items.length)}
                          />
                        </section>
                      );
                    })}
                  </div>
                </article>
                <aside className="prototype-project-properties">
                  <h2>项目属性</h2>
                  <dl>
                    <dt>状态</dt>
                    <dd>
                      {completed === projectTasks.length &&
                      projectTasks.length > 0
                        ? "已完成"
                        : "进行中"}
                    </dd>
                    <dt>负责人</dt>
                    <dd>{project.lead}</dd>
                    <dt>目标日期</dt>
                    <dd>
                      <time dateTime={project.target}>{project.target}</time>
                    </dd>
                    <dt>团队</dt>
                    <dd>产品设计 · 工程研发</dd>
                  </dl>
                  <Progress value={completed} max={Math.max(1, projectTasks.length)}><Progress.Label>项目进度</Progress.Label>{`${completed} / ${projectTasks.length}` ? <Progress.Value>{`${completed} / ${projectTasks.length}`}</Progress.Value> : null}</Progress>
                </aside>
              </div>
            ) : (
              <>
                <div className="prototype-toolbar">
                  <SearchField
                    aria-label="搜索任务"
                    placeholder="搜索任务名称或编号…"
                    value={query}
                    onValueChange={(value) =>
                      updateFilter(() => setQuery(value))
                    }
                  />
                  <Select aria-label="按状态筛选" value={status} onValueChange={(value) => updateFilter(() => setStatus(value))}>{[{ value: "all", label: "全部状态" }, ...statuses].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
                  <Select aria-label="按负责人筛选" value={assignee} onValueChange={(value) => updateFilter(() => setAssignee(value))}>{[
    { value: "all", label: "所有负责人" },
    ...members,
].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
                  <Select aria-label="任务分组" value={grouping} onValueChange={setGrouping}>{[
    { value: "status", label: "按状态分组" },
    { value: "none", label: "不分组" },
].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
                </div>
                {selected.size > 0 && (
                  <SelectionBar className="prototype-selection" variant="plain" count={selected.size} total={visible.length}><SelectionBar.Description>{`已选 ${selected.size} 个任务`}</SelectionBar.Description><SelectionBar.Actions>
                    <Button
                      size="sm"
                      onClick={() => updateSelected({ status: "done" })}
                    >
                      标记已完成
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateSelected({ assignee: "lin" })}
                    >
                      分配给我
                    </Button>
                    <Button
                      size="sm"
                      tone="danger"
                      onClick={() => setDeleting(true)}
                    >
                      删除
                    </Button>
                  <SelectionBar.SelectAllAction onClick={() =>
                      setSelected(new Set(visible.map((task) => task.id)))}>全选</SelectionBar.SelectAllAction><SelectionBar.ClearAction onClick={() => setSelected(new Set())}>清空</SelectionBar.ClearAction><SelectionBar.DoneAction onClick={() => setSelected(new Set())}>完成</SelectionBar.DoneAction></SelectionBar.Actions></SelectionBar>
                )}
                <div className="prototype-list-meta">
                  <span>{visible.length} 个任务</span>
                  <span>优先级 · 标签 · 负责人</span>
                </div>
                {visible.length === 0 ? (
                  <EmptyState><EmptyState.Title>没有匹配的任务</EmptyState.Title><EmptyState.Description>尝试调整搜索条件，或创建一个新任务。</EmptyState.Description><EmptyState.Actions><Button onClick={() => updateFilter(() => {
        setQuery("");
        setStatus("all");
        setAssignee("all");
    })}>
                        清除筛选
                      </Button></EmptyState.Actions></EmptyState>
                ) : (
                  <div className="prototype-groups">
                    {groups
                      .filter((group) => group.tasks.length > 0)
                      .map((group) => (
                        <section key={group.value} aria-label={group.label}>
                          <div className="prototype-group-heading">
                            <h2>{group.label}</h2>
                            <span>{group.tasks.length}</span>
                          </div>
                          <ul className="prototype-task-list">
                            {group.tasks.map((task) => (
                              <li className="prototype-task-row" key={task.id}>
                                <Checkbox
                                  aria-label={`选择 ATL-${task.id}`}
                                  checked={selected.has(task.id)}
                                  onChange={() => toggle(task.id)}
                                />
                                <span className="prototype-task-id">
                                  ATL-{task.id}
                                  {grouping === "none" && (
                                    <small>
                                      {taskLabel(task.status, statuses)}
                                    </small>
                                  )}
                                </span>
                                <Button
                                  emphasis="quiet"
                                  className="prototype-task-title"
                                  aria-label={`打开 ATL-${task.id} ${task.title}`}
                                  onClick={() => setEditing(task.id)}
                                >
                                  <span>{task.title}</span>
                                </Button>
                                <Badge
                                  emphasis="quiet"
                                  tone={
                                    task.priority === "urgent"
                                      ? "danger"
                                      : "neutral"
                                  }
                                  className="prototype-priority"
                                >
                                  {taskLabel(task.priority, priorities)}
                                </Badge>
                                <Badge className="prototype-task-label">
                                  {taskLabel(task.label, labels)}
                                </Badge>
                                <span className="prototype-assignee">
                                  {taskLabel(task.assignee, members)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      ))}
                  </div>
                )}
              </>
            )}
            </Tabs.Content>
          </Tabs>
        </div>
      </main>
      <TaskEditor
        key={`new-${createSession}`}
        task={newTask}
        isNew
        open={creating}
        onOpenChange={setCreating}
        onSave={save}
        onComment={() => {}}
      />
      {activeTask && (
        <TaskEditor
          key={activeTask.id}
          task={activeTask}
          open
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          onSave={save}
          onComment={(id, text) =>
            setTasks((previous) =>
              previous.map((task) =>
                task.id === id
                  ? {
                      ...task,
                      comments: [
                        ...task.comments,
                        { id: crypto.randomUUID(), text, author: "林乔" },
                      ],
                    }
                  : task,
              ),
            )
          }
        />
      )}
      <ConfirmDialog open={deleting} onOpenChange={setDeleting} tone="danger" onConfirm={() => {
          setTasks((previous) =>
            previous.filter((task) => !selected.has(task.id)),
          );
          setSelected(new Set());
          setDeleting(false);
        }}><ConfirmDialog.Header><ConfirmDialog.Title>{`删除 ${selected.size} 个任务？`}</ConfirmDialog.Title><ConfirmDialog.Description>{"任务及其讨论将从当前工作空间移除。此操作无法撤销。"}</ConfirmDialog.Description></ConfirmDialog.Header><ConfirmDialog.Footer><ConfirmDialog.CancelAction>取消</ConfirmDialog.CancelAction><ConfirmDialog.ConfirmAction>{"删除任务"}</ConfirmDialog.ConfirmAction></ConfirmDialog.Footer></ConfirmDialog>
    </div>
  );
}
