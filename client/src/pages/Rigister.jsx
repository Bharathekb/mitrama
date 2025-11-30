import React, { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const { username, email, password, confirmpassword } = data;

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const SubmitHandler = (e) => {
    e.preventDefault();
    console.log("Form Data:", data);
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
                name="confirmPassword"
                value={confirmpassword}
                onChange={changeHandler}
              />
            </div>
          </div>

          <button type="submit" className="btn My-formbtn w-100 mt-4">
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
