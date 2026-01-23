import {useState} from 'react'
import Search from "./search"
import UsersList from "./userList"



const Sidebar = () =>{
    const [searchKey, setSearchKey] = useState('')
    return (
        <div className="app-sidebar">
            {/* // search user */}
            <Search 
                searchKey={searchKey}
                setSearchKey={setSearchKey} 
            />
            {/* // userlist */}
            <UsersList searchKey={searchKey}/>
        </div>
    )
}

export default Sidebar