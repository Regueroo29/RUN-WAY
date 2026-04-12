import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Profile.css"; // New styles

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(userData);
      fetchUserData(parsed.user_id);
    }
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      const res = await API.get(`/users/${userId}`);
      setUser(res.data);
      setFormData(res.data);
      setAvatarPreview(res.data.avatar_url);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handlePasswordChange = async () => {
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    alert("New passwords don't match");
    return;
  }
  
  if (passwordData.newPassword.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }
  
  setPasswordLoading(true);
    try {
      await API.put(`/users/${user.user_id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      alert("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.error || "Error changing password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return;
    
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    
    try {
      const res = await API.post(`/users/${user.user_id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // Update local storage and state
      const updatedUser = { ...user, avatar_url: res.data.avatar_url };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAvatarFile(null);
      return res.data.avatar_url;
    } catch (err) {
      console.error("Avatar upload error:", err);
      throw err;
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      // Upload avatar first if changed
      let newAvatarUrl = avatarPreview;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar();
      }
      
      // Update profile
      await API.put(`/users/${user.user_id}/profile`, formData);
      
      const updatedUser = { ...user, ...formData, avatar_url: newAvatarUrl };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.error || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async () => {
    const newRole = user.role === 'designer' ? 'visitor' : 'designer';
    if (window.confirm(`Switch to ${newRole} account? You'll be redirected.`)) {
      try {
        const res = await API.post(`/users/${user.user_id}/switch-role`, { new_role: newRole });
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        navigate(newRole === 'designer' ? '/designer' : '/dashboard');
      } catch (err) {
        console.error("Switch role error:", err);
        alert(err.response?.data?.error || "Error switching role");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="discovery-page profile-full">
      <header className="discovery-header">
        <div className="header-left">
          <h1>MY PROFILE</h1>
        </div>
        <div className="header-right">
          <Link to="/dashboard" className="header-profile">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="avatar-small" />
            ) : (
              user.username?.[0]?.toUpperCase()
            )}
          </Link>
        </div>
      </header>

      <main className="discovery-main profile-main-custom">
        <div className="visitor-profile-new">
          {/* Left Sidebar */}
          <div className="profile-sidebar-card">
            <div className="avatar-section" onClick={editMode ? handleAvatarClick : undefined}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="avatar-large-img" />
              ) : (
                <div className="avatar-placeholder-large">{user.username?.[0]?.toUpperCase()}</div>
              )}
              {editMode && <div className="avatar-overlay">📷 Change</div>}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/*" 
                style={{ display: 'none' }}
              />
            </div>
            
            <h2 className="profile-username">{user.username}</h2>
            <p className="profile-role-badge">{user.role?.toUpperCase()}</p>
            
            <div className="follower-stat">
              <span className="stat-number-large">{user.follower_count || 0}</span>
              <span className="stat-label-small">Followers</span>
            </div>

            
          </div>

          {/* Right Content */}
          <div className="profile-content-card">
            {!editMode ? (
              <div className="profile-view-enhanced">
                <div className="info-section">
                  <h3 className="section-title">Account Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email</label>
                      <p>{user.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Brand Name</label>
                      <p>{user.brand_name || <span className="not-set">Not set</span>}</p>
                    </div>
                    <div className="info-item">
                      <label>Location</label>
                      <p>{user.location || <span className="not-set">Not set</span>}</p>
                    </div>
                    <div className="info-item full-width">
                      <label>Bio</label>
                      <p>{user.bio || <span className="not-set">No bio yet. Tell us about yourself!</span>}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3 className="section-title">Social Links</h3>
                  <div className="social-grid">
                    {user.instagram && (
                      <a href={`https://instagram.com/${user.instagram}`} target="_blank" rel="noreferrer" className="social-link">
                        📷 Instagram
                      </a>
                    )}
                    {user.facebook && (
                      <a href={user.facebook} target="_blank" rel="noreferrer" className="social-link">
                        📘 Facebook
                      </a>
                    )}
                    {user.twitter && (
                      <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noreferrer" className="social-link">
                        🐦 Twitter
                      </a>
                    )}
                    {!user.instagram && !user.facebook && !user.twitter && (
                      <p className="not-set">No social links added yet</p>
                    )}
                  </div>
                </div>

                <button className="btn-edit-enhanced" onClick={() => setEditMode(true)}>
                  ✏️ Edit Profile
                </button>
                <button className="btn-password" onClick={() => setShowPasswordModal(true)} style={{
                  padding: '12px 30px',
                  background: 'rgba(100, 150, 200, 0.2)',
                  border: '1px solid rgba(100, 150, 200, 0.4)',
                  color: 'rgba(100, 200, 255, 1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  letterSpacing: '1px',
                  marginLeft: '15px'
                }}>
                  🔒 Change Password
                </button>
              </div>
            ) : (
              <div className="profile-edit-enhanced">
                <div className="edit-section">
                  <h3 className="section-title">Edit Profile</h3>
                  
                  <div className="form-grid">
                    <div className="form-group-custom">
                      <label>Brand Name</label>
                      <input 
                        value={formData.brand_name || ''} 
                        onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                        placeholder="Your brand or studio name"
                      />
                    </div>
                    
                    <div className="form-group-custom">
                      <label>Location</label>
                      <input 
                        value={formData.location || ''} 
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    </div>
                    
                    <div className="form-group-custom full-width">
                      <label>Bio</label>
                      <textarea 
                        value={formData.bio || ''} 
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Tell us about your fashion journey..."
                        rows="4"
                      />
                    </div>
                    
                    <div className="form-group-custom">
                      <label>Instagram</label>
                      <input 
                        value={formData.instagram || ''} 
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        placeholder="@username"
                      />
                    </div>
                    
                    <div className="form-group-custom">
                      <label>Facebook</label>
                      <input 
                        value={formData.facebook || ''} 
                        onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                        placeholder="facebook.com/yourpage"
                      />
                    </div>
                    
                    <div className="form-group-custom">
                      <label>Twitter</label>
                      <input 
                        value={formData.twitter || ''} 
                        onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>

                <div className="edit-actions-enhanced">
                  <button className="btn-save-enhanced" onClick={handleUpdate} disabled={loading}>
                    {loading ? "Saving..." : "💾 Save Changes"}
                  </button>
                  <button className="btn-cancel-enhanced" onClick={() => {
                    setEditMode(false);
                    setAvatarFile(null);
                    setAvatarPreview(user.avatar_url);
                    setFormData(user);
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <nav className="bottom-nav">
        <Link to="/dashboard" className="nav-item">Discover</Link>
        <Link to="/profile" className="nav-item active">Profile</Link>
        <button onClick={logout} className="nav-item logout">Logout</button>
      </nav>

      {/* Password Change Modal */}
{showPasswordModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  }} onClick={() => setShowPasswordModal(false)}>
    <div style={{
      background: '#2a2a2a',
      border: '1px solid rgba(200, 180, 160, 0.3)',
      borderRadius: '16px',
      padding: '30px',
      width: '100%',
      maxWidth: '400px',
      color: 'white'
    }} onClick={(e) => e.stopPropagation()}>
      <h3 style={{
        margin: '0 0 20px 0',
        color: 'rgba(200, 180, 160, 1)',
        fontWeight: 300,
        letterSpacing: '2px'
      }}>Change Password</h3>
      
      <div style={{marginBottom: '20px'}}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>Current Password</label>
        <input 
          type="password" 
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px'
          }}
        />
      </div>
      
      <div style={{marginBottom: '20px'}}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>New Password</label>
        <input 
          type="password" 
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px'
          }}
        />
      </div>
      
      <div style={{marginBottom: '25px'}}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>Confirm New Password</label>
        <input 
          type="password" 
          value={passwordData.confirmPassword}
          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px'
          }}
        />
      </div>
      
      <div style={{display: 'flex', gap: '15px'}}>
        <button onClick={() => setShowPasswordModal(false)} style={{
          flex: 1,
          padding: '12px',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13px',
          letterSpacing: '1px'
        }}>
          Cancel
        </button>
        <button onClick={handlePasswordChange} disabled={passwordLoading} style={{
          flex: 1,
          padding: '12px',
          background: 'rgba(200, 180, 160, 0.3)',
          border: '1px solid rgba(200, 180, 160, 0.5)',
          color: 'white',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '13px',
          letterSpacing: '1px'
        }}>
          {passwordLoading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Profile;