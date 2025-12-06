import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const [errors, setErrors] = useState({});

  const { username, email, password, confirmpassword } = data;

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();

  const SubmitHandler = (e) => {
    e.preventDefault();
    let newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    // Email validation
    const emailPattern = /\S+@\S+\.\S+/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!confirmpassword.trim()) {
      newErrors.confirmpassword = "Confirm your password";
    } else if (password !== confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match";
    }

    // ❗ If ANY errors exist → STOP here
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear old errors
    setErrors({});
    axios
      .post(`${process.env.REACT_APP_API_URL}/register`, data)
      .then((res) => {
        alert(res.data);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        setErrors("Something went wrong");
      });
  };

  return (
    <div className="Main-container">
      <form className="My-form" onSubmit={SubmitHandler}>
        <h1 className="Chat-heading Heading-3 text-center mb-0 mt-5">
          Mitrama
        </h1>
        <div className="My-FormContainer">
          <div className="My-Formbox">
            <div className="My-form-group w-100">
              <label className="My-label">
                Username <span className="My-redstar">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={username}
                onChange={changeHandler}
              />
              {errors.username && <p className="My-err">{errors.username}</p>}
            </div>
          </div>

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

          <div className="My-Formbox">
            <div className="My-form-group w-100">
              <label className="My-label">
                Confirm Password <span className="My-redstar">*</span>
              </label>
              <input
                type="password"
                className="form-control"
                name="confirmpassword"
                value={confirmpassword}
                onChange={changeHandler}
              />
              {errors.confirmpassword && (
                <p className="My-err">{errors.confirmpassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            name="submit"
            className="btn My-formbtn w-100 mt-4"
          >
            Sign Up
          </button>

          <div className="d-flex justify-content-between w-100">
            <div className="Fw-600">Already have an account?</div>
            <div className="Create-AC">
              <Link to="/">Login</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
