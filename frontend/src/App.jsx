import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Preview from "./pages/Preview";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Path from "./pages/Path";
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
        <Route path="/path" element={<Path />} />
        <Route path="/designer/:id" element={<DesignerProfile />} />
        <Route path="/designer" element={<Designer />} /> {/* ✅ Added: Designer route for designer dashboard | needs some few fixes */ }
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/profile" element={<Profile />} />  {/* ✅ Added: Profile route for user profile page | needs some few fixes */ }
        <Route path="/admin" element={<Admin />} />  {/* ✅ Added: Admin route for admin dashboard | admin - admin123 / cant be used error needs to be fixed*/ }
      </Routes>
    </Router>
  );
}

export default App;