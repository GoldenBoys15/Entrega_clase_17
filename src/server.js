const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb+srv://LucasOrtiz:contraseña@cluster0.bwvhzt2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB Atlas:'));
db.once('open', () => {
    console.log('Conexión a MongoDB Atlas establecida correctamente');
});

// Configurar Handlebars
app.engine('handlebars', exphbs.engine({ defaultLayout: false }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/views`);

// Middleware para procesar datos codificados en formato URL
app.use(express.urlencoded({ extended: true }));

// Middleware para procesar datos en formato JSON
app.use(express.json());

// Definir modelos de Mongoose
const Product = require('./dao/models/ProductModel');
const Cart = require('./dao/models/CartModel');
const Message = require('./dao/models/MessageModel');

// Rutas para las vistas
app.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('home', { products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        
        // Construye la lógica para obtener los productos con paginación, filtros y ordenamiento
        const products = await Product.find({
            title: { $regex: query || '', $options: 'i' }
        })
        .sort({ price: sort === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments({
            title: { $regex: query || '', $options: 'i' }
        });
        const totalPages = Math.ceil(totalProducts / limit);
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;
        const prevPage = hasPrevPage ? page - 1 : null;
        const nextPage = hasNextPage ? page + 1 : null;

        const cart = await Cart.findOne({ userId: 'usuario_actual' }); // Reemplaza 'usuario_actual' con el ID del usuario actual
        if (!cart) {
            await Cart.create({ userId: 'usuario_actual' });
        }

        res.render('products', {
            products,
            totalPages,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            limit,
            page,
            sort,
            query,
            cartId: cart?._id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/carts/:cid', async (req, res) => {
    try {
        // ...
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

// Manejo de conexiones WebSocket
io.on('connection', (socket) => {
    console.log('Usuario conectado al chat');

    // Manejar envío de mensaje
    socket.on('sendMessage', async (messageData) => {
        try {
            // ...
        } catch (error) {
            console.error('Error al guardar el mensaje en la base de datos:', error);
        }
    });

    // Manejar desconexión de usuario
    socket.on('disconnect', () => {
        console.log('Usuario desconectado del chat');
    });
});

const PORT = 8080;
http.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});