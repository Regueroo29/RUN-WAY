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
        <Route path="/" element={<Home />} /> {/* Good already if neede will enhance */}
        <Route path="/preview" element={<Preview />} /> {/* no need to modify unless needed */}
        <Route path="/login" element={<Login />} /> {/* needed to enhance both the ui and the image placement also the text LOGIN */}
        <Route path="/register" element={<Register />} /> {/* register is already good with properly functioning form validation but could enhance the ui design */}
        <Route path="/path" element={<Path />} /> {/* path is already good but could use some enhancements */}
        <Route path="/designer/:id" element={<DesignerProfile />} /> {/* designer profile is already good and has few examples to fully test it out */}
        <Route path="/designer" element={<Designer />} /> {/* designer has alot of problems needed to be fixed like the upload, the design, the placement of the edit and the upload, the ui of the profile when clicking the update profile button */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* the dashboard needs some adjusting like the for you is only aplicable when the post is 1 week old and when it surpasses the 1week old it is nowhere to be found in the for you section also could add some spice to it */}
        <Route path="/profile" element={<Profile />} />  {/* the profile is already good with functioning features will take note for the future updates when needed */}
        <Route path="/admin" element={<Admin />} />  {/* admin has alot of problems needed to be fixed but the functionalities are there but some are not properly implemented, some are not in the right place when it is needed */}
      </Routes>
    </Router>
  );
}

{/* Exporting the App component as the default export of this module. This allows other parts of the application to import and use the App component. */}
export default App;