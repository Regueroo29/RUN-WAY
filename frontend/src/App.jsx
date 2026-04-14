{/* This is the main application component that sets up routing for different pages in the application. It uses React Router to define routes for Home, Preview, Login, Register, Path, Designer, DesignerProfile, Dashboard, Profile, and Admin pages. Each route is associated with a specific component that will be rendered when the route is accessed. */}
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

{/* Routes for different pages in the application */}

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
        <Route path="/designer" element={<Designer />} /> 
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/profile" element={<Profile />} />  
        <Route path="/admin" element={<Admin />} />  
      </Routes>
    </Router>
  );
}

{/* Exporting the App component as the default export of this module. This allows other parts of the application to import and use the App component. */}
export default App;