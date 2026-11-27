import { useId, type SVGProps, type ReactNode } from "react";

/**
 * Ayodhya Health Portal — custom modern 3D-style SVG icon set.
 * All icons are React components and can be used in the existing nav config.
 */
export type PortalIconProps = SVGProps<SVGSVGElement>;

type IconShellProps = PortalIconProps & {
  render: (ids: { front: string; side: string; highlight: string; shadow: string }) => ReactNode;
  title?: string;
};

function IconShell({ render, title, ...props }: IconShellProps) {
  const rawId = useId().replace(/:/g, "");
  const ids = {
    front: `${rawId}-front`,
    side: `${rawId}-side`,
    highlight: `${rawId}-highlight`,
    shadow: `${rawId}-shadow`,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24"
      height="24"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient id={ids.front} x1="8" y1="5" x2="39" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8DE2FF" />
          <stop offset=".48" stopColor="#368DEB" />
          <stop offset="1" stopColor="#2454B8" />
        </linearGradient>
        <linearGradient id={ids.side} x1="24" y1="8" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4EBAF4" />
          <stop offset="1" stopColor="#173B8C" />
        </linearGradient>
        <linearGradient id={ids.highlight} x1="10" y1="4" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity=".96" />
          <stop offset="1" stopColor="#D9F5FF" stopOpacity=".25" />
        </linearGradient>
        <linearGradient id={ids.shadow} x1="12" y1="10" x2="35" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7DD3FC" />
          <stop offset="1" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="42.2" rx="15.5" ry="3.1" fill="#0F397A" opacity=".12" />
      {render(ids)}
    </svg>
  );
}

export function DashboardIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="M5.5 21.2 24 7l18.5 14.2v18.1a2.7 2.7 0 0 1-2.7 2.7H8.2a2.7 2.7 0 0 1-2.7-2.7V21.2Z" fill={`url(#${front})`} />
    <path d="m24 7 18.5 14.2v18.1a2.7 2.7 0 0 1-2.7 2.7H24V7Z" fill={`url(#${side})`} opacity=".62"/>
    <path d="m9 21.5 15-11.4 15 11.4" stroke={`url(#${highlight})`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="11" y="25" width="10" height="8" rx="1.8" fill="#DDF7FF"/>
    <rect x="26" y="24" width="10" height="14" rx="1.8" fill="#B9E8FF"/>
    <path d="M14 29h4m-4 2h4m11-4h4m-4 3h4m-4 3h4" stroke="#3979C9" strokeWidth="1.4" strokeLinecap="round"/>
  </>} />;
}

export function ImmunizationIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="m13 10 25 25-6 6-25-25 6-6Z" fill={`url(#${front})`}/>
    <path d="m32 35 6-6 4 4a3 3 0 0 1-4.2 4.2L32 35Z" fill={`url(#${side})`}/>
    <path d="m7 16 6-6 4 4-6 6-4-4Z" fill="#D8F4FF"/>
    <path d="m11 12 25 25" stroke={`url(#${highlight})`} strokeWidth="2.2" strokeLinecap="round"/>
    <path d="m18 15-6 6m12 0-6 6m12 0-6 6" stroke="#EAFBFF" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="m8 8 4 4m-6 1 4 4" stroke="#2563B9" strokeWidth="2" strokeLinecap="round"/>
    <path d="M25 7v7m-3.5-3.5h7" stroke="#22A6D5" strokeWidth="2.6" strokeLinecap="round"/>
  </>} />;
}

export function DeliveryIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    {/* Maternal care: pregnant woman silhouette with a gentle protective arc */}
    <path d="M17 8c4.1-2.1 9.2-.5 11.1 3.5 1.1 2.3.8 5.1-.7 7.1 4.7 2.4 7.1 7.1 6.6 12.1-.4 4.1-3.1 7.2-7.4 8.2-4.1 1-9.5-.1-12.3-3.4-2.1-2.5-2.4-6.3-.8-9.2 1.2-2.2 3.1-3.6 5.4-4.6-2.4-1.8-3.6-4.7-3.2-7.5.2-2.6 1.4-4.6 3.3-6.2Z" fill={`url(#${front})`}/>
    <path d="M27.4 19c4.7 2.4 7.1 7.1 6.6 11.7-.4 4.1-3.1 7.2-7.4 8.2V19Z" fill={`url(#${side})`} opacity=".55"/>
    <circle cx="23" cy="12.8" r="4.1" fill="#E8F9FF"/>
    <path d="M12 14c-3.8 5.1-4.8 11.5-2.4 17.2 2.1 5.1 6.6 8.1 12.1 9.1" stroke={`url(#${highlight})`} strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M21 26c4.1-2.1 9.2-.8 11.2 2.7 1.4 2.5.5 5.7-2.2 7.1-2.5 1.3-6.2.8-8.1-1.2-2.2-2.2-2.5-6.4-.9-8.6Z" fill="#BDEBFF" opacity=".95"/>
    <path d="M30 8.5c2.2 1.3 3.5 3.3 3.8 5.8" stroke="#9BE5FF" strokeWidth="2" strokeLinecap="round"/>
  </>} />;
}

