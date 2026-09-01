const os = require('os');

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const results = [];

  for (const [name, nets] of Object.entries(interfaces)) {
    const isVirtual = /vEthernet|Loopback|Virtual|WSL|Default/i.test(name);
    for (const net of nets || []) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push({
          interface: name,
          ip: net.address,
          isVirtual,
        });
      }
    }
  }

  // Sort so physical Wi-Fi/Ethernet comes first
  results.sort((a, b) => (a.isVirtual === b.isVirtual ? 0 : a.isVirtual ? 1 : -1));
  return results;
}

const ips = getLocalIpAddresses();
const primaryIp = ips.length > 0 ? ips[0].ip : 'localhost';

const apps = [
  { name: 'Dashboard (User)', port: 3000 },
  { name: 'Admin Panel', port: 3002 },
  { name: 'Learning Academy', port: 3004 },
  { name: 'FAQ / Pusat Bantuan', port: 3005 },
  { name: 'Landing Web', port: 4321 },
  { name: 'Backend API', port: 3001 },
];

console.log('\n' + '='.repeat(58));
console.log('  📱 AMBILCUTI — AKSES DARI HP / DEVICE LAIN (1 JARINGAN)');
console.log('='.repeat(58));
console.log(`\n📡 IP Jaringan Aktif : \x1b[32m\x1b[1m${primaryIp}\x1b[0m`);
if (ips.length > 0) {
  console.log(`   (Adapter Terhubung : ${ips[0].interface})`);
}

console.log('\n🔗 URL Akses di Browser HP:');
apps.forEach((app) => {
  console.log(`   • \x1b[36m${app.name.padEnd(20)}\x1b[0m : \x1b[33m\x1b[1mhttp://${primaryIp}:${app.port}\x1b[0m`);
});

console.log('\n💡 Tips:');
console.log('   - Pastikan HP terhubung ke Wi-Fi / Hotspot yang sama.');
console.log('   - Jika berpindah Wi-Fi/koneksi, jalankan `pnpm ip` untuk refresh URL.');
console.log('='.repeat(58) + '\n');
