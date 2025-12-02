import React,{useState,createContext,useEffect} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Rigister from "./pages/Rigister";
import Main from "./pages/Main";
import "./App.css";

export const store = createContext(); 

function App() {

  const [token,setToken] = useState(null)
  // Load token from localStorage on refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);
  return (
    <store.Provider value={[token,setToken]}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Rigister />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </BrowserRouter>
    </store.Provider>
  );
}

export default App;
