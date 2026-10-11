import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { checkDesign, loadSources } from "./check-design.mjs";

const sources = loadSources(fileURLToPath(new URL("../", import.meta.url)));
function changed(file, before, after) {
  assert.ok(
    sources.get(file).includes(before),
    `Fixture target missing: ${before}`,
  );
  const next = new Map(sources);
  next.set(file, next.get(file).replace(before, after));
  return checkDesign(next);
}
test("current declared geometry and motion contracts pass", () => {
  const report = checkDesign(sources);
  assert.deepEqual(report.issues, []);
  assert.ok(report.checks.some((check) => check.id === "color-picker"));
});
for (const [name, file, before, after, code] of [
  [
    "reduced motion still shrinks actions",
    "src/ui/components.css",
    "--ui-press-scale: 1;",
    "--ui-press-scale: 0.97;",
    "motion-action-feedback",
  ],
  [
    "enter duration drifts between CSS and Motion",
    "src/ui/tokens.css",
    "--ui-enter: 240ms;",
    "--ui-enter: 320ms;",
    "motion-roles",
  ],
  [
    "outgoing text changes target layout",
    "src/ui/components.css",
    ".ui-changing-text-outgoing {\n  position: absolute;",
    ".ui-changing-text-outgoing {\n  position: relative;",
    "motion-text-layout",
  ],
  [
    "disclosure removes shared press feedback",
    "src/ui/controls.css",
    ".ui-disclosure-content {",
    ".ui-disclosure-trigger:active:not(:disabled) { scale: 1; }\n.ui-disclosure-content {",
    "motion-action-feedback",
  ],
  [
    "API color sample loses the control scale",
    "src/app.css",
    "place-items: center;\n  width: var(--ui-size-control);\n  height: var(--ui-size-control);\n  border-radius: var(--ui-radius-control);",
    "place-items: center;\n  width: var(--ui-size-control);\n  height: 44px;\n  border-radius: var(--ui-radius-control);",
    "api-choice-scale",
  ],
  [
    "action row raises outer height",
    "src/ui/components.css",
    ".ui-action-row {",
    ".ui-action-row { height: 44px;",
    "action-row-scale",
  ],
  [
    "group stacks independent control height",
    "src/ui/components.css",
    "--ui-group-child-height: calc(\n    var(--ui-group-height) - 2 * var(--ui-group-inset)\n  );",
    "--ui-group-child-height: var(--ui-group-height);",
    "group-md-height",
  ],
  [
    "sm group retains md scale",
    "src/ui/components.css",
    "--ui-group-height: var(--ui-size-control-sm);",
    "--ui-group-height: var(--ui-size-control);",
    "group-sm-height",
  ],
  [
    "description rows lose breathing room",
    "src/ui/typography.css",
    "--ui-description-inset: var(--ui-space-6);",
    "--ui-description-inset: var(--ui-space-5);",
    "description-list-spacing",
  ],
  [
    "nested tool spacing drift",
    "lab/gallery.css",
    ".gallery-browse-controls {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--ui-space-5);",
    ".gallery-browse-controls {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--ui-space-7);",
    "gallery-browse-spacing",
  ],
  [
    "wrong embedded keycap radius",
    "src/ui/components.css",
    "border-radius: var(--ui-search-keycap-radius);",
    "border-radius: var(--ui-radius-1);",
    "search-keycap",
  ],
  [
    "plain group adds height",
    "src/ui/components.css",
    "background: transparent;\n  padding: 0;",
    "background: transparent;\n  padding: 4px;",
    "plain-actions-height",
  ],
  [
    "list inherits body size",
    "src/ui/typography.css",
    "font-family: var(--ui-font);\n  color: var(--ui-body);\n  font-size: var(--ui-font-size-control);",
    "font-family: var(--ui-font);\n  color: var(--ui-body);\n  font-size: var(--ui-font-size-body);",
    "description-list-type",
  ],
  [
    "wrong group inset",
    "src/ui/components.css",
    "padding: var(--ui-group-inset);",
    "padding: var(--ui-space-4);",
    "group-md",
  ],
  [
    "lost picker border contribution",
    "src/ui/color-picker.css",
    "+ var(--ui-space-6) + 1px",
    "+ var(--ui-space-6)",
    "color-picker",
  ],
  [
    "wrong preview inner radius",
    "src/app.css",
    "calc(var(--ui-radius-surface) - var(--practice-frame-inset))",
    "var(--ui-radius-card)",
    "preview",
  ],
  [
    "small icon radius mismatch",
    "src/ui/components.css",
    "border-radius: var(--ui-button-radius, var(--ui-radius-control));",
    "border-radius: var(--ui-radius-control);",
    "icon-sm",
  ],
  [
    "Motion literal overriding CSS",
    "src/ui/components.tsx",
    'borderRadius: "var(--ui-button-radius)"',
    "borderRadius: 6",
    "motion-radius",
  ],
  [
    "interaction weight change",
    "src/ui/components.css",
    '.ui-button:hover:not(:disabled, [aria-busy="true"], [aria-disabled="true"]) {',
    '.ui-button:hover:not(:disabled, [aria-busy="true"], [aria-disabled="true"]) { font-weight: 500;',
    "state-weight",
  ],
  [
    "toolbar size mismatch",
    "src/playground.tsx",
    "aria-expanded={apiOpen}",
    'size="sm" aria-expanded={apiOpen}',
    "toolbar-size",
  ],
  [
    "disclosure radius detached from its container",
    "src/ui/controls.css",
    "--ui-button-radius: var(--ui-radius-0);",
    "--ui-button-radius: var(--ui-radius-sm);",
    "disclosure-radius",
  ],
  [
    "Motion timing drift",
    "src/ui/motion.tsx",
    "duration: 0.24",
    "duration: 0.4",
    "motion-duration",
  ],
])
  test(`detects ${name}`, () => {
    const report = changed(file, before, after);
    assert.equal(report.ok, false);
    assert.ok(
      report.issues.some((issue) => issue.code === code),
      JSON.stringify(report.issues),
    );
  });
