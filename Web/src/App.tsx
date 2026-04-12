import { BrowserRouter, Routes, Route } from "react-router-dom";
import User from "./pages/User";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Orders from "./pages/Order";
import Services from "./pages/Service";
import Branch from "./pages/Branch";
import ProtectedRoute from "./components/ProtectedRoute";
import TopBar from "./components/TopBar";
import Payments from "./pages/Payment";

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
                <div className="flex-1 flex flex-col">
                  <TopBar />
                  <div className="p-5">
                    <Routes>
                      <Route path="/order" element={<Orders />} />
                      <Route path="/user" element={<User />} />
                      <Route path="/service" element={<Services />} />
                      <Route path="/branch" element={<Branch />} />
                      <Route path="/payment" element={<Payments />} />
                    </Routes>
                  </div>
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