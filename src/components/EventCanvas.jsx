import React from 'react'
import { Stage, Layer, Line, Circle, Text, Group } from 'react-konva'
import { iconLibrary, getIconSymbol } from '../constants/iconLibrary.jsx'

const EventCanvas = React.memo(({ 
  events,
  setEvents,
  stagePosition,
  isDragging,
  setIsDragging,
  hoveredEvent,
  setHoveredEvent,
  hoverTimeout,
  setHoverTimeout,
  selectedEvent,
  setSelectedEvent,
  setEditingEvent,
  setShowEditModal,
  setCurrentImageIndex,
  setViewingEvent,
  setShowViewModal,
  setDetailEvent,
  setShowEventDetail,
  stageRef,
  handleStageClick,
  handleWheel,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  AXIS_COLOR,
  POINT_COLOR,
  POINT_HOVER_COLOR,
  isCompleted,
  currentMode
}) => {
  return (
    <div style={{ isolation: 'isolate', position: 'relative' }}>
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleStageClick}
        onWheel={handleWheel}
        draggable={false}
        style={{ display: 'block' }}
      >
      <Layer>
        <Line
          points={[100, CANVAS_HEIGHT/2, CANVAS_WIDTH, CANVAS_HEIGHT/2]}
          stroke={AXIS_COLOR}
          strokeWidth={1}
        />
        <Line
          points={[100, 60, 100, CANVAS_HEIGHT - 60]}
          stroke={AXIS_COLOR}
          strokeWidth={1}
        />
        
        <Text
          x={30}
          y={75}
          text="Achievement"
          fontSize={12}
          fill="#999"
        />
        <Text
          x={30}
          y={CANVAS_HEIGHT - 80}
          text="Challenge"
          fontSize={12}
          fill="#999"
        />
        
        {events.map((event) => {
          const IconComponent = iconLibrary[event.icon]?.component || (() => <div className="icon-circle" />)
          const rawX = event.x + stagePosition.x
          const displayX = rawX
          
          const fadeZoneStart = 170
          const fadeZoneEnd = 100
          let opacity = 1
          
          if (rawX < fadeZoneStart) {
            if (rawX <= fadeZoneEnd) {
              opacity = 0
            } else {
              opacity = (rawX - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd)
            }
          }
          
          // 查找连线目标
          const targetEvent = event.animatingTo ? events.find(e => e.id === event.animatingTo) : null
          
          const handleEventClick = () => {
            if (event.isNew) {
              setSelectedEvent(event)
              setEditingEvent(event)
              setShowEditModal(true)
            } else {
              setCurrentImageIndex(0)
              setViewingEvent(event)
              setShowViewModal(true)
            }
          }
          
          const handleEventDoubleClick = () => {
            setEvents(prev => prev.filter(e => e.id !== event.id))
            if (selectedEvent && selectedEvent.id === event.id) {
              setSelectedEvent(null)
            }
          }
          
          const handleDragStart = () => {
            // 查看模式下禁用拖拽
            if (currentMode === 'view') return
            
            setIsDragging(true)
            const stage = stageRef.current
            if (stage) {
              stage.container().style.cursor = 'grabbing'
            }
          }
          
          const handleDragMove = (e) => {
            // 查看模式下禁用拖拽
            if (currentMode === 'view') return
            
            const newX = e.target.x() - stagePosition.x
            const newY = e.target.y()
            
            const validYMin = 80
            const validYMax = CANVAS_HEIGHT - 80
            const minX = 120
            
            const constrainedX = Math.max(minX, newX)
            const constrainedY = Math.max(validYMin, Math.min(validYMax, newY))
            
            setEvents(prev => prev.map(e => 
              e.id === event.id 
                ? { ...e, x: constrainedX, y: constrainedY }
                : e
            ))
            
            e.target.x(constrainedX + stagePosition.x)
            e.target.y(constrainedY)
          }
          
          const handleDragEnd = () => {
            const stage = stageRef.current
            if (stage) {
              stage.container().style.cursor = 'default'
            }
            setTimeout(() => setIsDragging(false), 50)
          }
          
          const handleMouseEnter = (e) => {
            e.target.getStage().container().style.cursor = 'grab'
            setHoveredEvent(event.id)
            
            const timeout = setTimeout(() => {
              setDetailEvent(event)
              setShowEventDetail(true)
            }, 2000)
            setHoverTimeout(timeout)
          }
          
          const handleMouseLeave = (e) => {
            e.target.getStage().container().style.cursor = 'default'
            setHoveredEvent(null)
            
            if (hoverTimeout) {
              clearTimeout(hoverTimeout)
              setHoverTimeout(null)
            }
          }
          
          return (
            <Group key={event.id}>
              {/* 连线显示 - 简化版本 */}
              {targetEvent && (
                <Group>
                  <Line
                    points={[
                      displayX + 25, event.y,  // 起点，留白25px
                      targetEvent.x + stagePosition.x - 25, targetEvent.y  // 终点，留白25px
                    ]}
                    stroke="#333"
                    strokeWidth={4}
                    opacity={opacity}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.4}
                    perfectDrawEnabled={false}
                    shadowColor="rgba(0,0,0,0.1)"
                    shadowBlur={2}
                    shadowOffset={{ x: 1, y: 1 }}
                  />
                </Group>
              )}
              
              {event.icon === 'circle' && (
                <Circle
                  x={displayX}
                  y={event.y}
                  radius={hoveredEvent === event.id ? 18 : 15}
                  fill="white"
                  stroke={hoveredEvent === event.id ? POINT_HOVER_COLOR : POINT_COLOR}
                  strokeWidth={2}
                  opacity={opacity}
                  draggable={currentMode === 'edit'}
                  onClick={handleEventClick}
                  onDblClick={handleEventDoubleClick}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  scaleX={event.isNew ? 0 : 1}
                  scaleY={event.isNew ? 0 : 1}
                />
              )}
              
              {event.icon !== 'circle' && (
                <Text
                  x={displayX}
                  y={event.y}
                  text={getIconSymbol(event.icon)}
                  fontSize={hoveredEvent === event.id ? 36 : 30}
                  fill={hoveredEvent === event.id ? POINT_HOVER_COLOR : POINT_COLOR}
                  align="center"
                  verticalAlign="middle"
                  offsetX={hoveredEvent === event.id ? 18 : 15}
                  offsetY={hoveredEvent === event.id ? 18 : 15}
                  opacity={opacity}
                  draggable={currentMode === 'edit'}
                  onClick={handleEventClick}
                  onDblClick={handleEventDoubleClick}
                  onDragStart={handleDragStart}
                  onDragMove={handleDragMove}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  scaleX={event.isNew ? 0 : 1}
                  scaleY={event.isNew ? 0 : 1}
                />
              )}
              
              <Text
                x={displayX}
                y={event.y + (hoveredEvent === event.id ? 23 : 20)}
                text={event.title}
                fontSize={12}
                fill={POINT_COLOR}
                align="center"
                width={100}
                offsetX={50}
                listening={false}
                wrap="char"
                opacity={opacity}
              />
            </Group>
          )
        })}  
      </Layer>
    </Stage>
    </div>
  )
})

export default EventCanvas