import {useState} from 'react'
import Search from "./search"
import UsersList from "./userList"



const Sidebar = ({socket, onlineUsers}) =>{
    const [searchKey, setSearchKey] = useState('')
    return (
        <div className="app-sidebar">
            {/* // search user */}
            <Search 
                searchKey={searchKey}
                setSearchKey={setSearchKey} 
            />
            {/* // userlist */}
            <UsersList 
                searchKey={searchKey} 
                socket={socket} 
                onlineUsers={onlineUsers}
            />
        </div>
    )
}

export default Sidebar