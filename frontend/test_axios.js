const axios = require('axios');

async function testApi() {
  try {
    const filters = {
      subject: '',
      class_name: '',
      university: '',
      minPrice: '',
      maxPrice: '',
      page: 1
    };
    
    // mimic api.js
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const response = await api.get('/books', { params: filters });
    console.log("Axios response data:", response.data);
    const books = response.data.data.books || [];
    console.log("Books array length:", books.length);
  } catch (err) {
    console.error('Request Error:', err.message);
  }
}

testApi();
