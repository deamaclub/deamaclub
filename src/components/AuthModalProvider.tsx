"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

type Mode = "signin" | "signup";

interface AuthModalContext {
  open: boolean;
  mode: Mode;
  pendingAction: (() => void) | null;
  setMode: (m: Mode) => void;
  /** Open the modal. If `after` is supplied, runs it after a successful auth. */
  openModal: (opts?: { mode?: Mode; after?: () => void }) => void;
  close: () => void;
}

const Ctx = createContext<AuthModalContext | null>(null);

export function useAuthModal(): AuthModalContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}

export default function AuthModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const pendingRef = useRef<(() => void) | null>(null);

  const openModal = useCallback(
    (opts?: { mode?: Mode; after?: () => void }) => {
      pendingRef.current = opts?.after ?? null;
      if (opts?.mode) setMode(opts.mode);
      setOpen(true);
    },
    []
  );

  const close = useCallback(() => {
    setOpen(false);
    pendingRef.current = null;
  }, []);

  return (
    <Ctx.Provider
      value={{
        open,
        mode,
        setMode,
        pendingAction: pendingRef.current,
        openModal,
        close,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
