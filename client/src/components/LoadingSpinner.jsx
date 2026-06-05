import React from "react";

const LoadingSpinner = ({ label = "Loading" }) => {
  return (
    <div className="loading-state" role="status">
      <span className="loading-spinner"></span>
      <span>{label}</span>
    </div>
  );
};

export default LoadingSpinner;
