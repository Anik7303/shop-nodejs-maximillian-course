const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const keys = require('./keys');
const shopRoutes = require('./routes/shop');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const errorRoutes = require('./routes/error');

const app = express();
// const store = new MongoDBStore({
//     uri: keys.MONGODB_ATLAS_URI,
//     databaseName: 'shop',
//     collection: 'sessions'
// });
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
// app.use(session({
//     secret: keys.SESSION_SECRET_KEY,
//     resave: false,
//     saveUninitialized: false,
//     store: store
// }));
// app.use(csrfProtection);

// app.use(userRoutes);
app.use(shopRoutes);
app.use(authRoutes);
// app.use(errorRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    error.statusCode = error.statusCode || 500;
    res.status(error.statusCode).render('error/index', {
        pageTitle: error.statusCode.toString(),
        path: '/' + error.statusCode
    });
});

const MONGODB_CONNECT_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: false
};

mongoose.connect(keys.MONGODB_ATLAS_URI, MONGODB_CONNECT_OPTIONS)
    .then((result) => {
        if(!result) throw new Error('Could not connect to \'MongoDB Atlas\' server');
        app.listen(process.env.PORT || 3000);
    })
    .catch(error => console.log(error));
