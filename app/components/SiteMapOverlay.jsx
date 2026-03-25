'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const DOT_SIZE = 7;
const DOT_HIT_SIZE = 16;
const DOT_LEFT_HIT_EXTENSION = 20;
const HIGHLIGHT_RED = '#000000';
const CURSOR_MAX_EDGE = 54;
const MODAL_ROW_GRAY = '#9a9a9a';
const TOUCH_CURSOR_IDLE_MS = 650;
const TOUCH_CURSOR_FADE_MS = 220;
const SCRUB_START_DISTANCE = 6;

const desktopPresets = {
  bottomCenter: {
    className: 'min-[700px]:bottom-6 min-[700px]:left-1/2 min-[700px]:right-auto min-[700px]:-translate-x-1/2',
    orientation: 'horizontal',
  },
  rightCenterInset: {
    className: 'min-[700px]:top-1/2 min-[700px]:bottom-auto min-[700px]:right-[120px] min-[700px]:translate-y-[-50%]',
    orientation: 'horizontal',
  },
  rightTopSmall: {
    className: 'min-[700px]:top-2 min-[700px]:bottom-auto min-[700px]:left-auto min-[700px]:right-3 min-[700px]:origin-top-right min-[700px]:scale-[0.6]',
    orientation: 'horizontal',
  },
  underRightHeader: {
    className: 'top-[22px] bottom-auto left-auto right-4 origin-top-right scale-[0.6]',
    orientation: 'vertical',
  },
};

