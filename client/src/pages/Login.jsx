import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const {email, password} = data;

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const SubmitHandler = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/login", data).then(
      res => alert(res.data)
    )
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
              <button type="submit" name="submit" className="btn My-formbtn w-100 mt-4">
                Login
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
