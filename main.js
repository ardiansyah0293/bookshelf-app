// Do your work here...

// Konstanta Untuk Kunci Local Storage dan Event
const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-book';

// Global variable untuk menampung data buku
let books = loadDataFromStorage();

// Fungsi Pengecekan Local Storage
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung Local Storage');
    return false;
  }
  return true;
}

// Objek Buku
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: Number(year),
    isComplete
  };
}

// Fungsi Menyimpan Data ke Local Storage
function saveData(books) {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

// Fungsi Memuat Data dari Local Storage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    return data;
  }
  return [];
}

// Fungsi untuk membuat elemen buku (DOM)
function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  // Elemen Utama Book Item
  const bookItem = document.createElement('div');
  bookItem.setAttribute('data-bookid', id);
  bookItem.setAttribute('data-testid', 'bookItem');

  // Judul
  const bookTitle = document.createElement('h3');
  bookTitle.setAttribute('data-testid', 'bookItemTitle');
  bookTitle.innerText = title;

  // Penulis
  const bookAuthor = document.createElement('p');
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
  bookAuthor.innerText = `Penulis: ${author}`;

  // Tahun
  const bookYear = document.createElement('p');
  bookYear.setAttribute('data-testid', 'bookItemYear');
  bookYear.innerText = `Tahun: ${year}`;

  // Container Tombol Aksi
  const actionContainer = document.createElement('div');

  // Tombol Pindah Rak (Selesai/Belum)
  const completeButton = document.createElement('button');
  completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  completeButton.innerText = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  completeButton.addEventListener('click', function () {
    moveBook(id);
  });

  // Tombol Hapus Buku
  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.innerText = 'Hapus Buku';
  deleteButton.addEventListener('click', function () {
    if (confirm(`Yakin ingin menghapus buku "${title}"?`)) {
      deleteBook(id);
    }
  });
  
  // Tombol Edit Buku
  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.innerText = 'Edit Buku';
  editButton.addEventListener('click', function () {
    openEditModal(id);
  });

  actionContainer.append(completeButton, deleteButton, editButton);
  bookItem.append(bookTitle, bookAuthor, bookYear, actionContainer);

  return bookItem;
}

// Fungsi Tambah Buku Baru
function addBook() {
  const bookTitle = document.getElementById('bookFormTitle').value;
  const bookAuthor = document.getElementById('bookFormAuthor').value;
  const bookYear = document.getElementById('bookFormYear').value;
  const bookIsComplete = document.getElementById('bookFormIsComplete').checked;

  const generatedID = +new Date(); // ID unik sederhana sesuai tips tapi sederhana
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, bookIsComplete);

  books.push(bookObject);

  saveData(books);
}

// Fungsi untuk menemukan index buku berdasarkan ID
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// Fungsi Pindah Rak
function moveBook(bookId) {
  const bookIndex = findBookIndex(bookId);

  if (bookIndex === -1) return;

  books[bookIndex].isComplete = !books[bookIndex].isComplete;

  saveData(books);
}

// Fungsi Hapus Buku
function deleteBook(bookId) {
  const bookIndex = findBookIndex(bookId);

  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);

  saveData(books);
}

// Fungsi Pencarian Buku
function searchBook(title) {
  const query = title.toLowerCase();
  
  if (query === "") {
    document.dispatchEvent(new Event(RENDER_EVENT)); // Tampilkan semua jika query kosong
    return;
  }

  // Filter buku berdasarkan judul
  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query));
  
  // Render ulang dengan hasil pencarian
  renderBooks(filteredBooks);
}

// Fungsi Global Render Buku (dipanggil oleh event RENDER_EVENT atau search)
function renderBooks(bookList = books) {
  const incompleteBookshelfList = document.getElementById('incompleteBookList');
  const completeBookshelfList = document.getElementById('completeBookList');

  incompleteBookshelfList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  for (const bookItem of bookList) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }
}

// --- Logika Edit Buku ---

