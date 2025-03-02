// Username Prompt
const usernamePrompt = document.getElementById('username-prompt');
const usernameInput = document.getElementById('username-input');
const submitUsernameButton = document.getElementById('submit-username');
const mainContent = document.getElementById('main-content');
const greeting = document.getElementById('greeting');
const currentTime = document.getElementById('current-time');

// Check if username is already stored
let username = localStorage.getItem('username');
if (username) {
  usernamePrompt.style.display = 'none';
  mainContent.classList.remove('hidden');
  showGreeting(username);
}

// Submit Username
submitUsernameButton.addEventListener('click', () => {
  username = usernameInput.value.trim();
  if (username) {
    localStorage.setItem('username', username);
    usernamePrompt.style.display = 'none';
    mainContent.classList.remove('hidden');
    showGreeting(username);
  }
});

// Show Greeting and Current Time
function showGreeting(username) {
  greeting.textContent = `Hi, ${username}!`;
  updateTime();
  setInterval(updateTime, 1000); // Update time every second
}

function updateTime() {
  const now = new Date();
  currentTime.textContent = now.toLocaleString();
}

// Toggle Form Visibility
const expressFeelingButton = document.getElementById('express-feeling');
const postFormContainer = document.getElementById('post-form-container');

expressFeelingButton.addEventListener('click', () => {
  if (postFormContainer.classList.contains('hidden')) {
    postFormContainer.classList.remove('hidden'); // Show the form
  } else {
    postFormContainer.classList.add('hidden'); // Hide the form
    // Clear the file input and reset the label
    const fileInput = document.getElementById('file-input');
    fileInput.value = ''; // Clear selected files
    document.querySelector('.custom-file-upload').textContent = '📁 Upload?'; // Reset label
    document.getElementById('file-count').textContent = ''; // Clear file count
  }
});

// File Input Change Event
document.getElementById('file-input').addEventListener('change', (e) => {
  const fileInput = e.target;
  const fileCount = fileInput.files.length;

  // Update the file upload label to show the number of files
  const fileUploadLabel = document.querySelector('.custom-file-upload');
  const fileCountDisplay = document.getElementById('file-count');
  if (fileCount > 0) {
    fileUploadLabel.textContent = '📁 Add Files/Photos/Videos';
    fileCountDisplay.textContent = `${fileCount} Files Selected`;
  } else {
    fileUploadLabel.textContent = '📁 Add Files/Photos/Videos';
    fileCountDisplay.textContent = '';
  }
});

// Add a New Post
document.getElementById('post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const titleInput = document.getElementById('post-title');
  const input = document.getElementById('post-input');
  const fileInput = document.getElementById('file-input');
  const title = titleInput.value.trim();
  const text = input.value.trim();
  const files = fileInput.files;

  if (title && (text || files.length > 0)) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      const newPost = await response.json();

      // Clear form inputs
      titleInput.value = '';
      input.value = '';
      fileInput.value = '';
      document.querySelector('.custom-file-upload').textContent = '📁 Upload';
      document.getElementById('file-count').textContent = '';

      // Hide the form
      postFormContainer.classList.add('hidden');

      // Show success message
      showSuccessMessage();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again later.');
    }
  }
});

// Show Success Message
function showSuccessMessage() {
  const successMessage = document.getElementById('success-message');
  successMessage.classList.add('show'); // Show the message
  setTimeout(() => {
    successMessage.classList.remove('show'); // Hide the message after 2 seconds
  }, 2000);
}

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  body.classList.add(savedTheme);
  updateToggleIcon(savedTheme);
}

// Toggle Theme
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  const isDarkMode = body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark-mode' : '');
  updateToggleIcon(isDarkMode ? 'dark-mode' : '');
});

// Update Toggle Icon
function updateToggleIcon(theme) {
  if (theme === 'dark-mode') {
    themeToggle.textContent = '☀️'; // Sun emoji for light mode
  } else {
    themeToggle.textContent = '🌙'; // Moon emoji for dark mode
  }
}