export function AyushmanBharatIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="M24 5 41 11v12.5c0 10.3-7.1 16.2-17 19.5C14.1 39.7 7 33.8 7 23.5V11l17-6Z" fill={`url(#${front})`}/>
    <path d="M24 5 41 11v12.5c0 10.3-7.1 16.2-17 19.5V5Z" fill={`url(#${side})`} opacity=".45"/>
    <path d="M24 13v18m-9-9h18" stroke="#F2FCFF" strokeWidth="4.2" strokeLinecap="round"/>
    <path d="M11 13 24 8.5 37 13" stroke={`url(#${highlight})`} strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 34c2.2 2 4.5 3.2 7 4.1 2.5-.9 4.8-2.1 7-4.1" stroke="#BCEBFF" strokeWidth="1.8" strokeLinecap="round"/>
  </>} />;
}

export function NcdScreeningIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="M24 7c-8.3 0-15 6.7-15 15 0 8.7 7.1 15.8 15 21 7.9-5.2 15-12.3 15-21 0-8.3-6.7-15-15-15Z" fill={`url(#${front})`}/>
    <path d="M24 7c8.3 0 15 6.7 15 15 0 8.7-7.1 15.8-15 21V7Z" fill={`url(#${side})`} opacity=".55"/>
    <path d="M12 24h6l3-7 5.5 15 3.5-8H36" stroke="#F2FCFF" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 13c2.5-2.2 5.7-3.5 9-3.5" stroke={`url(#${highlight})`} strokeWidth="2" strokeLinecap="round"/>
  </>} />;
}

export function DvdmsIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    {/* DVDMS: medicine bottle and capsule */}
    <path d="M14 9h16v5l3 3v19a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V17l3-3V9Z" fill={`url(#${front})`}/>
    <path d="M22 9h8v5l3 3v19a3 3 0 0 1-3 3h-8V9Z" fill={`url(#${side})`} opacity=".55"/>
    <path d="M14 9h16v5H14z" fill="#DFF7FF"/>
    <path d="M14 23h16v9H14z" fill="#EAFBFF"/>
    <path d="M22 23h8v9h-8z" fill="#BDEBFF"/>
    <path d="M18 27.5h8m-4-4v8" stroke="#347BC5" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 12.5c2.2-2.2 5.7-2.2 7.9 0l3.2 3.2-7.9 7.9-3.2-3.2c-2.2-2.2-2.2-5.7 0-7.9Z" fill="#F1FCFF"/>
    <path d="m11.2 20.4 7.9-7.9" stroke="#4B8FD5" strokeWidth="1.8"/>
    <path d="M16 10.5h11" stroke={`url(#${highlight})`} strokeWidth="1.8" strokeLinecap="round"/>
  </>} />;
}

export function KarmayogiIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    {/* Karmayogi Bharat: open learning wings, central pen and spectacles motif */}
    <path d="M23 8 18 4l-1 10-7-5 2 10-7-1 7 8 10 1 1-19Z" fill={`url(#${front})`}/>
    <path d="m25 8 5-4 1 10 7-5-2 10 7-1-7 8-10 1-1-19Z" fill={`url(#${side})`}/>
    <path d="M8 15c4 1 8 4 12 9M7 21c4 0 8 2 12 6M40 15c-4 1-8 4-12 9m13-3c-4 0-8 2-12 6" stroke="#FFF1C9" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M24 6 20 30l4-4 4 4-4-24Z" fill="#F3B642"/>
    <path d="M24 12 21.5 28 24 25l2.5 3L24 12Z" fill="#2454B8"/>
    <path d="M10 34c3-5 9-5 12 0m4 0c3-5 9-5 12 0" stroke="#1F2937" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 34h4" stroke="#1F2937" strokeWidth="1.8"/>
    <path d="M17 8c2-1.4 4-2 6-2" stroke={`url(#${highlight})`} strokeWidth="1.7" strokeLinecap="round"/>
  </>} />;
}

