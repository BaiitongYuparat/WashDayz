import { BrowserRouter, Routes, Route } from "react-router-dom"
import User from "./pages/User"
import Riders from "./pages/Rider"
import Sidebar from "./components/Sidebar"


function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: "20px", flex: 1 }}>
          <Routes>
            <Route path="/user" element={<User />} />
            <Route path="/rider" element={<Riders />} />
          </Routes>
        </div>

      </div>

    </BrowserRouter>

  )
}

export default App