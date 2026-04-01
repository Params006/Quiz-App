import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hzwtmkwdlkgnxkvhqfzn.supabase.co';
const supabaseKey = 'sb_publishable_RFUrATPuJkv7K5hzDtjbcw_2HeqDDvE';

export const supabase = createClient(supabaseUrl, supabaseKey);