export default function SiteMapOverlay({
  rows,
  visibleRowIds,
  onDotClick,
  onDotScrub,
  selected,
  desktopPosition = 'bottomCenter',
}) {
  const [hoveredRowIds, setHoveredRowIds] = useState(() => new Set());
  const [isHoveringOverlay, setIsHoveringOverlay] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isTouchCursorVisible, setIsTouchCursorVisible] = useState(false);
  const [isTouchCursorFading, setIsTouchCursorFading] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 1, height: 1 });
  const overlayRef = useRef(null);
  const dotRefs = useRef({});
  const dotButtonRefs = useRef({});
  const touchCursorTimeoutRef = useRef(null);
  const touchCursorFadeTimeoutRef = useRef(null);
  const isScrubbingRef = useRef(false);
  const activePointerIdRef = useRef(null);
  const lastScrubbedDotKeyRef = useRef(null);
  const pointerStartRef = useRef(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const touchMql = window.matchMedia('(hover: none) and (pointer: coarse)');
    const updateTouchDevice = (event) => {
      setIsTouchDevice(event.matches);
    };

    updateViewportSize();
    updateTouchDevice(touchMql);
    window.addEventListener('resize', updateViewportSize);
    touchMql.addEventListener('change', updateTouchDevice);

    return () => {
      window.removeEventListener('resize', updateViewportSize);
      touchMql.removeEventListener('change', updateTouchDevice);
    };
  }, []);

  useEffect(() => () => {
    if (touchCursorTimeoutRef.current) {
      clearTimeout(touchCursorTimeoutRef.current);
    }
    if (touchCursorFadeTimeoutRef.current) {
      clearTimeout(touchCursorFadeTimeoutRef.current);
    }
  }, []);

  const cursorDimensions = useMemo(() => {
    const ratio = viewportSize.width / viewportSize.height;

    if (ratio >= 1) {
      return { width: CURSOR_MAX_EDGE, height: CURSOR_MAX_EDGE / ratio };
    }

    return { width: CURSOR_MAX_EDGE * ratio, height: CURSOR_MAX_EDGE };
  }, [viewportSize.height, viewportSize.width]);

  const updateHoveredDots = (nextCursorPosition) => {
    const scaledCursorWidth = cursorDimensions.width * cursorScale;
    const scaledCursorHeight = cursorDimensions.height * cursorScale;
    const cursorRect = {
      left: nextCursorPosition.x - (scaledCursorWidth / 2),
      right: nextCursorPosition.x + (scaledCursorWidth / 2),
      top: nextCursorPosition.y - (scaledCursorHeight / 2),
      bottom: nextCursorPosition.y + (scaledCursorHeight / 2),
    };

    const nextHoveredRowIds = new Set();

    Object.entries(dotRefs.current).forEach(([dotKey, el]) => {
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const intersectsCursor =
        rect.right >= cursorRect.left &&
        rect.left <= cursorRect.right &&
        rect.bottom >= cursorRect.top &&
        rect.top <= cursorRect.bottom;

      if (intersectsCursor) {
        nextHoveredRowIds.add(Number(dotKey.split('-')[0]));
      }
    });

    setHoveredRowIds(nextHoveredRowIds);
  };

  const desktopPreset = desktopPresets[desktopPosition] || desktopPresets.bottomCenter;
  const desktopRows = desktopPreset.orientation === 'horizontal' ? [...rows].reverse() : rows;
  const desktopPositionClass = desktopPreset.className;
  const cursorScale = desktopPosition === 'rightTopSmall' || desktopPosition === 'underRightHeader' ? 0.6 : 1;
  const effectiveVisibleRowIds = visibleRowIds;
  const visibleRowIndexSet = new Set(Array.from(effectiveVisibleRowIds));
  const showCursor = !selected && (isHoveringOverlay || isTouchCursorVisible || isTouchCursorFading);

  const clampPointToOverlay = (point) => {
    const overlay = overlayRef.current;
    if (!overlay) return point;

    const rect = overlay.getBoundingClientRect();
    const scaledCursorWidth = cursorDimensions.width * cursorScale;
    const scaledCursorHeight = cursorDimensions.height * cursorScale;
    const halfWidth = scaledCursorWidth / 2;
    const halfHeight = scaledCursorHeight / 2;

    return {
      x: Math.min(Math.max(point.x, rect.left + halfWidth), rect.right - halfWidth),
      y: Math.min(Math.max(point.y, rect.top + halfHeight), rect.bottom - halfHeight),
    };
  };

  const scheduleTouchCursorClear = () => {
    if (touchCursorTimeoutRef.current) {
      clearTimeout(touchCursorTimeoutRef.current);
    }
    if (touchCursorFadeTimeoutRef.current) {
      clearTimeout(touchCursorFadeTimeoutRef.current);
    }

    touchCursorTimeoutRef.current = setTimeout(() => {
      setIsTouchCursorVisible(false);
      setIsTouchCursorFading(true);
      touchCursorFadeTimeoutRef.current = setTimeout(() => {
        setIsTouchCursorFading(false);
        setHoveredRowIds(new Set());
      }, TOUCH_CURSOR_FADE_MS);
    }, TOUCH_CURSOR_IDLE_MS);
  };

  const clearTouchCursor = () => {
    if (touchCursorTimeoutRef.current) {
      clearTimeout(touchCursorTimeoutRef.current);
      touchCursorTimeoutRef.current = null;
    }
    if (touchCursorFadeTimeoutRef.current) {
      clearTimeout(touchCursorFadeTimeoutRef.current);
      touchCursorFadeTimeoutRef.current = null;
    }

    setIsTouchCursorVisible(false);
    setIsTouchCursorFading(false);
    setHoveredRowIds(new Set());
  };

  const activateTouchCursor = (touch) => {
    const nextCursorPosition = clampPointToOverlay({ x: touch.clientX, y: touch.clientY });
    setCursorPosition(nextCursorPosition);
    updateHoveredDots(nextCursorPosition);
    setIsTouchCursorVisible(true);
    setIsTouchCursorFading(false);
    scheduleTouchCursorClear();
  };

  const findDotAtPoint = (clientX, clientY) => {
    let nearestTarget = null;

    for (const [dotKey, el] of Object.entries(dotButtonRefs.current)) {
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const containsPoint =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (containsPoint) {
        const [rowId, mediaIndex] = dotKey.split('-');
        return { dotKey, rowId: Number(rowId), mediaIndex: Number(mediaIndex) };
      }

      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      const distance = Math.hypot(clientX - centerX, clientY - centerY);

      if (!nearestTarget || distance < nearestTarget.distance) {
        const [rowId, mediaIndex] = dotKey.split('-');
        nearestTarget = { dotKey, rowId: Number(rowId), mediaIndex: Number(mediaIndex), distance };
      }
    }

    return nearestTarget;
  };

  const scrubToPoint = (clientX, clientY) => {
    const nextTarget = findDotAtPoint(clientX, clientY);
    if (!nextTarget) return;
    if (lastScrubbedDotKeyRef.current === nextTarget.dotKey) return;

    lastScrubbedDotKeyRef.current = nextTarget.dotKey;
    onDotScrub?.(nextTarget.rowId, nextTarget.mediaIndex);
  };

  const selectPointTarget = (clientX, clientY) => {
    const nextTarget = findDotAtPoint(clientX, clientY);
    if (!nextTarget) return;

    onDotClick(nextTarget.rowId, nextTarget.mediaIndex);
  };

  const getInactiveOpacity = (rowId) => {
    if (visibleRowIndexSet.size === 0) return 1;
    if (visibleRowIndexSet.has(rowId)) return 1;

    let nearestDistance = Infinity;

    visibleRowIndexSet.forEach((visibleRowId) => {
      nearestDistance = Math.min(nearestDistance, Math.abs(visibleRowId - rowId));
    });

    if (nearestDistance <= 1) return 0.6;
    if (nearestDistance === 2) return 0.4;
    if (nearestDistance === 3) return 0.35;
    if (nearestDistance === 4) return 0.3;
    return 0.2;
  };

  return (
    <>
      <div
        ref={overlayRef}
        className={`fixed bottom-3 right-3 z-[60] -m-6 p-6 ${desktopPositionClass} ${selected ? '' : 'cursor-none'}`}
        style={{ touchAction: 'none' }}
        onMouseEnter={() => setIsHoveringOverlay(true)}
        onMouseLeave={() => {
          setIsHoveringOverlay(false);
          setHoveredRowIds(new Set());
        }}
        onMouseMove={(event) => {
          if (selected) return;
          const nextCursorPosition = clampPointToOverlay({ x: event.clientX, y: event.clientY });
          setCursorPosition(nextCursorPosition);
          updateHoveredDots(nextCursorPosition);
        }}
        onTouchStart={(event) => {
          if (selected || !isTouchDevice) return;
          const touch = event.touches[0];
          if (!touch) return;
          activateTouchCursor(touch);
        }}
        onTouchMove={(event) => {
          if (selected || !isTouchDevice) return;
          const touch = event.touches[0];
          if (!touch) return;
          activateTouchCursor(touch);
        }}
        onTouchEnd={() => {
          if (selected || !isTouchDevice) return;
          clearTouchCursor();
        }}
        onTouchCancel={() => {
          if (selected || !isTouchDevice) return;
          clearTouchCursor();
        }}
        onPointerDown={(event) => {
          isScrubbingRef.current = false;
          activePointerIdRef.current = event.pointerId;
          lastScrubbedDotKeyRef.current = null;
          pointerStartRef.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (activePointerIdRef.current !== event.pointerId) return;

          if (!isScrubbingRef.current && pointerStartRef.current) {
            const distance = Math.hypot(
              event.clientX - pointerStartRef.current.x,
              event.clientY - pointerStartRef.current.y,
            );

            if (distance >= SCRUB_START_DISTANCE) {
              isScrubbingRef.current = true;
              suppressClickRef.current = true;
              scrubToPoint(pointerStartRef.current.x, pointerStartRef.current.y);
            }
          }

          if (!isScrubbingRef.current) return;
          scrubToPoint(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          if (activePointerIdRef.current !== event.pointerId) return;
          const wasScrubbing = isScrubbingRef.current;

          if (!wasScrubbing) {
            selectPointTarget(event.clientX, event.clientY);
            suppressClickRef.current = true;
          }

          isScrubbingRef.current = false;
          activePointerIdRef.current = null;
          lastScrubbedDotKeyRef.current = null;
          pointerStartRef.current = null;
        }}
        onPointerCancel={(event) => {
          if (activePointerIdRef.current !== event.pointerId) return;
          isScrubbingRef.current = false;
          activePointerIdRef.current = null;
          lastScrubbedDotKeyRef.current = null;
          pointerStartRef.current = null;
        }}
        onLostPointerCapture={() => {
          isScrubbingRef.current = false;
          activePointerIdRef.current = null;
          lastScrubbedDotKeyRef.current = null;
          pointerStartRef.current = null;
        }}
      >
        <div className="flex flex-col items-end gap-0 min-[700px]:hidden">
          {rows.map((row) => {
            const itemCount = row.cycler ? 1 : row.urls.length;
            const isActive = effectiveVisibleRowIds.has(row.id);

            return (
              <div key={row.id} className="flex items-center justify-end gap-0.5">
                {Array.from({ length: itemCount }).map((_, index) => {
                  const dotKey = `${row.id}-${index}-mobile`;
                  const dotVisualKey = `${row.id}-${index}-mobile-visual`;
                  const isHovered = hoveredRowIds.has(row.id);
                  const isSelectedRow = selected?.rowIndex === row.id;
                  const selectedDotIndex = row.cycler ? 0 : selected?.mediaIndex;
                  const isSelectedDot = isSelectedRow && selectedDotIndex === index;
                  const fillColor = selected
                    ? isSelectedDot
                      ? HIGHLIGHT_RED
                      : MODAL_ROW_GRAY
                    : isHovered
                      ? HIGHLIGHT_RED
                      : isActive
                        ? HIGHLIGHT_RED
                        : '#000';
                  const fillOpacity = selected
                    ? isSelectedRow
                      ? 1
                      : 0.6
                    : isActive || isHovered
                      ? 1
                      : getInactiveOpacity(row.id);

                  return (
                    <div
                      key={dotKey}
                      className="relative flex items-center justify-center"
                      style={{
                        width: `${DOT_HIT_SIZE}px`,
                        height: `${DOT_HIT_SIZE}px`,
                      }}
                    >
                      <button
                        type="button"
                        aria-label={selected ? `Select item ${index + 1} in ${row.label || `row ${row.id + 1}`}` : `Scroll to ${row.label || `row ${row.id + 1}`}`}
                        onClick={(event) => {
                          if (suppressClickRef.current) {
                            event.preventDefault();
                            suppressClickRef.current = false;
                            return;
                          }

                          onDotClick(row.id, index);
                        }}
                        className={`absolute top-1/2 left-1/2 ${selected ? 'cursor-pointer' : 'cursor-none'}`}
                        ref={(el) => {
                          if (el) {
                            dotButtonRefs.current[dotKey] = el;
                          } else {
                            delete dotButtonRefs.current[dotKey];
                          }
                        }}
                        style={{
                          width: `${selected ? DOT_HIT_SIZE : DOT_HIT_SIZE + DOT_LEFT_HIT_EXTENSION}px`,
                          height: `${DOT_HIT_SIZE}px`,
                          transform: 'translate(-50%, -50%)',
                          marginLeft: selected ? '0px' : `-${DOT_LEFT_HIT_EXTENSION / 2}px`,
                        }}
                      >
                        <span
                          ref={(el) => {
                            if (el) {
                              dotRefs.current[dotVisualKey] = el;
                            } else {
                              delete dotRefs.current[dotVisualKey];
                            }
                          }}
                          className="absolute top-1/2 left-1/2"
                          style={{
                            width: `${DOT_SIZE}px`,
                            height: `${DOT_SIZE}px`,
                            backgroundColor: fillColor,
                            opacity: fillOpacity,
                            transform: selected
                              ? 'translate(-50%, -50%)'
                              : `translate(calc(-50% + ${DOT_LEFT_HIT_EXTENSION / 2}px), -50%)`,
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className={`hidden min-[700px]:flex ${desktopPreset.orientation === 'vertical' ? 'min-[700px]:flex-col min-[700px]:items-end min-[700px]:gap-0' : 'min-[700px]:flex-row min-[700px]:items-end min-[700px]:gap-px'}`}>
          {desktopRows.map((row) => {
            const itemCount = row.cycler ? 1 : row.urls.length;
            const isActive = effectiveVisibleRowIds.has(row.id);

            return (
              <div
                key={row.id}
                className={`flex items-center justify-center gap-0.5 ${
                  desktopPreset.orientation === 'vertical'
                    ? 'min-[700px]:flex-row min-[700px]:justify-end'
                    : 'min-[700px]:flex-col min-[700px]:justify-end min-[700px]:gap-0'
                }`}
              >
                {Array.from({ length: itemCount }).map((_, index) => {
                  const dotKey = `${row.id}-${index}-desktop`;
                  const dotVisualKey = `${row.id}-${index}-desktop-visual`;
                  const isHovered = hoveredRowIds.has(row.id);
                  const isSelectedRow = selected?.rowIndex === row.id;
                  const selectedDotIndex = row.cycler ? 0 : selected?.mediaIndex;
                  const isSelectedDot = isSelectedRow && selectedDotIndex === index;
                  const fillColor = selected
                    ? isSelectedDot
                      ? HIGHLIGHT_RED
                      : MODAL_ROW_GRAY
                    : isHovered
                      ? HIGHLIGHT_RED
                      : isActive
                        ? HIGHLIGHT_RED
                        : '#000';
                  const fillOpacity = selected
                    ? isSelectedRow
                      ? 1
                      : 0.6
                    : isActive || isHovered
                      ? 1
                      : getInactiveOpacity(row.id);

                  return (
                    <div
                      key={dotKey}
                      className="relative flex items-center justify-center"
                      style={{
                        width: `${DOT_HIT_SIZE}px`,
                        height: `${DOT_HIT_SIZE}px`,
                      }}
                    >
                      <button
                        type="button"
                        aria-label={selected ? `Select item ${index + 1} in ${row.label || `row ${row.id + 1}`}` : `Scroll to ${row.label || `row ${row.id + 1}`}`}
                        onClick={(event) => {
                          if (suppressClickRef.current) {
                            event.preventDefault();
                            suppressClickRef.current = false;
                            return;
                          }

                          onDotClick(row.id, index);
                        }}
                        className={`absolute top-1/2 left-1/2 ${selected ? 'cursor-pointer' : 'cursor-none'}`}
                        ref={(el) => {
                          if (el) {
                            dotButtonRefs.current[dotKey] = el;
                          } else {
                            delete dotButtonRefs.current[dotKey];
                          }
                        }}
                        style={{
                          width: `${selected ? DOT_HIT_SIZE : DOT_HIT_SIZE + DOT_LEFT_HIT_EXTENSION}px`,
                          height: `${DOT_HIT_SIZE}px`,
                          transform: 'translate(-50%, -50%)',
                          marginLeft: selected ? '0px' : `-${DOT_LEFT_HIT_EXTENSION / 2}px`,
                        }}
                      >
                        <span
                          ref={(el) => {
                            if (el) {
                              dotRefs.current[dotVisualKey] = el;
                            } else {
                              delete dotRefs.current[dotVisualKey];
                            }
                          }}
                          className="absolute top-1/2 left-1/2"
                          style={{
                            width: `${DOT_SIZE}px`,
                            height: `${DOT_SIZE}px`,
                            backgroundColor: fillColor,
                            opacity: fillOpacity,
                            transform: selected
                              ? 'translate(-50%, -50%)'
                              : `translate(calc(-50% + ${DOT_LEFT_HIT_EXTENSION / 2}px), -50%)`,
                          }}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {showCursor && (
        <div
          className="pointer-events-none fixed z-[70] rounded-[1px] border border-black transition-opacity duration-[220ms]"
          style={{
            width: `${cursorDimensions.width}px`,
            height: `${cursorDimensions.height}px`,
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
            transform: `translate(-50%, -50%) scale(${cursorScale})`,
            transformOrigin: 'center',
            opacity: isTouchDevice ? (isTouchCursorVisible ? 1 : 0) : (isHoveringOverlay ? 1 : 0),
          }}
        />
      )}
    </>
  );
}
