import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCompany } from "../redux/slices/authSlice";
import { getMyCompany } from "../services/companyService";
import { FaSpinner } from "react-icons/fa";

const CompanyGuard = ({ children }) => {
    const { hasCompany, role, company } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();
    const [checking, setChecking] = useState(false);
    const [noCompany, setNoCompany] = useState(false);

    useEffect(() => {
        if (role !== "recruiter") return;

        if (hasCompany === true) {
            setNoCompany(false);
            setChecking(false);
            return;
        }

        const check = async () => {
            setChecking(true);
            try {
                const res = await getMyCompany();
                if (res.data?.success && res.data?.company) {
                    dispatch(setCompany(res.data.company));
                    setNoCompany(false);
                } else {
                    setNoCompany(true);
                }
            } catch {
                setNoCompany(true);
            } finally {
                setChecking(false);
            }
        };
        check();
    }, [hasCompany, role, dispatch]);

    if (role !== "recruiter") {
        return children;
    }

    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FaSpinner className="animate-spin text-3xl text-indigo-400" />
            </div>
        );
    }

    if (noCompany && !company) {
        return <Navigate to="/recruiter/company/register" state={{ from: location }} replace />;
    }

    return children;
};

export default CompanyGuard;
