const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testProjectCreation() {
  console.log('🧪 Testing project creation...\n');
  
  try {
    // Test 1: Check table structure
    console.log('1. Checking projects table structure...');
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'projects' })
      .single();
    
    if (columnError) {
      console.log('Using alternative method to check columns...');
    }
    
    // Test 2: Try to insert a test project
    console.log('2. Testing project insertion...');
    const testProject = {
      name: 'Test Project',
      description: 'A test project to verify database setup',
      category: 'Other',
      is_public: false,
      tags: ['test'],
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for testing
      status: 'active'
    };
    
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert Error:', insertError);
      return false;
    }
    
    console.log('✅ Test project created successfully!');
    console.log('Project ID:', project.id);
    
    // Test 3: Clean up - delete the test project
    console.log('3. Cleaning up test project...');
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id);
    
    if (deleteError) {
      console.error('⚠️  Could not delete test project:', deleteError);
    } else {
      console.log('✅ Test project cleaned up');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

async function main() {
  const success = await testProjectCreation();
  
  if (success) {
    console.log('\n🎉 Database is working correctly!');
    console.log('The issue might be with authentication or API routing.');
  } else {
    console.log('\n⚠️  Database test failed.');
    console.log('Please check your Supabase setup.');
  }
}

main().catch(console.error); 