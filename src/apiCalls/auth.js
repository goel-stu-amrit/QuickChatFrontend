import { axiosInstance, url} from "./index";

export const signupUser = async (user) =>{
    try{
        const response = await axiosInstance.post(url + '/api/auth/signup', user)
        return response.data
    }
    catch(error){
        return error;
    }
}

export const loginUser = async (user) =>{
    try{
        const response = await axiosInstance.post(url + '/api/auth/login', user)
        return response.data;
    }catch(error){
        return error
    }
}

export const verifyEmail = async (user) =>{
    try{
        const response = await axiosInstance.post(url + '/api/auth/verify-email', user)
        return response.data
    }catch(error){
        return error
    }
}

export const resendOTP = async (email) =>{
    try {
        const response = await axiosInstance.post( url + '/api/auth/resend-otp', { email :email })
        return response.data
    }catch(error){
        return error
    }
}

export const checkOTPStatus = async (email) =>{
    try{
        const response = await axiosInstance.post( url+ '/api/auth/check-otp-status', {email:email})
        return response.data
    }catch(error){
        return error
    }
}