test("removing a required selector is reported, not silently skipped", () => {
  const report = changed(
    "src/ui/components.css",
    ".ui-icon-button.ui-button--sm {",
    ".removed-sm-icon { ",
  );
  assert.ok(report.issues.some((issue) => issue.code === "icon-sm"));
});

test("prototype task row preserves control height and inset", () => {
  const report = changed(
    "lab/lab.css",
    "min-height: var(--prototype-row-height);",
    "min-height: var(--ui-size-control);",
  );
  assert.ok(report.issues.some((issue) => issue.code === "prototype-task-row"));
});
test("prototype toolbar preserves wrapping", () => {
  const report = changed(
    "lab/lab.css",
    "flex-wrap: wrap;",
    "flex-wrap: nowrap;",
  );
  assert.ok(report.issues.some((issue) => issue.code === "prototype-toolbar"));
});

test("gallery stage radius follows its inset", () => {
  const report = changed(
    "lab/gallery.css",
    "border-radius: var(--gallery-stage-radius);",
    "border-radius: var(--ui-radius-control);",
  );
  assert.ok(report.issues.some((issue) => issue.code === "gallery-stage"));
});

test("issue rows retain declared inset", () => {
  const report = changed(
    "lab/github.css",
    "padding-block: var(--forge-row-inset);",
    "padding-block: var(--ui-space-2);",
  );
  assert.ok(report.issues.some((issue) => issue.code === "forge-issue-row"));
});
test("settings save actions keep their wrapping contract", () => {
  const report = changed(
    "lab/vercel.css",
    "justify-content: space-between;\n  gap: var(--ui-gap-control);",
    "justify-content: space-between;\n  gap: var(--ui-space-1);",
  );
  assert.ok(
    report.issues.some((issue) => issue.code === "launch-section-footer"),
  );
});
