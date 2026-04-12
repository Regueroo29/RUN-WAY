import { useState, useEffect } from 'react';
import API from '../services/api';
import './Modal.css';

function UserDetailModal({ userId, onClose, onAction }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDays, setSuspensionDays] = useState('');
  const [showSuspendForm, setShowSuspendForm] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const res = await API.get(`/admin/users/${userId}/details`);
      setUserData(res.data);
    } catch (err) {
      alert('Error loading user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;
    try {
      await API.post(`/admin/users/${userId}/suspend`, {
        reason: suspensionReason,
        duration_days: suspensionDays ? parseInt(suspensionDays) : null
      });
      alert('User suspended successfully');
      fetchUserDetails();
      setShowSuspendForm(false);
      onAction();
    } catch (err) {
      alert('Error suspending user');
    }
  };

  const handleUnsuspend = async () => {
    if (!window.confirm('Unsuspend this user?')) return;
    try {
      await API.post(`/admin/users/${userId}/unsuspend`);
      alert('User unsuspended');
      fetchUserDetails();
      onAction();
    } catch (err) {
      alert('Error unsuspending user');
    }
  };

  if (loading) return <div className="modal-overlay"><div className="modal-content">Loading...</div></div>;
  if (!userData) return null;

  const { user, designs, moderation_history } = userData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Details: {user.username}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="user-status-bar">
          <span className={`status-badge ${user.status}`}>{user.status.toUpperCase()}</span>
          {user.status === 'suspended' && (
            <span className="suspension-info">
              {user.suspension_end_date 
                ? `Until: ${new Date(user.suspension_end_date).toLocaleDateString()}`
                : 'Permanent'}
            </span>
          )}
        </div>

        <div className="modal-tabs">
          <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>
            Profile Info
          </button>
          <button className={activeTab === 'designs' ? 'active' : ''} onClick={() => setActiveTab('designs')}>
            Designs ({designs.length})
          </button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
            History
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'info' && (
            <div className="user-info-tab">
              <div className="info-grid">
                <div><label>Email:</label> <span>{user.email}</span></div>
                <div><label>Role:</label> <span className={`role-badge ${user.role}`}>{user.role}</span></div>
                <div><label>Joined:</label> <span>{new Date(user.created_at).toLocaleDateString()}</span></div>
                <div><label>Designs:</label> <span>{user.design_count}</span></div>
                <div><label>Likes:</label> <span>{user.like_count}</span></div>
                <div><label>Followers:</label> <span>{user.follower_count}</span></div>
              </div>
              
              {user.status === 'suspended' && (
                <div className="suspension-details">
                  <h4>Suspension Reason:</h4>
                  <p>{user.suspension_reason}</p>
                  {user.moderated_by_name && <small>By: {user.moderated_by_name}</small>}
                </div>
              )}

              <div className="action-buttons">
                {user.status === 'active' ? (
                  <button className="btn-suspend" onClick={() => setShowSuspendForm(true)}>
                    Suspend Account
                  </button>
                ) : (
                  <button className="btn-unsuspend" onClick={handleUnsuspend}>
                    Unsuspend Account
                  </button>
                )}
              </div>

              {showSuspendForm && (
                <div className="suspend-form">
                  <textarea
                    placeholder="Reason for suspension..."
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Days (leave empty for permanent)"
                    value={suspensionDays}
                    onChange={(e) => setSuspensionDays(e.target.value)}
                  />
                  <div className="form-actions">
                    <button onClick={handleSuspend} disabled={!suspensionReason}>
                      Confirm Suspend
                    </button>
                    <button className="btn-cancel" onClick={() => setShowSuspendForm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'designs' && (
            <div className="user-designs-tab">
              {designs.length === 0 ? (
                <p className="empty-state">No designs uploaded</p>
              ) : (
                <div className="designs-grid">
                  {designs.map(design => (
                    <div key={design.design_id} className={`design-card ${design.status}`}>
                      <div className="design-image">
                        <img src={design.image_url} alt={design.title} />
                        {design.status !== 'active' && (
                          <span className="design-status-overlay">{design.status}</span>
                        )}
                      </div>
                      <div className="design-info">
                        <h4>{design.title}</h4>
                        <p>{design.season} • {design.like_count} likes</p>
                        <div className="design-actions">
                          <button onClick={() => window.open(`/design/${design.design_id}`, '_blank')}>
                            View
                          </button>
                          {design.status === 'active' ? (
                            <button className="btn-hide" onClick={() => onAction('hide_design', design.design_id)}>
                              Hide
                            </button>
                          ) : (
                            <button className="btn-unhide" onClick={() => onAction('unhide_design', design.design_id)}>
                              Unhide
                            </button>
                          )}
                          <button className="btn-delete" onClick={() => onAction('delete_design', design.design_id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="moderation-history-tab">
              {moderation_history.length === 0 ? (
                <p className="empty-state">No moderation history</p>
              ) : (
                <div className="history-list">
                  {moderation_history.map(log => (
                    <div key={log.log_id} className="history-item">
                      <span className="history-action">{log.action}</span>
                      <span className="history-reason">{log.reason}</span>
                      <span className="history-meta">
                        By {log.admin_name} • {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetailModal;