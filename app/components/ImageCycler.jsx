"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageCycler = ({ images, interval = 1000, height = 200, onSelect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, interval);
        return () => clearInterval(timer);
    }, [images, interval]);

    if (images.length === 0) return null;

    return (
        <Image
            src={images[currentIndex]}
            alt={`Cycled image ${currentIndex + 1}`}
            style={{ height, width: 'auto' }}
            width={0}
            height={0}
            sizes="100vw"
            priority
            onClick={() => onSelect?.(currentIndex)}
            className="cursor-zoom-in"
        />
    );
};

export default ImageCycler;
