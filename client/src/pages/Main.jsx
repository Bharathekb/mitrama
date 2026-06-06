import React, { useContext, useState, useEffect } from "react";
import { store } from "../App";
import { Navigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import ChatScreen from "../components/ChatScreen";
import LoadingSpinner from "../components/LoadingSpinner";

const Main = () => {
  const [token, setToken] = useContext(store);
  const [data, setData] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!token) return;

    axios
      .get(`${process.env.REACT_APP_API_URL}/main`, {
        headers: {
          "x-token": token,
        },
      })
      .then((res) => setData(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      });
  }, [setToken, token]);
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
  {!isChatOpen && <Header user={data} />}
  <ChatScreen user={data} token={token} onChatActiveChange={setIsChatOpen} />
</div>
  );
};

export default Main;
