import { createSlice } from "@reduxjs/toolkit";
// import { ACCESS_TOKEN } from "../../../constants";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        accessToken : undefined,
    },
    reducers: {
        addAccessToken: (state , action) => {
            state.accessToken = action.payload
        },
        removeAccessToken: (state) => {
            state.accessToken = null
        }
    }
})

export const { addAccessToken , removeAccessToken } = authSlice.actions

export default authSlice.reducer