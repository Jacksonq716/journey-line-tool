import React, { useCallback, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import ImageCarousel from './ImageCarousel'
import EventInfo from './EventInfo'

// 安全的状态更新函数
const safeStateUpdate = (updateFn) => {
  try {
    requestAnimationFrame(() => {
      setTimeout(updateFn, 0)
    })
  } catch (error) {
    console.error('Safe state update failed:', error)
    try {
      updateFn()
    } catch (finalError) {
      console.error('Final state update failed:', finalError)
    }
  }
}

const EventViewModal = ({ 
  showViewModal, 
  viewingEvent, 
  currentImageIndex, 
  setCurrentImageIndex, 
  setShowViewModal, 
  setEditingEvent, 
  setShowEditModal,
  setEvents,
  currentMode
}) => {
  const modalRef = React.useRef(null)
  const isOpenRef = React.useRef(showViewModal)
  
  // 防止DOM操作竞争
  React.useEffect(() => {
    isOpenRef.current = showViewModal
  }, [showViewModal])

  // 重置图片索引当事件改变时
  useEffect(() => {
    if (viewingEvent) {
      setCurrentImageIndex(0)
    }
  }, [viewingEvent, setCurrentImageIndex])

  // 图片预加载优化
  useEffect(() => {
    if (viewingEvent?.images && viewingEvent.images.length > 0) {
      viewingEvent.images.forEach((image, index) => {
        const img = new Image()
        img.src = image.src
        if (index === currentImageIndex) {
          img.loading = 'eager'
        }
      })
    }
  }, [viewingEvent?.images, currentImageIndex])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showViewModal || !viewingEvent?.images || viewingEvent.images.length <= 1) return
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentImageIndex(prevIndex => {
          return prevIndex === 0 ? viewingEvent.images.length - 1 : prevIndex - 1
        })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentImageIndex(prevIndex => {
          return prevIndex === viewingEvent.images.length - 1 ? 0 : prevIndex + 1
        })
      } else if (e.key === 'Escape') {
        setShowViewModal(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showViewModal, viewingEvent?.images, setShowViewModal, setCurrentImageIndex])

  // 图片切换处理函数
  const handleImageChange = useCallback((newIndex) => {
    setCurrentImageIndex(newIndex)
  }, [setCurrentImageIndex])

  const handlePrevImage = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(prevIndex => {
      if (!viewingEvent?.images || viewingEvent.images.length <= 1) return prevIndex
      return prevIndex === 0 ? viewingEvent.images.length - 1 : prevIndex - 1
    })
  }, [viewingEvent?.images, setCurrentImageIndex])

  const handleNextImage = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(prevIndex => {
      if (!viewingEvent?.images || viewingEvent.images.length <= 1) return prevIndex
      return prevIndex === viewingEvent.images.length - 1 ? 0 : prevIndex + 1
    })
  }, [viewingEvent?.images, setCurrentImageIndex])

  const handleEdit = useCallback(() => {
    if (!isOpenRef.current) return
    safeStateUpdate(() => {
      setShowViewModal(false)
      setEditingEvent(viewingEvent)
      setShowEditModal(true)
    })
  }, [viewingEvent, setShowViewModal, setEditingEvent, setShowEditModal])
  
  const handleDelete = useCallback(() => {
    if (!isOpenRef.current) return
    if (window.confirm('Are you sure you want to delete this event?')) {
      safeStateUpdate(() => {
        setEvents(prev => prev.filter(event => event.id !== viewingEvent.id))
        setShowViewModal(false)
      })
    }
  }, [viewingEvent, setEvents, setShowViewModal])

  if (!showViewModal || !viewingEvent) return null

  return (
    <div className="modal-overlay" onClick={() => setShowViewModal(false)} style={{isolation: 'isolate', contain: 'layout style paint'}}>
      <div className="event-view-modal" onClick={(e) => e.stopPropagation()} style={{isolation: 'isolate'}} ref={modalRef}>
        <button className="floating-close-btn" onClick={() => setShowViewModal(false)}>
          <X size={20} />
        </button>
        
        <div className="modal-body view-body">
          <div className="view-content-wrapper">
            <div className="view-left">
              <ImageCarousel 
                images={viewingEvent.images}
                currentIndex={currentImageIndex}
                onPrevious={handlePrevImage}
                onNext={handleNextImage}
                onIndexChange={handleImageChange}
              />
            </div>
            
            <EventInfo 
              event={viewingEvent}
              onEdit={currentMode === 'edit' ? handleEdit : null}
              onDelete={currentMode === 'edit' ? handleDelete : null}
              currentMode={currentMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventViewModal