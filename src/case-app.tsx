import { useEffect } from "react";
import { CasePractice, caseEntries } from "./cases";
import { ThemeToggle } from "./theme-toggle";
import "./base.css";
import "./case-app.css";
export function CaseApp({ id }: { id: string }) {
  const title = caseEntries.find((entry) => entry.id === id)?.title ?? "案例";
  useEffect(() => {
    document.title = `${title} · Uagray`;
  }, [title]);
  return (
    <div className="case-site">
      <header className="case-site-header">
        <nav aria-label="案例导航">
          <a className="case-site-brand" href="/cases/">
            uagray
          </a>
          <a href="/">组件展示</a>
        </nav>
        <ThemeToggle />
      </header>
      {id !== "case-detail" && <h1 className="case-site-title">{title}</h1>}
      <CasePractice id={id} />
    </div>
  );
}
