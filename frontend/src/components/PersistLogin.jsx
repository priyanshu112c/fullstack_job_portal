import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useRefreshToken from "../hooks/useRefreshToken";
import { FaSpinner } from "react-icons/fa";

const PersistLogin = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const refresh = useRefreshToken();
    const { accessToken } = useSelector((state) => state.auth);

    useEffect(() => {
        const verify = async () => {
            try {
                if (!accessToken) {
                    await refresh();
                }
            } catch {
            } finally {
                setLoading(false);
            }
        };

        if (!accessToken) {
            verify();
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <FaSpinner className="animate-spin text-3xl text-indigo-400" />
            </div>
        );
    }

    return children;
};

export default PersistLogin;