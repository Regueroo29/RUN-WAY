import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState({ day: "", month: "", year: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Generate DOB options
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const months = useMemo(() => [
    { value: "01", label: "January" }, { value: "02", label: "February" },
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" }
  ], []);
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - 1940 + 1 }, (_, i) => current - i);
  }, []);

  // Password requirements checker
  const passChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }, [password]);

  const allPassValid = Object.values(passChecks).every(Boolean);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword || !role || !gender) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!allPassValid) {
      setError("Password does not meet all requirements");
      return;
    }

    setLoading(true);
    setError("");

    const date_of_birth = dob.year && dob.month && dob.day 
      ? `${dob.year}-${dob.month}-${String(dob.day).padStart(2, '0')}` 
      : null;

    try {
        await API.post("/register", { 
          username: `${firstName} ${lastName}`,  // <-- ADD THIS
          first_name: firstName,
          last_name: lastName,
          email, 
          password, 
          role,
          gender,
          date_of_birth
        });
      
      alert(`Registration successful! Welcome as a ${role}. Please login.`);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
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

        <div className="split-form-container register-enhanced">
          <h2 style={{ marginBottom: '16px', lineHeight: 1.1 }}>
            ACCOUNT<br />SIGN UP
          </h2>
          
          {error && <div className="error-message">{error}</div>}

          <div className="social-login top">
            <a href="#" className="social-icon">📷</a>
            <a href="#" className="social-icon">f</a>
            <a href="#" className="social-icon">G</a>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          {/* Name Row */}
          <div className="name-row">
            <div className="form-group compact">
              <label>FIRST NAME</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="First name"
              />
            </div>
            <div className="form-group compact">
              <label>SURNAME</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Surname"
              />
            </div>
          </div>

          <div className="form-group compact">
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group compact">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Min. 8 chars, A-Z, number, symbol"
            />
            {/* Real-time password requirements */}
            <div className="password-requirements">
              <span className={passChecks.length ? 'valid' : ''}>
                {passChecks.length ? '✓' : '○'} 8+ chars
              </span>
              <span className={passChecks.upper ? 'valid' : ''}>
                {passChecks.upper ? '✓' : '○'} Uppercase
              </span>
              <span className={passChecks.number ? 'valid' : ''}>
                {passChecks.number ? '✓' : '○'} Number
              </span>
              <span className={passChecks.special ? 'valid' : ''}>
                {passChecks.special ? '✓' : '○'} Special char
              </span>
            </div>
          </div>

          <div className="form-group compact">
            <label>CONFIRM PASSWORD</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Confirm password"
            />
          </div>

          {/* Date of Birth */}
          <div className="form-group compact">
            <label>DATE OF BIRTH</label>
            <div className="dob-row">
              <select 
                value={dob.day} 
                onChange={(e) => setDob({...dob, day: e.target.value})}
                className={dob.day ? 'selected' : ''}
              >
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select 
                value={dob.month} 
                onChange={(e) => setDob({...dob, month: e.target.value})}
                className={dob.month ? 'selected' : ''}
              >
                <option value="">Month</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select 
                value={dob.year} 
                onChange={(e) => setDob({...dob, year: e.target.value})}
                className={dob.year ? 'selected' : ''}
              >
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Gender */}
          <div className="form-group compact">
            <label>GENDER</label>
            <select 
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
              className={gender ? 'selected' : ''}
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Role Selection */}
          <div className="form-group compact role-selection">
            <label>I WANT TO JOIN AS</label>
            <div className="role-options">
              <button
                type="button"
                className={`role-btn ${role === 'designer' ? 'active' : ''}`}
                onClick={() => setRole('designer')}
              >
                <span className="role-icon">✏️</span>
                <span className="role-text">DESIGNER</span>
                <small>Share your fashion designs</small>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'visitor' ? 'active' : ''}`}
                onClick={() => setRole('visitor')}
              >
                <span className="role-icon">👁️</span>
                <span className="role-text">VISITOR</span>
                <small>Discover & explore fashion</small>
              </button>
            </div>
          </div>

          <div className="form-actions register-actions">
            <button 
              onClick={handleRegister} 
              className="submit-btn outline"
              disabled={loading}
            >
              {loading ? "CREATING..." : "CREATE ACCOUNT"}
            </button>
            <Link to="/login" className="alt-link">ALREADY HAVE AN ACCOUNT?</Link>
          </div>
        </div>

        <Link to="/" className="back-link">BACK</Link>
      </div>

      <div className="split-image-side right">
        <div className="split-image-circle right">
          <img src="/registerimg.jpg" alt="Fashion" />
        </div>
      </div>
    </div>
  );
}

export default Register;