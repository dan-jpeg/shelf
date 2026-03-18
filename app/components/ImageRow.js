'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// entry is either a string URL or { mp4, webm } for multi-source video
const isVideoEntry = (entry) => {
  if (typeof entry === 'object' && entry !== null) return true;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(entry);
};

const entryKey = (entry, index) => {
  if (typeof entry === 'string') return `${entry}-${index}`;
  return `${entry.mp4 || entry.webm}-${index}`;
};

// Renders a video with either a single src or <source> tags for multi-format
function VideoPlayer({ entry, ...videoProps }) {
  if (typeof entry === 'string') {
    return <video src={entry} {...videoProps} />;
  }
  return (
    <video {...videoProps}>
      {entry.webm && <source src={entry.webm} type="video/webm" />}
      {entry.mp4 && <source src={entry.mp4} type="video/mp4" />}
    </video>
  );
}

export default function ImageRow({ urls = [], height = 200, className = "", margins = [], descriptions = [] }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [heightMultiplier, setHeightMultiplier] = useState(1);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1800px)');
    const update = (e) => setHeightMultiplier(e.matches ? 1.2 : 1);
    update(mql);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedMedia) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'Escape') setSelectedMedia(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedMedia]);

  const computedHeight = typeof height === 'number'
    ? `${Math.round(height * heightMultiplier)}px`
    : `calc(${height} * ${heightMultiplier})`;

  const navigate = (delta) => {
    setSelectedMedia(prev => {
      const newIndex = (prev.index + delta + urls.length) % urls.length;
      return { entry: urls[newIndex], index: newIndex };
    });
  };

  return (
    <>
      <div className={`flex flex-row scrollbar-hide items-center gap-2 overflow-x-auto lg:flex-wrap ${className}`}>
        {urls.map((entry, index) => {
          const marginClass = margins[index] || '';
          return isVideoEntry(entry) ? (
            <VideoPlayer
              key={entryKey(entry, index)}
              entry={entry}
              style={{ height: computedHeight, width: 'auto' }}
              autoPlay
              loop
              muted
              playsInline
              onClick={() => setSelectedMedia({ entry, index })}
              className={`cursor-pointer ${marginClass}`}
            />
          ) : (
            <Image
              key={entryKey(entry, index)}
              src={entry}
              alt=""
              style={{ height: computedHeight, width: 'auto' }}
              onClick={() => setSelectedMedia({ entry, index })}
              className={`cursor-pointer ${marginClass}`}
              width={0}
              height={0}
              sizes="100vw"
            />
          );
        })}
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="flex flex-col items-center gap-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              {urls.length > 1 && (
                <button
                  className="font-mono text-[8.5pt] tracking-[0.9] cursor-pointer px-2 py-1"
                  onClick={() => navigate(-1)}
                >
                  ←
                </button>
              )}

              {isVideoEntry(selectedMedia.entry) ? (
                <VideoPlayer
                  key={selectedMedia.index}
                  entry={selectedMedia.entry}
                  className="h-[60vh] w-auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <Image
                  key={selectedMedia.index}
                  src={selectedMedia.entry}
                  alt=""
                  className="h-auto w-[80vw] md:h-[60vh] md:w-auto"
                  width={0}
                  height={0}
                  sizes="100vw"
                />
              )}

              {urls.length > 1 && (
                <button
                  className="font-mono text-[8.5pt] tracking-[0.9] cursor-pointer px-2 py-1"
                  onClick={() => navigate(1)}
                >
                  →
                </button>
              )}
            </div>

            {descriptions[selectedMedia.index] && (
              <p className="text-[10pt]">{descriptions[selectedMedia.index]}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
