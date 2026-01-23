import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {signupUser} from './../../apiCalls/auth'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { showLoader, hideLoader } from '../../redux/loaderSlice'

function Signup(){
  const dispatch = useDispatch()
  const [user, setUser] = useState({
    firstName:'',
    lastName:'',
    email:'',
    password:''
  })

  const navigate = useNavigate()

  const onFormSubmit = async (event) =>{
    event.preventDefault()
    console.log(user)
    let response = null
    try{
      dispatch(showLoader())
      response = await signupUser(user)
      dispatch(hideLoader())
      if(response.success){
        toast.success(response.message)
        navigate('/login')
      }else{
        toast.error(response.message)
      }
    }
    catch(error){
      toast.error(response.message)
      dispatch(hideLoader())
    }
  }

  return (
    <div className="container">
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card">
        <div className="card-title">
          <h1>Create Account</h1>
        </div>
        <div className="form">
          <form onSubmit={onFormSubmit}>
            <div className="column">
              <input type="text"
                placeholder="First Name "
                value={user.firstName}
                onChange={(e)=>{setUser({...user, firstName : e.target.value})}}
              />
              <input type="text"
                placeholder="Last Name " 
                value={user.lastName}
                onChange={(e)=>{setUser({...user, lastName : e.target.value})}}
              />
            </div>
            <input type="email" 
              placeholder="Email" 
              value={user.email}
              onChange={(e)=>{setUser({...user, email : e.target.value})}}
            />
            <input type="password"
              placeholder="Password "
              value={user.password}
              onChange={(e)=>{setUser({...user, password : e.target.value})}}
            />
            <button>Sign Up</button>
          </form>
        </div>
        <div className="card-terms">
          <span>Already have an account?
            <Link to="/login">Login Here</Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Signup