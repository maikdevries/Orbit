const Express = require('express');
const { getAuthentication } = require('../controllers/auth.js');

const router = Express.Router();

module.exports = router;

router.get('/login', async (req, res, next) => {
	Object.assign(req.session, await getAuthentication(req.query.code));

	req.session.save(() => res.redirect('/dashboard'));
});

router.get('/logout', (req, res, next) => {
	req.session.destroy(() => res.redirect('/'));
});

router.get('/server', (req, res, next) => {
	res.redirect(`/dashboard/${req.query.guild_id}`);
});

router.get('/server/:guildID', (req, res, next) => {
	res.redirect(`${process.env.SERVER_INVITE_URL}&guild_id=${req.params.guildID}`);
});
