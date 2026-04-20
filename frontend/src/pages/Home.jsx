import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <div className="home-overlay">
        {/* TOP RIGHT AUTH BOXES */}
        <div className="auth-boxes">
          <Link to="/login" className="auth-box">
            <span>Login</span>
          </Link>
          <Link to="/register" className="auth-box">
            <span>Register</span>
          </Link>
        </div>

        {/* CENTER CONTENT */}
        <div className="home-content">
          <h1>Aphronique</h1>
          <div className="home-accent"></div>
          <p>Haute Couture Fashion House</p>
          {/* ✅ Changed: Now goes to Preview page */}
          <Link to="/preview" className="home-cta">Enter the Experience</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;