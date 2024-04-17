const express = require('express');
const router = express.Router();
const Product = require('../dao/models/ProductModel');
const Cart = require('../dao/models/CartModel');

// Método GET /products
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        
        // Construcción de filtros
        const filters = {};
        if (query) {
            filters.title = { $regex: query, $options: 'i' }; // Búsqueda case-insensitive
        }

        // Obtener el total de productos que coinciden con los filtros
        const totalProducts = await Product.countDocuments(filters);

        // Calcular el número total de páginas
        const totalPages = Math.ceil(totalProducts / limit);

        // Calcular el índice de salto para la paginación
        const skip = (page - 1) * limit;

        // Consultar los productos con los filtros y la paginación aplicados
        let products = await Product.find(filters)
            .limit(parseInt(limit))
            .skip(skip);

        // Ordenar los productos si se especificó
        if (sort) {
            const sortOrder = sort === 'asc' ? 1 : -1;
            products = products.sort({ price: sortOrder });
        }

        // Construir los enlaces de paginación
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        const nextPage = hasNextPage ? parseInt(page) + 1 : null;
        const prevPage = hasPrevPage ? parseInt(page) - 1 : null;
        const prevLink = hasPrevPage ? `/?page=${prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null;
        const nextLink = hasNextPage ? `/?page=${nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null;

        // Respuesta con el formato especificado
        res.json({
            status: 'success',
            payload: products,
            totalPages,
            prevPage,
            nextPage,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;
        const product = await Product.create(newProduct);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar un producto
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = req.body;
        const product = await Product.findByIdAndUpdate(req.params.pid, updatedProduct, { new: true });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.pid);
        if (product) {
            res.json({ message: 'Producto eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Agregar un producto al carrito
router.post('/:productId/cart/:cartId', async (req, res) => {
    try {
        const { productId, cartId } = req.params;
        const cart = await Cart.findById(cartId);
        if (cart) {
            const product = await Product.findById(productId);
            if (product) {
                cart.products.push({ productId: product._id, quantity: 1 });
                await cart.save();
                res.status(201).json(cart);
            } else {
                res.status(404).json({ message: 'Producto no encontrado' });
            }
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;