export function NppcdIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    {/* NPPCD: ear and sound-wave motif for hearing care */}
    <path d="M24 7c-8.2 0-14 5.7-14 13.2 0 4.8 2.5 7.7 5.3 10.4 2.1 2 3.4 3.6 3.8 6.1.4 2.4 2.1 3.8 4.5 3.8 3.1 0 5.2-2.1 5.2-5.1 0-2.3-1.1-3.7-2.8-5.1-1.5-1.2-2.4-2.3-2.4-4.2 0-2.4 1.6-4.1 4-4.1 2.6 0 4.3 2 4.3 4.7" fill={`url(#${front})`}/>
    <path d="M24 7c8.2 0 14 5.7 14 13.2 0 4.8-2.5 7.7-5.3 10.4-2.1 2-3.4 3.6-3.8 6.1-.4 2.4-2.1 3.8-4.5 3.8H24V7Z" fill={`url(#${side})`} opacity=".5"/>
    <path d="M24 13c-5.4 0-9.2 3.8-9.2 8.8 0 3.3 1.8 5.3 3.8 7.2 1.5 1.4 2.5 2.7 2.7 4.4" stroke="#EAFBFF" strokeWidth="2.4" strokeLinecap="round"/>
    <path d="M31 12c3.4 2.7 5.2 6.3 5.2 10.4M35 7.5c5 3.8 7.5 8.8 7.5 14.7" stroke={`url(#${highlight})`} strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M8.5 15.5c-2.3 2-3.5 4.4-3.5 7.2" stroke="#56B7EC" strokeWidth="2.2" strokeLinecap="round"/>
  </>} />;
}

export function UpkskIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    {/* UPKSK: Uttar Pradesh outline-inspired region with a healthcare location pin */}
    <path d="m10 10 4-2 3 2 4-1 3 3 5-1 2 4 5 1 1 5 4 3-2 5-5 1-2 4-6-1-3 3-5-2-3 1-2-4-5-1-1-5-3-2 2-5-2-4 3-4Z" fill={`url(#${front})`}/>
    <path d="m24 11 5 1 2 4 5 1 1 5 4 3-2 5-5 1-2 4-6-1-2 2V11Z" fill={`url(#${side})`} opacity=".5"/>
    <path d="M24 5c-5.4 0-9.2 4.1-9.2 9.1 0 6.1 9.2 15.3 9.2 15.3s9.2-9.2 9.2-15.3C33.2 9.1 29.4 5 24 5Z" fill="#FF6B70"/>
    <circle cx="24" cy="14" r="5.7" fill="#FFF8F5"/>
    <path d="M24 10.8v6.4m-3.2-3.2h6.4" stroke="#EF4444" strokeWidth="2.1" strokeLinecap="round"/>
    <path d="M10 10.5c3-2.4 6-3.6 9-3.8" stroke={`url(#${highlight})`} strokeWidth="1.8" strokeLinecap="round"/>
  </>} />;
}

export function ArogyaMelaIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="M24 6c-9.4 0-17 7.6-17 17 0 9.4 7.6 17 17 17s17-7.6 17-17C41 13.6 33.4 6 24 6Z" fill={`url(#${front})`}/>
    <path d="M24 6c9.4 0 17 7.6 17 17 0 9.4-7.6 17-17 17V6Z" fill={`url(#${side})`} opacity=".45"/>
    <path d="M24 13v20m-10-10h20" stroke="#F1FCFF" strokeWidth="4" strokeLinecap="round"/>
    <path d="M13 12c3-3 6.8-4.6 11-4.6" stroke={`url(#${highlight})`} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="35.5" cy="12.5" r="3.5" fill="#A9F0FF"/>
  </>} />;
}

export function AbhaIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="M24 5 40 14v20L24 43 8 34V14L24 5Z" fill={`url(#${front})`}/>
    <path d="M24 24 40 14v20L24 43V24Z" fill={`url(#${side})`} opacity=".55"/>
    <path d="m8 14 16 10 16-10M24 24v19" stroke={`url(#${highlight})`} strokeWidth="2"/>
    <circle cx="24" cy="20" r="5" fill="#EAFBFF"/>
    <path d="M15 34c1.5-5 4.5-7 9-7s7.5 2 9 7" stroke="#EAFBFF" strokeWidth="2.4" strokeLinecap="round"/>
  </>} />;
}

