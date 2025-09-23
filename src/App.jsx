import React, { useCallback } from 'react'
import AppHeader, { CanvasInstructions } from './components/AppHeader'
import EventCanvas from './components/EventCanvas'
import EventEditModal from './components/EventEditModal'
import EventViewModal from './components/EventViewModal'
import EventDetailTooltip from './components/EventDetailTooltip'
import ShareModal from './components/ShareModal'
import AccessModeModal from './components/AccessModeModal'
import { dataManager } from './utils/dataManager'
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
  
  // 分享和访问控制状态
  const [showShareModal, setShowShareModal] = React.useState(false)
  const [showAccessModal, setShowAccessModal] = React.useState(false)
  const [shareData, setShareData] = React.useState(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [currentMode, setCurrentMode] = React.useState('edit') // 'edit' 或 'view'
  const [currentProjectId, setCurrentProjectId] = React.useState(null)
  const [currentPassword, setCurrentPassword] = React.useState(null)
  const [accessError, setAccessError] = React.useState('')
  const [isLoadingProject, setIsLoadingProject] = React.useState(false)
  
  const stageRef = React.useRef()
  
  // 画布配置常量
  const CANVAS_WIDTH = window.innerWidth - 100
  const CANVAS_HEIGHT = window.innerHeight - 200
  const AXIS_COLOR = '#e5e5e5'
  const GRID_COLOR = '#f5f5f5'
  const LINE_COLOR = '#000'
  const POINT_COLOR = '#000'
  const POINT_HOVER_COLOR = '#666'

  // 初始化检查URL参数
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const shareId = urlParams.get('id')
    
    if (shareId) {
      setCurrentProjectId(shareId)
      setShowAccessModal(true)
    }
  }, [])

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
    
    try {
      // 按X坐标排序事件
      const sortedEvents = [...events].sort((a, b) => a.x - b.x)
      
      // 为每个连线添加动画
      for (let i = 0; i < sortedEvents.length - 1; i++) {
        const currentEvent = sortedEvents[i]
        const nextEvent = sortedEvents[i + 1]
        
        // 为每条线添加动画标识
        setEvents(prev => prev.map(e => 
          e.id === currentEvent.id ? { ...e, animatingTo: nextEvent.id } : e
        ))
        
        // 等待动画完成
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      
      // 显示烟花动画并设置完成状态
      setTimeout(() => {
        try {
          showFireworks()
        } catch (error) {
          console.warn('Fireworks animation failed:', error)
        }
        
        setIsCompleted(true)
        setIsAnimating(false)
        
        // 确保events状态保持完整，防止画布变白
        setEvents(prev => prev.map(e => ({ ...e, isAnimated: true })))
      }, 500)
    } catch (error) {
      console.error('Complete animation failed:', error)
      setIsAnimating(false)
    }
  }, [events, isAnimating])
  
  // 烟花动画
  const showFireworks = () => {
    // 检查是否已经存在烟花容器，避免重复创建
    let fireworksContainer = document.querySelector('.fireworks-container')
    if (fireworksContainer) {
      try {
        document.body.removeChild(fireworksContainer)
      } catch (error) {
        console.warn('Failed to remove existing fireworks container:', error)
      }
    }
    
    fireworksContainer = document.createElement('div')
    fireworksContainer.className = 'fireworks-container'
    document.body.appendChild(fireworksContainer)
    
    // 创建多个烟花
    const fireworkElements = []
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        // 检查容器是否还存在
        if (!document.body.contains(fireworksContainer)) {
          return
        }
        
        const firework = document.createElement('div')
        firework.className = 'firework'
        firework.style.left = Math.random() * window.innerWidth + 'px'
        firework.style.top = Math.random() * window.innerHeight * 0.5 + 'px'
        
        try {
          fireworksContainer.appendChild(firework)
          fireworkElements.push(firework)
        } catch (error) {
          console.warn('Failed to append firework element:', error)
          return
        }
        
        // 安全地移除单个烟花
        setTimeout(() => {
          if (firework && firework.parentNode === fireworksContainer) {
            try {
              fireworksContainer.removeChild(firework)
            } catch (error) {
              console.warn('Failed to remove firework element:', error)
            }
          }
        }, 2000)
      }, i * 200)
    }
    
    // 安全地清理整个烟花容器
    setTimeout(() => {
      const container = document.querySelector('.fireworks-container')
      if (container && document.body.contains(container)) {
        try {
          document.body.removeChild(container)
        } catch (error) {
          console.warn('Failed to remove fireworks container:', error)
        }
      }
    }, 3500) // 稍微延长一些时间确保所有动画完成
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

  // 保存项目
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const projectData = {
        title: 'My Journey Timeline',
        events: events,
        settings: { stagePosition },
        isCompleted: isCompleted
      }
      
      const result = await dataManager.saveProject(projectData)
      
      if (result.success) {
        setShareData(result)
        setCurrentProjectId(result.shareId)
        setCurrentPassword(result.password)
      } else {
        alert('Save failed: ' + result.error)
      }
    } catch (error) {
      alert('Save failed: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }, [events, stagePosition, isCompleted])

  // 处理访问模式选择
  const handleModeSelect = useCallback(async (mode, password) => {
    setIsLoadingProject(true)
    setAccessError('')
    
    try {
      const result = await dataManager.loadProject(currentProjectId, password, mode)
      
      if (result.success) {
        // 加载项目数据
        setEvents(result.data.events || [])
        setIsCompleted(result.data.isCompleted || false)
        setStagePosition(result.data.settings?.stagePosition || { x: 0, y: 0 })
        setCurrentMode(mode)
        setCurrentPassword(password)
        setShowAccessModal(false)
        
        if (mode === 'view') {
          // 查看模式下隐藏编辑相关功能
          console.log('Entered view mode')
        }
      } else {
        setAccessError(result.error)
      }
    } catch (error) {
      setAccessError('Loading failed: ' + error.message)
    } finally {
      setIsLoadingProject(false)
    }
  }, [currentProjectId])

  // 分享功能
  const handleShare = useCallback(() => {
    if (isCompleted) {
      setShowShareModal(true)
    }
  }, [isCompleted])

  return (
    <div className={`app ${isCompleted ? 'completed' : ''}`}>
      <AppHeader 
        events={events} 
        resetToOverview={resetToOverview} 
        isCompleted={isCompleted}
        onComplete={handleComplete}
        onShare={handleShare}
        currentMode={currentMode}
      />
      
      <div className={`canvas-container ${isCompleted ? 'completed' : ''}`}>
        <CanvasInstructions isCompleted={isCompleted} currentMode={currentMode} />
        
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
          isCompleted={isCompleted}
          isAnimating={isAnimating}
          currentMode={currentMode}
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
          currentMode={currentMode}
        />
        
        <EventDetailTooltip 
          showEventDetail={showEventDetail}
          detailEvent={detailEvent}
          setShowEventDetail={setShowEventDetail}
        />
        
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareData={shareData}
          onSave={handleSave}
          isSaving={isSaving}
        />
        
        <AccessModeModal 
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          onModeSelect={handleModeSelect}
          isLoading={isLoadingProject}
          error={accessError}
        />
      </div>
    </div>
  )
}

export default App