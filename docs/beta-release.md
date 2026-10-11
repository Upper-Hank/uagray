# Beta 发布与消费测试

当前版本：`uagray@0.1.0-beta.2`。发布标签：`beta`。源代码许可证：MIT。当前宿主范围：React 19。

## 当前线上结果

2026-10-11 已发布 [0.1.0-beta.2](https://www.npmjs.com/package/uagray/v/0.1.0-beta.2)，Git 标签为 `v0.1.0-beta.2`，发布提交为 `40ce87e`。npm 的 `beta` 标签已指向 `0.1.0-beta.2`；`latest` 仍为 `0.1.0-beta.0`，安装请明确使用 `uagray@beta`。

[发布工作流](https://github.com/Upper-Hank/uagray/actions/runs/38141829697)通过了测试、组件库构建、包内容检查、干净消费安装及 Trusted Publishing 上传。npm 返回异步处理提示，即时 registry 查询得到 404，导致工作流最终显示失败；随后已独立确认版本和完整性可读取，且 `beta` 标签更新完成。该状态不代表包上传失败，不应重复发布相同版本。

registry 完整性：

```text
sha512-fVyQRdeLOgA6F/ig0egrYIv55b9X+/s9U9gK+a0DvGkREjBBUBJfs8dz13lkZAO4bri3YWHjvel/AvhXIRxEEg==
```

## beta.2 发布验证

- 151 项源码与内部原型测试、29 项检查器测试通过。
- 类型检查与 37 项设计源码契约检查通过。
- 组件包只包含 `dist/`、README、LICENSE 和 package.json，共 469 个文件；压缩约 11.8 MB，未压缩约 12.2 MB，低于 18 MB 限制。
- 临时消费项目从 tarball 安装，使用新的 children 与语义子组件 API，类型检查和 Vite 生产构建通过。
- 本轮没有进行发布后的浏览器验收。

组件样式从 `uagray/styles.css` 引入；独立字体入口为 `uagray/fonts.css`，包含 IBM Plex Sans 与 Sans SC 的 400/500，以及 JetBrains Mono 400。字体随包安装，导致体积高于首轮试包。API 迁移和变更见 [CHANGELOG](../CHANGELOG.md) 与 [API 规范](api-contract.md)。

远端消费验证使用 `npm run verify:consumer`：打包当前组件库，在临时项目中安装，再运行类型检查和生产构建。本机 `local/beta-consumer/` 不进入 Git，不能代替这条检查。

## 历史发布

- `0.1.0-beta.1` 已发布，包含字体入口、环境色、Button emphasis / tone 和交互契约改进，不再是待发布状态。
- 2026-10-10 首次发布 `0.1.0-beta.0`：17 个包文件，约 25.6 KB；当时的独立消费安装、类型检查、生产构建及浏览器交互验证通过。npm 为首轮版本同时生成了 `latest` 标签，后续 beta 发布仅更新 `beta`。

## 自动发布

后续发布统一由 [GitHub Actions](https://github.com/Upper-Hank/uagray/actions/workflows/publish.yml) 执行，不在本机执行 `npm publish`。

1. 更新 package.json 与 package-lock.json 中的版本，补充 CHANGELOG，提交并推送至 main。
2. 创建与版本一致的标签，例如下一轮 `v0.1.0-beta.3`，然后推送该标签。
3. 工作流校验标签版本及 main 来源，运行测试、构建组件库、检查包白名单，通过后发布并查询 registry。

```sh
npm version 0.1.0-beta.3 --no-git-tag-version
# 更新 CHANGELOG，提交并推送 main 后：
git tag -a v0.1.0-beta.3 -m "Release 0.1.0-beta.3"
git push origin v0.1.0-beta.3
```

`beta` 预发布版本发布至 `beta` 标签；正式版本发布至 `latest`。其他预发布类型暂不允许。推送 main 或手动运行工作流只做验证，不发布，当前版本不会因此重复发布。

工作流使用 GitHub 托管 runner、Node 24 和 npm 11.21.0，通过 npm Trusted Publishing 的 OIDC 身份认证；不配置长期 NPM_TOKEN。npm 绑定仓库 `Upper-Hank/uagray`、工作流文件 `publish.yml`，允许直接发布，Environment 留空。配置依据 [npm 官方文档](https://docs.npmjs.com/trusted-publishers/)。

## 展示站部署

Vercel 继续通过 Git 集成部署 main。根目录 `vercel.json` 明确使用 `npm run build` 与 `dist-site/`，展示规范、Token、组件预览和 API 配置。`dist/` 仅用于 npm 组件包。案例与本机消费验证不进入展示站，调试页也不进入组件包。

## 消费

```sh
npm install uagray@beta
```

```tsx
import { Button } from "uagray";
import "uagray/styles.css";
```

独立验证工程位于本机 `local/beta-consumer/`，受 Git 忽略。展示、案例和 API 调试不进入 npm 包。
