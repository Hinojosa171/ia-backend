const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    text: String,
    sender: String,
    timestamp: { 
        type: Date, 
        default: Date.now,
        required: true 
    }
});

const chatSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    messages: [messageSchema],
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
});

// Método para agrupar mensajes por fecha
chatSchema.methods.getMessagesByDate = function() {
    return this.messages.reduce((groups, msg) => {
        const date = msg.timestamp.toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(msg);
        return groups;
    }, {});
};

module.exports = mongoose.model('Chat', chatSchema);
