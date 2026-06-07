// icons.jsx — unified line-icon set for PROF PARENT IA
// All icons: 24x24 viewBox, stroke = currentColor, consistent 1.7 weight, round caps.
// Exposed on window for cross-file use.

function Ic({ children, size = 24, sw = 1.7, fill = 'none', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={style}>
      {children}
    </svg>
  );
}

const IconScan = (p) => (
  <Ic {...p}>
    <path d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8" />
    <path d="M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8" />
    <path d="M20 16v1.5a2.5 2.5 0 0 1-2.5 2.5H16" />
    <path d="M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16" />
    <path d="M8 9h8" /><path d="M8 12h8" /><path d="M8 15h5" />
  </Ic>
);

const IconBulb = (p) => (
  <Ic {...p}>
    <path d="M9 18h6" /><path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8.9.9 1.5l.1.7h5.2l.1-.7c.1-.6.4-1.1.9-1.5A6 6 0 0 0 12 3Z" />
  </Ic>
);

const IconCap = (p) => (
  <Ic {...p}>
    <path d="M2.5 8.5 12 4l9.5 4.5L12 13 2.5 8.5Z" />
    <path d="M6 10.5V15c0 1.4 2.7 2.8 6 2.8s6-1.4 6-2.8v-4.5" />
    <path d="M21.5 8.5v5" />
  </Ic>
);

const IconCalendar = (p) => (
  <Ic {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 9.5h17" /><path d="M8 3v3.5" /><path d="M16 3v3.5" />
    <path d="M7.5 13.5h2.5M14 13.5h2.5M7.5 17h2.5M14 17h2.5" />
  </Ic>
);

const IconCamera = (p) => (
  <Ic {...p}>
    <path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h1.2l1-1.6c.3-.5.9-.9 1.5-.9h4.6c.6 0 1.2.4 1.5.9l1 1.6H18A2.5 2.5 0 0 1 20.5 8.5v8A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-8Z" />
    <circle cx="12" cy="12.5" r="3.4" />
  </Ic>
);

const IconTarget = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.8" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </Ic>
);

const IconBook = (p) => (
  <Ic {...p}>
    <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5c-.8 0-1.5.4-1.5 1V5.5Z" />
    <path d="M20 5.5C20 4.7 19.3 4 18.5 4H13v15h5.5c.8 0 1.5.4 1.5 1V5.5Z" />
  </Ic>
);

const IconFlask = (p) => (
  <Ic {...p}>
    <path d="M9.5 3v6.2L5.2 17a2 2 0 0 0 1.8 3h10a2 2 0 0 0 1.8-3l-4.3-7.8V3" />
    <path d="M8.5 3h7" /><path d="M7.4 14h9.2" />
  </Ic>
);

const IconSigma = (p) => (
  <Ic {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M15 8H9.2l3.3 4-3.3 4H15" />
  </Ic>
);

const IconCheck = (p) => (
  <Ic {...p}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </Ic>
);

const IconCheckList = (p) => (
  <Ic {...p}>
    <path d="M4 7l1.6 1.6L8.5 5.5" /><path d="M4 16l1.6 1.6L8.5 14.5" />
    <path d="M12 7.5h8" /><path d="M12 16.5h8" />
  </Ic>
);

const IconText = (p) => (
  <Ic {...p}>
    <path d="M5 7h14" /><path d="M5 12h14" /><path d="M5 17h9" />
  </Ic>
);

const IconEdit = (p) => (
  <Ic {...p}>
    <path d="M5 19h3l9.5-9.5a2 2 0 0 0-2.8-2.8L5 16.2V19Z" />
    <path d="M13.8 7.5l2.7 2.7" />
  </Ic>
);

const IconInfo = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="8.5" /><path d="M12 11v5" /><circle cx="12" cy="7.8" r="0.4" fill="currentColor" stroke="currentColor" strokeWidth="1.4" />
  </Ic>
);

