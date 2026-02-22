import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {signupUser, verifyEmail} from './../../apiCalls/auth'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { showLoader, hideLoader } from '../../redux/loaderSlice'

function Signup(){
  const [step, setStep] = useState("signup")
  const [otp, setOTP] = useState(["","","","","",""])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [user, setUser] = useState({
    firstName:'',
    lastName:'',
    email:'',
    password:''
  })

  const onSignupSubmit = async (event) =>{
    event.preventDefault()
    let response = null
    try{
      dispatch(showLoader())
      response = await signupUser(user)
      dispatch(hideLoader())
      if(response.success){
        toast.success(response.message)
        setStep("OTP")
      }else{
        toast.error(response.message)
      }
    }
    catch(error){
      dispatch(hideLoader())
      toast.error(response.message)
      
    }
  }

  const onVerifyOTP = async (event) =>{
    event.preventDefault()

    const finalOTP = otp.join("")
    if(finalOTP.length !== 6){
      toast.error("Please enter complete otp")
      return
    }
    try{
      dispatch(showLoader())

      const response = await verifyEmail({
        email:user.email,
        otp:finalOTP
      })

      dispatch(hideLoader())

      if(response.success){
        toast.success(response.message)
        navigate('/login')
      }else{
        toast.success(response.message)
      }
    }catch(error){
      dispatch(hideLoader())
      toast.error("Invalid OTP")
    }
  }

  const handleOTPChange = (val, idx) =>{
    if(!/^[0-9]?$/.test(val)) return

    const newOTP = [...otp]
    newOTP[idx] = val
    setOTP(newOTP)

    if(val && idx <5){
      document.getElementById(`otp-${idx+1}`).focus()
    }
  }

  return (
    <div className="container">
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card">
        <div className="card-title">
          <h1>
            {step === "signup" ? "Create Account": "Verify OTP"}
          </h1>
        </div>
        <div className="form">
          {
            step === "signup" &&
            <form onSubmit={onSignupSubmit}>
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
          }
          {
            step === "OTP" &&
            <form onSubmit={onVerifyOTP}>
              <p>Enter the 6-digit OTP sent to your email</p>

              <input 
                type="email"
                value={user.email}
                disabled
              />

              <div className="otp-container">
                {
                  otp.map((digit, index) =>(
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength='1'
                      className='otp-input'
                      value={digit}
                      autoFocus={index === 0}
                      onChange={(e)=>{
                        handleOTPChange(e.target.value, index)
                      }}
                    />
                  ))
                }
              </div>

              <button>Verify OTP</button>
            </form>
          }
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