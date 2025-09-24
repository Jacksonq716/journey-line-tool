import React, { useState, useRef, useEffect } from 'react'
import { Copy, Check, Save, Link, Eye } from 'lucide-react'

const SaveModal = ({ isOpen, onClose, saveData, onSave, isSaving }) => {
  const [copied, setCopied] = useState(false)
  const modalRef = useRef(null)
  const isOpenRef = useRef(isOpen)
  
  // 防止DOM操作竞争
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  const handleCopyLink = async () => {
    if (!isOpenRef.current) return // 防止在模态框关闭时操作
    try {
      await navigator.clipboard.writeText(saveData?.editUrl || '')
      setCopied(true)
      setTimeout(() => {
        if (isOpenRef.current) {
          setCopied(false)
        }
      }, 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleSave = () => {
    if (!isOpenRef.current || isSaving) return
    onSave()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose} style={{ isolation: 'isolate' }}>
      <div className="save-modal" onClick={e => e.stopPropagation()} ref={modalRef}>
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
                <p>Save your progress to continue editing later:</p>
                <ul>
                  <li><Link size={16} /> Editable link - Continue working on your timeline</li>
                  <li><Eye size={16} /> Full editing access - No password required</li>
                </ul>
                <div className="save-note">
                  <p><strong>Note:</strong> This link allows you to continue editing your timeline anytime.</p>
                </div>
              </div>
              
              <div className="save-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </div>
          ) : (
            <div className="save-result-section">
              <div className="save-item">
                <label>Editable Link</label>
                <div className="save-input-group">
                  <input 
                    type="text" 
                    value={saveData.editUrl} 
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
                <p className="save-desc">Use this link to continue editing your timeline anytime</p>
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