const Express = require('express');

const router = Express.Router();

module.exports = router;

router.get('/guilds/:guildID', (req, res, next) => {
	res.json(req.session.guildData);
});

router.get('/guilds/:guildID/roles', (req, res, next) => {
	res.json(req.session.guildRoles);
});

router.get('/guilds/:guildID/emojis', (req, res, next) => {
	res.json(req.session.guildEmojis);
});
