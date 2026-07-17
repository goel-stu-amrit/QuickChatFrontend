import Header from "./components/header"
import Sidebar from "./components/sidebar"
import ChatArea from "./components/chatArea"
import { useDispatch, useSelector } from "react-redux"
import { io } from "socket.io-client"
import {useEffect, useState} from 'react'
import { startSupportChat } from "../../apiCalls/support"
import { setConversationId, setHandledBy, setStatus } from "../../redux/supportSlice"
import { setUser } from "../../redux/usersSlice"
import store from "../../redux/store"
import toast from "react-hot-toast"

const socket = io(process.env.REACT_APP_BACKEND_URL)

const Home = () => {
  const {selectedChat, user, currentChatType} = useSelector(state => state.userReducer)
  const [onlineUsers, setOnlineUsers] = useState([])
  const dispatch = useDispatch()

  useEffect(() =>{
    if(user){
      socket.emit('join-room', user._id)
      socket.emit('user-login',user._id)
      socket.off('online-users').on('online-users', (onlineusers) =>{
        setOnlineUsers(onlineusers)
      })
      socket.off('online-users-updated').on('online-users-updated', (onlineusers) =>{
        setOnlineUsers(onlineusers)
      })
    }
  },[user])

  useEffect(()=>{
    socket.on('role-updated', (data) =>{
      const user = store.getState().userReducer.user
      dispatch(setUser({...user, role: data.role}))
    })
    return ()=>socket.off('role-updated')
  },[])

  const handleRefresh = async () =>{
    if(!user || user.role!=='user') return
    try{
      const res = await startSupportChat()
      if(res.success){
        dispatch(setConversationId(res.conversationId))
        dispatch(setStatus(res.status))
        dispatch(setHandledBy(res.handledBy))
      }
    }catch(error){
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    handleRefresh()
  },[user])

  return (
    <div className="home-page">
      <Header socket={socket}/>
      <div className="main-content">
        <Sidebar socket={socket} onlineUsers = {onlineUsers} />
        {(selectedChat || currentChatType==='support') && 
          <ChatArea socket={socket}/>
        }
      </div>
    </div>
  )
}

export default Home
