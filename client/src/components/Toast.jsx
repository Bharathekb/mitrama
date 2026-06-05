import React, { useEffect } from "react";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-message ${type}`} role="status">
      <span>{message}</span>
      <button type="button" aria-label="Close notification" onClick={onClose}>
        &times;
      </button>
    </div>
  );
};

export default Toast;
