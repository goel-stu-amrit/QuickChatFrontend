import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLoggedUser, getAllUsers } from '../apiCalls/users'
import { getAllChats } from '../apiCalls/chat'
import { useDispatch} from 'react-redux'
import { showLoader, hideLoader } from '../redux/loaderSlice'
import { setUser, setAllUsers, setAllChats } from '../redux/usersSlice'
import toast from 'react-hot-toast'

const ProtectedRoute = ({children}) => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const getLoggedInUser  = async () => {
    let response = null
    try{
      dispatch(showLoader())
      response = await getLoggedUser()
      dispatch(hideLoader())
      
      if(response.success){
        dispatch(setUser(response.data))
      }else{
        toast.error(response.message)
        navigate('/login')
      }
    }catch(error){
      dispatch(hideLoader())
      navigate('/login') 
    }
  }

  const getAllUsersFromDb = async () =>{
    let response = null
    try{
      dispatch(showLoader())
      response = await getAllUsers()
      dispatch(hideLoader())
      
      if(response.success){
        dispatch(setAllUsers(response.data))
      }else{
        toast.error(response.message)
        navigate('/login')
      }
    }catch(error){
      dispatch(hideLoader())
      navigate('/login')
    }
  }

  const getCurrentUserChats = async () => {
    try{
      const response = await getAllChats()
      if(response.success){
        dispatch(setAllChats(response.data))
      }else{
        navigate('/login')
      }
    }catch(error){
      navigate('/login')
    }
  }

  useEffect(()=>{
    if(localStorage.getItem('token')){
     getLoggedInUser()
     getAllUsersFromDb()
     getCurrentUserChats()
    }else{
     navigate('/login')
    }
  }, [])
  
  return (
    <div>
      {children}
    </div>
    )
}

export default ProtectedRoute
