import { useEffect, useState, useRef, type CSSProperties } from "react";
import {
  Button,
  ActionRow,
  Badge,
  EmptyState,
  DescriptionList,
  Heading,
  Text,
  Icon,
  NavigationCard,
  PageShell,
  Pager,
  SearchField,
  SegmentedControl,
  ShareButton,
  ShowcaseCard,
  Surface,
} from "../src/ui";
import {
  findPieces,
  pieceHref,
  pieces,
  readPieceId,
  type Piece,
} from "./gallery-data";
import { PieceExperience } from "./gallery-experiences";
import "./gallery.css";

function PiecePreview({
  piece,
  variation = 0,
}: {
  piece: Piece;
  variation?: number;
}) {
  return (
    <div className={`gallery-preview gallery-preview--${piece.id}`}>
      {piece.id === "pulse" ? (
        <>
          <small>READING / WEEK 02</small>
          <span className="gallery-preview-heading">保持一点进展</span>
          <span className="gallery-preview-number">
            {6 + variation} <small>/ 12</small>
          </span>
          <span className="gallery-preview-track">
            <span style={{ width: `${50 + variation * 10}%` }} />
          </span>
          <Badge emphasis="quiet">持续推进</Badge>
        </>
      ) : piece.id === "reading" ? (
        <>
          <small>FIELDNOTES / 01</small>
          <span className="gallery-preview-heading">
            留一点空间
            <br />
            给内容
          </span>
          <p>
            在清楚的层次之间，
            <br />
            保持自己的阅读节奏。
          </p>
          <span className="gallery-preview-line" />
        </>
      ) : piece.id === "palette" ? (
        <>
          <div className="gallery-swatches">
            {["#6B7F73", "#A9B6AC", "#D3DBD4", "#C5AE98"].map((color) => (
              <span key={color} style={{ background: color }} />
            ))}
          </div>
          <span className="gallery-preview-heading">一组自然的色彩</span>
          <small>色样 / 01 — 04</small>
        </>
      ) : piece.id === "focus" ? (
        <>
          <small>FOCUS SESSION</small>
          <span className="gallery-preview-clock">15:00</span>
          <Badge>留一段时间</Badge>
          <span className="gallery-preview-track">
            <span style={{ width: "24%" }} />
          </span>
        </>
      ) : piece.id === "profile" ? (
        <>
          <span className="gallery-person-mark">林</span>
          <span className="gallery-preview-heading">林乔</span>
          <small>产品设计</small>
          <Badge tone="success">可以协作</Badge>
        </>
      ) : (
        <>
          <small>RELEASE / 02</small>
          <span className="gallery-preview-heading">一步一步完成</span>
          {["确认发布范围", "核对核心操作", "准备更新说明"].map(
            (text, index) => (
              <span className="gallery-preview-check" key={text}>
                <Icon name={index === 0 ? "check" : "grid"} size={14} />
                {text}
              </span>
            ),
          )}
        </>
      )}
    </div>
  );
}
export default function GalleryApp() {
  const [pieceId, setPieceId] = useState(() =>
    readPieceId(window.location.hash),
  );
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("uagray-gallery-theme") === "dark";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    function restore() {
      if (window.location.hash.startsWith("#/") || !window.location.hash)
        setPieceId(readPieceId(window.location.hash));
    }
    window.addEventListener("hashchange", restore);
    return () => window.removeEventListener("hashchange", restore);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("uagray-gallery-theme", dark ? "dark" : "light");
    } catch {
      /* Apply appearance without persistence. */
    }
  }, [dark]);
  const previousRoute = useRef(pieceId);
  useEffect(() => {
    if (previousRoute.current === pieceId) return;
    previousRoute.current = pieceId;
    document.getElementById("gallery-main")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pieceId]);
  const piece = pieces.find((item) => item.id === pieceId);
  useEffect(() => {
    document.title = piece
      ? `${piece.title} · Fieldnotes`
      : "Fieldnotes · 作品与工具";
  }, [piece]);
  const matches = findPieces(query, "all");
  const visible = findPieces(query, category);
  const index = pieces.findIndex((item) => item.id === pieceId);
  const previous = pieces[index - 1],
    next = pieces[index + 1];
  const controls = (
    <>
      <div className="gallery-brand">
        <a href={pieceHref()}>Fieldnotes</a>
        <span>/</span>
        <span>{piece?.title ?? "组件与小工具"}</span>
      </div>
      <div className="gallery-header-tools">
        {pieceId === null && (
          <div className="gallery-browse-controls">
            <SegmentedControl
              aria-label="作品分类"
              value={category}
              onValueChange={setCategory}
            >
              {[
                { value: "all", label: "全部", count: matches.length },
                {
                  value: "component",
                  label: "组件",
                  count: matches.filter((item) => item.category === "component")
                    .length,
                },
                {
                  value: "tool",
                  label: "工具",
                  count: matches.filter((item) => item.category === "tool")
                    .length,
                },
              ].map((item) => (
                <SegmentedControl.Item
                  key={item.value}
                  value={item.value}
                  disabled={(item as { disabled?: boolean }).disabled}
                >
                  <SegmentedControl.Label>{item.label}</SegmentedControl.Label>
                  {(item as { count?: number | string }).count != null ? (
                    <SegmentedControl.Count>
                      {(item as { count?: number | string }).count}
                    </SegmentedControl.Count>
                  ) : null}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl>
            <SearchField
              aria-label="搜索作品"
              placeholder="搜索作品…"
              shortcut
              value={query}
              onValueChange={setQuery}
            />
          </div>
        )}
        <Button
          aria-label={dark ? "切换浅色外观" : "切换深色外观"}
          onClick={() => setDark((value) => !value)}
          shape="square"
        >
          <Button.Icon>
            <Icon name={dark ? "sun" : "moon"} />
          </Button.Icon>
        </Button>
      </div>
    </>
  );
  return (
    <PageShell className="gallery-shell" mainId="gallery-main">
      {controls ? <PageShell.Header>{controls}</PageShell.Header> : null}
      <PageShell.Body>
        {pieceId === null ? (
          <>
            <h1 className="ui-sr-only">组件与小工具</h1>
            {visible.length ? (
              <div className="gallery-grid">
                {visible.map((item) => (
                  <ShowcaseCard
                    key={item.id}
                    href={pieceHref(item.id)}
                    className="gallery-piece"
                    style={
                      {
                        "--gallery-preview-aspect": item.aspect,
                      } as CSSProperties
                    }
                  >
                    <ShowcaseCard.Title>{item.title}</ShowcaseCard.Title>
                    <ShowcaseCard.Description>
                      {item.summary}
                    </ShowcaseCard.Description>
                    <ShowcaseCard.Media>
                      <PiecePreview piece={item} />
                    </ShowcaseCard.Media>
                  </ShowcaseCard>
                ))}
              </div>
            ) : (
              <EmptyState>
                <EmptyState.Title>没有找到作品</EmptyState.Title>
                <EmptyState.Description>
                  换一个关键词，或查看其他分类。
                </EmptyState.Description>
              </EmptyState>
            )}
          </>
        ) : piece ? (
          <article className="gallery-detail">
            <Surface className="gallery-stage">
              <PieceExperience id={piece.id} key={piece.id} />
            </Surface>
            <div className="gallery-detail-heading">
              <div>
                <Heading level={1} variant="page">
                  {piece.title}
                </Heading>
                <Text>{piece.summary}</Text>
                <div className="gallery-used">
                  <span>使用</span>
                  {piece.components.map((name) => (
                    <Badge key={name}>{name}</Badge>
                  ))}
                </div>
              </div>
              <ActionRow className="gallery-detail-actions">
                <ShareButton
                  url={new URL(pieceHref(piece.id), window.location.href).href}
                >
                  <ShareButton.Label>分享</ShareButton.Label>
                  <ShareButton.Feedback state="success">
                    已复制
                  </ShareButton.Feedback>
                  <ShareButton.Feedback state="pending">
                    正在复制
                  </ShareButton.Feedback>
                  <ShareButton.Feedback state="error">
                    复制失败
                  </ShareButton.Feedback>
                </ShareButton>
                <Pager aria-label="作品翻页">
                  <Pager.Previous
                    href={previous ? pieceHref(previous.id) : undefined}
                  >
                    {previous?.title ?? "上一页"}
                  </Pager.Previous>
                  <Pager.Next href={next ? pieceHref(next.id) : undefined}>
                    {next?.title ?? "下一页"}
                  </Pager.Next>
                </Pager>
              </ActionRow>
            </div>
            <section className="gallery-about">
              <Heading>关于这个作品</Heading>
              <Text>{piece.about}</Text>
            </section>
            <div className="gallery-supporting-previews">
              {piece.features.map((feature, position) => (
                <figure key={feature}>
                  <Surface className="gallery-snapshot">
                    <PiecePreview piece={piece} variation={position} />
                  </Surface>
                  <figcaption>{feature}</figcaption>
                </figure>
              ))}
            </div>
            <DescriptionList>
              <div>
                <dt>设计关注</dt>
                <dd>{piece.features.join("、")}</dd>
              </div>
              <div>
                <dt>构建方式</dt>
                <dd>React、Uagray 组件与原生 CSS</dd>
              </div>
            </DescriptionList>
            <nav className="gallery-next-pieces" aria-label="相邻作品">
              {previous && (
                <NavigationCard
                  direction="previous"
                  href={pieceHref(previous.id)}
                >
                  <NavigationCard.Description>
                    上一个作品
                  </NavigationCard.Description>
                  {previous.title ? (
                    <NavigationCard.Title>
                      {previous.title}
                    </NavigationCard.Title>
                  ) : null}
                </NavigationCard>
              )}
              {next && (
                <NavigationCard direction="next" href={pieceHref(next.id)}>
                  <NavigationCard.Description>
                    下一个作品
                  </NavigationCard.Description>
                  {next.title ? (
                    <NavigationCard.Title>{next.title}</NavigationCard.Title>
                  ) : null}
                </NavigationCard>
              )}
            </nav>
          </article>
        ) : (
          <EmptyState>
            <EmptyState.Title>没有找到这个作品</EmptyState.Title>
            <EmptyState.Description>
              它可能已被移除，返回目录查看其他作品。
            </EmptyState.Description>
            <EmptyState.Actions>
              <a href={pieceHref()}>返回作品目录</a>
            </EmptyState.Actions>
          </EmptyState>
        )}
      </PageShell.Body>
      <PageShell.Footer>
        <>
          <span>Fieldnotes © 2026</span>
          <a
            href="https://lab.anishfn.ink/"
            target="_blank"
            rel="noopener noreferrer"
          >
            信息架构参考：anish’s lab
            <span className="ui-sr-only">（在新标签页打开）</span>
          </a>
        </>
      </PageShell.Footer>
    </PageShell>
  );
}
