const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  const form = new FormData();
  form.append('title', 'test book');
  form.append('author', 'test author');
  form.append('subject', 'Physics');
  form.append('book_type', 'sale');
  form.append('price', '100');
  form.append('condition', 'good');
  form.append('accepted_payment_methods', 'cod');
  
  // Create a dummy file
  fs.writeFileSync('dummy.jpg', 'fake image content');
  form.append('image', fs.createReadStream('dummy.jpg'));

  try {
    const res = await axios.post('http://localhost:5000/api/books', form, {
      headers: {
        ...form.getHeaders()
      }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testUpload();
