'use client';

export default function ProjectShowcase({ title, titleClassName = '', className = '', children }) {
  return (
    <section
      className={`snap-start flex min-h-[100svh] flex-col justify-center pt-[96px] pb-10 lg:min-h-0 lg:block lg:py-0 lg:snap-none ${className}`}
    >
      <div className="flex min-h-[calc(100svh-136px)] w-full flex-col items-center lg:min-h-0 lg:pb-5">
        <p className={`hidden w-full pb-2 text-left lg:block ${titleClassName}`}>{title}</p>
        <div className="flex flex-1 w-full flex-col items-center justify-center gap-4 lg:items-stretch lg:gap-2">
          {children}
        </div>
        <p className={`w-full pt-3 text-center lg:hidden ${titleClassName}`}>{title}</p>
      </div>
    </section>
  );
}
