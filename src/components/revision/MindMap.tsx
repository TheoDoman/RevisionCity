'use client';

import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MindMap, MindMapNode } from '@/types';

interface MindMapViewerProps {
  mindMap: MindMap;
}

interface NodePosition {
  x: number;
  y: number;
}

export function MindMapViewer({ mindMap }: MindMapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 2));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).closest('.mind-map-canvas')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate positions for nodes
  const calculateNodePositions = (
    node: MindMapNode,
    level: number = 0,
    index: number = 0,
    totalSiblings: number = 1,
    parentAngle: number = 0
  ): { node: MindMapNode; x: number; y: number; level: number }[] => {
    const positions: { node: MindMapNode; x: number; y: number; level: number }[] = [];
    
    const centerX = 400;
    const centerY = 300;
    const radiusStep = 150;
    
    if (level === 0) {
      positions.push({ node, x: centerX, y: centerY, level });
    } else {
      const angleSpread = Math.PI * 2;
      const startAngle = parentAngle - angleSpread / (totalSiblings + 1);
      const angle = startAngle + (angleSpread / (totalSiblings + 1)) * (index + 1);
      const radius = radiusStep * level;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      positions.push({ node, x, y, level });
    }

    if (node.children && expandedNodes.has(node.id)) {
      node.children.forEach((child, idx) => {
        const childPositions = calculateNodePositions(
          child,
          level + 1,
          idx,
          node.children!.length,
          level === 0 ? (Math.PI * 2 / node.children!.length) * idx : parentAngle
        );
        positions.push(...childPositions);
      });
    }

    return positions;
  };

  const nodePositions = calculateNodePositions(mindMap.root);

  // Get colors based on level
  const getLevelColor = (level: number) => {
    const colors = [
      'bg-gradient-to-br from-brand-500 to-brand-600 text-white',
      'bg-gradient-to-br from-accent-500 to-accent-600 text-white',
      'bg-gradient-to-br from-success-500 to-success-600 text-white',
      'bg-gradient-to-br from-amber-500 to-amber-600 text-white',
      'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
    ];
    return colors[level % colors.length];
  };

  const getLineColor = (level: number) => {
    const colors = ['#5a6cf4', '#ff4d11', '#10b981', '#f59e0b', '#8b5cf6'];
    return colors[level % colors.length];
  };

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-brand-50 transition-colors"
        >
          <ZoomOut className="h-5 w-5 text-brand-600" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-brand-50 transition-colors"
        >
          <ZoomIn className="h-5 w-5 text-brand-600" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white rounded-lg shadow-md hover:bg-brand-50 transition-colors"
        >
          <RotateCcw className="h-5 w-5 text-brand-600" />
        </button>
      </div>

      {/* Mind Map Container */}
      <div
        ref={containerRef}
        className="relative w-full h-[600px] bg-gradient-to-br from-brand-50 to-white 
                 rounded-2xl border-2 border-brand-100 overflow-hidden cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="mind-map-canvas absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {/* SVG for lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {nodePositions.map((pos, idx) => {
              if (pos.level === 0) return null;
              
              // Find parent position
              const findParent = (
                node: MindMapNode,
                targetId: string,
                parentPos?: { x: number; y: number }
              ): { x: number; y: number } | null => {
                if (node.children?.some(c => c.id === targetId)) {
                  const nodePos = nodePositions.find(p => p.node.id === node.id);
                  return nodePos ? { x: nodePos.x, y: nodePos.y } : null;
                }
                if (node.children) {
                  for (const child of node.children) {
                    const found = findParent(child, targetId);
                    if (found) return found;
                  }
                }
                return null;
              };

              const parentPos = findParent(mindMap.root, pos.node.id);
              if (!parentPos) return null;

              return (
                <line
                  key={`line-${idx}`}
                  x1={parentPos.x}
                  y1={parentPos.y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={getLineColor(pos.level - 1)}
                  strokeWidth="2"
                  strokeOpacity="0.5"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodePositions.map((pos, idx) => (
            <div
              key={pos.node.id}
              className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2",
                "px-4 py-2 rounded-xl shadow-lg cursor-pointer",
                "transition-all duration-200 hover:scale-110 hover:shadow-xl",
                getLevelColor(pos.level),
                pos.level === 0 && "px-6 py-3 text-lg font-bold"
              )}
              style={{
                left: pos.x,
                top: pos.y,
                zIndex: 10 - pos.level,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (pos.node.children && pos.node.children.length > 0) {
                  toggleNode(pos.node.id);
                }
              }}
            >
              <span className="whitespace-nowrap">{pos.node.label}</span>
              {pos.node.children && pos.node.children.length > 0 && (
                <span className="ml-2 text-xs opacity-75">
                  {expandedNodes.has(pos.node.id) ? '−' : `+${pos.node.children.length}`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-sm text-brand-500 text-center mt-4">
        Click nodes to expand/collapse • Drag to pan • Use zoom controls to adjust view
      </p>
    </div>
  );
}
