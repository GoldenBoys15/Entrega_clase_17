const express = require('express');
const router = express.Router();
const Cart = require('../dao/models/CartModel');
const Product = require('../dao/models/ProductModel');

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = req.body;
        const createdCart = await Cart.create(newCart);
        res.status(201).json(createdCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un carrito por su ID
router.get('/:cartId', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cartId).populate('products');
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar un producto a un carrito
router.post('/:cartId/products/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const cart = await Cart.findById(cartId);
        if (cart) {
            cart.products.push(productId);
            await cart.save();
            res.status(201).json(cart);
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un producto de un carrito
router.delete('/:cartId/products/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const updatedCart = await Cart.findByIdAndUpdate(
            cartId,
            { $pull: { products: productId } },
            { new: true }
        );
        if (updatedCart) {
            res.status(200).json({ message: 'Producto eliminado del carrito' });
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un carrito con un arreglo de productos
router.put('/:cartId/products', async (req, res) => {
    try {
        const { cartId } = req.params;
        const { products } = req.body;
        const updatedCart = await Cart.findByIdAndUpdate(cartId, { products }, { new: true });
        if (updatedCart) {
            res.status(200).json(updatedCart);
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar la cantidad de ejemplares de un producto en el carrito
router.put('/:cartId/products/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const { quantity } = req.body;
        const cart = await Cart.findById(cartId);
        if (cart) {
            const productIndex = cart.products.findIndex(p => p.productId === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity = quantity;
                await cart.save();
                res.status(200).json(cart);
            } else {
                res.status(404).json({ message: 'Producto no encontrado en el carrito' });
            }
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar todos los productos del carrito
router.delete('/:cartId/products', async (req, res) => {
    try {
        const { cartId } = req.params;
        const updatedCart = await Cart.findByIdAndUpdate(cartId, { products: [] }, { new: true });
        if (updatedCart) {
            res.status(200).json({ message: 'Productos eliminados del carrito' });
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todos los productos del carrito
router.get('/:cartId/products', async (req, res) => {
    try {
        const { cartId } = req.params;
        const cart = await Cart.findById(cartId).populate('products');
        if (cart) {
            res.status(200).json(cart.products);
        } else {
            res.status(404).json({ message: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
