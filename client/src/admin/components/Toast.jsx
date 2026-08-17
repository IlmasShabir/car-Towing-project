import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

const TOAST_META = {
  success: { icon: FiCheckCircle, tone: 'success' },
  error: { icon: FiAlertCircle, tone: 'error' },
  info: { icon: FiInfo, tone: 'info' },
  warn: { icon: FiAlertTriangle, tone: 'warn' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, title, message) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      info: (title, message) => push('info', title, message),
      warn: (title, message) => push('warn', title, message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="a-toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const meta = TOAST_META[toast.type] || TOAST_META.info;
          const Icon = meta.icon;
          return (
            <div className="a-toast" key={toast.id}>
              <span className={`a-toast-icon ${meta.tone}`}>
                <Icon />
              </span>
              <div className="a-toast-body">
                <div className="a-toast-title">{toast.title}</div>
                {toast.message && <div className="a-toast-msg">{toast.message}</div>}
              </div>
              <button
                className="a-toast-close"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <FiX />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};