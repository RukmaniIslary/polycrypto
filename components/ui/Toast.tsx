"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0" />,
  error: <XCircle className="w-5 h-5 text-accent-red shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-accent-amber shrink-0" />,
  info: <Info className="w-5 h-5 text-accent-blue shrink-0" />,
};

function ToastItem({ id, message, type }: { id: string; message: string; type: "success" | "error" | "warning" | "info" }) {
  const removeToast = useAppStore((s) => s.removeToast);

  useEffect(() => {
    const t = setTimeout(() => removeToast(id), 3500);
    return () => clearTimeout(t);
  }, [id, removeToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="flex items-start gap-3 bg-bg-elevated border border-border rounded-xl px-4 py-3 shadow-2xl min-w-[280px] max-w-[360px]"
    >
      {ICONS[type]}
      <span className="text-sm text-text-primary flex-1 leading-snug">{message}</span>
      <button onClick={() => removeToast(id)} className="text-text-dim hover:text-text-secondary mt-0.5">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useAppStore((s) => s.toasts);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
