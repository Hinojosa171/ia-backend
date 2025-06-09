const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Chat = require('../models/Chat');
const { openai } = require('../config/openai');
const { SYSTEM_PROMPT, WELCOME_MESSAGE } = require('../config/chefPrompt');
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
        console.log('Recibiendo mensaje:', req.body); // Debug

        const { message, email } = req.body;
        if (!message || !email) {
            throw new Error('Mensaje y email son requeridos');
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Obtener respuesta de OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    role: "system", 
                    content: SYSTEM_PROMPT 
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 800
        });

        console.log('Respuesta de OpenAI:', response.choices[0]); // Debug

        const reply = response.choices[0].message.content;

        // Guardar en el historial
        let chat = await Chat.findOne({ userId: user._id });
        if (!chat) {
            chat = new Chat({ userId: user._id, messages: [] });
        }

        chat.messages.push(
            { text: message, sender: 'user', timestamp: new Date() },
            { text: reply, sender: 'chef', timestamp: new Date() }
        );
        await chat.save();

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