const IconStar = (p) => (
  <Ic {...p} fill="currentColor" sw={1}>
    <path d="M12 3.5l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7-4.9 2.7 1-5.4-4-3.8 5.5-.7 2.4-5Z" />
  </Ic>
);

const IconArrowLeft = (p) => (
  <Ic {...p}>
    <path d="M15 5l-7 7 7 7" /><path d="M8 12h11" />
  </Ic>
);

const IconArrowRight = (p) => (
  <Ic {...p}>
    <path d="M9 5l7 7-7 7" /><path d="M16 12H5" />
  </Ic>
);

const IconHome = (p) => (
  <Ic {...p}>
    <path d="M4 11.5 12 4l8 7.5" /><path d="M6 10.5V20h12v-9.5" /><path d="M10 20v-5h4v5" />
  </Ic>
);

const IconUsers = (p) => (
  <Ic {...p}>
    <circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16 5.5a3 3 0 0 1 0 5.8" /><path d="M17 14.2c2.2.5 3.5 2.4 3.5 4.8" />
  </Ic>
);

const IconReview = (p) => (
  <Ic {...p}>
    <path d="M4 5.5h11" /><path d="M4 12h7" /><path d="M4 18.5h7" />
    <path d="M14.5 16.5l2 2 4-4.5" />
  </Ic>
);

const IconUser = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
  </Ic>
);

const IconGallery = (p) => (
  <Ic {...p}>
    <rect x="3.5" y="5" width="17" height="14" rx="3" />
    <circle cx="8.5" cy="10" r="1.6" /><path d="M5 17l4.5-4 3 2.6L16 12l3.5 3.5" />
  </Ic>
);

const IconBolt = (p) => (
  <Ic {...p}>
    <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />
  </Ic>
);

const IconShield = (p) => (
  <Ic {...p}>
    <path d="M12 3.5 19 6v5c0 4.5-3 7.8-7 9.5-4-1.7-7-5-7-9.5V6l7-2.5Z" />
    <path d="M9 12l2 2 4-4.5" />
  </Ic>
);

const IconChevronDown = (p) => (
  <Ic {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Ic>
);

const IconSparkle = (p) => (
  <Ic {...p} fill="currentColor" sw={1}>
    <path d="M12 3c.4 3.6 1.4 4.6 5 5-3.6.4-4.6 1.4-5 5-.4-3.6-1.4-4.6-5-5 3.6-.4 4.6-1.4 5-5Z" />
    <path d="M18.5 13c.2 1.8.7 2.3 2.5 2.5-1.8.2-2.3.7-2.5 2.5-.2-1.8-.7-2.3-2.5-2.5 1.8-.2 2.3-.7 2.5-2.5Z" />
  </Ic>
);

const IconClock = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" />
  </Ic>
);

const IconBell = (p) => (
  <Ic {...p}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" />
  </Ic>
);

const IconGear = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3v2.5M12 18.5V21M4.2 7l2.2 1.3M17.6 15.7l2.2 1.3M4.2 17l2.2-1.3M17.6 8.3l2.2-1.3" />
  </Ic>
);

const IconDownload = (p) => (
  <Ic {...p}>
    <path d="M12 3v11" /><path d="M7.5 10.5 12 15l4.5-4.5" /><path d="M4.5 19.5h15" />
  </Ic>
);

const IconShare = (p) => (
  <Ic {...p}>
    <circle cx="6" cy="12" r="2.6" /><circle cx="17.5" cy="6" r="2.6" /><circle cx="17.5" cy="18" r="2.6" />
    <path d="M8.3 10.8 15.2 7.2M8.3 13.2l6.9 3.6" />
  </Ic>
);

const IconChart = (p) => (
  <Ic {...p}>
    <path d="M4 4v15.5h16" /><path d="M7.5 15l3-3.5 3 2.5 4-5.5" />
  </Ic>
);

