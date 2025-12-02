import React,{useContext,useState,useEffect} from "react";
import {store} from '../App'
import {Navigate } from "react-router-dom";
import axios from "axios";
import Header from '../components/Header'

const Main = () => {
  const [token]=useContext(store)
  const [data,setData] = useState(null)

  useEffect(()=>{
      axios.get("http://localhost:5000/main",{
        headers:{
          'x-token': token
        }
      }).then(res=>setData(res.data)).catch((err)=>console.log(err))
  },[token])
  if (!token) {
  return <Navigate to="/" />;
}

  return (
    <div className="Main-container">
         <Header user={data}/>
        </div>
  );
};

export default Main;
