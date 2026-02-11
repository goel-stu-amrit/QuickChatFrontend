import axios from "axios"

export const url = process.env.REACT_APP_BACKEND_URL

export const axiosInstance  = axios.create({
    headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
    }
})
