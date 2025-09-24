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

// 安全的状态更新函数
const safeStateUpdate = (updateFn) => {
  try {
    // 使用双重保护：requestAnimationFrame + setTimeout
    requestAnimationFrame(() => {
      setTimeout(updateFn, 0)
    })
  } catch (error) {
    console.error('Safe state update failed:', error)
    // 如果还是失败，尝试直接更新
    try {
      updateFn()
    } catch (finalError) {
      console.error('Final state update failed:', finalError)
    }
  }
}

function App() {
  // 全局错误监听，防止DOM操作错误导致崩溃
  React.useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.error && (event.error.message.includes('insertBefore') || event.error.message.includes('removeChild'))) {
        console.warn('Caught DOM operation error, preventing crash:', event.error)
        event.preventDefault()
        return false
      }
    }
    
    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('insertBefore') || event.reason.message.includes('removeChild'))) {
        console.warn('Caught unhandled DOM rejection:', event.reason)
        event.preventDefault()
      }
    }
    
    window.addEventListener('error', handleGlobalError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('error', handleGlobalError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])
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
  
  // 本地存储键名
  const LOCAL_STORAGE_KEY = 'journey-line-tool-current-project'
  
  const stageRef = React.useRef()
  
  // 画布配置常量
  const CANVAS_WIDTH = window.innerWidth - 100
  const CANVAS_HEIGHT = window.innerHeight - 200
  const AXIS_COLOR = '#e5e5e5'
  const GRID_COLOR = '#f5f5f5'
  const LINE_COLOR = '#000'
  const POINT_COLOR = '#000'
  const POINT_HOVER_COLOR = '#666'

  // 处理访问模式选择
  const handleModeSelect = useCallback(async (mode, password) => {
    if (isLoadingProject) return // 防止重复调用
    
    setIsLoadingProject(true)
    setAccessError('')
    
    try {
      const result = await dataManager.loadProject(currentProjectId, null, mode)
      
      if (result.success) {
        // 检查是否允许请求的模式
        if (mode === 'edit' && result.data.type === 'readonly') {
          setAccessError('This timeline is read-only and cannot be edited')
          setIsLoadingProject(false)
          return
        }
        
        // 使用React.startTransition防止DOM操作冲突
        React.startTransition(() => {
          // 先清空状态再加载，防止冲突
          setEvents([])
          setIsCompleted(false)
          
          // 稍微延迟再设置新数据
          setTimeout(() => {
            setEvents(result.data.events || [])
            setIsCompleted(result.data.isCompleted || false)
            setStagePosition(result.data.settings?.stagePosition || { x: 0, y: 0 })
            setCurrentMode(result.mode)
            setCurrentPassword('')
            setShowAccessModal(false)
            
            console.log(`Entered ${result.mode} mode`)
          }, 100)
        })
      } else {
        setAccessError(result.error)
      }
    } catch (error) {
      console.error('Mode select error:', error)
      setAccessError('Loading failed: ' + error.message)
    } finally {
      setIsLoadingProject(false)
    }
  }, [currentProjectId, isLoadingProject])


  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const shareId = urlParams.get('id')
    const mode = urlParams.get('mode') || 'view'
    
    if (shareId) {
      // 有分享链接，优先加载分享数据
      setCurrentProjectId(shareId)
      if (mode === 'edit') {
        // 先尝试直接加载编辑模式
        setTimeout(() => {
          handleModeSelect('edit', '')
        }, 100)
      } else {
        setTimeout(() => {
          handleModeSelect('view', '')
        }, 100)
      }
    } else {
      // 没有分享链接，不自动恢复任何数据，保持空白页面
      console.log('新用户访问，显示空白页面')
      // 清理临时数据（可选）
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY + '_temp')
        localStorage.removeItem(LOCAL_STORAGE_KEY) // 也清理旧的数据
      } catch (error) {
        console.warn('Failed to clear temp storage:', error)
      }
    }
  }, [handleModeSelect])

  // 自动保存到本地存储（仅临时存储，不自动恢复）
  React.useEffect(() => {
    // 只在编辑模式下保存，且不是分享模式，仅作为临时备份
    if (currentMode === 'edit' && !currentProjectId && events.length > 0) {
      const dataToSave = {
        events,
        isCompleted,
        stagePosition,
        lastSaved: new Date().toISOString(),
        isTemporary: true // 标记为临时数据
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY + '_temp', JSON.stringify(dataToSave))
      } catch (error) {
        console.warn('Failed to save to local storage:', error)
      }
    }
  }, [events, isCompleted, stagePosition, currentMode, currentProjectId])

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

  // 完成动画处理 - 最安全版本，防止DOM操作冲突
  const handleComplete = useCallback(() => {
    if (events.length < 2 || isCompleted) return
    
    // 使用安全的状态更新
    safeStateUpdate(() => {
      setIsCompleted(true)
    })
  }, [events.length, isCompleted])
  

  
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
    if (isSaving) return // 防止重复调用
    
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
        // 使用安全的状态更新
        safeStateUpdate(() => {
          setSaveData(result)
          setCurrentProjectId(result.shareId)
          setCurrentPassword('')
        })
      } else {
        alert('Save failed: ' + result.error)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Save failed: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }, [events, stagePosition, isCompleted, isSaving])

  // 分享功能（只读）
  const handleShareProject = useCallback(async () => {
    if (isSharing) return // 防止重复调用
    
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
        // 使用安全的状态更新
        safeStateUpdate(() => {
          setShareData(result)
        })
      } else {
        alert('Share failed: ' + result.error)
      }
    } catch (error) {
      console.error('Share error:', error)
      alert('Share failed: ' + error.message)
    } finally {
      setIsSharing(false)
    }
  }, [events, stagePosition, isCompleted, isSharing])

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