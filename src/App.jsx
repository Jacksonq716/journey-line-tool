import React, { useCallback } from 'react'
import AppHeader, { CanvasInstructions } from './components/AppHeader'
import EventCanvas from './components/EventCanvas'
import EventEditModal from './components/EventEditModal'
import EventViewModal from './components/EventViewModal'
import EventDetailTooltip from './components/EventDetailTooltip'
import './App.css'

function App() {
  // 应用状态管理
  const [events, setEvents] = React.useState([])
  const [selectedEvent, setSelectedEvent] = React.useState(null)
  const [editingEvent, setEditingEvent] = React.useState(null)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showViewModal, setShowViewModal] = React.useState(false)
  const [viewingEvent, setViewingEvent] = React.useState(null)
  const [stagePosition, setStagePosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [hoveredEvent, setHoveredEvent] = React.useState(null)
  const [showEventDetail, setShowEventDetail] = React.useState(false)
  const [detailEvent, setDetailEvent] = React.useState(null)
  const [hoverTimeout, setHoverTimeout] = React.useState(null)
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const stageRef = React.useRef()
  
  // 画布配置常量
  const CANVAS_WIDTH = window.innerWidth - 100
  const CANVAS_HEIGHT = window.innerHeight - 200
  const AXIS_COLOR = '#e5e5e5'
  const GRID_COLOR = '#f5f5f5'
  const LINE_COLOR = '#000'
  const POINT_COLOR = '#000'
  const POINT_HOVER_COLOR = '#666'

  // 添加新事件点
  const handleStageClick = useCallback((e) => {
    // 如果已完成，禁止添加新事件
    if (isCompleted) {
      return
    }
    
    if (isDragging) {
      return
    }
    
    if (e.target === e.target.getStage()) {
      const stage = e.target.getStage()
      const pointerPos = stage.getPointerPosition()
      
      const canvasX = pointerPos.x - stagePosition.x
      const canvasY = pointerPos.y
      
      const centerX = 100
      const validYMin = 80
      const validYMax = CANVAS_HEIGHT - 80
      
      if (pointerPos.x < centerX || canvasY < validYMin || canvasY > validYMax) {
        return
      }
      
      const newEvent = {
        id: Date.now(),
        x: Math.max(120, canvasX),
        y: canvasY,
        title: 'New Event',
        date: new Date().toISOString().split('T')[0],
        icon: 'circle',
        description: '',
        images: [],
        texts: [],
        recordings: [],
        layout: 'vertical',
        isNew: true
      }
      
      setEvents(prev => [...prev, newEvent])
      setEditingEvent(newEvent)
      setShowEditModal(true)
    }
  }, [stagePosition, CANVAS_HEIGHT, isDragging, isCompleted])

  // 滚轮处理 - 完全自由的水平移动
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault()
    e.evt.stopPropagation()
    
    const moveSpeed = 50
    const deltaX = e.evt.deltaY > 0 ? -moveSpeed : moveSpeed
    
    let newX = stagePosition.x + deltaX
    
    if (deltaX > 0) {
      newX = Math.min(0, newX)
    }
    
    setStagePosition({
      x: newX,
      y: 0
    })
  }, [stagePosition.x])

  // 完成动画处理
  const handleComplete = useCallback(async () => {
    if (events.length < 2 || isAnimating) return
    
    setIsAnimating(true)
    
    // 按X坐标排序事件
    const sortedEvents = [...events].sort((a, b) => a.x - b.x)
    
    // 为每个连线添加动画
    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i]
      const nextEvent = sortedEvents[i + 1]
      
      // 为每条线添加动画标识
      currentEvent.animatingTo = nextEvent.id
      setEvents(prev => prev.map(e => 
        e.id === currentEvent.id ? { ...e, animatingTo: nextEvent.id } : e
      ))
      
      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    // 显示离花动画
    setTimeout(() => {
      showFireworks()
      setIsCompleted(true)
      setIsAnimating(false)
    }, 500)
  }, [events, isAnimating])
  
  // 离花动画
  const showFireworks = () => {
    const fireworksContainer = document.createElement('div')
    fireworksContainer.className = 'fireworks-container'
    document.body.appendChild(fireworksContainer)
    
    // 创建多个离花
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const firework = document.createElement('div')
        firework.className = 'firework'
        firework.style.left = Math.random() * window.innerWidth + 'px'
        firework.style.top = Math.random() * window.innerHeight * 0.5 + 'px'
        fireworksContainer.appendChild(firework)
        
        setTimeout(() => {
          firework.remove()
        }, 2000)
      }, i * 200)
    }
    
    // 清理离花容器
    setTimeout(() => {
      fireworksContainer.remove()
    }, 3000)
  }
  
  // 重置视图到整体视角
  const resetToOverview = useCallback(() => {
    if (events.length === 0) return
    
    const minX = Math.min(...events.map(e => e.x)) - 50
    const maxX = Math.max(...events.map(e => e.x)) + 50
    const centerX = (minX + maxX) / 2
    
    setStagePosition({
      x: CANVAS_WIDTH / 2 - centerX,
      y: 0
    })
  }, [events, CANVAS_WIDTH])

  return (
    <div className="app">
      <AppHeader 
        events={events} 
        resetToOverview={resetToOverview} 
        isCompleted={isCompleted}
        onComplete={handleComplete}
      />
      
      <div className="canvas-container">
        <CanvasInstructions isCompleted={isCompleted} />
        
        <EventCanvas 
          events={events}
          setEvents={setEvents}
          stagePosition={stagePosition}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          hoveredEvent={hoveredEvent}
          setHoveredEvent={setHoveredEvent}
          hoverTimeout={hoverTimeout}
          setHoverTimeout={setHoverTimeout}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          setEditingEvent={setEditingEvent}
          setShowEditModal={setShowEditModal}
          setCurrentImageIndex={setCurrentImageIndex}
          setViewingEvent={setViewingEvent}
          setShowViewModal={setShowViewModal}
          setDetailEvent={setDetailEvent}
          setShowEventDetail={setShowEventDetail}
          stageRef={stageRef}
          handleStageClick={handleStageClick}
          handleWheel={handleWheel}
          CANVAS_WIDTH={CANVAS_WIDTH}
          CANVAS_HEIGHT={CANVAS_HEIGHT}
          AXIS_COLOR={AXIS_COLOR}
          POINT_COLOR={POINT_COLOR}
          POINT_HOVER_COLOR={POINT_HOVER_COLOR}
        />
        
        <EventEditModal 
          showEditModal={showEditModal}
          editingEvent={editingEvent}
          setEvents={setEvents}
          setShowEditModal={setShowEditModal}
          setEditingEvent={setEditingEvent}
        />
        
        <EventViewModal 
          showViewModal={showViewModal}
          viewingEvent={viewingEvent}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          setShowViewModal={setShowViewModal}
          setEditingEvent={setEditingEvent}
          setShowEditModal={setShowEditModal}
          setEvents={setEvents}
        />
        
        <EventDetailTooltip 
          showEventDetail={showEventDetail}
          detailEvent={detailEvent}
          setShowEventDetail={setShowEventDetail}
        />
      </div>
    </div>
  )
}

export default App