export function MedleparIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="M12 7h17l8 8v25H12a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3Z" fill={`url(#${front})`}/>
    <path d="m29 7 8 8h-8V7Z" fill={`url(#${side})`}/>
    <path d="M16 20h14m-14 6h14m-14 6h9" stroke="#F0FBFF" strokeWidth="2" strokeLinecap="round"/>
    <path d="m27 34 3 3 6-7" stroke="#BDF5FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11h11" stroke={`url(#${highlight})`} strokeWidth="2" strokeLinecap="round"/>
  </>} />;
}

export function NpcbIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="M24 6 40 12v12c0 9-6.6 14.7-16 18-9.4-3.3-16-9-16-18V12l16-6Z" fill={`url(#${front})`}/>
    <path d="M24 6 40 12v12c0 9-6.6 14.7-16 18V6Z" fill={`url(#${side})`} opacity=".48"/>
    <path d="M14 24h20" stroke="#F1FCFF" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M24 14c-4.8 0-8 3.5-8 7.7 0 5.3 8 11.3 8 11.3s8-6 8-11.3c0-4.2-3.2-7.7-8-7.7Z" fill="#DDF7FF"/>
    <circle cx="24" cy="22" r="2.5" fill="#3B82C8"/>
    <path d="M12 13 24 8.5 36 13" stroke={`url(#${highlight})`} strokeWidth="2" strokeLinecap="round"/>
  </>} />;
}

export function SettingsPortalIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="m20 6 8 0 1.4 4.1 3.7 1.5 3.9-1.8 4 6.9-3 3 .2 4-2.7 3 1.1 4.2-7.8 4.1-2.8-3-4 .2-3 2.8-7.2-4.2 1.1-4-2.8-3 .2-4-3-3 4-6.9 3.9 1.8 3.7-1.5L20 6Z" fill={`url(#${front})`}/>
    <path d="M24 7h4l1.4 3.1 3.7 1.5 3.9-1.8 4 6.9-3 3 .2 4-2.7 3 1.1 4.2-7.8 4.1-2.8-3V7Z" fill={`url(#${side})`} opacity=".4"/>
    <circle cx="24" cy="22.5" r="8" fill="#E7F9FF"/>
    <circle cx="24" cy="22.5" r="3.5" fill="#4B8BD0"/>
    <path d="M18 10c2-1.2 4-1.7 6-1.7" stroke={`url(#${highlight})`} strokeWidth="2" strokeLinecap="round"/>
  </>} />;
}

export function IntegrationsIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="M18 7h12v10h-4v5h-4v-5h-4V7Z" fill={`url(#${front})`}/>
    <path d="M8 27h12v10H8V27Zm20 0h12v10H28V27Z" fill={`url(#${side})`}/>
    <path d="M14 27v-4h20v4" stroke={`url(#${highlight})`} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M18 11h12m-6-4v10" stroke="#EAFBFF" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="14" cy="32" r="2" fill="#EAFBFF"/>
    <circle cx="34" cy="32" r="2" fill="#EAFBFF"/>
  </>} />;
}

export function HelpSupportIcon(props: PortalIconProps) {
  return <IconShell {...props} render={({front, side, highlight}) => <>
    <path d="M24 5c-10.5 0-19 8.5-19 19s8.5 19 19 19 19-8.5 19-19S34.5 5 24 5Z" fill={`url(#${front})`}/>
    <path d="M24 5c10.5 0 19 8.5 19 19s-8.5 19-19 19V5Z" fill={`url(#${side})`} opacity=".5"/>
    <path d="M17.5 18a6.7 6.7 0 1 1 11.2 5c-2.2 1.9-4.7 2.8-4.7 6" stroke="#F1FCFF" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="24" cy="35" r="1.9" fill="#F1FCFF"/>
    <path d="M13 12c3-3 6.5-4.5 10.5-4.5" stroke={`url(#${highlight})`} strokeWidth="2" strokeLinecap="round"/>
  </>} />;
}

/** Optional generic alias for navigation data. */
export const PortalIcons = {
  DashboardIcon,
  ImmunizationIcon,
  DeliveryIcon,
  AyushmanBharatIcon,
  NcdScreeningIcon,
  DvdmsIcon,
  KarmayogiIcon,
  NppcdIcon,
  UpkskIcon,
  ArogyaMelaIcon,
  AbhaIcon,
  MedleparIcon,
  NpcbIcon,
  SettingsPortalIcon,
  IntegrationsIcon,
  HelpSupportIcon,
};
