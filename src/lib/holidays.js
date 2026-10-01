import { parseISO, isWithinInterval, isSameDay } from 'date-fns';

// Standard 2026-2027 Academic & Public Holidays Calendar
export const DEFAULT_HOLIDAYS = [
  { id: 'h-1', name: 'Republic Day', date: '2026-01-26', type: 'national' },
  { id: 'h-2', name: 'Maha Shivratri', date: '2026-02-15', type: 'cultural' },
  { id: 'h-3', name: 'Holi Break', date: '2026-03-04', endDate: '2026-03-05', type: 'vacation' },
  { id: 'h-4', name: 'Id-ul-Fitr', date: '2026-03-21', type: 'cultural' },
  { id: 'h-5', name: 'Good Friday', date: '2026-04-03', type: 'cultural' },
  { id: 'h-6', name: 'Ambedkar Jayanti', date: '2026-04-14', type: 'national' },
  { id: 'h-7', name: 'Mid-Semester Break', date: '2026-04-20', endDate: '2026-04-25', type: 'vacation' },
  { id: 'h-8', name: 'Independence Day', date: '2026-08-15', type: 'national' },
  { id: 'h-9', name: 'Janmashtami', date: '2026-09-04', type: 'cultural' },
  { id: 'h-10', name: 'Gandhi Jayanti', date: '2026-10-02', type: 'national' },
  { id: 'h-11', name: 'Dussehra', date: '2026-10-20', type: 'cultural' },
  { id: 'h-12', name: 'Diwali / Fall Vacation', date: '2026-11-08', endDate: '2026-11-13', type: 'vacation' },
  { id: 'h-13', name: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'cultural' },
  { id: 'h-14', name: 'Christmas & Winter Break', date: '2026-12-25', endDate: '2026-12-31', type: 'vacation' },
];

/**
 * Checks if a given date is a holiday or within a vacation interval
 */
export function isHoliday(date, customHolidays = [], includeDefaults = true) {
  const holidays = includeDefaults ? [...DEFAULT_HOLIDAYS, ...customHolidays] : [...customHolidays];

  for (const item of holidays) {
    if (!item.date) continue;

    try {
      const startDate = typeof item.date === 'string' ? parseISO(item.date) : item.date;
      
      if (item.endDate) {
        const endDate = typeof item.endDate === 'string' ? parseISO(item.endDate) : item.endDate;
        if (isWithinInterval(date, { start: startDate, end: endDate })) {
          return { isHoliday: true, holidayName: item.name, type: item.type || 'holiday' };
        }
      } else {
        if (isSameDay(date, startDate)) {
          return { isHoliday: true, holidayName: item.name, type: item.type || 'holiday' };
        }
      }
    } catch {
      // Invalid date format safety ignore
      continue;
    }
  }

  return { isHoliday: false, holidayName: null, type: null };
}