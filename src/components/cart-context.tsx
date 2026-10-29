"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────
   Sacola persistida em localStorage.
   Fonte da verdade fora do React (store externo) para evitar
   setState dentro de efeito e manter as abas sincronizadas.
   ───────────────────────────────────────────────────────────── */

const STORAGE_KEY = "possatao:cart:v1";
const EMPTY = "[]";

let cachedRaw = EMPTY;
let cacheValid = false;
const listeners = new Set<() => void>();

function parseLines(raw: string): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]) : [];
  } catch {
    return [];
  }
}

function readStorage(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): string {
  if (!cacheValid) {
    cachedRaw = readStorage();
    cacheValid = true;
  }
  return cachedRaw;
}

function getServerSnapshot(): string {
  return EMPTY;
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cacheValid = false;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function writeLines(next: CartLine[]) {
  const raw = JSON.stringify(next);
  cachedRaw = raw;
  cacheValid = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* modo privado / storage cheio — mantém em memória */
  }
  emit();
}

const noopSubscribe = () => () => {};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  hydrated: boolean;
  toast: string | null;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function lineTotal(l: CartLine) {
  return (
    (l.priceCents + l.addons.reduce((s, a) => s + a.priceCents, 0)) * l.quantity
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = useMemo(() => parseLines(raw), [raw]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback(
    (line: Omit<CartLine, "key">) => {
      const key = `${line.itemId}:${line.addons
        .map((a) => a.id)
        .sort((a, b) => a - b)
        .join("-")}:${line.notes.trim()}`;
      const current = parseLines(getSnapshot());
      const found = current.find((l) => l.key === key);
      const next = found
        ? current.map((l) =>
            l.key === key
              ? { ...l, quantity: Math.min(30, l.quantity + line.quantity) }
              : l
          )
        : [...current, { ...line, key }];
      writeLines(next);
      notify(`${line.quantity}x ${line.name} na sacola`);
    },
    [notify]
  );

  const setQty = useCallback((key: string, qty: number) => {
    const current = parseLines(getSnapshot());
    writeLines(
      qty <= 0
        ? current.filter((l) => l.key !== key)
        : current.map((l) => (l.key === key ? { ...l, quantity: Math.min(30, qty) } : l))
    );
  }, []);

  const remove = useCallback((key: string) => {
    writeLines(parseLines(getSnapshot()).filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => writeLines([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const { count, subtotalCents } = useMemo(
    () => ({
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotalCents: lines.reduce((s, l) => s + lineTotal(l), 0),
    }),
    [lines]
  );

  const value = useMemo(
    () => ({
      lines,
      count,
      subtotalCents,
      isOpen,
      hydrated,
      toast,
      open,
      close,
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, count, subtotalCents, isOpen, hydrated, toast, open, close, add, setQty, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}