import {useState, useEffect} from "react"
import { useDispatch, useSelector } from "react-redux"
import { createNewMessage, getAllMessage } from "../../../apiCalls/message"
import { showLoader, hideLoader } from "../../../redux/loaderSlice"
import { clearUnreadMessageCount } from "../../../apiCalls/chat"
import store from '../../../redux/store'
import toast from "react-hot-toast"
import moment from "moment"
import { setAllChats } from "../../../redux/usersSlice"
import { addSupportMessage, setStatus, setHandledBy } from "../../../redux/supportSlice"
import { sendSupportMessage, resolveConversation} from '../../../apiCalls/support'
import EmojiPicker from "emoji-picker-react"

const ChatArea = ({ socket }) =>{
    const dispatch = useDispatch()
    const {selectedChat, user, allChats, currentChatType} = useSelector(state => state.userReducer)
    
    const {conversationId, status, messages:supportMessages} = useSelector(state => state.supportReducer)
    const isSupport = currentChatType === 'support'
    const selectedUser = !isSupport ? selectedChat?.members?.find(u => u._id !== user._id) : null

    const [message, setMessage] = useState("")
    const [allMessages, setAllMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [data, setData] = useState(null)

    const sendMessage = async (image) =>{
        const trimmedMessage = message.trim()
        if(!image && !trimmedMessage){
            setMessage("")
            return
        }
        try{
            const newMessage = {
                chatId: selectedChat._id,
                sender: user._id,
                text: trimmedMessage,
                image: image
            }

            socket.emit('send-message', {
                ...newMessage,
                members: selectedChat.members.map(m=>m._id),
                read:false,
                createdAt:moment().format('YYYY-MM-DD hh:mm:ss A')
            })
            const response = await createNewMessage(newMessage)
            if(response.success){
                setMessage("")
                setShowEmojiPicker(false)
            }

        }catch(error){
            toast.error(error.message)
        }
    }

    const sendSupportMsg = async () =>{
        const trimmedMessage = message.trim()
        if(!trimmedMessage) return
        try{
            dispatch(addSupportMessage({
                sender:user?.role === 'agent' ? 'agent' : 'user',
                message:trimmedMessage,
                createdAt: new Date()
            }))
            setMessage("")
            
            const res = await sendSupportMessage(conversationId, trimmedMessage)
            if(res.success){
                if(res.aiReply){
                    dispatch(addSupportMessage({
                        sender :'ai',
                        message: res.aiReply,
                        createdAt : new Date()
                    }))
                }
                if(res.escalated){
                    dispatch(setStatus('waiting'))
                    dispatch(setHandledBy('agent'))
                    dispatch(addSupportMessage({
                        sender:'ai',
                        message: "Your issue has been escalated to our support team. An agent will be with you sortly",
                        createdAt : new Date()
                    }))
                }
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    const handleResolve= async () =>{
        try{
            const res = await resolveConversation(conversationId)
            if(res.success){
                dispatch(setStatus('resolved'))
                toast.success("Conversation Resolved")
            }
        }catch(error){
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
            isSupport ? sendSupportMsg() : sendMessage()
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
        if(!user) return ""
        let fName = user?.firstName.charAt(0).toUpperCase() + user?.firstName.slice(1).toLowerCase()
        let lName = user?.lastName.charAt(0).toUpperCase() + user?.lastName.slice(1).toLowerCase()
        return `${fName} ${lName}`
    }

    const clearUnreadMessages = async () =>{
        try{
            socket.emit('clear-unread-message', {
                chatId : selectedChat._id,
                members: selectedChat.members.map(m=>m._id)
            })
            const response = await clearUnreadMessageCount(selectedChat._id)
            if(response.success){
                const allChats = store.getState().userReducer.allChats
                const updated = allChats.map(chat => {
                    if(chat._id === selectedChat._id) return response.data
                    return chat
                })
                dispatch(setAllChats(updated))
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    const handleToggleEmojiPicker = () =>{
        setShowEmojiPicker(!showEmojiPicker)
    }

    const sendImage = async (e) =>{
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = async () =>{
            sendMessage(reader.result)
        }
    }
    
    useEffect(()=>{
        if(isSupport || !selectedChat?._id) return

        getMessages()
        if(selectedChat?.lastMessage?.sender !== user._id){
            clearUnreadMessages()
        }

        socket.off('receive-message').on('receive-message', (message)=>{
            const selectedChat = store.getState().userReducer.selectedChat
            if (selectedChat?._id === message.chatId) {
                setAllMessages(prev => [...prev, message])

                const allChats = store.getState().userReducer.allChats
                const updatedChats = allChats.map(chat => {
                    if (chat._id === message.chatId) {
                        return { ...chat, lastMessage: message }
                    }
                    return chat
                })
                dispatch(setAllChats(updatedChats))
            
                if (message.sender !== user._id) {
                    clearUnreadMessages()
                }
            }
        })
        

        socket.off('cleared-message-count').on('cleared-message-count', data=>{
            const selectedChat  = store.getState().userReducer.selectedChat
            const allChats = store.getState().userReducer.allChats
            if(selectedChat._id === data.chatId){
                const updatedChat = allChats.map(chat =>{
                    if(chat._id === data.chatId){
                        return {...chat, unreadMessageCount:0}
                    }
                    return chat
                })
                dispatch(setAllChats(updatedChat))

                setAllMessages(prevMsg=>{
                    return prevMsg.map(msg=>{
                        return {...msg, read:true}
                    })
                })
            }
        })

        socket.off('started-typing').on('started-typing', (data) =>{
            setData(data)
            if(selectedChat._id === data.chatId && data.sender !== user._id){
                setIsTyping(true)
                setTimeout(()=>{setIsTyping(false)},5000)
            }
        })

    },[selectedChat, isSupport])

    useEffect(() =>{
        if(!isSupport) return

        socket.off('support-receive-message').on('support-receive-message', (data)=>{
            const { conversationId } = store.getState().supportReducer
            if(data.conversationId === conversationId){
                dispatch(addSupportMessage(data))
            }
        })

        socket.off('support-assigned').on('support-assigned', ()=>{
            dispatch(setStatus('active'))
            dispatch(setHandledBy('agent'))
            dispatch(addSupportMessage({
                sender:'ai',
                message: "An agent has joined the conversation to assist you",
                createdAt : new Date()
            }))
        })

        socket.off('support-resolved').on('support-resolved', () =>{
            dispatch(setStatus('resolved'))
        })
    }, [isSupport, conversationId])

    useEffect(()=>{
        const msgContainer = document.getElementById('main-chat-area')
        if(msgContainer) msgContainer.scrollTop = msgContainer?.scrollHeight
    },[allMessages, supportMessages, isTyping])

    return <>
        <div className = "app-chat-area">
            <div className="app-chat-area-header">
                {isSupport ?"Assistant" :getFullName(selectedUser)}
                {isSupport && user?.role === 'agent' && status !== 'resolved' && (
                    <button className = 'resolve-btn' onClick = {handleResolve}>Resolve</button>
                )}
            </div>

            {isSupport && status ==='waiting' && (
                <div className = 'support-banner waiting'>Waiing for an agent to join the conversation...</div>
            )}
            {isSupport && status === 'resolved' && (
                <div className="support-banner resolved">This conversation has been resolved.</div>
            )}
            <div className="main-chat-area" id="main-chat-area">
                {
                    isSupport && supportMessages.map((msg, i)=>{
                        const isUser = msg.sender === 'user'
                        const isAi = msg.sender === 'ai'

                        const isOwnMessage = (user?.role === 'agent' && (msg.sender === 'agent' || msg.sender === 'ai')) || (user?.role !== 'agent' && msg.sender === 'user')
                        return (
                            <div key={i} className="message-container"
                                style={{justifyContent : isOwnMessage ? "end" : "start"}}
                            >
                                <div>
                                    {!isOwnMessage && (<div className="sender-label">{isAi ? '🤖 Assistant' : isUser ? '👤 User' : '👤 Agent'}</div>)}
                                    <div className={isOwnMessage ? "send-message" : isAi ? "ai-message" : "agent-message"}>
                                        {msg.message}
                                    </div>
                                    <div className="message-timestamp"
                                        style={{float : isOwnMessage  ? "right" : "left"}}
                                    >
                                        {formatTime(msg.createdAt)}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
                {
                    !isSupport && allMessages.map(msg => {
                        const isCurrentUserSender = msg.sender === user._id
                        return (
                            <div key={msg._id}
                                className="message-container" 
                                style={{justifyContent : isCurrentUserSender ? "end" : "start"}}
                            >
                                <div>
                                    <div className={isCurrentUserSender ? "send-message":"received-message"}>
                                        <div>{msg.text}</div>
                                        <div>{msg.image && <img src={msg.image} alt="selected-image" height='120px' width='120px' />}</div>
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
                <div className="typing-indicator">
                    {!isSupport && isTyping && selectedChat?.members.map(m=>m._id).includes(data?.sender) &&
                        <i>typing...</i>
                    }
                </div>
            </div>
            {
                !isSupport && showEmojiPicker && 
                <div style={{width:'100%', display:'flex', padding:'0px 20px', justifyContent:'right'}}>
                    <EmojiPicker style={{width:'300px', height:'400px'}} onEmojiClick={(e) => setMessage(prev => prev + e.emoji)} />
                </div>
            }
            <div className="send-message-div">
                <input 
                    type="text"
                    className="send-message-input" 
                    placeholder={isSupport ? "type your query":"type a message"} 
                    value={message}
                    disabled={isSupport && status === 'resolved'}
                    onChange={(e)=> {
                        setMessage(e.target.value)
                        if(!isSupport){
                            socket.emit('user-typing',{
                                chatId : selectedChat._id,
                                members:selectedChat.members.map(m=>m._id),
                                sender:user._id
                            })
                        }
                    }}
                    onKeyDown = {handleEnter}
                />
                {!isSupport && 
                    <>
                        <label htmlFor="file">
                            <i className="fa fa-picture-o send-image-btn"></i>
                            <input 
                                type="file"
                                id="file"
                                style={{display:'none'}}
                                accept="image/jpg, image/png, image/jpeg, image/gif"
                                onChange={sendImage}
                            />

                        </label>

                        <button 
                            className="fa fa-smile-o send-emoji-btn" 
                            aria-hidden="true" 
                            onClick={handleToggleEmojiPicker}
                        />
                    </>
                }
                        
                <button 
                    className="fa fa-paper-plane send-message-btn" 
                    aria-hidden="true" 
                    onClick={() =>isSupport ? sendSupportMsg('') :sendMessage('')}
                />
            </div>
        </div> 
    </>
    
} 

export default ChatArea