import React, { useState } from 'react'
import { Eye, Edit, ArrowRight } from 'lucide-react'

const AccessModeModal = ({ isOpen, onClose, onModeSelect, isLoading, error }) => {
  const handleModeSelect = (mode) => {
    onModeSelect(mode, '')
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" style={{ isolation: 'isolate' }}>
      <div className="access-mode-modal">
        <div className="access-header">
          <h3>Choose Access Mode</h3>
          <p>How would you like to access this timeline?</p>
        </div>

        <div className="access-content">
          <div className="mode-options">
            <div 
              className="mode-option"
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
              className="mode-option"
              onClick={() => handleModeSelect('edit')}
            >
              <div className="mode-icon">
                <Edit size={24} />
              </div>
              <div className="mode-info">
                <h4>Edit Mode</h4>
                <p>Full editing permissions (if available)</p>
              </div>
              <ArrowRight size={16} className="mode-arrow" />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccessModeModal