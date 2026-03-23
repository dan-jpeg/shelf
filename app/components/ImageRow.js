'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// entry is either a string URL or { mp4, webm } for multi-source video
export const isVideoEntry = (entry) => {
  if (typeof entry === 'object' && entry !== null) return true;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(entry);
};

export const entryKey = (entry, index) => {
  if (typeof entry === 'string') return `${entry}-${index}`;
  return `${entry.mp4 || entry.webm}-${index}`;
};

// Renders a video with either a single src or <source> tags for multi-format
export function VideoPlayer({ entry, ...videoProps }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();

    if (videoProps.autoPlay) {
      const playPromise = video.play();
      playPromise?.catch(() => {});
    }
  }, [entry, videoProps.autoPlay]);

  if (typeof entry === 'string') {
    return <video ref={videoRef} src={entry} preload="auto" {...videoProps} />;
  }

  return (
    <video ref={videoRef} preload="auto" {...videoProps}>
      {entry.webm && <source src={entry.webm} type="video/webm" />}
      {entry.mp4 && <source src={entry.mp4} type="video/mp4" />}
    </video>
  );
}

export default function ImageRow({ urls = [], height = 200, className = "", margins = [], onSelect }) {
  const [heightMultiplier, setHeightMultiplier] = useState(1);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1800px)');
    const update = (e) => setHeightMultiplier(e.matches ? 1.2 : 1);
    update(mql);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const computedHeight = typeof height === 'number'
    ? `${Math.round(height * heightMultiplier)}px`
    : `calc(${height} * ${heightMultiplier})`;

  return (
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
            onClick={() => onSelect?.(index)}
            className={`cursor-zoom-in ${marginClass}`}
          />
        ) : (
          <Image
            key={entryKey(entry, index)}
            src={entry}
            alt=""
            style={{ height: computedHeight, width: 'auto' }}
            onClick={() => onSelect?.(index)}
            className={`cursor-zoom-in ${marginClass}`}
            width={0}
            height={0}
            sizes="100vw"
          />
        );
      })}
    </div>
  );
}