const IconTrendUp = (p) => (
  <Ic {...p}>
    <path d="M4 15l5-5 3.5 3.5L20 6" /><path d="M15 6h5v5" />
  </Ic>
);

const IconAlert = (p) => (
  <Ic {...p}>
    <path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4.5" /><circle cx="12" cy="17.4" r="0.4" fill="currentColor" stroke="currentColor" strokeWidth="1.4" />
  </Ic>
);

const IconPlus = (p) => (
  <Ic {...p}>
    <path d="M12 5v14M5 12h14" />
  </Ic>
);

const IconGrid = (p) => (
  <Ic {...p}>
    <rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" />
    <rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" />
  </Ic>
);

const IconMoon = (p) => (
  <Ic {...p}>
    <path d="M20 13.5A8 8 0 1 1 10.5 4 6.5 6.5 0 0 0 20 13.5Z" />
  </Ic>
);

const IconHelp = (p) => (
  <Ic {...p}>
    <circle cx="12" cy="12" r="8.5" /><path d="M9.5 9.3a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.1 1-1.1 1.9" />
    <circle cx="12" cy="16.6" r="0.4" fill="currentColor" stroke="currentColor" strokeWidth="1.4" />
  </Ic>
);

const IconPlay = (p) => (
  <Ic {...p} fill="currentColor" sw={1}>
    <path d="M7 5.5v13l11-6.5-11-6.5Z" />
  </Ic>
);

const IconPdf = (p) => (
  <Ic {...p}>
    <path d="M6 3h8l5 5v13H6V3Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 16.5h4" />
  </Ic>
);

const IconLogout = (p) => (
  <Ic {...p}>
    <path d="M14 5H6v14h8" /><path d="M11 12h9" /><path d="M16.5 8.5 20 12l-3.5 3.5" />
  </Ic>
);

const IconCalendarCheck = (p) => (
  <Ic {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 9.5h17" /><path d="M8 3v3.5M16 3v3.5" />
    <path d="M8.5 14.5l2.2 2.2 4.3-4.3" />
  </Ic>
);

const IconEyeOff = (p) => (
  <Ic {...p}>
    <path d="M3 12s3.5-6.5 9-6.5c1.6 0 3 .5 4.2 1.2M21 12s-3.5 6.5-9 6.5c-1.6 0-3-.5-4.2-1.2" />
    <circle cx="12" cy="12" r="2.6" /><path d="M4 4l16 16" />
  </Ic>
);

const IconChevronRight = (p) => (
  <Ic {...p}>
    <path d="M9 5l7 7-7 7" />
  </Ic>
);

const IconHeart = (p) => (
  <Ic {...p}>
    <path d="M12 20s-7-4.3-7-9.4A3.9 3.9 0 0 1 12 7a3.9 3.9 0 0 1 7 3.6c0 5.1-7 9.4-7 9.4Z" />
  </Ic>
);

const IconLayers = (p) => (
  <Ic {...p}>
    <path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="M3 13l9 5 9-5" /><path d="M3 17.5 12 22l9-4.5" />
  </Ic>
);

Object.assign(window, {
  IconClock, IconBell, IconGear, IconDownload, IconShare, IconChart, IconTrendUp,
  IconAlert, IconPlus, IconGrid, IconMoon, IconHelp, IconPlay, IconPdf, IconLogout,
  IconCalendarCheck, IconEyeOff, IconChevronRight, IconHeart, IconLayers,
  Ic, IconScan, IconBulb, IconCap, IconCalendar, IconCamera, IconTarget,
  IconBook, IconFlask, IconSigma, IconCheck, IconCheckList, IconText, IconEdit,
  IconInfo, IconStar, IconArrowLeft, IconArrowRight, IconHome, IconUsers,
  IconReview, IconUser, IconGallery, IconBolt, IconShield, IconChevronDown,
  IconSparkle, IconClock,
});
