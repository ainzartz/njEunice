const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const https = require('https');
const readline = require('readline');

const prisma = new PrismaClient();

async function downloadCSV(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => { });
      reject(err);
    });
  });
}

async function main() {
  console.log('Fetching comprehensive zip code dataset...');

  const url = 'https://raw.githubusercontent.com/scpike/us-state-county-zip/master/geo-data.csv';
  const tempFile = 'scripts/temp-geo-data.csv';

  await downloadCSV(url, tempFile);
  console.log('Dataset downloaded. Parsing for NJ zip codes...');

  const countiesMap = new Map(); // countyName -> Set of {code, city}

  const fileStream = fs.createReadStream(tempFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let headers = [];

  for await (const line of rl) {
    if (isFirstLine) {
      headers = line.split(',');
      isFirstLine = false;
      continue;
    }

    // Typical scpike format: state_fips,state,state_abbr,zipcode,county,city
    const parts = line.split(',');
    if (parts.length >= 6) {
      const stateAbbr = parts[2].trim().replace(/"/g, '');
      if (stateAbbr === 'NJ') {
        let zipcode = parts[3].trim().replace(/"/g, '');
        let county = parts[4].trim().replace(/"/g, '');
        let city = parts[5].trim().replace(/"/g, '');

        // Skip anomalous placeholder data from the US Census like "Zcta 070hh"
        if (city.toLowerCase().startsWith('zcta') || zipcode.toLowerCase().includes('hh')) {
          continue;
        }

        // Remove "County" suffix if it exists in the data
        if (county.toLowerCase().endsWith(' county')) {
          county = county.substring(0, county.length - 7).trim();
        }

        // countiesMap: county -> Maps of city -> Set of zipcodes
        if (!countiesMap.has(county)) {
          countiesMap.set(county, new Map());
        }

        const cityMap = countiesMap.get(county);
        if (!cityMap.has(city)) {
          cityMap.set(city, new Set());
        }

        cityMap.get(city).add(zipcode);
      }
    }
  }

  console.log(`Found ${countiesMap.size} NJ counties in dataset.`);

  // Cleanup old data to avoid duplicates/mess
  console.log('Clearing old UserInterestCity, ZipCode, City, and County records...');
  await prisma.userInterestCity.deleteMany();
  await prisma.zipCode.deleteMany();
  await prisma.city.deleteMany();
  await prisma.county.deleteMany();

  console.log('Seeding new data into database...');

  const targetCounties = ['Bergen', 'Hudson', 'Passaic'];

  // Create counties, cities, and zipcodes
  for (const [countyName, cityMap] of countiesMap.entries()) {
    console.log(`Seeding ${countyName} County (${cityMap.size} cities)...`);

    const isTarget = targetCounties.includes(countyName);

    const county = await prisma.county.create({
      data: {
        name: countyName,
        state: 'NJ',
        isTarget: isTarget
      }
    });

    for (const [cityName, zipCodesSet] of cityMap.entries()) {
      const city = await prisma.city.create({
        data: {
          name: cityName,
          countyId: county.id
        }
      });

      const zipData = Array.from(zipCodesSet).map(code => ({
        code,
        cityId: city.id
      }));

      await prisma.zipCode.createMany({
        data: zipData,
        skipDuplicates: true
      });
    }
  }

  console.log('Seeding complete. Cleaning up...');
  fs.unlinkSync(tempFile);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
