/**
 * Utility functions for exporting lecture plans to CSV, Excel, and JSON formats
 */

export function exportToCSV(data) {
  if (!data || !data.topics) return;

  const { meta, topics } = data;
  const headers = ['Sr No', 'Unit', 'Topic Title', 'Lectures / Hours', 'Target Date(s)', 'Date Range', 'Status'];

  const rows = topics.map((t) => [
    t.srNo,
    `"${(t.unit || '').replace(/"/g, '""')}"`,
    `"${(t.topic || '').replace(/"/g, '""')}"`,
    t.lectures,
    `"${(t.targetDates || []).join('; ')}"`,
    `"${t.dateRange || ''}"`,
    t.isOverflow ? 'Exceeds Semester' : (t.completed ? 'Completed' : 'Planned'),
  ]);

  const metaHeader = [
    `Course: ${meta.subjectName || 'Course'} (${meta.subjectCode || 'N/A'})`,
    `Credits: ${meta.credits || 3} | Total Hours: ${meta.totalHours || 40}`,
    `Semester Duration: ${meta.startDate || ''} to ${meta.endDate || 'N/A'}`,
    `Generated On: ${new Date().toLocaleDateString()}`,
    '',
  ].join('\n');

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(metaHeader + '\n' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n'));

  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `${(meta.subjectName || 'Course').replace(/[^a-z0-9]/gi, '_')}_Lecture_Plan.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportToExcel(data) {
  if (!data || !data.topics) return;

  try {
    const XLSX = await import('xlsx');
    const { meta, topics } = data;

    // Header info rows
    const wsData = [
      ['Course Lecture Plan & Syllabus Schedule'],
      ['Subject Name:', meta.subjectName || 'N/A', 'Subject Code:', meta.subjectCode || 'N/A'],
      ['Credits:', meta.credits || '3', 'Total Hours:', meta.totalHours || '40'],
      ['Start Date:', meta.startDate || 'N/A', 'End Date:', meta.endDate || 'N/A'],
      [],
      ['Sr No', 'Unit', 'Topic Covered', 'Hours / Lectures', 'Target Scheduled Dates', 'Date Range', 'Status']
    ];

    topics.forEach((t) => {
      wsData.push([
        t.srNo,
        t.unit || '',
        t.topic,
        t.lectures,
        (t.targetDates || []).join(', '),
        t.dateRange,
        t.isOverflow ? 'Exceeds Semester End' : 'Scheduled'
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lecture Plan');

    XLSX.writeFile(wb, `${(meta.subjectName || 'Course').replace(/[^a-z0-9]/gi, '_')}_Lecture_Plan.xlsx`);
  } catch (err) {
    console.warn('Excel export failed, falling back to CSV:', err);
    exportToCSV(data);
  }
}

export function exportToJSON(data) {
  if (!data) return;
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `${(data.meta?.subjectName || 'Course').replace(/[^a-z0-9]/gi, '_')}_Plan.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
