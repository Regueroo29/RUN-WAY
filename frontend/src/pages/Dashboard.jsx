import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("trending");
  const [designs, setDesigns] = useState([]);
  const [likedDesigns, setLikedDesigns] = useState([]);
  const [followingDesigners, setFollowingDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchData(parsed.user_id);
    }
  }, [navigate]);

  const fetchData = async (userId) => {
    try {
      const res = await API.get(`/designs?userId=${userId}`);
      const allDesigns = res.data;
      
      const liked = allDesigns.filter(d => d.is_liked).map(d => d.design_id);
      setLikedDesigns(liked);
      
      const designerIds = [...new Set(allDesigns.map(d => d.designer_id))];
      const followingChecks = await Promise.all(
        designerIds.map(async (id) => {
          try {
            const res = await API.get(`/follows/check?follower_id=${userId}&designer_id=${id}`);
            return { designerId: id, following: res.data.following };
          } catch (err) {
            return { designerId: id, following: false };
          }
        })
      );
      const following = followingChecks.filter(f => f.following).map(f => f.designerId);
      setFollowingDesigners(following);
      
      setDesigns(allDesigns);
    } catch (err) {
      console.error("Error fetching designs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter designs based on active tab
  const getFilteredDesigns = () => {
    if (activeTab === "trending") {
      return [...designs].sort((a, b) => {
        const scoreA = (a.like_count || 0) + (a.avg_rating || 0) * 10;
        const scoreB = (b.like_count || 0) + (b.avg_rating || 0) * 10;
        return scoreB - scoreA;
      });
    }
    
    if (activeTab === "foryou") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      return designs.filter(d => {
        const designDate = new Date(d.created_at);
        const isRecent = designDate > oneWeekAgo;
        const isFromFollowed = followingDesigners.includes(d.designer_id);
        return isRecent || isFromFollowed;
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return designs;
  };

  // Group liked designs by designer (most recently liked designers first)
  const groupedActivity = useMemo(() => {
    const likedInOrder = likedDesigns
      .map(id => designs.find(d => d.design_id === id))
      .filter(Boolean);
    
    const groups = [];
    const seenDesigners = new Set();
    
    likedInOrder.forEach(design => {
      if (!seenDesigners.has(design.designer_id)) {
        seenDesigners.add(design.designer_id);
        groups.push({
          designer: {
            designer_id: design.designer_id,
            designer_name: design.designer_name,
            brand_name: design.brand_name,
            designer_avatar: design.designer_avatar
          },
          designs: likedInOrder.filter(d => d.designer_id === design.designer_id)
        });
      }
    });
    
    return groups;
  }, [likedDesigns, designs]);

  const handleLike = async (designId, e) => {
    if (e) e.stopPropagation();
    if (!user) return;

    const isLiked = likedDesigns.includes(designId);
    
    if (isLiked) {
      setLikedDesigns(likedDesigns.filter(id => id !== designId));
      setDesigns(designs.map(d => 
        d.design_id === designId 
          ? { ...d, like_count: Math.max(0, (d.like_count || 0) - 1) }
          : d
      ));
    } else {
      setLikedDesigns([designId, ...likedDesigns]);
      setDesigns(designs.map(d => 
        d.design_id === designId 
          ? { ...d, like_count: (d.like_count || 0) + 1 }
          : d
      ));
    }

    try {
      await API.post("/likes/toggle", {
        user_id: user.user_id,
        design_id: designId
      });
    } catch (err) {
      console.error("Like error:", err);
      fetchData(user.user_id);
    }
  };

  const handleRate = async (designId, rating, e) => {
    if (e) e.stopPropagation();
    if (!user) return;
    
    const design = designs.find(d => d.design_id === designId);
    const oldRating = design?.user_rating || 0;
    const wasRated = oldRating > 0;
    
    const oldAvg = design.avg_rating || 0;
    const oldCount = design.rating_count || 0;
    let newAvg, newCount;
    
    if (wasRated) {
      newAvg = ((oldAvg * oldCount) - oldRating + rating) / oldCount;
      newCount = oldCount;
    } else {
      newAvg = ((oldAvg * oldCount) + rating) / (oldCount + 1);
      newCount = oldCount + 1;
    }

    setDesigns(designs.map(d => 
      d.design_id === designId 
        ? { ...d, user_rating: rating, avg_rating: newAvg, rating_count: newCount }
        : d
    ));

    if (selectedDesign?.design_id === designId) {
      setSelectedDesign(prev => ({
        ...prev,
        user_rating: rating,
        avg_rating: newAvg,
        rating_count: newCount
      }));
    }

    try {
      await API.post("/ratings", {
        user_id: user.user_id,
        design_id: designId,
        rating: rating
      });
    } catch (err) {
      fetchData(user.user_id);
    }
  };

  const handleFollow = async (designerId, e) => {
    if (e) e.stopPropagation();
    if (!user) return navigate("/login");
    if (designerId === user.user_id) return;
    
    const isFollowing = followingDesigners.includes(designerId);
    
    if (isFollowing) {
      setFollowingDesigners(followingDesigners.filter(id => id !== designerId));
    } else {
      setFollowingDesigners([...followingDesigners, designerId]);
    }

    try {
      await API.post("/follows/toggle", {
        follower_id: user.user_id,
        designer_id: designerId
      });
    } catch (err) {
      fetchData(user.user_id);
    }
  };

  const navigateToDesigner = (designerId, e) => {
    if (e) e.stopPropagation();
    navigate(`/designer/${designerId}`);
  };

  const isFollowing = (designerId) => followingDesigners.includes(designerId);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const renderStars = (design, interactive = false, size = "normal") => {
    const currentRating = design.user_rating || 0;
    const avgRating = design.avg_rating || 0;
    
    return (
      <div className="rating-container">
        <span className={`avg-rating ${size}`}>
          ★ {avgRating && !isNaN(avgRating) ? Number(avgRating).toFixed(1) : '0.0'}
        </span>
        {interactive && (
          <div className="star-rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${star <= currentRating ? 'filled' : ''} ${size}`}
                onClick={(e) => handleRate(design.design_id, star, e)}
              >
                ★
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!user) return null;
  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="discovery-page">
      <header className="discovery-header">
        <div className="header-left">
          <h1>DISCOVERY FEED</h1>
          <nav className="tab-nav">
            <button 
              className={activeTab === "trending" ? "active" : ""} 
              onClick={() => setActiveTab("trending")}
            >
              TRENDING
            </button>
            <button 
              className={activeTab === "foryou" ? "active" : ""} 
              onClick={() => setActiveTab("foryou")}
            >
              FOR YOU
            </button>
            <button 
              className={activeTab === "activity" ? "active" : ""} 
              onClick={() => setActiveTab("activity")}
            >
              MY ACTIVITY
            </button>
          </nav>
        </div>
        
        <div className="header-right">
          <div className="search-bar">
            <input type="text" placeholder="Search designers or designs..." />
          </div>
          <Link to="/profile" className="header-profile">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="avatar-small" />
            ) : (
              user.username?.[0]?.toUpperCase()
            )}
          </Link>
        </div>
      </header>

      <main className="discovery-main">
        {activeTab === "activity" ? (
          <div className="activity-section">
            {groupedActivity.length === 0 ? (
              <div className="empty-state">
                <p>No activity yet. Start exploring and liking designs!</p>
              </div>
            ) : (
              groupedActivity.map(group => (
                <div key={group.designer.designer_id} className="activity-designer-group">
                  <div 
                    className="activity-designer-header"
                    onClick={(e) => navigateToDesigner(group.designer.designer_id, e)}
                  >
                    {group.designer.designer_avatar ? (
                      <img 
                        src={group.designer.designer_avatar} 
                        alt={group.designer.designer_name} 
                        className="activity-designer-avatar" 
                      />
                    ) : (
                      <div className="activity-designer-avatar-placeholder">
                        {group.designer.designer_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="activity-designer-info">
                      <h4>{group.designer.brand_name || group.designer.designer_name}</h4>
                      <p>
                        @{group.designer.designer_name} • {group.designs.length} liked {group.designs.length === 1 ? 'design' : 'designs'}
                      </p>
                    </div>
                    <span className="activity-arrow">→</span>
                  </div>
                  
                  <div className="activity-designer-grid">
                    {group.designs.map(design => (
                      <div 
                        key={design.design_id} 
                        className="design-card"
                        onClick={() => setSelectedDesign(design)}
                      >
                        <div className="design-image">
                          <img 
                            src={`${design.image_url}?t=${design.updated_at || Date.now()}`} 
                            alt={design.title} 
                          />
                          <button 
                            className={`heart-btn liked`}
                            onClick={(e) => handleLike(design.design_id, e)}
                          >
                            ♥
                          </button>
                        </div>
                        <div className="design-info">
                          <h3>{design.title}</h3>
                          <p>{design.season}</p>
                          <div className="design-stats">
                            <span>❤️ {design.like_count || 0}</span>
                            <span>⭐ {design.rating_count || 0} ratings</span>
                          </div>
                          {renderStars(design)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {designs.length === 0 && (
              <div className="empty-state">
                No designs found in database
              </div>
            )}

            {activeTab === "foryou" && getFilteredDesigns().length === 0 && (
              <div className="empty-state">
                <p>Follow designers or check back for new posts from the last week!</p>
              </div>
            )}
            
            <div className="discovery-grid">
              {getFilteredDesigns().map((design) => (
                <div 
                  key={design.design_id} 
                  className="design-card"
                  onClick={() => setSelectedDesign(design)}
                >
                  <div className="design-image">
                    <img 
                      src={`${design.image_url}?t=${design.updated_at || Date.now()}`} 
                      alt={design.title} 
                    />
                    <button 
                      className={`heart-btn ${likedDesigns.includes(design.design_id) ? 'liked' : ''}`}
                      onClick={(e) => handleLike(design.design_id, e)}
                    >
                      {likedDesigns.includes(design.design_id) ? '♥' : '♡'}
                    </button>
                    
                    <div className="design-overlay-info">
                      <span 
                        className="designer-badge clickable"
                        onClick={(e) => navigateToDesigner(design.designer_id, e)}
                      >
                        {design.brand_name || design.designer_name}
                      </span>
                      {design.designer_id !== user.user_id && (
                        <button 
                          className={`follow-btn ${isFollowing(design.designer_id) ? 'following' : ''}`}
                          onClick={(e) => handleFollow(design.designer_id, e)}
                        >
                          {isFollowing(design.designer_id) ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="design-info">
                    <h3>{design.title}</h3>
                    <p>{design.season}</p>
                    <div className="design-stats">
                      <span>❤️ {design.like_count || 0}</span>
                      <span>⭐ {design.rating_count || 0} ratings</span>
                    </div>
                    {renderStars(design)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Post Detail Modal */}
      {selectedDesign && (
        <div className="modal-overlay" onClick={() => setSelectedDesign(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDesign(null)}>×</button>
            
            <div className="modal-layout">
              <div className="modal-image-section">
                <img src={selectedDesign.image_url} alt={selectedDesign.title} />
              </div>
              
              <div className="modal-details-section">
                <div className="modal-header">
                  <div className="designer-header-row">
                    <div 
                      className="designer-info"
                      onClick={(e) => {
                        setSelectedDesign(null);
                        navigate(`/designer/${selectedDesign.designer_id}`);
                      }}
                    >
                      {selectedDesign.designer_avatar ? (
                        <img src={selectedDesign.designer_avatar} alt={selectedDesign.designer_name} className="designer-avatar" />
                      ) : (
                        <div className="designer-avatar-placeholder">
                          {selectedDesign.designer_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="designer-text">
                        <h3>{selectedDesign.brand_name || selectedDesign.designer_name}</h3>
                        <p className="designer-username">@{selectedDesign.designer_name}</p>
                      </div>
                    </div>
                    
                    {selectedDesign.designer_id !== user?.user_id && (
                      <button 
                        className={`follow-btn-header ${isFollowing(selectedDesign.designer_id) ? 'following' : ''}`}
                        onClick={(e) => handleFollow(selectedDesign.designer_id, e)}
                      >
                        {isFollowing(selectedDesign.designer_id) ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="modal-body">
                  <h2>{selectedDesign.title}</h2>
                  <p className="season-tag">{selectedDesign.season}</p>
                  
                  <div className={`description-box ${selectedDesign.showFullDesc ? 'expanded' : ''}`}>
                    <h4>About this Design</h4>
                    <p>
                      {selectedDesign.description?.length > 150 && !selectedDesign.showFullDesc
                        ? `${selectedDesign.description.substring(0, 150)}...`
                        : (selectedDesign.description || "No description provided.")
                      }
                    </p>
                    {selectedDesign.description?.length > 150 && (
                      <button 
                        className="see-more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDesign(prev => ({
                            ...prev,
                            showFullDesc: !prev.showFullDesc
                          }));
                        }}
                      >
                        {selectedDesign.showFullDesc ? 'See less' : 'See more...'}
                      </button>
                    )}
                  </div>

                  <div className="stats-box">
                    <div className="stat-item-large">
                      <span className="stat-icon">❤️</span>
                      <div>
                        <span className="stat-count">{selectedDesign.like_count || 0}</span>
                        <span className="stat-label">likes</span>
                      </div>
                    </div>
                    <div className="stat-item-large">
                      <span className="stat-icon">⭐</span>
                      <div>
                        <span className="stat-count">{selectedDesign.rating_count || 0}</span>
                        <span className="stat-label">ratings</span>
                      </div>
                    </div>
                  </div>

                  <div className="rating-section">
                    <h4>Rate this Design</h4>
                    {renderStars(selectedDesign, true, "large")}
                  </div>

                  <button 
                    className={`like-action-btn ${likedDesigns.includes(selectedDesign.design_id) ? 'liked' : ''}`}
                    onClick={(e) => handleLike(selectedDesign.design_id, e)}
                  >
                    {likedDesigns.includes(selectedDesign.design_id) ? '♥ Liked' : '♡ Like'}
                  </button>
                  
                  <button 
                    className="view-designer-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDesign(null);
                      navigate(`/designer/${selectedDesign.designer_id}`);
                    }}
                  >
                    View Designer Profile →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <Link to="/dashboard" className="nav-item active">Discover</Link>
        <Link to="/profile" className="nav-item">Profile</Link>
        <button onClick={logout} className="nav-item logout">Logout</button>
      </nav>
    </div>
  );
}

export default Dashboard;