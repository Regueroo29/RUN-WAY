import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import UserDetailModal from "../components/UserDetailModal";
import DesignDetailModal from "../components/DesignDetailModal";
import "./Admin.css";

function Admin() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      alert("Access denied. Admin privileges required.");
      navigate("/dashboard");
      return;
    }
    
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, designsRes, actRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/designs"),
        API.get("/admin/activities")
      ]);
      setUsers(usersRes.data);
      setDesigns(designsRes.data);
      setActivities(actRes.data);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      alert("Error loading admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (type, id) => {
    if (type === 'hide_design' || type === 'unhide_design' || type === 'delete_design') {
      const action = type === 'delete_design' ? 'delete' : type === 'hide_design' ? 'hide' : 'unhide';
      const reason = action === 'unhide' ? '' : prompt(`Enter reason for ${action}ing this design:`);
      if (action !== 'unhide' && !reason) return;
      
      try {
        await API.post(`/admin/designs/${id}/moderate`, { action, reason });
        alert(`Design ${action}d successfully`);
        fetchData();
      } catch (err) {
        alert(`Error ${action}ing design`);
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading admin panel...</div>;

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <h1>ADMIN DASHBOARD</h1>
        <nav className="admin-tabs">
          <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
            Users ({users.length})
          </button>
          <button className={activeTab === "designs" ? "active" : ""} onClick={() => setActiveTab("designs")}>
            Designs ({designs.length})
          </button>
          <button className={activeTab === "activity" ? "active" : ""} onClick={() => setActiveTab("activity")}>
            Activity Log
          </button>
        </nav>
        <button onClick={() => { localStorage.clear(); navigate("/"); }} className="admin-logout">
          LOGOUT
        </button>
      </header>

      <main className="admin-content">
        {activeTab === "users" && (
          <>
            <div className="admin-stats-container">
              <div className="stat-card">
                <span className="stat-number">{users.filter(u => u.status === 'active').length}</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{users.filter(u => u.status === 'suspended').length}</span>
                <span className="stat-label">Suspended</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{designs.length}</span>
                <span className="stat-label">Total Designs</span>
              </div>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Designs</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.user_id} className={u.status !== 'active' ? 'suspended-row' : ''}>
                      <td>{u.user_id}</td>
                      <td className="clickable" onClick={() => setSelectedUser(u.user_id)}>{u.username}</td>
                      <td>{u.email}</td>
                      <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                      <td><span className={`status-badge small ${u.status}`}>{u.status}</span></td>
                      <td>{u.design_count}</td>
                      <td>
                        <button onClick={() => setSelectedUser(u.user_id)} className="btn-view-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "designs" && (
          <>
            <div className="admin-stats-container">
              <div className="stat-card">
                <span className="stat-number">{designs.filter(d => d.status === 'active').length}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{designs.filter(d => d.status === 'hidden').length}</span>
                <span className="stat-label">Hidden</span>
              </div>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Designer</th>
                    <th>Status</th>
                    <th>Season</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {designs.map(d => (
                    <tr key={d.design_id} className={d.status !== 'active' ? 'hidden-row' : ''}>
                      <td>{d.design_id}</td>
                      <td className="clickable" onClick={() => setSelectedDesign(d.design_id)}>{d.title}</td>
                      <td>{d.designer_name}</td>
                      <td><span className={`status-badge small ${d.status}`}>{d.status}</span></td>
                      <td>{d.season}</td>
                      <td>
                        <button onClick={() => setSelectedDesign(d.design_id)} className="btn-view-sm">
                          Moderate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "activity" && (
          <div className="activity-log-section">
            <h2 className="activity-header">Recent Activity</h2>
            <div className="activity-log">
              {activities.length === 0 ? (
                <p className="empty-activity">No activity recorded yet.</p>
              ) : (
                activities.map(act => (
                  <div key={act.log_id} className="activity-item">
                    <span className="activity-time">{new Date(act.created_at).toLocaleString()}</span>
                    <span className="activity-user">{act.username}</span>
                    <span className={`activity-action ${act.action_type}`}>{act.action_type.replace('_', ' ')}</span>
                    {act.details && <span className="activity-details">{act.details}</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {selectedUser && (
        <UserDetailModal 
          userId={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onAction={handleModerationAction}
        />
      )}

      {selectedDesign && (
        <DesignDetailModal 
          designId={selectedDesign} 
          onClose={() => setSelectedDesign(null)}
          onAction={handleModerationAction}
        />
      )}
    </div>
  );
}

export default Admin;