/**
 * Hand-rolled 24px stroke icons. A whole icon package would be heavier than
 * this file and would not match the hairline weight the rest of the UI uses.
 */

const PATHS = {
  code: (
    <>
      <path d="m8 7-5 5 5 5" />
      <path d="m16 7 5 5-5 5" />
      <path d="M13.5 4.5 10.5 19.5" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17.5 9 5 9-5" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M4 9v6" />
      <path d="M7 6.5v11" />
      <path d="M17 6.5v11" />
      <path d="M20 9v6" />
      <path d="M7 12h10" />
    </>
  ),
  knight: (
    <>
      <path d="M8 21h9" />
      <path d="M10 21c0-4 1-5 3-6.5S16 11 16 8.5C16 5.5 13.8 3 11 3l-.8 2.2L7 6.6l-1 3.2 2.4-.6L10 11l-2 2" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H18a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8.5Z" />
      <path d="M3 9h13" />
      <circle cx="17" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5Z" />
    </>
  ),
  home: (
    <>
      <path d="m4 10.5 8-6.5 8 6.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8.5Z" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.6.6-3 1.4-4.1.2 1.5 1 2.4 2 2.4 1.3 0 1.9-1.2 1.9-3 0-1.7-.3-3.1-.3-4.3Z" />
    </>
  ),
  check: <path d="m5 12.8 4.4 4.4L19 7.4" />,
  x: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  chevronRight: <path d="m9.5 5 7 7-7 7" />,
  chevronLeft: <path d="m14.5 5-7 7 7 7" />,
  chevronDown: <path d="m5 9.5 7 7 7-7" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9.5 7V5h5v2" />
      <path d="M6.5 7l.9 12a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L17.5 7" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4 20h16" />
    </>
  ),
  upload: (
    <>
      <path d="M12 20V9" />
      <path d="m7.5 13.5 4.5-4.5 4.5 4.5" />
      <path d="M4 4h16" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 2.5 4" />
      <path d="M17 6h2.5a2.5 2.5 0 0 1-2.5 4" />
      <path d="M10 20h4" />
      <path d="M12 14v6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  bolt: <path d="M13.5 3 5 13.5h5.5L10 21l8.5-10.5H13L13.5 3Z" />,
  bowl: (
    <>
      <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" />
      <path d="M10 7.5c0-1.4 2-1.6 2-3" />
      <path d="M14 7.5c0-1 1-1.2 1-2" />
    </>
  ),
  car: (
    <>
      <path d="M4 16v2.5" />
      <path d="M20 16v2.5" />
      <path d="M3 15.5v-3l2-4.5a2 2 0 0 1 1.9-1.2h10.2A2 2 0 0 1 19 8l2 4.5v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
      <path d="M4 12.5h16" />
      <circle cx="7.5" cy="14.8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="14.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  heart: (
    <path d="M12 20s-7.5-4.6-7.5-9.5A4.5 4.5 0 0 1 12 7.8a4.5 4.5 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20Z" />
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  dots: (
    <>
      <circle cx="6" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </>
  ),
  arrowDown: (
    <>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m14.5 6.5 3 3" />
    </>
  ),
  share: (
    <>
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </>
  ),
  map: (
    <>
      <path d="m3 6.5 6-2.5v13.5l-6 2.5V6.5Z" />
      <path d="M9 4l6 2.5v13.5L9 17.5" />
      <path d="m15 6.5 6-2.5v13.5l-6 2.5" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4.5h11l-1.8 3.8L16 12H5" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="3" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  send: (
    <>
      <path d="M21 3 10.5 13.5" />
      <path d="M21 3l-6.8 18-3.7-7.5L3 9.8 21 3Z" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.2 2" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-13.8-5.2L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 13.8 5.2L20 16" />
      <path d="M20 20v-4h-4" />
    </>
  ),
}

export function Icon({ name, size = 22, strokeWidth = 1.7, className = '', ...rest }) {
  const path = PATHS[name] ?? PATHS.dots
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  )
}

export default Icon
