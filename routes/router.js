const Express = require('express');
const { updateGuildsData, hasGuildAccess } = require('../controllers/discord.js');
const { hasGuildSettings } = require('../controllers/data.js');

const router = Express.Router();
const authRouter = require('./auth.js');
const apiRouter = require('./api.js');
const settingsRouter = require('./settings.js');

module.exports = router;

router.use('/auth', authRouter);
router.use('/api', apiRouter);

router.use((req, res, next) => {
	res.locals.version = require('./../package.json').version;
	res.locals.user = req.session.user;

	return next();
});

router.get('/', (req, res, next) => {
	return res.render('index');
});

router.use('/dashboard', (req, res, next) => {
	if (!req.session.tokenType || !req.session.token) return res.redirect('/auth');

	return next();
});

router.get('/dashboard', async (req, res, next) => {
	try {
		return res.render('guildSelect', {
			guilds: (req.session.expires > Date.now() ? req.session.guilds : await updateGuildsData(req.session))
		});
	} catch (error) { return next(error) }
});

router.use('/dashboard/:guildID', async (req, res, next) => {
	try {
		if (!await hasGuildSettings(req.params.guildID) || !hasGuildAccess(req.params.guildID, req.session.guilds)) return res.redirect('/auth');

		return next();
	} catch (error) { return next(error) }
});

router.use('/dashboard/:guildID', settingsRouter);

router.get('/support', (req, res, next) => {
	return res.redirect('/support/server');
});

router.get('/support/server', (req, res, next) => {
	return res.redirect(process.env.SUPPORT_SERVER_URL);
});

router.get('/error', (req, res, next) => {
	return res.render('error');
})
