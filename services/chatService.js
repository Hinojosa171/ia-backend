const { openai, CHEF_RESPONSES } = require('../config/openai');
const Chat = require('../models/Chat');

class ChatService {
    static async processMessage(userId, message) {
        try {
            let chat = await Chat.findOne({ userId });
            if (!chat) {
                chat = new Chat({ userId, messages: [] });
            }

            const context = chat.messages.slice(-5).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { 
                        role: "system", 
                        content: this.getPromptBasedOnMessage(message)
                    },
                    ...context,
                    { role: "user", content: message }
                ],
                temperature: 0.7,
                max_tokens: 1000
            });

            const reply = response.choices[0].message.content;
            chat.messages.push(
                { text: message, sender: 'user' },
                { text: reply, sender: 'chef' }
            );
            await chat.save();

            return reply;
        } catch (error) {
            console.error('Error en ChatService:', error);
            throw error;
        }
    }

    static getPromptBasedOnMessage(message) {
        if (message.toLowerCase().includes('receta')) {
            return CHEF_RESPONSES.RECIPE_FORMAT;
        }
        return CHEF_RESPONSES.TECHNIQUE_FORMAT;
    }
}

module.exports = ChatService;
