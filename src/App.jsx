import React, { useCallback } from 'react'
import AppHeader, { CanvasInstructions } from './components/AppHeader'
import EventCanvas from './components/EventCanvas'
import EventEditModal from './components/EventEditModal'
import EventViewModal from './components/EventViewModal'
import EventDetailTooltip from './components/EventDetailTooltip'
import ShareModal from './components/ShareModal'
import SaveModal from './components/SaveModal'
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
  const [showSaveModal, setShowSaveModal] = React.useState(false)
  const [showAccessModal, setShowAccessModal] = React.useState(false)
  const [shareData, setShareData] = React.useState(null)
  const [saveData, setSaveData] = React.useState(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isSharing, setIsSharing] = React.useState(false)
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
    const mode = urlParams.get('mode') || 'view'
    
    if (shareId) {
      setCurrentProjectId(shareId)
      // 如果指定了模式且为编辑模式，显示访问模式选择
      if (mode === 'edit') {
        setShowAccessModal(true)
      } else {
        // 直接以查看模式加载
        handleModeSelect('view', '')
      }
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
    
    // 防止重复点击
    if (isCompleted) return
    
    setIsAnimating(true)
    
    try {
      // 按X坐标排序事件
      const sortedEvents = [...events].sort((a, b) => a.x - b.x)
      
      // 为每个连线添加动画
      for (let i = 0; i < sortedEvents.length - 1; i++) {
        // 检查是否被中断
        if (isCompleted) break
        
        const currentEvent = sortedEvents[i]
        const nextEvent = sortedEvents[i + 1]
        
        // 为每条线添加动画标识
        setEvents(prev => {
          // 防止状态已经改变
          if (prev.length === 0) return prev
          return prev.map(e => 
            e.id === currentEvent.id ? { ...e, animatingTo: nextEvent.id } : e
          )
        })
        
        // 等待动画完成
        await new Promise(resolve => setTimeout(resolve, 800))
      }
      
      // 检查是否被中断
      if (isCompleted) return
      
      // 设置完成状态 - 移除所有动画
      setTimeout(() => {
        setIsCompleted(true)
        setIsAnimating(false)
        
        // 确保events状态保持完整，防止画布变白
        setEvents(prev => {
          if (prev.length === 0) return prev
          return prev.map(e => ({ ...e, isAnimated: true }))
        })
      }, 500)
    } catch (error) {
      console.error('Complete animation failed:', error)
      setIsAnimating(false)
    }
  }, [events, isAnimating, isCompleted])
  

  
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

  // 保存进度（可编辑）
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
        setSaveData(result)
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

  // 分享功能（只读）
  const handleShareProject = useCallback(async () => {
    setIsSharing(true)
    try {
      const projectData = {
        title: 'My Journey Timeline',
        events: events,
        settings: { stagePosition },
        isCompleted: isCompleted
      }
      
      const result = await dataManager.shareProject(projectData)
      
      if (result.success) {
        setShareData(result)
      } else {
        alert('Share failed: ' + result.error)
      }
    } catch (error) {
      alert('Share failed: ' + error.message)
    } finally {
      setIsSharing(false)
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
  
  // 保存功能
  const handleSaveClick = useCallback(() => {
    setShowSaveModal(true)
  }, [])

  return (
    <div className={`app ${isCompleted ? 'completed' : ''}`}>
      <AppHeader 
        events={events} 
        resetToOverview={resetToOverview} 
        isCompleted={isCompleted}
        onComplete={handleComplete}
        onShare={handleShare}
        onSave={handleSaveClick}
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
          onSave={handleShareProject}
          isSaving={isSharing}
        />
        
        <SaveModal 
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          saveData={saveData}
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