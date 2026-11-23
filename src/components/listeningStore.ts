import { useSyncExternalStore } from "react";

// Tiny open/closed store so any page can open listening mode.
let isOpen = false;
const subs = new Set<() => void>();
const setOpen = (v: boolean) => {
  isOpen = v;
  subs.forEach((f) => f());
};

export function useListeningMode() {
  const open = useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => isOpen,
  );
  return { isOpen: open, open: () => setOpen(true), close: () => setOpen(false) };
}
