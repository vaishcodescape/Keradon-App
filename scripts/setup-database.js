const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database Error:', error.message);
      
      if (error.code === 'PGRST116') {
        console.log('\n📋 The "projects" table does not exist.');
        console.log('You need to run the SQL schema in your Supabase dashboard:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to SQL Editor');
        console.log('4. Copy and paste the contents of database/schema.sql');
        console.log('5. Click "Run"');
      }
      
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Projects table exists with ${data || 0} records`);
    
    // Check if all required tables exist
    const tables = ['projects', 'project_tools', 'project_data'];
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (tableError) {
        console.error(`❌ Table "${table}" does not exist`);
        return false;
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Keradon App Database Setup Checker\n');
  
  console.log('Environment variables:');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Supabase Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Missing'}\n`);
  
  const isSetup = await checkDatabase();
  
  if (isSetup) {
    console.log('\n🎉 Database is properly set up!');
    console.log('You can now create projects in your app.');
  } else {
    console.log('\n⚠️  Database setup required!');
    console.log('Please run the SQL schema in your Supabase dashboard.');
  }
}

main().catch(console.error); 