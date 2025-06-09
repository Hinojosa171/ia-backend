const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chat = require('../models/Chat');
const ChatService = require('../services/chatService');

router.get('/history/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let chat = await Chat.findOne({ userId: user._id });
        if (!chat) {
            return res.json({ messages: [] });
        }

        // Agrupar mensajes por fecha
        const messagesByDate = chat.getMessagesByDate();
        res.json({ 
            messagesByDate,
            userId: user._id,
            totalMessages: chat.messages.length
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial' });
    }
});

router.post('/message', async (req, res) => {
    try {
        const { message, email } = req.body;
        if (!message || !email) {
            return res.status(400).json({ error: 'Mensaje y email son requeridos' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const reply = await ChatService.processMessage(user._id, message);
        res.json({ reply });
    } catch (error) {
        console.error('Error en chat:', error);
        res.status(500).json({ 
            error: 'Error al procesar el mensaje',
            details: error.message 
        });
    }
});

module.exports = router;
