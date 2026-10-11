import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  ConfirmDialog,
  Dialog,
  EmptyState,
  Field,
  Icon,
  Input,
  SearchField,
  Select,
  Switch,
} from "../src/ui";
import { AppearanceButton, StorageNotice, useLocalState } from "./local-state";
import {
  environments,
  initialProject,
  launchKey,
  readProject,
  teams,
  variableError,
  type LaunchProject,
  type Variable,
} from "./vercel-data";
import "./vercel.css";

type Section = "general" | "build" | "environment" | "security";
function NameSettings({
  project,
  onSave,
}: {
  project: LaunchProject;
  onSave: (patch: Partial<LaunchProject>) => void;
}) {
  const [name, setName] = useState(project.name);
  const [error, setError] = useState("");
  return (
    <section className="launch-section">
      <h2>项目名称</h2>
      <p>用于工作空间识别项目，也作为默认部署地址的一部分。</p>
      <form
        className="launch-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) {
            setError("使用小写字母、数字和中间连字符，最多 64 个字符。");
            return;
          }
          setError("");
          onSave({ name });
        }}
      >
        <Field><Field.Label>名称</Field.Label><Field.Control>
          <Input value={name} onChange={(event) => setName(event.target.value)}/>
        </Field.Control>{error || undefined ? <Field.Error>{error || undefined}</Field.Error> : null}</Field>
        <div className="launch-section-footer">
          <span>
            {name !== project.name ? "有未保存更改" : "当前名称已保存"}
          </span>
          <Button
            type="submit"
            emphasis="strong"
            disabled={name === project.name}
          >
            保存名称
          </Button>
        </div>
      </form>
    </section>
  );
}
function RootSettings({
  project,
  onSave,
}: {
  project: LaunchProject;
  onSave: (patch: Partial<LaunchProject>) => void;
}) {
  const [root, setRoot] = useState(project.root);
  const [error, setError] = useState("");
  return (
    <section className="launch-section">
      <h2>根目录</h2>
      <p>构建使用此目录中的代码与配置。留在仓库根目录时使用 ./。</p>
      <form
        className="launch-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (
            !root.trim() ||
            root.startsWith("/") ||
            root.split("/").includes("..")
          ) {
            setError("请输入仓库内的相对目录。");
            return;
          }
          setError("");
          onSave({ root: root.trim() });
        }}
      >
        <Field><Field.Label>根目录</Field.Label><Field.Control>
          <Input value={root} onChange={(event) => setRoot(event.target.value)}/>
        </Field.Control>{error || undefined ? <Field.Error>{error || undefined}</Field.Error> : null}</Field>
        <div className="launch-section-footer">
          <span>
            {root !== project.root ? "有未保存更改" : "当前目录已保存"}
          </span>
          <Button
            type="submit"
            emphasis="strong"
            disabled={root === project.root}
          >
            保存目录
          </Button>
        </div>
      </form>
    </section>
  );
}
function BuildSettings({
  project,
  onSave,
}: {
  project: LaunchProject;
  onSave: (patch: Partial<LaunchProject>) => void;
}) {
  const [framework, setFramework] = useState(project.framework);
  const [build, setBuild] = useState(project.build);
  const [output, setOutput] = useState(project.output);
  const [install, setInstall] = useState(project.install);
  const [override, setOverride] = useState(project.override);
  const [error, setError] = useState("");
  const dirty =
    framework !== project.framework ||
    build !== project.build ||
    output !== project.output ||
    install !== project.install ||
    override !== project.override;
  return (
    <section className="launch-section">
      <h2>框架与构建</h2>
      <p>框架预设提供默认构建行为。启用覆盖后可以保存自己的命令与输出目录。</p>
      <form
        className="launch-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (
            override &&
            (!build.trim() || !output.trim() || !install.trim())
          ) {
            setError("构建命令、输出目录与安装命令均不能为空。");
            return;
          }
          setError("");
          onSave({ framework, build, output, install, override });
        }}
      >
        <Field><Field.Label>框架预设</Field.Label><Field.Control>
          <Select value={framework} onValueChange={(value) => {
        if (!["vite", "next", "other"].includes(value))
            return;
        setFramework(value);
        if (!override) {
            setBuild("npm run build");
            setOutput(value === "next" ? ".next" : "dist");
        }
    }}>{[
    { value: "vite", label: "Vite" },
    { value: "next", label: "Next.js" },
    { value: "other", label: "Other" },
].map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
        </Field.Control></Field>
        <Switch checked={override} onChange={(event) => {
        setOverride(event.target.checked);
        if (!event.target.checked) {
            setBuild("npm run build");
            setOutput(framework === "next" ? ".next" : "dist");
            setInstall("npm ci");
        }
    }}>覆盖默认构建配置</Switch>
        <Field><Field.Label>构建命令</Field.Label><Field.Control>
          <Input readOnly={!override} value={build} onChange={(event) => setBuild(event.target.value)}/>
        </Field.Control></Field>
        <Field><Field.Label>输出目录</Field.Label><Field.Control>
          <Input readOnly={!override} value={output} onChange={(event) => setOutput(event.target.value)}/>
        </Field.Control></Field>
        <Field><Field.Label>安装命令</Field.Label><Field.Control>
          <Input readOnly={!override} value={install} onChange={(event) => setInstall(event.target.value)}/>
        </Field.Control></Field>
        {error && <Alert tone="danger"><Alert.Icon><Icon name="close" size={16}/></Alert.Icon><Alert.Body>{error}</Alert.Body></Alert>}
        <div className="launch-section-footer">
          <span>{dirty ? "有未保存更改" : "构建配置已保存"}</span>
          <Button emphasis="strong" type="submit" disabled={!dirty}>
            保存构建配置
          </Button>
        </div>
      </form>
    </section>
  );
}
function VariableEditor({
  variable,
  variables,
  onSave,
  onClose,
}: {
  variable: Variable;
  variables: Variable[];
  onSave: (variable: Variable) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(variable);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  return (
    <Dialog open onOpenChange={(open) => {
        if (!open)
            onClose();
    }}>
      <Dialog.Header>
        <Dialog.Title>
          {variables.some((item) => item.id === variable.id)
            ? "编辑环境变量"
            : "新增环境变量"}
        </Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
      <form className="launch-form" noValidate onSubmit={(event) => {
        event.preventDefault();
        const next = { ...draft, name: draft.name.trim() };
        const message = variableError(next, variables);
        if (message) {
            setError(message);
            return;
        }
        onSave(next);
    }}>
        <Field required><Field.Label>变量名称</Field.Label><Field.Control>
          <Input autoFocus value={draft.name} onChange={(event) => setDraft((previous) => ({
        ...previous,
        name: event.target.value,
    }))} placeholder="PUBLIC_API_URL"/>
        </Field.Control></Field>
        <Field required><Field.Label>变量值</Field.Label><Field.Control>
          <Input type={show ? "text" : "password"} value={draft.value} onChange={(event) => setDraft((previous) => ({
        ...previous,
        value: event.target.value,
    }))}/>
        </Field.Control></Field>
        <Switch checked={show} onChange={(event) => setShow(event.target.checked)}>显示变量值</Switch>
        <fieldset className="launch-environments">
          <legend>应用环境</legend>
          {environments.map((item) => (<Checkbox key={item.value} checked={draft.targets.includes(item.value)} onChange={(event) => {
        const checked = event.target.checked;
        setDraft((previous) => ({
            ...previous,
            targets: checked
                ? [...previous.targets, item.value]
                : previous.targets.filter((value) => value !== item.value),
        }));
    }}>{item.label}</Checkbox>))}
        </fieldset>
        {error && <Alert tone="danger"><Alert.Icon><Icon name="close" size={16}/></Alert.Icon><Alert.Body>{error}</Alert.Body></Alert>}
        <ButtonGroup variant="plain" aria-label="环境变量操作">
          <Button emphasis="strong" type="submit">
            保存变量
          </Button>
          <Button onClick={onClose}>取消</Button>
        </ButtonGroup>
      </form>
    </Dialog.Body></Dialog>
  );
}
export default function VercelPage() {
  const {
    value: project,
    setValue: setProject,
    failed,
  } = useLocalState(launchKey, initialProject, readProject);
  const [section, setSection] = useState<Section>("general");
  const [query, setQuery] = useState("");
  const [environment, setEnvironment] = useState("all");
  const [variable, setVariable] = useState<Variable | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<Variable | null>(null);
  const [transfer, setTransfer] = useState(false);
  const [destination, setDestination] = useState("studio");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  function save(patch: Partial<LaunchProject>) {
    setProject((previous) => ({ ...previous, ...patch }));
  }
  const rows = project.variables.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) &&
      (environment === "all" || item.targets.includes(environment)),
  );
  const navigation = [
    { value: "general", label: "常规" },
    { value: "build", label: "构建与输出" },
    { value: "environment", label: "环境变量" },
    { value: "security", label: "部署保护" },
  ] as const;
  return (
    <div className="launch-shell">
      <header className="launch-topbar">
        <div>
          <Icon name="grid" />
          <span>Launch</span>
          <span>/</span>
          <span>
            {teams.find((item) => item.value === project.team)!.label}
          </span>
          <span>/</span>
          <span>{project.name}</span>
        </div>
        <AppearanceButton />
      </header>
      <main className="launch-main">
        {project.deleted?<EmptyState ><EmptyState.Title>{"项目已删除"}</EmptyState.Title><EmptyState.Description>{"当前工作空间中已没有这个项目。"}</EmptyState.Description><EmptyState.Actions>{<Button emphasis="strong" onClick={()=>{setProject(initialProject());setSection("general");}}>创建项目</Button>}</EmptyState.Actions></EmptyState>:<><header className="launch-heading"><div><span className="launch-muted">项目 / {project.name}</span><h1>项目设置</h1></div><Badge emphasis="quiet">生产项目</Badge></header><StorageNotice failed={failed}/><div className="launch-layout"><nav aria-label="设置分类">{navigation.map(item=><Button key={item.value} emphasis="quiet" aria-current={section===item.value?"page":undefined} onClick={()=>setSection(item.value)}>{item.label}</Button>)}</nav><div className="launch-settings">{section==="general"?<><NameSettings project={project} onSave={save}/><RootSettings project={project} onSave={save}/><section className="launch-section"><h2>转移项目</h2><p>将项目及其配置移动到另一个团队。请先确认目标团队。</p><div className="launch-section-footer"><span>当前归属：{teams.find(item=>item.value===project.team)!.label}</span><Button onClick={()=>{setDestination(project.team==="atlas"?"studio":"atlas");setTransfer(true);}}>转移项目</Button></div></section><section className="launch-section"><h2>删除项目</h2><p>移除项目及环境变量。此操作无法撤销。</p><div className="launch-section-footer"><span>需要输入项目名称确认</span><Button tone="danger" onClick={()=>{setConfirmation("");setDeleteError("");setDeleteOpen(true);}}>删除项目</Button></div></section></>:section==="build"?<BuildSettings project={project} onSave={save}/>:section==="environment"?<section className="launch-section"><div className="launch-environment-heading"><div><h2>环境变量</h2><p>为不同环境维护独立配置。值默认隐藏，按需显示。</p></div><Button emphasis="strong" onClick={()=>setVariable({id:crypto.randomUUID(),name:"",value:"",targets:["preview"]})}>{((icon: Parameters<typeof Icon>[0]["name"] | undefined) => icon === undefined ? null : <Button.Icon><Icon name={icon} /></Button.Icon>)("plus")}<Button.Label>新增变量</Button.Label></Button></div><div className="launch-variable-tools"><SearchField aria-label="搜索环境变量" placeholder="搜索变量名称…" value={query} onValueChange={setQuery}/><Select aria-label="环境筛选" value={environment} onValueChange={setEnvironment}>{([{value:"all",label:"全部环境"},...environments]).map(item => <Select.Item key={item.value} value={item.value} disabled={'disabled' in item ? item.disabled as boolean : undefined}>{item.label}</Select.Item>)}</Select></div>{rows.length?<ul className="launch-variables">{rows.map(item=><li key={item.id}><div><h3>{item.name}</h3><p className="launch-variable-value">{revealed.has(item.id)?item.value:"••••••••"}</p><div className="launch-targets">{item.targets.map(value=><Badge key={value} emphasis="quiet">{environments.find(option=>option.value===value)!.label}</Badge>)}</div></div><ButtonGroup variant="plain" aria-label={`${item.name} 操作`}><Button size="sm" onClick={()=>setRevealed(previous=>{const next=new Set(previous);if(next.has(item.id))next.delete(item.id);else next.add(item.id);return next;})}>{revealed.has(item.id)?"隐藏":"显示"}</Button><Button size="sm" onClick={()=>setVariable(item)}>编辑</Button><Button size="sm" tone="danger" onClick={()=>setRemoving(item)}>删除</Button></ButtonGroup></li>)}</ul>:<EmptyState ><EmptyState.Title>{"没有匹配的变量"}</EmptyState.Title><EmptyState.Description>{"调整筛选条件，或新增一个变量。"}</EmptyState.Description></EmptyState>}</section>:<section className="launch-section"><h2>部署访问保护</h2><p>对预览部署启用身份验证，让团队在发布之前协作检查。</p><Switch checked={project.protection} onChange={event=>save({protection:event.target.checked})}>{"保护预览部署"}</Switch><p className="launch-muted">{project.protection?"预览部署需要团队身份验证。":"预览部署允许通过链接访问。"}</p></section>}</div></div></>}
        {variable && (
          <VariableEditor
            key={variable.id}
            variable={variable}
            variables={project.variables}
            onClose={() => setVariable(null)}
            onSave={(item) => {
              save({
                variables: project.variables.some((row) => row.id === item.id)
                  ? project.variables.map((row) =>
                      row.id === item.id ? item : row,
                    )
                  : [...project.variables, item],
              });
              setRevealed(new Set());
              setVariable(null);
            }}
          />
        )}
        <ConfirmDialog open={removing !== null} onOpenChange={(open) => {
            if (!open) setRemoving(null);
          }} tone="danger" onConfirm={() => {
            save({
              variables: project.variables.filter(
                (item) => item.id !== removing?.id,
              ),
            });
            setRemoving(null);
          }}><ConfirmDialog.Header><ConfirmDialog.Title>{`删除 ${removing?.name ?? "环境变量"}？`}</ConfirmDialog.Title><ConfirmDialog.Description>{"该变量将从所有已配置环境中移除。"}</ConfirmDialog.Description></ConfirmDialog.Header><ConfirmDialog.Footer><ConfirmDialog.CancelAction>取消</ConfirmDialog.CancelAction><ConfirmDialog.ConfirmAction>{"删除变量"}</ConfirmDialog.ConfirmAction></ConfirmDialog.Footer></ConfirmDialog>
        <Dialog open={transfer} onOpenChange={setTransfer}><Dialog.Header><Dialog.Title>转移项目</Dialog.Title></Dialog.Header><Dialog.Body>
          <form className="launch-form" onSubmit={(event) => {
        event.preventDefault();
        if (destination === project.team)
            return;
        save({ team: destination });
        setTransfer(false);
    }}>
            <p>项目配置与环境变量将随项目一起转移。</p>
            <Field><Field.Label>目标团队</Field.Label><Field.Control>
              <Select value={destination} onValueChange={(value) => {
        if (teams.some((item) => item.value === value))
            setDestination(value);
    }}>{teams.filter((item) => item.value !== project.team).map(item => <Select.Item key={item.value} value={item.value} disabled={(item as { disabled?: boolean }).disabled}>{item.label}</Select.Item>)}</Select>
            </Field.Control></Field>
            <Button type="submit" emphasis="strong">
              确认转移
            </Button>
          </form>
        </Dialog.Body></Dialog>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}><Dialog.Header><Dialog.Title>确认删除项目</Dialog.Title></Dialog.Header><Dialog.Body>
          <form className="launch-form" noValidate onSubmit={(event) => {
        event.preventDefault();
        if (confirmation !== project.name) {
            setDeleteError("项目名称不一致。");
            return;
        }
        save({ deleted: true, variables: [] });
        setDeleteOpen(false);
    }}>
            <p>
              输入 <strong>{project.name}</strong>，确认删除项目及环境变量。
            </p>
            <Field><Field.Label>确认项目名称</Field.Label><Field.Control>
              <Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)}/>
            </Field.Control>{deleteError || undefined ? <Field.Error>{deleteError || undefined}</Field.Error> : null}</Field>
            <ButtonGroup variant="plain" aria-label="删除项目操作">
              <Button type="submit" emphasis="strong" tone="danger">
                确认删除
              </Button>
              <Button onClick={() => setDeleteOpen(false)}>取消</Button>
            </ButtonGroup>
          </form>
        </Dialog.Body></Dialog>
      </main>
    </div>
  );
}
