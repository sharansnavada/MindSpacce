let isCompactView = false; // Track the current view mode

// Toggle View Functionality
document.getElementById('toggle-view').addEventListener('click', () => {
  isCompactView = !isCompactView; // Toggle the view mode
  const toggleButton = document.getElementById('toggle-view');
  toggleButton.textContent = isCompactView ? 'Switch to Grid View' : 'Switch to Compact View';
  fetchPosts(); // Re-render posts in the new view mode
});

// Fetch and display posts
async function fetchPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    const posts = await response.json();
    const postsContainer = document.getElementById('posts');

    postsContainer.innerHTML = `
      <div class="posts-grid">
        ${posts
          .map(
            (post) => `
              <div class="post ${isCompactView ? 'compact' : 'expanded'}" data-id="${post.id}">
                <h3>${post.title}</h3>
                <div class="post-content">
                  <p>${post.text}</p>
                  <small>${new Date(post.timestamp).toLocaleString()}</small>
                  <div class="media-grid">
                    ${post.files
                      .map(
                        (file) => `
                          ${file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')
                            ? `<video controls src="${file}" class="post-media"></video>`
                            : file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif')
                            ? `<img src="${file}" alt="Post Image" class="post-media" onclick="openFullScreenMedia('${file}')">`
                            : `<a href="${file}" target="_blank" class="post-file">📄 ${file.split('/').pop()}</a>`
                          }
                        `
                      )
                      .join('')}
                  </div>
                  <div class="post-actions">
                    <button class="edit-post" onclick="handleEditPost(${post.id})">✏️ Edit</button>
                    <button class="delete-post" onclick="handleDeletePost(${post.id})">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    `;

    // Add click event listeners for compact view posts
    if (isCompactView) {
      document.querySelectorAll('.post.compact').forEach(post => {
        post.addEventListener('click', () => {
          post.classList.toggle('expanded'); // Toggle expanded view
        });
      });
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    alert('Failed to fetch posts. Please try again later.');
  }
}

// Open Media in Full Screen
function openFullScreenMedia(fileUrl) {
  const fullScreenContainer = document.createElement('div');
  fullScreenContainer.classList.add('full-screen-media');

  const mediaElement = fileUrl.endsWith('.mp4') || fileUrl.endsWith('.webm') || fileUrl.endsWith('.ogg')
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

// Fetch posts when the page loads
fetchPosts();
