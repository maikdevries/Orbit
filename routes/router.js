const Express = require('express');
const { getUser, getGuilds } = require('../controllers/discord.js');
const { getGuildData } = require('../controllers/data.js');

const router = Express.Router();

module.exports = router;

router.get('/', (req, res, next) => {
	res.render('index');
});

router.get('/dashboard', async (req, res, next) => {
	res.render('serverSelect', { user: await getUser(req.session.tokenType, req.session.token), guilds: await getGuilds(req.session.tokenType, req.session.token) });
});

router.get('/dashboard/:guildID', async (req, res, next) => {
	res.render('dashboard', { guildData: await getGuildData(req.params.guildID) });
});
