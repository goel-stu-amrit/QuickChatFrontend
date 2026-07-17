import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from './loaderSlice'
import userReducer from './usersSlice'
import supportReducer from './supportSlice'

const store = configureStore({
    reducer : {loaderReducer, userReducer, supportReducer}
})

export default store