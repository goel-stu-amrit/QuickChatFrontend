import {useState, useEffect} from 'react'
import Search from "./search"
import {useSelector, useDispatch} from 'react-redux'
import UsersList from "./userList"
import { setCurrentChatType, setSelectedChat, setAllUsers } from '../../../redux/usersSlice'
import { setConversationId, setHandledBy, setStatus, setSupportMessages, setSupportUserId } from '../../../redux/supportSlice'
import { startSupportChat, getSupportMessages, getWaiting, getMyTickets, assignTicket, promoteUser } from '../../../apiCalls/support'
import toast from 'react-hot-toast'

const Sidebar = ({socket, onlineUsers}) =>{
    const [searchKey, setSearchKey] = useState('')
    const [waitingChats, setWaitingChats] = useState([])
    const [myTickets, setMyTickets] = useState([])
    const dispatch = useDispatch()
    const {user, allUsers} = useSelector(state => state.userReducer)
    const role = user?.role
    const {conversationId} = useSelector(state => state.supportReducer)

    const handleAssistantClick = async () =>{
        try{
            const res = await startSupportChat()
            if (res.success){
                dispatch(setConversationId(res.conversationId))
                dispatch(setStatus(res.status))
                dispatch(setHandledBy(res.handledBy))
                dispatch(setCurrentChatType('support'))
                dispatch(setSelectedChat(null))

                const msgs = await getSupportMessages(res.conversationId)
                if (msgs.success){
                    dispatch(setSupportMessages(msgs.data))
                }
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    const loadAgentData = async () => {
        try{
            const [waiting, tickets] = await Promise.all([getWaiting(), getMyTickets()])
            if (waiting.success) setWaitingChats(waiting.data);
            if (tickets.success) setMyTickets(tickets.data);
        }catch(error){
            toast.error(error.message)
        }
        
    }

    const handleAssign = async (conv) =>{
        const res = await assignTicket(conv._id)
        if(res.success){
            toast.success('Ticket assigned successfully')
        
            loadAgentData()
        }
    }

    const openSupportTicket = async (conv) =>{
        try{
            dispatch(setConversationId(conv._id))
            dispatch(setStatus(conv.status))
            dispatch(setCurrentChatType('support'))
            dispatch(setSupportUserId(conv.user._id))
            dispatch(setSelectedChat(null))

            const msgs = await getSupportMessages(conv._id)
            if (msgs.success){
                dispatch(setSupportMessages(msgs.data))
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    const handlePromote = async (userId) =>{
        try{
            const res = await promoteUser(userId)
            if(res.success){
                toast.success(res.message)
                dispatch(setAllUsers(
                    allUsers.map(u=>u._id === userId ? {...u, role : 'agent'} : u)
                ))
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(role === 'agent') loadAgentData()
    }, [role])

    useEffect(() => {
        if (role !== 'agent') return
        const handleNewWaiting = () => loadAgentData()
        const handleSupportResolved = () => loadAgentData()
        socket.on('new-waiting', handleNewWaiting)
        socket.on('support-resolved', handleSupportResolved)

        return () =>{
            socket.off('new-waiting' , handleNewWaiting)
            socket.off('support-resolved' , handleSupportResolved)
        }
    }, [role])

    return (
        <div className="app-sidebar">
            <Search searchKey={searchKey} setSearchKey={setSearchKey}/>
            {/* for user-assistant chat at top */}
            {
                role === 'user' && 
                (
                    <UsersList 
                        searchKey={searchKey}
                        onlineUsers={onlineUsers}
                        socket={socket}
                        showAssistant={true}
                        onAssistantClick = {handleAssistantClick}
                        conversationId = {conversationId}
                    />
                )
            }
            { 
                role === 'agent' &&
                (
                    <UsersList
                        searchKey={searchKey}
                        onlineUsers={onlineUsers}
                        socket={socket}
                        showAssistant={false}
                        tickets={myTickets}
                        onAssign={handleAssign}
                        waitingChats={waitingChats}
                        onOpenTicket={openSupportTicket}
                    />
                )
            }
            {
                role === 'admin' &&
                (
                    <UsersList
                        searchKey={searchKey}
                        onlineUsers={onlineUsers}
                        socket={socket}
                        showAssistant={false}
                        onPromote={handlePromote}
                        isAdmin={true}
                    />
                )
            }
        </div>
    )
}

export default Sidebar