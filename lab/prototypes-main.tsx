import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NavigationCard, PageShell } from "../src/ui";
import "../src/base.css";
import "./prototypes.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PageShell className="prototype-directory"><PageShell.Header><span>Uagray / 内部产品原型</span></PageShell.Header><PageShell.Body>
      <h1>选题目录</h1>
      <p>参考成熟页面的信息架构，用 Uagray 组件承担实际任务。</p>
      <div className="prototype-directory-items">
        <section>
          <h2>01 · 项目工作空间</h2>
          <p>参考 Linear 的项目与任务结构，支持任务编辑、筛选和批量更新。</p>
          <NavigationCard direction="next" href="/"><NavigationCard.Title>进入 Atlas 项目</NavigationCard.Title></NavigationCard>
        </section>
        <section>
          <h2>02 · 作品与工具展厅</h2>
          <p>
            参考 anish’s lab
            的目录与详情结构，支持分类搜索、交互作品和相邻作品导航。
          </p>
          <NavigationCard direction="next" href="/anish/"><NavigationCard.Title>进入 Fieldnotes</NavigationCard.Title></NavigationCard>
        </section>
        <section>
          <h2>03 · 仓库问题管理</h2>
          <p>
            参考 GitHub Issues，支持查询、标签、里程碑、问题讨论与批量关闭。
          </p>
          <NavigationCard direction="next" href="/github/"><NavigationCard.Title>进入 Forge 仓库</NavigationCard.Title></NavigationCard>
        </section>
        <section>
          <h2>04 · 项目配置管理</h2>
          <p>参考 Vercel 项目设置，支持独立保存、环境变量、转移与删除确认。</p>
          <NavigationCard direction="next" href="/vercel/"><NavigationCard.Title>进入 Launch 设置</NavigationCard.Title></NavigationCard>
        </section>
      </div>
    </PageShell.Body></PageShell>
  </StrictMode>,
);
