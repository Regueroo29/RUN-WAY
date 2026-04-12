import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./DesignerProfile.css";

function DesignerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [designer, setDesigner] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchDesignerData();
    }
  }, [id, currentUser]); // Refetch when currentUser is loaded

  const fetchDesignerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching designer:", id);
      
      // Fetch designer info
      const designerRes = await API.get(`/users/${id}`);
      console.log("Designer data:", designerRes.data);
      setDesigner(designerRes.data);
      
      // Fetch designs
      const designsRes = await API.get(`/designs/designer/${id}`);
      console.log("Designs data:", designsRes.data);
      setDesigns(designsRes.data);
      
      // Check follow status if logged in
      if (currentUser && currentUser.user_id !== parseInt(id)) {
        try {
          const followRes = await API.get(`/follows/check?follower_id=${currentUser.user_id}&designer_id=${id}`);
          setIsFollowing(followRes.data.following);
        } catch (err) {
          console.log("Follow check failed:", err);
        }
      }
      
    } catch (err) {
      console.error("Error fetching designer:", err);
      setError("Designer not found or error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    try {
      const res = await API.post("/follows/toggle", {
        follower_id: currentUser.user_id,
        designer_id: id
      });
      
      setIsFollowing(res.data.following);
      
      // Update follower count locally
      setDesigner(prev => ({
        ...prev,
        follower_count: res.data.following 
          ? (prev.follower_count || 0) + 1 
          : Math.max(0, (prev.follower_count || 0) - 1)
      }));
    } catch (err) {
      console.error("Error following:", err);
      alert("Error updating follow status");
    }
  };

  if (loading) {
    return (
      <div className="designer-profile-loading">
        <div className="loading-spinner">Loading designer profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="designer-profile-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/dashboard")}>Back to Discovery</button>
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="designer-profile-error">
        <h2>Designer Not Found</h2>
        <button onClick={() => navigate("/dashboard")}>Back to Discovery</button>
      </div>
    );
  }

  return (
    <div className="designer-public-profile">
      {/* Background */}
      <div className="designer-hero-bg">
        <img src="/bgimage.jpg" alt="Background" />
        <div className="hero-overlay"></div>
      </div>

      {/* Back Button */}
      <button className="back-to-discovery" onClick={() => navigate("/dashboard")}>
        ← BACK TO DISCOVERY
      </button>

      {/* Main Content */}
      <div className="designer-profile-content">
        {/* Left Sidebar */}
        <div className="designer-info-panel">
          <div className="designer-avatar-large">
            {designer.avatar_url ? (
              <img src={designer.avatar_url} alt={designer.username} />
            ) : (
              <div className="avatar-initial">{designer.username?.[0]?.toUpperCase()}</div>
            )}
          </div>
          
          <h1 className="designer-name">{designer.brand_name || designer.username}</h1>
          <p className="designer-handle">@{designer.username}</p>
          
          {designer.specialty && (
            <p className="designer-specialty">{designer.specialty}</p>
          )}
          
          <div className="designer-stats-row">
            <div className="stat-box">
              <span className="stat-num">{designs.length}</span>
              <span className="stat-label">Designs</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{designer.follower_count || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
          </div>

          {currentUser && currentUser.user_id !== parseInt(id) && (
            <button 
              className={`follow-designer-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          {designer.bio && (
            <div className="designer-bio-section">
              <h3>About</h3>
              <p>{designer.bio}</p>
            </div>
          )}

          <div className="designer-links-section">
            {(designer.website || designer.instagram || designer.facebook || designer.twitter) ? (
              <>
                <h3>Connect</h3>
                {designer.website && (
                  <a href={designer.website.startsWith('http') ? designer.website : `https://${designer.website}`} 
                     target="_blank" 
                     rel="noreferrer" 
                     className="designer-link">
                    🌐 Website
                  </a>
                )}
                {designer.instagram && (
                  <a href={`https://instagram.com/${designer.instagram.replace('@', '')}`} 
                     target="_blank" 
                     rel="noreferrer" 
                     className="designer-link">
                    📷 Instagram
                  </a>
                )}
                {designer.facebook && (
                  <a href={designer.facebook.startsWith('http') ? designer.facebook : `https://${designer.facebook}`} 
                     target="_blank" 
                     rel="noreferrer" 
                     className="designer-link">
                    📘 Facebook
                  </a>
                )}
                {designer.twitter && (
                  <a href={`https://twitter.com/${designer.twitter.replace('@', '')}`} 
                     target="_blank" 
                     rel="noreferrer" 
                     className="designer-link">
                    🐦 Twitter
                  </a>
                )}
              </>
            ) : (
              <p className="no-links">No social links added</p>
            )}
          </div>
        </div>

        {/* Right Side - Designs */}
        <div className="designer-works-panel">
          <h2 className="works-title">Collections</h2>
          {designs.length === 0 ? (
            <p className="no-designs">No designs uploaded yet</p>
          ) : (
            <div className="works-grid">
              {designs.map((design) => (
                <div key={design.design_id} className="work-card">
                  <div className="work-image">
                    <img 
                      src={design.image_url?.startsWith('http') ? design.image_url : `http://localhost:5000${design.image_url}`} 
                      alt={design.title}
                      onError={(e) => {
                        e.target.src = '/bgimage.jpg'; // Fallback image
                      }}
                    />
                  </div>
                  <div className="work-info">
                    <h3>{design.title}</h3>
                    <p>{design.season}</p>
                    <div className="work-stats">
                      <span>❤️ {design.like_count || 0}</span>
                      <span>⭐ {design.avg_rating ? Number(design.avg_rating).toFixed(1) : '0.0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DesignerProfile;