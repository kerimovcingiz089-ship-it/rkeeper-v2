import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xzfehndqpmkmarkbsiev.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_61yjDPdc4RMs1Mn18t2r5g_NvakkrWH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
