require('dotenv').config();

const Express = require('express');
const http = require('http');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);

const router = require('./routes/router.js');

const app = Express();
const server = http.createServer(app);

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.use(session({
	cookie: { secure: false, maxAge: 86400000 },
	store: new MemoryStore({
		checkPeriod: 86400000
	}),
	saveUninitialized: false,
	resave: false,
	secret: process.env.SESSION_SECRET
}));

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use('/orbit', Express.static(`${__dirname}/public`));

app.use('/orbit', router);

server.listen(3001, () => console.log('HTTP backend server successfully launched!'));
