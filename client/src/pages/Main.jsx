import React, { useContext, useState, useEffect } from "react";
import { store } from "../App";
import { Navigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import ChatScreen from "../components/ChatScreen";
import LoadingSpinner from "../components/LoadingSpinner";

const Main = () => {
  const [token] = useContext(store);
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/main`, {
        headers: {
          "x-token": token,
        },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [token]);
  if (!token) {
    return <Navigate to="/" />;
  }

  if (!data) {
    return (
      <div className="Main-container">
        <LoadingSpinner label="Loading app" />
      </div>
    );
  }

  return (
   <div className="Main-container">
  <Header user={data} />
  <ChatScreen user={data} token={token} />
</div>
  );
};

export default Main;
