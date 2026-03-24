    'use client';

    import { VideoPlayer } from './ImageRow';
    import { jxuArchiveVideo } from '@/app/urls';

    // Custom row for [] - jxu archive scroll
    // Edit layout, sizing, spacing, etc. freely here
    export default function JxuArchiveRow({ onSelect, shouldLoadVideos = true }) {
        const height = '310px';

        return (
            <div className="flex flex-row scrollbar-hide  items-start gap-2 overflow-x-auto lg:flex-wrap">
                {jxuArchiveVideo.map((entry, index) => (
                    <VideoPlayer
                        key={index}
                        entry={entry}
                        style={{ height, minWidth: 'auto' }}
                        autoPlay
                        loop
                        muted
                        playsInline
                        shouldLoad={shouldLoadVideos}
                        onClick={() => onSelect?.(index)}
                        className="cursor-zoom-in -mx2"
                    />
                ))}
            </div>
        );
    }
