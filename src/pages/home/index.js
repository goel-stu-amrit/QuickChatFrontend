import Header from "./components/header"
import Sidebar from "./components/sidebar"
import ChatArea from "./components/chatArea"
import { useSelector } from "react-redux"

const Home = () => {
  const {selectedChat} = useSelector(state => state.userReducer)
  return (
    <div className="home-page">
      <Header />
      <div className="main-content">
        <Sidebar />
        {selectedChat && <ChatArea />}
      </div>
    </div>
  )
}

export default Home
