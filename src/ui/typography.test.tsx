// @vitest-environment jsdom
import { createRef } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DescriptionList, Heading, Text, TextList } from "./typography";

afterEach(cleanup);

it("keeps heading semantics independent of visual hierarchy and forwards its ref", () => {
  const ref = createRef<HTMLHeadingElement>();
  render(
    <Heading level={3} variant="page" ref={ref} id="section-title">
      检查内容
    </Heading>,
  );
  const heading = screen.getByRole("heading", { level: 3 });
  expect(heading.id).toBe("section-title");
  expect(ref.current).toBe(heading);
  expect(heading.classList.contains("ui-heading--page")).toBe(true);
});

it("preserves inline text semantics and native attributes", () => {
  const ref = createRef<HTMLSpanElement>();
  render(
    <Text as="span" variant="supporting" ref={ref} lang="zh">
      辅助说明
    </Text>,
  );
  expect(ref.current?.tagName).toBe("SPAN");
  expect(ref.current?.lang).toBe("zh");
});

it("preserves ordered list numbering, native li content, and root ref", () => {
  const ref = createRef<HTMLOListElement>();
  const view = render(
    <TextList ordered start={3} reversed ref={ref}>
      <li>确认</li>
      <li>发布</li>
    </TextList>,
  );
  expect(ref.current?.tagName).toBe("OL");
  expect(ref.current?.start).toBe(3);
  expect(ref.current?.reversed).toBe(true);
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  view.rerender(
    <TextList variant="plain">
      <li>说明</li>
    </TextList>,
  );
  expect(screen.getByRole("list").tagName).toBe("UL");
  expect(screen.getByRole("list").classList.contains("ui-surface")).toBe(false);
});

it("keeps description rows semantic and avoids a surface in plain mode", () => {
  const ref = createRef<HTMLDListElement>();
  render(
    <DescriptionList variant="plain" ref={ref} aria-label="构建信息">
      <div>
        <dt>工具</dt>
        <dd>React</dd>
      </div>
    </DescriptionList>,
  );
  expect(ref.current?.tagName).toBe("DL");
  expect(ref.current?.querySelector("dt")?.textContent).toBe("工具");
  expect(ref.current?.querySelector("dd")?.textContent).toBe("React");
  expect(ref.current?.classList.contains("ui-surface")).toBe(false);
});
