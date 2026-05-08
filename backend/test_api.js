async function testApi() {
  try {
    const res = await fetch('http://localhost:5000/api/books/seller/3a692330-7dc0-4b58-9596-9badf4e4a98d');
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error('Request Error:', err);
  }
}

testApi();
