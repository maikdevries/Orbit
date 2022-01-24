const Express = require('express');
const { updateGuildsData, hasGuildAccess, getGuildChannels, getGuildRoles } = require('../controllers/discord.js');
const { hasGuildSettings, getGuildSettings, updateSetting, saveSetting } = require('../controllers/data.js');

const router = Express.Router();

module.exports = router;

router.use('/', async (req, res, next) => {
	res.locals.version = require('./../package.json').version;
	next();
});

router.get('/', async (req, res, next) => {
	res.render('index', {
		user: req.session.user
	});
});

router.use('/dashboard', (req, res, next) => {
	if (!req.session.tokenType || !req.session.token) return res.redirect('/orbit/auth');
	next();
});

router.get('/dashboard', async (req, res, next) => {
	res.render('guildSelect', {
		user: req.session.user,
		guilds:	(Date.now() > req.session.expires ? await updateGuildsData(req.session) : req.session.guilds)
	});
});

router.use('/dashboard/:guildID', async (req, res, next) => {
	if (!await hasGuildSettings(req.params.guildID) || !hasGuildAccess(req.params.guildID, req.session.guilds)) return res.redirect('/orbit/dashboard');
	next();
});

router.get('/dashboard/:guildID', async (req, res, next) => {
	res.render('dashboard', {
		user: req.session.user,
		guildID: req.params.guildID,
		guildSettings: await getGuildSettings(req.params.guildID),
		channels: await getGuildChannels(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN),
		roles: await getGuildRoles(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN)
	});
});

router.post('/dashboard/:guildID/:settingName/update', async (req, res, next) => {
	res.json(await updateSetting(req.params.guildID, req.params.settingName, req.body));
});

router.post('/dashboard/:guildID/:settingName/save', async (req, res, next) => {
	res.json(await saveSetting(req.params.guildID, req.params.settingName, req.body));
});

router.get('/support', (req, res, next) => {
	res.redirect('/orbit/support/server');
});

router.get('/support/server', (req, res, next) => {
	res.redirect(process.env.SUPPORT_INVITE_URL);
});
