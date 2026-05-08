const express = require('express');
const multer = require('multer');
const request = require('supertest');

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'does_not_exist_directory/123');
  },
  filename: (req, file, cb) => {
    cb(null, 'test.png');
  }
});
const upload = multer({ storage });

app.post('/test', upload.single('image'), (req, res) => {
  res.json({ body: req.body, file: req.file });
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

request(app)
  .post('/test')
  .field('title', 'test title')
  .attach('image', Buffer.from('fake image'), 'test.png')
  .end((err, res) => {
    console.log(res.status, res.body);
    process.exit(0);
  });
