import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { useUiMotion } from "./ui/motion";
import {
  Button,
  Dialog,
  Field,
  Input,
  Icon,
  NumberInput,
  Select,
  Switch,
  Textarea,
} from "./ui";
import { IconChoice, VisualChoice } from "./api-editors";
import {
  allowedTypes,
  canSort,
  controlsFor,
  newNode,
  nodeContract,
  nodeLabel,
  normalizeTree,
  removable,
  updateNode,
  validateTree,
  type ContentNode,
} from "./playground-tree";
import { type Control, type Value } from "./playground-catalog";

type EditorView = { id: string; childrenOnly?: boolean };
type Session = {
  draft: ContentNode;
  path: EditorView[];
  adding?: string;
  initialAdding?: boolean;
};
function findNode(root: ContentNode, id: string): ContentNode | undefined {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
}
function ancestors(
  root: ContentNode,
  id: string,
  path: string[] = [],
): string[] {
  if (root.id === id) return path;
  for (const child of root.children) {
    const result = ancestors(child, id, [...path, root.type]);
    if (result.length) return result;
  }
  return [];
}
export function NodeParameters({
  node,
  onChange,
  detailed = false,
}: {
  node: ContentNode;
  onChange: (node: ContentNode) => void;
  detailed?: boolean;
}) {
  const fields = controlsFor(node.type);
  const patch = (key: string, value: Value) =>
    onChange({ ...node, props: { ...node.props, [key]: value } });
  const editor = (field: Control) => {
    const value = node.props[field.key] ?? field.exampleValue;
    const label = `API ${field.key}`;
    const choices =
      node.type === "Tabs"
        ? (node.children.find((child) => child.type === "Tabs.List")
            ?.children ?? [])
        : node.children;
    const options =
      field.key === "value" &&
      ["Select", "Tabs", "SegmentedControl"].includes(node.type)
        ? choices.map((child) => ({
            value: String(child.props.value),
            label: String(child.props.value),
          }))
        : (field.options?.map((value) => ({ value, label: value })) ?? []);
    if (field.key === "name" && node.type === "Icon")
      return (
        <IconChoice
          field={field}
          value={String(value)}
          options={options}
          disabled={false}
          onChange={(value) => patch(field.key, value)}
        />
      );
    if (field.control === "boolean")
      return (
        <Switch
          aria-label={label}
          checked={value === true}
          onChange={(event) => patch(field.key, event.target.checked)}
        />
      );
    if (field.control === "number") {
      const bounds =
        field.key === "value" && ["Slider", "NumberInput"].includes(node.type)
          ? {
              min: Number(node.props.min ?? 0),
              max: Number(node.props.max ?? 100),
              step: Number(node.props.step ?? 1),
            }
          : field.key === "value" && node.type === "Progress"
            ? { min: 0, max: Number(node.props.max ?? 100), step: field.step }
            : field.key === "count" && node.type === "SelectionBar"
              ? { min: 0, max: Number(node.props.total ?? 0), step: field.step }
              : field;
      const input = (
        <NumberInput
          aria-label={label}
          value={Number(value)}
          disabled={
            node.type === "Progress" &&
            field.key === "value" &&
            node.props.value === undefined
          }
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          onValueChange={(value) => patch(field.key, value)}
        />
      );
      return node.type === "Progress" && field.key === "value" ? (
        <div className="optional-value-control">
          <Switch
            aria-label="提供 value"
            checked={node.props.value !== undefined}
            onChange={(event) => {
              const props = { ...node.props };
              if (event.target.checked) props.value = field.exampleValue;
              else delete props.value;
              onChange({ ...node, props });
            }}
          />
          {input}
        </div>
      ) : (
        input
      );
    }
    if (field.control === "enum") {
      if (["tone", "emphasis", "size"].includes(field.key))
        return (
          <VisualChoice
            field={field}
            value={String(value)}
            options={options}
            disabled={false}
            onChange={(value) => patch(field.key, value)}
          />
        );
      return (
        <Select
          aria-label={label}
          value={String(value)}
          onValueChange={(value) => patch(field.key, value)}
        >
          {options.map((option) => (
            <Select.Item value={option.value} key={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select>
      );
    }
    return (
      <Input
        aria-label={label}
        value={String(value)}
        onChange={(event) => patch(field.key, event.target.value)}
      />
    );
  };
  const visible = detailed
    ? fields
    : fields.filter((field) =>
        ["enum", "boolean", "number"].includes(field.control),
      );
  return visible.length || (detailed && node.type === "Slider") ? (
    <div className="api-param-grid">
      {detailed && node.type === "Slider" && (
        <div className="api-param">
          <div className="api-param-heading">
            <code>formatValue</code>
          </div>
          <Input
            aria-label="API formatValue"
            value={node.suffix ?? ""}
            onChange={(event) =>
              onChange({ ...node, suffix: event.target.value })
            }
          />
        </div>
      )}
      {visible.map((field) => (
        <div className="api-param" key={field.key}>
          <div className="api-param-heading">
            <code>{field.key}</code>
          </div>
          <div className="api-param-value">{editor(field)}</div>
        </div>
      ))}
    </div>
  ) : null;
}
function NodeRow({
  child,
  sortable,
  canRemove,
  onEdit,
  onRemove,
  onMove,
}: {
  child: ContentNode;
  sortable: boolean;
  canRemove: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onMove: (offset: number) => void;
}) {
  const controls = useDragControls();
  const { transition } = useUiMotion();
  const [dragging, setDragging] = useState(false);
  const summary =
    child.text ??
    child.children.find((node) => node.type === "#text")?.text ??
    child.props.value;
  return (
    <Reorder.Item
      as="div"
      value={child.id}
      className="content-node-row"
      drag={sortable ? "y" : false}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      transition={transition}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      data-dragging={dragging || undefined}
    >
      {sortable && (
        <Button
          shape="square"
          emphasis="quiet"
          className="content-node-handle"
          aria-label={`移动 ${nodeLabel(child)}`}
          aria-keyshortcuts="ArrowUp ArrowDown"
          onPointerDown={(event) => controls.start(event)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            event.preventDefault();
            onMove(event.key === "ArrowUp" ? -1 : 1);
          }}
        >
          <Button.Icon>
            <Icon name="drag" />
          </Button.Icon>
        </Button>
      )}
      <Button
        className="content-node-trigger"
        aria-label={`编辑 ${nodeLabel(child)}`}
        onClick={onEdit}
      >
        <Button.Label>
          <span>{nodeLabel(child)}</span>
          {summary !== undefined && summary !== "" && (
            <span className="content-node-summary">{String(summary)}</span>
          )}
        </Button.Label>
      </Button>
      {canRemove && (
        <Button
          shape="square"
          emphasis="quiet"
          className="content-node-delete"
          aria-label={`删除 ${nodeLabel(child)}`}
          onClick={onRemove}
        >
          <Button.Icon>
            <Icon name="trash" />
          </Button.Icon>
        </Button>
      )}
    </Reorder.Item>
  );
}
function NodeList({
  node,
  ancestors: path,
  onEdit,
  onAdd,
  onManage,
  onChange,
  canRemove,
}: {
  node: ContentNode;
  ancestors: string[];
  onEdit: (id: string) => void;
  onAdd: () => void;
  onManage?: () => void;
  onChange: (node: ContentNode) => void;
  canRemove?: (id: string) => boolean;
}) {
  const sortable = !!canSort(node) && node.children.length > 1;
  const reorder = (ids: string[]) => {
    if (!sortable) return;
    const byId = new Map(node.children.map((child) => [child.id, child]));
    onChange({ ...node, children: ids.map((id) => byId.get(id)!) });
  };
  const move = (index: number, offset: number) => {
    const ids = node.children.map((child) => child.id);
    const target = index + offset;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder(ids);
  };
  return (
    <div className="content-node-list">
      <div className="content-tree-heading">
        <h3>children</h3>
        <div className="content-tree-actions">
          {onManage && (
            <Button
              shape="square"
              size="sm"
              emphasis="quiet"
              aria-label="设置 children"
              onClick={onManage}
            >
              <Button.Icon>
                <Icon name="setting" />
              </Button.Icon>
            </Button>
          )}
          {allowedTypes(node, path).length > 0 && (
            <Button
              shape="square"
              size="sm"
              emphasis="quiet"
              aria-label="添加节点"
              onClick={onAdd}
            >
              <Button.Icon>
                <Icon name="plus" />
              </Button.Icon>
            </Button>
          )}
        </div>
      </div>
      <Reorder.Group
        as="div"
        axis="y"
        className="content-nodes"
        values={node.children.map((child) => child.id)}
        onReorder={reorder}
      >
        {node.children.map((child, index) => (
          <NodeRow
            key={child.id}
            child={child}
            sortable={sortable}
            canRemove={
              canRemove ? canRemove(child.id) : removable(node, child.id)
            }
            onEdit={() => onEdit(child.id)}
            onMove={(offset) => move(index, offset)}
            onRemove={() =>
              onChange({
                ...node,
                children: node.children.filter((node) => node.id !== child.id),
              })
            }
          />
        ))}
      </Reorder.Group>
    </div>
  );
}
export function ContentTreeEditor({
  root,
  onChange,
}: {
  root: ContentNode;
  onChange: (root: ContentNode) => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string>();
  const open = (id: string, adding?: string, childrenOnly = false) => {
    setError(undefined);
    setSession({
      draft: root,
      path: [{ id, childrenOnly }],
      adding,
      initialAdding: !!adding,
    });
  };
  const current = session
    ? findNode(session.draft, session.path.at(-1)!.id)!
    : null;
  const addingTo = session?.adding
    ? findNode(session.draft, session.adding)!
    : null;
  const changeDraft = (node: ContentNode) => {
    setError(undefined);
    setSession(
      (current) =>
        current && {
          ...current,
          draft: updateNode(current.draft, node.id, () => node),
        },
    );
  };
  const candidates = addingTo
    ? allowedTypes(addingTo, ancestors(session!.draft, addingTo.id))
    : [];
  const addNode = (type: string) => {
    if (!session || !addingTo || !candidates.includes(type)) return;
    const child = newNode(type);
    if (type.endsWith(".Feedback"))
      child.props.state = ["success", "pending", "error"].find(
        (state) =>
          !addingTo.children.some(
            (node) => node.type === type && node.props.state === state,
          ),
      )!;
    if (
      [
        "Select.Item",
        "SegmentedControl.Item",
        "Tabs.Trigger",
        "Tabs.Content",
      ].includes(type)
    ) {
      if (type === "Tabs.Content") {
        const tabs =
          session.draft.type === "Tabs"
            ? session.draft
            : findTabs(session.draft, addingTo.id);
        child.props.value =
          tabs?.children
            .find((node) => node.type === "Tabs.List")
            ?.children.find(
              (node) =>
                !addingTo.children.some(
                  (content) =>
                    content.type === type &&
                    content.props.value === node.props.value,
                ),
            )?.props.value ?? "";
      } else {
        let index = 1;
        while (
          addingTo.children.some((node) => node.props.value === `item-${index}`)
        )
          index++;
        child.props.value = `item-${index}`;
      }
    }
    setError(undefined);
    setSession({
      draft: updateNode(session.draft, addingTo.id, (node) => ({
        ...node,
        children: [...node.children, child],
      })),
      path: session.initialAdding
        ? [{ id: child.id }]
        : [...session.path, { id: child.id }],
      adding: undefined,
    });
  };
  return (
    <>
      {nodeContract(root.type).mode !== "none" && (
        <NodeList
          node={root}
          ancestors={[]}
          onEdit={(id) => open(id)}
          onManage={() => open(root.id, undefined, true)}
          onAdd={() => open(root.id, root.id)}
          onChange={onChange}
        />
      )}
      <Dialog
        open={!!session}
        onOpenChange={(open) => {
          if (!open) setSession(null);
        }}
        aria-label={
          addingTo
            ? "添加节点"
            : session?.path.at(-1)?.childrenOnly
              ? "设置 children"
              : `编辑 ${current ? nodeLabel(current) : "节点"}`
        }
      >
        <Dialog.Header>
          <Dialog.Title>
            {addingTo
              ? "添加节点"
              : session?.path.at(-1)?.childrenOnly
                ? "设置 children"
                : `编辑 ${current ? nodeLabel(current) : "节点"}`}
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          {session && (
            <div className="content-node-editor">
              {(session.path.length > 1 ||
                (session.adding && !session.initialAdding)) && (
                <Button
                  emphasis="quiet"
                  onClick={() => {
                    setError(undefined);
                    setSession({
                      ...session,
                      adding: undefined,
                      path: session.adding
                        ? session.path
                        : session.path.slice(0, -1),
                    });
                  }}
                >
                  <Button.Label>返回</Button.Label>
                </Button>
              )}
              {addingTo ? (
                <Field>
                  <Field.Label>节点</Field.Label>
                  <Field.Control>
                    <Select
                      aria-label="节点类型"
                      value=""
                      placeholder="选择节点"
                      onValueChange={addNode}
                    >
                      {candidates.map((type) => (
                        <Select.Item key={type} value={type}>
                          {type === "#text" ? "文字" : type}
                        </Select.Item>
                      ))}
                    </Select>
                  </Field.Control>
                </Field>
              ) : (
                current && (
                  <>
                    {!session.path.at(-1)?.childrenOnly && (
                      <NodeParameters
                        node={current}
                        onChange={changeDraft}
                        detailed
                      />
                    )}
                    {current.type === "#text" ||
                    nodeContract(current.type).mode === "text" ? (
                      <Field>
                        <Field.Label>内容</Field.Label>
                        <Field.Control>
                          <Textarea
                            aria-label="节点内容"
                            value={current.text ?? ""}
                            rows={5}
                            onChange={(event) =>
                              changeDraft({
                                ...current,
                                text: event.target.value,
                              })
                            }
                          />
                        </Field.Control>
                      </Field>
                    ) : (
                      nodeContract(current.type).mode !== "none" && (
                        <NodeList
                          node={current}
                          ancestors={ancestors(session.draft, current.id)}
                          onEdit={(id) => {
                            setError(undefined);
                            setSession({
                              ...session,
                              path: [...session.path, { id }],
                            });
                          }}
                          onAdd={() =>
                            setSession({ ...session, adding: current.id })
                          }
                          onManage={
                            session.path.at(-1)?.childrenOnly
                              ? undefined
                              : () =>
                                  setSession({
                                    ...session,
                                    path: [
                                      ...session.path,
                                      { id: current.id, childrenOnly: true },
                                    ],
                                  })
                          }
                          onChange={changeDraft}
                          canRemove={(id) =>
                            !validateTree(
                              updateNode(session.draft, current.id, (node) => ({
                                ...node,
                                children: node.children.filter(
                                  (child) => child.id !== id,
                                ),
                              })),
                            )
                          }
                        />
                      )
                    )}
                    {!session.path.at(-1)?.childrenOnly &&
                      current.type === "Button" &&
                      ancestors(session.draft, current.id).some((type) =>
                        ["Dialog", "Drawer", "ConfirmDialog"].includes(type),
                      ) && (
                        <Field>
                          <Field.Label>关闭所在弹层</Field.Label>
                          <Field.Control>
                            <Switch
                              aria-label="关闭所在弹层"
                              checked={current.action === "close"}
                              onChange={(event) =>
                                changeDraft({
                                  ...current,
                                  action: event.target.checked
                                    ? "close"
                                    : undefined,
                                })
                              }
                            />
                          </Field.Control>
                        </Field>
                      )}
                  </>
                )
              )}
              {error && (
                <p className="content-editor-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setSession(null)}>
            <Button.Label>取消</Button.Label>
          </Button>
          <Button
            emphasis="strong"
            disabled={!!addingTo}
            onClick={() => {
              if (!session) return;
              const error = validateTree(session.draft);
              if (error) {
                setError(error);
                return;
              }
              onChange(normalizeTree(session.draft));
              setSession(null);
            }}
          >
            <Button.Label>保存</Button.Label>
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
function findTabs(root: ContentNode, id: string): ContentNode | undefined {
  if (root.type === "Tabs" && findNode(root, id)) return root;
  for (const child of root.children) {
    const found = findTabs(child, id);
    if (found) return found;
  }
}
