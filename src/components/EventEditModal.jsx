import React from 'react'
import { X, Trash2 } from 'lucide-react'
import { iconLibrary } from '../constants/iconLibrary.jsx'

const EventEditModal = React.memo(({ 
  showEditModal, 
  editingEvent, 
  setEvents, 
  setShowEditModal, 
  setEditingEvent 
}) => {
  const [localEvent, setLocalEvent] = React.useState({ ...editingEvent })
  const [showIconDropdown, setShowIconDropdown] = React.useState(false)
  const modalRef = React.useRef(null)
  const isOpenRef = React.useRef(showEditModal)
  
  // 防止DOM操作竞争
  React.useEffect(() => {
    isOpenRef.current = showEditModal
  }, [showEditModal])

  React.useEffect(() => {
    if (editingEvent) {
      setLocalEvent({ ...editingEvent })
    }
  }, [editingEvent])

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showIconDropdown && !event.target.closest('.custom-icon-dropdown')) {
        setShowIconDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showIconDropdown])

  if (!showEditModal || !editingEvent) return null

  const handleDelete = () => {
    if (!isOpenRef.current) return
    if (window.confirm('确定要删除这个事件吗？')) {
      React.startTransition(() => {
        setEvents(prev => prev.filter(event => event.id !== editingEvent.id))
        setShowEditModal(false)
        setEditingEvent(null)
      })
    }
  }

  const handleSave = () => {
    if (!isOpenRef.current) return
    React.startTransition(() => {
      setEvents(prev => prev.map(event => 
        event.id === localEvent.id ? { ...localEvent, isNew: false } : event
      ))
      setShowEditModal(false)
      setEditingEvent(null)
    })
  }

  const handleCancel = () => {
    if (!isOpenRef.current) return
    if (editingEvent.isNew) {
      React.startTransition(() => {
        setEvents(prev => prev.filter(event => event.id !== editingEvent.id))
      })
    }
    setShowEditModal(false)
    setEditingEvent(null)
  }

  const addTextBlock = () => {
    setLocalEvent(prev => ({
      ...prev,
      texts: [...prev.texts, { id: Date.now(), content: '', style: 'normal' }]
    }))
  }

  const addImageBlock = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from(e.target.files)
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setLocalEvent(prev => ({
            ...prev,
            images: [...prev.images, { id: Date.now() + Math.random(), src: e.target.result, alt: file.name }]
          }))
        }
        reader.readAsDataURL(file)
      })
    }
    input.click()
  }

  return (
    <div className="modal-overlay" onClick={handleCancel} style={{isolation: 'isolate', contain: 'layout style paint'}}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{isolation: 'isolate'}} ref={modalRef}>
        <div className="modal-header">
          <h3>Edit Event</h3>
          <button className="close-btn" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>Event Name</label>
            <input 
              type="text" 
              value={localEvent.title}
              onChange={(e) => setLocalEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event name"
            />
          </div>
          
          <div className="form-group">
            <label>Event Icon</label>
            <div className="custom-icon-dropdown">
              <div 
                className="selected-icon-display"
                onClick={() => setShowIconDropdown(!showIconDropdown)}
              >
                <div className="selected-icon">
                  {localEvent.icon === 'circle' ? (
                    <div className="icon-circle" />
                  ) : (
                    iconLibrary[localEvent.icon]?.component ? 
                      React.createElement(iconLibrary[localEvent.icon].component, { size: 24 }) :
                      <div className="icon-circle" />
                  )}
                </div>
                <span className="selected-text">{iconLibrary[localEvent.icon]?.name || 'Select Icon'}</span>
                <div className="dropdown-arrow">▼</div>
              </div>
              
              {showIconDropdown && (
                <div className="icon-dropdown-grid">
                  {Object.entries(iconLibrary).map(([key, icon]) => {
                    const IconComponent = icon.component
                    return (
                      <div 
                        key={key}
                        className={`icon-grid-item ${localEvent.icon === key ? 'selected' : ''}`}
                        onClick={() => {
                          setLocalEvent(prev => ({ ...prev, icon: key }))
                          setShowIconDropdown(false)
                        }}
                        title={icon.name}
                      >
                        {key === 'circle' ? (
                          <div className="icon-circle" />
                        ) : (
                          IconComponent ? <IconComponent size={20} /> : <div className="icon-circle" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Completion Date</label>
            <input 
              type="date" 
              value={localEvent.date}
              onChange={(e) => setLocalEvent(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          
          <div className="form-group">
            <label>Description (Add Photos & Text)</label>
            <div className="description-editor">
              {/* 图片区域在上方 */}
              {localEvent.images && localEvent.images.map((image, index) => (
                <div key={image.id} className="image-block">
                  <img src={image.src} alt={image.alt} />
                  <button 
                    className="remove-btn"
                    onClick={() => {
                      setLocalEvent(prev => ({
                        ...prev,
                        images: prev.images.filter(img => img.id !== image.id)
                      }))
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {/* 文字区域在下方 */}
              {localEvent.texts && localEvent.texts.map((text, index) => (
                <div key={text.id} className="text-block">
                  <textarea
                    value={text.content}
                    onChange={(e) => {
                      const newTexts = [...localEvent.texts]
                      newTexts[index] = { ...text, content: e.target.value }
                      setLocalEvent(prev => ({ ...prev, texts: newTexts }))
                    }}
                    placeholder="Enter text content..."
                  />
                  <button 
                    className="remove-btn"
                    onClick={() => {
                      setLocalEvent(prev => ({
                        ...prev,
                        texts: prev.texts.filter(t => t.id !== text.id)
                      }))
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <div className="add-buttons">
                <button onClick={addImageBlock} className="add-btn">
                  📷 Upload Image
                </button>
                <button onClick={addTextBlock} className="add-btn">
                  📝 Add Text
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={16} />
            Delete
          </button>
          <div className="modal-footer-right">
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default EventEditModal