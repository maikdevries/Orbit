const Express = require('express');
const { getGuildSettings } = require('../controllers/data.js');
const { getGuildData, getGuildChannels, getGuildCategories, getGuildRoles, getGuildEmojis, getMessageData } = require('../controllers/discord.js');
const { getTwitchChannelData } = require('../controllers/twitch.js');
const { getYouTubeChannelData } = require('../controllers/youtube.js');

const router = Express.Router({ mergeParams: true });

module.exports = router;

router.use(async (req, res, next) => {
	if (req.session.currentGuild === req.params.guildID) return next();

	try {
		Object.assign(req.session, {
			currentGuild: req.params.guildID,
			guildData: await getGuildData(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN),
			guildChannels: await getGuildChannels(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN),
			guildCategories: await getGuildCategories(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN),
			guildRoles: await getGuildRoles(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN),
			guildEmojis: await getGuildEmojis(req.params.guildID, process.env.TOKEN_TYPE, process.env.TOKEN)
		});
	} catch (error) { return next(error) }

	return next();
});

router.use((req, res, next) => {
	res.locals.guildData = req.session.guildData;
	res.locals.guildChannels = req.session.guildChannels;
	res.locals.guildCategories = req.session.guildCategories;
	res.locals.guildRoles = req.session.guildRoles;
	res.locals.guildEmojis = req.session.guildEmojis;

	return next();
});

router.get('/', (req, res, next) => {
	res.render('dashboard');
});

router.get('/settings', (req, res, next) => {
	res.render('settings/settings');
});

router.get('/welcomeMessage', async (req, res, next) => {
	try {
		res.render('settings/welcomeMessage', {
			settings: await getGuildSettings(`${req.params.guildID}.welcomeMessage`)
		});
	} catch (error) { return next(error) }
});

router.get('/streamerShoutout', async (req, res, next) => {
	try {
		res.render('settings/streamerShoutout', {
			settings: await getGuildSettings(`${req.params.guildID}.streamerShoutout`)
		});
	} catch (error) { return next(error) }
});

router.get('/twitch', async (req, res, next) => {
	try {
		const settings = await getGuildSettings(`${req.params.guildID}.twitch`);
		settings.channels = await Promise.all(settings.channels.map(async (channel) => ({ settings: channel, resources: await getTwitchChannelData(channel.username) })));

		res.render('settings/twitch', {
			settings: settings
		});
	} catch (error) { return next(error) }
});

router.get('/youtube', async (req, res, next) => {
	try {
		const settings = await getGuildSettings(`${req.params.guildID}.youtube`);
		settings.channels = await Promise.all(settings.channels.map(async (channel) => ({ settings: channel, resources: await getYouTubeChannelData(channel.username) })));

		res.render('settings/youtube', {
			settings: settings
		});
	} catch (error) { return next(error) }
});

router.get('/reactionRole', async (req, res, next) => {
	try {
		const settings = await getGuildSettings(`${req.params.guildID}.reactionRole`);

		for (const channel in settings.channels) {
			for (const message in settings.channels[channel]) settings.channels[channel][message].messageContent = (await getMessageData(channel, message, process.env.TOKEN_TYPE, process.env.TOKEN))?.content;
		}

		res.render('settings/reactionRole', {
			settings: settings
		});
	} catch (error) { return next(error) }
});
