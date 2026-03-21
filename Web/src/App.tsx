import { BrowserRouter, Routes, Route } from "react-router-dom";
import User from "./pages/User";
import Riders from "./pages/Rider";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Orders from "./pages/Order";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

       
        <Route path="/login" element={<Login />} />

        
        <Route
          path="/*"
          element={
            <ProtectedRoute role="ADMIN">
              <div className="flex">
                <Sidebar />
                <div className="p-5 flex-1">
                  <Routes>
                    <Route path="/order" element={<Orders />} />
                    <Route path="/user" element={<User />} />
                    <Route path="/rider" element={<Riders />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;