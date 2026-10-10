# IBM Plex 字体资源

所有 UI 字重统一使用官方 Text 450，包括按钮和标题。Regular 400、Medium 500 资源保留，当前常规界面不消费；不以修改字体注册字重伪装成 450。文件本地提供，不请求第三方字体服务。

2026-10-09 新增：

- IBM Plex Sans Text：`IBMPlexSans-Text.woff2`，66,260 bytes。
- IBM Plex Sans SC Text：216 个官方 Unicode 分片，合计 5,748,560 bytes。
- 原始声明：<https://raw.githubusercontent.com/IBM/plex/master/packages/plex-sans-sc/fonts/split/woff2/hinted/IBMPlexSansSC-Text.css>
- 中文分片目录：<https://github.com/IBM/plex/tree/master/packages/plex-sans-sc/fonts/split/woff2/hinted>
- 拉丁文件：<https://raw.githubusercontent.com/IBM/plex/master/packages/plex-sans/fonts/complete/woff2/IBMPlexSans-Text.woff2>

字体文件未改动。应用声明保留官方 unicode-range，增加 font-display: swap，移除 local 命中并改为项目本地路径，避免系统安装字体与应用资产不同。许可分别见 sans-LICENSE.txt、sans-sc-LICENSE.txt，沿用官方 OFL。

定向核查：拉丁与中文所有 Text 分片的 WOFF2 OS/2.usWeightClass 应为 450；应用声明的每个分片文件必须存在。
