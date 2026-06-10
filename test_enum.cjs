const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

global.WebSocket = class {};

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

async function testRole(roleStr) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      role: roleStr
    });
  
  if (error) {
    console.log(`Role '${roleStr}':`, error.message);
  } else {
    console.log(`Role '${roleStr}': SUCCESS`);
  }
}

async function run() {
  await testRole('admin');
  await testRole('Admin');
  await testRole('developer');
  await testRole('Developer');
  await testRole('manager');
  await testRole('Manager');
  await testRole('invalid');
}

run();
