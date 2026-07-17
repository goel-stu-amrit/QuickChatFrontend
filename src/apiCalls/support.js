import { axiosInstance, url} from "./index";

export const startSupportChat = async () =>{
    try{
        const response = await axiosInstance.post(url + '/api/support/start')
        return response.data
    }catch(error){
        return error
    }
}

export const sendSupportMessage = async (conversationId, message) =>{
    try{
        const response = await axiosInstance.post(url + '/api/support/message', {conversationId, message})
        return response.data
    }catch(error){
        return error
    }
}

export const getSupportMessages = async (conversationId) =>{
    try{
        const response = await axiosInstance.get(url + `/api/support/get-all-messages/${conversationId}`)
        return response.data
    }catch(error){
        return error
    }
}

export const resolveConversation = async (conversationId) =>{
    try{
        const response = await axiosInstance.post(url + '/api/support/resolve', {conversationId})
        return response.data
    }catch(error){
        return error
    }
}

export const getWaiting = async () =>{
    try{
        const response = await axiosInstance.get(url + '/api/agent/waiting')
        return response.data
    }
    catch(error){
        return error
    }
}

export const getMyTickets = async () =>{
    try{
        const response = await axiosInstance.get(url + '/api/agent/my-tickets')
        return response.data
    }
    catch(error){
        return error
    }
}

export const assignTicket = async (conversationId) =>{
    try{
        const response = await axiosInstance.post(url + '/api/agent/assign', {conversationId})
        return response.data
    }
    catch(error){
        return error
    }
}

export const promoteUser = async (userId) =>{
    try{
        const response = await axiosInstance.post(url + '/api/admin/promote', {userId})
        return response.data
    }
    catch(error){
        return error
    }
}
