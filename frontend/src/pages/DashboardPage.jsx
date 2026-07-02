import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const DashboardPage = () => {
    const { role } = useSelector((state) => state.auth);

    if (role === "admin") {
        return <Navigate to="/admin" replace />;
    } else if (role === "recruiter") {
        return <Navigate to="/recruiter" replace />;
    } else {
        return <Navigate to="/dashboard/job-seeker" replace />;
    }
};

export default DashboardPage;