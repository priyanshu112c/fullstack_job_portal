import api from "../api/axios"

export const loginUser = (data) => {
    return api.post("/auth/login", data)

}

export const registerUser = (data) => {
    return api.post("/auth/register", data)
}

export const refreshToken = () => {
    return api.post('/auth/refresh-token')
}

export const logoutUser = () => {
    return api.post('/auth/logout')
}
