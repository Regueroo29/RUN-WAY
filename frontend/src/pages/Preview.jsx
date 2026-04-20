import { Link } from "react-router-dom";

function Preview() {
  return (
    <div className="preview-page">
      <div className="preview-overlay">
        <nav className="preview-nav">
          <Link to="/" className="back-link">← Back</Link>
          <div className="preview-actions">
            <Link to="/login" className="auth-box">Login</Link>
            <Link to="/register" className="auth-box">Register</Link>
          </div>
        </nav>

        <div className="preview-content">
          <div className="preview-text">
            <h1>EXPERIENCE THE FUTURE OF FASHION</h1>
            <p className="preview-subtitle">
              Join the elite community of designers and fashion enthusiasts. 
              Showcase your creations, discover trending designs, and connect 
              with the world's most innovative fashion minds.
            </p>
            
            <div className="preview-features">
              <div className="feature">
                <div className="feature-icon">👗</div>
                <h3>SHOWCASE DESIGNS</h3>
                <p>Upload your portfolio and reach global audiences</p>
              </div>
              <div className="feature">
                <div className="feature-icon">❤️</div>
                <h3>CURATE COLLECTIONS</h3>
                <p>Save and organize your favorite pieces</p>
              </div>
              <div className="feature">
                <div className="feature-icon">📊</div>
                <h3>TRACK PERFORMANCE</h3>
                <p>Analytics and insights for designers</p>
              </div>
            </div>

            <Link to="/register" className="preview-cta">
              Get Started Now
            </Link>
          </div>

          {/* ✅ FIXED: Image moved to side, not overlapping */}
          <div className="preview-showcase">
            <img src="/registerimage.jpg" alt="Fashion Preview" />
            <div className="showcase-text">
              <span>Aphronique</span>
              <span>2026 COLLECTION</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preview;