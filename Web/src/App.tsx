import { BrowserRouter, Routes, Route } from "react-router-dom"
import User from "./pages/User"
import Riders from "./pages/Rider"
import Sidebar from "./components/Sidebar"
// import Service from "./pages/Service"


function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <div className="p-5 flex-1">
          <Routes>
            {/* <Route path="/service" element={<Service />} /> */}
            <Route path="/user" element={<User />} />
            <Route path="/rider" element={<Riders />} />
          
          </Routes>
        </div>

      </div>

    </BrowserRouter>

  )
}

export default App