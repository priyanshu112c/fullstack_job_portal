import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProfileGuard = ({ children }) => {
    const { role, onboardingCompleted } = useSelector((state) => state.auth);
    const location = useLocation();

    if (role === "job_seeker" && !onboardingCompleted) {
        return <Navigate to="/onboarding" state={{ from: location }} replace />;
    }

    return children;
};

export default ProfileGuard;
