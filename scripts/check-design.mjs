import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Reuse Vite's CSS parser. This development check adds no runtime dependency.
const require = createRequire(import.meta.url);
const postcss = createRequire(require.resolve("vite/package.json"))("postcss");
const normalize = (s) => s.replace(/\s+/g, " ").trim();
export function loadSources(root) {
  const files = readdirSync(join(root, "src/ui"))
    .filter((file) => /\.(css|tsx)$/.test(file) && !file.includes(".test."))
    .map((file) => `src/ui/${file}`);
  files.push(
    "src/app.css",
    "src/playground.tsx",
    "lab/lab.css",
    "lab/gallery.css",
    "lab/github.css",
    "lab/vercel.css",
  );
  return new Map(
    files.map((file) => [file, readFileSync(join(root, file), "utf8")]),
  );
}

// Only scalar px/ms values and var()/calc() arithmetic are interpreted.
// This is intentionally not a browser cascade, layout engine or visual audit.
function scalar(value, context, seen = new Set()) {
  if (value === undefined) throw new Error("缺少声明");
  let expression = value;
  while (expression.includes("var(")) {
    const start = expression.indexOf("var(");
    let end = start + 4,
      depth = 1;
    for (; end < expression.length && depth; end++) {
      if (expression[end] === "(") depth++;
      if (expression[end] === ")") depth--;
    }
    if (depth) throw new Error("未闭合的变量表达式");
    const [key, ...fallback] = expression.slice(start + 4, end - 1).split(",");
    const name = key.trim();
    if (seen.has(name)) throw new Error(`循环变量 ${name}`);
    const next = new Set([...seen, name]);
    const result = scalar(
      context[name] ??
        (fallback.length ? fallback.join(",").trim() : undefined),
      context,
      next,
    );
    expression =
      expression.slice(0, start) + `(${result})` + expression.slice(end);
  }
  expression = expression
    .replace(/calc\(/g, "(")
    .replace(/(\d)(px|ms)\b/g, "$1");
  const parts = expression.match(/\d*\.?\d+|[()+*/-]/g) ?? [];
  if (parts.join("") !== expression.replace(/\s/g, ""))
    throw new Error(`无法静态计算 ${value}`);
  let pos = 0;
  const atom = () => {
    if (parts[pos] === "-") {
      pos++;
      return -atom();
    }
    if (parts[pos] === "(") {
      pos++;
      const n = sum();
      if (parts[pos++] !== ")") throw new Error("括号不匹配");
      return n;
    }
    const token = parts[pos++];
    if (!token || !/^\d*\.?\d+$/.test(token)) throw new Error("非法数值");
    return Number(token);
  };
  const product = () => {
    let n = atom();
    while (["*", "/"].includes(parts[pos])) {
      const operator = parts[pos++],
        right = atom();
      n = operator === "*" ? n * right : n / right;
    }
    return n;
  };
  const sum = () => {
    let n = product();
    while (["+", "-"].includes(parts[pos])) {
      const operator = parts[pos++],
        right = product();
      n = operator === "+" ? n + right : n - right;
    }
    return n;
  };
  const result = sum();
  if (pos !== parts.length || !Number.isFinite(result))
    throw new Error("无效的计算结果");
  return result;
}

export function checkDesign(sources) {
  const css = [],
    issues = [],
    checks = [];
  for (const [file, source] of sources)
    if (file.endsWith(".css")) {
      postcss
        .parse(source, { from: file })
        .walkRules((rule) => css.push({ file, rule }));
    }
  const globals = {};
  for (const { rule } of css)
    if (rule.selector === ":root") {
      for (const node of rule.nodes)
        if (node.type === "decl" && node.prop.startsWith("--"))
          globals[node.prop] = node.value;
    }
  const issue = (code, file, line, message) =>
    issues.push({ code, file, line, message });
  const context = (file, selectors, inherited = globals) => {
    const result = { ...inherited };
    for (const selector of selectors) {
      const matches = css.filter(
        (entry) =>
          entry.file === file &&
          entry.rule.parent.type === "root" &&
          normalize(entry.rule.selector) === normalize(selector),
      );
      if (!matches.length) throw new Error(`找不到规则 ${selector}`);
      for (const { rule } of matches) {
        for (const node of rule.nodes)
          if (node.type === "decl") result[node.prop] = node.value;
      }
    }
    return result;
  };
  const check = (id, file, selectors, run) => {
    const line =
      css.find(
        (entry) =>
          entry.file === file &&
          normalize(entry.rule.selector) === normalize(selectors[0]),
      )?.rule.source.start.line ?? 1;
    try {
      const evidence = run();
      checks.push({ id, file, line, evidence });
    } catch (error) {
      issue(id, file, line, error.message);
    }
  };
  const equal = (a, b, description) => {
    if (Math.abs(a - b) > 0.01)
      throw new Error(`${description}：实际 ${a}，应为 ${b}`);
    return `${description} = ${a}`;
  };
  const components = "src/ui/components.css",
    controls = "src/ui/controls.css";
  check("search-keycap", components, [".ui-search"], () => {
    const outer = context(components, [".ui-search"]);
    const inner = context(
      components,
      [".ui-keycap", ".ui-search > .ui-keycap"],
      outer,
    );
    const inset = scalar("var(--ui-search-inset)", outer);
    equal(
      (scalar(outer.height, outer) - scalar(inner.height, inner)) / 2,
      inset,
      "键帽垂直 inset",
    );
    return equal(
      scalar(inner["border-radius"], inner) + inset,
      scalar(outer["border-radius"], outer),
      "搜索框与键帽轮廓",
    );
  });
  check(
    "gallery-browse-spacing",
    "lab/gallery.css",
    [".gallery-header-tools"],
    () => {
      const outer = context("lab/gallery.css", [".gallery-header-tools"]);
      const inner = context("lab/gallery.css", [".gallery-browse-controls"]);
      return equal(
        scalar(outer.gap, outer),
        scalar(inner.gap, inner),
        "同级浏览工具间距",
      );
    },
  );
  check("plain-actions-height", components, [".ui-button-group--plain"], () => {
    const group = context(components, [
      ".ui-button-group",
      ".ui-button-group--plain",
    ]);
    return equal(scalar(group.padding, group), 0, "plain 组不增加外高");
  });
  check(
    "description-list-type",
    "src/ui/typography.css",
    [".ui-description-list"],
    () => {
      const list = context("src/ui/typography.css", [".ui-description-list"]);
      return equal(scalar(list["font-size"], list), 13, "文本列表字号");
    },
  );
  for (const [id, selector, size, weight] of [
    ["body-text-type", ".ui-text", 14, 400],
    ["text-list-type", ".ui-text-list", 13, 400],
    ["heading-type", ".ui-heading", 16, 500],
  ]) {
    check(id, "src/ui/typography.css", [selector], () => {
      const c = context("src/ui/typography.css", [selector]);
      equal(scalar(c["font-size"], c), size, "文本角色字号");
      return equal(scalar(c["font-weight"], c), weight, "文本角色字重");
    });
  }
  check("action-row-scale", components, [".ui-action-row"], () => {
    const row = context(components, [".ui-action-row"]);
    if (row["align-items"] !== "center" || row["flex-wrap"] !== "wrap")
      throw new Error("动作行须保留对齐与完整单元换行");
    for (const { file, rule } of css) {
      if (file !== components || !rule.selector.startsWith(".ui-action-row"))
        continue;
      for (const node of rule.nodes) {
        if (
          node.type === "decl" &&
          /^(height|min-height|max-height|width|min-width|max-width|padding(?:-.+)?|--ui-action-row-height)$/.test(
            node.prop,
          )
        )
          throw new Error("动作行不能补偿或改写控件外部尺度");
      }
    }
    return "动作行仅排列完整单元，不叠加高度";
  });
  for (const [
    id,
    parentSelectors,
    buttonSelectors,
    outerHeight,
    innerHeight,
    innerRadius,
  ] of [
    ["group-md-height", [".ui-button-group"], [".ui-button"], 36, 28, 8],
    [
      "group-sm-height",
      [
        ".ui-button-group",
        ".ui-button-group:has(> .ui-button--sm):not( :has(> :is(.ui-button--md, .ui-external)) )",
      ],
      [".ui-button", ".ui-button--sm"],
      32,
      24,
      4,
    ],
  ]) {
    check(id, components, parentSelectors, () => {
      const parent = context(components, parentSelectors);
      const child = context(
        components,
        [
          ...buttonSelectors,
          ".ui-button-group:not(.ui-button-group--plain) > :is(.ui-button, .ui-external)",
        ],
        parent,
      );
      const icon = context(
        components,
        [
          ".ui-icon-button",
          ".ui-button-group:not(.ui-button-group--plain) > .ui-icon-button",
        ],
        child,
      );
      equal(scalar(parent.height, parent), outerHeight, "完整组外高");
      equal(scalar(child.height, child), innerHeight, "组内项高度");
      equal(scalar(icon.width, icon), innerHeight, "组内图标项宽度");
      equal(scalar(child["border-radius"], child), innerRadius, "组内反馈圆角");
      return equal(
        scalar(child.height, child) + 2 * scalar(parent.padding, parent),
        scalar(parent.height, parent),
        "内部高度加 inset 等于完整外高",
      );
    });
  }
  check(
    "description-list-spacing",
    "src/ui/typography.css",
    [".ui-description-list"],
    () => {
      const list = context("src/ui/typography.css", [".ui-description-list"]);
      const row = context(
        "src/ui/typography.css",
        [".ui-description-list > div"],
        list,
      );
      equal(scalar("var(--ui-description-inset)", row), 16, "说明行上下留白");
      equal(
        scalar("var(--ui-description-inline-inset)", row),
        20,
        "说明行左右留白",
      );
      return equal(scalar(row.gap, row), 20, "说明列间距");
    },
  );
  check("prototype-task-row", "lab/lab.css", [".prototype-task-row"], () => {
    const c = context("lab/lab.css", [".prototype-task-row"]);
    equal(
      scalar(c["padding-block"], c),
      scalar("var(--prototype-row-inset)", c),
      "任务行上下 inset",
    );
    return equal(
      scalar(c["min-height"], c),
      scalar(
        "calc(var(--ui-size-control) + var(--prototype-row-inset) * 2)",
        c,
      ),
      "任务行外高",
    );
  });
  check("prototype-toolbar", "lab/lab.css", [".prototype-toolbar"], () => {
    const c = context("lab/lab.css", [".prototype-toolbar"]);
    if (c["flex-wrap"] !== "wrap")
      throw new Error("任务工具行必须允许按内容换行");
    return equal(
      scalar(c.gap, c),
      scalar("var(--ui-gap-control)", c),
      "任务工具行间距",
    );
  });
  check("gallery-stage", "lab/gallery.css", [".gallery-stage"], () => {
    const c = context("lab/gallery.css", [".gallery-stage"]);
    equal(
      scalar(c.padding, c),
      scalar("var(--gallery-stage-inset)", c),
      "交互作品宿主 inset",
    );
    return equal(
      scalar(c["border-radius"], c),
      scalar("calc(var(--ui-radius-control) + var(--gallery-stage-inset))", c),
      "交互作品宿主圆角",
    );
  });
  check("gallery-tools", "lab/gallery.css", [".gallery-tool-row"], () => {
    const c = context("lab/gallery.css", [".gallery-tool-row"]);
    if (c["flex-wrap"] !== "wrap") throw new Error("作品工具行需要允许换行");
    return equal(
      scalar(c.gap, c),
      scalar("var(--ui-space-5)", c),
      "作品工具单元间距",
    );
  });
  check("forge-issue-row", "lab/github.css", [".forge-issue-row"], () => {
    const c = context("lab/github.css", [".forge-issue-row"]);
    equal(
      scalar(c["padding-block"], c),
      scalar("var(--forge-row-inset)", c),
      "问题行 inset",
    );
    return equal(
      scalar(c["min-height"], c),
      scalar("calc(var(--ui-size-control) + var(--forge-row-inset) * 2)", c),
      "问题行最低外高",
    );
  });
  check(
    "launch-section-footer",
    "lab/vercel.css",
    [".launch-section-footer"],
    () => {
      const c = context("lab/vercel.css", [".launch-section-footer"]);
      if (c["flex-wrap"] !== "wrap")
        throw new Error("独立保存操作需要允许换行");
      return equal(
        scalar(c.gap, c),
        scalar("var(--ui-gap-control)", c),
        "独立保存操作间距",
      );
    },
  );
  for (const [name, selectors, radius, height] of [
    ["button-md", [".ui-button"], "--ui-radius-control", "--ui-size-control"],
    [
      "button-sm",
      [".ui-button", ".ui-button--sm"],
      "--ui-radius-sm",
      "--ui-size-control-sm",
    ],
    [
      "icon-md",
      [".ui-button", ".ui-icon-button"],
      "--ui-radius-control",
      "--ui-size-control",
    ],
    [
      "icon-sm",
      [
        ".ui-button",
        ".ui-button--sm",
        ".ui-icon-button",
        ".ui-icon-button.ui-button--sm",
      ],
      "--ui-radius-sm",
      "--ui-size-control-sm",
    ],
  ])
    check(name, components, selectors, () => {
      const c = context(components, selectors);
      return [
        equal(scalar(c["border-radius"], c), scalar(c[radius], c), "圆角"),
        equal(scalar(c.height, c), scalar(c[height], c), "高度"),
      ];
    });
  for (const [
    id,
    file,
    parentSelectors,
    childSelectors,
    insetProperty,
    border,
  ] of [
    [
      "group-md",
      components,
      [".ui-button-group"],
      [
        ".ui-button",
        ".ui-button-group:not(.ui-button-group--plain) > :is(.ui-button, .ui-external)",
      ],
      "padding",
      0,
    ],
    [
      "group-sm",
      components,
      [
        ".ui-button-group",
        ".ui-button-group:has(> .ui-button--sm):not( :has(> :is(.ui-button--md, .ui-external)) )",
      ],
      [
        ".ui-button",
        ".ui-button--sm",
        ".ui-button-group:not(.ui-button-group--plain) > :is(.ui-button, .ui-external)",
      ],
      "padding",
      0,
    ],
    [
      "selector",
      components,
      [".ui-selection-track"],
      [".ui-selection-indicator"],
      "padding",
      0,
    ],
    [
      "select-menu",
      controls,
      [".ui-select-menu"],
      [".ui-select-option"],
      "padding",
      0,
    ],
    [
      "color-picker",
      "src/ui/color-picker.css",
      [".ui-color-picker"],
      [".ui-color-area"],
      "padding",
      1,
    ],
  ])
    check(id, file, parentSelectors, () => {
      const p = context(file, parentSelectors),
        c = context(file, childSelectors, p);
      // Use the actual border declaration for the picker, not a second radius constant.
      const edge = border ? scalar(p.border.split(/\s+/)[0], p) : 0;
      return equal(
        scalar(p["border-radius"], p),
        scalar(c["border-radius"], c) + scalar(p[insetProperty], p) + edge,
        "外圆角 = 内圆角 + padding + 边缘",
      );
    });
  check("preview", "src/app.css", [".practice-layout"], () => {
    const p = context("src/app.css", [".practice-layout"]);
    const c = context(
      "src/app.css",
      [".practice-layout > :is(.practice-stage, .api-panel)"],
      p,
    );
    return equal(
      scalar(p["border-radius"], p),
      scalar(c["border-radius"], c) +
        scalar(p.padding, p) +
        scalar(p.border.split(/\s+/)[0], p),
      "预览外圆角 = 内圆角 + padding + border",
    );
  });
  check("toolbar-height", components, [".ui-selection-track"], () => {
    const button = context(components, [".ui-button"]),
      track = context(components, [".ui-selection-track"]);
    return equal(
      scalar(button.height, button),
      scalar(track["min-height"], track),
      "默认按钮与选择轨道外高",
    );
  });
  check("api-choice-scale", "src/app.css", [".api-tone-swatch"], () => {
    const swatch = context("src/app.css", [".api-tone-swatch"]);
    const button = context(components, [".ui-button"]);
    equal(
      scalar(swatch.height, swatch),
      scalar(button.height, button),
      "色样与普通控件外高",
    );
    return equal(
      scalar(swatch["border-radius"], swatch),
      scalar(button["border-radius"], button),
      "色样与普通控件圆角",
    );
  });
  check(
    "api-content-scale",
    "src/app.css",
    [".ui-button.api-content-trigger"],
    () => {
      const block = context("src/app.css", [".ui-button.api-content-trigger"]);
      const button = context(components, [".ui-button"]);
      return equal(
        scalar(block["min-height"], block),
        scalar(button.height, button),
        "内容入口最小外高与普通控件一致",
      );
    },
  );
  for (const { file, rule } of css)
    for (const node of rule.nodes)
      if (node.type === "decl") {
        if (
          /^border(?:-(?:top|bottom)-(?:left|right))?-radius$/.test(
            node.prop,
          ) &&
          /\b\d+(?:\.\d+)?px\b/.test(node.value) &&
          !node.value.includes("calc(")
        )
          issue(
            "literal-radius",
            file,
            node.source.start.line,
            `${rule.selector} 的圆角绕过语义变量：${node.value}`,
          );
        if (
          node.prop === "font-weight" &&
          /:hover|:active|:focus|\[aria-(?:checked|selected|pressed)/.test(
            rule.selector,
          )
        )
          issue(
            "state-weight",
            file,
            node.source.start.line,
            `${rule.selector} 在交互状态声明字重`,
          );
      }
  const cssByComponent = {
    Button: [components, [".ui-button"]],
    ButtonGroup: [components, [".ui-button-group"]],
    SegmentedControl: [components, [".ui-selection-track"]],
    SearchField: [components, [".ui-search"]],
    SelectionBar: [controls, [".ui-selection-bar"]],
    Toast: [controls, [".ui-toast"]],
  };
  for (const [file, source] of sources)
    if (file.endsWith(".tsx")) {
      const ast = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      const visit = (node) => {
        if (ts.isJsxElement(node)) {
          const attrs = node.openingElement.attributes.properties;
          const toolbar = attrs.some(
            (attr) =>
              ts.isJsxAttribute(attr) &&
              attr.name.getText(ast) === "className" &&
              attr.initializer &&
              ts.isStringLiteral(attr.initializer) &&
              attr.initializer.text.split(/\s/).includes("practice-toolbar"),
          );
          if (toolbar) {
            const inspect = (child) => {
              if (
                (ts.isJsxOpeningElement(child) ||
                  ts.isJsxSelfClosingElement(child)) &&
                child.tagName.getText(ast) === "Button"
              ) {
                const size = child.attributes.properties.find(
                  (attr) =>
                    ts.isJsxAttribute(attr) &&
                    attr.name.getText(ast) === "size",
                );
                if (
                  size &&
                  !(
                    size.initializer &&
                    ts.isStringLiteral(size.initializer) &&
                    ["md", "default"].includes(size.initializer.text)
                  )
                ) {
                  issue(
                    "toolbar-size",
                    file,
                    ast.getLineAndCharacterOfPosition(child.getStart(ast))
                      .line + 1,
                    "预览工具栏按钮必须与默认选择器外高一致；不能使用 sm 或未核实的动态尺寸",
                  );
                }
              }
              ts.forEachChild(child, inspect);
            };
            node.children.forEach(inspect);
          }
        }
        if (
          ts.isPropertyAssignment(node) &&
          node.name.getText(ast) === "borderRadius"
        ) {
          const line =
            ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
          const value = ts.isStringLiteral(node.initializer)
            ? node.initializer.text
            : null;
          let owner = node.parent;
          while (owner && !ts.isFunctionDeclaration(owner))
            owner = owner.parent;
          const name = owner?.name?.text,
            target = cssByComponent[name];
          if (!value?.includes("var(--ui-"))
            issue("motion-radius", file, line, "内联圆角必须引用共享 CSS 变量");
          else if (target) {
            try {
              const c = context(...target);
              equal(
                scalar(value, c),
                scalar(c["border-radius"], c),
                `${name} Motion/CSS 圆角`,
              );
            } catch (error) {
              issue("motion-radius", file, line, error.message);
            }
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(ast);
    }
  check("disclosure-radius", controls, [".ui-disclosure-trigger"], () => {
    const c = context(controls, [".ui-disclosure-trigger"]);
    const p = context(controls, [".ui-disclosure"]);
    if (p.overflow !== "hidden")
      throw new Error("折叠容器必须裁切标题，不能让 hover 另画一圈圆角");
    equal(
      scalar(c["border-radius"], c),
      scalar("var(--ui-radius-0)", c),
      "标题自身圆角",
    );
    return equal(
      scalar("var(--ui-button-radius)", c),
      scalar(c["border-radius"], c),
      "标题 Motion/CSS 圆角",
    );
  });
  check("fade-surface", components, [".ui-code-fade"], () => {
    const c = context(components, [".ui-code-fade"]);
    if (
      c["pointer-events"] !== "none" ||
      !c.background.includes("var(--ui-region)")
    )
      throw new Error("渐隐须融入 region 且不拦截指针");
    return "渐隐读取 region，装饰层不拦截指针";
  });
  check("motion-duration", "src/ui/tokens.css", [":root"], () => {
    const source = sources.get("src/ui/motion.tsx") ?? "";
    const ast = ts.createSourceFile(
      "motion.tsx",
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    let duration;
    const visit = (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        node.name.getText(ast) === "layoutTransition" &&
        node.initializer &&
        ts.isObjectLiteralExpression(node.initializer)
      ) {
        const property = node.initializer.properties.find(
          (p) =>
            ts.isPropertyAssignment(p) && p.name.getText(ast) === "duration",
        );
        if (property && ts.isNumericLiteral(property.initializer))
          duration = Number(property.initializer.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(ast);
    if (duration === undefined)
      throw new Error("无法确认 layoutTransition 的布局时长");
    return equal(
      duration * 1000,
      scalar(globals["--ui-move"], globals),
      "CSS/Motion 布局时长 ms",
    );
  });
  check("motion-roles", "src/ui/tokens.css", [":root"], () => {
    const source = sources.get("src/ui/motion.tsx") ?? "";
    const ast = ts.createSourceFile(
      "motion.tsx",
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const timing = {};
    const visit = (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        node.name.getText(ast) === "motionTiming" &&
        node.initializer &&
        ts.isObjectLiteralExpression(node.initializer)
      ) {
        for (const property of node.initializer.properties) {
          if (
            ts.isPropertyAssignment(property) &&
            ts.isNumericLiteral(property.initializer)
          )
            timing[property.name.getText(ast)] = Number(
              property.initializer.text,
            );
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(ast);
    for (const [role, token] of [
      ["enter", "--ui-enter"],
      ["exit", "--ui-exit"],
      ["reduced", "--ui-reduced-fade"],
    ]) {
      if (!Number.isFinite(timing[role]))
        throw new Error(`缺少 ${role} 动效配置`);
      equal(
        timing[role] * 1000,
        scalar(globals[token], globals),
        `${role} CSS/Motion 时长`,
      );
    }
    if (!(timing.exit < timing.enter)) throw new Error("退出须比进入更快");
    if (timing.reduced > 0.1)
      throw new Error("减少动态效果的淡化不可超过 100ms");
    return "进入、退出与减少动态效果时长一致，退出更快";
  });
  check(
    "motion-text-layout",
    components,
    [".ui-changing-text-outgoing"],
    () => {
      const outgoing = context(components, [".ui-changing-text-outgoing"]);
      if (
        outgoing.position !== "absolute" ||
        outgoing["pointer-events"] !== "none"
      )
        throw new Error("退出文字不参与排版或指针命中");
      return "退出文字不影响新内容布局与操作";
    },
  );
  check("motion-action-feedback", components, [".ui-external"], () => {
    const link = context(components, [".ui-external"]);
    if (
      !link.transition?.includes(
        "scale var(--ui-press-duration, var(--ui-fast))",
      )
    )
      throw new Error("按钮式导航须共享缩放过渡");
    const pressRule = css.find(
      ({ file, rule }) =>
        file === components &&
        normalize(rule.selector).startsWith(".ui-pressable:active:not("),
    );
    if (
      !pressRule ||
      ![":disabled", '[aria-busy="true"]', '[aria-disabled="true"]'].every(
        (state) => pressRule.rule.selector.includes(state),
      )
    )
      throw new Error("共享按压必须排除禁用与 busy");
    const press = context(components, [normalize(pressRule.rule.selector)]);
    equal(scalar(press.scale, press), 0.97, "共享按压缩放");
    const reduced = css.find(
      ({ file, rule }) =>
        file === components &&
        rule.selector === ".ui-pressable" &&
        rule.parent.type === "atrule" &&
        rule.parent.name === "media" &&
        rule.parent.params.includes("prefers-reduced-motion: reduce"),
    );
    if (
      !reduced?.rule.nodes.some(
        (node) =>
          node.type === "decl" &&
          node.prop === "--ui-press-scale" &&
          node.value === "1",
      )
    )
      throw new Error("减少动态效果须取消按压缩放，不受 active 优先级影响");
    if (press["--ui-press-duration"] !== "var(--ui-press)")
      throw new Error("按压须使用即时反馈节奏");
    for (const { file, rule } of css) {
      if (
        file === controls &&
        rule.selector.includes(".ui-disclosure-trigger:active") &&
        rule.nodes.some((node) => node.type === "decl" && node.prop === "scale")
      )
        throw new Error("展开入口不可覆盖共享按压反馈");
    }
    return "按钮式导航与展开入口共享按压反馈";
  });
  return {
    ok: issues.length === 0,
    checks,
    issues,
    limitations: [
      "仅检查列出的声明契约，不模拟 CSS 完整级联、媒体查询、宿主覆盖或浏览器布局。",
      "新组合须登记对应关系；通过不代表全部圆角、光学对齐、色差、焦点与动效已经视觉验收。",
    ],
  };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2),
    allowed = ["--root", "--json"];
  let root = resolve(dirname(fileURLToPath(import.meta.url)), ".."),
    json = false;
  for (let i = 0; i < args.length; i++) {
    if (!allowed.includes(args[i])) throw new Error(`未知参数 ${args[i]}`);
    if (args[i] === "--json") json = true;
    else {
      if (!args[i + 1] || args[i + 1].startsWith("--"))
        throw new Error("--root 需要项目路径");
      root = resolve(args[++i]);
    }
  }
  const report = checkDesign(loadSources(root));
  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(
      `设计源码契约：${report.checks.length} 项通过，${report.issues.length} 项问题`,
    );
    for (const item of report.issues)
      console.log(`${item.file}:${item.line} [${item.code}] ${item.message}`);
    for (const limitation of report.limitations)
      console.log(`范围：${limitation}`);
  }
  process.exitCode = report.ok ? 0 : 1;
}
