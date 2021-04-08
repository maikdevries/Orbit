const http = require(`http`);

const Express = require(`express`);
const app = Express();

const httpServer = http.createServer(app);


app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

app.use(`/api`, require(`./api/api.js`));

app.get(`/csrf`, (req, res) => {
	res.send(`Your request was used in a Cross-Site Request Forgery (CSRF) attack and thus not processed.`);
});

app.use(Express.static(`src`));

httpServer.listen(3001, () => console.log(`HTTP backend server successfully launched!`));
