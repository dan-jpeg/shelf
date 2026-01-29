'use client';

import { useState } from 'react';

export default function ImageRow({ urls = [], height = 200, className = "", margins = [], showFixedVideo = false }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const normalizedHeight = typeof height === "number" ? `${height}px` : height;

  const isVideo = (url) => {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  };

  const goToNext = () => {
    const currentIndex = urls.indexOf(selectedMedia);
    const nextIndex = (currentIndex + 1) % urls.length;
    setSelectedMedia(urls[nextIndex]);
  };

  return (
    <>
      <div className={`flex flex-row items-center gap-2 overflow-x-auto lg:flex-wrap ${className} `}>
        {urls.map((url, index) => {
          const marginClass = margins[index] || '';
          return isVideo(url) ? (
            <video
              key={`${url}-${index}`}
              src={url}
              style={{ height: normalizedHeight, width: "auto" }}
              autoPlay
              loop
              muted
              playsInline
              onClick={() => setSelectedMedia(url)}
              className={`cursor-pointer ${marginClass}`}
            />
          ) : (
            <img
              key={`${url}-${index}`}
              src={url}
              alt=""
              style={{ height: normalizedHeight, width: "auto" }}
              onClick={() => setSelectedMedia(url)}
              className={`cursor-pointer ${marginClass}`}
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
          {isVideo(selectedMedia) ? (
              <video
                  src={selectedMedia}
                  className="h-[60vh] w-auto cursor-pointer"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
              />
          ) : (
              <img
                  src={selectedMedia}
                  alt=""
                  className="h-auto w-[80vw] md:h-[60vh] md:w-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
              />
          )}
        </div>
      )}


    </>
  );
}
