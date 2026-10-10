# Beta 发布与消费测试

首轮版本：`uagray@0.1.0-beta.0`。发布标签：`beta`。源代码许可证：MIT。当前宿主范围：React 19。

## 线上结果

2026-10-10 已发布至 [npm](https://www.npmjs.com/package/uagray/v/0.1.0-beta.0)。`beta` 标签指向 `0.1.0-beta.0`。

独立项目已改为从 registry 安装，锁文件来源为 `https://registry.npmjs.org/uagray/-/uagray-0.1.0-beta.0.tgz`；完整性与发布前测试的 tarball 一致。线上安装后的类型检查、生产构建和浏览器页面渲染通过。

npm 为首个版本同时生成了 `latest` 标签；移除请求在完成安全验证后仍返回 HTTP 400，因此目前 `latest` 也指向同一 beta 版本。测试安装请明确使用 `uagray@beta`。

## 已完成的发布前检查

- `npm pack` 清单只包含 `dist/`、README、LICENSE 和 package.json，共 17 个文件，约 25.6 KB。
- 公共源码的 45 项交互测试通过；Vitest 明确限定 `src/`，不运行 `local/` 中的未完成实验。
- 独立消费项目从 tarball 安装，类型检查与 Vite 生产构建通过。
- 独立项目只有一份 React/React DOM，组件 CSS 与 Token 生效。
- Playwright 操作 Input、Select、Switch 和 Button，结果回传到宿主状态。

## 下一轮发布准备

仓库待发布版本为 `0.1.0-beta.1`，发布标签为 `v0.1.0-beta.1`，npm dist-tag 为 `beta`。本节记录准备状态，不代表已上线；线上结果仍以上述首轮版本为准。此次迁移说明见 README 与 CHANGELOG，包含 Button 新属性、旧 variant 兼容行为、环境变量与字重变更。

本次本地准备检查（2026-10-10）：类型检查与组件库构建通过，4 个源码测试文件共 45 项测试通过；试包共 17 个文件，26,359 bytes，包含必需的 ESM、声明与 CSS 入口，且全部符合包白名单。package.json 与 package-lock.json 版本一致。未进行浏览器或独立消费项目验证，未推送发布标签。

## 自动发布

后续发布统一由 [GitHub Actions](https://github.com/Upper-Hank/uagray/actions/workflows/publish.yml) 执行，不在本机执行 `npm publish`。

1. 更新 package.json 与 package-lock.json 中的版本，补充 CHANGELOG，提交并推送至 main。
2. 创建与版本一致的标签，例如下一轮 `v0.1.0-beta.1`，然后推送该标签。
3. 工作流校验标签版本及 main 来源，运行测试、构建组件库、检查包白名单，通过后发布并查询 registry。

```sh
npm version 0.1.0-beta.1 --no-git-tag-version
# 更新 CHANGELOG，提交并推送 main 后：
git tag -a v0.1.0-beta.1 -m "Release 0.1.0-beta.1"
git push origin v0.1.0-beta.1
```

`beta` 预发布版本发布至 `beta` 标签；正式版本发布至 `latest`。其他预发布类型暂不允许。推送 main 或手动运行工作流只做验证，不发布，当前版本不会因此重复发布。

工作流使用 GitHub 托管 runner、Node 24 和 npm 11.21.0，通过 npm Trusted Publishing 的 OIDC 身份认证；不配置长期 NPM_TOKEN。npm 绑定仓库 `Upper-Hank/uagray`、工作流文件 `publish.yml`，允许直接发布，Environment 留空。配置依据 [npm 官方文档](https://docs.npmjs.com/trusted-publishers/)。

## 展示站部署

Vercel 继续通过 Git 集成部署 main。根目录 `vercel.json` 明确使用 `npm run build` 与 `dist-site/`，展示规范、Token 和组件预览。`dist/` 仅用于 npm 组件包。案例、API 调试及本地实验不进入展示站。

## 消费

```sh
npm install uagray@beta
```

```tsx
import { Button } from "uagray";
import "uagray/styles.css";
```

独立验证工程位于本机 `local/beta-consumer/`，受 Git 忽略。展示、案例和 API 调试不进入 npm 包。
