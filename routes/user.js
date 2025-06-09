const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { name, email } = req.body;
        
        // Validación básica
        if (!name || !email) {
            return res.status(400).json({ error: 'Nombre y email son requeridos' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const user = new User({ name, email });
        await user.save();
        
        console.log('Usuario registrado:', user); // Debug
        res.status(201).json({
            success: true,
            user: { name: user.name, email: user.email }
        });
    } catch (error) {
        console.error('Error en registro:', error); // Debug
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Intento de login con email:', email);

        if (!email) {
            return res.status(400).json({ error: 'El email es requerido' });
        }

        const user = await User.findOne({ email });
        console.log('Usuario encontrado:', user);
        
        if (!user) {
            return res.status(404).json({ error: 'No existe una cuenta con este email' });
        }
        
        res.json({ 
            success: true, 
            user: { 
                name: user.name, 
                email: user.email 
            } 
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;
