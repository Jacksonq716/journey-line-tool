import React, { useState } from 'react'
import { Eye, Edit, Lock, ArrowRight } from 'lucide-react'

const AccessModeModal = ({ isOpen, onClose, onModeSelect, isLoading, error }) => {
  const [selectedMode, setSelectedMode] = useState(null)
  const [password, setPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)

  const handleModeSelect = (mode) => {
    setSelectedMode(mode)
    if (mode === 'edit') {
      setShowPasswordInput(true)
    } else {
      onModeSelect(mode, '')
    }
  }

  const handlePasswordSubmit = () => {
    if (password.length === 4) {
      onModeSelect('edit', password)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && password.length === 4) {
      handlePasswordSubmit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="access-mode-modal">
        <div className="access-header">
          <h3>Choose Access Mode</h3>
          <p>How would you like to access this timeline?</p>
        </div>

        <div className="access-content">
          {!showPasswordInput ? (
            <div className="mode-options">
              <div 
                className={`mode-option ${selectedMode === 'view' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('view')}
              >
                <div className="mode-icon">
                  <Eye size={24} />
                </div>
                <div className="mode-info">
                  <h4>View Mode</h4>
                  <p>Browse timeline content, read-only access</p>
                </div>
                <ArrowRight size={16} className="mode-arrow" />
              </div>

              <div 
                className={`mode-option ${selectedMode === 'edit' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('edit')}
              >
                <div className="mode-icon">
                  <Edit size={24} />
                </div>
                <div className="mode-info">
                  <h4>Edit Mode</h4>
                  <p>Full editing permissions, password required</p>
                </div>
                <ArrowRight size={16} className="mode-arrow" />
              </div>
            </div>
          ) : (
            <div className="password-section">
              <div className="password-header">
                <Lock size={20} />
                <h4>Enter Edit Password</h4>
              </div>
              
              <div className="password-input-group">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.toUpperCase().slice(0, 4))}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter 4-digit code"
                  className="password-input"
                  maxLength={4}
                  autoFocus
                />
                <button 
                  className="btn btn-primary"
                  onClick={handlePasswordSubmit}
                  disabled={password.length !== 4 || isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Enter'}
                </button>
              </div>

              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}

              <button 
                className="btn btn-secondary back-btn"
                onClick={() => {
                  setShowPasswordInput(false)
                  setPassword('')
                  setSelectedMode(null)
                }}
              >
                Back to Mode Selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccessModeModal