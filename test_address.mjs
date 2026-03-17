async function check() {
  const res = await fetch("http://localhost:3000/api/mls-search?q=26005212", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "http://localhost:3000/search?q=fortlee",
      "Accept": "application/json"
    }
  });
  const json = await res.json();
  if (json.data && json.data.length > 0) {
    console.log(JSON.stringify(json.data[0], null, 2));
  } else {
    console.log("Not found or error:", json);
  }
}
check();
