// Run this in browser console to generate your password hash
// Replace 'cv123' with your desired password

async function generatePasswordHash(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt_key_for_security');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Example usage:
// generatePasswordHash('cv123').then(hash => console.log('Your hash:', hash));
