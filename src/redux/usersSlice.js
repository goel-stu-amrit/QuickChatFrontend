import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
    name: "user",
    initialState : {
        user:null,
        allUsers:[],
        allChats:[],
    },
    reducers:{
        setUser : (state, action) => {state.user = action.payload},
        setAllUsers : (state, action) => {state.allUsers = action.payload},
        setAllChats: (state, action) => {state.allChats = action.payload},
    }
})

export const {setUser, setAllUsers, setAllChats} = usersSlice.actions
export default usersSlice.reducer