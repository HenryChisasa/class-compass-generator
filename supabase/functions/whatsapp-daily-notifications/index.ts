
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = "https://qsonozmaaqtbztkotgah.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb25vem1hYXF0Ynp0a290Z2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTM3MzUsImV4cCI6MjA2MzgyOTczNX0.MuGQVdk2_YxLB-aydlxVoV9npb85KanfQOwLhBT_PKs";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TodayLesson {
  teacher_name: string;
  teacher_phone: string;
  subject_name: string;
  period: number;
  class_name: string;
}

async function sendWhatsAppMessage(to: string, message: string) {
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

  if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
    throw new Error("Missing Twilio credentials");
  }

  console.log(`Sending WhatsApp message to ${to}`);
  
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "From": `whatsapp:${twilioWhatsAppNumber}`,
      "To": `whatsapp:${to}`,
      "Body": message,
    }),
  });

  const result = await response.json();
  console.log(`WhatsApp message result for ${to}:`, result);
  return result;
}

function getTodayDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  return days[today.getDay()];
}

function formatTime(period: number): string {
  // Assuming periods start at 8:00 AM and are 1 hour each
  const startHour = 8 + (period - 1);
  const endHour = startHour + 1;
  return `${startHour}:00 - ${endHour}:00`;
}

async function getTodayLessons(): Promise<TodayLesson[]> {
  const todayDay = getTodayDayOfWeek();
  
  // Skip weekends
  if (todayDay === 'saturday' || todayDay === 'sunday') {
    console.log('Today is weekend, no lessons to notify about');
    return [];
  }

  console.log(`Fetching lessons for ${todayDay}`);

  // Get today's timetable slots with all related data
  const { data: slots, error } = await supabase
    .from('timetable_slots')
    .select(`
      period,
      lesson_id,
      lessons!inner (
        name,
        lesson_subjects!inner (
          subjects!inner (name)
        ),
        lesson_teachers!inner (
          teachers!inner (
            name,
            whatsapp_numbers!inner (number)
          )
        ),
        lesson_classes!inner (
          classes!inner (name)
        )
      )
    `)
    .eq('day_of_week', todayDay)
    .order('period');

  if (error) {
    console.error('Error fetching today\'s lessons:', error);
    throw error;
  }

  if (!slots || slots.length === 0) {
    console.log('No lessons found for today');
    return [];
  }

  // Transform the data into the format we need
  const lessons: TodayLesson[] = [];
  
  for (const slot of slots) {
    const lesson = slot.lessons;
    if (!lesson) continue;

    const subjects = lesson.lesson_subjects || [];
    const teachers = lesson.lesson_teachers || [];
    const classes = lesson.lesson_classes || [];

    for (const subjectRel of subjects) {
      for (const teacherRel of teachers) {
        for (const classRel of classes) {
          const teacher = teacherRel.teachers;
          const subject = subjectRel.subjects;
          const classData = classRel.classes;
          
          if (teacher && subject && classData && teacher.whatsapp_numbers?.length > 0) {
            lessons.push({
              teacher_name: teacher.name,
              teacher_phone: teacher.whatsapp_numbers[0].number,
              subject_name: subject.name,
              period: slot.period,
              class_name: classData.name
            });
          }
        }
      }
    }
  }

  console.log(`Found ${lessons.length} lessons for today`);
  return lessons;
}

function groupLessonsByTeacher(lessons: TodayLesson[]): Map<string, TodayLesson[]> {
  const grouped = new Map<string, TodayLesson[]>();
  
  for (const lesson of lessons) {
    const key = `${lesson.teacher_name}-${lesson.teacher_phone}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(lesson);
  }
  
  return grouped;
}

function createMessage(teacherName: string, lessons: TodayLesson[]): string {
  const sortedLessons = lessons.sort((a, b) => a.period - b.period);
  
  let message = `Good Morning ${teacherName}, you have `;
  
  const lessonTexts = sortedLessons.map(lesson => 
    `${lesson.subject_name} (${lesson.class_name}) at ${formatTime(lesson.period)}`
  );
  
  if (lessonTexts.length === 1) {
    message += lessonTexts[0];
  } else if (lessonTexts.length === 2) {
    message += `${lessonTexts[0]} and ${lessonTexts[1]}`;
  } else {
    const lastLesson = lessonTexts.pop();
    message += `${lessonTexts.join(', ')} and ${lastLesson}`;
  }
  
  message += '. Have a great day!';
  return message;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting WhatsApp daily notifications...');
    
    // Get today's lessons
    const todayLessons = await getTodayLessons();
    
    if (todayLessons.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No lessons found for today' }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Group lessons by teacher
    const lessonsByTeacher = groupLessonsByTeacher(todayLessons);
    
    console.log(`Sending notifications to ${lessonsByTeacher.size} teachers`);
    
    // Send WhatsApp messages
    const sendPromises = Array.from(lessonsByTeacher.entries()).map(async ([teacherKey, lessons]) => {
      const teacherName = lessons[0].teacher_name;
      const teacherPhone = lessons[0].teacher_phone;
      const message = createMessage(teacherName, lessons);
      
      try {
        return await sendWhatsAppMessage(teacherPhone, message);
      } catch (error) {
        console.error(`Failed to send message to ${teacherName} (${teacherPhone}):`, error);
        return { error: error.message, teacher: teacherName };
      }
    });

    const results = await Promise.all(sendPromises);
    
    console.log('All messages sent. Results:', results);
    
    return new Response(
      JSON.stringify({ 
        message: 'Daily notifications sent successfully!', 
        teachersNotified: lessonsByTeacher.size,
        results 
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in WhatsApp notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
