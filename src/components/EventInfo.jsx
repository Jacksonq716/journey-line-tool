import React from 'react'
import { Calendar, Edit, Trash2 } from 'lucide-react'
import { iconLibrary } from '../constants/iconLibrary.jsx'

const EventInfo = React.memo(({ event, onEdit, onDelete, currentMode }) => {
  const IconComponent = iconLibrary[event.icon]?.component || (() => <div className="icon-circle" />)
  
  return (
    <div className="view-right">
      <div className="view-info">
        <div className="view-header">
          <div className="event-icon">
            {event.icon === 'circle' ? 
              <div className="icon-circle" /> : 
              <IconComponent size={20} />
            }
          </div>
          <h2>{event.title}</h2>
        </div>
        
        {event.date && (
          <div className="view-date">
            <Calendar size={16} className="date-icon" />
            <span>{event.date}</span>
          </div>
        )}
        
        {(event.texts && event.texts.length > 0) ? (
          <div className="view-text">
            {event.texts.map((text) => (
              <div key={text.id}>{text.content}</div>
            ))}
          </div>
        ) : (
          <div className="view-text default-text">
            <div>This seems to be a mysterious journey</div>
          </div>
        )}
      </div>
      
      <div className="view-actions">
        {currentMode === 'edit' ? (
          <>
            <button className="edit-btn" onClick={onEdit}>
              <Edit size={16} />
              Edit Event
            </button>
            {onDelete && (
              <button className="delete-btn" onClick={onDelete}>
                <Trash2 size={16} />
                Delete Event
              </button>
            )}
          </>
        ) : (
          <div className="view-mode-info">
            <p>View-only mode</p>
          </div>
        )}
      </div>
    </div>
  )
})

EventInfo.displayName = 'EventInfo'

export default EventInfo