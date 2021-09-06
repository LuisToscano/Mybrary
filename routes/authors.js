const express = require('express');
const router = express.Router();
const Author = require('../models/author');

// All Authors route
router.get('/', async (req, res) => {
    let searchOpts = {};
    if (req.query.name) {
        searchOpts.name = new RegExp(req.query.name, 'i');
    }
    try{
        const authors = await Author.find(searchOpts);
        res.render('authors/index', { authors: authors, searchOpts: req.query ?? {} });
    } catch {
        res.redirect('');
    }
});

// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
});

// Create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    });

    try {
        const newAuthor = await author.save();
        //res.redirect(`authors/${newAuthor.id}`);
        res.redirect(`authors`);
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        })
    }
});

module.exports = router;