import api from "../api/axios";

export const createProfile = (data) => api.post("/profile", data);

export const getMyProfile = () => api.get("/profile/me");

export const updateProfile = (data) => api.put("/profile/me", data);
