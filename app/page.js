'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageRow from "./components/ImageRow";
import { isVideoEntry, entryKey, VideoPlayer } from "./components/ImageRow";
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
    { label: 'jxu archive scroll', urls: jxuArchiveVideo, height: 310 },
    { label: '[] jing yi artist portfolio', urls: jingyiurls, height: 200, margins: ['','mx-2'], descriptions: ['archive view | home/splash page','archive grid', 'home page image cycle'] },
    { label: '[] roo product display pages', urls: roourls1, height: 310, descriptions: ['product display page a','product display page a2', 'drawer menu', 'collection view'] },
    { label: '[] - grand cord (web)', urls: grandcordurls1, height: 200, margins: ['','border-[0.5] -my-4'], descriptions: ['editorial page','cart for large screens'] },
    { label: '[] - event art direction ', urls: majorMoves1, height: 310 },
    { label: '', urls: majorMovesRoundedStory, height: 210 },



    { label: '', urls: talentedDemo, height: 310 },
    { label: 'talented brand identity / deck', urls: talentedSlides1, height: 200 },
    { label: 'talented cont.', urls: talentedSlides2, height: 200 },
    { label: '[] placeholder.nyc e-commerce design', urls: urlsprojecta, height: 310, descriptions: ['product display page','product display page', 'menu / navigation'] },
    { label: '[] - edie xu artist portfolio', urls: ediehomescreenBig, height: 400, margins: ['-mx-12'] },
    { label: '[] - edie xu artist portfolio', urls: ediehomescreen, height: 200, margins: ['border-[1]'], descriptions: ['splash page scroll interaction','mobile exhibition view layout', 'exhibition photo gallery', '<3'] },
    { label: '[] - event promotion', urls: posterurls, height: 410 },
    { label: '[] union splash', urls: urlsrow1, height: 200 },
    { label: '[] event promotion', urls: posterurls2, height: 240 },


    // { label: '[] grand-cord additional', urls: grandcordurls2, height: 500, descriptions: ['product display page, minimal, desktop', 'product display concept', 'product display concept'], margins: ['border-[1]','','border-[0.5]'] },
];

export default function Home() {
    const [selected, setSelected] = useState(null); // { rowIndex, mediaIndex }

    useEffect(() => {
        if (!selected) return;
        const { rowIndex, mediaIndex } = selected;
        const row = rows[rowIndex];
        const handleKey = (e) => {
            if (e.key === 'ArrowRight') {
                setSelected({ rowIndex, mediaIndex: (mediaIndex + 1) % row.urls.length });
            } else if (e.key === 'ArrowLeft') {
                setSelected({ rowIndex, mediaIndex: (mediaIndex - 1 + row.urls.length) % row.urls.length });
            } else if (e.key === 'ArrowUp') {
                setSelected({ rowIndex: (rowIndex - 1 + rows.length) % rows.length, mediaIndex: 0 });
            } else if (e.key === 'ArrowDown') {
                setSelected({ rowIndex: (rowIndex + 1) % rows.length, mediaIndex: 0 });
            } else if (e.key === 'Escape') {
                setSelected(null);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selected]);

    const selectedRow = selected ? rows[selected.rowIndex] : null;
    const selectedEntry = selectedRow ? selectedRow.urls[selected.mediaIndex] : null;
    const selectedDescription = selectedRow?.descriptions?.[selected?.mediaIndex];

    return (
        <div className="flex w-screen bg-white font-mono text-[8.5pt] flex-col  px-2 overflow-y-auto scrollbar-hide">
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
                    <div key={i} className="lg:py-0 mb-6">
                        <p className="mb-2"> {row.label} </p>
                        <ImageRow
                            urls={row.urls}
                            height={row.height}
                            margins={row.margins}
                            onSelect={(mediaIndex) => setSelected({ rowIndex: i, mediaIndex })}
                        />
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
                </div>
            )}
        </div>
    );
}
