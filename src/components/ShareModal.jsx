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

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(shareData?.password || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
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
                <p>After saving, you will get:</p>
                <ul>
                  <li><Eye size={16} /> Share link - Others can view your timeline</li>
                  <li><Lock size={16} /> 4-digit edit password - Protect your editing rights</li>
                </ul>
              </div>
              
              <div className="save-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={onSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save and Generate Share Link'}
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
                <p className="share-desc">Anyone can view your timeline through this link</p>
              </div>

              <div className="share-item">
                <label>Edit Password</label>
                <div className="share-input-group">
                  <input 
                    type="text" 
                    value={shareData.password} 
                    readOnly 
                    className="share-input password-input"
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCopyPassword}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="share-desc">Enter this password to edit the timeline</p>
              </div>

              <div className="share-warning">
                <Lock size={16} />
                <p>Please keep the edit password safe, it cannot be recovered if lost!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShareModal