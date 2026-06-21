/* ==========================================
   TULIP TALES - BOOK SEARCH AND FILTER LOGIC
   ========================================== */

// --- Book Catalog Seed Data ---
const BOOKS_DATABASE = [
  {
    id: 'book-secret-garden',
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    genre: 'Classics',
    difficulty: 'Easy',
    rating: 4.8,
    totalPages: 300,
    coverStyle: 'gradient-garden',
    coverUrl: '',
    synopsis: 'A cozy classic about a young girl who discovers a hidden, locked garden and helps bring it back to life, finding healing and friendship along the way.'
  },
  {
    id: 'book-pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Classics',
    difficulty: 'Medium',
    rating: 4.9,
    totalPages: 400,
    coverStyle: 'gradient-classic',
    coverUrl: '',
    synopsis: 'A timeless romance exploring pride, social status, and misunderstandings between the lively Elizabeth Bennet and the wealthy, reserved Mr. Darcy.'
  },
  {
    id: 'book-emma',
    title: 'Emma',
    author: 'Jane Austen',
    genre: 'Classics',
    difficulty: 'Medium',
    rating: 4.7,
    totalPages: 450,
    coverStyle: 'gradient-emma',
    coverUrl: '',
    synopsis: 'A delightful, witty story about Emma Woodhouse, a well-meaning but match-making heiress who learns lessons in love, humility, and self-delusion.'
  },
  {
    id: 'book-shadow-wind',
    title: 'The Shadow of the Wind',
    author: 'Carlos Ruiz Zafón',
    genre: 'Historical Fiction',
    difficulty: 'Hard',
    rating: 4.8,
    totalPages: 500,
    coverStyle: 'gradient-shadow',
    coverUrl: '',
    synopsis: 'In post-WWII Barcelona, a young boy is taken to the Cemetery of Forgotten Books, choosing a mysterious novel that pulls him into a dark web of intrigue and secrets.'
  },
  {
    id: 'book-night-circus',
    title: 'The Night Circus',
    author: 'Erin Morgenstern',
    genre: 'Fantasy',
    difficulty: 'Medium',
    rating: 4.5,
    totalPages: 390,
    coverStyle: 'gradient-cozy',
    coverUrl: '',
    synopsis: 'A mesmerizing, atmospheric tale about a magical, black-and-white circus that only opens at night, and two young illusionists locked in a deadly duel of creativity.'
  },
  {
    id: 'book-selected-poems',
    title: 'Selected Poems',
    author: 'Emily Dickinson',
    genre: 'Poetry',
    difficulty: 'Hard',
    rating: 4.6,
    totalPages: 150,
    coverStyle: 'gradient-emma',
    coverUrl: '',
    synopsis: 'A profound collection of short, intense poems exploring nature, love, grief, and immortality, written by one of America\'s greatest poets.'
  },
  {
    id: 'book-tea-shop-murder',
    title: 'The Cozy Tea Shop Murder',
    author: 'Clara Benson',
    genre: 'Cozy Mystery',
    difficulty: 'Easy',
    rating: 4.3,
    totalPages: 280,
    coverStyle: 'gradient-cozy',
    coverUrl: '',
    synopsis: 'A lighthearted, puzzling mystery set in a quaint English village, where a local tea shop owner must solve a suspicious crime before her shop is ruined.'
  },
  {
    id: 'book-circe',
    title: 'Circe',
    author: 'Madeline Miller',
    genre: 'Fantasy',
    difficulty: 'Medium',
    rating: 4.8,
    totalPages: 400,
    coverStyle: 'gradient-garden',
    coverUrl: '',
    synopsis: 'An epic, beautifully written retelling of Greek mythology from the perspective of Circe, the banished witch-goddess who learns to carve her own path.'
  },
  {
    id: 'book-jane-eyre',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    genre: 'Classics',
    difficulty: 'Hard',
    rating: 4.9,
    totalPages: 520,
    coverStyle: 'gradient-shadow',
    coverUrl: '',
    synopsis: 'A gothic masterpiece following the emotional and intellectual growth of Jane, an orphaned governess who falls in love with the mysterious Mr. Rochester.'
  },
  {
    id: 'book-great-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classics',
    difficulty: 'Medium',
    rating: 4.4,
    totalPages: 180,
    coverStyle: 'gradient-default',
    coverUrl: '',
    synopsis: 'A brilliant portrait of the Jazz Age, exploring themes of wealth, ambition, and the elusive nature of the American Dream through the life of the enigmatic Jay Gatsby.'
  },
  {
    id: 'book-hobbit',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    difficulty: 'Easy',
    rating: 4.9,
    totalPages: 310,
    coverStyle: 'gradient-garden',
    coverUrl: '',
    synopsis: 'A whimsical adventure of Bilbo Baggins, a home-loving hobbit who is swept away on a dangerous quest to reclaim a stolen treasure from a formidable dragon.'
  },
  {
    id: 'book-wuthering-heights',
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    genre: 'Classics',
    difficulty: 'Hard',
    rating: 4.3,
    totalPages: 350,
    coverStyle: 'gradient-shadow',
    coverUrl: '',
    synopsis: 'A passionate, dark, and tempestuous tale of love, obsession, and revenge set on the bleak Yorkshire moors, detailing the destructive bond between Heathcliff and Catherine.'
  }
];

// --- Search Toast System Helper ---
function showSearchToast(title, message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '✨';
  if (type === 'success') icon = '🌿';
  if (type === 'warning') icon = '☕';
  if (type === 'error') icon = '🍂';

  toast.innerHTML = `
    <div style="font-size: 1.5rem;">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">&times;</button>
  `;

  toastContainer.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  setTimeout(() => {
    removeToast(toast);
  }, 4000);

  function removeToast(t) {
    if (!t.parentNode) return;
    t.style.animation = 'none';
    t.style.transition = 'all 0.3s ease';
    t.style.transform = 'translateX(120%)';
    t.style.opacity = '0';
    setTimeout(() => {
      if (t.parentNode) {
        toastContainer.removeChild(t);
      }
    }, 300);
  }
}

// --- Book Search System controller class ---
class BookSearchSystem {
  constructor() {
    this.books = BOOKS_DATABASE;
    this.searchQuery = '';
    this.selectedGenre = 'all';
    this.selectedDifficulty = 'all';
    this.selectedRating = 'all';

    // Cache of already tracked books
    this.trackedBooksMap = new Map(); // key: "title||author" -> bookId

    // DOM Bindings
    this.searchInput = document.getElementById('book-search-input');
    this.clearSearchBtn = document.getElementById('clear-search-btn');
    this.genrePills = document.querySelectorAll('#genre-pills .pill-btn');
    this.difficultyPills = document.querySelectorAll('#difficulty-pills .pill-btn');
    this.ratingPills = document.querySelectorAll('#rating-pills .pill-btn');
    this.resetBtn = document.getElementById('reset-filters-btn');
    this.booksGrid = document.getElementById('search-books-grid');
    this.resultsCountBadge = document.getElementById('results-count-badge');
  }

  init() {
    this.loadUserTrackerCache();
    this.setupEventListeners();
    this.render();
  }

  loadUserTrackerCache() {
    this.trackedBooksMap.clear();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;

    const booksKey = `tulip_tracker_books_${currentUser.email}`;
    const userBooksStr = localStorage.getItem(booksKey);
    if (userBooksStr) {
      const userBooks = JSON.parse(userBooksStr);
      userBooks.forEach(b => {
        const cleanKey = `${b.title.trim().toLowerCase()}||${b.author.trim().toLowerCase()}`;
        this.trackedBooksMap.set(cleanKey, b.id);
      });
    }
  }

