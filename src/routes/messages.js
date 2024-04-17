const express = require('express');
const router = express.Router();
const Message = require('../dao/models/MessageModel');

// Crear un nuevo mensaje
router.post('/', async (req, res) => {
    try {
        const newMessage = req.body;
        const message = await Message.create(newMessage);
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todos los mensajes
router.get('/', async (req, res) => {
    try {
        const messages = await Message.find();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un mensaje por su ID
router.get('/:messageId', async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (message) {
            res.json(message);
        } else {
            res.status(404).json({ message: 'Mensaje no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un mensaje
router.delete('/:messageId', async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.messageId);
        if (message) {
            res.json({ message: 'Mensaje eliminado exitosamente' });
        } else {
            res.status(404).json({ message: 'Mensaje no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
