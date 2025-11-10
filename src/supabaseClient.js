import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://db.yracfsgdejnnpsjzqpin.supabase.co"; // URL de tu proyecto
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyYWNmc2dkZWpubnBzanpxcGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MDk1MTQsImV4cCI6MjA3Nzk4NTUxNH0.Awd-_7qbY2tHkE8CmWz98uzFwz21e01lhKFi-f-X8qg"; // Clave pública

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
