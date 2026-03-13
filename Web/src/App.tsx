import { BrowserRouter, Routes, Route } from "react-router-dom"
import User from "./pages/User"
import Rider from "./pages/Rider"
import Sidebar from "./components/Sidebar"


function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ padding: "20px", flex: 1 }}>
          <Routes>
            <Route path="/user" element={<User />} />
          </Routes>
          <Routes>
            <Route path="/rider" element={<Rider />} />
          </Routes>
        </div>

      </div>

    </BrowserRouter>

  )
}

export default App