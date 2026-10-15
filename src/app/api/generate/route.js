import { NextResponse } from 'next/server';
import { parseFileToText } from '../../../lib/fileParser';
import { generateTopicsFromSyllabus } from '../../../lib/ai';
import { scheduleLectures } from '../../../lib/scheduler';

export async function POST(req) {
  try {
    const formData = await req.formData();

    const subjectName = formData.get('subjectName') || 'Untitled Course';
    const subjectCode = formData.get('subjectCode') || '';
    const department = formData.get('department') || '';
    const credits = parseInt(formData.get('credits') || '3', 10);
    const totalHours = parseInt(formData.get('totalHours') || '40', 10);
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate') || '';
    const includeFridays = formData.get('includeFridays') !== 'false';
    const includeDefaultHolidays = formData.get('includeDefaultHolidays') !== 'false';

    let teachingDays = [1, 2, 3, 4, 5];
    const rawTeachingDays = formData.get('teachingDays');
    if (rawTeachingDays) {
      try {
        teachingDays = JSON.parse(rawTeachingDays);
      } catch {
        teachingDays = [1, 2, 3, 4, 5];
      }
    }

    let customHolidays = [];
    const rawCustomHolidays = formData.get('customHolidays');
    if (rawCustomHolidays) {
      try {
        customHolidays = JSON.parse(rawCustomHolidays);
      } catch {
        customHolidays = [];
      }
    }

    const file = formData.get('file');
    let syllabusText = formData.get('syllabusText') || '';

    // Extract text from uploaded file if provided
    if (file && file.size > 0) {
      try {
        const extractedText = await parseFileToText(file);
        syllabusText = extractedText + '\n\n' + syllabusText;
      } catch (fileErr) {
        console.error('File parsing error:', fileErr);
        return NextResponse.json(
          { error: `Could not parse uploaded file (${file.name}): ${fileErr.message}` },
          { status: 400 }
        );
      }
    }

    if (!syllabusText.trim()) {
      return NextResponse.json(
        { error: 'Please provide syllabus text or upload a course syllabus document.' },
        { status: 400 }
      );
    }

    // 1. AI Syllabus Extraction & Hour Balancing
    const rawTopics = await generateTopicsFromSyllabus(syllabusText, totalHours);

    // 2. Calendar Scheduling Engine
    const { topics: scheduledTopics, stats } = scheduleLectures(rawTopics, {
      startDate,
      endDate,
      teachingDays,
      includeFridays,
      customHolidays,
      includeDefaultHolidays,
    });

    return NextResponse.json({
      success: true,
      meta: {
        subjectName,
        subjectCode,
        department,
        credits,
        totalHours,
        startDate,
        endDate,
        teachingDays,
        includeFridays,
        customHolidays,
        includeDefaultHolidays,
      },
      topics: scheduledTopics,
      stats,
    });
  } catch (error) {
    console.error('API Error in /api/generate:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while generating the lecture plan.' },
      { status: 500 }
    );
  }
}