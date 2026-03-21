//เช็คว่าใช่แอดมินไหม

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: any) => { 
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/" />; 
    }

    return children;
};

export default ProtectedRoute;