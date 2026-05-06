import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Lazy load all pages — only load when user navigates to them
const Home = React.lazy(() => import('./pages/Home.jsx'));
const Login = React.lazy(() => import('./pages/Login.jsx'));
const Register = React.lazy(() => import('./pages/Register.jsx'));
const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'));
const Designer = React.lazy(() => import('./pages/Designer.jsx'));
const DesignerProfile = React.lazy(() => import('./pages/DesignerProfile.jsx'));
const Profile = React.lazy(() => import('./pages/Profile.jsx'));
const Admin = React.lazy(() => import('./pages/Admin.jsx'));
const Path = React.lazy(() => import('./pages/Path.jsx'));
const Preview = React.lazy(() => import('./pages/Preview.jsx'));

// Loading fallback component
const PageLoader = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
    }}>
        <div>Loading...</div>
    </div>
);

function App() {
    return (
        <div className="app">
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/designer" element={<Designer />} />
                    <Route path="/designer/:id" element={<DesignerProfile />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/path" element={<Path />} />
                    <Route path="/preview" element={<Preview />} />
                </Routes>
            </Suspense>
        </div>
    );
}

export default App;