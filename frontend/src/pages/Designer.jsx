import { useState, useEffect, useRef, useMemo } from "react"; {/* THESE CODES AT THE TOP ARE THE ONES THAT ARE IMPORTING THE LIBRARIES THAT TYPE SHI JAHAHAH */}
import { useNavigate, Link } from "react-router-dom";
import { useSocket } from '../context/SocketContext';
import API from "../services/api";

function Designer() {
  const socket = useSocket();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("gallery");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [editingDesign, setEditingDesign] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // SEPARATE states for upload and edit
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    season: "Spring 2026",
    image: null,
    imagePreview: "/RunWayIcon.jpg"
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    season: "Spring 2026",
    image: null,
    imagePreview: "/RunWayIcon.jpg"
  });

  // Profile edit
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setProfileForm(parsed);
      setAvatarPreview(parsed.avatar_url);
      fetchDesigns(parsed.user_id);
    }
  }, [navigate]);

  useEffect(() => {
    if (user?.user_id) {
      fetchFreshUserData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('design_uploaded', (data) => {
      // If it's not our own design, we could show a notification
      if (data.designer_id !== user?.user_id) {
        console.log('New design uploaded by:', data.designer_name);
      }
    });
    
    return () => socket.off('design_uploaded');
  }, [socket, user]);

  const fetchFreshUserData = async () => {
    try {
      const res = await API.get(`/users/${user.user_id}`);
      const freshData = res.data;
      setUser(prev => ({ ...prev, ...freshData }));
      localStorage.setItem("user", JSON.stringify({ ...user, ...freshData }));
      setProfileForm(freshData);
      setAvatarPreview(freshData.avatar_url);
    } catch (err) {
      console.error("Error fetching fresh user data:", err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("design_uploaded", (data) => {
      if (data.designer_id !== user?.user_id) {
        console.log("New design uploaded by:", data.designer_name);
      }
    });

    socket.on("design_liked", (data) => {
      setDesigns((prev) =>
        prev.map((d) =>
          d.design_id === data.design_id
            ? { ...d, like_count: data.like_count }
            : d
        )
      );
    });

    socket.on("design_rated", (data) => {
      setDesigns((prev) =>
        prev.map((d) =>
          d.design_id === data.design_id
            ? {
                ...d,
                avg_rating: data.avg_rating,
                rating_count: data.rating_count,
              }
            : d
        )
      );
    });

    socket.on("design_deleted", (data) => {
      if (data.designer_id === user?.user_id) {
        setDesigns((prev) =>
          prev.filter((d) => d.design_id !== data.design_id)
        );
      }
    });

    socket.on("account_suspended", (data) => {
      alert(`Account suspended!\n${data.message}`);
      localStorage.removeItem("user");
      navigate("/login");
    });

    return () => {
      socket.off("design_uploaded");
      socket.off("design_liked");
      socket.off("design_rated");
      socket.off("design_deleted");
      socket.off("account_suspended");
    };
  }, [socket, user, navigate]);

  useEffect(() => {
    console.log("Designs loaded:", designs.length);
    console.log("Active tab:", activeTab);
    console.log("User:", user);
  }, [designs, activeTab, user]);

  const fetchDesigns = async (userId) => {
    try {
      const res = await API.get(`/designs/designer/${userId}`);
      setDesigns(res.data);
    } catch (err) {
      console.error("Error fetching designs:", err);
    }
  };

  // RESET upload form when entering upload tab
  const resetUploadForm = () => {
    setUploadForm({
      title: "",
      description: "",
      season: "Spring 2026",
      image: null,
      imagePreview: "/RunWayIcon.jpg"
    });
  };

  // Handle tab changes with reset
  const handleTabChange = (tab) => {
    if (tab === "upload") {
      resetUploadForm(); // Clear upload form when entering upload
    }
    setActiveTab(tab);
  };

  const handleImageSelect = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditForm({
          ...editForm,
          image: file,
          imagePreview: URL.createObjectURL(file)
        });
      } else {
        setUploadForm({
          ...uploadForm,
          image: file,
          imagePreview: URL.createObjectURL(file)
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.image) {
      alert("Please add a title and select an image");
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", uploadForm.image);
      formData.append("designer_id", user.user_id);
      formData.append("title", uploadForm.title);
      formData.append("description", uploadForm.description);
      formData.append("season", uploadForm.season);
      
      const res = await API.post("/designs", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // Emit real-time event to all clients
      if (socket) {
        socket.emit('new_design', {
          design_id: res.data.design_id,
          designer_id: user.user_id,
          designer_name: user.username,
          title: uploadForm.title,
          image_url: res.data.image_url,
          season: uploadForm.season,
          created_at: new Date().toISOString()
        });
      }
      
      // Optimistic UI update - add to gallery immediately
      const newDesign = {
        design_id: res.data.design_id,
        title: uploadForm.title,
        description: uploadForm.description,
        season: uploadForm.season,
        image_url: res.data.image_url,
        like_count: 0,
        avg_rating: 0,
        rating_count: 0,
        created_at: new Date().toISOString()
      };
      
      setDesigns(prev => [newDesign, ...prev]);
      
      setActiveTab("gallery");
      resetUploadForm();
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.response?.data?.error || "Error uploading design");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (design) => {
    setEditingDesign(design);
    setEditForm({
      title: design.title,
      description: design.description || "",
      season: design.season || "Spring 2026",
      image: null, // No new image selected yet
      imagePreview: design.image_url ? 
        (design.image_url.startsWith('http') ? design.image_url : `http://localhost:5000${design.image_url}`) 
        : "/RunWayIcon.jpg"
    });
    setActiveTab("edit");
  };

  const handleUpdate = async () => {
    if (!editingDesign) return;
    
    setLoading(true);
    try {
      // Check if a new image was selected
      if (editForm.image instanceof File) {
        // If new image, use FormData
        const formData = new FormData();
        formData.append("image", editForm.image);
        formData.append("designer_id", user.user_id);
        formData.append("title", editForm.title);
        formData.append("description", editForm.description);
        formData.append("season", editForm.season);
        
        // FIX: Use correct endpoint without double /api
        await API.post(`/designs/${editingDesign.design_id}/update-with-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        // No new image, just update text
        await API.put(`/designs/${editingDesign.design_id}`, {
          designer_id: user.user_id,
          title: editForm.title,
          description: editForm.description,
          season: editForm.season
        });
      }
      
      alert("Design updated!");
      setEditingDesign(null);
      setActiveTab("gallery");
      fetchDesigns(user.user_id);
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.error || "Error updating design");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (designId) => {
    if (!window.confirm("Delete this design permanently?")) return;
    
    try {
      await API.delete(`/designs/${designId}?designerId=${user.user_id}`);
      fetchDesigns(user.user_id);
    } catch (err) {
      alert("Error deleting design");
    }
  };

  // Profile functions
  const handleAvatarClick = () => {
    document.getElementById('designer-avatar-input').click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const res = await API.post(`/users/${user.user_id}/avatar`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        profileForm.avatar_url = res.data.avatar_url;
      }
      
      // Update profile
      await API.put(`/users/${user.user_id}/profile`, profileForm);
      
      const updatedUser = { ...user, ...profileForm };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditProfileMode(false);
      setAvatarFile(null);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const stats = useMemo(() => {
    const ratedDesigns = designs.filter((d) => {
      const r = Number(d.avg_rating);
      return !isNaN(r) && r > 0;
    });

    const ratingSum = ratedDesigns.reduce(
      (sum, d) => sum + Number(d.avg_rating || 0),
      0
    );

    return {
      totalViews: designs.reduce(
        (acc, d) => acc + (Number(d.view_count) || 0),
        0
      ),
      totalLikes: designs.reduce(
        (acc, d) => acc + (Number(d.like_count) || 0),
        0
      ),
      avgRating:
        ratedDesigns.length > 0
          ? (ratingSum / ratedDesigns.length).toFixed(1)
          : "0.0",
      followerCount: Number(user?.follower_count) || 0,
    };
  }, [designs, user]);

  if (!user) return null;

  return (
    <div className="designer-studio">
      <header className="studio-header">
        <div className="studio-logo">RUN-WAY</div>
        <nav className="studio-tabs">
          <button className={activeTab === "gallery" ? "active" : ""} onClick={() => handleTabChange("gallery")}>
            GALLERY
          </button>
          <button className={activeTab === "upload" ? "active" : ""} onClick={() => handleTabChange("upload")}>
            UPLOAD
          </button>
          <button className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>
            STATS
          </button>
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
            PROFILE
          </button>
        </nav>
        <button className="logout-tab" onClick={() => setShowLogoutConfirm(true)}>
          LOGOUT
        </button>
      </header>

      <main className="studio-content">
        {/* GALLERY TAB */}
        {activeTab === "gallery" && (
          <div className="gallery-view">
            <h2 className="view-title">My Designs ({designs.length})</h2>
            <div className="gallery-grid">
              {designs.map((item) => (
                <div key={item.design_id} className="gallery-item real-post">
                  <div className="item-image">
                    <img 
                      src={`${item.image_url?.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}?t=${item.updated_at || Date.now()}`} 
                      alt={item.title} 
                    />
                    <div className="item-actions">
                      <button onClick={() => handleEdit(item)}>✏️ Edit</button>
                      <button onClick={() => handleDelete(item.design_id)}>🗑️ Delete</button>
                    </div>
                  </div>
                  <div className="item-overlay">
                    <h4>{item.title}</h4>
                    <p>{item.season}</p>
                    <div className="item-stats">
                      <span>❤️ {item.like_count || 0}</span>
                      <span>⭐ {item.avg_rating && !isNaN(item.avg_rating) ? Number(item.avg_rating).toFixed(1) : '0.0'} ({item.rating_count || 0})</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="gallery-item empty" onClick={() => handleTabChange("upload")}>
                <div className="add-placeholder">+</div>
                <p>Add New Design</p>
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD TAB - UNIQUE LAYOUT */}
        {activeTab === "upload" && (
          <div className="upload-view upload-layout">
            <div className="upload-container">
              <div className="upload-header">
                <h2>🆕 Upload New Design</h2>
                <p className="upload-subtitle">Share your latest fashion creation with the world</p>
              </div>
              
              <div className="upload-content">
                <div className="upload-preview upload-side">
                  <div className="preview-frame upload-preview-box" onClick={() => fileInputRef.current?.click()}>
                    <img src={uploadForm.imagePreview} alt="Preview" />
                    <div className="upload-overlay">
                      <span>📷 Click to Select Image</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={(e) => handleImageSelect(e, false)}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                
                <div className="upload-form upload-side">
                  <div className="form-field">
                    <label>Title *</label>
                    <input 
                      type="text" 
                      placeholder="Enter your design title..."
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Description</label>
                    <textarea 
                      placeholder="Describe your design, materials used, inspiration..."
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      rows="4"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Season</label>
                    <select 
                      value={uploadForm.season}
                      onChange={(e) => setUploadForm({...uploadForm, season: e.target.value})}
                    >
                      <option>Spring 2026</option>
                      <option>Summer 2026</option>
                      <option>Fall 2026</option>
                      <option>Winter 2026</option>
                    </select>
                  </div>
                  
                  <div className="upload-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => {
                        resetUploadForm();
                        setActiveTab("gallery");
                      }}
                    >
                      CANCEL
                    </button>
                    <button 
                      className="btn-primary upload-btn" 
                      onClick={handleUpload}
                      disabled={loading}
                    >
                      {loading ? "UPLOADING..." : "🚀 UPLOAD DESIGN"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT TAB - DIFFERENT LAYOUT */}
        {activeTab === "edit" && (
          <div className="upload-view edit-layout">
            <div className="upload-container">
              <div className="edit-header">
                <h2>✏️ Edit Design</h2>
                <p className="edit-subtitle">Update your existing design</p>
                {editingDesign && (
                  <div className="edit-meta">
                    <span>Design ID: #{editingDesign.design_id}</span>
                    <span>Created: {new Date(editingDesign.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="edit-content">
                {/* Edit has image on left, form on right but different styling */}
                <div className="edit-image-section">
                  <div className="current-image-label">Current Image</div>
                  <div className="preview-frame edit-preview-box" onClick={() => fileInputRef.current?.click()}>
                    <img src={editForm.imagePreview} alt="Preview" />
                    <div className="upload-overlay">
                      <span>📷 Click to Change Image</span>
                    </div>
                  </div>
                  <p className="image-hint">Leave as-is to keep current image</p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={(e) => handleImageSelect(e, true)}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                
                <div className="edit-form-section">
                  <div className="form-field">
                    <label>Title *</label>
                    <input 
                      type="text" 
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Description</label>
                    <textarea 
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows="4"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Season</label>
                    <select 
                      value={editForm.season}
                      onChange={(e) => setEditForm({...editForm, season: e.target.value})}
                    >
                      <option>Spring 2026</option>
                      <option>Summer 2026</option>
                      <option>Fall 2026</option>
                      <option>Winter 2026</option>
                    </select>
                  </div>
                  
                  <div className="edit-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => {
                        setEditingDesign(null);
                        setActiveTab("gallery");
                      }}
                    >
                      CANCEL
                    </button>
                    <button 
                      className="btn-primary edit-btn" 
                      onClick={handleUpdate}
                      disabled={loading}
                    >
                      {loading ? "SAVING..." : "💾 SAVE CHANGES"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <div className="stats-view">
            <h2 className="view-title">Performance Stats</h2>
            <div className="stats-dashboard">
              <div className="stat-circle main">
                <div className="circle-content">
                  <h3>{stats.totalViews}</h3>
                  <p>Total Views</p>
                </div>
              </div>
              <div className="stats-breakdown">
                <div className="stat-item">
                  <span className="stat-number">{stats.totalLikes}</span>
                  <span className="stat-label">Total Likes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.avgRating}</span>
                  <span className="stat-label">Avg Rating</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{stats.followerCount}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{designs.length}</span>
                  <span className="stat-label">Designs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="profile-view">
            <div className="profile-layout">
              <div className="profile-sidebar">
                <div className="avatar-section-designer" onClick={editProfileMode ? handleAvatarClick : undefined}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="profile-avatar-large-img" />
                  ) : (
                    <div className="profile-avatar-large">{user.username?.[0]?.toUpperCase()}</div>
                  )}
                  {editProfileMode && <div className="avatar-change-badge">📷 Change</div>}
                </div>
                <input 
                  type="file" 
                  id="designer-avatar-input"
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                <h3 className="designer-name">{user.username}</h3>
                <p className="designer-role">Fashion Designer</p>
                
                <div className="profile-stats-mini">
                  <div><span>{designs.length}</span><small>Designs</small></div>
                  <div><span>{stats.followerCount}</span><small>Followers</small></div>
                </div>

              </div>
              
              <div className="profile-details">
                {!editProfileMode ? (
                  <>
                    <div className="detail-section">
                      <h4>Account Information</h4>
                      <div className="detail-row">
                        <label>Email</label>
                        <input value={user.email} disabled />
                      </div>
                      <div className="detail-row">
                        <label>Brand Name</label>
                        <input value={user.brand_name || "Not set"} disabled />
                      </div>
                      <div className="detail-row">
                        <label>Specialty</label>
                        <input value={user.specialty || "Not set"} disabled />
                      </div>
                      <div className="detail-row">
                        <label>Location</label>
                        <input value={user.location || "Not set"} disabled />
                      </div>
                      <div className="detail-row">
                        <label>Website</label>
                        <input value={user.website || "Not set"} disabled />
                      </div>
                      <div className="detail-row">
                        <label>Bio</label>
                        <textarea value={user.bio || "No bio yet"} disabled rows="3" />
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Social Links</h4>
                      <div className="social-display">
                        {user.instagram && <span>📷 {user.instagram}</span>}
                        {user.facebook && <span>📘 {user.facebook}</span>}
                        {user.twitter && <span>🐦 {user.twitter}</span>}
                      </div>
                    </div>

                    <button className="btn-save" onClick={() => setEditProfileMode(true)}>
                      ✏️ Edit Profile
                    </button>
                  </>
                ) : (
                  <>
                    <div className="detail-section editable">
                      <h4>Edit Profile</h4>
                      <div className="detail-row">
                        <label>Brand Name</label>
                        <input 
                          value={profileForm.brand_name || ''}
                          onChange={(e) => setProfileForm({...profileForm, brand_name: e.target.value})}
                          placeholder="Your brand name"
                        />
                      </div>
                      <div className="detail-row">
                        <label>Specialty</label>
                        <input 
                          value={profileForm.specialty || ''}
                          onChange={(e) => setProfileForm({...profileForm, specialty: e.target.value})}
                          placeholder="e.g. Haute Couture"
                        />
                      </div>
                      <div className="detail-row">
                        <label>Location</label>
                        <input 
                          value={profileForm.location || ''}
                          onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                          placeholder="City, Country"
                        />
                      </div>
                      <div className="detail-row">
                        <label>Website</label>
                        <input 
                          value={profileForm.website || ''}
                          onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                          placeholder="www.yourbrand.com"
                        />
                      </div>
                      <div className="detail-row">
                        <label>Bio</label>
                        <textarea 
                          value={profileForm.bio || ''}
                          onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                          placeholder="Tell your story..."
                          rows="4"
                        />
                      </div>
                      <div className="detail-row">
                        <label>Instagram</label>
                        <input 
                          value={profileForm.instagram || ''}
                          onChange={(e) => setProfileForm({...profileForm, instagram: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                      <div className="detail-row">
                        <label>Facebook</label>
                        <input 
                          value={profileForm.facebook || ''}
                          onChange={(e) => setProfileForm({...profileForm, facebook: e.target.value})}
                          placeholder="Facebook URL"
                        />
                      </div>
                      <div className="detail-row">
                        <label>Twitter</label>
                        <input 
                          value={profileForm.twitter || ''}
                          onChange={(e) => setProfileForm({...profileForm, twitter: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                    </div>

                    <div className="profile-actions">
                      <button className="btn-save" onClick={handleProfileUpdate} disabled={loading}>
                        {loading ? "SAVING..." : "💾 SAVE CHANGES"}
                      </button>
                      <button className="btn-secondary" onClick={() => {
                        setEditProfileMode(false);
                        setProfileForm(user);
                        setAvatarPreview(user.avatar_url);
                        setAvatarFile(null);
                      }}>
                        CANCEL
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LOGOUT CONFIRMATION */}
        {showLogoutConfirm && (
          <div className="logout-modal">
            <div className="logout-content">
              <h3>ARE YOU SURE YOU WANT TO LOG OUT?</h3>
              <div className="logout-actions">
                <button className="btn-yes" onClick={handleLogout}>YES</button>
                <button className="btn-no" onClick={() => setShowLogoutConfirm(false)}>NO</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="studio-decoration left"><img src="/login.jpg" alt="Decoration" /></div>
      <div className="studio-decoration right"><img src="/register.jpg" alt="Decoration" /></div>
    </div>
  );
}

export default Designer;