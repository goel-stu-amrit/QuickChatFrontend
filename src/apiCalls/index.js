import axios from "axios"

export const url = process.env.BACKEND_URL

export const axiosInstance  = axios.create({
    headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
    }
})
