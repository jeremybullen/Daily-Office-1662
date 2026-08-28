const fs = require('fs');
const https = require('https');

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

async function main() {
  const lectionary = {};
  for (let i = 1; i <= 12; i++) {
    const data = await fetchJson(`https://raw.githubusercontent.com/spagosx/1662-BCP-Lectionary/main/months/${i}.json`);
    lectionary[i] = data;
  }
  fs.writeFileSync('src/data/lectionary.json', JSON.stringify(lectionary, null, 2));
  console.log('Done downloading lectionary.json');
}
main();
