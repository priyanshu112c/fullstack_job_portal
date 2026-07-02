import { useDispatch } from "react-redux";
import { refreshToken } from "../services/authService";
import { setCredentials } from "../redux/slices/authSlice";

const useRefreshToken = () => {
    const dispatch = useDispatch();

    const refresh = async () => {
        try {
            const response = await refreshToken();
            const { accessToken, role, user, hasCompany, onboardingCompleted } = response.data;
            dispatch(setCredentials({ user: user || null, accessToken, role, hasCompany, onboardingCompleted }));
            return accessToken;
        } catch {
            return null;
        }
    };

    return refresh;
};

export default useRefreshToken;
