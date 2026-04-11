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
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-[420px]">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            WashDayZ
          </h1>
          <p className="text-gray-500 mt-2">
            Admin Dashboard
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
        <CustomButton
          title={loading ? "Logging in..." : "Login"}
          onPress={handleLogin}
        />

        <p className="text-center text-gray-400 text-sm mt-6">
          WashDayZ System © 2026
        </p>

      </div>
    </div>
  );
}


export default Login;