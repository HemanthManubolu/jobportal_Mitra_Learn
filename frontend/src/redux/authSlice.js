import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null,
        initialized:false
    },
    reducers:{
        // actions
        setLoading:(state, action) => {
            state.loading = action.payload;
        },
        setUser:(state, action) => {
            state.user = action.payload;
        },
        setAuthInitialized:(state, action) => {
            state.initialized = action.payload;
        },
        clearAuth:(state) => {
            state.loading = false;
            state.user = null;
            state.initialized = true;
        }
    }
});
export const {setLoading, setUser, setAuthInitialized, clearAuth} = authSlice.actions;
export default authSlice.reducer;
