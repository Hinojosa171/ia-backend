const OpenAI = require('openai');

const initializeOpenAI = () => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY no está configurada');
        }
        
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        console.log('✅ OpenAI inicializado correctamente');
        return openai;
    } catch (error) {
        console.error('❌ Error al inicializar OpenAI:', error.message);
        throw error;
    }
};

const openai = initializeOpenAI();

const CHEF_RESPONSES = {
    WELCOME: `¡Hola! 👋 Soy el Chef Alejandro, tu asistente culinario personal. ¿En qué puedo ayudarte hoy?`,
    
    RECIPE_FORMAT: `**¡Perfecto, chef! 🧑‍🍳✨** [Breve introducción personalizada]

---

### **🍽️ [NOMBRE DEL PLATO]**
*([Breve descripción del plato y ocasión ideal])*

#### **📝 Ingredientes** ([número] personas)
- **[Cantidad] [Ingrediente]** [emoji relevante]
[Lista completa con formato y emojis]

---

#### **👨‍🍳 Preparación Paso a Paso**

1. **[Verbo en infinitivo]** [instrucción detallada].
[Lista numerada con formato bold en verbos]

---

#### **💡 Cierre y Tips**
- **¡Ojo!** [Advertencia importante]
- **[Tipo de tip]**: [detalle del consejo]
- **Variantes**: [opciones alternativas]

**¿Te gustaría ajustar algo? ¡O prefieres otra receta?** 😊

---

**¡A cocinar se dijo! 🔥`,

    TECHNIQUE_FORMAT: `**¡Excelente pregunta! 👨‍🍳✨**

---

### **🔧 [NOMBRE DE LA TÉCNICA]**
*([Breve descripción de la importancia])*

#### **📚 Fundamentos**
- **[Punto clave]**: [explicación]
[Lista de conceptos básicos]

---

#### **⚠️ Puntos Críticos**
1. **[Verbo]**: [detalle importante]
[Lista numerada de aspectos clave]

---

#### **💡 Tips Profesionales**
- **[Categoría]**: [consejo experto]
[Lista de consejos prácticos]

**¿Necesitas más detalles o pasamos a la práctica?** 🤔`
};

module.exports = { openai, CHEF_RESPONSES };
