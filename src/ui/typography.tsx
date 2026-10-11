import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "./host";

export type HeadingProps = ComponentPropsWithRef<"h2"> & {
  /** Document heading level, independent of visual hierarchy. */
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "page" | "section";
};
export function Heading({
  level = 2,
  variant = "section",
  className,
  ...props
}: HeadingProps) {
  const Element = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Element
      {...props}
      className={cx("ui-heading", `ui-heading--${variant}`, className)}
    />
  );
}

export type TextProps = (
  | (ComponentPropsWithRef<"p"> & { as?: "p" })
  | (ComponentPropsWithRef<"span"> & { as: "span" })
) & { children: ReactNode; variant?: "body" | "supporting" };
export function Text(props: TextProps) {
  if (props.as === "span") {
    const { as, variant = "body", className, ...native } = props;
    return (
      <span
        {...native}
        className={cx("ui-text", `ui-text--${variant}`, className)}
      />
    );
  }
  const { as, variant = "body", className, ...native } = props;
  return (
    <p
      {...native}
      className={cx("ui-text", `ui-text--${variant}`, className)}
    />
  );
}

export type TextListProps = (
  | (ComponentPropsWithRef<"ol"> & { ordered: true })
  | (ComponentPropsWithRef<"ul"> & { ordered?: false })
) & { children: ReactNode; variant?: "contained" | "plain" };
export function TextList(props: TextListProps) {
  if (props.ordered) {
    const { ordered, variant = "contained", className, ...native } = props;
    return (
      <ol
        {...native}
        className={cx(
          variant === "contained" && "ui-surface",
          "ui-text-list",
          `ui-text-list--${variant}`,
          className,
        )}
      />
    );
  }
  const { ordered, variant = "contained", className, ...native } = props;
  return (
    <ul
      {...native}
      className={cx(
        variant === "contained" && "ui-surface",
        "ui-text-list",
        `ui-text-list--${variant}`,
        className,
      )}
    />
  );
}

export type DescriptionListProps = ComponentPropsWithRef<"dl"> & {
  children: ReactNode;
  variant?: "contained" | "plain";
};
/** Native div / dt / dd rows share a text surface and reading axis. */
export function DescriptionList({
  variant = "contained",
  className,
  ...props
}: DescriptionListProps) {
  return (
    <dl
      {...props}
      className={cx(
        variant === "contained" && "ui-surface",
        "ui-description-list",
        `ui-description-list--${variant}`,
        className,
      )}
    />
  );
}
