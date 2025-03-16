let isCompactView = false; // Track the current view mode

// Apply saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.classList.add(savedTheme);
  }

  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      const isDarkMode = body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark-mode' : ''); // Save theme state
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

    // Set initial icon
    updateToggleIcon(savedTheme || '');
  }

  // Fetch posts when the page loads
  fetchPosts();
});

// Toggle View Functionality
document.getElementById('toggle-view').addEventListener('click', () => {
  isCompactView = !isCompactView; // Toggle the view mode
  const toggleButton = document.getElementById('toggle-view');
  toggleButton.textContent = isCompactView ? 'Switch to Grid View' : 'Switch to Compact View';
  fetchPosts(); // Re-render posts in the new view mode
});

// Function to replace line breaks with <br> tags
function formatPostContent(text) {
  return text.replace(/\n/g, '<br>'); // Replace all \n with <br>
}

// Fetch and display posts
async function fetchPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const posts = await response.json();
    const postsContainer = document.getElementById('posts');

    // Render posts based on the current view mode
    if (isCompactView) {
      // Compact View
      postsContainer.innerHTML = `
        ${posts
          .map(
            (post) => `
              <div class="post compact" data-id="${post.id}">
                <h3>${post.title}</h3>
                <div class="post-content">
                  <p>${formatPostContent(post.text)}</p> <!-- Format post content -->
                  <small>${new Date(post.timestamp).toLocaleString()}</small>
                  <div class="media-grid">
                    ${post.files
                      .map(
                        (file) => `
                          ${file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')
                            ? `<video controls src="${file}" class="post-media"></video>`
                            : file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif')
                            ? `<img src="${file}" alt="Post Image" class="post-media" onclick="openFullScreenMedia('${file}')">`
                            : `<a href="${file}" target="_blank" class="post-file" title="${file.split('/').pop()}">📄 ${file.split('/').pop()}</a>`
                          }
                        `
                      )
                      .join('')}
                  </div>
                  <div class="post-actions">
                    <button class="edit-post" onclick="handleEditPost(${post.id})">✏️ Edit</button>
                    <button class="delete-post" onclick="handleDeletePost(${post.id})">🗑️ Delete</button>
                    <button class="highlight-post" onclick="highlightText(${post.id})">🖍️ Highlight</button>
                  </div>
                </div>
              </div>
            `
          )
          .join('')}
      `;

      // Add click event listeners for compact view posts
      document.querySelectorAll('.post.compact').forEach(post => {
        post.addEventListener('click', () => {
          post.classList.toggle('expanded'); // Toggle expanded view
        });
      });
    } else {
      // Grid View (Masonry Layout)
      postsContainer.innerHTML = `
        <div class="posts-grid">
          ${posts
            .map(
              (post) => `
                <div class="post" data-id="${post.id}">
                  <h3>${post.title}</h3>
                  <div class="post-content">
                    <p>${formatPostContent(post.text)}</p> <!-- Format post content -->
                    <small>${new Date(post.timestamp).toLocaleString()}</small>
                    <div class="media-grid">
                      ${post.files
                        .map(
                          (file) => `
                            ${file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')
                              ? `<video controls src="${file}" class="post-media"></video>`
                              : file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif')
                              ? `<img src="${file}" alt="Post Image" class="post-media" onclick="openFullScreenMedia('${file}')">`
                              : `<a href="${file}" target="_blank" class="post-file" title="${file.split('/').pop()}">📄 ${file.split('/').pop()}</a>`
                            }
                          `
                        )
                        .join('')}
                    </div>
                    <div class="post-actions">
                      <button class="edit-post" onclick="handleEditPost(${post.id})">✏️ Edit</button>
                      <button class="delete-post" onclick="handleDeletePost(${post.id})">🗑️ Delete</button>
                      <button class="highlight-post" onclick="highlightText(${post.id})">🖍️ Highlight</button>
                    </div>
                  </div>
                </div>
              `
            )
            .join('')}
        </div>
      `;

      // Arrange posts in a masonry layout for grid view
      arrangePostsMasonry();
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    alert('Failed to fetch posts. Please try again later.');
  }
}

// Function to arrange posts in a masonry layout
function arrangePostsMasonry() {
  const postsGrid = document.querySelector('.posts-grid');
  const posts = document.querySelectorAll('.post');

  // Reset the grid layout
  postsGrid.style.gridAutoRows = 'auto'; // Allow rows to adjust height
  postsGrid.style.alignItems = 'start'; // Align items to the top

  // Dynamically adjust the height of each post
  posts.forEach(post => {
    post.style.gridRowEnd = `span ${Math.ceil(post.clientHeight / 20)}`; // Adjust row span based on height
  });
}

// Open Media in Full Screen
function openFullScreenMedia(fileUrl) {
  const fullScreenContainer = document.createElement('div');
  fullScreenContainer.classList.add('full-screen-media');

  const mediaElement = fileUrl.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')
    ? `<video controls src="${fileUrl}" class="full-screen-content"></video>`
    : `<img src="${fileUrl}" alt="Full Screen Media" class="full-screen-content">`;

  fullScreenContainer.innerHTML = `
    <div class="full-screen-wrapper">
      ${mediaElement}
      <button class="close-full-screen" onclick="closeFullScreenMedia()">✖</button>
    </div>
  `;

  document.body.appendChild(fullScreenContainer);
}

// Close Full Screen Media
function closeFullScreenMedia() {
  const fullScreenContainer = document.querySelector('.full-screen-media');
  if (fullScreenContainer) {
    fullScreenContainer.remove();
  }
}

// Handle Edit Post
async function handleEditPost(postId) {
  const postElement = document.querySelector(`.post[data-id="${postId}"]`);
  const postTitle = postElement.querySelector('h3').textContent;
  const postText = postElement.querySelector('p').textContent;

  const updatedTitle = prompt('Edit your post title:', postTitle);
  const updatedText = prompt('Edit your post content:', postText);

  if ((updatedTitle !== null && updatedTitle.trim() !== '') || (updatedText !== null && updatedText.trim() !== '')) {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: updatedTitle, text: updatedText }),
    });
    if (response.ok) {
      fetchPosts(); // Refresh the posts
    }
  }
}

// Handle Delete Post
async function handleDeletePost(postId) {
  if (confirm('Are you sure you want to delete this post?')) {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchPosts(); // Refresh the posts
    }
  }
}

// Highlight Text
async function highlightText(postId) {
  const postElement = document.querySelector(`.post[data-id="${postId}"]`);
  const postContent = postElement.querySelector('.post-content p');
  const postTitle = postElement.querySelector('h3').textContent; // Get the post title

  // Get the selected text
  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (selectedText) {
    // Wrap the selected text in a span with a highlight class
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'highlight';
    span.textContent = selectedText;
    range.deleteContents();
    range.insertNode(span);

    // Clear the selection
    selection.removeAllRanges();

    // Update the post content in the database
    const updatedText = postContent.innerHTML;
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: postTitle, // Include the title
        text: updatedText // Include the updated text with highlights
      }),
    });

    if (!response.ok) {
      alert('Failed to save highlighted text.');
    }
  } else {
    alert('Please select some text to highlight.');
  }
}

// Re-arrange posts on window resize (only for grid view)
window.addEventListener('resize', () => {
  if (!isCompactView) {
    arrangePostsMasonry();
  }
});
