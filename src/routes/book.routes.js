const express = require("express");
const router = express.Router();
const Book = require("../models/book.model");

// MIDDLEWARE
const getBook = async (req, res, next) => {
    const { id } = req.params;

    // Validar que el ID del libro tenga el formato correcto de un ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({  // Cambiado a 400 para reflejar un error en la solicitud
            message: "El ID del libro no es válido",
        });
    }

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                message: "El libro no fue encontrado",
            });
        }
        res.book = book; // Almacenar el libro encontrado en el objeto de respuesta
        next();
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};


// Obtener todos los libros.
router.get("/", async (req, res) => {
    try {
        const books = await Book.find();
        console.log("GET ALL", books);
        if (books.length === 0) {
            return res.status(204).json([]);
        }
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear un nuevo libro (recursos)
router.post("/", async (req, res) => {
    const { title, author, gender, publication_date } = req?.body;
    if (!title || !author || !gender || !publication_date) {
        return res.status(400).json({
            message: "Los campos título, autor, genero y fecha son obligatorios",
        });
    }

    const book = new Book({
        title,
        author,
        gender,
        publication_date,
    });

    try {
        const newBook = await book.save();
        console.log(newBook);
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// Obtener un libro por ID.
router.get("/:id", getBook, async (req, res) => {
    res.json(res.book);
});

// Actualizar libros por ID método(PUT).
router.put("/:id", getBook, async (req, res) => {
    try {
        const book = res.book;
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.gender = req.body.gender || book.gender;
        book.publication_date = req.body.publication_date || book.publication_date;

        const updateBook = await book.save();
        res.json(updateBook);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// Actualizar libros por ID método(PATCH).
router.patch("/:id", getBook, async (req, res) => {
    if (
        !req.body.title ||
        !req.body.author ||
        !req.body.gender ||
        !req.body.publication_date
    ) {
        res.status(400).json({
            message: "Los campos título, autor, genero y fecha son obligatorios",
        });
    }

    try {
        const book = res.book;
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.gender = req.body.gender || book.gender;
        book.publication_date = req.body.publication_date || book.publication_date;

        const updateBook = await book.save();
        res.json(updateBook);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
});

// Eliminar libro por ID.
router.delete("/:id", getBook, async (req, res) => {
    try {
        const book = res.book;
        await book.deleteOne({
            _id: book._id
        })
        res.json({
            message: `El libro '${book.title}' fue eliminado correctamente`,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router;
