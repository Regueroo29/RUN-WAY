import { Link } from "react-router-dom";

function Path() {
  // This page is now just informational, not for role selection
  return (
    <div className="path-page blue-theme">
      <div className="path-overlay">
        <h1 className="path-title">WELCOME TO Aphronique</h1>
        <p style={{ marginBottom: '40px', color: 'rgba(255,255,255,0.8)' }}>
          Your account type has been set during registration
        </p>
        
        <div className="path-choices">
          <div className="path-card designer" style={{ opacity: 0.6 }}>
            <div className="path-image">
              <img src="/Pathdesigner.jpg" alt="Designer" />
            </div>
            <span className="path-label">DESIGNERS SHARE</span>
          </div>

          <div className="path-card visitor" style={{ opacity: 0.6 }}>
            <div className="path-image">
              <img src="/Pathvisitor.jpg" alt="Visitor" />
            </div>
            <span className="path-label">VISITORS EXPLORE</span>
          </div>
        </div>

        <Link to="/dashboard" className="back-link light">GO TO DASHBOARD</Link>
      </div>
    </div>
  );
}

export default Path;