'use client';

import { useEffect, useRef, useState } from 'react';

export default function Reveal({
  children,
  delayMs = 0,
  className = ''
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className={visible ? 'animate-fadeUp' : 'opacity-0 translate-y-2'}
      >
        {children}
      </div>
    </div>
  );
}

