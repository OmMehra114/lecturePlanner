import { z } from 'zod';

export const CourseFormSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required'),
  subjectCode: z.string().optional().default(''),
  department: z.string().optional().default(''),
  credits: z.coerce.number().min(1).default(3),
  totalHours: z.coerce.number().min(1).default(40),
  startDate: z.string().min(1, 'Semester start date is required'),
  endDate: z.string().optional().default(''),
  teachingDays: z.array(z.number()).default([1, 2, 3, 4, 5]), // 0=Sun, 1=Mon, ..., 6=Sat
  includeFridays: z.boolean().default(true),
  fridayOption: z.enum(['full', 'half', 'exclude']).default('full'),
  customHolidays: z.array(z.object({
    id: z.string(),
    name: z.string(),
    date: z.string(), // YYYY-MM-DD or range
    endDate: z.string().optional(),
    type: z.enum(['holiday', 'vacation', 'exam', 'blackout']).default('holiday'),
  })).default([]),
  syllabusText: z.string().optional().default(''),
});

export const TopicItemSchema = z.object({
  srNo: z.number(),
  unit: z.string().optional(),
  topic: z.string().min(1, 'Topic title is required'),
  subTopics: z.array(z.string()).optional().default([]),
  lectures: z.number().min(1),
});

export const ScheduleItemSchema = TopicItemSchema.extend({
  targetDates: z.array(z.string()).default([]),
  dateRange: z.string().default(''),
  isOverflow: z.boolean().default(false),
  completed: z.boolean().default(false),
  notes: z.string().optional().default(''),
});

export const FullScheduleResultSchema = z.object({
  success: z.boolean(),
  meta: z.object({
    subjectName: z.string(),
    subjectCode: z.string().optional(),
    department: z.string().optional(),
    credits: z.number(),
    totalHours: z.number(),
    startDate: z.string(),
    endDate: z.string().optional(),
    teachingDays: z.array(z.number()),
    includeFridays: z.boolean(),
    customHolidays: z.array(z.any()).optional(),
  }),
  topics: z.array(ScheduleItemSchema),
  stats: z.object({
    totalLectures: z.number(),
    totalDays: z.number(),
    semesterExceeded: z.boolean(),
    overflowLecturesCount: z.number(),
    completionEstimatedDate: z.string(),
  }).optional(),
});
