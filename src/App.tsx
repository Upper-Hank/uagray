import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  PageShell,
  SearchField,
  SegmentedControl,
} from "./ui";
import { ThemeToggle } from "./theme-toggle";
import { tokenGroups, TokenPractice } from "./token-practice";
import { Playground } from "./playground";
import { componentEntries } from "./playground-catalog";
import { specEntries, SpecPractice } from "./spec-practice";
import { ContextMatrix } from "./context-matrix";
import "./app.css";
type Category = "spec" | "token" | "component";
const pieces = [
  ...specEntries,
  ...tokenGroups.map((group) => ({
    id: group.id,
    title: group.title,
    category: "token" as const,
  })),
  ...componentEntries,
];
const categories = [
  { value: "spec", label: "规范" },
  { value: "token", label: "Token" },
  { value: "component", label: "组件" },
];
const categoryOptions = categories.map((category) => ({
  ...category,
  count: pieces.filter((piece) => piece.category === category.value).length,
}));
const aliases: Record<string, string> = {
  copy: "buttons",
  choices: "checkbox",
  dialogs: "dialog",
  feedback: "badge",
  "empty-state": "empty-state",
};
function readLocation() {
  const id = window.location.hash.slice(1);
  return aliases[id] ?? id;
}
export default function App() {
  const [location, setLocation] = useState(readLocation);
  const [category, setCategory] = useState<Category>(
    () =>
      pieces.find((piece) => piece.id === readLocation())?.category ?? "spec",
  );
  const [query, setQuery] = useState("");
  const contentRef = useRef<HTMLElement>(null);
  const directoryRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => {
      const id = readLocation();
      if (id === "main") return;
      setLocation(id);
      const target = pieces.find((piece) => piece.id === id);
      if (target) {
        setCategory(target.category);
        setQuery("");
      }
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const section = categories.find((item) => item.value === category)!;
  const entries = pieces.filter((piece) => piece.category === category);
  if (category === "component") {
    entries.sort((a, b) =>
      a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
    );
  }
  const piece = entries.find((piece) => piece.id === location) ?? entries[0];
  const results = entries.filter((item) =>
    item.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  useEffect(() => {
    document.title = `${piece.title} · Uagray`;
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [piece]);
  useEffect(() => {
    if (directoryRef.current) directoryRef.current.scrollTop = 0;
  }, [category]);
  function changeCategory(value: string) {
    const next = value as Category;
    const id = pieces.find((piece) => piece.category === next)!.id;
    setCategory(next);
    setQuery("");
    setLocation(id);
    window.location.hash = id;
  }
  const component = componentEntries.find((entry) => entry.id === piece.id);
  const spec = specEntries.find((entry) => entry.id === piece.id);
  return (
    <PageShell
      className="workbench-shell"
      controls={
        <div className="workbench-header">
          <div className="workbench-brand">
            <span className="workbench-logo" role="img" aria-label="Uagray" />
          </div>
          <div className="workbench-actions">
            <SegmentedControl
              label="展示分类"
              value={category}
              options={categoryOptions}
              onChange={changeCategory}
            />
            <ThemeToggle />
          </div>
        </div>
      }
    >
      <div className="workbench">
        <aside
          className="workbench-sidebar"
          aria-label={`${section.label}目录`}
        >
          <div className="directory-heading">
            <h2>{section.label}</h2>
            <Badge>{entries.length} 项</Badge>
          </div>
          <SearchField
            label="搜索目录"
            placeholder={`搜索${section.label}`}
            value={query}
            onChange={setQuery}
          />
          <nav
            ref={directoryRef}
            aria-label="条目目录"
            className="directory-list"
          >
            {results.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={piece.id === item.id ? "page" : undefined}
                onClick={() => setLocation(item.id)}
              >
                {item.title}
              </a>
            ))}
          </nav>
          {!results.length && (
            <EmptyState
              title="没有匹配条目"
              action={
                <Button size="small" onClick={() => setQuery("")}>
                  清空搜索
                </Button>
              }
            />
          )}
        </aside>
        <article
          ref={contentRef}
          className="workbench-content"
          tabIndex={0}
          aria-labelledby="practice-title"
        >
          {!component && (
            <header className="practice-heading">
              <h1 id="practice-title">{piece.title}</h1>
            </header>
          )}
          {category === "token" ? (
            <TokenPractice key={piece.id} id={piece.id} />
          ) : component ? (
            <Playground key={component.id} entry={component} />
          ) : piece.id === "context-matrix" ? (
            <ContextMatrix />
          ) : (
            spec && <SpecPractice key={spec.id} id={spec.id} />
          )}
        </article>
      </div>
    </PageShell>
  );
}
