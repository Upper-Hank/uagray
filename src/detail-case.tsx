import { useRef, useState, type CSSProperties } from "react";
import {
  Badge,
  Button,
  Layout,
  NavigationCard,
  PageShell,
  Pager,
  ShareButton,
  Surface,
} from "./ui";
import "./detail-case.css";

function ModuleArt({
  angle = -24,
  variant = "solid",
}: {
  angle?: number;
  variant?: "solid" | "split" | "wire";
}) {
  return (
    <div
      className={`module-art module-art--${variant}`}
      style={{ "--module-angle": `${angle}deg` } as CSSProperties}
      aria-hidden="true"
    >
      <div className="module-block module-block--back" />
      <div className="module-block module-block--front">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
const previous = { title: "海报编辑", href: "/cases/workspace.html" };
const next = { title: "项目空间", href: "/cases/saas.html" };

/** The reference's content hierarchy, composed from public Uagray components. */
export function DetailCase() {
  const [angle, setAngle] = useState(-24);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; angle: number } | null>(null);
  const clampAngle = (value: number) => Math.max(-60, Math.min(60, value));
  return (
    <PageShell
      className="case-shell detail-shell"
      mainId="detail-content"
      controls={null}
    >
      <Surface className="detail-stage">
        <div
          className="detail-model"
          role="group"
          tabIndex={0}
          aria-label="模块视图，拖动或左右方向键旋转"
          data-dragging={dragging || undefined}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              setAngle((current) =>
                clampAngle(current + (event.key === "ArrowLeft" ? -5 : 5)),
              );
            }
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            drag.current = { id: event.pointerId, x: event.clientX, angle };
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={(event) => {
            if (drag.current?.id === event.pointerId)
              setAngle(
                clampAngle(
                  drag.current.angle + (event.clientX - drag.current.x) * 0.3,
                ),
              );
          }}
          onPointerUp={(event) => {
            if (drag.current?.id === event.pointerId) {
              drag.current = null;
              setDragging(false);
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          onPointerCancel={() => {
            drag.current = null;
            setDragging(false);
          }}
          onLostPointerCapture={() => {
            drag.current = null;
            setDragging(false);
          }}
        >
          <ModuleArt angle={angle} />
        </div>
        <Surface
          tone="raised"
          treatment="physical"
          className="ui-tool-surface case-floating-tools detail-tools"
        >
          <Layout className="case-toolbar ui-toolbar-row" label="视图操作">
            <span className="ui-toolbar-info">拖动以旋转</span>
            <span className="detail-tool-divider" aria-hidden="true" />
            <Button variant="plain" onClick={() => setAngle(-24)}>
              重置视图
            </Button>
          </Layout>
        </Surface>
      </Surface>
      <section className="detail-intro" aria-labelledby="detail-title">
        <div className="detail-heading">
          <h1 id="detail-title">模块研究</h1>
          <Layout className="case-toolbar" label="页面操作">
            <ShareButton url={window.location.href} />
            <Pager previous={previous} next={next} />
          </Layout>
        </div>
        <p>
          一个由两块几何模块组成的交互视图。拖动或使用左右方向键观察不同角度，重置视图回到起始位置。
        </p>
        <div className="detail-tags">
          <span>使用</span>
          <Badge>CSS</Badge>
          <Badge>React</Badge>
        </div>
      </section>
      <section className="detail-about" aria-labelledby="detail-about-title">
        <h2 id="detail-about-title">关于</h2>
        <p>
          拖动模型可查看模块之间的连接，重置视图可回到初始角度。下方三个视角分别展示拆分结构、组合表面与轮廓。
        </p>
      </section>
      <section className="detail-figures" aria-label="模块的三个视角">
        {[
          { variant: "split" as const, caption: "拆分后的结构" },
          { variant: "solid" as const, caption: "组合后的表面" },
          { variant: "wire" as const, caption: "边界与轮廓" },
        ].map((item) => (
          <figure key={item.variant}>
            <Surface className="detail-figure-art">
              <ModuleArt variant={item.variant} />
            </Surface>
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </section>
      <Surface className="detail-metadata">
        <dl>
          <div>
            <dt>设计依据</dt>
            <dd>灰阶、留白与局部操作层</dd>
          </div>
          <div>
            <dt>实现方式</dt>
            <dd>Uagray、React 与 CSS</dd>
          </div>
        </dl>
      </Surface>
      <nav className="case-navigation detail-navigation" aria-label="相邻案例">
        <NavigationCard direction="previous" {...previous} />
        <NavigationCard direction="next" {...next} />
      </nav>
    </PageShell>
  );
}