  setupEventListeners() {
    // Text search input
    this.searchInput.oninput = (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.toggleClearButton();
      this.render();
    };

    this.clearSearchBtn.onclick = () => {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.toggleClearButton();
      this.render();
    };

    // Genre filters
    this.genrePills.forEach(btn => {
      btn.onclick = () => {
        this.genrePills.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.selectedGenre = btn.getAttribute('data-genre');
        this.render();
      };
    });

    // Difficulty filters
    this.difficultyPills.forEach(btn => {
      btn.onclick = () => {
        this.difficultyPills.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.selectedDifficulty = btn.getAttribute('data-difficulty');
        this.render();
      };
    });

    // Rating filters
    this.ratingPills.forEach(btn => {
      btn.onclick = () => {
        this.ratingPills.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.selectedRating = btn.getAttribute('data-rating');
        this.render();
      };
    });

    // Reset button
    this.resetBtn.onclick = () => {
      this.resetAll();
    };
  }

  toggleClearButton() {
    if (this.searchQuery) {
      this.clearSearchBtn.style.display = 'block';
    } else {
      this.clearSearchBtn.style.display = 'none';
    }
  }

  resetAll() {
    // Reset search query
    this.searchInput.value = '';
    this.searchQuery = '';
    this.toggleClearButton();

    // Reset Genre
    this.genrePills.forEach(p => p.classList.remove('active'));
    this.genrePills[0].classList.add('active');
    this.selectedGenre = 'all';

    // Reset Difficulty
    this.difficultyPills.forEach(p => p.classList.remove('active'));
    this.difficultyPills[0].classList.add('active');
    this.selectedDifficulty = 'all';

    // Reset Rating
    this.ratingPills.forEach(p => p.classList.remove('active'));
    this.ratingPills[0].classList.add('active');
    this.selectedRating = 'all';

    this.render();
    showSearchToast('Filters Reset', 'All search filters have been cleared.', 'success');
  }

  addToTracker(book) {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
      showSearchToast('Authentication Required', 'Please sign in to add books to your tracker.', 'warning');
      setTimeout(() => {
        const loginBtn = document.getElementById('nav-login-link');
        if (loginBtn) {
          loginBtn.click();
        } else {
          window.location.hash = 'login';
        }
      }, 1000);
      return;
    }

    const email = currentUser.email;
    const booksKey = `tulip_tracker_books_${email}`;
    const historyKey = `tulip_tracker_history_${email}`;

    // Load user tracker books
    const userBooks = JSON.parse(localStorage.getItem(booksKey) || '[]');
    
    // Safety check: is it already there?
    const exists = userBooks.some(b => 
      b.title.trim().toLowerCase() === book.title.trim().toLowerCase() &&
      b.author.trim().toLowerCase() === book.author.trim().toLowerCase()
    );

    if (exists) {
      showSearchToast('Already Tracked', `"${book.title}" is already in your reading sanctuary.`, 'warning');
      return;
    }

    // Add new tracker book entry
    const newBook = {
      id: `book-${Date.now()}`,
      title: book.title,
      author: book.author,
      coverStyle: book.coverStyle,
      coverUrl: book.coverUrl || '',
      currentPage: 0,
      totalPages: book.totalPages,
      lastUpdated: new Date().toISOString(),
      status: 'Not Started'
    };

    userBooks.unshift(newBook);
    localStorage.setItem(booksKey, JSON.stringify(userBooks));

    // Log tracking diary entry
    const userHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const newHistory = {
      id: `hist-${Date.now()}`,
      bookTitle: book.title,
      action: 'added book to library (not started)',
      timestamp: new Date().toISOString()
    };
    userHistory.unshift(newHistory);
    localStorage.setItem(historyKey, JSON.stringify(userHistory));

    // Update map cache
    const cleanKey = `${book.title.trim().toLowerCase()}||${book.author.trim().toLowerCase()}`;
    this.trackedBooksMap.set(cleanKey, newBook.id);

