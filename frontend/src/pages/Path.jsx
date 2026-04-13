import { Link } from "react-router-dom";

function Path() {
  return (
    <div className="path-page blue-theme">
      <div className="path-overlay">
        <h1 className="path-title">ARE YOU PERHAPS A</h1>
        
        <div className="path-choices">
          <Link to="/designer" className="path-card designer">
            <div className="path-image">
              <img src="/RunWayIcon.jpg" alt="Designer" />
            </div>
            <span className="path-label">DESIGNER</span>
          </Link>

          <Link to="/dashboard" className="path-card visitor">
            <div className="path-image">
              <img src="/RunWayIcon.jpg" alt="Visitor" />
            </div>
            <span className="path-label">VISITOR</span>
          </Link>
        </div>

        <Link to="/" className="back-link light">BACK TO HOME</Link>
      </div>
    </div>
  );
}

export default Path;