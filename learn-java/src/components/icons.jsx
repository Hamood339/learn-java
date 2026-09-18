function Svg({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconDashboard(props) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.6" />
      <rect x="13" y="10" width="7.5" height="10.5" rx="1.6" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.6" />
    </Svg>
  );
}

export function IconBook(props) {
  return (
    <Svg {...props}>
      <path d="M4 4.5c2.2-1 5-1 7 0v15c-2-1-4.8-1-7 0z" />
      <path d="M20 4.5c-2.2-1-5-1-7 0v15c2-1 4.8-1 7 0z" />
    </Svg>
  );
}

export function IconArchive(props) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="4" width="17" height="4.5" rx="1.2" />
      <path d="M5 8.5v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
      <path d="M10 12.5h4" />
    </Svg>
  );
}

export function IconNote(props) {
  return (
    <Svg {...props}>
      <path d="M4 20l1-4.2L16.2 4.6a1.6 1.6 0 0 1 2.3 0l1 1a1.6 1.6 0 0 1 0 2.3L8.2 19z" />
      <path d="M13.8 6.6l3.6 3.6" />
      <path d="M4 20l4.2-1" />
    </Svg>
  );
}

export function IconFolder(props) {
  return (
    <Svg {...props}>
      <path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4.2c.4 0 .8.16 1.06.44l1.2 1.3c.28.3.68.46 1.1.46H19a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17.5z" />
    </Svg>
  );
}

export function IconQuiz(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.3a2.4 2.4 0 0 1 4.7.7c0 1.6-2.1 1.8-2.1 3.3" />
      <path d="M12 16.6v.1" />
    </Svg>
  );
}

export function IconGear(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.1M12 18.4v2.1M20.5 12h-2.1M5.6 12H3.5M17.8 6.2l-1.5 1.5M7.7 16.3l-1.5 1.5M17.8 17.8l-1.5-1.5M7.7 7.7L6.2 6.2" />
    </Svg>
  );
}

export function IconMenu(props) {
  return (
    <Svg {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </Svg>
  );
}

export function IconClose(props) {
  return (
    <Svg {...props}>
      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </Svg>
  );
}

export function IconSun(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.3M12 19.1v2.3M21.4 12h-2.3M4.9 12H2.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" />
    </Svg>
  );
}

export function IconMoon(props) {
  return (
    <Svg {...props}>
      <path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2z" />
    </Svg>
  );
}

export function IconFlame(props) {
  return (
    <Svg {...props}>
      <path d="M12 3c1 2.5-.5 3.6-1.6 5C9 9.9 8.2 11.6 8.2 13.3a3.8 3.8 0 0 0 7.6 0c0-1.2-.4-2-1-2.8.9.5 2.2 1.9 2.2 4a5 5 0 0 1-10 0C7 10.8 9.4 8.7 10.6 7c.9-1.2 1.2-2.4.6-4z" />
    </Svg>
  );
}
