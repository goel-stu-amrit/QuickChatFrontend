import Header from "./components/header"
import Sidebar from "./components/sidebar"
import ChatArea from "./components/chatArea"
import { useSelector } from "react-redux"
import { io } from "socket.io-client"
import {useEffect, useState} from 'react'

const socket = io('http://localhost:5000')
const Home = () => {
  const {selectedChat, user} = useSelector(state => state.userReducer)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() =>{
    if(user){
      socket.emit('join-room', user._id)
      socket.emit('user-login',user._id)
      socket.on('online-users', (onlineusers) =>{
        setOnlineUsers(onlineusers)
      })
    }
  },[user])

  return (
    <div className="home-page">
      <Header />
      <div className="main-content">
        <Sidebar socket={socket} onlineUsers = {onlineUsers} />
        {selectedChat && <ChatArea socket={socket}/>}
      </div>
    </div>
  )
}

export default Home
