const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, and uploaded files)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// File to store posts
const POSTS_FILE = path.join(__dirname, 'posts.json');

// Read posts from the file
function getPosts() {
  if (!fs.existsSync(POSTS_FILE)) {
    return [];
  }
  const data = fs.readFileSync(POSTS_FILE);
  return JSON.parse(data);
}

// Save posts to the file
function savePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// API to get all posts
app.get('/api/posts', (req, res) => {
  const posts = getPosts();
  res.json(posts);
});

// API to create a new post with files
app.post('/api/posts', upload.array('files', 10), (req, res) => {
  const posts = getPosts();
  const newPost = {
    id: Date.now(),
    title: req.body.title, // Add title field
    text: req.body.text,
    files: req.files ? req.files.map(file => `/uploads/${file.filename}`) : [],
    timestamp: new Date().toISOString(),
  };
  posts.push(newPost);
  savePosts(posts);
  res.json(newPost);
});

// API to edit a post
app.put('/api/posts/:id', (req, res) => {
  const posts = getPosts();
  const postId = parseInt(req.params.id);
  const updatedTitle = req.body.title;
  const updatedText = req.body.text;

  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].title = updatedTitle;
    posts[postIndex].text = updatedText;
    posts[postIndex].timestamp = new Date().toISOString(); // Update timestamp
    savePosts(posts);
    res.json(posts[postIndex]);
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

// API to delete a post
app.delete('/api/posts/:id', (req, res) => {
  const posts = getPosts();
  const postId = parseInt(req.params.id);

  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    const deletedPost = posts.splice(postIndex, 1)[0];
    savePosts(posts);
    res.json(deletedPost);
  } else {
    res.status(404).json({ error: 'Post not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
