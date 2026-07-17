import {createSlice} from '@reduxjs/toolkit'

const supportSlice = createSlice({
    name:'support',
    initialState:{
        conversationId:null,
        status:null,
        messages:[],
        handledBy:'ai', 
        supportUserId: null
    },
    reducers:{
        setConversationId : (state,action) =>{state.conversationId = action.payload},
        setStatus : (state,action) =>{state.status = action.payload},
        setSupportMessages : (state,action) =>{state.messages = action.payload},
        addSupportMessage : (state,action) =>{state.messages = [...state.messages,action.payload]},
        setHandledBy : (state,action) =>{state.handledBy = action.payload},
        setSupportUserId : (state,action) =>{state.supportUserId = action.payload},
        resetSupport: (state) =>{
            state.conversationId = null
            state.status = null
            state.messages = []
            state.handledBy = 'ai'
            state.supportUserId = null
        }
    }
})

export const {
    setConversationId, setStatus, setHandledBy, setSupportMessages, addSupportMessage, resetSupport, setSupportUserId
} = supportSlice.actions

export default supportSlice.reducer