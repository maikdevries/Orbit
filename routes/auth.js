const Express = require('express');
const { getAuthentication } = require('../controllers/auth.js');
const { getUserData } = require('../controllers/discord.js');

const router = Express.Router();

module.exports = router;

router.get('/', (req, res, next) => {
	return res.redirect(process.env.AUTHENTICATION_URL);
});

router.get('/login', async (req, res, next) => {
	if (!req.query.code) return res.redirect('/auth');

	try {
		const authData = await getAuthentication(req.query.code);
		Object.assign(req.session, authData, await getUserData(authData));

		return res.redirect('/dashboard');
	} catch (error) { return next(error) }
});

router.get('/logout', (req, res, next) => {
	req.session.destroy(() => res.redirect('/'));
});

router.get('/server', (req, res, next) => {
	return res.redirect(`/dashboard/${req.query.guild_id}`);
});

router.get('/server/:guildID', (req, res, next) => {
	return res.redirect(`${process.env.INVITE_URL}&guild_id=${req.params.guildID}&disable_guild_select=true`);
});
