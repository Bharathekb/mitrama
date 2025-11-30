import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const SubmitHandler = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  };

  return (
    <div className="Main-container">
      <form className="My-form">
        <h1 className="Chat-heading Heading-3 text-center mb-0 mt-5">
          Mitrama
        </h1>
        <div className="My-FormContainer">
          <div className="My-Formbox">
            <div className="My-form-group w-100">
              <label className="My-label">
                Email <span className="My-redstar">*</span>
              </label>
              <input type="email" className="form-control" />
            </div>
          </div>
          <div className="My-Formbox">
            <div className="My-form-group w-100">
              <label className="My-label">
                Password <span className="My-redstar">*</span>
              </label>
              <input type="password" className="form-control" />
            </div>
          </div>
          <button type="submit" className="btn My-formbtn w-100 mt-4">
            Log in
          </button>
          <div className="d-flex justify-content-between w-100">
            <div className="Fw-600">Don't have an account?</div>
            <div className="Create-AC">
              <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
