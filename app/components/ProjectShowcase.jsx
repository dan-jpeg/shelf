'use client';

export default function ProjectShowcase({ title, titleClassName = '', className = '', children }) {
  return (
    <section
      className={`snap-start flex min-h-[100svh] flex-col justify-center pt-[96px] pb-10 lg:min-h-0 lg:block lg:py-0 lg:snap-none ${className}`}
    >
      <div className="flex flex-col items-center">
        <p className={`mb-2 w-full text-center lg:text-left ${titleClassName}`}>{title}</p>
        <div className="flex w-full flex-col items-center gap-4 lg:items-stretch lg:gap-0">
          {children}
        </div>
      </div>
    </section>
  );
}
