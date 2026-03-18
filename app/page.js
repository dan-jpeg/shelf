'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ImageRow from "./components/ImageRow";
import { isVideoEntry, entryKey, VideoPlayer } from "./components/ImageRow";
import ImageCycler from "./components/ImageCycler";
import {
    urlsrow1,
    roourls1,
    urlsrow3,
    urlslapres,
    urlsedie,
    urlsgrandcordprint,
    urlsprojecta,
    urlsrow4,
    urlsrow5,
    urlsunion,
    urlsjinniphone,
    jinnishome,
    grandcordurls1,
    grandcordurls2,
    grandcordurls3,
    ediehomescreen,
    posterurls,
    posterurls2,
    majorMoves1,
    majorMoves2,
    talentedurls,
    talentedSlides1, talentedSlides2, majorMovesRoundedStory, jingyiurls, jxuArchiveVideo, ediehomescreenBig, talentedDemo
} from "@/app/urls";

const rows = [
    { label: '[] - grand cord (print)', urls: urlsgrandcordprint, height: 200 },
    { label: '[] - jxu archive scroll', urls: jxuArchiveVideo, height: 310 },
    { label: '[] - jing yi artist portfolio', urls: jingyiurls, height: 200, margins: ['','mx-2'], descriptions: ['archive view | home/splash page','archive grid', 'home page image cycle'] },
    { label: '[] - roo product display pages', urls: roourls1, height: 310, descriptions: ['product display page a','product display page a2', 'drawer menu', 'collection view'] },
    { label: '[] - grand cord (web)', urls: grandcordurls1, height: 200, margins: ['','border-[0.5] -my-4'], descriptions: ['editorial page','cart for large screens'] },
    { label: '[] - event art direction ', urls: majorMoves1, height: 310 },
    { label: '', urls: majorMovesRoundedStory, height: 210 },



    { label: '', urls: talentedDemo, height: 310 },
    { label: '[] - talented brand identity / deck', urls: talentedSlides1, height: 200, cycler: true },
    { label: '[]-  placeholder.nyc e-commerce design', urls: urlsprojecta, height: 310, descriptions: ['product display page','product display page', 'menu / navigation'] },
    { label: '[] - edie xu artist portfolio', urls: ediehomescreenBig, height: 310, margins: ['-mx-12 -mt-4'] },
    { label: '', urls: ediehomescreen, height: 200, margins: ['border-[1]'], descriptions: ['splash page scroll interaction','mobile exhibition view layout', 'exhibition photo gallery', '<3'] },
    { label: '[] - event promotion', urls: posterurls, height: 410 },
    { label: '[] - union splash', urls: urlsrow1, height: 200 },
    { label: '[] -  event promotion', urls: posterurls2, height: 240 },


    // { label: '[] grand-cord additional', urls: grandcordurls2, height: 500, descriptions: ['product display page, minimal, desktop', 'product display concept', 'product display concept'], margins: ['border-[1]','','border-[0.5]'] },
];

