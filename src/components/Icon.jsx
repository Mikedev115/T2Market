const P = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.8" /><rect x="14" y="3" width="7" height="5" rx="1.8" /><rect x="14" y="12" width="7" height="9" rx="1.8" /><rect x="3" y="16" width="7" height="5" rx="1.8" /></>,
  report: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 18v-3M12 18v-5M15 18v-2" /></>,
  hive: <><path d="M12 2.5l8 4.5v10l-8 4.5-8-4.5V7z" /><path d="M12 8l3.5 2v4L12 16l-3.5-2v-4z" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16.5 14.2c2.6.3 4.5 2.5 4.5 5.3" /></>,
  sprout: <><path d="M12 21v-9" /><path d="M12 12C12 8 9 6 5 6c0 4 2.5 6 7 6z" /><path d="M12 14c0-3.5 2.5-5.5 7-5.5 0 3.5-2.5 5.5-7 5.5z" /></>,
  paw: <><circle cx="6.5" cy="10.5" r="1.8" /><circle cx="10.5" cy="6.5" r="1.8" /><circle cx="15.5" cy="7" r="1.8" /><circle cx="19" cy="11.5" r="1.8" /><path d="M12.2 12c-3 0-5.7 3-5.7 5.2 0 1.6 1.4 2.3 3 2.1 1-.1 1.6-.5 2.6-.5s1.6.4 2.6.5c1.6.2 3-.5 3-2.1 0-2.2-2.5-5.2-5.5-5.2z" /></>,
  bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  more: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  logout: <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  wallet: <><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3" /><path d="M21 9h-5a2 2 0 0 0 0 4h5z" /></>,
  inbox: <><path d="M4 13l2.5-8h11L20 13" /><path d="M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6h-5a3 3 0 0 1-6 0z" /></>,
  cart: <><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M3 4h2.5l2.2 11h10.6l2-8H6.5" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 8" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
};
export default function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}
