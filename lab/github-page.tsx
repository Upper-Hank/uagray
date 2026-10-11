import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  Dialog,
  EmptyState,
  Field,
  Icon,
  Input,
  SearchField,
  Select,
  SelectionBar,
  Tabs,
  Textarea,
} from "../src/ui";
import { AppearanceButton, StorageNotice, useLocalState } from "./local-state";
import {
  initialIssues,
  issueHref,
  issueLabels,
  issueMembers,
  issueRoute,
  issuesKey,
  matchIssue,
  milestones,
  readIssues,
  type Issue,
} from "./github-data";
import "./github.css";
const nameOf = (value: string) =>
  issueMembers.find((member) => member.value === value)?.label ?? value;

function NewIssue({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (
    title: string,
    body: string,
    assignee: string,
    milestone: string,
  ) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [owner, setOwner] = useState("none");
  const [milestone, setMilestone] = useState("none");
  const [attempted, setAttempted] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <Dialog.Header>
        <Dialog.Title>新建问题</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        <form
          className="forge-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setAttempted(true);
            if (!title.trim()) return;
            onCreate(title.trim(), body, owner, milestone);
          }}
        >
          <Field required>
            <Field.Label>问题标题</Field.Label>
            <Field.Control>
              <Input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </Field.Control>
            {(attempted && !title.trim() ? "请输入问题标题" : undefined) ? (
              <Field.Error>
                {attempted && !title.trim() ? "请输入问题标题" : undefined}
              </Field.Error>
            ) : null}
          </Field>
          <Field>
            <Field.Label>描述</Field.Label>
            <Field.Control>
              <Textarea
                rows={7}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="描述问题、复现步骤与预期表现…"
              />
            </Field.Control>
          </Field>
          <div className="forge-fields">
            <Field>
              <Field.Label>负责人</Field.Label>
              <Field.Control>
                <Select value={owner} onValueChange={setOwner}>
                  {issueMembers.map((item) => (
                    <Select.Item
                      key={item.value}
                      value={item.value}
                      disabled={(item as { disabled?: boolean }).disabled}
                    >
                      {item.label}
                    </Select.Item>
                  ))}
                </Select>
              </Field.Control>
            </Field>
            <Field>
              <Field.Label>里程碑</Field.Label>
              <Field.Control>
                <Select value={milestone} onValueChange={setMilestone}>
                  {milestones.map((item) => (
                    <Select.Item
                      key={item.value}
                      value={item.value}
                      disabled={(item as { disabled?: boolean }).disabled}
                    >
                      {item.label}
                    </Select.Item>
                  ))}
                </Select>
              </Field.Control>
            </Field>
          </div>
          <ButtonGroup variant="plain" aria-label="创建问题操作">
            <Button type="submit" emphasis="strong">
              <Button.Label>创建问题</Button.Label>
            </Button>
            <Button onClick={onClose}>
              <Button.Label>取消</Button.Label>
            </Button>
          </ButtonGroup>
        </form>
      </Dialog.Body>
    </Dialog>
  );
}
function IssueDetail({
  issue,
  onChange,
}: {
  issue: Issue;
  onChange: (issue: Issue) => void;
}) {
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [body, setBody] = useState(issue.body);
  const [invalid, setInvalid] = useState(false);
  return (
    <article className="forge-detail">
      <a href={issueHref()}>返回问题列表</a>
      <header className="forge-detail-heading">
        <div>
          <h1>
            {issue.title} <span>#{issue.id}</span>
          </h1>
          <div className="forge-inline">
            <Badge tone={issue.state === "open" ? "success" : "neutral"}>
              {issue.state === "open" ? "开放" : "已关闭"}
            </Badge>
            <span>
              {nameOf(issue.author)} 于 {issue.created} 创建 ·{" "}
              {issue.comments.length} 条评论
            </span>
          </div>
        </div>
        <Button
          onClick={() => {
            setTitle(issue.title);
            setBody(issue.body);
            setInvalid(false);
            setEditing((value) => !value);
          }}
        >
          <Button.Label>{editing ? "取消编辑" : "编辑问题"}</Button.Label>
        </Button>
      </header>
      <div className="forge-detail-layout">
        <div className="forge-discussion">
          {editing ? (
            <form
              className="forge-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                setInvalid(!title.trim());
                if (!title.trim()) return;
                onChange({ ...issue, title: title.trim(), body });
                setEditing(false);
              }}
            >
              <Field>
                <Field.Label>问题标题</Field.Label>
                <Field.Control>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </Field.Control>
                {(invalid ? "请输入问题标题" : undefined) ? (
                  <Field.Error>
                    {invalid ? "请输入问题标题" : undefined}
                  </Field.Error>
                ) : null}
              </Field>
              <Field>
                <Field.Label>问题描述</Field.Label>
                <Field.Control>
                  <Textarea
                    rows={8}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                  />
                </Field.Control>
              </Field>
              <Button emphasis="strong" type="submit">
                <Button.Label>保存更改</Button.Label>
              </Button>
            </form>
          ) : (
            <section className="forge-post">
              <h2>{nameOf(issue.author)}</h2>
              <p>{issue.body || "暂未填写描述。"}</p>
            </section>
          )}
          {issue.comments.map((item) => (
            <section className="forge-post" key={item.id}>
              <h2>{nameOf(item.author)}</h2>
              <p>{item.text}</p>
            </section>
          ))}
          <form
            className="forge-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!comment.trim()) return;
              onChange({
                ...issue,
                comments: [
                  ...issue.comments,
                  {
                    id: crypto.randomUUID(),
                    author: "lin",
                    text: comment.trim(),
                  },
                ],
              });
              setComment("");
            }}
          >
            <Field>
              <Field.Label>添加评论</Field.Label>
              <Field.Control>
                <Textarea
                  rows={5}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="分享复现信息或讨论解决办法…"
                />
              </Field.Control>
            </Field>
            <ButtonGroup variant="plain" aria-label="问题讨论操作">
              <Button
                type="submit"
                emphasis="strong"
                disabled={!comment.trim()}
              >
                <Button.Label>发表评论</Button.Label>
              </Button>
              <Button
                onClick={() =>
                  onChange({
                    ...issue,
                    state: issue.state === "open" ? "closed" : "open",
                  })
                }
              >
                <Button.Label>
                  {issue.state === "open" ? "关闭问题" : "重新开放"}
                </Button.Label>
              </Button>
            </ButtonGroup>
          </form>
        </div>
        <aside className="forge-detail-properties">
          <Field>
            <Field.Label>负责人</Field.Label>
            <Field.Control>
              <Select
                value={issue.assignee}
                onValueChange={(assignee) => onChange({ ...issue, assignee })}
              >
                {issueMembers.map((item) => (
                  <Select.Item
                    key={item.value}
                    value={item.value}
                    disabled={(item as { disabled?: boolean }).disabled}
                  >
                    {item.label}
                  </Select.Item>
                ))}
              </Select>
            </Field.Control>
          </Field>
          <fieldset>
            <legend>标签</legend>
            {issueLabels.map((label) => (
              <Checkbox
                key={label.value}
                checked={issue.labels.includes(label.value)}
                onChange={(event) =>
                  onChange({
                    ...issue,
                    labels: event.target.checked
                      ? [...issue.labels, label.value]
                      : issue.labels.filter((value) => value !== label.value),
                  })
                }
              >
                {label.label}
              </Checkbox>
            ))}
          </fieldset>
          <Field>
            <Field.Label>里程碑</Field.Label>
            <Field.Control>
              <Select
                value={issue.milestone}
                onValueChange={(milestone) => onChange({ ...issue, milestone })}
              >
                {milestones.map((item) => (
                  <Select.Item
                    key={item.value}
                    value={item.value}
                    disabled={(item as { disabled?: boolean }).disabled}
                  >
                    {item.label}
                  </Select.Item>
                ))}
              </Select>
            </Field.Control>
          </Field>
        </aside>
      </div>
    </article>
  );
}
export default function GithubPage() {
  const {
    value: issues,
    setValue: setIssues,
    failed,
  } = useLocalState(issuesKey, initialIssues, readIssues);
  const [query, setQuery] = useState("is:issue is:open");
  const [label, setLabel] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [sort, setSort] = useState("newest");
  const [tab, setTab] = useState("issues");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [session, setSession] = useState(0);
  const [activeId, setActiveId] = useState(() => issueRoute(location.hash));
  useEffect(() => {
    const navigate = () => {
      if (location.hash.startsWith("#/") || !location.hash) {
        setActiveId(issueRoute(location.hash));
        setSelected(new Set());
      }
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  const active = issues.find((issue) => issue.id === activeId);
  useEffect(() => {
    document.title = active
      ? `${active.title} · Forge`
      : "Forge · portal-kit Issues";
  }, [active]);
  const visible = issues
    .filter(
      (issue) =>
        matchIssue(issue, query) &&
        (label === "all" || issue.labels.includes(label)) &&
        (assignee === "all" || issue.assignee === assignee),
    )
    .sort((a, b) =>
      sort === "oldest"
        ? a.id - b.id
        : sort === "comments"
          ? b.comments.length - a.comments.length
          : b.id - a.id,
    );
  function changeFilter(change: () => void) {
    change();
    setSelected(new Set());
  }
  function changeState(state: string) {
    changeFilter(() =>
      setQuery((previous) =>
        `${previous.replace(/(?:is|state):(open|closed)/g, "").trim()} is:${state}`.trim(),
      ),
    );
  }
  function update(issue: Issue) {
    setIssues((previous) =>
      previous.map((item) => (item.id === issue.id ? issue : item)),
    );
  }
  return (
    <div className="forge-shell">
      <header className="forge-topbar">
        <div className="forge-inline">
          <Icon name="grid" />
          <span>Forge</span>
          <span className="forge-muted">/</span>
          <span>atlas / portal-kit</span>
        </div>
        <AppearanceButton />
      </header>
      <main className="forge-main">
        <header className="forge-repository">
          <div className="forge-inline">
            <h1>
              atlas <span>/</span> portal-kit
            </h1>
            <Badge emphasis="quiet">公开仓库</Badge>
          </div>
          <p>客户门户的基础模块、接入方案与使用文档。</p>
        </header>
        <StorageNotice failed={failed} />
        {activeId !== null ? (
          active ? (
            <IssueDetail key={active.id} issue={active} onChange={update} />
          ) : (
            <EmptyState>
              <EmptyState.Title>{"找不到这个问题"}</EmptyState.Title>
              <EmptyState.Actions>
                {<a href={issueHref()}>返回列表</a>}
              </EmptyState.Actions>
            </EmptyState>
          )
        ) : (
          <Tabs
            aria-label="仓库内容"
            value={tab}
            onValueChange={(value) => {
              setTab(value);
              setSelected(new Set());
            }}
          >
            <Tabs.List>
              {[
                { value: "issues", label: "问题" },
                { value: "labels", label: "标签" },
                { value: "milestones", label: "里程碑" },
                { value: "readme", label: "说明" },
              ].map((item) => (
                <Tabs.Trigger key={item.value} value={item.value}>
                  {item.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Tabs.Content value={tab}>
              {tab === "issues" ? (
                <>
                  <div className="forge-toolbar">
                    <SearchField
                      aria-label="搜索问题"
                      value={query}
                      onValueChange={(value) =>
                        changeFilter(() => setQuery(value))
                      }
                      placeholder="搜索标题、label:bug、assignee:@me…"
                    />
                    <Button
                      emphasis="strong"
                      onClick={() => {
                        setSession((value) => value + 1);
                        setCreating(true);
                      }}
                    >
                      {((
                        icon: Parameters<typeof Icon>[0]["name"] | undefined,
                      ) =>
                        icon === undefined ? null : (
                          <Button.Icon>
                            <Icon name={icon} />
                          </Button.Icon>
                        ))("plus")}
                      <Button.Label>新建问题</Button.Label>
                    </Button>
                  </div>
                  <div className="forge-filters">
                    <ButtonGroup variant="plain" aria-label="问题状态">
                      <Button
                        emphasis="quiet"
                        onClick={() => changeState("open")}
                      >
                        <Button.Label>开放</Button.Label>
                        {issues.filter((issue) => issue.state === "open")
                          .length !== undefined && (
                          <Button.Count>
                            {
                              issues.filter((issue) => issue.state === "open")
                                .length
                            }
                          </Button.Count>
                        )}
                      </Button>
                      <Button
                        emphasis="quiet"
                        onClick={() => changeState("closed")}
                      >
                        <Button.Label>已关闭</Button.Label>
                        {issues.filter((issue) => issue.state === "closed")
                          .length !== undefined && (
                          <Button.Count>
                            {
                              issues.filter((issue) => issue.state === "closed")
                                .length
                            }
                          </Button.Count>
                        )}
                      </Button>
                    </ButtonGroup>
                    <Select
                      aria-label="按标签筛选"
                      value={label}
                      onValueChange={(value) =>
                        changeFilter(() => setLabel(value))
                      }
                    >
                      {[
                        { value: "all", label: "所有标签" },
                        ...issueLabels,
                      ].map((item) => (
                        <Select.Item
                          key={item.value}
                          value={item.value}
                          disabled={
                            "disabled" in item
                              ? (item.disabled as boolean)
                              : undefined
                          }
                        >
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select>
                    <Select
                      aria-label="按负责人筛选"
                      value={assignee}
                      onValueChange={(value) =>
                        changeFilter(() => setAssignee(value))
                      }
                    >
                      {[
                        { value: "all", label: "所有负责人" },
                        ...issueMembers,
                      ].map((item) => (
                        <Select.Item
                          key={item.value}
                          value={item.value}
                          disabled={
                            "disabled" in item
                              ? (item.disabled as boolean)
                              : undefined
                          }
                        >
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select>
                    <Select
                      aria-label="问题排序"
                      value={sort}
                      onValueChange={setSort}
                    >
                      {[
                        { value: "newest", label: "最新创建" },
                        { value: "oldest", label: "最早创建" },
                        { value: "comments", label: "最多讨论" },
                      ].map((item) => (
                        <Select.Item
                          key={item.value}
                          value={item.value}
                          disabled={
                            "disabled" in item
                              ? (item.disabled as boolean)
                              : undefined
                          }
                        >
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select>
                  </div>
                  {selected.size > 0 && (
                    <SelectionBar variant="plain" count={selected.size}>
                      <SelectionBar.Description>{`已选 ${selected.size} 个问题`}</SelectionBar.Description>
                      <SelectionBar.Actions>
                        <Button
                          size="sm"
                          onClick={() => {
                            setIssues((previous) =>
                              previous.map((issue) =>
                                selected.has(issue.id)
                                  ? { ...issue, state: "closed" }
                                  : issue,
                              ),
                            );
                            setSelected(new Set());
                          }}
                        >
                          <Button.Label>关闭所选</Button.Label>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setIssues((previous) =>
                              previous.map((issue) =>
                                selected.has(issue.id)
                                  ? { ...issue, state: "open" }
                                  : issue,
                              ),
                            );
                            setSelected(new Set());
                          }}
                        >
                          <Button.Label>重新开放所选</Button.Label>
                        </Button>
                        <SelectionBar.SelectAllAction
                          onClick={() =>
                            setSelected(
                              new Set(visible.map((issue) => issue.id)),
                            )
                          }
                        >
                          全选
                        </SelectionBar.SelectAllAction>
                        <SelectionBar.ClearAction
                          onClick={() => setSelected(new Set())}
                        >
                          清空
                        </SelectionBar.ClearAction>
                      </SelectionBar.Actions>
                    </SelectionBar>
                  )}
                  <div className="forge-result-heading">
                    <span>{visible.length} 个匹配问题</span>
                    <Checkbox
                      checked={
                        visible.length > 0 &&
                        visible.every((issue) => selected.has(issue.id))
                      }
                      disabled={!visible.length}
                      onChange={(event) =>
                        setSelected(
                          event.target.checked
                            ? new Set(visible.map((issue) => issue.id))
                            : new Set(),
                        )
                      }
                    >
                      {"全选当前结果"}
                    </Checkbox>
                  </div>
                  {visible.length ? (
                    <ul className="forge-issues">
                      {visible.map((issue) => (
                        <li className="forge-issue-row" key={issue.id}>
                          <Checkbox
                            aria-label={`选择问题 #${issue.id}`}
                            checked={selected.has(issue.id)}
                            onChange={() =>
                              setSelected((previous) => {
                                const next = new Set(previous);
                                if (next.has(issue.id)) next.delete(issue.id);
                                else next.add(issue.id);
                                return next;
                              })
                            }
                          />
                          <Icon
                            name={issue.state === "open" ? "info" : "check"}
                            size={18}
                          />
                          <div>
                            <a
                              className="forge-issue-title"
                              href={issueHref(issue.id)}
                            >
                              {issue.title}
                            </a>
                            <div className="forge-inline forge-labels">
                              {issue.labels.map((value) => (
                                <Badge key={value} emphasis="quiet">
                                  {value}
                                </Badge>
                              ))}
                            </div>
                            <p>
                              #{issue.id} · {nameOf(issue.author)} 于{" "}
                              {issue.created} 创建
                              {issue.assignee !== "none"
                                ? ` · 分配给 ${nameOf(issue.assignee)}`
                                : ""}
                            </p>
                          </div>
                          <span className="forge-comment-count">
                            {issue.comments.length} 条评论
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyState>
                      <EmptyState.Title>{"没有匹配的问题"}</EmptyState.Title>
                      <EmptyState.Description>
                        {"调整搜索条件或创建一个新问题。"}
                      </EmptyState.Description>
                      <EmptyState.Actions>
                        {
                          <Button
                            onClick={() =>
                              changeFilter(() => {
                                setQuery("");
                                setLabel("all");
                                setAssignee("all");
                              })
                            }
                          >
                            <Button.Label>清除筛选</Button.Label>
                          </Button>
                        }
                      </EmptyState.Actions>
                    </EmptyState>
                  )}
                </>
              ) : tab === "labels" ? (
                <section className="forge-catalog">
                  <h2>标签</h2>
                  {issueLabels.map((item) => (
                    <div key={item.value}>
                      <Badge>{item.label}</Badge>
                      <p>{item.description}</p>
                      <Button
                        emphasis="quiet"
                        onClick={() => {
                          changeFilter(() => {
                            setQuery("");
                            setLabel(item.value);
                            setAssignee("all");
                          });
                          setTab("issues");
                        }}
                      >
                        <Button.Label>
                          查看{" "}
                          {
                            issues.filter((issue) =>
                              issue.labels.includes(item.value),
                            ).length
                          }{" "}
                          个问题
                        </Button.Label>
                      </Button>
                    </div>
                  ))}
                </section>
              ) : tab === "milestones" ? (
                <section className="forge-catalog">
                  <h2>里程碑</h2>
                  {milestones
                    .filter((item) => item.value !== "none")
                    .map((item) => {
                      const rows = issues.filter(
                        (issue) => issue.milestone === item.value,
                      );
                      return (
                        <section key={item.value}>
                          <h3>{item.label}</h3>
                          <p>
                            {
                              rows.filter((issue) => issue.state === "closed")
                                .length
                            }{" "}
                            / {rows.length} 个问题已关闭
                          </p>
                          <ul>
                            {rows.map((issue) => (
                              <li key={issue.id}>
                                <a href={issueHref(issue.id)}>
                                  #{issue.id} {issue.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </section>
                      );
                    })}
                </section>
              ) : (
                <article className="forge-readme">
                  <h2>portal-kit</h2>
                  <p>
                    用于客户门户的轻量模块，包含成员管理、订阅信息与工作空间设置。
                  </p>
                  <h3>参与贡献</h3>
                  <p>
                    遇到问题时，创建一条包含复现步骤和预期结果的问题。讨论解决方案后，由负责人推进修复。
                  </p>
                  <h3>发布节奏</h3>
                  <p>
                    当前正在整理 Beta
                    发布内容，正式版以里程碑中的问题完成情况为准。
                  </p>
                </article>
              )}
            </Tabs.Content>
          </Tabs>
        )}
        <NewIssue
          key={session}
          open={creating}
          onClose={() => setCreating(false)}
          onCreate={(title, body, owner, milestone) => {
            const id = Math.max(283, ...issues.map((issue) => issue.id)) + 1;
            setIssues((previous) => [
              ...previous,
              {
                id,
                title,
                body,
                assignee: owner,
                milestone,
                state: "open",
                author: "lin",
                labels: [],
                created: new Date().toLocaleDateString("sv-SE", {
                  timeZone: "Asia/Shanghai",
                }),
                comments: [],
              },
            ]);
            setCreating(false);
            location.hash = `/issues/${id}`;
          }}
        />
      </main>
    </div>
  );
}
