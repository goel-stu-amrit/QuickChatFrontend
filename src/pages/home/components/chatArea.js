import {useState, useEffect} from "react"
import { useDispatch, useSelector } from "react-redux"
import { createNewMessage, getAllMessage } from "../../../apiCalls/message"
import { showLoader, hideLoader } from "../../../redux/loaderSlice"
import { clearUnreadMessageCount } from "../../../apiCalls/chat"
import store from '../../../redux/store'
import toast from "react-hot-toast"
import moment from "moment"

const ChatArea = ({ socket }) =>{
    const dispatch = useDispatch()
    const {selectedChat, user, allChats} = useSelector(state => state.userReducer)
    const selectedUser = selectedChat.members.find(u => u._id !== user._id)
    const [message, setMessage] = useState("")
    const [allMessages, setAllMessages] = useState([])

    const sendMessage = async () =>{
        try{
            const newMessage = {
                chatId: selectedChat._id,
                sender: user._id,
                text: message
            }

            socket.emit('send-message', {
                ...newMessage,
                members: selectedChat.members.map(m=>m._id),
                read:false,
                createdAt:moment()
            })
            const response = await createNewMessage(newMessage)

            if(response.success){
                setMessage("")
            }

        }catch(error){
            dispatch(hideLoader())
            toast.error(error.message)
        }
    }

    const formatTime = (timestamp) =>{

        const today = moment().startOf('day')
        const messageDay = moment(timestamp).startOf('day')
        const diff = today.diff(messageDay, 'days')

        if(diff === 0) return `Today ${moment(timestamp).format('hh:mm A')}`;
        else if(diff === 1) return `Yesterday ${moment(timestamp).format('hh:mm A')}`;
        else return moment(timestamp).format('MMM D, hh:mm A');
    }

    const handleEnter = (e) =>{
        if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault()
            sendMessage()
        }
    }

    const getMessages = async () =>{
        try{
            dispatch(showLoader())
            const response = await getAllMessage(selectedChat._id)
            dispatch(hideLoader())

            if(response.success){
                setAllMessages(response.data)
            }

        }catch(error){
            dispatch(hideLoader())
            toast.error(error.message)
        }
    }

    const getFullName =(user) =>{
        let fName = user?.firstName.charAt(0).toUpperCase() + user?.firstName.slice(1).toLowerCase()
        let lName = user?.lastName.charAt(0).toUpperCase() + user?.lastName.slice(1).toLowerCase()
        return `${fName} ${lName}`
    }

    const clearUnreadMessages = async () =>{
        try{
            dispatch(showLoader())
            const response = await clearUnreadMessageCount(selectedChat._id)
            dispatch(hideLoader())
            if(response.success){
                allChats.map( chat => {
                    if(chat._id === selectedChat._id){
                        return response.data
                    }
                    return chat
                })
            }
        }catch(error){
            dispatch(hideLoader())
            toast.error(error.message)
        }
    }
    
    useEffect(()=>{
        getMessages()
        if(selectedChat?.lastMessage?.sender !== user._id){
            clearUnreadMessages()
        }
        socket.off('receive-message').on('receive-message', (data)=>{
            const selectedChat = store.getState().userReducer.selectedChat
            if(selectedChat._id === data.chatId){
                setAllMessages(prevmsg =>[...prevmsg , data])
            }
        })
    },[selectedChat])

    useEffect(()=>{
        const msgContainer = document.getElementById('main-chat-area')
        msgContainer.scrollTop = msgContainer?.scrollHeight
    },[allMessages])

    return <>
        <div className = "app-chat-area">
            <div className="app-chat-area-header">
                {getFullName(selectedUser)}
            </div>
            <div className="main-chat-area" id="main-chat-area">
                {
                    allMessages.map(msg => {
                        const isCurrentUserSender = msg.sender === user._id
                        return (
                            <div className="message-container" style={isCurrentUserSender ? {justifyContent : "end"} : {justifyContent : "start"}}>
                                <div>
                                    <div className={isCurrentUserSender ? "send-message":"received-message"}>
                                        {msg.text}
                                    </div>
                                    <div className="message-timestamp" style={isCurrentUserSender? {float:"right"} : {float: "left"}}>
                                        {formatTime(msg.createdAt)}
                                        {   
                                            isCurrentUserSender && msg.read && 
                                            <i className = "fa fa-check-circle" aria-hidden="true" style={{color : "#e74c3c"}} />
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            <div className="send-message-div">
                <input 
                    type="text"
                    className="send-message-input" 
                    placeholder="type a message" 
                    value={message}
                    onChange={(e)=> {setMessage(e.target.value)}}
                    onKeyDown = {handleEnter}
                />
                <button 
                    className="fa fa-paper-plane send-message-btn" 
                    aria-hidden="true" 
                    onClick={sendMessage}
                />
                </div>
        </div> 
    </>
    
} 

export default ChatArea