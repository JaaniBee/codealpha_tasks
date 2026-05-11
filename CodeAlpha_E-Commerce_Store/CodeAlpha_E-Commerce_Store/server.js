const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();

/* DATABASE CONNECTION */

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

/* MIDDLEWARE */

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })

}));

/* CART SESSION */

app.use((req, res, next) => {

    if (!req.session.cart) {

        req.session.cart = [];

    }

    next();

});

/* HOME PAGE */

app.get('/', async (req, res) => {

    const products = await Product.find();

    res.render('index', {

        products,

        user: req.session.user

    });

});

/* PRODUCT DETAILS */
app.get('/product/:id', async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.send('Product Not Found');

        }

        res.render('product', {

            product,

            user: req.session.user

        });

    } catch (error) {

        console.log(error);

        res.send('Invalid Product ID');

    }

});

/* ADD TO CART */

app.post('/add-to-cart/:id', async (req, res) => {

    const product = await Product.findById(req.params.id);

    req.session.cart.push(product);

    res.redirect('/cart');

});

/* CART PAGE */

app.get('/cart', (req, res) => {

    const cart = req.session.cart;

    let total = 0;

    cart.forEach(item => {

        total += item.price;

    });

    res.render('cart', {

        cart,

        total,

        user: req.session.user

    });

});

/* REGISTER PAGE */

app.get('/register', (req, res) => {

    res.render('register');

});

/* REGISTER USER */

app.post('/register', async (req, res) => {

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({

        name,

        email,

        password: hashedPassword

    });

    await user.save();

    res.redirect('/login');

});

/* LOGIN PAGE */

app.get('/login', (req, res) => {

    res.render('login');

});

/* LOGIN USER */

app.post('/login', async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

        return res.send('User not found');

    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {

        return res.send('Wrong Password');

    }

    req.session.user = user;

    res.redirect('/');

});

/* LOGOUT */

app.get('/logout', (req, res) => {

    req.session.destroy();

    res.redirect('/');

});

/* PLACE ORDER */

app.post('/place-order', async (req, res) => {

    if (!req.session.user) {

        return res.redirect('/login');

    }

    const cart = req.session.cart;

    let total = 0;

    cart.forEach(item => {

        total += item.price;

    });

    const order = new Order({

        userId: req.session.user._id,

        customerName: req.body.name,

        phone: req.body.phone,

        address: req.body.address,

        paymentMethod: req.body.payment,

        products: cart,

        total: total,

        status: 'Order Confirmed'

    });

    await order.save();

    req.session.cart = [];

    res.redirect('/orders');

});

/* SEED PRODUCTS */

app.get('/seed', async (req, res) => {

    await Product.deleteMany();

    await Product.insertMany([

        {
            name: 'iPhone 15 Pro',
            price: 129999,
            image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200',
            description: 'Latest Apple smartphone with titanium design.'
        },

        {
            name: 'Samsung Galaxy S24',
            price: 89999,
            image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200',
            description: 'Premium Android smartphone with AI features.'
        },

        {
            name: 'MacBook Pro',
            price: 189999,
            image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp14-spaceblack-select-202410?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1728916305295',
            description: 'Professional laptop for coding and editing.'
        },

        {
            name: 'Gaming Laptop',
            price: 139999,
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200',
            description: 'RTX gaming laptop with ultra performance.'
        },

        {
            name: 'Sony Headphones',
            price: 19999,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200',
            description: 'Wireless noise cancelling headphones.'
        },

        {
            name: 'Bluetooth Speaker',
            price: 4999,
            image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200',
            description: 'Portable speaker with deep bass.'
        },

        {
            name: 'Gaming Keyboard',
            price: 5999,
            image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1200',
            description: 'RGB mechanical keyboard for gaming.'
        },

        {
            name: 'Gaming Mouse',
            price: 2499,
            image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1200',
            description: 'Professional gaming mouse with RGB.'
        },

        {
            name: 'Smart Watch',
            price: 8999,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200',
            description: 'Fitness tracking smartwatch.'
        },

        {
            name: 'DSLR Camera',
            price: 55999,
            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200',
            description: 'Professional DSLR camera.'
        },

        {
            name: 'AirPods Pro',
            price: 24999,
            image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=1200',
            description: 'Apple wireless earbuds with ANC.'
        },

        {
            name: '4K Smart TV',
            price: 79999,
            image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1200',
            description: 'Ultra HD smart television.'
        },

        {
            name: 'PlayStation 5',
            price: 54999,
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1200',
            description: 'Next generation gaming console.'
        },

        {
            name: 'Canon Printer',
            price: 14999,
            image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=1200',
            description: 'Wireless color printer for office use.'
        },

        {
            name: 'Office Chair',
            price: 11999,
            image: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg',
            description: 'Comfortable ergonomic office chair.'
        },

        {
            name: 'Nike Shoes',
            price: 7999,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200',
            description: 'Stylish sports shoes with comfort fit.'
        },

        {
            name: 'Backpack',
            price: 2999,
            image: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=1200',
            description: 'Travel backpack with large storage.'
        },

        {
            name: 'Tablet',
            price: 45999,
            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200',
            description: 'Portable tablet for study and entertainment.'
        }

    ]);

    res.send('All Products Added Successfully');

});

/* ORDERS PAGE */

app.get('/orders', async (req, res) => {

    if (!req.session.user) {

        return res.redirect('/login');

    }

    const orders = await Order.find({

        userId: req.session.user._id

    });

    res.render('orders', {

        orders

    });

});

/* SERVER */

app.listen(3000, () => {

    console.log('Server Running On http://localhost:3000');

});