    // Show success feedback
    showSearchToast('Book Tracked', `"${book.title}" has been added to your reading tracker.`, 'success');
    this.render();
  }

  render() {
    this.booksGrid.innerHTML = '';

    // Filter processing
    const filtered = this.books.filter(book => {
      // 1. Text Search title/author match
      if (this.searchQuery) {
        const inTitle = book.title.toLowerCase().includes(this.searchQuery);
        const inAuthor = book.author.toLowerCase().includes(this.searchQuery);
        if (!inTitle && !inAuthor) return false;
      }

      // 2. Genre filter match
      if (this.selectedGenre !== 'all') {
        if (book.genre !== this.selectedGenre) return false;
      }

      // 3. Difficulty filter match
      if (this.selectedDifficulty !== 'all') {
        if (book.difficulty !== this.selectedDifficulty) return false;
      }

      // 4. Rating filter match
      if (this.selectedRating !== 'all') {
        const minVal = parseFloat(this.selectedRating);
        if (book.rating < minVal) return false;
      }

      return true;
    });

    // Update result count text
    this.resultsCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'story' : 'stories'} found`;

    if (filtered.length === 0) {
      this.booksGrid.innerHTML = `
        <div class="feature-card" style="grid-column: 1 / -1; align-items: center; text-align: center; width: 100%; box-sizing: border-box; background: var(--bg-card); padding: 40px;">
          <div class="card-icon">🍃</div>
          <h4 class="card-title" style="margin-top: 16px;">The Sanctuary is Quiet</h4>
          <p class="card-text">No stories match your criteria. Try resetting the filters to explore again.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';

      // Check tracker cache
      const cleanKey = `${book.title.trim().toLowerCase()}||${book.author.trim().toLowerCase()}`;
      const isTracked = this.trackedBooksMap.has(cleanKey);

      // cover styling
      const coverStyleHtml = book.coverUrl 
        ? `style="background-image: url('${book.coverUrl}'); background-size: cover; background-position: center;"`
        : '';
      const coverLabels = book.coverUrl 
        ? '' 
        : `<div class="cover-content">
             <span class="cover-title">${book.title}</span>
             <span class="cover-author">${book.author}</span>
           </div>`;

      // difficulty class selector
      let diffClass = 'diff-easy';
      if (book.difficulty === 'Medium') diffClass = 'diff-medium';
      if (book.difficulty === 'Hard') diffClass = 'diff-hard';

      // Add to tracker action button
      let actionBtnHtml = '';
      if (isTracked) {
        actionBtnHtml = `
          <button class="btn btn-added" disabled>
            <span>✓ In Sanctuary Tracker</span>
          </button>
        `;
      } else {
        actionBtnHtml = `
          <button class="btn btn-primary add-to-tracker-btn" data-id="${book.id}">
            Add to Tracker
          </button>
        `;
      }

      card.innerHTML = `
        <div class="book-card-main">
          <div class="book-cover ${book.coverStyle || 'gradient-default'}" ${coverStyleHtml}>
            <div class="book-spine"></div>
            ${coverLabels}
          </div>
          <div class="card-info">
            <div class="search-card-meta">
              <span class="rating-badge" title="Rating: ${book.rating} / 5">
                ★ ${book.rating}
              </span>
              <span class="genre-badge">${book.genre}</span>
              <span class="diff-badge ${diffClass}">${book.difficulty}</span>
            </div>
            <h4 class="book-title" style="font-size: 1.1rem; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;" title="${book.title}">${book.title}</h4>
            <span class="book-author">by ${book.author}</span>
            <p class="book-synopsis">${book.synopsis}</p>
          </div>
        </div>
        <div class="search-card-actions">
          ${actionBtnHtml}
        </div>
      `;

      this.booksGrid.appendChild(card);

      const trackBtn = card.querySelector('.add-to-tracker-btn');
      if (trackBtn) {
        trackBtn.onclick = () => this.addToTracker(book);
      }
    });
  }
}

// --- Global Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  let searchSystemInstance = null;

  window.initSearch = () => {
    if (!searchSystemInstance) {
      searchSystemInstance = new BookSearchSystem();
    }
    searchSystemInstance.init();
  };
});
