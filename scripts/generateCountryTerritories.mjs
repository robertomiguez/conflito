import { readFileSync, writeFileSync } from "node:fs";

const geoJson = JSON.parse(readFileSync("public/maps/countries.geojson", "utf8"));

// The source also includes bases, dependencies, reefs, and disputed geographic areas.
// The selected ISO codes below ensure every generated territory is intentional.
const excludedCodes = new Set([
  "AIA", "ALA", "ASM", "ABW", "BMU", "BVT", "CYM", "CCK", "CXR", "CUW", "FLK",
  "FRO", "GIB", "GLP", "GUM", "GGY", "HMD", "IMN", "IOT", "JEY", "MAC", "MSR",
  "MTQ", "MYT", "NCL", "NFK", "PCN", "PRI", "PYF", "REU", "SHN", "SPM", "SJM",
  "SXM", "TCA", "TKL", "VGB", "VIR", "WLF", "ATA", "ATF",
]);
const fallbackIso3 = { France: "FRA", Norway: "NOR", Kosovo: "XKX" };
// The playable map intentionally uses only the largest countries requested for each continent.
const playableCodes = new Set([
  // South America (7)
  "ARG", "BOL", "BRA", "CHL", "COL", "PER", "VEN",
  // North America (6)
  "CAN", "GRL", "GTM", "MEX", "NIC", "USA",
  // Europe (12)
  "DEU", "ESP", "FIN", "FRA", "GBR", "ISL", "ITA", "NOR", "POL", "RUS", "SWE", "UKR",
  // Asia (10)
  "CHN", "IDN", "IND", "IRN", "JPN", "KAZ", "KOR", "MNG", "SAU", "TUR",
  // Oceania (4)
  "AUS", "NZL", "PNG", "SLB",
  // Africa (12)
  "AGO", "DZA", "TCD", "COD", "EGY", "LBY", "MDG", "MLI", "NER", "NGA", "SDN", "ZAF",
]);

const features = geoJson.features.filter((feature) => {
  const iso3 = fallbackIso3[feature.properties.name] ?? feature.properties["ISO3166-1-Alpha-3"];
  return playableCodes.has(iso3) && !excludedCodes.has(iso3);
});

function continentFor(feature) {
  const name = feature.properties.name;
  const iso3 = fallbackIso3[name] ?? feature.properties["ISO3166-1-Alpha-3"];
  const europe = new Set(["ALB", "AND", "ARM", "AUT", "AZE", "BEL", "BGR", "BIH", "BLR", "CHE", "CYP", "CZE", "DEU", "DNK", "ESP", "EST", "FIN", "FRA", "GBR", "GEO", "GRC", "HRV", "HUN", "IRL", "ISL", "ITA", "LIE", "LTU", "LUX", "LVA", "MCO", "MDA", "MKD", "MLT", "MNE", "NLD", "NOR", "POL", "PRT", "ROU", "RUS", "SMR", "SRB", "SVK", "SVN", "SWE", "TUR", "UKR", "VAT"]);
  const oceania = new Set(["AUS", "FJI", "FSM", "KIR", "MHL", "NRU", "NZL", "PLW", "PNG", "SLB", "TON", "TUV", "VUT", "WSM"]);
  const northAmerica = new Set(["ATG", "BHS", "BLZ", "BRB", "CAN", "CRI", "CUB", "DMA", "DOM", "GRD", "GRL", "GTM", "HND", "HTI", "JAM", "KNA", "LCA", "MEX", "NIC", "PAN", "SLV", "TTO", "USA", "VCT"]);
  const southAmerica = new Set(["ARG", "BOL", "BRA", "CHL", "COL", "ECU", "GUY", "PER", "PRY", "SUR", "URY", "VEN"]);
  const africa = new Set(["DZA", "AGO", "BEN", "BWA", "BFA", "BDI", "CPV", "CMR", "CAF", "TCD", "COM", "COG", "COD", "CIV", "DJI", "EGY", "GNQ", "ERI", "SWZ", "ETH", "GAB", "GMB", "GHA", "GIN", "GNB", "KEN", "LSO", "LBR", "LBY", "MDG", "MWI", "MLI", "MRT", "MUS", "MAR", "MOZ", "NAM", "NER", "NGA", "RWA", "STP", "SEN", "SYC", "SLE", "SOM", "ZAF", "SSD", "SDN", "TZA", "TGO", "TUN", "UGA", "ZMB", "ZWE"]);
  if (iso3 === "TUR") return "asia";
  if (europe.has(iso3)) return "europe";
  if (oceania.has(iso3)) return "australia";
  if (northAmerica.has(iso3)) return "north-america";
  if (southAmerica.has(iso3)) return "south-america";
  if (africa.has(iso3)) return "africa";
  if (!name) throw new Error(`Missing country name for ${iso3}`);
  return "asia";
}

function countryId(feature) {
  const iso3 = fallbackIso3[feature.properties.name] ?? feature.properties["ISO3166-1-Alpha-3"];
  return `country-${iso3.toLowerCase()}`;
}

function rings(geometry) {
  return geometry.type === "Polygon" ? geometry.coordinates : geometry.coordinates.flat();
}

function coordinateKey(coordinate) {
  return `${coordinate[0].toFixed(6)},${coordinate[1].toFixed(6)}`;
}

function segmentKey(a, b) {
  const aKey = coordinateKey(a);
  const bKey = coordinateKey(b);
  return aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;
}

const neighbors = new Map(features.map((feature) => [countryId(feature), new Set()]));
const segments = new Map();
for (const feature of features) {
  const id = countryId(feature);
  for (const ring of rings(feature.geometry)) {
    for (let index = 1; index < ring.length; index += 1) {
      const key = segmentKey(ring[index - 1], ring[index]);
      const owner = segments.get(key);
      if (owner && owner !== id) {
        neighbors.get(id).add(owner);
        neighbors.get(owner).add(id);
      } else {
        segments.set(key, id);
      }
    }
  }
}

const territories = features
  .map((feature) => ({
    id: countryId(feature),
    name: feature.properties.name,
    continentId: continentFor(feature),
    neighbors: [...neighbors.get(countryId(feature))].sort(),
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

const countryNameToId = Object.fromEntries(territories.map(({ id, name }) => [name, id]));
const output = `// Generated from public/maps/countries.geojson by scripts/generateCountryTerritories.mjs.\n// Every territory represents exactly one real country polygon.\nexport const COUNTRY_TERRITORIES = ${JSON.stringify(territories, null, 2)} as const;\n\nexport const COUNTRY_NAME_TO_ID: Record<string, string> = ${JSON.stringify(countryNameToId, null, 2)};\n`;
writeFileSync("src/constants/countryTerritories.ts", output);
console.log(`Generated ${territories.length} country territories.`);
