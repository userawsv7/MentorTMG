"use client";

import { useState, ReactNode } from "react";

interface ExpandableZoomDiagramProps {
  children: ReactNode;
  title?: string;
  minHeight?: number;
  maxHeight?: number;
}

export default function ExpandableZoomDiagram({
  children,
  title = "Diagram",
  minHeight = 200,
  maxHeight = 800
}: ExpandableZoomDiagramProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <figure className="rounded-xl border border-base-700 bg-base-900/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-base-500 font-mono">{title}</span>
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={handleZoomOut}
              className="px-2 py-1 rounded border border-base-700 hover:bg-base-800 text-base-400"
              disabled={zoomLevel <= 0.5}
            >
              −
            </button>
            <span className="px-2 text-base-500 font-mono">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-2 py-1 rounded border border-base-700 hover:bg-base-800 text-base-400"
              disabled={zoomLevel >= 3}
            >
              +
            </button>
            <button
              onClick={handleReset}
              className="px-2 py-1 rounded border border-base-700 hover:bg-base-800 text-base-400 ml-1"
            >
              Reset
            </button>
          </div>
          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs px-2 py-1 rounded border border-base-700 hover:bg-base-800 text-base-400"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 relative ${
          isExpanded ? "" : "max-h-[400px]"
        }`}
        style={{
          height: isExpanded ? `${maxHeight}px` : `${minHeight}px`,
          cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transformOrigin: "center center"
          }}
        >
          {children}
        </div>

        {zoomLevel > 1 && (
          <div className="absolute bottom-2 right-2 text-xs text-base-600 bg-base-900/80 px-2 py-1 rounded">
            Drag to pan
          </div>
        )}
      </div>

      <figcaption className="mt-2 text-xs text-base-500">
        {isExpanded ? "Click collapse to reduce size" : "Click expand for full view"} •
        Use zoom controls to magnify • Drag when zoomed to reposition
      </figcaption>
    </figure>
  );
}