const Express = require('express');
const { updateGuildsData, hasGuildAccess } = require('../controllers/discord.js');
const { hasGuildSettings } = require('../controllers/data.js');

const router = Express.Router();
const settingsRouter = require('./settings.js');

module.exports = router;

router.use((req, res, next) => {
	res.locals.version = require('./../package.json').version;
	res.locals.user = req.session.user;

	return next();
});

router.get('/', (req, res, next) => {
	res.render('index');
});

router.use('/dashboard', (req, res, next) => {
	if (!req.session.tokenType || !req.session.token) return res.redirect('/orbit/auth');

	return next();
});

router.get('/dashboard', async (req, res, next) => {
	res.render('guildSelect', {
		guilds:	(Date.now() > req.session.expires ? await updateGuildsData(req.session) : req.session.guilds)
	});
});

router.use('/dashboard/:guildID', async (req, res, next) => {
	if (!await hasGuildSettings(req.params.guildID) || !hasGuildAccess(req.params.guildID, req.session.guilds)) return res.redirect('/orbit/dashboard');

	return next();
});

router.use('/dashboard/:guildID', settingsRouter);

router.get('/support', (req, res, next) => {
	res.redirect('/orbit/support/server');
});

router.get('/support/server', (req, res, next) => {
	res.redirect(process.env.SUPPORT_INVITE_URL);
});
