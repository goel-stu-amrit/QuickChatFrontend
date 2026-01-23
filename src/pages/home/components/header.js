import { useSelector } from "react-redux"

const Header = () => {
  const { user } = useSelector(state => state.userReducer)

  const getFullName =() =>{
    let fName = user?.firstName.toLowerCase().charAt(0).toUpperCase() + user?.firstName.slice(1)
    let lName = user?.lastName.toLowerCase().charAt(0).toUpperCase() + user?.lastName.slice(1)

    return `${fName} ${lName}`
  }

  const getInitials = () => {
    let f = user?.firstName.toUpperCase()[0]
    let l = user?.lastName.toUpperCase()[0]
    return `${f}${l}`
  }

  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments" aria-hidden="true" />
        Quick Chat
      </div>
      <div className="app-user-profile">
        <div className="logged-user-name">{ getFullName() }</div>
        <div className="logged-user-profile-pic">{getInitials()}</div>
      </div>
    </div> 
  )
}

export default Header
