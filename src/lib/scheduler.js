import { addDays, format, getDay, parseISO, isAfter } from 'date-fns';
import { isHoliday } from './holidays';

/**
 * Advanced Scheduling Engine for Course Syllabi
 * 
 * @param {Array} topics List of topic objects [{ srNo, topic, lectures, subTopics }]
 * @param {Object} options Configuration options
 * @returns {Object} { topics: Array, stats: Object }
 */
export function scheduleLectures(topics = [], options = {}) {
  const {
    startDate: startDateStr,
    endDate: endDateStr,
    teachingDays = [1, 2, 3, 4, 5], // Default: Mon-Fri
    includeFridays = true,
    customHolidays = [],
    includeDefaultHolidays = true,
  } = typeof options === 'string' ? { startDate: options } : options;

  if (!startDateStr || !topics || topics.length === 0) {
    return {
      topics: topics.map((t, idx) => ({
        ...t,
        srNo: t.srNo || idx + 1,
        targetDates: [],
        dateRange: 'Pending Dates',
        isOverflow: false,
      })),
      stats: {
        totalLectures: topics.reduce((acc, t) => acc + (Number(t.lectures) || 1), 0),
        totalDays: 0,
        semesterExceeded: false,
        overflowLecturesCount: 0,
        completionEstimatedDate: null,
      },
    };
  }

  let currentDate = parseISO(startDateStr);
  const parsedEndDate = endDateStr ? parseISO(endDateStr) : null;

  // Normalize active teaching days
  let activeDays = Array.isArray(teachingDays) ? [...teachingDays] : [1, 2, 3, 4, 5];
  if (!includeFridays) {
    activeDays = activeDays.filter((d) => d !== 5);
  }

  const scheduledTopics = [];
  let totalLecturesScheduled = 0;
  let overflowCount = 0;
  let lastAssignedDate = currentDate;

  for (let tIndex = 0; tIndex < topics.length; tIndex++) {
    const item = topics[tIndex];
    const lectureDates = [];
    const requiredLectures = Math.max(1, parseInt(item.lectures, 10) || 1);
    let itemHasOverflow = false;

    for (let i = 0; i < requiredLectures; i++) {
      let safetyCounter = 0;
      
      // Step forward until we hit a valid teaching date that is not a holiday
      while (safetyCounter < 500) {
        safetyCounter++;
        const dayOfWeek = getDay(currentDate); // 0 (Sun) to 6 (Sat)
        const isTeachingDay = activeDays.includes(dayOfWeek);
        const holidayCheck = isHoliday(currentDate, customHolidays, includeDefaultHolidays);

        if (!isTeachingDay || holidayCheck.isHoliday) {
          currentDate = addDays(currentDate, 1);
          continue;
        }

        // We have a valid teaching day
        const formattedDate = format(currentDate, 'dd MMM yyyy (EEE)');
        lectureDates.push(formattedDate);
        lastAssignedDate = currentDate;

        if (parsedEndDate && isAfter(currentDate, parsedEndDate)) {
          itemHasOverflow = true;
          overflowCount++;
        }

        // Advance to next day for the next lecture
        currentDate = addDays(currentDate, 1);
        totalLecturesScheduled++;
        break;
      }
    }

    const dateRange =
      lectureDates.length === 0
        ? 'No dates available'
        : lectureDates.length === 1
        ? lectureDates[0]
        : `${lectureDates[0]} to ${lectureDates[lectureDates.length - 1]}`;

    scheduledTopics.push({
      ...item,
      srNo: item.srNo || tIndex + 1,
      topic: item.topic,
      subTopics: item.subTopics || [],
      lectures: requiredLectures,
      targetDates: lectureDates,
      dateRange,
      isOverflow: itemHasOverflow,
      completed: item.completed || false,
    });
  }

  const stats = {
    totalLectures: totalLecturesScheduled,
    totalDays: scheduledTopics.reduce((acc, t) => acc + t.targetDates.length, 0),
    semesterExceeded: overflowCount > 0,
    overflowLecturesCount: overflowCount,
    completionEstimatedDate: lastAssignedDate ? format(lastAssignedDate, 'dd MMM yyyy (EEE)') : null,
  };

  return { topics: scheduledTopics, stats };
}