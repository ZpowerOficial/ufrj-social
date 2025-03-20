import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sgqflujqjsjjgarislgi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncWZsdWpxanNqamdhcmlzbGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDMyNzEsImV4cCI6MjA1ODA3OTI3MX0.yoj8GepvPkq101KAgm56SeZocycB9HEUwSz16sJmAxc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);