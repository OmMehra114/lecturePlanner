/**
 * Calendar Utilities: iCalendar (.ics) Generation, Parsing, and JSON Export/Import
 */

/**
 * Format a Date object into iCalendar DTSTART / DTEND string (YYYYMMDD or YYYYMMDDTHHMMSSZ)
 */
export function formatIcsDate(dateStr) {
  if (!dateStr) return '';
  const cleaned = dateStr.replace(/-/g, '');
  return cleaned.length === 8 ? cleaned : cleaned.slice(0, 8);
}

/**
 * Generate standard RFC 5545 .ics file content from events array
 */
export function generateIcs(events = [], calendarTitle = 'Academic Holiday Calendar') {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LecturePlanner//Academic Schedule Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}`,
    'X-WR-TIMEZONE:UTC',
  ];

  events.forEach((ev, idx) => {
    const startDate = formatIcsDate(ev.date || ev.start);
    // If multi-day or endDate specified, use next day for inclusive iCal standard
    const endDate = ev.endDate ? formatIcsDate(ev.endDate) : startDate;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:lp-${ev.id || idx}-${Date.now()}@lectureplanner.local`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    lines.push(`DTSTART;VALUE=DATE:${startDate}`);
    if (endDate && endDate !== startDate) {
      lines.push(`DTEND;VALUE=DATE:${endDate}`);
    }
    lines.push(`SUMMARY:${ev.title || ev.name || 'Academic Blackout Day'}`);
    lines.push(`DESCRIPTION:${ev.type || 'Holiday'} - Blackout from Lecture Scheduling`);
    lines.push(`CATEGORIES:${ev.type || 'ACADEMIC_HOLIDAY'}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger browser download of an .ics calendar file
 */
export function downloadIcs(events = [], filename = 'Academic_Holidays.ics') {
  const icsString = generateIcs(events);
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger browser download of JSON calendar export
 */
export function downloadJsonCalendar(events = [], filename = 'Academic_Holidays.json') {
  const jsonString = JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    events,
  }, null, 2);

  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Basic RFC 5545 iCalendar (.ics) text parser
 */
export function parseIcsContent(icsText) {
  const events = [];
  const veventBlocks = icsText.split(/BEGIN:VEVENT/i).slice(1);

  veventBlocks.forEach((block, index) => {
    const summaryMatch = block.match(/SUMMARY:(.*?)(?:\r?\n|$)/i);
    const dtstartMatch = block.match(/DTSTART(?:;[^:]*)?:(\d{8})/i);
    const dtendMatch = block.match(/DTEND(?:;[^:]*)?:(\d{8})/i);
    const descMatch = block.match(/DESCRIPTION:(.*?)(?:\r?\n|$)/i);
    const catMatch = block.match(/CATEGORIES:(.*?)(?:\r?\n|$)/i);

    if (dtstartMatch) {
      const rawStart = dtstartMatch[1];
      const startDate = `${rawStart.slice(0, 4)}-${rawStart.slice(4, 6)}-${rawStart.slice(6, 8)}`;
      
      let endDate = undefined;
      if (dtendMatch) {
        const rawEnd = dtendMatch[1];
        endDate = `${rawEnd.slice(0, 4)}-${rawEnd.slice(4, 6)}-${rawEnd.slice(6, 8)}`;
      }

      const title = summaryMatch ? summaryMatch[1].trim() : `Imported Event ${index + 1}`;
      const type = catMatch ? catMatch[1].trim().toLowerCase() : 'holiday';

      events.push({
        id: `import-${Date.now()}-${index}`,
        title,
        name: title,
        date: startDate,
        endDate: endDate !== startDate ? endDate : undefined,
        type: type.includes('exam') ? 'exam' : type.includes('break') ? 'vacation' : 'holiday',
        color: type.includes('exam') ? 'var(--color-amber-500)' : type.includes('break') ? 'var(--color-violet-500)' : 'var(--color-rose-500)',
      });
    }
  });

  return events;
}
