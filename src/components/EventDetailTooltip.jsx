import React from 'react'
import { X, Calendar } from 'lucide-react'
import { iconLibrary } from '../constants/iconLibrary.jsx'

const EventDetailTooltip = React.memo(({ 
  showEventDetail, 
  detailEvent, 
  setShowEventDetail 
}) => {
  if (!showEventDetail || !detailEvent) return null
  
  const IconComponent = iconLibrary[detailEvent.icon]?.component || (() => <div className="icon-circle" />)
  
  return (
    <div className="event-detail-tooltip">
      <div className="tooltip-header">
        <div className="tooltip-icon">
          {detailEvent.icon === 'circle' ? <IconComponent /> : <IconComponent size={16} />}
        </div>
        <h4>{detailEvent.title}</h4>
        <button className="close-tooltip" onClick={() => setShowEventDetail(false)}>
          <X size={14} />
        </button>
      </div>
      
      {detailEvent.date && (
        <div className="tooltip-date">
          <Calendar size={12} />
          <span>{detailEvent.date}</span>
        </div>
      )}
      
      {detailEvent.texts && detailEvent.texts.length > 0 && (
        <div className="tooltip-content">
          {detailEvent.texts.map((text) => (
            <p key={text.id}>{text.content}</p>
          ))}
        </div>
      )}
      
      {detailEvent.images && detailEvent.images.length > 0 && (
        <div className="tooltip-images">
          {detailEvent.images.map((image) => (
            <img key={image.id} src={image.src} alt={image.alt} />
          ))}
        </div>
      )}
    </div>
  )
})

export default EventDetailTooltip