type IconName = 'activity' | 'refresh' | 'settings' | 'search' | 'plus' | 'close' | 'check' | 'arrow-up' | 'arrow-down' | 'alert' | 'list' | 'clock';

const paths: Record<IconName, string> = {
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  refresh: 'M20 7v5h-5 M4 17v-5h5 M6.1 7a7 7 0 0 1 11.6-1L20 9 M4 15l2.3 3A7 7 0 0 0 17.9 17',
  settings: 'M9 4l.6-2h4.8l.6 2 2 .9 2.1-.4 2.4 4.2-1.4 1.6v2.4l1.4 1.6-2.4 4.2-2.1-.4-2 .9-.6 2H9.6l-.6-2-2-.9-2.1.4-2.4-4.2 1.4-1.6v-2.4L2.5 8.7l2.4-4.2L7 4.9 9 4 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  search: 'M21 21l-4.5-4.5 M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0',
  plus: 'M12 5v14 M5 12h14',
  close: 'M6 6l12 12 M6 18 18 6',
  check: 'M5 12l4 4L19 6',
  'arrow-up': 'M7 17 17 7 M7 7h10v10',
  'arrow-down': 'M7 7l10 10 M7 17h10V7',
  alert: 'M12 8v5 M12 16h.01 M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0',
  list: 'M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01',
  clock: 'M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
};

export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
