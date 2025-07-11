import { useEffect, useState } from "react";
import { tv } from "tailwind-variants";

const toastVariants = tv({
  base: "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ease-out transform",
  variants: {
    type: {
      success: "bg-green-500",
      error: "bg-red-500",
      info: "bg-blue-500",
    },
    isVisible: {
      true: "translate-y-0 opacity-100",
      false: "translate-y-full opacity-0",
    },
  },
  defaultVariants: {
    type: "info",
    isVisible: false,
  },
});

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={toastVariants({ type, isVisible })}>
      {message}
    </div>
  );
}
