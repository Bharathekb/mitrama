import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PasswordInput from "../components/PasswordInput";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setErrors({});
    setSuccess("");
  };

  const submitHandler = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!data.email.trim()) newErrors.email = "Email is required";
    if (!data.password.trim()) newErrors.password = "Password is required";
    if (data.password && data.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!data.confirmpassword.trim()) {
      newErrors.confirmpassword = "Confirm your password";
    }
    if (data.password !== data.confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    axios
      .post(`${process.env.REACT_APP_API_URL}/forgot-password`, data)
      .then((res) => {
        setSuccess(res.data);
        setTimeout(() => navigate("/"), 900);
      })
      .catch((err) => {
        setErrors({ api: err.response?.data || "Could not update password" });
      });
  };

  return (
    <div className="Main-container">
      <form className="My-form" onSubmit={submitHandler}>
        <div className="auth-logo-wrap">
          <img src="/Mitrama-logo.png" alt="Mitrama" />
          <span>Reset Password</span>
        </div>

        <div className="My-FormContainer">
          <div className="My-Formbox">
            <div className="My-form-group w-100">
              <label className="My-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={data.email}
                onChange={changeHandler}
              />
              {errors.email && <p className="My-err">{errors.email}</p>}
            </div>
          </div>

          <div className="My-Formbox">
            <div className="My-form-group w-100">
              <label className="My-label">New Password</label>
              <PasswordInput
                className="form-control"
                name="password"
                value={data.password}
                onChange={changeHandler}
              />
              {errors.password && <p className="My-err">{errors.password}</p>}
            </div>
          </div>

          <div className="My-Formbox">
            <div className="My-form-group w-100">
              <label className="My-label">Confirm Password</label>
              <PasswordInput
                className="form-control"
                name="confirmpassword"
                value={data.confirmpassword}
                onChange={changeHandler}
              />
              {errors.confirmpassword && (
                <p className="My-err">{errors.confirmpassword}</p>
              )}
            </div>
          </div>

          <button type="submit" className="btn My-formbtn w-100 mt-4">
            Update Password
          </button>

          {success && (
            <p className="form-success text-center position-relative">
              {success}
            </p>
          )}
          {errors.api && (
            <p className="My-err text-center position-relative">{errors.api}</p>
          )}

          <div className="d-flex justify-content-between w-100">
            <div className="Fw-600">Remember password?</div>
            <div className="Create-AC">
              <Link to="/">Login</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
