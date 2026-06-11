"use client";

import React, { useState, useRef, useLayoutEffect } from "react";

/**
 * Measures its own width with a ResizeObserver and only renders the chart once
 * a positive width is known. This avoids Recharts' "width(-1)/height(-1)"
 * warning that ResponsiveContainer emits when it paints before measuring.
 */
export function ChartBox({
  height = 192,
  children,
}: {
  height?: number;
  children: (size: { width: number; height: number }) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", height }}>
      {width > 0 ? children({ width, height }) : null}
    </div>
  );
}
