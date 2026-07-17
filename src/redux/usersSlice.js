import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
    name: "user",
    initialState : {
        user:null,
        allUsers:[],
        allChats:[],
        selectedChat : null,
        role:null,
        currentChatType:'normal'
    },
    reducers:{
        setUser : (state, action) => {state.user = action.payload},
        setAllUsers : (state, action) => {state.allUsers = action.payload},
        setAllChats: (state, action) => {state.allChats = action.payload},
        setSelectedChat : (state, action) => {state.selectedChat = action.payload},
        setCurrentChatType : (state, action) =>{state.currentChatType = action.payload}

    }
})

export const {setUser, setAllUsers, setAllChats, setSelectedChat, setCurrentChatType} = usersSlice.actions
export default usersSlice.reducer