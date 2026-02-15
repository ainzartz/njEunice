
import { njmls } from './src/lib/njmls';

async function main() {
  console.log("Starting NJMLS Search Test...");
  try {
    // Search for Active (A) or Active-Under-Contract?
    // Standard Status often 'A', 'Active', 'ACT'. 
    // PDF p.10 shows metadata but not status values.
    // I will try (ListPrice=300000+) as per PDF example to be safe.

    // Query: (ListPrice=300000+)
    const query = '(ListPrice=300000+)';
    console.log(`Querying: ${query}`);

    // Note: njmls.ts uses process.env. Ensure they are set.

    const results = await njmls.search(query, 5);

    console.log(`Found ${results.length} results.`);
    if (results.length > 0) {
      console.log("First result:", results[0]);
    } else {
      console.log("No results. Response might be parsed incorrectly or empty.");
    }

  } catch (error) {
    console.error("Search failed:", error);
  }
}

main();
