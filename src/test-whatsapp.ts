import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qsonozmaaqtbztkotgah.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb25vem1hYXF0Ynp0a290Z2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTM3MzUsImV4cCI6MjA2MzgyOTczNX0.MuGQVdk2_YxLB-aydlxVoV9npb85KanfQOwLhBT_PKs";

async function testWhatsAppFunction() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/whatsapp-daily-notifications`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error testing WhatsApp function:', error);
  }
}

testWhatsAppFunction();