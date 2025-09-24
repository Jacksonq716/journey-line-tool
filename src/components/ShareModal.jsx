import React, { useState } from 'react'
import { Copy, Check, Share2, Lock, Eye } from 'lucide-react'

const ShareModal = ({ isOpen, onClose, shareData, onSave, isSaving }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData?.shareUrl || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} style={{ isolation: 'isolate' }}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-header">
          <h3>
            <Share2 size={20} />
            Share Your Timeline
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="share-content">
          {!shareData ? (
            <div className="share-save-section">
              <div className="save-info">
                <p>Share your completed timeline:</p>
                <ul>
                  <li><Eye size={16} /> Share link - Others can view your timeline</li>
                  <li><Lock size={16} /> Read-only access - No editing allowed</li>
                </ul>
              </div>
              
              <div className="save-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={onSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Generating...' : 'Generate Share Link'}
                </button>
              </div>
            </div>
          ) : (
            <div className="share-result-section">
              <div className="share-item">
                <label>Share Link</label>
                <div className="share-input-group">
                  <input 
                    type="text" 
                    value={shareData.shareUrl} 
                    readOnly 
                    className="share-input"
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="share-desc">Anyone can view your timeline through this link (read-only)</p>
              </div>

              <div className="share-warning">
                <Eye size={16} />
                <p>This link provides read-only access to your timeline!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShareModal