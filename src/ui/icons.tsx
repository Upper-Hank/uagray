import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
} from "react";
export const IconSizeContext = createContext<{
  size: number;
  max?: number;
} | null>(null);
import {
  Icon as UplusIcon,
  type IconName as UplusIconName,
} from "@uplus-icon/react/dynamic";
import { iconMeta } from "@uplus-icon/core/metadata";

export type IconName = UplusIconName;
export const DEFAULT_ICON_WEIGHT = 1;

/** Current install is the source of truth. */
export const iconNames = iconMeta.map((meta) => meta.name as IconName);

export function Icon({
  name,
  size,
  weight = DEFAULT_ICON_WEIGHT,
  absoluteWeight = true,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof UplusIcon>, "name" | "size"> & {
  name: IconName;
  /** Numeric CSS pixels. Defaults follow the enclosing control; enclosing constraints cap explicit sizes. */
  size?: number;
}) {
  const inherited = useContext(IconSizeContext);
  const resolvedSize = Math.min(
    size ?? inherited?.size ?? 18,
    inherited?.max ?? Infinity,
  );
  return (
    <UplusIcon
      name={name}
      size={resolvedSize}
      weight={weight}
      absoluteWeight={absoluteWeight}
      aria-hidden="true"
      {...props}
    />
  );
}
