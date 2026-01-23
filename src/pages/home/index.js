import Header from "./components/header"
import Sidebar from "./components/sidebar"
const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <div className="main-content">
        {/* ======================          SIDEBAR LAYOUT        ================ */}
        <Sidebar />
        {/* ====================           chat area layout         ============== */}
      </div>
    </div>
  )
}

export default Home
