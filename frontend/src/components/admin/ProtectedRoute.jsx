import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({children, roles}) => {
    const {user, initialized} = useSelector(store=>store.auth);
    if (!initialized) return <div className="p-6 text-center text-sm text-gray-500">Checking your session…</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (!roles?.includes(user.role)) {
        const dashboard = user.role === 'admin' ? '/admin/dashboard' : user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
        return <Navigate to={dashboard} replace />;
    }
    return children;
};
export default ProtectedRoute;
