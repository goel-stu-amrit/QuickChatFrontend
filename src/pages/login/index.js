import {useState} from 'react'
import {Link} from "react-router-dom"
import { loginUser } from '../../apiCalls/auth'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { hideLoader,showLoader } from '../../redux/loaderSlice'
import { setUser } from '../../redux/usersSlice'

const Login = () => {
  const dispatch = useDispatch()
  const [cred, setCred] = useState({
    email:'',
    password:''
  })

  const onFormSubmit = async (event) =>{
    event.preventDefault()
    let response = null
    try{
      dispatch(showLoader())
      response = await loginUser(cred)
      dispatch(hideLoader())
      if(response.success){
        toast.success(response.message)
        dispatch(setUser(response.data))
        localStorage.setItem('token',response.token)
        window.location.href = "/";
      }else{
        toast.error(response.message)
      }
    }catch(error){
      dispatch(hideLoader())
      toast.error(response.message)
      
    }
  }
  return (
    <div className="container">
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card">
        <div className="card-title">
          <h1>Login Here</h1>
        </div>
        <div className="form">
          <form onSubmit={onFormSubmit}>
            <input
              type="email"
              placeholder='Email'
              value={cred.email}
              onChange={(e)=>{setCred({...cred, email: e.target.value})}}
            />
            <input 
              type="password"
              placeholder='Password'
              value={cred.password}
              onChange={(e)=>{setCred({...cred, password: e.target.value})}}
            />
            <button>Login</button>
          </form>
        </div>
        <div className="card-terms">
          <span>
            Don't have an account yet?
            <Link to="/signup">Signup Here</Link>
          </span>
          
        </div>
      </div>
    </div>
    
  )
}

export default Login
