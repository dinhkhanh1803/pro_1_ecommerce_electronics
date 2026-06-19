import { CheckCircleIcon, InfoIcon, XCircleIcon, XIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION = 3500;

const getAlertToastType = (message: string): ToastType => {
  const normalized = message.toLowerCase();
  if (
    normalized.includes("lỗi") ||
    normalized.includes("không thể") ||
    normalized.includes("thất bại") ||
    normalized.includes("không đúng") ||
    normalized.includes("thiếu") ||
    normalized.includes("failed") ||
    normalized.includes("error")
  ) {
    return "error";
  }

  if (
    normalized.includes("thành công") ||
    normalized.includes("đã ") ||
    normalized.includes("success")
  ) {
    return "success";
  }

  return "info";
};

const toastStyles: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-emerald-600",
  error: "text-red-600",
  info: "text-blue-600",
};

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") return <CheckCircleIcon className="h-5 w-5" />;
  if (type === "error") return <XCircleIcon className="h-5 w-5" />;
  return <InfoIcon className="h-5 w-5" />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const text = String(message || "").trim();
      if (!text) return;

      const id = Date.now() + Math.random();
      setToasts((current) =>
        [...current, { id, message: text, type }].slice(-4),
      );
      window.setTimeout(() => dismissToast(id), TOAST_DURATION);
    },
    [dismissToast],
  );

  useEffect(() => {
    window.alert = (message?: unknown) => {
      const text = String(message ?? "");
      showToast(text, getAlertToastType(text));
    };
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-10 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-24 sm:w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg shadow-slate-900/10 backdrop-blur ${toastStyles[toast.type]}`}
            role="status"
          >
            <div className={`mt-0.5 shrink-0 ${iconStyles[toast.type]}`}>
              <ToastIcon type={toast.type} />
            </div>
            <p className="min-w-0 flex-1 text-sm font-semibold leading-5">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded p-0.5 opacity-70 transition hover:bg-white/60 hover:opacity-100"
              aria-label="Đóng thông báo"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
