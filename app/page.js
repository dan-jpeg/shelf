'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import ImageRow from "./components/ImageRow";
import { isVideoEntry, entryKey, VideoPlayer } from "./components/ImageRow";
import ImageCycler from "./components/ImageCycler";
import JxuArchiveRow from "./components/JxuArchiveRow";
import ProjectShowcase from "./components/ProjectShowcase";
import SiteMapOverlay from "./components/SiteMapOverlay";
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
    talentedSlides1,
    talentedSlides2,
    majorMovesRoundedStory,
    jingyiurls,
    jxuArchiveVideo,
    ediehomescreenBig,
    talentedDemo,
    clockUrl
} from "@/app/urls";

const baseRows = [
    { label: '[] - grand cord (print)', urls: urlsgrandcordprint, height: 200, descriptions: ['3 item catalog spread',' one-cut dress catalog spread', 'two item catalog spread'], },
    { label: '[] - jxu archive scroll', urls: jxuArchiveVideo, height: 310, custom: 'jxu-archive', className: 'pt-4 pb-10', descriptions: ['archive scroll','mobile home page'], labelClassName: ' xs:translate-y-4  sm:translate-y-3 ' },
    { label: '[] - jing yi artist portfolio', urls: jingyiurls, height: 200, margins: ['','mx-2'], descriptions: ['archive view | home/splash page','archive grid'],  labelClassName: 'pt-0'  },
    { label: '[] - roo product display pages', urls: roourls1, height: 310, descriptions: ['product display page a','product display page a2', 'drawer menu', 'collection view'] },
    { label: '[] - grand cord (web)', urls: grandcordurls1, height: 200, margins: ['','border-[0.5]'], descriptions: ['editorial page','cart for large screens'] },
    { label: '[] - event art direction ', urls: majorMoves1, height: 310, descriptions: ['poster design for social media']},
    { label: '', urls: majorMovesRoundedStory, height: 210, descriptions: ['instagram / social story (1)','instagram / social story (2)', 'instagram / social story (3)'] },



    { label: '[] - talented brand identity / deck', urls: talentedDemo, height: 310, descriptions: ['talented brand identity'] },
    { label: '', urls: talentedSlides1, height: 200, cycler: true,  descriptions: ['talented brand identity / deck'] },
    { label: '[]-  placeholder.nyc e-commerce design', urls: urlsprojecta, height: 310, descriptions: ['product display page','product display page', 'menu / navigation'] },
    { label: '[] - edie xu artist portfolio', urls: ediehomescreenBig, height: 310, labelClassName: 'translate-y-10',  descriptions: 'works page scroll view' },
    { label: '', urls: ediehomescreen, height: 200, margins: ['border-[1]'], descriptions: ['splash page scroll interaction','mobile exhibition view layout', 'exhibition photo gallery'] },
    { label: '[] - event promotion', urls: posterurls, height: 410,  descriptions: ['poster-design'] },
    { label: '[] - union splash', urls:  urlsrow1, height: 200,  descriptions: ['union splash screen'] },
    { label: '[] -  event promotion', urls: posterurls2, height: 240,  descriptions: ['talented brand identity / deck'] },
    { label: '[] -  clock ', urls: clockUrl, height: 100, descriptions: ['readable clock in which only one or two numbers is visible at a time'] },


    // { label: '[] grand-cord additional', urls: grandcordurls2, height: 500, descriptions: ['product display page, minimal, desktop', 'product display concept', 'product display concept'], margins: ['border-[1]','','border-[0.5]'] },
];

const rows = baseRows.map((row, index) => ({ ...row, id: index }));
const MOBILE_MODAL_PRELOAD_BEHIND = 1;
const MOBILE_MODAL_PRELOAD_AHEAD = 3;
const FOOTER_ROW_ID = rows.length;

const showcases = rows.reduce((groups, row) => {
    const hasTitle = row.label.trim().length > 0;

    if (hasTitle || groups.length === 0) {
        groups.push({
            id: row.id,
            title: row.label,
            titleClassName: row.labelClassName || '',
            rows: [row],
        });
        return groups;
    }

    groups[groups.length - 1].rows.push(row);
    return groups;
}, []);

