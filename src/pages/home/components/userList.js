import toast from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { createNewChat } from "../../../apiCalls/chat"
import { showLoader, hideLoader} from "../../../redux/loaderSlice"
import { setAllChats } from "../../../redux/usersSlice"

const UsersList = ({searchKey})=>{
    const {allUsers, allChats, user:currentUser} = useSelector(state => state.userReducer)
    const dispatch = useDispatch()

    const startNewChat = async (userId) =>{
        let response = null
        try{
            dispatch(showLoader())
            response = await createNewChat([currentUser._id, userId])
            dispatch(hideLoader())
 
            if(response.success){
                toast.success(response.message)
                const newChat = response.data
                const updatedChats =[...allChats, newChat]
                dispatch(setAllChats(updatedChats))
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
    return(
        allUsers
        .filter(user =>{
            return ((user.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchKey.toLowerCase())) && searchKey) ||
            (allChats.some(chat =>chat.members.includes(user._id)))
        })
        .map(user =>{
            return <div className="user-search-filter">
                <div className="filtered-user">
                    <div className="filter-user-display">
                        {user.profilePic && <img src={user.profilePic} alt="Profile Pic" className="user-profile-image" />}
                        {!user.profilePic && <div className="user-default-profile-pic">{getInitials(user)}</div>}
                        <div className="filter-user-details">
                            <div className="user-display-name">{getFullName(user)}</div>
                            <div className="user-display-email">{user.email}</div>
                        </div>
                        {!allChats.find(chat => chat.members.includes(user._id)) &&
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