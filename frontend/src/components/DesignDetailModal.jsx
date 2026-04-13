import { useState, useEffect } from 'react';
import API from '../services/api';
import './Modal.css';

function DesignDetailModal({ designId, onClose, onAction }) {
  const [designData, setDesignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionReason, setActionReason] = useState('');
  const [showActionForm, setShowActionForm] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchDesignDetails();
  }, [designId]);

  const fetchDesignDetails = async () => {
    try {
      const res = await API.get(`/admin/designs/${designId}/details`);
      setDesignData(res.data);
      setImageError(false); // Reset image error on new load
    } catch (err) {
      alert('Error loading design details');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (action) => {
    try {
      await API.post(`/admin/designs/${designId}/moderate`, {
        action,
        reason: actionReason
      });
      alert(`Design ${action}d successfully`);
      fetchDesignDetails();
      setShowActionForm(null);
      setActionReason('');
      onAction();
    } catch (err) {
      alert(`Error ${action}ing design`);
    }
  };

  if (loading) return <div className="modal-overlay"><div className="modal-content">Loading...</div></div>;
  if (!designData) return null;

  const { design, moderation_history } = designData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content design-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Design Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="design-status-bar">
          <span className={`status-badge ${design.status}`}>{design.status.toUpperCase()}</span>
          {design.moderated_by_name && (
            <span className="moderation-meta">
              Last moderated by {design.moderated_by_name} on {new Date(design.moderated_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="modal-body">
          <div className="design-preview">
            {!imageError && design.image_url ? (
              <img 
                src={design.image_url} 
                alt={design.title}
                onError={() => setImageError(true)}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
              />
            ) : (
              <div className="image-error-placeholder" style={{
                width: '100%',
                height: '300px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px dashed rgba(200,180,160,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.5)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>🖼️</div>
                  <div>Image not available</div>
                  <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>
                    {design.image_url || 'No URL provided'}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="design-details">
            <h3>{design.title}</h3>
            <p className="design-description">{design.description || 'No description'}</p>
            
            <div className="info-grid">
              <div><label>Designer:</label> <span>{design.username}</span></div>
              <div><label>Email:</label> <span>{design.email}</span></div>
              <div><label>Season:</label> <span>{design.season || 'N/A'}</span></div>
              <div><label>Created:</label> <span>{new Date(design.created_at).toLocaleString()}</span></div>
              <div><label>Likes:</label> <span>{design.like_count || 0}</span></div>
              <div><label>Avg Rating:</label> <span>{design.avg_rating ? Number(design.avg_rating).toFixed(1) + '/5' : 'No ratings'}</span></div>
            </div>

            {design.status !== 'active' && design.moderation_reason && (
              <div className="moderation-reason-box">
                <h4>Moderation Reason:</h4>
                <p>{design.moderation_reason}</p>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn-view" onClick={() => alert('Public page not implemented yet')}>
                View Public Page
              </button>
              
              {design.status === 'active' ? (
                <button className="btn-hide" onClick={() => setShowActionForm('hide')}>
                  Hide Design
                </button>
              ) : (
                <button className="btn-unhide" onClick={() => setShowActionForm('unhide')}>
                  Unhide Design
                </button>
              )}
              
              <button className="btn-delete" onClick={() => setShowActionForm('delete')}>
                Delete Permanently
              </button>
            </div>

            {showActionForm && (
              <div className="action-form">
                <h4>{showActionForm === 'delete' ? 'Delete Design' : showActionForm === 'hide' ? 'Hide Design' : 'Unhide Design'}</h4>
                {showActionForm !== 'unhide' && (
                  <textarea
                    placeholder="Reason for this action (required)..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                  />
                )}
                <div className="form-actions">
                  <button 
                    onClick={() => handleModerate(showActionForm)}
                    disabled={!actionReason && showActionForm !== 'unhide'}
                    className={showActionForm === 'delete' ? 'btn-danger' : showActionForm === 'hide' ? 'btn-warning' : 'btn-success'}
                  >
                    Confirm {showActionForm}
                  </button>
                  <button className="btn-cancel" onClick={() => { setShowActionForm(null); setActionReason(''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {moderation_history && moderation_history.length > 0 && (
              <div className="moderation-history">
                <h4>Moderation History</h4>
                {moderation_history.map(log => (
                  <div key={log.log_id} className="history-item">
                    <span className={`action-tag ${log.action}`}>{log.action}</span>
                    <span className="reason">{log.reason}</span>
                    <span className="date">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignDetailModal;