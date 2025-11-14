import { useEffect,useState } from 'react';
import './App.css';
import { io } from 'socket.io-client';
const socket = io.connect('http://localhost:3001');

function App() {
 const [message,setMessage] = useState('');
 const [messageReceived, setMessageReceived] =useState('');

  const sendMessage = () => {
    socket.emit("send_message", { message: message});
  }
useEffect(()=>{
  socket.on("receive_message",(data)=>{
 setMessageReceived(data.messageReceived);
  })
},[socket])

  return (
    <div className="App">
      <input type="text" placeholder='message....' onChange={(e)=>{setMessage(e.target.value)}}/>
      <button onClick={sendMessage}>send</button>
    </div>
  );
}

export default App;
