/// <reference path="./process.d.ts" />
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SlotRule = {
  name: string;
  min: number;
  max: number;
  /** The slot must register from this region. Omit to allow the root region. */
  region?: string;
};

export type SlotRegistration = {
  key: number;
  slot: string;
  region: string;
  id?: string;
  present: boolean;
};

type RegisterEntry = {
  slot: string;
  region: string;
  id?: string;
  present: boolean;
};

type CompositionContextValue = {
  parent?: CompositionContextValue | null;
  owner: string;
  region: string;
  register: (entry: RegisterEntry) => () => void;
};

const CompositionContext = createContext<CompositionContextValue | null>(null);

export function useCompositionContext() {
  return useContext(CompositionContext);
}
let nextKey = 1;

function report(messages: string[]) {
  if (process.env.NODE_ENV === "production") return;
  for (const message of messages) console.error(message);
}

export function useComposition(
  owner: string,
  rules: readonly SlotRule[],
  validate?: (registrations: SlotRegistration[]) => string[],
) {
  const [registrations, setRegistrations] = useState<SlotRegistration[]>([]);
  const registrationsRef = useRef(registrations);
  const validateRef = useRef(validate);
  validateRef.current = validate;
  const register = useCallback((entry: RegisterEntry) => {
    const key = nextKey++;
    registrationsRef.current = [
      ...registrationsRef.current,
      { ...entry, key },
    ];
    setRegistrations(registrationsRef.current);
    return () => {
      registrationsRef.current = registrationsRef.current.filter(
        (item) => item.key !== key,
      );
      setRegistrations(registrationsRef.current);
    };
  }, []);
  const reported = useRef("");
  useEffect(() => {
    const current = registrationsRef.current;
    const messages: string[] = [];
    for (const rule of rules) {
      const found = current.filter((item) => item.slot === rule.name);
      if (Number.isFinite(rule.max) && found.length > rule.max)
        messages.push(`[uagray] ${owner} 的 ${rule.name} 重复`);
      if (found.filter((item) => item.present).length < rule.min)
        messages.push(`[uagray] ${owner} 缺少 ${rule.name}`);
      if (rule.region) {
        for (const item of found) {
          if (item.region !== rule.region)
            messages.push(
              `[uagray] ${owner} 的 ${rule.name} 必须位于 ${rule.region}`,
            );
        }
      }
    }
    messages.push(...(validateRef.current?.(current) ?? []));
    const signature = messages.join("\n");
    if (signature === reported.current) return;
    reported.current = signature;
    report(messages);
  }, [owner, registrations, rules, validate]);
  const value = useMemo<CompositionContextValue>(
    () => ({ owner, region: "root", register }),
    [owner, register],
  );
  return { registrations, value };
}

export function CompositionRegion({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const parent = useContext(CompositionContext);
  const value = useMemo(
    () => (parent ? { ...parent, region: name } : null),
    [parent, name],
  );
  if (!value) return children;
  return (
    <CompositionContext.Provider value={value}>
      {children}
    </CompositionContext.Provider>
  );
}

export function CompositionRoot({
  value,
  children,
}: {
  value: CompositionContextValue;
  children: ReactNode;
}) {
  const parent = useContext(CompositionContext);
  const nested = useMemo(() => ({ ...value, parent }), [value, parent]);
  return (
    <CompositionContext.Provider value={nested}>
      {children}
    </CompositionContext.Provider>
  );
}

/** Register a mounted slot. Business wrappers work because this follows context, not element types. */
export function useSlot(
  owner: string | readonly string[],
  slot: string,
  options: { id?: string; present?: boolean } = {},
) {
  const nearest = useContext(CompositionContext);
  const ownerKey = typeof owner === "string" ? owner : owner.join("\0");
  let context = nearest;
  while (context && !ownerKey.split("\0").includes(context.owner)) context = context.parent ?? null;
  const present = options.present ?? true;
  const id = options.id;
  const active =
    context !== null && ownerKey.split("\0").includes(context.owner);
  useEffect(() => {
    if (active) return;
    report([
      `[uagray] ${ownerKey.split("\0")[0]}.${slot} 用在了${nearest ? nearest.owner : "组件树之外"}`,
    ]);
  }, [active, context, ownerKey, slot]);
  const register = context?.register;
  const region = context?.region;
  useLayoutEffect(() => {
    if (!active || !register || !region) return;
    return register({ slot, id, present, region });
  }, [active, id, present, region, register, slot]);
}

export function slotIds(registrations: SlotRegistration[], slot: string) {
  return registrations
    .filter((item) => item.slot === slot && item.id)
    .map((item) => item.id as string);
}

export function duplicateSlotIds(
  registrations: SlotRegistration[],
  slot: string,
) {
  const ids = slotIds(registrations, slot);
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}
