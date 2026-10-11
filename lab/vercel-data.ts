export type Variable = {
  id: string;
  name: string;
  value: string;
  targets: string[];
};
export type LaunchProject = {
  name: string;
  team: string;
  root: string;
  framework: string;
  build: string;
  output: string;
  install: string;
  override: boolean;
  protection: boolean;
  variables: Variable[];
  deleted: boolean;
};
export const launchKey = "uagray-launch-prototype-v1";
export const environments = [
  { value: "production", label: "Production" },
  { value: "preview", label: "Preview" },
  { value: "development", label: "Development" },
];
export const teams = [
  { value: "atlas", label: "Atlas 团队" },
  { value: "studio", label: "Studio 团队" },
];
export function initialProject(): LaunchProject {
  return {
    name: "atlas-portal",
    team: "atlas",
    root: "./",
    framework: "vite",
    build: "npm run build",
    output: "dist",
    install: "npm ci",
    override: false,
    protection: true,
    deleted: false,
    variables: [
      {
        id: "api",
        name: "PUBLIC_API_URL",
        value: "https://api.example.com",
        targets: ["production", "preview", "development"],
      },
      {
        id: "feature",
        name: "FEATURE_PORTAL_V2",
        value: "enabled",
        targets: ["preview", "development"],
      },
    ],
  };
}
export function variableError(variable: Variable, variables: Variable[]) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(variable.name))
    return "名称只能包含字母、数字和下划线，且不能以数字开头。";
  if (!variable.value.trim()) return "请输入变量值。";
  if (!variable.targets.length) return "至少选择一个环境。";
  if (
    variables.some(
      (item) =>
        item.id !== variable.id &&
        item.name === variable.name &&
        item.targets.some((target) => variable.targets.includes(target)),
    )
  )
    return "同名变量已存在于所选环境中。";
  return "";
}
export function readProject(raw: string): LaunchProject {
  const data: LaunchProject = JSON.parse(raw);
  if (
    !data ||
    ![data.name, data.root, data.build, data.output, data.install].every(
      (value) => typeof value === "string",
    ) ||
    !teams.some((team) => team.value === data.team) ||
    !["vite", "next", "other"].includes(data.framework) ||
    [data.override, data.protection, data.deleted].some(
      (value) => typeof value !== "boolean",
    ) ||
    !Array.isArray(data.variables) ||
    !data.variables.every(
      (item) =>
        item &&
        [item.id, item.name, item.value].every(
          (value) => typeof value === "string",
        ) &&
        Array.isArray(item.targets) &&
        item.targets.every((target) =>
          environments.some((option) => option.value === target),
        ),
    ) ||
    new Set(data.variables.map((item) => item.id)).size !==
      data.variables.length ||
    data.variables.some((item) => variableError(item, data.variables))
  )
    throw new Error("Invalid project data");
  return data;
}
