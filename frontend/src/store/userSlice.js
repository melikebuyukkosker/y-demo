import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        token: null,
        isAuthenticated: false,
    },
    reducers: {
        setUser(state, action) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        clearUser(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
