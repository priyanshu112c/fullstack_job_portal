import { createSlice } from "@reduxjs/toolkit"
const initialState = {
    user: null,
    accessToken: null,
    role: null,
    hasCompany: null,
    company: null,
    onboardingCompleted: false
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.role = action.payload.role || action.payload.user?.role;
            if (action.payload.hasCompany !== undefined) {
                state.hasCompany = action.payload.hasCompany;
            }
            if (action.payload.onboardingCompleted !== undefined) {
                state.onboardingCompleted = action.payload.onboardingCompleted;
            }
        },
        setCompany: (state, action) => {
            state.company = action.payload;
            state.hasCompany = true;
        },
        clearCompany: (state) => {
            state.company = null;
            state.hasCompany = false;
        },
        setOnboardingCompleted: (state, action) => {
            state.onboardingCompleted = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.role = null;
            state.hasCompany = null;
            state.company = null;
            state.onboardingCompleted = false;
        }
    }
})

export const { setCredentials, setCompany, clearCompany, setOnboardingCompleted, logout } = authSlice.actions;

export default authSlice.reducer