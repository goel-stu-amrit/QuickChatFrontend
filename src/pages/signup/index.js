import {useState, useEffect} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {checkOTPStatus, resendOTP, signupUser, verifyEmail} from './../../apiCalls/auth'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { showLoader, hideLoader } from '../../redux/loaderSlice'

function Signup(){
  const [step, setStep] = useState("signup")
  const [otp, setOTP] = useState(["","","","","",""])
  const [resendTimer, setResendTimer] = useState(0)
  const [OTPExpired, setOTPExpired] = useState(false)
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
        localStorage.setItem("pendingVerificationEmail", JSON.stringify({
          email: user.email,
          time: Date.now()
        }))
        setStep("OTP")
        setResendTimer(60)
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
        localStorage.removeItem("pendingVerificationEmail")
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

  const handleResendOTP = async () =>{
    try{
      dispatch(showLoader())
      const response = await resendOTP(user.email)
      dispatch(hideLoader())

      if(response.success){
        toast.success("OTP sent successfully")
        setResendTimer(60)
        setOTPExpired(false)
      }else{
        toast.error(response.message)
      }
    }catch(error){
      dispatch(hideLoader())
      toast.error("Unable to resend OTP")
    }
  }

  const handleOTPKeyDown = async (e, idx) =>{
    const key  = e.key

    if(key === "Backspace"){
      e.preventDefault()
      const newOTP = [...otp]

      if(newOTP[idx]){
        newOTP[idx] = ''
        setOTP(newOTP)
      }else if(idx > 0){
        document.getElementById(`otp-${idx-1}`).focus()
        newOTP[idx-1] = ""
        setOTP(newOTP)
      }
    }
  }

  const checkOtpStatus = async() =>{
      const raw = localStorage.getItem("pendingVerificationEmail")
      if(!raw) return;

      const {email} = JSON.parse(raw)

      const response = await checkOTPStatus(email)

      if(response.success){
        if(response.otpExpired){
          setOTPExpired(true)
          toast.error("OTP has expired. Please resend OTP")
        }
      }
    }

  useEffect(()=>{
    const data = JSON.parse(localStorage.getItem("pendingVerificationEmail"))

    if(!data){
      setStep("signup")
      return;
    }

    const isExpired = Date.now() - data.time > 24*60*60*1000

    if (isExpired){
      localStorage.removeItem("pendingVerificationEmail")
    }
    else{
      setUser(prev => ({...prev, email:data.email}))
      setStep("OTP")
    }
  },[])

  useEffect(()=>{
    if(!resendTimer) return;

    const timer = setTimeout(() => {
      setResendTimer(prev => prev -1)
    }, 1000);

    return () => clearTimeout(timer)
  },[resendTimer])

  useEffect(()=>{
    checkOtpStatus()
  },[])

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
            <form autoComplete="off" onSubmit={onVerifyOTP}>
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
                      onKeyDown={(e)=>{
                        handleOTPKeyDown(e, index)
                      }}
                    />
                  ))
                }
              </div>

              <button disabled={OTPExpired}>Verify OTP</button>

              <button 
                type="button"
                className="resend-otp-btn"
                disabled={resendTimer> 0}
                onClick={handleResendOTP}
              >
                {
                  resendTimer > 0? `Resend OTP in ${resendTimer}s`: "Resend OTP"
                }
              </button>
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