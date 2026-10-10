import { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Checkbox,
  ColorPicker,
  CopyButton,
  Dialog,
  EmptyState,
  Field,
  FileDropzone,
  Icon,
  Input,
  Layout,
  NavigationCard,
  NumberInput,
  PageShell,
  Progress,
  SearchField,
  SegmentedControl,
  Select,
  SelectionBar,
  ShowcaseCard,
  Slider,
  Surface,
  Switch,
  Textarea,
  Toast,
} from "./ui";
import { DetailCase } from "./detail-case";
import "./cases.css";

export const caseEntries = [
  { id: "case-detail", title: "模块研究", category: "case" as const },
  { id: "case-gallery", title: "案例总览", category: "case" as const },
  { id: "case-workspace", title: "编辑工作台", category: "case" as const },
  { id: "case-saas", title: "SaaS 项目管理", category: "case" as const },
];
function downloadFile(contents: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!,
  );
}
function Gallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const items = [
    {
      title: "海报编辑",
      description: "内容与局部工具",
      type: "tool",
      href: "/cases/workspace.html",
      icon: "grid" as const,
    },
    {
      title: "项目空间",
      description: "表单与列表协作",
      type: "app",
      href: "/cases/saas.html",
      icon: "menu" as const,
    },
    {
      title: "模块研究",
      description: "展示、说明与导航",
      type: "tool",
      href: "/cases/detail.html",
      icon: "grid" as const,
    },
  ];
  const visible = items.filter(
    (item) =>
      (category === "all" || item.type === category) &&
      item.title.includes(query.trim()),
  );
  return (
    <PageShell
      className="case-shell"
      mainId="gallery-content"
      controls={
        <Layout className="case-toolbar" label="案例筛选">
          <SegmentedControl
            label="案例分类"
            value={category}
            onChange={setCategory}
            options={[
              { value: "all", label: "全部", count: 3 },
              { value: "tool", label: "工具", count: 2 },
              { value: "app", label: "应用", count: 1 },
            ]}
          />
          <SearchField
            label="搜索案例"
            placeholder="搜索案例"
            value={query}
            onChange={setQuery}
          />
        </Layout>
      }
    >
      {visible.length ? (
        <div className="case-gallery">
          {visible.map((item) => (
            <ShowcaseCard
              key={item.title}
              title={item.title}
              description={item.description}
              href={item.href}
            >
              <Icon name={item.icon} size={48} />
            </ShowcaseCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="没有匹配案例"
          action={
            <Button
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
            >
              清空筛选
            </Button>
          }
        />
      )}
    </PageShell>
  );
}
function Workspace() {
  const [layout, setLayout] = useState("portrait");
  const [color, setColor] = useState("#3765D6");
  const [text, setText] = useState("Make room\nfor good ideas.");
  const [scale, setScale] = useState(100);
  const [showColor, setShowColor] = useState(false);
  const [upload, setUpload] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!photo) {
      setPhotoUrl("");
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  function reset() {
    setLayout("portrait");
    setColor("#3765D6");
    setText("Make room\nfor good ideas.");
    setScale(100);
    setPhoto(null);
  }
  function exportPoster() {
    const width = layout === "landscape" ? 640 : 420;
    const height = layout === "landscape" ? 420 : 560;
    const lines = text.split("\n").slice(0, 8);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" rx="24" fill="white"/><rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="16" fill="none" stroke="${color}" stroke-width="8"/><g fill="${color}" font-family="sans-serif" font-size="32">${lines.map((line, i) => `<text x="40" y="${80 + i * 42}">${escapeXml(line)}</text>`).join("")}</g></svg>`;
    downloadFile(svg, "uagray-poster.svg", "image/svg+xml");
    setNotice("文字海报已导出 SVG");
  }
  return (
    <PageShell
      className="case-shell"
      mainId="workspace-content"
      controls={
        <Layout className="case-toolbar" label="工作台操作">
          <span className="case-space-name">海报工作台</span>
          <ButtonGroup label="页面操作">
            <Button onClick={reset}>重置</Button>
            <CopyButton text={text} label="复制文字" />
          </ButtonGroup>
        </Layout>
      }
    >
      <Surface className="case-workspace">
        <Surface
          tone="raised"
          treatment="physical"
          className="ui-tool-surface case-floating-tools"
        >
          <Layout className="case-toolbar ui-toolbar-row" label="海报版式">
            <ButtonGroup label="版式选择" tone="plain">
              <Button
                variant="plain"
                aria-pressed={layout === "portrait"}
                onClick={() => setLayout("portrait")}
              >
                竖版
              </Button>
              <Button
                variant="plain"
                aria-pressed={layout === "landscape"}
                onClick={() => setLayout("landscape")}
              >
                横版
              </Button>
            </ButtonGroup>
            <Button
              variant="plain"
              icon="grid"
              aria-expanded={showColor}
              onClick={() => setShowColor(!showColor)}
            >
              颜色
            </Button>
          </Layout>
        </Surface>
        <div className="case-poster-area">
          <Surface
            tone="raised"
            treatment="physical"
            className={`case-poster case-poster--${layout}`}
          >
            <div
              className="case-poster-art"
              style={{
                borderColor: color,
                color,
                transform: `scale(${scale / 100})`,
              }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="所选图片" />
              ) : (
                <span>{text}</span>
              )}
            </div>
          </Surface>
          {showColor && (
            <div className="case-color-tools">
              <ColorPicker
                label="海报颜色"
                value={color}
                onValueChange={setColor}
              />
            </div>
          )}
        </div>
        <Surface
          tone="raised"
          treatment="physical"
          className="ui-tool-surface case-floating-tools"
        >
          <Layout className="case-toolbar ui-toolbar-row" label="海报工具">
            <Button variant="plain" icon="plus" onClick={() => setUpload(true)}>
              选择图片
            </Button>
            <Slider
              className="ui-toolbar-field"
              label="缩放"
              layout="inline"
              min={60}
              max={140}
              value={scale}
              onValueChange={setScale}
              formatValue={(value) => `${value}%`}
            />
            <Button variant="plain" icon="arrow" onClick={exportPoster}>
              导出文字 SVG
            </Button>
          </Layout>
        </Surface>
      </Surface>
      <section aria-labelledby="poster-content-title">
        <h2 id="poster-content-title" className="case-section-title">
          海报内容
        </h2>
        <Field label="文字">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
          />
        </Field>
      </section>
      <div className="case-navigation">
        <NavigationCard direction="previous" title="案例总览" href="/cases/" />
        <NavigationCard
          direction="next"
          title="项目空间"
          href="/cases/saas.html"
        />
      </div>
      <Dialog open={upload} onOpenChange={setUpload} title="选择图片">
        <FileDropzone
          accept=".png,.jpg,.jpeg,.webp"
          maxSize={5 * 1024 * 1024}
          onFiles={(files) => {
            setPhoto(files[0]);
            setUpload(false);
          }}
        />
      </Dialog>
      <Toast
        open={!!notice}
        message={notice}
        onOpenChange={(open) => {
          if (!open) setNotice("");
        }}
      />
    </PageShell>
  );
}

type Project = { id: number; name: string; status: string; owner: string };
const initialProjects: Project[] = [
  { id: 1, name: "品牌字体", status: "active", owner: "林" },
  { id: 2, name: "图标资源", status: "active", owner: "陈" },
  { id: 3, name: "组件文档", status: "done", owner: "林" },
  { id: 4, name: "移动端规范", status: "draft", owner: "周" },
];
const statusOptions = [
  { value: "active", label: "进行中" },
  { value: "draft", label: "草稿" },
  { value: "done", label: "已完成" },
];
function Saas() {
  const [section, setSection] = useState("projects");
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("林");
  const [projectStatus, setProjectStatus] = useState("active");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [accent, setAccent] = useState("#3765D6");
  const visible = projects.filter(
    (project) =>
      project.name.includes(query.trim()) &&
      (status === "all" || project.status === status),
  );
  const completed = projects.filter(
    (project) => project.status === "done",
  ).length;
  const pageCount = Math.max(1, Math.ceil(visible.length / limit));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(
    currentPage * limit,
    (currentPage + 1) * limit,
  );
  useEffect(() => {
    setPage(0);
  }, [query, status, limit]);
  function showEditor(project?: Project) {
    setEditing(project?.id ?? null);
    setName(project?.name ?? "");
    setOwner(project?.owner ?? "林");
    setProjectStatus(project?.status ?? "active");
    setError("");
    setOpen(true);
  }
  function saveProject() {
    if (!name.trim()) {
      setError("请输入项目名称。");
      return;
    }
    setProjects((current) =>
      editing === null
        ? [
            ...current,
            {
              id: Math.max(0, ...current.map((item) => item.id)) + 1,
              name: name.trim(),
              owner,
              status: projectStatus,
            },
          ]
        : current.map((project) =>
            project.id === editing
              ? { ...project, name: name.trim(), owner, status: projectStatus }
              : project,
          ),
    );
    setOpen(false);
    setNotice(editing === null ? "项目已创建" : "项目已更新");
  }
  return (
    <PageShell
      className="case-shell"
      mainId="saas-content"
      controls={
        <Layout className="case-toolbar" label="项目空间">
          <span className="case-space-name">
            <Icon name="grid" size={14} color={accent} /> Studio / 演示空间
          </span>
          <SegmentedControl
            label="空间页面"
            value={section}
            onChange={setSection}
            options={[
              { value: "projects", label: "项目" },
              { value: "settings", label: "设置" },
            ]}
          />
        </Layout>
      }
    >
      {section === "projects" ? (
        <>
          <div className="case-metrics">
            <div className="case-metric">
              <span>项目</span>
              <strong>{projects.length}</strong>
            </div>
            <div className="case-metric">
              <span>完成</span>
              <strong>{completed}</strong>
            </div>
            <div className="case-metric">
              <Progress
                label="完成进度"
                value={completed}
                max={Math.max(projects.length, 1)}
              />
            </div>
          </div>
          <Layout className="case-toolbar case-project-filter" label="项目筛选">
            <SearchField
              label="搜索项目"
              placeholder="搜索项目"
              value={query}
              onChange={setQuery}
            />
            <Select
              aria-label="筛选状态"
              value={status}
              onValueChange={setStatus}
              options={[{ value: "all", label: "全部状态" }, ...statusOptions]}
            />
            <Button icon="plus" onClick={() => showEditor()}>
              新建项目
            </Button>
          </Layout>
          {selected.length > 0 && (
            <SelectionBar
              count={selected.length}
              actions={
                <>
                  <Button
                    onClick={() => {
                      setProjects((current) =>
                        current.map((project) =>
                          selected.includes(project.id)
                            ? { ...project, status: "done" }
                            : project,
                        ),
                      );
                      setSelected([]);
                      setNotice("所选项目已完成");
                    }}
                  >
                    标记完成
                  </Button>
                  <Button variant="plain" onClick={() => setSelected([])}>
                    取消选择
                  </Button>
                </>
              }
            />
          )}
          {visible.length ? (
            <div className="case-projects ui-scroll-area">
              <table>
                <caption className="ui-sr-only">项目列表</caption>
                <thead>
                  <tr>
                    <th scope="col">选择</th>
                    <th scope="col">项目</th>
                    <th scope="col">负责人</th>
                    <th scope="col">状态</th>
                    <th scope="col">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((project) => (
                    <tr
                      key={project.id}
                      data-selected={selected.includes(project.id) || undefined}
                    >
                      <td>
                        <Checkbox
                          aria-label={`选择 ${project.name}`}
                          checked={selected.includes(project.id)}
                          onChange={(event) =>
                            setSelected((current) =>
                              event.target.checked
                                ? [...new Set([...current, project.id])]
                                : current.filter((id) => id !== project.id),
                            )
                          }
                        />
                      </td>
                      <td>{project.name}</td>
                      <td>{project.owner}</td>
                      <td>
                        <span
                          className={`case-project-status case-project-status--${project.status}`}
                        >
                          {
                            statusOptions.find(
                              (option) => option.value === project.status,
                            )?.label
                          }
                        </span>
                      </td>
                      <td>
                        <Button
                          size="small"
                          variant="plain"
                          aria-label={`编辑 ${project.name}`}
                          onClick={() => showEditor(project)}
                        >
                          编辑
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pageCount > 1 && (
                <Layout className="case-toolbar" label="列表分页">
                  <span>
                    {currentPage + 1} / {pageCount}
                  </span>
                  <Button
                    size="small"
                    variant="plain"
                    disabled={currentPage === 0}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    上一页
                  </Button>
                  <Button
                    size="small"
                    variant="plain"
                    disabled={currentPage === pageCount - 1}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    下一页
                  </Button>
                </Layout>
              )}
            </div>
          ) : (
            <EmptyState
              title="没有匹配项目"
              action={
                <Button
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                  }}
                >
                  清空筛选
                </Button>
              }
            />
          )}
        </>
      ) : (
        <section aria-labelledby="space-settings-title">
          <h2 id="space-settings-title" className="case-section-title">
            空间设置
          </h2>
          <div className="case-settings">
            <Switch
              label="通知"
              checked={notifications}
              onChange={(event) => setNotifications(event.target.checked)}
            />
            <Field label="每页项目数">
              <NumberInput
                value={limit}
                min={5}
                max={50}
                step={5}
                onValueChange={setLimit}
              />
            </Field>
            <ColorPicker
              label="空间颜色"
              value={accent}
              onValueChange={setAccent}
            />
            <Button onClick={() => setNotice("演示设置已保存")}>
              保存设置
            </Button>
          </div>
        </section>
      )}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing === null ? "新建项目" : "编辑项目"}
      >
        <form
          className="case-settings"
          onSubmit={(event) => {
            event.preventDefault();
            saveProject();
          }}
        >
          <Field label="项目名称" error={error || undefined}>
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              autoFocus
            />
          </Field>
          <Field label="负责人">
            <Select
              value={owner}
              onValueChange={setOwner}
              options={["林", "陈", "周"].map((person) => ({
                value: person,
                label: person,
              }))}
            />
          </Field>
          <Field label="状态">
            <Select
              value={projectStatus}
              onValueChange={setProjectStatus}
              options={statusOptions}
            />
          </Field>
          <Layout className="case-toolbar" label="保存项目">
            <Button type="submit" variant="dark">
              保存
            </Button>
            <Button variant="plain" onClick={() => setOpen(false)}>
              取消
            </Button>
          </Layout>
        </form>
      </Dialog>
      <Toast
        open={!!notice}
        message={notice}
        onOpenChange={(show) => {
          if (!show) setNotice("");
        }}
      />
    </PageShell>
  );
}
export function CasePractice({ id }: { id: string }) {
  if (id === "case-detail") return <DetailCase />;
  if (id === "case-workspace") return <Workspace />;
  if (id === "case-saas") return <Saas />;
  return <Gallery />;
}
