import {
  SearchIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  PlusIcon,
  CloseIcon,
  EarthIcon,
  ExternalLinkIcon,
  MenuIcon,
  CopyIcon,
  HeartIcon,
  GridIcon,
  SunIcon,
  MoonIcon,
  EyedropperIcon,
  type IconBaseProps,
} from "@uplus-icon/react";

// The same icon package consumed by uplus-ui. Keep upstream SVG assets intact.
const icons = {
  search: SearchIcon,
  share: ShareIcon,
  left: ChevronLeftIcon,
  right: ChevronRightIcon,
  down: ChevronDownIcon,
  check: CheckIcon,
  plus: PlusIcon,
  close: CloseIcon,
  globe: EarthIcon,
  arrow: ExternalLinkIcon,
  menu: MenuIcon,
  copy: CopyIcon,
  heart: HeartIcon,
  grid: GridIcon,
  sun: SunIcon,
  moon: MoonIcon,
  eyedropper: EyedropperIcon,
  // Compatibility aliases; these no longer render the reference site's branding.
  lab: GridIcon,
  x: CloseIcon,
} as const;
export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons).filter(
  (name) => name !== "lab" && name !== "x",
) as IconName[];
export const DEFAULT_ICON_WEIGHT = 1.25;
export function Icon({
  name,
  size = 18,
  weight = DEFAULT_ICON_WEIGHT,
  absoluteWeight = true,
  ...props
}: Omit<IconBaseProps, "children"> & { name: IconName }) {
  const Component = icons[name];
  return (
    <Component
      size={size}
      weight={weight}
      absoluteWeight={absoluteWeight}
      aria-hidden="true"
      {...props}
    />
  );
}
