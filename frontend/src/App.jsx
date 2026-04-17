import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Preview from "./pages/Preview";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import Path from "./pages/Path"; // REMOVE or comment out - no longer needed
import Designer from "./pages/Designer";
import DesignerProfile from "./pages/DesignerProfile";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile"; 
import Admin from "./pages/Admin";  

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/path" element={<Path />} /> REMOVE - no longer needed */}
        <Route path="/designer/:id" element={<DesignerProfile />} />
        <Route path="/designer" element={<Designer />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/admin" element={<Admin />} /> 
      </Routes>
    </Router>
  );
}

export default App;