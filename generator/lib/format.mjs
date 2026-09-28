export const fmtNum = (n) => new Intl.NumberFormat('en-US').format(n);

export const fmtDate = (iso, timeZone) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone })
    .format(new Date(iso))
    .toUpperCase();

export const fmtBytes = (b) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);

export const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
