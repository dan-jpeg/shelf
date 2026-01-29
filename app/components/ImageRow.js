'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImageRow({ urls = [], height = 200, className = "", margins = [], descriptions = [], showFixedVideo = false }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const normalizedHeight = typeof height === "number" ? `${height}px` : height;

  const isVideo = (url) => {
    return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
  };

  const goToNext = () => {
    const currentIndex = urls.indexOf(selectedMedia.url);
    const nextIndex = (currentIndex + 1) % urls.length;
    setSelectedMedia({ url: urls[nextIndex], index: nextIndex });
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
              onClick={() => setSelectedMedia({ url, index })}
              className={`cursor-pointer ${marginClass}`}
            />
          ) : (
            <Image
              key={`${url}-${index}`}
              src={url}
              alt=""
              style={{ height: normalizedHeight, width: "auto" }}
              onClick={() => setSelectedMedia({ url, index })}
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
          <div className="flex flex-col items-center gap-2">
            {isVideo(selectedMedia.url) ? (
                <video
                    src={selectedMedia.url}
                    className="h-[60vh] w-auto cursor-pointer"
                    autoPlay
                    loop
                    muted
                    playsInline
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.innerWidth >= 1024) {
                        goToNext();
                      } else {
                        setSelectedMedia(null);
                      }
                    }}
                />
            ) : (
                <Image
                    src={selectedMedia.url}
                    alt=""
                    className="h-auto w-[80vw] md:h-[60vh] md:w-auto cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.innerWidth >= 1024) {
                        goToNext();
                      } else {
                        setSelectedMedia(null);
                      }
                    }}
                    width={0}
                    height={0}
                    sizes="100vw"
                />
            )}
            {descriptions[selectedMedia.index] && (
              <p className="text-[10pt]">{descriptions[selectedMedia.index]}</p>
            )}
          </div>
        </div>
      )}


    </>
  );
}
