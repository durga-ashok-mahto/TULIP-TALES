/* ==========================================
   TULIP TALES - READING TRACKER LOGIC
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global initializer so app.js can call it when routing
  window.initTracker = () => {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user) return;
    
    const userEmail = user.email;
    const tracker = new ReadingTracker(userEmail);
    tracker.init();
  };

  // Toast system helper inside tracker to match app.js design
  function showTrackerToast(title, message, type = 'success') {
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

  class ReadingTracker {
    constructor(email) {
      this.email = email;
      this.booksKey = `tulip_tracker_books_${this.email}`;
      this.historyKey = `tulip_tracker_history_${this.email}`;
      
      // State
      this.books = [];
      this.history = [];
      this.activeTab = 'all';
      this.searchQuery = '';
      this.sortBy = 'recent';
      
      this.bookToDeleteId = null;

      // DOM Bindings
      this.statsContainer = document.getElementById('tracker-stats');
      this.continueSection = document.getElementById('continue-reading-section');
      this.continueGrid = document.getElementById('tracker-continue-reading');
      this.activeBooksBadge = document.getElementById('active-books-badge');
      this.booksGrid = document.getElementById('tracker-books-grid');
      this.historyLogContainer = document.getElementById('tracker-history-log');
      
      // Modal elements
      this.addModal = document.getElementById('add-book-modal');
      this.addBtn = document.getElementById('tracker-add-btn');
      this.addClose = document.getElementById('add-modal-close');
      this.addCancel = document.getElementById('add-modal-cancel');
      this.addForm = document.getElementById('add-book-form');
      
      this.deleteModal = document.getElementById('delete-confirm-modal');
      this.deleteClose = document.getElementById('delete-modal-close');
      this.deleteCancel = document.getElementById('delete-modal-cancel');
      this.deleteConfirm = document.getElementById('delete-modal-confirm');

      // Controls
      this.tabButtons = document.querySelectorAll('#tracker-tabs .tab-btn');
      this.searchInput = document.getElementById('tracker-search');
      this.sortSelect = document.getElementById('tracker-sort');
    }

    init() {
      this.loadData();
      this.setupEventListeners();
      this.render();
    }

    loadData() {
      // Seed default books if none exist for this specific user
      let storedBooks = localStorage.getItem(this.booksKey);
      if (!storedBooks) {
        const seedBooks = [
          {
            id: 'book-secret-garden',
            title: 'The Secret Garden',
            author: 'Frances Hodgson Burnett',
            coverStyle: 'gradient-garden',
            coverUrl: '',
            currentPage: 120,
            totalPages: 300,
            lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            status: 'In Progress'
          },
          {
            id: 'book-pride-prejudice',
            title: 'Pride and Prejudice',
            author: 'Jane Austen',
            coverStyle: 'gradient-classic',
            coverUrl: '',
            currentPage: 400,
            totalPages: 400,
            lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            status: 'Completed'
          },
          {
            id: 'book-emma',
            title: 'Emma',
            author: 'Jane Austen',
            coverStyle: 'gradient-emma',
            coverUrl: '',
            currentPage: 0,
            totalPages: 450,
            lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            status: 'Not Started'
          },
          {
            id: 'book-shadow-wind',
            title: 'The Shadow of the Wind',
            author: 'Carlos Ruiz Zafón',
            coverStyle: 'gradient-shadow',
            coverUrl: '',
            currentPage: 55,
            totalPages: 500,
            lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            status: 'In Progress'
          }
        ];
        localStorage.setItem(this.booksKey, JSON.stringify(seedBooks));
        
        const seedHistory = [
          {
            id: 'hist-1',
            bookTitle: 'The Secret Garden',
            action: 'updated progress to page 120 (40% complete)',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
          },
          {
            id: 'hist-2',
            bookTitle: 'Pride and Prejudice',
            action: 'completed reading the book!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          },
          {
            id: 'hist-3',
            bookTitle: 'The Shadow of the Wind',
            action: 'started reading: reached page 55 (11% complete)',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
          }
        ];
        localStorage.setItem(this.historyKey, JSON.stringify(seedHistory));
        
        this.books = seedBooks;
        this.history = seedHistory;
      } else {
        this.books = JSON.parse(storedBooks);
        const storedHistory = localStorage.getItem(this.historyKey);
        this.history = storedHistory ? JSON.parse(storedHistory) : [];
      }
    }

    saveData() {
      localStorage.setItem(this.booksKey, JSON.stringify(this.books));
      localStorage.setItem(this.historyKey, JSON.stringify(this.history));
    }

    logHistory(bookTitle, action) {
      const entry = {
        id: `hist-${Date.now()}`,
        bookTitle,
        action,
        timestamp: new Date().toISOString()
      };
      this.history.unshift(entry);
      if (this.history.length > 50) {
        this.history.pop();
      }
      this.saveData();
    }

    setupEventListeners() {
      // Clean up previous event listeners (to avoid double bindings when returning to the view)
      this.addBtn.onclick = () => this.openAddModal();
      this.addClose.onclick = () => this.closeAddModal();
      this.addCancel.onclick = () => this.closeAddModal();
      this.addForm.onsubmit = (e) => this.handleAddBook(e);
      
      this.deleteClose.onclick = () => this.closeDeleteModal();
      this.deleteCancel.onclick = () => this.closeDeleteModal();
      this.deleteConfirm.onclick = () => this.confirmDeleteBook();

      // Tab selection
      this.tabButtons.forEach(btn => {
        btn.onclick = () => {
          this.tabButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeTab = btn.getAttribute('data-tab');
          this.renderLibraryGrid();
        };
      });

      // Search & Sorting
      this.searchInput.oninput = (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderLibraryGrid();
      };

      this.sortSelect.onchange = (e) => {
        this.sortBy = e.target.value;
        this.renderLibraryGrid();
      };
    }

    // Modal Operations
    openAddModal() {
      this.addForm.reset();
      // Remove any error classes or messages
      this.addForm.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('has-error'));
      this.addForm.querySelectorAll('.error-message').forEach(err => err.textContent = '');
      
      // Default style active styling reset
      this.addForm.querySelectorAll('.theme-selector').forEach(sel => sel.classList.remove('active'));
      const defaultRadio = this.addForm.querySelector('input[name="cover-theme"][value="gradient-garden"]');
      if (defaultRadio) {
        defaultRadio.checked = true;
        defaultRadio.closest('.theme-selector').classList.add('active');
      }

      // Add live active toggle class to selector options
      this.addForm.querySelectorAll('input[name="cover-theme"]').forEach(radio => {
        radio.onchange = () => {
          this.addForm.querySelectorAll('.theme-selector').forEach(sel => sel.classList.remove('active'));
          radio.closest('.theme-selector').classList.add('active');
        };
      });

      this.addModal.classList.add('active');
    }

    closeAddModal() {
      this.addModal.classList.remove('active');
    }

    openDeleteModal(bookId) {
      this.bookToDeleteId = bookId;
      this.deleteModal.classList.add('active');
    }

    closeDeleteModal() {
      this.deleteModal.classList.remove('active');
      this.bookToDeleteId = null;
    }

    // Form Submissions
    handleAddBook(e) {
      e.preventDefault();

      const titleInput = document.getElementById('book-title');
      const authorInput = document.getElementById('book-author');
      const totalPagesInput = document.getElementById('book-total-pages');
      const currentPageInput = document.getElementById('book-current-page');
      
      const title = titleInput.value.trim();
      const author = authorInput.value.trim();
      const totalPages = parseInt(totalPagesInput.value);
      const currentPage = parseInt(currentPageInput.value) || 0;
      
      const selectedThemeRadio = this.addForm.querySelector('input[name="cover-theme"]:checked');
      const coverStyle = selectedThemeRadio ? selectedThemeRadio.value : 'gradient-default';
      const coverUrl = document.getElementById('book-cover-url').value.trim();

      let isValid = true;

      // Validation
      if (!title) {
        this.setFieldError('book-title', 'book-title-error', 'Book title is required');
        isValid = false;
      } else {
        this.setFieldError('book-title', 'book-title-error', '');
      }

      if (!author) {
        this.setFieldError('book-author', 'book-author-error', 'Author name is required');
        isValid = false;
      } else {
        this.setFieldError('book-author', 'book-author-error', '');
      }

      if (isNaN(totalPages) || totalPages <= 0) {
        this.setFieldError('book-total-pages', 'book-total-pages-error', 'Total pages must be greater than 0');
        isValid = false;
      } else {
        this.setFieldError('book-total-pages', 'book-total-pages-error', '');
      }

      if (isNaN(currentPage) || currentPage < 0) {
        this.setFieldError('book-current-page', 'book-current-page-error', 'Current page cannot be negative');
        isValid = false;
      } else if (totalPages && currentPage > totalPages) {
        this.setFieldError('book-current-page', 'book-current-page-error', 'Current page cannot exceed total pages');
        isValid = false;
      } else {
        this.setFieldError('book-current-page', 'book-current-page-error', '');
      }

      if (!isValid) return;

      // Calculate initial status
      let status = 'Not Started';
      if (currentPage > 0 && currentPage < totalPages) {
        status = 'In Progress';
      } else if (currentPage === totalPages) {
        status = 'Completed';
      }

      const percentage = Math.round((currentPage / totalPages) * 100);

      const newBook = {
        id: `book-${Date.now()}`,
        title,
        author,
        coverStyle,
        coverUrl,
        currentPage,
        totalPages,
        lastUpdated: new Date().toISOString(),
        status
      };

      this.books.unshift(newBook);
      
      // Log history
      let logAction = `added book to library (not started)`;
      if (status === 'In Progress') {
        logAction = `added book to library: started reading at page ${currentPage} (${percentage}% complete)`;
      } else if (status === 'Completed') {
        logAction = `added book to library: marked as completed!`;
      }
      this.logHistory(title, logAction);
      this.saveData();

      showTrackerToast('Book Added', `"${title}" has been successfully added to your library.`, 'success');
      
      this.closeAddModal();
      this.render();

      if (status === 'Completed') {
        showTrackerToast('Reading Sanctuary', `Congratulations on completing another masterpiece! 🌸`, 'success');
      }
    }

    setFieldError(fieldId, errorId, message) {
      const field = document.getElementById(fieldId);
      const errorContainer = document.getElementById(errorId);
      const parent = field.closest('.form-group');
      
      if (message) {
        parent.classList.add('has-error');
        errorContainer.textContent = message;
      } else {
        parent.classList.remove('has-error');
        errorContainer.textContent = '';
      }
    }

    // Logic for page updates
    changePageInput(bookId, delta) {
      const input = document.getElementById(`input-page-${bookId}`);
      if (!input) return;

      const book = this.books.find(b => b.id === bookId);
      if (!book) return;

      let val = parseInt(input.value) || 0;
      val = Math.max(0, Math.min(book.totalPages, val + delta));
      input.value = val;

      this.toggleQuickSaveButton(bookId, val);
    }

    onPageInputKeyPress(e, bookId) {
      if (e.key === 'Enter') {
        this.saveQuickProgress(bookId);
      }
    }

    onPageInput(e, bookId) {
      const book = this.books.find(b => b.id === bookId);
      if (!book) return;

      let val = parseInt(e.target.value);
      if (isNaN(val)) val = 0;
      val = Math.max(0, Math.min(book.totalPages, val));
      
      this.toggleQuickSaveButton(bookId, val);
    }

    toggleQuickSaveButton(bookId, newVal) {
      const book = this.books.find(b => b.id === bookId);
      if (!book) return;

      const saveBtn = document.getElementById(`save-btn-${bookId}`);
      if (!saveBtn) return;

      if (newVal !== book.currentPage) {
        saveBtn.classList.remove('hidden');
      } else {
        saveBtn.classList.add('hidden');
      }
    }

    saveQuickProgress(bookId) {
      const input = document.getElementById(`input-page-${bookId}`);
      if (!input) return;

      const book = this.books.find(b => b.id === bookId);
      if (!book) return;

      let newPage = parseInt(input.value);
      if (isNaN(newPage) || newPage < 0) {
        showTrackerToast('Update Failed', 'Page count cannot be negative.', 'error');
        input.value = book.currentPage;
        return;
      }
      if (newPage > book.totalPages) {
        showTrackerToast('Update Failed', `Page number cannot exceed total pages (${book.totalPages}).`, 'error');
        input.value = book.currentPage;
        return;
      }

      const prevPage = book.currentPage;
      if (newPage === prevPage) return; // No change

      book.currentPage = newPage;
      book.lastUpdated = new Date().toISOString();

      // Recalculate status
      const prevStatus = book.status;
      if (newPage === 0) {
        book.status = 'Not Started';
      } else if (newPage === book.totalPages) {
        book.status = 'Completed';
      } else {
        book.status = 'In Progress';
      }

      const percentage = Math.round((newPage / book.totalPages) * 100);

      // Log progress history
      let logAction = '';
      if (book.status === 'Completed' && prevStatus !== 'Completed') {
        logAction = `completed reading the book!`;
      } else if (newPage > prevPage) {
        logAction = `read pages ${prevPage} → ${newPage} (${percentage}% complete)`;
      } else {
        logAction = `adjusted progress to page ${newPage} (${percentage}% complete)`;
      }
      this.logHistory(book.title, logAction);
      this.saveData();

      // Show toasts
      showTrackerToast('Progress Logged', `Updated "${book.title}" to page ${newPage}.`, 'success');
      if (book.status === 'Completed' && prevStatus !== 'Completed') {
        showTrackerToast('Reading Sanctuary', `Congratulations on completing "${book.title}"! 🌸`, 'success');
      }

      this.render();
    }

    confirmDeleteBook() {
      if (!this.bookToDeleteId) return;

      const bookIndex = this.books.findIndex(b => b.id === this.bookToDeleteId);
      if (bookIndex !== -1) {
        const book = this.books[bookIndex];
        this.logHistory(book.title, 'removed book from library');
        this.books.splice(bookIndex, 1);
        this.saveData();
        showTrackerToast('Book Removed', `"${book.title}" has been deleted from your tracker.`, 'success');
      }

      this.closeDeleteModal();
      this.render();
    }

    // Render operations
    render() {
      this.renderStats();
      this.renderContinueReading();
      this.renderLibraryGrid();
      this.renderHistoryLog();
    }

    renderStats() {
      const totalBooks = this.books.length;
      const completed = this.books.filter(b => b.status === 'Completed').length;
      const active = this.books.filter(b => b.status === 'In Progress').length;
      
      // Calculate total pages read
      const totalPagesRead = this.books.reduce((acc, book) => acc + book.currentPage, 0);

      this.statsContainer.innerHTML = `
        <div class="stat-card">
          <span class="stat-value">${totalBooks}</span>
          <span class="stat-label">Total Books</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${active}</span>
          <span class="stat-label">Active Reads</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${completed}</span>
          <span class="stat-label">Completed</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${totalPagesRead}</span>
          <span class="stat-label">Pages Read</span>
        </div>
      `;

      if (this.activeBooksBadge) {
        this.activeBooksBadge.textContent = `${active} active`;
      }
    }

    renderContinueReading() {
      const activeBooks = this.books.filter(b => b.status === 'In Progress');

      if (activeBooks.length === 0) {
        this.continueSection.style.display = 'none';
        return;
      }

      this.continueSection.style.display = 'block';
      this.continueGrid.innerHTML = '';

      // Sort by lastUpdated descending for recent active books first
      const sortedActive = [...activeBooks].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

      sortedActive.forEach(book => {
        const percentage = Math.round((book.currentPage / book.totalPages) * 100);
        
        const card = document.createElement('div');
        card.className = 'continue-card';
        
        // Define Cover style
        const coverStyleHtml = book.coverUrl 
          ? `style="background-image: url('${book.coverUrl}'); background-size: cover; background-position: center;"`
          : '';
        const coverLabels = book.coverUrl 
          ? '' 
          : `<div class="cover-content">
               <span class="cover-title">${book.title}</span>
               <span class="cover-author">${book.author}</span>
             </div>`;

        card.innerHTML = `
          <div class="book-cover ${book.coverStyle || 'gradient-default'}" ${coverStyleHtml}>
            <div class="book-spine"></div>
            ${coverLabels}
          </div>
          <div class="card-info">
            <div class="book-meta">
              <span class="status-badge status-in-progress">In Progress</span>
              <h4 class="book-title">${book.title}</h4>
              <span class="book-author">by ${book.author}</span>
            </div>
            
            <div class="book-progress-wrapper">
              <div class="page-stats">
                <span>Page ${book.currentPage} of ${book.totalPages}</span>
                <span>${percentage}%</span>
              </div>
              <div class="progress-bg">
                <div class="progress-fill" style="width: ${percentage}%"></div>
              </div>
            </div>

            <div class="card-actions">
              <div class="quick-update-ctrl">
                <button class="ctrl-btn decrement-btn" data-id="${book.id}">-</button>
                <input type="number" class="ctrl-input" id="input-page-${book.id}" value="${book.currentPage}" min="0" max="${book.totalPages}">
                <button class="ctrl-btn increment-btn" data-id="${book.id}">+</button>
                <button class="ctrl-save-btn hidden" id="save-btn-${book.id}" data-id="${book.id}">Save</button>
              </div>
            </div>
          </div>
        `;

        this.continueGrid.appendChild(card);

        // Bind quick controls on this card
        const decBtn = card.querySelector('.decrement-btn');
        const incBtn = card.querySelector('.increment-btn');
        const input = card.querySelector('.ctrl-input');
        const saveBtn = card.querySelector('.ctrl-save-btn');

        decBtn.onclick = () => this.changePageInput(book.id, -1);
        incBtn.onclick = () => this.changePageInput(book.id, 1);
        input.onkeypress = (e) => this.onPageInputKeyPress(e, book.id);
        input.oninput = (e) => this.onPageInput(e, book.id);
        saveBtn.onclick = () => this.saveQuickProgress(book.id);
      });
    }

    renderLibraryGrid() {
      this.booksGrid.innerHTML = '';

      // 1. Filtering by Tab
      let filtered = this.books;
      if (this.activeTab === 'not-started') {
        filtered = this.books.filter(b => b.status === 'Not Started');
      } else if (this.activeTab === 'in-progress') {
        filtered = this.books.filter(b => b.status === 'In Progress');
      } else if (this.activeTab === 'completed') {
        filtered = this.books.filter(b => b.status === 'Completed');
      }

      // 2. Filtering by Search Query
      if (this.searchQuery) {
        filtered = filtered.filter(b => 
          b.title.toLowerCase().includes(this.searchQuery) || 
          b.author.toLowerCase().includes(this.searchQuery)
        );
      }

      // 3. Sorting
      const sorted = [...filtered].sort((a, b) => {
        if (this.sortBy === 'recent') {
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        } else if (this.sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else if (this.sortBy === 'author') {
          return a.author.localeCompare(b.author);
        } else if (this.sortBy === 'progress') {
          const progressA = (a.currentPage / a.totalPages);
          const progressB = (b.currentPage / b.totalPages);
          return progressB - progressA;
        }
        return 0;
      });

      if (sorted.length === 0) {
        this.booksGrid.innerHTML = `
          <div class="feature-card" style="grid-column: 1 / -1; align-items: center; text-align: center; width: 100%; box-sizing: border-box; background: var(--bg-card); padding: 40px;">
            <div class="card-icon">📚</div>
            <h4 class="card-title" style="margin-top: 16px;">Sanctuary is Peaceful</h4>
            <p class="card-text">No books match your criteria. Add a new story to log your journey.</p>
          </div>
        `;
        return;
      }

      sorted.forEach(book => {
        const percentage = Math.round((book.currentPage / book.totalPages) * 100);
        
        const card = document.createElement('div');
        card.className = 'book-card';

        let statusClass = 'status-not-started';
        if (book.status === 'In Progress') statusClass = 'status-in-progress';
        if (book.status === 'Completed') statusClass = 'status-completed';

        const coverStyleHtml = book.coverUrl 
          ? `style="background-image: url('${book.coverUrl}'); background-size: cover; background-position: center;"`
          : '';
        const coverLabels = book.coverUrl 
          ? '' 
          : `<div class="cover-content">
               <span class="cover-title">${book.title}</span>
               <span class="cover-author">${book.author}</span>
             </div>`;

        card.innerHTML = `
          <div class="book-card-main">
            <div class="book-cover ${book.coverStyle || 'gradient-default'}" ${coverStyleHtml}>
              <div class="book-spine"></div>
              ${coverLabels}
            </div>
            <div class="card-info">
              <div class="book-meta">
                <span class="status-badge ${statusClass}">${book.status}</span>
                <h4 class="book-title" style="font-size: 1.1rem; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;">${book.title}</h4>
                <span class="book-author">by ${book.author}</span>
              </div>
              <div class="book-progress-wrapper" style="margin-top: auto;">
                <div class="page-stats">
                  <span>Page ${book.currentPage}/${book.totalPages}</span>
                  <span>${percentage}%</span>
                </div>
                <div class="progress-bg">
                  <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="book-card-footer">
            <div class="quick-update-ctrl">
              <button class="ctrl-btn dec-btn" data-id="${book.id}">-</button>
              <input type="number" class="ctrl-input grid-input" id="input-page-${book.id}" value="${book.currentPage}" min="0" max="${book.totalPages}">
              <button class="ctrl-btn inc-btn" data-id="${book.id}">+</button>
              <button class="ctrl-save-btn hidden grid-save" id="save-btn-${book.id}" data-id="${book.id}">Save</button>
            </div>
            <button class="btn-text-danger delete-btn" data-id="${book.id}" title="Remove Book">
              🗑️ <span style="font-size: 0.72rem;">Remove</span>
            </button>
          </div>
        `;

        this.booksGrid.appendChild(card);

        // Bind quick controls on this card
        const decBtn = card.querySelector('.dec-btn');
        const incBtn = card.querySelector('.inc-btn');
        const input = card.querySelector('.grid-input');
        const saveBtn = card.querySelector('.grid-save');
        const delBtn = card.querySelector('.delete-btn');

        decBtn.onclick = () => this.changePageInput(book.id, -1);
        incBtn.onclick = () => this.changePageInput(book.id, 1);
        input.onkeypress = (e) => this.onPageInputKeyPress(e, book.id);
        input.oninput = (e) => this.onPageInput(e, book.id);
        saveBtn.onclick = () => this.saveQuickProgress(book.id);
        delBtn.onclick = () => this.openDeleteModal(book.id);
      });
    }

    renderHistoryLog() {
      if (this.history.length === 0) {
        this.historyLogContainer.innerHTML = `
          <div class="history-empty">No entries logged in your reading diary yet. Select a book and update your progress to start.</div>
        `;
        return;
      }

      this.historyLogContainer.innerHTML = '';
      
      this.history.forEach(item => {
        const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const entry = document.createElement('div');
        entry.className = 'history-item';
        entry.innerHTML = `
          <div class="history-desc">
            <strong>${item.bookTitle}</strong>: ${item.action}
          </div>
          <span class="history-date">${dateStr}</span>
        `;
        this.historyLogContainer.appendChild(entry);
      });
    }
  }
});
