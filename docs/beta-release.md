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

## 发布

```sh
npm pack
npm publish ./uagray-0.1.0-beta.0.tgz --tag beta --access public --ignore-scripts
npm view uagray@beta version dist.integrity --json
```

本地 tarball 必须先检查和安装验证。npm 登录及发布时的账号安全验证由账号本人完成，不在仓库中保存 Token。后续 beta 使用递增版本号，继续显式指定 `beta` 标签。

## 消费

```sh
npm install uagray@beta
```

```tsx
import { Button } from "uagray";
import "uagray/styles.css";
```

独立验证工程位于本机 `local/beta-consumer/`，受 Git 忽略。展示、案例和 API 调试不进入 npm 包。
