import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await API.post("/login", { email, password });
      const userData = res.data;
      
      // Check if account is suspended
      if (userData.status === 'suspended') {
        if (userData.suspension_end_date && new Date(userData.suspension_end_date) < new Date()) {
          userData.status = 'active';
        } else {
          const endDate = userData.suspension_end_date 
            ? new Date(userData.suspension_end_date).toLocaleDateString()
            : 'permanently';
          setError(`Account suspended until ${endDate}. Reason: ${userData.suspension_reason}`);
          setLoading(false);
          return;
        }
      }
      
      // SAVE USER WITH TOKEN - Fixed this line
      localStorage.setItem("user", JSON.stringify({
        ...userData,
        token: userData.token  // This saves the JWT token
      }));

      // Check for notifications
      try {
        const notifRes = await API.get(`/admin/notifications/${userData.user_id}`);
        if (notifRes.data.length > 0) {
          notifRes.data.forEach(notif => {
            alert(`📢 ${notif.message}`);
            API.post(`/admin/notifications/${notif.notification_id}/read`);
          });
        }
      } catch (err) {
        console.log("No new notifications");
      }

      // Redirect based on role
      if (userData.role === 'admin') {
        navigate("/admin");
      } else if (userData.role === 'designer') {
        navigate("/designer"); // or "/designer/:id"
      } else {
        navigate("/dashboard"); // visitors go straight to discovery
      }
    } catch (err) {
      // More robust error extraction
      let msg = "Invalid email or password";
      
      if (err.response) {
        // Backend sent a response with error
        msg = err.response.data?.error || err.response.data?.message || msg;
        
        // Specific handling for suspension to show the date nicely
        if (err.response.status === 403 && err.response.data?.reason) {
          const until = err.response.data?.until 
            ? new Date(err.response.data.until).toLocaleDateString() 
            : 'permanently';
          msg = `Account suspended until ${until}. Reason: ${err.response.data.reason}`;
        }
      } else if (err.request) {
        msg = "Cannot connect to server. Please try again.";
      }
      
      setError(msg);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="auth-split-page">
      <div className="split-image-side">
        <div className="split-image-circle">
          <img src="/login.jpg" alt="Fashion" />
        </div>
        {/* ✅ VERTICAL TEXT AROUND CIRCLE */}
        <div className="vertical-text top">L</div> {/* needs to be top */}
        <div className="vertical-text top-right">O</div> {/* needs to be top right */}
        <div className="vertical-text right">G</div> {/* needs to be right */}
        <div className="vertical-text bottom-right">I</div> {/* needs to be bottom right */}
        <div className="vertical-text bottom">N</div> {/* needs to be bottom */}
        
        <div className="split-brand-vertical">RUN-WAY</div>
      </div>

      <div className="split-form-side">
        <div className="auth-boxes top-right">
          <Link to="/login" className="auth-box active">
            <span>Login</span>
          </Link>
          <Link to="/register" className="auth-box">
            <span>Register</span>
          </Link>
        </div>

        <div className="split-form-container">
          <h2>LOG IN</h2>
          
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>USERNAME</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <a href="#" className="forgot-link">FORGET YOUR PASSWORD?</a>

          <button 
            onClick={handleSubmit} 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "LOADING..." : "SUBMIT"}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <a href="#" className="social-icon">f</a>
            <a href="#" className="social-icon">📷</a>
            <a href="#" className="social-icon">G</a>
          </div>
        </div>

        <Link to="/" className="back-link">BACK</Link>
      </div>
    </div>
  );
}

export default Login;