# IBM Plex 字体资源

2026-10-10 修订：界面与正文使用官方 Regular 400，标题使用 Medium 500。Text 450 资源保留，当前 UI 暂不消费；不修改字体注册字重来伪装其他重量。文件本地提供，不请求第三方字体服务。

2026-10-09 新增：

- IBM Plex Sans Text：`IBMPlexSans-Text.woff2`，66,260 bytes。
- IBM Plex Sans SC Text：216 个官方 Unicode 分片，合计 5,748,560 bytes。
- 原始声明：<https://raw.githubusercontent.com/IBM/plex/master/packages/plex-sans-sc/fonts/split/woff2/hinted/IBMPlexSansSC-Text.css>
- 中文分片目录：<https://github.com/IBM/plex/tree/master/packages/plex-sans-sc/fonts/split/woff2/hinted>
- 拉丁文件：<https://raw.githubusercontent.com/IBM/plex/master/packages/plex-sans/fonts/complete/woff2/IBMPlexSans-Text.woff2>

字体文件未改动。应用声明保留官方 unicode-range，增加 font-display: swap，移除 local 命中并改为项目本地路径，避免系统安装字体与应用资产不同。许可分别见 sans-LICENSE.txt、sans-sc-LICENSE.txt，沿用官方 OFL。

定向核查：拉丁与中文所有 Text 分片的 WOFF2 OS/2.usWeightClass 应为 450；应用声明的每个分片文件必须存在。
