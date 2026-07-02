import api from "../api/axios"

export const registerCompany = (formData) => {
    return api.post("/companies/register", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
}

export const getMyCompany = () => {
    return api.get("/companies/me")
}

export const updateCompany = (formData) => {
    return api.put("/companies/me", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
}

export const deleteCompany = () => {
    return api.delete("/companies/me")
}
