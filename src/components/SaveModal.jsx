import React, { useState } from 'react'
import { Copy, Check, Save, Link, Eye } from 'lucide-react'

const SaveModal = ({ isOpen, onClose, saveData, onSave, isSaving }) => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(saveData?.shareUrl || '')
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleSave = () => {
    if (isSaving) return
    onSave()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="save-modal" onClick={e => e.stopPropagation()}>
        <div className="save-header">
          <h3>
            <Save size={20} />
            Save Your Progress
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="save-content">
          {!saveData ? (
            <div className="save-save-section">
              <div className="save-info">
                <p>Save and share your timeline with others:</p>
                <ul>
                  <li><Link size={16} /> Shareable link - Anyone can view and edit</li>
                  <li><Eye size={16} /> Full access - No password required</li>
                </ul>
                <div className="save-note">
                  <p><strong>Note:</strong> This link allows anyone to view and edit your timeline.</p>
                </div>
              </div>
              
              <div className="save-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save & Share'}
                </button>
              </div>
            </div>
          ) : (
            <div className="save-result-section">
              <div className="save-item">
                <label>Share Link</label>
                <div className="save-input-group">
                  <input 
                    type="text" 
                    value={saveData.shareUrl} 
                    readOnly 
                    className="save-input"
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="save-desc">Anyone with this link can view and edit your timeline</p>
              </div>

              <div className="save-warning">
                <Save size={16} />
                <p>Bookmark this link to access your timeline later!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SaveModal