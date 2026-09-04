import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Type,
  RotateCcw,
  Trash2,
  Download,
  Lock,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import type { WhiteboardStroke } from '../../types';

interface InteractiveWhiteboardProps {
  canDraw: boolean;
  onStrokeDrawn?: (stroke: WhiteboardStroke) => void;
  onClearBoard?: () => void;
  onUndoStroke?: () => void;
  initialStrokes?: WhiteboardStroke[];
  externalStroke?: WhiteboardStroke | null;
  clearTrigger?: number;
}

type ToolType = 'PEN' | 'HIGHLIGHTER' | 'ERASER' | 'RECTANGLE' | 'CIRCLE' | 'ARROW' | 'TEXT';

const COLOR_PALETTE = [
  '#0f172a', // Slate 900
  '#2563eb', // Blue
  '#059669', // Emerald
  '#dc2626', // Red
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
];

export const InteractiveWhiteboard: React.FC<InteractiveWhiteboardProps> = ({
  canDraw,
  onStrokeDrawn,
  onClearBoard,
  onUndoStroke,
  initialStrokes = [],
  externalStroke = null,
  clearTrigger = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeTool, setActiveTool] = useState<ToolType>('PEN');
  const [currentColor, setCurrentColor] = useState<string>('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>(initialStrokes);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  // Redraw all strokes on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid lines (engineering/math style)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Render strokes
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
  }, [strokes]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: WhiteboardStroke) => {
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'HIGHLIGHTER') {
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = stroke.width * 3;
    } else {
      ctx.globalAlpha = 1.0;
    }

    if (stroke.tool === 'ERASER') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = stroke.width * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    const pts = stroke.points;
    if (!pts || pts.length === 0) {
      ctx.restore();
      return;
    }

    if (stroke.tool === 'PEN' || stroke.tool === 'HIGHLIGHTER' || stroke.tool === 'ERASER') {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    } else if (stroke.tool === 'RECTANGLE' && pts.length >= 2) {
      const p1 = pts[0];
      const p2 = pts[pts.length - 1];
      ctx.beginPath();
      ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    } else if (stroke.tool === 'CIRCLE' && pts.length >= 2) {
      const p1 = pts[0];
      const p2 = pts[pts.length - 1];
      const rx = Math.abs(p2.x - p1.x) / 2;
      const ry = Math.abs(p2.y - p1.y) / 2;
      const cx = Math.min(p1.x, p2.x) + rx;
      const cy = Math.min(p1.y, p2.y) + ry;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (stroke.tool === 'ARROW' && pts.length >= 2) {
      const p1 = pts[0];
      const p2 = pts[pts.length - 1];
      const headlen = 14;
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - headlen * Math.cos(angle - Math.PI / 6), p2.y - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - headlen * Math.cos(angle + Math.PI / 6), p2.y - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else if (stroke.tool === 'TEXT' && stroke.text && pts.length >= 1) {
      ctx.font = `${stroke.width * 5 + 14}px sans-serif`;
      ctx.fillStyle = stroke.color;
      ctx.fillText(stroke.text, pts[0].x, pts[0].y);
    }

    ctx.restore();
  };

  // Resize canvas when container size changes
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        redrawCanvas();
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [redrawCanvas]);

  // Handle incoming external stroke from other peers
  useEffect(() => {
    if (externalStroke) {
      setStrokes((prev) => [...prev, externalStroke]);
    }
  }, [externalStroke]);

  // Handle clear trigger
  useEffect(() => {
    if (clearTrigger > 0) {
      setStrokes([]);
    }
  }, [clearTrigger]);

  // Redraw whenever strokes state changes
  useEffect(() => {
    redrawCanvas();
  }, [strokes, redrawCanvas]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    startPointRef.current = coords;
    currentPathRef.current = [coords];

    if (activeTool === 'TEXT') {
      const textInput = prompt('Enter annotation text:');
      if (textInput && textInput.trim()) {
        const newStroke: WhiteboardStroke = {
          id: `stroke-${Date.now()}`,
          tool: 'TEXT',
          color: currentColor,
          width: strokeWidth,
          points: [coords],
          text: textInput.trim(),
          timestamp: Date.now(),
        };
        setStrokes((prev) => [...prev, newStroke]);
        if (onStrokeDrawn) onStrokeDrawn(newStroke);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canDraw) return;
    const coords = getCanvasCoords(e);
    currentPathRef.current.push(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fast live preview rendering
    redrawCanvas();
    const tempStroke: WhiteboardStroke = {
      id: 'temp',
      tool: activeTool,
      color: currentColor,
      width: strokeWidth,
      points: currentPathRef.current,
      timestamp: Date.now(),
    };
    drawStroke(ctx, tempStroke);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !canDraw) return;
    setIsDrawing(false);

    if (currentPathRef.current.length > 0) {
      const finalStroke: WhiteboardStroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tool: activeTool,
        color: currentColor,
        width: strokeWidth,
        points: [...currentPathRef.current],
        timestamp: Date.now(),
      };

      setStrokes((prev) => [...prev, finalStroke]);
      if (onStrokeDrawn) {
        onStrokeDrawn(finalStroke);
      }
    }
    currentPathRef.current = [];
    startPointRef.current = null;
  };

  const handleUndo = () => {
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      return next;
    });
    if (onUndoStroke) onUndoStroke();
  };

  const handleClear = () => {
    if (window.confirm('Clear all whiteboard drawings?')) {
      setStrokes([]);
      if (onClearBoard) onClearBoard();
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `SchoolSoul_Whiteboard_${new Date().toISOString().substring(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="relative w-full h-full bg-white dark:bg-slate-900 flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Top Floating Whiteboard Toolbar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-2">
        {!canDraw ? (
          <div className="flex items-center gap-2 px-3 py-1 text-xs text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 rounded-xl">
            <Lock className="w-3.5 h-3.5" />
            <span>View Only Mode (Teacher has locked student drawing)</span>
          </div>
        ) : (
          <>
            {/* Tools Selector */}
            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
              <button
                type="button"
                onClick={() => setActiveTool('PEN')}
                title="Pen"
                className={`p-2 rounded-xl transition-all ${
                  activeTool === 'PEN'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Pen className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('HIGHLIGHTER')}
                title="Highlighter"
                className={`p-2 rounded-xl transition-all ${
                  activeTool === 'HIGHLIGHTER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Highlighter className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('RECTANGLE')}
                title="Rectangle"
                className={`p-2 rounded-xl transition-all ${
                  activeTool === 'RECTANGLE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Square className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('CIRCLE')}
                title="Circle"
                className={`p-2 rounded-xl transition-all ${
                  activeTool === 'CIRCLE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Circle className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('ARROW')}
                title="Arrow"
                className={`p-2 rounded-xl transition-all ${
                  activeTool === 'ARROW'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('TEXT')}
                title="Text Annotation"
                className={`p-2 rounded-xl transition-all ${
                  activeTool === 'TEXT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Type className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('ERASER')}
                title="Eraser"
                className={`p-2 rounded-xl transition-all ${
                  activeTool === 'ERASER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-1.5 border-r border-slate-200 dark:border-slate-800 pr-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCurrentColor(color)}
                  className={`w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 transition-transform ${
                    currentColor === color ? 'scale-125 ring-2 ring-blue-500 ring-offset-1' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Stroke Thickness Selector */}
            <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2">
              {[2, 4, 8, 14].map((width) => (
                <button
                  key={width}
                  type="button"
                  onClick={() => setStrokeWidth(width)}
                  className={`w-6 h-6 flex items-center justify-center rounded-lg ${
                    strokeWidth === width
                      ? 'bg-slate-200 dark:bg-slate-700 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div
                    className="rounded-full bg-slate-900 dark:bg-slate-100"
                    style={{ width: Math.min(16, width * 1.5), height: Math.min(16, width * 1.5) }}
                  />
                </button>
              ))}
            </div>

            {/* Actions: Undo, Clear */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                title="Undo"
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleClear}
                title="Clear Board"
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* Snapshot Download */}
        <button
          type="button"
          onClick={handleExportPNG}
          title="Download Board Notes PNG"
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all ml-1"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Main Drawing Canvas Container */}
      <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block touch-none"
        />
      </div>
    </div>
  );
};
