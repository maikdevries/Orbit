const Express = require('express');
const { getUser, getGuilds, getGuildChannels, getGuildRoles } = require('../controllers/discord.js');
const { getGuildSettings, updateSetting, saveSetting } = require('../controllers/data.js');

const router = Express.Router();

module.exports = router;

router.get('/', async (req, res, next) => {
	res.render('index', {
		user: await getUser(req.session.tokenType, req.session.token)
	});
});

router.get('/dashboard', async (req, res, next) => {
	res.render('guildSelect', {
		user: await getUser(req.session.tokenType, req.session.token),
		guilds: await getGuilds(req.session.tokenType, req.session.token)
	});
});

router.get('/dashboard/:guildID', async (req, res, next) => {
	res.render('dashboard', {
		user: await getUser(req.session.tokenType, req.session.token),
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
	res.redirect(process.env.SUPPORT_INVITE_URL);
});