// Variabel untuk menyimpan ID buku yang sedang diedit
let editingBookId = null;

// Fungsi untuk membuka modal edit
function openEditModal(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    editingBookId = bookId;
    
    // Isi formulir modal dengan data buku saat ini
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editBookFormTitle').value = book.title;
    document.getElementById('editBookFormAuthor').value = book.author;
    document.getElementById('editBookFormYear').value = book.year;
    document.getElementById('editBookFormIsComplete').checked = book.isComplete;

    // Tampilkan modal
    document.getElementById('editModal').style.display = 'block';
}

// Fungsi untuk menutup modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingBookId = null;
}

// Fungsi untuk menyimpan perubahan buku yang diedit
function saveEditedBook() {
    const id = Number(document.getElementById('editBookId').value);
    const title = document.getElementById('editBookFormTitle').value;
    const author = document.getElementById('editBookFormAuthor').value;
    const year = Number(document.getElementById('editBookFormYear').value);
    const isComplete = document.getElementById('editBookFormIsComplete').checked;

    const bookIndex = findBookIndex(id);
    
    if (bookIndex === -1) return;

    // Perbarui data buku
    books[bookIndex].title = title;
    books[bookIndex].author = author;
    books[bookIndex].year = year;
    books[bookIndex].isComplete = isComplete;

    saveData(books);
    closeEditModal();
}


// --- Event Listener Global ---

document.addEventListener('DOMContentLoaded', function () {
  // --- Setup Modal Edit ---
  const modalHTML = `
    <div id="editModal" class="modal">
      <div class="modal-content">
        <span class="close-button" onclick="closeEditModal()">&times;</span>
        <h2>Edit Buku</h2>
        <form id="editBookForm">
          <input type="hidden" id="editBookId" name="id">
          <div>
            <label for="editBookFormTitle">Judul</label>
            <input id="editBookFormTitle" type="text" required />
          </div>
          <div>
            <label for="editBookFormAuthor">Penulis</label>
            <input id="editBookFormAuthor" type="text" required />
          </div>
          <div>
            <label for="editBookFormYear">Tahun</label>
            <input id="editBookFormYear" type="number" required />
          </div>
          <div>
            <label for="editBookFormIsComplete">Selesai dibaca</label>
            <input id="editBookFormIsComplete" type="checkbox" />
          </div>
          <button type="submit">Simpan Perubahan</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Event listener untuk menutup modal ketika klik di luar
  window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
  }

  // Submit form Edit
  document.getElementById('editBookForm').addEventListener('submit', function (event) {
      event.preventDefault();
      saveEditedBook();
  });
  // --- Akhir Setup Modal Edit ---

  // 1. Event Listener Form Tambah Buku
  const bookForm = document.getElementById('bookForm');
  bookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
    bookForm.reset(); // Kosongkan form setelah submit
  });

  // Update text tombol submit form tambah buku
  const isCompleteCheckbox = document.getElementById('bookFormIsComplete');
  const submitButtonSpan = document.querySelector('#bookFormSubmit span');
  isCompleteCheckbox.addEventListener('change', function() {
      submitButtonSpan.innerText = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
  });

  // 2. Event Listener Form Pencarian Buku
  const searchBookForm = document.getElementById('searchBook');
  searchBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTitle = document.getElementById('searchBookTitle').value;
    searchBook(searchTitle);
  });
  
  // Clear search input akan me-render semua buku
  document.getElementById('searchBookTitle').addEventListener('keyup', function() {
    if (this.value === "") {
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
  });

  // 3. Muat data saat DOM Content Loaded
  if (isStorageExist()) {
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
});

// 4. Event Listener untuk RENDER_EVENT
document.addEventListener(RENDER_EVENT, function () {
  renderBooks(); // Panggil fungsi render utama setiap kali data berubah
});

// Panggil fungsi-fungsi global di window agar bisa diakses oleh onclick di modal
window.closeEditModal = closeEditModal;