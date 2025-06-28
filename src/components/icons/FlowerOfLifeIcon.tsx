
import React from 'react';

export const FlowerOfLifeIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const r = 50; // radius of a single circle
  const positions = [
    [0, 0],
    ...Array.from({ length: 6 }, (_, i) => [r * Math.cos(i * Math.PI / 3), r * Math.sin(i * Math.PI / 3)]),
    ...Array.from({ length: 6 }, (_, i) => [r * 2 * Math.cos(i * Math.PI / 3), r * 2 * Math.sin(i * Math.PI / 3)]),
    ...Array.from({ length: 6 }, (_, i) => [r * Math.sqrt(3) * Math.cos((i + 0.5) * Math.PI / 3), r * Math.sqrt(3) * Math.sin((i + 0.5) * Math.PI / 3)])
  ].filter((p, i, self) => self.findIndex(t => Math.round(t[0]) === Math.round(p[0]) && Math.round(t[1]) === Math.round(p[1])) === i).slice(0,19);

  return (
    <svg 
      viewBox="-175 -175 350 350"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      {...props}
    >
      <defs>
        <filter id="static-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity="0.15" stroke="white" strokeWidth="1.5" filter="url(#static-glow)">
        {positions.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} />
        ))}
      </g>
    </svg>
  );
};
