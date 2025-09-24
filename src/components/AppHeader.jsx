import React from 'react'
import { Share2, Download, MousePointer2, ZoomOut, Check, Save } from 'lucide-react'

const AppHeader = React.memo(({ events, resetToOverview, isCompleted, onComplete, onShare, onSave, currentMode }) => {
  return (
    <header className="app-header">
      <h1>Journey Line Tool</h1>
      <div className="toolbar">
        {events.length > 1 && (
          <button className="btn btn-secondary" onClick={resetToOverview}>
            <ZoomOut size={16} />
            Overview
          </button>
        )}
        
        {/* 保存按钮 - 生成可编辑链接 */}
        {currentMode === 'edit' && events.length > 0 && (
          <button className="btn btn-secondary" onClick={onSave}>
            <Save size={16} />
            Save Progress
          </button>
        )}
        
        {isCompleted ? (
          <button className="btn btn-primary" onClick={onShare}>
            <Share2 size={16} />
            Share
          </button>
        ) : (
          currentMode === 'edit' && (
            <button 
              className="btn btn-primary" 
              onClick={onComplete}
              disabled={events.length < 2}
            >
              <Check size={16} />
              Complete
            </button>
          )
        )}
        
        <button className="btn btn-secondary">
          <Download size={16} />
          Export
        </button>
      </div>
    </header>
  )
})

export const CanvasInstructions = React.memo(({ isCompleted, currentMode }) => {
  return (
    <div className="instructions">
      {isCompleted ? (
        <p style={{ color: '#10b981', fontWeight: '500' }}>✨ Journey completed! Your timeline is ready to share.</p>
      ) : currentMode === 'view' ? (
        <p style={{ color: '#6b7280', fontWeight: '500' }}>👁️ View mode - Click events to explore</p>
      ) : (
        <p><MousePointer2 size={14} /> Click within the chart area to add events</p>
      )}
    </div>
  )
})

export default AppHeader