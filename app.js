const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require("cors");
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const express = require('express');
const createError = require('http-errors');
const { DateTime } = require('luxon');

const app = express();
const port = 3000;

const username = encodeURIComponent('prarthana');
const password = encodeURIComponent('PraSid@78');

const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoDBUrl = "mongodb+srv://" + username + ":" + password + "@mediproc.undefug.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(mongoDBUrl, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const myDB = client.db('mediproc');
global.myDB = myDB;

// compress all responses
app.use(compression());

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 500000 }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  res.setHeader('Server', 'utf');
  next();
});

// Middleware to set default timezone for all routes
app.use(function (req, res, next) {
  process.env.TZ = 'Asia/Calcutta'; // Set the desired timezone

  // Continue processing the next middleware/route handler
  next();
});

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`MediProcAPI listening on port ${port}`)
});

app.use('/mediproc/ref', require('./routes/reference.routes'));
app.use('/mediproc/user', require('./routes/user.routes'));
app.use('/mediproc/pet', require('./routes/pet.routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
