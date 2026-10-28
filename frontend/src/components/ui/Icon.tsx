import type { SVGProps } from 'react';

const paths: Record<string, string[]> = {
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 19h14'],
  history: ['M3 12a9 9 0 1 0 2.6-6.4L3 8', 'M3 3v5h5', 'M12 7v5l3 2'],
  update: ['M20 7v5h-5', 'M4 17v-5h5', 'M5.6 9A7 7 0 0 1 18.2 6L20 8', 'M4 16l1.8 2A7 7 0 0 0 18.4 15'],
  settings: ['M4 6h16', 'M4 12h16', 'M4 18h16', 'M8 4v4', 'M15 10v4', 'M11 16v4'],
  moon: ['M20.8 13.2A8.5 8.5 0 0 1 10.8 3.2 8.5 8.5 0 1 0 20.8 13.2Z'],
  sun: ['M12 3v2', 'M12 19v2', 'm4.9 4.9 1.4 1.4', 'm17.7 17.7 1.4 1.4', 'M3 12h2', 'M19 12h2', 'm4.9 19.1 1.4-1.4', 'm17.7 6.3 1.4-1.4', 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'],
  link: ['M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9l-1.7 1.7', 'M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7'],
  folder: ['M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'],
  paste: ['M8 4h8a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2Z', 'M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1'],
  search: ['m21 21-4.3-4.3', 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z'],
  video: ['M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z', 'm17 10 5-3v10l-5-3'],
  pause: ['M8 5v14', 'M16 5v14'],
  play: ['m8 5 12 7-12 7Z'],
  close: ['m18 6-12 12', 'm6 6 12 12'],
  check: ['m5 12 4 4L19 6'],
  audio: ['M9 18V5l12-2v13', 'M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
};

type IconProps = SVGProps<SVGSVGElement> & { name: keyof typeof paths; size?: number };

export function Icon({ name, size = 18, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name].map((d, index) => <path key={index} d={d} />)}
    </svg>
  );
}
