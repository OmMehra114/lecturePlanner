import { z } from 'zod';

export const CourseFormSchema = z.object({
  subjectName: z.string().trim().min(2, 'Course / Subject name is required (at least 2 characters)'),
  subjectCode: z.string().trim().optional().default(''),
  department: z.string().trim().optional().default(''),
  credits: z.coerce.number().min(1, 'Credits must be at least 1').max(20, 'Credits cannot exceed 20').default(3),
  totalHours: z.coerce.number().min(5, 'Total hours must be at least 5').max(200, 'Total hours cannot exceed 200').default(40),
  startDate: z.string().min(1, 'Semester start date is required'),
  endDate: z.string().optional().default(''),
  teachingDays: z.array(z.number()).min(1, 'Please select at least one teaching day of the week'),
  includeFridays: z.boolean().default(true),
  fridayOption: z.enum(['full', 'half', 'exclude']).default('full'),
  customHolidays: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Holiday title is required'),
    date: z.string().min(1, 'Date is required'),
    endDate: z.string().optional(),
    type: z.enum(['holiday', 'vacation', 'exam', 'blackout']).default('holiday'),
  })).default([]),
  syllabusText: z.string().optional().default(''),
});

export const SendConnectionSchema = z.object({
  targetIdentifier: z
    .string()
    .trim()
    .min(3, 'Please enter a valid email address or instructor ID')
    .refine(
      (val) => val.includes('@') ? z.string().email().safeParse(val).success : val.length >= 3,
      { message: 'Please enter a valid email address' }
    ),
  message: z.string().trim().max(300, 'Note cannot exceed 300 characters').optional().default(''),
});

export const RespondConnectionSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED'], {
    errorMap: () => ({ message: 'Status must be either ACCEPTED or DECLINED' }),
  }),
});

export const SharePlanSchema = z.object({
  planId: z.string().min(1, 'Lecture plan ID is required'),
  receiverId: z.string().min(1, 'Target peer ID is required'),
  permission: z.enum(['VIEW', 'CLONE', 'EDIT']).default('VIEW'),
  message: z.string().trim().max(500, 'Message cannot exceed 500 characters').optional().default(''),
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
