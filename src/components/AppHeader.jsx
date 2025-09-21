import React from 'react'
import { Share2, Download, MousePointer2, ZoomOut, Check } from 'lucide-react'

const AppHeader = React.memo(({ events, resetToOverview, isCompleted, onComplete }) => {
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
        {isCompleted ? (
          <button className="btn btn-primary">
            <Share2 size={16} />
            Share
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={onComplete}
            disabled={events.length < 2}
          >
            <Check size={16} />
            Complete
          </button>
        )}
        <button className="btn btn-secondary">
          <Download size={16} />
          Export
        </button>
      </div>
    </header>
  )
})

export const CanvasInstructions = React.memo(({ isCompleted }) => {
  return (
    <div className="instructions">
      {isCompleted ? (
        <p style={{ color: '#10b981', fontWeight: '500' }}>✨ Journey completed! Your timeline is ready to share.</p>
      ) : (
        <p><MousePointer2 size={14} /> Click within the chart area to add events</p>
      )}
    </div>
  )
})

export default AppHeader