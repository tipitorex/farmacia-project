import { useEffect } from "react";

export function useOutsideClick(ref, onClose) {
  useEffect(() => {
    const onOutsideClick = (event) => {
      if (!ref.current) return;
      if (!ref.current.contains(event.target)) {
        onClose();
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [ref, onClose]);
}
