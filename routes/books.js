const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const uploadPath = path.join('public', Book.coverImageBasePath);
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, ['images/jpeg', 'images/png', 'images/gif']);
    }
});

// All books route
router.get('/', async (req, res) => {
    let query = Book.find();
    
    if (req.query?.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }

    if (req.query?.publishedBefore) {
        query = query.lte('publishDate', req.query.publishedBefore);
    }

    if (req.query?.publishedAfter) {
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    try{
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOpts: req.query
        });
    } catch{
        res.redirect('/');
    }
});

// New book route
router.get('/new', (req, res) => {
    renderNewPage(res, new Book());
});

// Create book route
router.post('/', upload.single('cover'), async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImageName: req.file?.filename ?? null
    });

    try {
        const newBook = await book.save();
        //res.redirect(`books/${newBook.id}`);
        res.redirect('books');
    } catch {
        if (book.coverImageName) {
            removeBookCover(book.coverImageName);
        }
        renderNewPage(res, book, true);
    }
});

const removeBookCover = (fileName) => {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) { console.error(err); }
    });
};

const renderNewPage = async (res, book, hasError = false) => {
    try {
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        if (hasError) {
            params.errorMessage = 'Error Creating Book';
        }
        res.render('books/new', params);
    } catch {
        res.redirect('/books');
    }
}

module.exports = router;