export default function Home() {
    const [selected, setSelected] = useState(null); // { rowIndex, mediaIndex }
    const [activeKey, setActiveKey] = useState(null);
    const [visibleRowIds, setVisibleRowIds] = useState(() => new Set());
    const [isMobile, setIsMobile] = useState(false);
    const [maxUnlockedRowId, setMaxUnlockedRowId] = useState(0);
    const [isNearBottom, setIsNearBottom] = useState(false);
    const [pageFlashKey, setPageFlashKey] = useState(0);
    const rowRefs = useRef([]);
    const scrollContainerRef = useRef(null);
    const mobilePagerRef = useRef(null);
    const footerRef = useRef(null);
    const triangleCursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><path d="M5 1L9 8H1Z" fill="black"/></svg>\') 5 2, n-resize';

    const getRowHeight = useCallback((row) => {
        if (isMobile) return row.mobileHeight ?? row.height;
        return row.desktopHeight ?? row.height;
    }, [isMobile]);

    const clampMediaIndex = useCallback((rowIndex, mediaIndex) => {
        const row = rows[rowIndex];
        return ((mediaIndex % row.urls.length) + row.urls.length) % row.urls.length;
    }, []);

    const moveSelection = useCallback((direction) => {
        setSelected((currentSelected) => {
            if (!currentSelected) return currentSelected;

            const { rowIndex, mediaIndex } = currentSelected;

            if (direction === 'right') {
                return { rowIndex, mediaIndex: clampMediaIndex(rowIndex, mediaIndex + 1) };
            }

            if (direction === 'left') {
                return { rowIndex, mediaIndex: clampMediaIndex(rowIndex, mediaIndex - 1) };
            }

            if (direction === 'up') {
                if (rowIndex === 0) return currentSelected;
                const nextRowIndex = rowIndex - 1;
                return {
                    rowIndex: nextRowIndex,
                    mediaIndex: clampMediaIndex(nextRowIndex, mediaIndex),
                };
            }

            if (direction === 'down') {
                if (rowIndex === rows.length - 1) return currentSelected;
                const nextRowIndex = rowIndex + 1;
                return {
                    rowIndex: nextRowIndex,
                    mediaIndex: clampMediaIndex(nextRowIndex, mediaIndex),
                };
            }

            return currentSelected;
        });
    }, [clampMediaIndex]);

    const flashActiveKey = useCallback((direction) => {
        setActiveKey(direction);
        setTimeout(() => setActiveKey(null), 300);
    }, []);

    const clearSelection = useCallback(() => {
        setSelected(null);
    }, []);

    const navigateSelection = useCallback((direction) => {
        flashActiveKey(direction);
        moveSelection(direction);
    }, [flashActiveKey, moveSelection]);

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 1023px)');
        const update = (event) => setIsMobile(event.matches);
        update(mql);
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (!selected) return;

        const handleKey = (e) => {
            const dir = { ArrowRight: 'right', ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down', d: 'right', a: 'left', w: 'up', s: 'down' }[e.key];
            if (dir) {
                navigateSelection(dir);
            } else if (e.key === 'Escape') {
                clearSelection();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [clearSelection, navigateSelection, selected]);

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
    }, [selected]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                setVisibleRowIds((prev) => {
                    const next = new Set(prev);

                    entries.forEach((entry) => {
                        const rowId = Number(entry.target.dataset.rowId);
                        if (Number.isNaN(rowId)) return;

                        if (entry.isIntersecting) {
                            next.add(rowId);
                        } else {
                            next.delete(rowId);
                        }
                    });

                    return next;
                });

                const intersectingRowIds = entries
                    .filter((entry) => entry.isIntersecting)
                    .map((entry) => Number(entry.target.dataset.rowId))
                    .filter((rowId) => !Number.isNaN(rowId));

                if (intersectingRowIds.length > 0) {
                    const highestVisibleRowId = Math.max(...intersectingRowIds);
                    setMaxUnlockedRowId((current) => Math.max(current, highestVisibleRowId + 1));
                }
            },
            {
                root: container,
                threshold: 0.35,
            }
        );

        rowRefs.current.forEach((el, index) => {
            if (!el) return;
            el.dataset.rowId = String(index);
            observer.observe(el);
        });

        if (footerRef.current) {
            footerRef.current.dataset.rowId = String(FOOTER_ROW_ID);
            observer.observe(footerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const updateNearBottom = () => {
            const remainingScroll = container.scrollHeight - container.scrollTop - container.clientHeight;
            setIsNearBottom(remainingScroll <= Math.max(container.clientHeight * 0.5, 240));
        };

        updateNearBottom();
        container.addEventListener('scroll', updateNearBottom, { passive: true });

        return () => container.removeEventListener('scroll', updateNearBottom);
    }, []);

    const selectedRow = selected ? rows[selected.rowIndex] : null;
    const selectedEntry = selectedRow ? selectedRow.urls[selected.mediaIndex] : null;
    const selectedDescription = selectedRow?.descriptions?.[selected?.mediaIndex];
    const isBottomRow = selected ? selected.rowIndex === rows.length - 1 : false;

    const mobilePages = rows.flatMap((row) => {
        if (row.cycler) {
            return [{
                rowIndex: row.id,
                mediaIndex: 0,
                description: row.descriptions?.[0] || '',
                cycler: true,
                urls: row.urls,
                height: row.height,
            }];
        }

        return row.urls.map((entry, mediaIndex) => ({
            rowIndex: row.id,
            mediaIndex,
            entry,
            description: row.descriptions?.[mediaIndex] || '',
            cycler: false,
        }));
    });

    const overlayRows = isMobile
        ? [...rows, { id: FOOTER_ROW_ID, label: '[] - contact', urls: ['footer-marker'], height: 1, mobileHeight: 1 }]
        : rows;

    const selectedMobilePageIndex = selected
        ? mobilePages.findIndex((item) =>
            item.rowIndex === selected.rowIndex && (item.cycler || item.mediaIndex === selected.mediaIndex)
        )
        : -1;
    const showReturnToTop = selectedMobilePageIndex === mobilePages.length - 1;
    const shouldPreloadMobilePage = (pageIndex) => (
        selectedMobilePageIndex >= 0 &&
        pageIndex >= selectedMobilePageIndex - MOBILE_MODAL_PRELOAD_BEHIND &&
        pageIndex <= selectedMobilePageIndex + MOBILE_MODAL_PRELOAD_AHEAD
    );

    const handleReturnToTop = () => {
        setSelected({ rowIndex: 0, mediaIndex: 0 });
    };

    const handleScrollToTop = useCallback(() => {
        setPageFlashKey((current) => current + 1);

        const container = scrollContainerRef.current;
        if (!container) return;

        container.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, []);

    const handleMobilePagerScroll = (e) => {
        if (!selected || !isMobile) return;

        const pageWidth = e.currentTarget.clientWidth;
        if (!pageWidth) return;

        const nextIndex = Math.round(e.currentTarget.scrollLeft / pageWidth);
        const nextPage = mobilePages[nextIndex];
        if (!nextPage) return;

        if (nextPage.rowIndex !== selected.rowIndex || nextPage.mediaIndex !== selected.mediaIndex) {
            setSelected({ rowIndex: nextPage.rowIndex, mediaIndex: nextPage.mediaIndex });
        }
    };

    useEffect(() => {
        if (!isMobile || !selected || selectedMobilePageIndex < 0) return;

        const pager = mobilePagerRef.current;
        if (!pager) return;

        const pageWidth = pager.clientWidth;
        pager.scrollTo({
            left: pageWidth * selectedMobilePageIndex,
            behavior: 'auto',
        });
    }, [isMobile, mobilePages.length, selected, selectedMobilePageIndex]);

    const renderRow = (row) => {
        const shouldLoadVideos = row.id <= maxUnlockedRowId;
        const rowHeight = getRowHeight(row);

        if (row.custom === 'jxu-archive') {
            return (
                <JxuArchiveRow
                    height={rowHeight}
                    shouldLoadVideos={shouldLoadVideos}
                    onSelect={(mediaIndex) => setSelected({ rowIndex: row.id, mediaIndex })}
                />
            );
        }

        if (row.cycler) {
            return (
                <ImageCycler
                    images={row.urls}
                    interval={1000}
                    height={rowHeight}
                    onSelect={(mediaIndex) => setSelected({ rowIndex: row.id, mediaIndex })}
                />
            );
        }

        return (
            <ImageRow
                urls={row.urls}
                height={rowHeight}
                margins={row.margins}
                shouldLoadVideos={shouldLoadVideos}
                onSelect={(mediaIndex) => setSelected({ rowIndex: row.id, mediaIndex })}
            />
        );
    };

    const handleOverlaySelect = (rowId, mediaIndex) => {
        if (rowId === FOOTER_ROW_ID) {
            if (selected) return;

            const container = scrollContainerRef.current;
            const el = footerRef.current;
            if (!container || !el) return;

            container.scrollTo({
                top: el.offsetTop,
                behavior: 'smooth',
            });
            return;
        }

        if (selected) {
            setSelected({
                rowIndex: rowId,
                mediaIndex: rows[rowId].cycler ? 0 : mediaIndex,
            });
            return;
        }

        const container = scrollContainerRef.current;
        const el = rowRefs.current[rowId];
        if (!container || !el) return;

        container.scrollTo({
            top: el.offsetTop,
            behavior: 'smooth',
        });
    };

    const handleOverlayScrub = (rowId, mediaIndex) => {
        if (rowId === FOOTER_ROW_ID) {
            if (selected) return;

            const container = scrollContainerRef.current;
            const el = footerRef.current;
            if (!container || !el) return;

            container.scrollTo({
                top: el.offsetTop,
                behavior: 'auto',
            });
            return;
        }

        if (selected) {
            setSelected({
                rowIndex: rowId,
                mediaIndex: rows[rowId].cycler ? 0 : mediaIndex,
            });
            return;
        }

        const container = scrollContainerRef.current;
        const el = rowRefs.current[rowId];
        if (!container || !el) return;

        container.scrollTo({
            top: el.offsetTop,
            behavior: 'auto',
        });
    };

    return (
        <div ref={scrollContainerRef} className="flex h-screen w-screen snap-y snap-mandatory flex-col overflow-y-auto px-2 font-mono text-[8.5pt] scrollbar-hide lg:snap-none">
            <div
                key={`page-flash-${pageFlashKey}`}
                className={`${pageFlashKey > 0 ? 'page-flash-grey ' : ''}pointer-events-none fixed inset-0 z-[40]`}
            />
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

            <SiteMapOverlay
                rows={overlayRows}
                visibleRowIds={visibleRowIds}
                onDotClick={handleOverlaySelect}
                onDotScrub={handleOverlayScrub}
                selected={selected}
                desktopPosition="underRightHeader"
            />

            <div className="lg:space-y-12 lg:pt-2">
                {showcases.map((showcase, index) => (
                    <ProjectShowcase
                        key={showcase.id}
                        title={showcase.title}
                        titleClassName={showcase.titleClassName}
                        className={index === showcases.length - 1 ? 'lg:mb-3' : 'lg:mb-12'}
                    >
                        {showcase.rows.map((row) => (
                            <div
                                key={row.id}
                                ref={el => rowRefs.current[row.id] = el}
                                data-row-id={row.id}
                                className={`flex w-full justify-center lg:block ${row.className || ''}`}
                            >
                                {renderRow(row)}
                            </div>
                        ))}
                    </ProjectShowcase>
                ))}

                <section ref={footerRef} className="snap-start flex min-h-[100svh] flex-col items-center justify-center px-4 pt-[96px] pb-10 text-center lg:min-h-0 lg:justify-end lg:px-0 lg:pt-0 lg:pb-24 lg:text-left lg:snap-none">
                    <div className="flex w-full max-w-[520px] flex-col items-center gap-6 lg:hidden">
                        <div className="space-y-2">
                            <p>interested in working together?</p>
                            <a
                                href="mailto:dancr.wley@gmail.com"
                                className="inline-block underline underline-offset-2"
                            >
                                dancr.wley@gmail.com
                            </a>
                        </div>

                        <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[8.5pt] uppercase tracking-[0.08em] transition-opacity duration-75 hover:opacity-0"
                            style={{ cursor: triangleCursor }}
                            onClick={handleScrollToTop}
                        >
                            return to top
                        </button>
                    </div>

                    <div
                        className={`pointer-events-none fixed inset-x-0 top-1/2 hidden -translate-y-1/2 lg:block transition-all duration-500 ease-out ${
                            isNearBottom ? 'translate-y-[-50%] opacity-100' : 'translate-y-[calc(-50%+56px)] opacity-0'
                        }`}
                    >
                        <div className="relative mx-auto flex w-full items-center justify-center px-6 text-[8.5pt]">
                            <button
                                type="button"
                                className="pointer-events-auto inline-flex items-center gap-1 uppercase tracking-[0.08em] transition-opacity duration-75 hover:opacity-0"
                                style={{ cursor: triangleCursor }}
                                onClick={handleScrollToTop}
                            >
                                return to top
                            </button>
                        </div>
                    </div>

                    <div
                        className={`pointer-events-none fixed right-3 bottom-2 hidden lg:block text-[8.5pt] transition-all duration-500 ease-out ${
                            isNearBottom ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                        }`}
                    >
                        <div className="pointer-events-auto flex flex-row items-baseline justify-end gap-x-2 text-right">
                            <p className="italic">wanna talk?</p>
                            <>e:</>
                            <a
                                href="mailto:dancr.wley@gmail.com"
                                className="inline-block underline underline-offset-2"
                            >
                                dancr.wley@gmail.com
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {selected && selectedEntry && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}
                    onClick={clearSelection}
                >
                    {isMobile ? (
                        <div className="flex h-full w-full flex-col justify-center" onClick={e => e.stopPropagation()}>
                            <div
                                ref={mobilePagerRef}
                                className="flex w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
                                onScroll={handleMobilePagerScroll}
                            >
                                {mobilePages.map((page, pageIndex) => (
                                    <div
                                        key={`${page.rowIndex}-${page.mediaIndex}`}
                                        className="flex h-full min-w-full snap-center flex-col items-center justify-center gap-2 px-4"
                                    >
                                        {page.cycler ? (
                                            <ImageCycler
                                                images={page.urls}
                                                interval={1000}
                                                height="72vh"
                                                onSelect={clearSelection}
                                                className="w-[94vw] object-contain"
                                            />
                                        ) : isVideoEntry(page.entry) ? (
                                            <VideoPlayer
                                                entry={page.entry}
                                                className="h-[72vh] w-[94vw] object-contain"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                shouldLoad={shouldPreloadMobilePage(pageIndex)}
                                                onClick={clearSelection}
                                            />
                                        ) : (
                                            <Image
                                                src={page.entry}
                                                alt=""
                                                className="h-[72vh] w-[94vw] object-contain"
                                                width={0}
                                                height={0}
                                                sizes="100vw"
                                                onClick={clearSelection}
                                            />
                                        )}

                                        {page.description && (
                                            <p className="text-[10pt]">{page.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {showReturnToTop && (
                                <button
                                    type="button"
                                    className="mt-3 self-center text-[8.5pt]"
                                    onClick={handleReturnToTop}
                                >
                                    return to top
                                </button>
                            )}
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center gap-2"
                            onClick={e => e.stopPropagation()}
                        >
                            {isVideoEntry(selectedEntry) ? (
                                <VideoPlayer
                                    entry={selectedEntry}
                                    className="h-[60vh] w-auto"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    shouldLoad
                                    onClick={clearSelection}
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
                                    onClick={clearSelection}
                                />
                            )}

                            {selectedDescription && (
                                <p className="text-[10pt]">{selectedDescription}</p>
                            )}
                        </div>
                    )}

                    {!isMobile && (
                        <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 gap-6 text-[10pt] select-none pointer-events-none" onClick={e => e.stopPropagation()}>
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
                    )}
                </div>
            )}
        </div>
    );
}