export default function Home() {
    const [selected, setSelected] = useState(null); // { rowIndex, mediaIndex }
    const [activeKey, setActiveKey] = useState(null);
    const rowRefs = useRef([]);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (!selected) return;
        const { rowIndex, mediaIndex } = selected;
        const row = rows[rowIndex];
        const handleKey = (e) => {
            const dir = { ArrowRight: 'right', ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down', d: 'right', a: 'left', w: 'up', s: 'down' }[e.key];
            if (dir) {
                setActiveKey(dir);
                setTimeout(() => setActiveKey(null), 300);
            }
            if (e.key === 'ArrowRight' || e.key === 'd') {
                setSelected({ rowIndex, mediaIndex: (mediaIndex + 1) % row.urls.length });
            } else if (e.key === 'ArrowLeft' || e.key === 'a') {
                setSelected({ rowIndex, mediaIndex: (mediaIndex - 1 + row.urls.length) % row.urls.length });
            } else if (e.key === 'ArrowUp' || e.key === 'w') {
                setSelected({ rowIndex: (rowIndex - 1 + rows.length) % rows.length, mediaIndex: 0 });
            } else if (e.key === 'ArrowDown' || e.key === 's') {
                setSelected({ rowIndex: (rowIndex + 1) % rows.length, mediaIndex: 0 });
            } else if (e.key === 'Escape') {
                setSelected(null);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selected]);

    useEffect(() => {
        if (!selected) return;
        const el = rowRefs.current[selected.rowIndex];
        const container = scrollContainerRef.current;
        if (el && container) {
            const elTop = el.offsetTop;
            const elHeight = el.offsetHeight;
            const containerHeight = container.clientHeight;
            container.scrollTo({ top: elTop - (containerHeight / 2) + (elHeight / 2), behavior: 'smooth' });
        }
    }, [selected?.rowIndex]);

    const selectedRow = selected ? rows[selected.rowIndex] : null;
    const selectedEntry = selectedRow ? selectedRow.urls[selected.mediaIndex] : null;
    const selectedDescription = selectedRow?.descriptions?.[selected?.mediaIndex];

    return (
        <div ref={scrollContainerRef} className="flex w-screen font-mono text-[8.5pt] flex-col px-2 overflow-y-auto scrollbar-hide">
            <video
                src="https://firebasestorage.googleapis.com/v0/b/common-base-d538e.firebasestorage.app/o/common-design-spinner.MOV?alt=media&token=b62f41cc-fb22-4ecd-a0bb-c04b24f9e66a"
                autoPlay
                loop

                muted
                playsInline
                className="fixed top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none -z-10"
                style={{ height: '40px', width: 'auto' }}
            />
            <div className="fixed w-full flex tracking-[0.9] items-center justify-center pt-2">
                <div className="flex items-center -ml-5 gap-2">
                    <span>daniel crowley</span>
                    <span>[]</span>
                    <span>selected work</span>
                </div>
            </div>

            <div className="pt-[41vh] space-y-12 lg:pt-2">
                {rows.map((row, i) => (
                    <div key={i} ref={el => rowRefs.current[i] = el} className="lg:py-0 mb-6">
                        <p className="mb-2"> {row.label} </p>
                        {row.cycler ? (
                            <ImageCycler images={row.urls} interval={1000} height={row.height} onSelect={(mediaIndex) => setSelected({ rowIndex: i, mediaIndex })} />
                        ) : (
                            <ImageRow
                                urls={row.urls}
                                height={row.height}
                                margins={row.margins}
                                onSelect={(mediaIndex) => setSelected({ rowIndex: i, mediaIndex })}
                            />
                        )}
                    </div>
                ))}
            </div>

            {selected && selectedEntry && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="flex flex-col items-center gap-2"
                        onClick={e => e.stopPropagation()}
                    >
                        {isVideoEntry(selectedEntry) ? (
                            <VideoPlayer
                                key={`${selected.rowIndex}-${selected.mediaIndex}`}
                                entry={selectedEntry}
                                className="h-[60vh] w-auto"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <Image
                                key={`${selected.rowIndex}-${selected.mediaIndex}`}
                                src={selectedEntry}
                                alt=""
                                className="h-auto w-[80vw] md:h-[60vh] md:w-auto"
                                width={0}
                                height={0}
                                sizes="100vw"
                            />
                        )}

                        {selectedDescription && (
                            <p className="text-[10pt]">{selectedDescription}</p>
                        )}
                    </div>

                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-6 text-[10pt] select-none pointer-events-none" onClick={e => e.stopPropagation()}>
                        {[
                            { dir: 'left',  labels: ['<', 'a'] },
                            { dir: 'up',    labels: ['^', 'w'] },
                            { dir: 'down',  labels: ['v', 's'] },
                            { dir: 'right', labels: ['>', 'd'] },
                        ].map(({ dir, labels }) => (
                            <span
                                key={dir}
                                style={{
                                    color: activeKey === dir ? '#000' : '#ccc',
                                    opacity: activeKey && activeKey !== dir ? 0 : 1,
                                    transition: 'color 0.15s, opacity 0.15s',
                                }}
                            >
                                {labels.join('/')}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
