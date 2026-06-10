global.WebSocket = class {};
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testSignUp() {
  const email = `test_meta_${Math.floor(Math.random() * 1000000)}@example.com`;
  const password = 'Password123!';
  
  console.log('Attempting signUp WITH metadata for:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Test Full Name',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error('Sign Up Error Details:');
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('Full Error Object:', JSON.stringify(error, null, 2));
  } else {
    console.log('Sign Up Success:', data);
  }
}

testSignUp();
