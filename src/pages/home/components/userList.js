import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { createNewChat } from "../../../apiCalls/chat"
import { showLoader, hideLoader} from "../../../redux/loaderSlice"
import { setAllChats, setSelectedChat } from "../../../redux/usersSlice"
import moment from "moment"

const UsersList = ({searchKey})=>{
    const {allUsers, allChats, user:currentUser, selectedChat} = useSelector(state => state.userReducer)
    const dispatch = useDispatch()

    const startNewChat = async (selectedUserId) =>{
        let response = null
        try{
            dispatch(showLoader())
            response = await createNewChat([currentUser._id, selectedUserId])
            dispatch(hideLoader())
 
            if(response.success){
                toast.success(response.message)
                const newChat = response.data
                const updatedChats =[...allChats, newChat]
                dispatch(setAllChats(updatedChats))
                dispatch(setSelectedChat(newChat))
            }
        }catch(error){
            toast.error(response.message)
            dispatch(hideLoader())
        }
    }

    const getFullName =(user) =>{
        let fName = user?.firstName.toLowerCase().charAt(0).toUpperCase() + user?.firstName.slice(1)
        let lName = user?.lastName.toLowerCase().charAt(0).toUpperCase() + user?.lastName.slice(1)
        return `${fName} ${lName}`
    }

    const getInitials = (user) => {
        let f = user?.firstName.toUpperCase()[0]
        let l = user?.lastName.toUpperCase()[0]
        return `${f}${l}`
    }

    const openChat = async (selectedUserId) =>{
        const selectedChat = allChats.find(chat => 
            chat.members.map(m => m._id).includes(currentUser._id) &&
            chat.members.map(m => m._id).includes(selectedUserId)
        )
        if(selectedChat){
            dispatch(setSelectedChat(selectedChat))
        }
    }

    const IsSelectedChat = (user) =>{
        if(selectedChat){
            return selectedChat.members.map(m => m._id).includes(user._id)
        }
        return false
    }

    const getLastMessage = (userId) =>{
        const chat = allChats.find(chat =>chat.members.map(m => m._id).includes(userId))

        if(!chat){
            return ""
        }else{
            const msgPrefix = chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
            return msgPrefix + chat?.lastMessage?.text?.substring(0, 25)
        }
    }

    const getLastMessageTimeStamp = (userId) =>{
        const chat = allChats.find(chat =>chat.members.map(m => m._id).includes(userId))

        if(!chat && chat?.lastMessage){
            return ""
        }else{
            return moment(chat?.lastMessage?.createdAt).format('hh:mm A')
        }
    } 

    return(
        allUsers
        .filter(user =>{
            return ((user.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchKey.toLowerCase())) && searchKey) ||
            (allChats.some(chat =>chat.members.map(m => m._id).includes(user._id)))
        })
        .map(user =>{
            return <div className="user-search-filter" onClick={()=>openChat(user._id)} key={user._id}>
                <div className={IsSelectedChat(user) ? "selected-user" :"filtered-user"  }>
                    <div className="filter-user-display">
                        {user.profilePic && <img src={user.profilePic} alt="Profile Pic" className="user-profile-image" />}
                        {!user.profilePic && <div className={IsSelectedChat(user) ? "user-selected-avatar":"user-default-avatar"}>{getInitials(user)}</div>}
                        <div className="filter-user-details">
                            <div className="user-display-name">{getFullName(user)}</div>
                            <div className="user-display-email">{getLastMessage(user._id) || user.email}</div>
                        </div>
                        <div className="last-message-timestamp">{getLastMessageTimeStamp(user._id)}</div>
                        {!allChats.find(chat => chat.members.map(m => m._id).includes(user._id)) &&
                            <div className="user-start-chat">
                                <button 
                                    onClick = {() => startNewChat(user._id)}
                                    className="user-start-chat-btn"
                                >
                                    Start Chat
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        })
    )   
}
export default UsersList