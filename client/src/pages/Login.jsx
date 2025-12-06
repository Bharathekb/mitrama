import React, { useState, useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { store } from "../App";

const Login = () => {
  const [token, setToken] = useContext(store);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const { email, password } = data;

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const SubmitHandler = (e) => {
    e.preventDefault();

    let newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailPattern = /\S+@\S+\.\S+/;
      if (!emailPattern.test(email)) {
        newErrors.email = "Invalid email format";
      }
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    // If errors exist → stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // API login
    axios
      .post(`${process.env.REACT_APP_API_URL}/login`, data)
      .then((res) => {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
      })
      .catch((err) => {
        setErrors({ api: err.response?.data || "Invalid credentials" });
      });
  };

  if (token) {
    return <Navigate to="/main" />;
  }

  return (
    <div className="Main-container">
      <form className="My-form" onSubmit={SubmitHandler}>
        <h1 className="Chat-heading Heading-3 text-center mb-0 mt-5">
          Mitrama
        </h1>

        <div className="My-FormContainer">
          {/* Email */}
          <div className="My-Formbox">
            <div className="My-form-group w-100">
              <label className="My-label">
                Email <span className="My-redstar">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={email}
                onChange={changeHandler}
              />
              {errors.email && <p className="My-err">{errors.email}</p>}
            </div>
          </div>

          {/* Password */}
          <div className="My-Formbox">
            <div className="My-form-group w-100">
              <label className="My-label">
                Password <span className="My-redstar">*</span>
              </label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={password}
                onChange={changeHandler}
              />
              {errors.password && <p className="My-err">{errors.password}</p>}
            </div>
          </div>

          <button type="submit" className="btn My-formbtn w-100 mt-4">
            Login
          </button>

          {/* API Errors */}
          {errors.api && (
            <p className="My-err text-center position-relative">{errors.api}</p>
          )}

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
