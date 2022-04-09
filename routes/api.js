const Express = require('express');
const { updateGuildSetting, deleteGuildSetting } = require('../controllers/data.js');

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

router.post('/:guildID/:featurePath', async (req, res, next) => {
	try { res.json(await updateGuildSetting(`${req.params.guildID}.${req.params.featurePath}`, req.body, req.query.channelUsername)) }
	catch (error) { console.error(error); res.status(500).send('Something went terribly wrong on our side of the internet.') }
});

router.delete('/:guildID/:featurePath', async (req, res, next) => {
	try { res.json(await deleteGuildSetting(`${req.params.guildID}.${req.params.featurePath}`, req.query.channelUsername)) }
	catch (error) { console.error(error); res.status(500).json('Something went terribly wrong on our side of the internet.') }
});
