import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xzfehndqpmkmarkbsiev.supabase.co";
const supabaseKey = "sb_publishable_61yjDPdc4RMs1Mn18t2r5g_NvakkrWH";

export const supabase = createClient(supabaseUrl, supabaseKey);
