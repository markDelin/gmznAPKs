import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log('Testing connection to:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        const { data, error } = await supabase.from('system_settings').select('*').limit(1);
        
        if (error) {
            console.error('Connection Failed!');
            console.error('Error details:', error);
            process.exit(1);
        } else {
            console.log('Connection Successful!');
            console.log('Sample Data:', data);
            process.exit(0);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
        process.exit(1);
    }
}

test();
