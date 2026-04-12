import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/register", { username, email, password });
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  return (
    <div className="auth-split-page register-variant">
      <div className="split-form-side left">
        <div className="auth-boxes top-left">
          <Link to="/login" className="auth-box">
            <span>Login</span>
          </Link>
          <Link to="/register" className="auth-box active">
            <span>Register</span>
          </Link>
        </div>

        <div className="split-form-container">
          <h2>ACCOUNT<br/>SIGN UP</h2>
          
          {error && <div className="error-message">{error}</div>}

          <div className="social-login top">
            <a href="#" className="social-icon">📷</a>
            <a href="#" className="social-icon">f</a>
            <a href="#" className="social-icon">G</a>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="form-group compact">
            <label>FULL NAME</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <div className="form-group compact">
            <label>EMAIL</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-group compact">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-group compact">
            <label>CONFIRM PASSWORD</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-actions">
            <button 
              onClick={handleRegister} 
              className="submit-btn outline"
              disabled={loading}
            >
              {loading ? "..." : "SUBMIT"}
            </button>
            <Link to="/login" className="alt-link">ALREADY HAVE AN ACCOUNT?</Link>
          </div>
        </div>

        <Link to="/" className="back-link">BACK</Link>
      </div>

      <div className="split-image-side right">
        <div className="split-image-circle right">
          <img src="/register.jpg" alt="Fashion" />
        </div>
      </div>
    </div>
  );
}

export default Register;