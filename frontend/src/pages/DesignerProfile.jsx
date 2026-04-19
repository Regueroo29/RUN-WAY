import { useEffect, useState, useRef } from "react";
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
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Refs for scroll targets
  const worksSectionRef = useRef(null);
  const aboutSectionRef = useRef(null);
  const topRef = useRef(null);

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
  }, [id, currentUser]);

  // Scroll progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchDesignerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching designer:", id);
      
      const designerRes = await API.get(`/users/${id}`);
      console.log("Designer data:", designerRes.data);
      setDesigner(designerRes.data);
      
      const designsRes = await API.get(`/designs/designer/${id}`);
      console.log("Designs data:", designsRes.data);
      setDesigns(designsRes.data);
      
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

  // Scroll functions
  const scrollToWorks = () => {
    worksSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToAbout = () => {
    aboutSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div className="designer-public-profile" ref={topRef}>
      {/* Scroll Progress Bar */}
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>

      {/* Background */}
      <div className="designer-hero-bg">
        <img src="/bgm.jpg" alt="Background" />
        <div className="hero-overlay"></div>
      </div>

      {/* Back Button */}
      <button className="back-to-discovery" onClick={() => navigate("/dashboard")}>
        ← BACK TO DISCOVERY
      </button>

      {/* Floating Navigation */}
      <nav className="floating-nav">
        <button onClick={scrollToTop} className="nav-dot" title="Top">
          <span className="nav-tooltip">Top</span>
        </button>
        <button onClick={scrollToWorks} className="nav-dot" title="Collections">
          <span className="nav-tooltip">Collections</span>
        </button>
        <button onClick={scrollToAbout} className="nav-dot" title="About">
          <span className="nav-tooltip">About</span>
        </button>
      </nav>

      {/* Scroll to Top Button (appears after scrolling) */}
      {scrollProgress > 20 && (
        <button className="scroll-to-top-btn" onClick={scrollToTop}>
          ↑
        </button>
      )}

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
            <div className="stat-box clickable" onClick={scrollToWorks}>
              <span className="stat-num">{designs.length}</span>
              <span className="stat-label">Designs</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{designer.follower_count || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
          </div>

          {/* Quick Scroll Buttons */}
          <div className="quick-scroll-buttons">
            <button onClick={scrollToWorks} className="quick-scroll-btn">
              View Collections ↓
            </button>
            {designer.bio && (
              <button onClick={scrollToAbout} className="quick-scroll-btn secondary">
                Read About ↓
              </button>
            )}
          </div>

          {currentUser && currentUser.user_id !== parseInt(id) && (
            <button 
              className={`follow-designer-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}

          <div className="designer-bio-section" ref={aboutSectionRef}>
            <h3>About</h3>
            {designer.bio ? (
              <p>{designer.bio}</p>
            ) : (
              <p className="no-bio">No bio added yet</p>
            )}
          </div>

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
        <div className="designer-works-panel" ref={worksSectionRef}>
          <h2 className="works-title">Collections</h2>
          {designs.length === 0 ? (
            <div className="no-designs-container">
              <p className="no-designs">No designs uploaded yet</p>
              <button onClick={scrollToTop} className="back-to-top-link">Back to Top ↑</button>
            </div>
          ) : (
            <>
              <div className="works-grid">
                {designs.map((design, index) => (
                  <div 
                    key={design.design_id} 
                    className="work-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="work-image">
                      <img 
                        src={design.image_url?.startsWith('http') ? design.image_url : `http://localhost:5000${design.image_url}`} 
                        alt={design.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '/bgimage.jpg';
                        }}
                      />
                      <div className="work-overlay">
                        <button className="view-details-btn">View Details</button>
                      </div>
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
              
              {/* End of Collections */}
              <div className="collections-end">
                <p>End of Collections</p>
                <button onClick={scrollToTop} className="back-to-top-link">Back to Top ↑</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DesignerProfile;