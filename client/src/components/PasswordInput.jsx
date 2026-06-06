import React, { useState } from "react";

const PasswordInput = ({ className = "form-control", ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input
        {...props}
        type={isVisible ? "text" : "password"}
        className={className}
      />
      <button
        type="button"
        className="password-toggle-btn"
        aria-label={isVisible ? "Hide password" : "Show password"}
        onClick={() => setIsVisible((value) => !value)}
      >
        <img src={isVisible ? "/CloseEye.svg" : "/OpenEye.svg"} alt="" />
      </button>
    </div>
  );
};

export default PasswordInput;
