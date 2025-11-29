import React, { useState, useEffect } from 'react';
import { useReactFlow } from 'reactflow';

const DraggableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
  animated,
}) => {
  const { setEdges } = useReactFlow();
  const [hoverState, setHoverState] = useState({ vertical: false, horizontal1: false, horizontal2: false });
  const [dragState, setDragState] = useState(null);

  // Get stored offsets
  const savedOffsetX = data?.offsetX || 0;
  const savedOffsetY1 = data?.offsetY1 || 0;
  const savedOffsetY2 = data?.offsetY2 || 0;

  // Current offsets (from drag or saved)
  const currentOffsetX = dragState?.type === 'vertical' ? dragState.currentOffset : savedOffsetX;
  const currentOffsetY1 = dragState?.type === 'horizontal1' ? dragState.currentOffset : savedOffsetY1;
  const currentOffsetY2 = dragState?.type === 'horizontal2' ? dragState.currentOffset : savedOffsetY2;

  // Determine if this edge needs offsets (when source and target are not aligned)
  const needsOffset = Math.abs(sourceX - targetX) > 5;

  // Calculate path points
  const baseY1 = sourceY + 20;
  const baseY2 = targetY - 20;
  
  const verticalLineX = sourceX + currentOffsetX;
  const horizontalY1 = baseY1 + currentOffsetY1;
  const horizontalY2 = baseY2 + currentOffsetY2;

  let edgePath;
  if (needsOffset) {
    edgePath = `
      M ${sourceX} ${sourceY}
      L ${sourceX} ${horizontalY1}
      L ${verticalLineX} ${horizontalY1}
      L ${verticalLineX} ${horizontalY2}
      L ${targetX} ${horizontalY2}
      L ${targetX} ${targetY}
    `;
  } else {
    edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  }

  // Calculate handle positions
  const verticalHandleY = (horizontalY1 + horizontalY2) / 2;
  const horizontal1HandleX = (sourceX + verticalLineX) / 2;
  const horizontal2HandleX = (verticalLineX + targetX) / 2;

  const isDragging = dragState !== null;

  // Global mouse/touch move and up handlers
  useEffect(() => {
    if (!dragState) return;

    const handleMove = (e) => {
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      let delta;
      if (dragState.type === 'vertical') {
        delta = clientX - dragState.startPos;
      } else {
        delta = clientY - dragState.startPos;
      }
      
      const newOffset = dragState.startOffset + delta;
      setDragState(prev => prev ? { ...prev, currentOffset: newOffset } : null);
    };

    const handleUp = () => {
      if (dragState) {
        const updateKey = dragState.type === 'vertical' ? 'offsetX' : 
                         dragState.type === 'horizontal1' ? 'offsetY1' : 'offsetY2';
        
        setEdges((edges) =>
          edges.map((edge) => {
            if (edge.id === id) {
              return {
                ...edge,
                data: { ...edge.data, [updateKey]: dragState.currentOffset },
              };
            }
            return edge;
          })
        );
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragState, id, setEdges]);

  // Start dragging
  const handleDragStart = (type, startOffset) => (e) => {
    if (!needsOffset) return;
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const startPos = type === 'vertical' ? clientX : clientY;
    
    setDragState({
      type,
      startPos,
      startOffset,
      currentOffset: startOffset,
    });
  };

  // Render a drag handle
  const renderHandle = (type, x, y, isHorizontal = false) => {
    const isActive = hoverState[type] || (dragState?.type === type);
    const cursor = isHorizontal ? 'ns-resize' : 'ew-resize';
    const savedOffset = type === 'vertical' ? savedOffsetX : 
                       type === 'horizontal1' ? savedOffsetY1 : savedOffsetY2;

    return (
      <>
        {/* Highlight line - fades in/out */}
        {isHorizontal ? (
          <line
            x1={type === 'horizontal1' ? sourceX + 10 : verticalLineX + 10}
            y1={y}
            x2={type === 'horizontal1' ? verticalLineX - 10 : targetX - 10}
            y2={y}
            stroke="#3b82f6"
            strokeWidth={10}
            strokeLinecap="round"
            style={{
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.15s ease',
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <line
            x1={x}
            y1={horizontalY1 + 10}
            x2={x}
            y2={horizontalY2 - 10}
            stroke="#3b82f6"
            strokeWidth={10}
            strokeLinecap="round"
            style={{
              opacity: isActive ? 1 : 0,
              transition: 'opacity 0.15s ease',
              filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* HTML drag handle - invisible hitbox always present, visible handle only on hover */}
        <foreignObject
          x={x - 45}
          y={y - 35}
          width={90}
          height={70}
          style={{ overflow: 'visible', pointerEvents: 'all' }}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              width: '90px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: cursor,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              background: 'transparent',
              position: 'relative',
            }}
            className="nodrag nopan"
            onMouseEnter={() => setHoverState(prev => ({ ...prev, [type]: true }))}
            onMouseLeave={() => !dragState && setHoverState(prev => ({ ...prev, [type]: false }))}
            onMouseDown={handleDragStart(type, savedOffset)}
            onTouchStart={handleDragStart(type, savedOffset)}
          >
            {/* Visible handle - only show when hovering or dragging */}
            <div
              style={{
                width: isHorizontal ? '50px' : '36px',
                height: isHorizontal ? '36px' : '50px',
                borderRadius: '18px',
                backgroundColor: '#3b82f6',
                border: '3px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                flexDirection: isHorizontal ? 'column' : 'row',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.5)',
                cursor: cursor,
                opacity: isActive ? 1 : 0,
                transition: 'opacity 0.15s ease',
                pointerEvents: 'none',
              }}
            >
              {/* Grip lines */}
              <div style={{
                width: isHorizontal ? '22px' : '4px',
                height: isHorizontal ? '4px' : '22px',
                backgroundColor: '#fff',
                borderRadius: '2px',
              }} />
              <div style={{
                width: isHorizontal ? '22px' : '4px',
                height: isHorizontal ? '4px' : '22px',
                backgroundColor: '#fff',
                borderRadius: '2px',
              }} />
            </div>
          </div>
        </foreignObject>

        {/* Arrow indicators - fades in/out */}
        {isHorizontal ? (
          <>
            <path
              d={`M ${x} ${y - 35} l -9 -12 l 18 0 z`}
              fill="#3b82f6"
              style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.15s ease', pointerEvents: 'none' }}
            />
            <path
              d={`M ${x} ${y + 35} l -9 12 l 18 0 z`}
              fill="#3b82f6"
              style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.15s ease', pointerEvents: 'none' }}
            />
          </>
        ) : (
          <>
            <path
              d={`M ${x - 35} ${y} l -12 -9 l 0 18 z`}
              fill="#3b82f6"
              style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.15s ease', pointerEvents: 'none' }}
            />
            <path
              d={`M ${x + 35} ${y} l 12 -9 l 0 18 z`}
              fill="#3b82f6"
              style={{ opacity: isActive ? 1 : 0, transition: 'opacity 0.15s ease', pointerEvents: 'none' }}
            />
          </>
        )}
      </>
    );
  };

  return (
    <g>
      {/* Main edge path */}
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          fill: 'none',
        }}
        className={`react-flow__edge-path ${animated ? 'animated' : ''}`}
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Animated dash overlay for jump edges */}
      {animated && (
        <path
          style={{
            ...style,
            strokeWidth: 2,
            fill: 'none',
            strokeDasharray: '5,5',
          }}
          d={edgePath}
        />
      )}

      {/* Draggable handles for offset edges */}
      {needsOffset && (
        <>
          {/* Vertical line handle (drag left/right) */}
          {renderHandle('vertical', verticalLineX, verticalHandleY, false)}
          
          {/* Top horizontal line handle (drag up/down) */}
          {Math.abs(sourceX - verticalLineX) > 30 && 
            renderHandle('horizontal1', horizontal1HandleX, horizontalY1, true)}
          
          {/* Bottom horizontal line handle (drag up/down) */}
          {Math.abs(verticalLineX - targetX) > 30 && 
            renderHandle('horizontal2', horizontal2HandleX, horizontalY2, true)}
        </>
      )}
    </g>
  );
};

export default DraggableEdge;

