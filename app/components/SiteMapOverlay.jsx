'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const DOT_SIZE = 7;
const DOT_HIT_SIZE = 16;
const DOT_LEFT_HIT_EXTENSION = 20;
const HIGHLIGHT_RED = '#F90000';
const CURSOR_MAX_EDGE = 54;
const MODAL_ROW_GRAY = '#9a9a9a';

const desktopPresets = {
  bottomCenter: {
    className: 'lg:bottom-6 lg:left-1/2 lg:right-auto lg:-translate-x-1/2',
    orientation: 'horizontal',
  },
  rightCenterInset: {
    className: 'lg:top-1/2 lg:bottom-auto lg:right-[120px] lg:translate-y-[-50%]',
    orientation: 'horizontal',
  },
  rightTopSmall: {
    className: 'lg:top-2 lg:bottom-auto lg:left-auto lg:right-3 lg:origin-top-right lg:scale-[0.6]',
    orientation: 'horizontal',
  },
  underRightHeader: {
    className: 'top-[16px] bottom-auto left-auto right-[24px] origin-top-right scale-[0.6]',
    orientation: 'vertical',
  },
};

export default function SiteMapOverlay({
  rows,
  visibleRowIds,
  onDotClick,
  selected,
  desktopPosition = 'bottomCenter',
}) {
  const [hoveredDotKeys, setHoveredDotKeys] = useState(() => new Set());
  const [isHoveringOverlay, setIsHoveringOverlay] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 1, height: 1 });
  const dotRefs = useRef({});

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
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

    const nextHoveredDotKeys = new Set();

    Object.entries(dotRefs.current).forEach(([dotKey, el]) => {
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const isInsideCursor =
        rect.left >= cursorRect.left &&
        rect.right <= cursorRect.right &&
        rect.top >= cursorRect.top &&
        rect.bottom <= cursorRect.bottom;

      if (isInsideCursor) {
        const rowId = dotKey.split('-')[0];
        Object.keys(dotRefs.current).forEach((candidateKey) => {
          if (candidateKey.startsWith(`${rowId}-`)) {
            nextHoveredDotKeys.add(candidateKey);
          }
        });
      }
    });

    setHoveredDotKeys(nextHoveredDotKeys);
  };

  const desktopPreset = desktopPresets[desktopPosition] || desktopPresets.bottomCenter;
  const desktopRows = desktopPreset.orientation === 'horizontal' ? [...rows].reverse() : rows;
  const desktopPositionClass = desktopPreset.className;
  const cursorScale = desktopPosition === 'rightTopSmall' || desktopPosition === 'underRightHeader' ? 0.6 : 1;

  return (
    <>
      <div
        className={`fixed bottom-3 right-3 z-[60] -m-6 p-6 ${desktopPositionClass} ${selected ? '' : 'cursor-none'}`}
        onMouseEnter={() => setIsHoveringOverlay(true)}
        onMouseLeave={() => {
          setIsHoveringOverlay(false);
          setHoveredDotKeys(new Set());
        }}
        onMouseMove={(event) => {
          if (selected) return;
          const nextCursorPosition = { x: event.clientX, y: event.clientY };
          setCursorPosition(nextCursorPosition);
          updateHoveredDots(nextCursorPosition);
        }}
      >
        <div className="flex flex-col items-end gap-0 lg:hidden">
          {rows.map((row) => {
            const itemCount = row.cycler ? 1 : row.urls.length;
            const isActive = visibleRowIds.has(row.id);

            return (
              <div key={row.id} className="flex items-center justify-end gap-0.5">
                {Array.from({ length: itemCount }).map((_, index) => {
                  const dotKey = `${row.id}-${index}`;
                  const isHovered = hoveredDotKeys.has(dotKey);
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
                        ? '#000'
                        : '#d4d4d4';
                  const fillOpacity = selected
                    ? isSelectedRow
                      ? 1
                      : 0.6
                    : 1;

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
                        onClick={() => onDotClick(row.id, index)}
                        className={`absolute top-1/2 left-1/2 ${selected ? 'cursor-pointer' : 'cursor-none'}`}
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
                              dotRefs.current[dotKey] = el;
                            } else {
                              delete dotRefs.current[dotKey];
                            }
                          }}
                          className="absolute top-1/2 left-1/2 transition-colors"
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

        <div className={`hidden lg:flex ${desktopPreset.orientation === 'vertical' ? 'lg:flex-col lg:items-end lg:gap-0' : 'lg:flex-row lg:items-end lg:gap-px'}`}>
          {desktopRows.map((row) => {
            const itemCount = row.cycler ? 1 : row.urls.length;
            const isActive = visibleRowIds.has(row.id);

            return (
              <div
                key={row.id}
                className={`flex items-center justify-center gap-0.5 ${
                  desktopPreset.orientation === 'vertical'
                    ? 'lg:flex-row lg:justify-end'
                    : 'lg:flex-col lg:justify-end lg:gap-0'
                }`}
              >
                {Array.from({ length: itemCount }).map((_, index) => {
                  const dotKey = `${row.id}-${index}`;
                  const isHovered = hoveredDotKeys.has(dotKey);
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
                        ? '#000'
                        : '#d4d4d4';
                  const fillOpacity = selected
                    ? isSelectedRow
                      ? 1
                      : 0.6
                    : 1;

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
                        onClick={() => onDotClick(row.id, index)}
                        className={`absolute top-1/2 left-1/2 ${selected ? 'cursor-pointer' : 'cursor-none'}`}
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
                              dotRefs.current[dotKey] = el;
                            } else {
                              delete dotRefs.current[dotKey];
                            }
                          }}
                          className="absolute top-1/2 left-1/2 transition-colors"
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

      {!selected && isHoveringOverlay && (
        <div
          className="pointer-events-none fixed z-[70] rounded-[1px] border border-black"
          style={{
            width: `${cursorDimensions.width}px`,
            height: `${cursorDimensions.height}px`,
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
            transform: `translate(-50%, -50%) scale(${cursorScale})`,
            transformOrigin: 'center',
          }}
        />
      )}
    </>
  );
}
