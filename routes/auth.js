const Express = require('express');
const { getAuthentication } = require('../controllers/auth.js');
const { getData } = require('../controllers/discord.js');

const router = Express.Router();

module.exports = router;

router.get('/', (req, res, next) => {
	res.redirect(process.env.INVITE_URL);
});

router.get('/login', async (req, res, next) => {
	if (!req.query.code) return res.redirect('/orbit/auth');

	const authData = await getAuthentication(req.query.code);
	Object.assign(req.session, authData, await getData(authData));

	res.redirect('/orbit/dashboard');
});

router.get('/logout', (req, res, next) => {
	req.session.destroy(() => res.redirect('/orbit/'));
});

router.get('/server', (req, res, next) => {
	res.redirect(`/orbit/dashboard/${req.query.guild_id}`);
});

router.get('/server/:guildID', (req, res, next) => {
	res.redirect(`${process.env.SERVER_INVITE_URL}&guild_id=${req.params.guildID}`);
});
