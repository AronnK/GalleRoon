// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ohktgxwdzsdfwhffprak.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oa3RneHdkenNkZndoZmZwcmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwNjY2NDMsImV4cCI6MjA0MzY0MjY0M30.mokGdnWHzqoXSZcECoiEaRG7Bszd9p25nsnzLOHrOfQ";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
