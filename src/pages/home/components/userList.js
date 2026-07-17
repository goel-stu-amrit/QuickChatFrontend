import {useEffect} from 'react'
import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { createNewChat } from "../../../apiCalls/chat"
import { setAllChats, setSelectedChat, setCurrentChatType} from "../../../redux/usersSlice"
import { resetSupport } from '../../../redux/supportSlice'
import store from '../../../redux/store'
import moment from "moment"

const UsersList = ({
    searchKey, socket, onlineUsers, conversationId, showAssistant, onAssistantClick,
    tickets =[], waitingChats = [], onAssign, onPromote, onOpenTicket, isAdmin = false
})=>{
    const {allUsers, allChats, user:currentUser, selectedChat, currentChatType} = useSelector(state => state.userReducer)
    const {conversationId:activeConversationId} = useSelector(state => state.supportReducer)
    const dispatch = useDispatch()

    const startNewChat = async (e, selectedUserId) =>{
        e.stopPropagation()
        
        try{
            const response = await createNewChat([currentUser._id, selectedUserId])
            if(response.success){
                toast.success(response.message)
                const newChat = response.data
                socket.emit('start-new-chat', newChat)
                dispatch(setAllChats([...allChats, newChat]))
                dispatch(setSelectedChat(newChat))
                dispatch(setCurrentChatType('normal'))
                dispatch(resetSupport())
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    const openChat = async (selectedUserId) =>{
        const selectedChat = allChats.find(chat => 
            chat.members.map(m => m._id).includes(currentUser._id) &&
            chat.members.map(m => m._id).includes(selectedUserId)
        )
        if(selectedChat){
            dispatch(setSelectedChat(selectedChat))
            dispatch(setCurrentChatType('normal'))
            dispatch(resetSupport())
        }
    }

    const openOrPrepareChat = async (user) =>{
        const existing = allChats.find(chat=>
            chat.members.map(m => m._id).includes(currentUser._id) &&
            chat.members.map(m => m._id).includes(user._id)
        )

        if(existing){
            dispatch(setSelectedChat(existing))
            dispatch(setCurrentChatType('normal'))
            dispatch(resetSupport())
        }else{
            try{
            const res = await createNewChat([currentUser._id, user._id])
            if(res.success){
                const newChat = res.data
                socket.emit('start-new-chat', newChat)
                dispatch(setAllChats([newChat, ...allChats]))
                dispatch(setSelectedChat(newChat))
                dispatch(setCurrentChatType('normal'))
                dispatch(resetSupport())
            }
            
            }catch(error){
                toast.error(error.message)
            }
        }
    }

    const findChatByUser = (userId) =>{
        return allChats?.find(chat =>
            chat?.members.some(m => m?._id === userId)
        )
    }

    const getFullName =(user) =>{
        if(!user) return ""
        let fName = user?.firstName.charAt(0).toUpperCase() + user?.firstName.slice(1).toLowerCase()
        let lName = user?.lastName.charAt(0).toUpperCase() + user?.lastName.slice(1).toLowerCase()
        return `${fName} ${lName}`
    }

    const getInitials = (user) => {
        if(!user) return ""
        let f = user?.firstName.toUpperCase()[0]
        let l = user?.lastName.toUpperCase()[0]
        return `${f}${l}`
    }

    const IsSelectedChat = (user) =>{
        if(!user || !selectedChat) return false
        return selectedChat.members?.some(m => m?._id === user._id)
    }

    const getLastMessage = (userId) =>{
        const chat = findChatByUser(userId)
        if(!chat?.lastMessage) return ""        
        const msgPrefix = chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
        return msgPrefix + chat?.lastMessage?.text?.substring(0, 25)
    }

    const getLastMessageTimeStamp = (userId) =>{
        const chat = findChatByUser(userId)
        if(!chat?.lastMessage) return ""
        return moment(chat?.lastMessage?.createdAt).format('hh:mm A')
    } 

    const getUnreadMessageCount = (userId) =>{
        const chat = findChatByUser(userId)
        if(chat && chat.unreadMessageCount && chat.lastMessage?.sender !== currentUser._id){
            return <div className="unread-message-counter">{chat.unreadMessageCount}</div>
        }else return null
    }

    const getData = () =>{
        let list = []
        if(showAssistant){
            list.push({type:"assistant"})
        }
        tickets.forEach(t =>{
            if(!t?.user) return
            list.push({
                type:"assigned",
                user:t.user,
                ticket:t
            })
        })

        waitingChats.forEach(t =>{
            if(!t?.user) return
            list.push({
                type:'waiting',
                user:t.user,
                ticket:t
            })
        })

        const sortedChat = [...(allChats || [])].sort((a, b) =>{
            const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0)
            const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0)
            return bTime - aTime
        })
        sortedChat?.forEach(chat => {
            const user = chat?.members?.find(m => m?._id !== currentUser?._id)
            if (!user) return;
            list.push({type: 'chat', user, chat})
        })

        if(isAdmin){
            const usersInChat = sortedChat?.map(chat =>
                chat?.members?.find(m => m?._id !== currentUser?._id)?._id
            ).filter(Boolean)

            allUsers.filter(u=> !usersInChat?.includes(u._id))
            .sort((a,b) => getFullName(a).localeCompare(getFullName(b)))
            .forEach(u =>{list.push({type:'adminUsers', user:u})})
        }

        if(searchKey){
            if (!isAdmin) {
                const usersInList = list.map(item => item.user?._id).filter(Boolean)
                allUsers.forEach(u => {
                    if (usersInList.includes(u._id)) return
                    list.push({ type: 'searchUsers', user: u })
                })
            }
        
            list = list.filter(item => {
                if (item.type === 'assistant') return true
                return (
                    getFullName(item.user).toLowerCase().includes(searchKey.toLowerCase()) ||
                    (item.user?.email || '').toLowerCase().includes(searchKey.toLowerCase())
                )
            })
        }
        return list
    }

    useEffect(()=>{
        const handleSetMessageCount = (message) => {
            const selectedChat = store.getState().userReducer.selectedChat
            let allChats = store.getState().userReducer.allChats

            if(selectedChat?._id !== message.chatId){
                const updatedChat = allChats.map(chat =>{
                    if(chat._id === message.chatId){
                        return {
                            ...chat,
                            unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
                            lastMessage : message
                        }
                    }
                    return chat
                })
                allChats = updatedChat
            } else {
                const updatedChat = allChats.map(chat =>{
                    if(chat._id === message.chatId){
                        return {...chat, lastMessage: message}
                    }
                    return chat
                })
                allChats = updatedChat
            }

            const latestChat = allChats.find(chat => chat._id === message.chatId)
            const otherChats = allChats.filter(chat => chat._id !== message.chatId)
            dispatch(setAllChats([latestChat, ...otherChats]))
        }

        const handleNewChatStarted = (chat) => {
            const allChats = store.getState().userReducer.allChats
            const chatExists = allChats.find(c => c._id === chat._id)
            if(!chatExists){
                dispatch(setAllChats([...allChats, chat]))
            }
        }

        socket.on('set-message-count', handleSetMessageCount)
        socket.on('new-chat-started', handleNewChatStarted)

        return () => {
            socket.off('set-message-count', handleSetMessageCount)
            socket.off('new-chat-started', handleNewChatStarted)
        }
    },[])

    return(
        getData().map((obj, index) =>{
            const user = obj.user
            const isOnline = user && onlineUsers?.includes(user._id)
            const onlineStyle = isOnline ? {border:'#82e0aa 3px solid'} : {}
            const selected = IsSelectedChat(user)

            if(obj.type === 'assistant'){
                return(
                    <div className="user-search-filter" onClick={onAssistantClick} key = {"assistant"}>
                        <div className={conversationId && currentChatType === 'support' ? "selected-user": "filtered-user" }>
                            <div className="filter-user-display">
                                <div className={conversationId && currentChatType === 'support' ? "user-selected-avatar":"user-default-avatar"}>QC</div>
                                <div className="filter-user-details">
                                    <div className="user-display-name">Assistant</div>
                                    <div className="user-display-email">How can I help you?</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            if(obj.type ==='assigned'){
                const isActiveTicket = activeConversationId === obj.ticket._id.toString()
                return(
                    <div className="user-search-filter" onClick={()=>onOpenTicket(obj.ticket)} key = {`assigned-${obj.ticket._id}`}>
                        <div className={isActiveTicket ? "selected-user": "filtered-user" }>
                            <div className="filter-user-display">
                                <div className={isActiveTicket ? "user-selected-avatar":"user-default-avatar"}>{getInitials(user)}</div>
                                <div className="filter-user-details">
                                    <div className="user-display-name">{getFullName(user)}</div>
                                    <div className="user-display-email">
                                        <span className={`status-badge ${obj.ticket.status}`}>{obj.ticket.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            
            if(obj.type === 'waiting'){
                const isActiveTicket = activeConversationId === obj.ticket._id.toString()
                return(
                    <div className="user-search-filter" key = {`waiting-${obj.ticket._id}`} onClick={() => onOpenTicket && onOpenTicket(obj.ticket)}>
                        <div className={isActiveTicket ? "selected-user": "filtered-user" }>
                            <div className="filter-user-display">
                                <div className={isActiveTicket ? "user-selected-avatar":"user-default-avatar"}>{getInitials(user)}</div>
                                <div className="filter-user-details">
                                    <div className="user-display-name">{getFullName(user)}</div>
                                    <div className="user-display-email">
                                        Waiting for agent
                                    </div>
                                </div>
                                <div className="user-start-chat">
                                    <button
                                        className="assign-chat-btn"
                                        onClick={(e) =>{
                                            e.stopPropagation()
                                            onAssign(obj.ticket)
                                            }}
                                    >
                                        Assign Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            if(obj.type === 'adminUsers'){
                const isAgent = user.role === 'agent' || user.role === 'admin'
                return(
                    <div key={`adminUser-${user._id}`} className="user-search-filter" onClick={() => openOrPrepareChat(user)}>
                        <div className={selected ? "selected-user" : "filtered-user"}>
                            <div className="filter-user-display">
                                {user.profilePic
                                    ? <img src={user.profilePic} alt="Profile" className="user-profile-image" style={onlineStyle} />
                                    : <div className={selected ? "user-selected-avatar" : "user-default-avatar"} style={onlineStyle}>
                                        {getInitials(user)}
                                    </div>
                                }
                                <div className="filter-user-details">
                                    <div className="user-display-name">{getFullName(user)}</div>
                                    <div className="user-display-email">{user.email}</div>
                                </div>
                                <div className="user-start-chat">
                                    <button className="user-start-chat-btn" onClick={(e) => startNewChat(e, user._id)}>
                                        Start Chat
                                    </button>
                                    {isAgent
                                        ? <span className="agent-badge">{user.role === 'admin' ? 'Admin' : 'Agent'}</span>
                                        : <button className="promote-user-btn" onClick={(e) => { e.stopPropagation(); onPromote(user._id) }}>
                                            Promote
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            if(obj.type === 'searchUsers'){
                return(
                    <div key={`searchUser-${user._id}`} className="user-search-filter" onClick={() => openOrPrepareChat(user)}>
                        <div className={selected ? "selected-user" : "filtered-user"}>
                            <div className="filter-user-display">
                                {user.profilePic
                                    ? <img src={user.profilePic} alt="Profile" className="user-profile-image" style={onlineStyle} />
                                    : <div className={selected ? "user-selected-avatar" : "user-default-avatar"} style={onlineStyle}>
                                        {getInitials(user)}
                                    </div>
                                }
                                <div className="filter-user-details">
                                    <div className="user-display-name">{getFullName(user)}</div>
                                    <div className="user-display-email">{user.email}</div>
                                </div>
                                <div className="user-start-chat">
                                    <button className="user-start-chat-btn" onClick={(e) => startNewChat(e, user._id)}>
                                        Start Chat
                                    </button>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            if(obj.type === 'chat'){
                const freshUser = allUsers.find(u => u._id === user._id) || user
                return(
                    <div key={`chat-${user._id}`} className="user-search-filter" onClick={() => openChat(user._id)}>
                        <div className={selected ? "selected-user" : "filtered-user"}>
                            <div className="filter-user-display">
                                {   user.profilePic ?
                                        <img src={user.profilePic} alt="Profile" className="user-profile-image" style={onlineStyle} />
                                        : <div className={selected ? "user-selected-avatar" : "user-default-avatar"} style={onlineStyle}>
                                            {getInitials(user)}
                                        </div>
                                }
                                <div className="filter-user-details">
                                    <div className="user-display-name">{getFullName(user)}</div>
                                    <div className="user-display-email">{getLastMessage(user._id) || user.email}</div>
                                </div>
                                <div>
                                    {getUnreadMessageCount(user._id)}
                                    <div className="last-message-timestamp">{getLastMessageTimeStamp(user._id)}</div>
                                </div>
                                {isAdmin && (
                                    freshUser.role === 'agent' || freshUser.role === 'admin'
                                        ? <span className="agent-badge">{user.role === 'admin' ? 'Admin' : 'Agent'}</span>
                                        : <button className="promote-user-btn" onClick={(e) => { e.stopPropagation(); onPromote(user._id) }}>
                                            Promote
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                )
            }
        })
    )   
}
export default UsersList