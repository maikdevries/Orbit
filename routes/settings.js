const Express = require('express');
const { getGuildSettings } = require('../controllers/data.js');
const { getGuildData, getGuildChannels, getGuildCategories } = require('../controllers/discord.js');
const { getTwitchChannelData } = require('../controllers/twitch.js');
const { getYouTubeChannelData } = require('../controllers/youtube.js');

const router = Express.Router({ mergeParams: true });

module.exports = router;

router.use(async (req, res, next) => {
	if (req.session.currentGuild === req.params.guildID) return next();

	Object.assign(req.session, {
		currentGuild: req.params.guildID,
		guildData: await getGuildData(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN),
		guildChannels: await getGuildChannels(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN),
		guildCategories: await getGuildCategories(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN)
	});

	return next();
});

router.use((req, res, next) => {
	res.locals.guildData = req.session.guildData;
	res.locals.guildChannels = req.session.guildChannels;
	res.locals.guildCategories = req.session.guildCategories;

	return next();
});

router.get('/', (req, res, next) => {
	res.render('dashboard');
});

router.get('/settings', (req, res, next) => {
	res.render('settings/settings');
});

router.get('/welcomeMessage', async (req, res, next) => {
	res.render('settings/welcomeMessage', {
		settings: await getGuildSettings(`${req.params.guildID}.welcomeMessage`)
	});
});

router.get('/currentlyStreaming', async (req, res, next) => {
	res.render('settings/currentlyStreaming', {
		settings: await getGuildSettings(`${req.params.guildID}.streamStatus`)
	});
});

router.get('/twitch', async (req, res, next) => {
	const settings = await getGuildSettings(`${req.params.guildID}.twitch`);
	settings.channels = await Promise.all(settings.channels.map(async (channel) => ({ settings: channel, resources: await getTwitchChannelData(channel.username) })));

	res.render('settings/twitch', {
		settings: settings
	});
});

router.get('/youtube', async (req, res, next) => {
	const settings = await getGuildSettings(`${req.params.guildID}.youtube`);
	settings.channels = await Promise.all(settings.channels.map(async (channel) => ({ settings: channel, resources: await getYouTubeChannelData(channel.username) })));

	res.render('settings/youtube', {
		settings: settings
	});
});

router.get('/reactionRole', async (req, res, next) => {
	res.render('settings/reactionRole', {
		settings: await getGuildSettings(`${req.params.guildID}.reactionRole`)
	});
});
