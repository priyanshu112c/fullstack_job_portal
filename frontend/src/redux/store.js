import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice";
import { injectStore } from "../api/axios";

const AUTH_PERSIST_KEY = "auth_state"

const loadAuthState = () => {
    try {
        const saved = localStorage.getItem(AUTH_PERSIST_KEY)
        if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.accessToken) {
                return { auth: parsed }
            }
        }
    } catch { }
    return undefined
}

const preloadedState = loadAuthState()

export const store = configureStore({
    reducer: {
        auth: authReducer
    },
    preloadedState
})

store.subscribe(() => {
    try {
        const state = store.getState().auth
        const toPersist = {
            user: state.user,
            accessToken: state.accessToken,
            role: state.role,
            hasCompany: state.hasCompany,
            company: state.company
        }
        if (toPersist.accessToken) {
            localStorage.setItem(AUTH_PERSIST_KEY, JSON.stringify(toPersist))
        } else {
            localStorage.removeItem(AUTH_PERSIST_KEY)
        }
    } catch { }
})

injectStore(store);
