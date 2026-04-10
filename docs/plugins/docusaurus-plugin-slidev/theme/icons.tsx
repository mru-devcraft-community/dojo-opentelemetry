import React from "react";

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

export function PresentationIcon({ className, width = 24, height = 24 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} className={className} viewBox="0 0 24 24">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path d="M3 4h18M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4m-8 12v4m-3 0h6" />
        <path d="m8 12l3-3l2 2l3-3" />
      </g>
    </svg>
  );
}

export function SortAscIcon({ className, width = 24, height = 24 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 1024 1024" className={className}>
      <path fill="currentColor" d="M839.6 433.8L749 150.5a9.24 9.24 0 0 0-8.9-6.5h-77.4c-4.1 0-7.6 2.6-8.9 6.5l-91.3 283.3c-.3.9-.5 1.9-.5 2.9c0 5.1 4.2 9.3 9.3 9.3h56.4c4.2 0 7.8-2.8 9-6.8l17.5-61.6h89l17.3 61.5c1.1 4 4.8 6.8 9 6.8h61.2c1 0 1.9-.1 2.8-.4c2.4-.8 4.3-2.4 5.5-4.6c1.1-2.2 1.3-4.7.6-7.1M663.3 325.5l32.8-116.9h6.3l32.1 116.9zm143.5 492.9H677.2v-.4l132.6-188.9c1.1-1.6 1.7-3.4 1.7-5.4v-36.4c0-5.1-4.2-9.3-9.3-9.3h-204c-5.1 0-9.3 4.2-9.3 9.3v43c0 5.1 4.2 9.3 9.3 9.3h122.6v.4L587.7 828.9a9.35 9.35 0 0 0-1.7 5.4v36.4c0 5.1 4.2 9.3 9.3 9.3h211.4c5.1 0 9.3-4.2 9.3-9.3v-43a9.2 9.2 0 0 0-9.2-9.3M416 702h-76V172c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v530h-76c-6.7 0-10.5 7.8-6.3 13l112 141.9a8 8 0 0 0 12.6 0l112-141.9c4.1-5.2.4-13-6.3-13" />
    </svg>
  );
}

export function SortDescIcon({ className, width = 24, height = 24 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 1024 1024" className={className}>
      <path fill="currentColor" d="M839.6 433.8L749 150.5a9.24 9.24 0 0 0-8.9-6.5h-77.4c-4.1 0-7.6 2.6-8.9 6.5l-91.3 283.3c-.3.9-.5 1.9-.5 2.9c0 5.1 4.2 9.3 9.3 9.3h56.4c4.2 0 7.8-2.8 9-6.8l17.5-61.6h89l17.3 61.5c1.1 4 4.8 6.8 9 6.8h61.2c1 0 1.9-.1 2.8-.4c2.4-.8 4.3-2.4 5.5-4.6c1.1-2.2 1.3-4.7.6-7.1M663.3 325.5l32.8-116.9h6.3l32.1 116.9zm143.5 492.9H677.2v-.4l132.6-188.9c1.1-1.6 1.7-3.4 1.7-5.4v-36.4c0-5.1-4.2-9.3-9.3-9.3h-204c-5.1 0-9.3 4.2-9.3 9.3v43c0 5.1 4.2 9.3 9.3 9.3h122.6v.4L587.7 828.9a9.35 9.35 0 0 0-1.7 5.4v36.4c0 5.1 4.2 9.3 9.3 9.3h211.4c5.1 0 9.3-4.2 9.3-9.3v-43a9.2 9.2 0 0 0-9.2-9.3M310.3 167.1a8 8 0 0 0-12.6 0L185.7 309c-4.2 5.3-.4 13 6.3 13h76v530c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V322h76c6.7 0 10.5-7.8 6.3-13z" />
    </svg>
  );
}

export function GridViewIcon({ className, width = 24, height = 24 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
    </svg>
  );
}

export function DetailsViewIcon({ className, width = 24, height = 24 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 13h8v-2H3v2zm0 4h8v-2H3v2zm0-8h8V7H3v2zm10 0v2h8V9h-8zm0 8h8v-2h-8v2zm0-4h8v-2h-8v2z" />
    </svg>
  );
}

export function WarningIcon({ className, width = 24, height = 24 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M12 1.67c.955 0 1.845.467 2.39 1.247l.105.16l8.114 13.548a2.914 2.914 0 0 1-2.307 4.363l-.195.008H3.882a2.914 2.914 0 0 1-2.582-4.2l.099-.185l8.11-13.538A2.91 2.91 0 0 1 12 1.67M12.01 15l-.127.007a1 1 0 0 0 0 1.986L12 17l.127-.007a1 1 0 0 0 0-1.986zM12 8a1 1 0 0 0-.993.883L11 9v4l.007.117a1 1 0 0 0 1.986 0L13 13V9l-.007-.117A1 1 0 0 0 12 8" />
    </svg>
  );
}

export function EmptyPresentationIcon({ className, width = 24, height = 24 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" className={className}>
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h1m4 0h13M4 4v10a2 2 0 0 0 2 2h10m3.42-.592c.359-.362.58-.859.58-1.408V4m-8 12v4m-3 0h6m-7-8l2-2m4 0l2-2M3 3l18 18" />
    </svg>
  );
}

export function FolderIcon({ className, width = 24, height = 24, style }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" className={className} style={style}>
      <path fill="currentColor" d="M20 6h-8l-1.41-1.41C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-1 12H5c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1" />
    </svg>
  );
}

export function BackIcon({ className, width = 24, height = 24 }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 48 48" className={className}>
      <path fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="4" d="M44 40.836q-7.34-8.96-13.036-10.168t-10.846-.365V41L4 23.545L20.118 7v10.167q9.523.075 16.192 6.833q6.668 6.758 7.69 16.836Z" clipRule="evenodd" />
    </svg>
  );
}

export function AuthorIcon({ className, width = 16, height = 16, style }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" className={className} style={style}>
      <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1a6 6 0 00-6 6h12a6 6 0 00-6-6z" />
    </svg>
  );
}
