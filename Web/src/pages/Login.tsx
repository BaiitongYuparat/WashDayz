import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi"; 
import { CustomButton } from "../components/Button";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
    if (!email || !password) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    try {
        setLoading(true);

        const res = await login(email, password);

        // ถ้าไม่ใช่ admin ไม่ให้เข้า
        if (res.user.role !== "ADMIN") {
            alert("คุณไม่ใช่แอดมิน");
            return;
        }

        // ถ้าเป็น admin เก็บtoken
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        navigate("/user");

    } catch (error: any) {
        console.error("Login error:", error);
        alert(error.response?.data?.message || "Login failed");
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">

                <h1 className="text-3xl font-bold mb-6 text-center">
                    WashDayZ Admin
                </h1>

                
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 mb-4 border rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-6 border rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                
                <CustomButton
                    title={loading ? "Loading..." : "Login"}
                    onPress={handleLogin}
                    
                />

            </div>
        </div>
    );
}

export default Login;