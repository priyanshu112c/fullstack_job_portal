import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleRoute = ({ children, allowedRoles }) => {
    const { role } = useSelector((state) => state.auth);

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default RoleRoute;