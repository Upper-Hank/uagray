# Beta 发布与消费测试

首轮版本：`uagray@0.1.0-beta.0`。发布标签：`beta`。源代码许可证：MIT。当前宿主范围：React 19。

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
