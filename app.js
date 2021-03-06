require('dotenv').config();

const Express = require('express');
const http = require('http');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const minify = require('express-minify-html');

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

app.use(minify({
	override: true,
	htmlMinifier: {
		collapseWhitespace: true
	}
}));

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(router);

app.use((error, req, res, next) => {
	console.error(error.toString());

	return res.redirect('/error');
});

server.listen(process.env.PORT, () => console.log('HTTP backend server successfully launched!'));
