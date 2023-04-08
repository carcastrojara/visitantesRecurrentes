const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Se establece una conexión con la base de datos
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mongo-2', { useNewUrlParser: true });

// Se define un modelo para un objeto "Visitor"
const visitorSchema = new mongoose.Schema({
    name: { type: String, default: 'Anónimo' },
    count: { type: Number, default: 1 }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

// Se define la ruta para la raíz de la aplicación
app.get('/', async (req, res) => {
    // Se obtiene el nombre del visitante del query string
    const name = req.query.name || 'Anónimo';

    // Buscamos si existe algún visitante con el mismo nombre en la BD
    const visitor = await Visitor.findOne({ name });

    if (visitor) {
        // Si existe, se aumenta el contador
        const newCount = visitor.count + 1;
        await Visitor.updateOne({ _id: visitor._id }, { count: newCount });
    } else {
        // Si no existe, se crea un nuevo visitante
        const newVisitor = new Visitor({ name });
        await newVisitor.save();
    }

    // Se muestra la tabla con todos los visitantes
    const visitors = await Visitor.find({});
    let html = '<h1>Lista de visitantes:</h1><table><tr><th>ID</th><th>Nombre</th><th>Visitas</th></tr>';
    visitors.forEach(v => {
        html += `<tr><td>${v._id}</td><td>${v.name}</td><td>${v.count}</td></tr>`
    });
    html += '</table>';

    res.send(html);
});

// Se inicia el servidor
app.listen(3000, () => {
    console.log('El servidor está corriendo en el puerto 3000');
});
