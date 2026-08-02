import React from 'react';

export default function SectionHeading({
  eyebrow,
  title,
  subtitle
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-electricBlue to-purple-500" />
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-white/70 text-base md:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

