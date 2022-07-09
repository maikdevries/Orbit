const Express = require('express');
const { getGuildSettings } = require('../controllers/data.js');
const { getGuildData, getMessageData, getMissingPermissions } = require('../controllers/discord.js');
const { getTwitchChannelData } = require('../controllers/twitch.js');
const { getYouTubeChannelData } = require('../controllers/youtube.js');

const router = Express.Router({ mergeParams: true });

module.exports = router;

router.use(async (req, res, next) => {
	try {
		if (req.session.currentGuild !== req.params.guildID) Object.assign(req.session, await getGuildData(req.params.guildID));

		res.locals.guildData = req.session.guildData;
		res.locals.guildChannels = req.session.guildChannels;
		res.locals.guildCategories = req.session.guildCategories;
		res.locals.guildRoles = req.session.guildRoles;
		res.locals.guildEmojis = req.session.guildEmojis;

		return next();
	} catch (error) { return next(error) }
});

router.get('/', async (req, res, next) => {
	try {
		return res.render('dashboard', {
			missingPermissions: await getMissingPermissions(req.params.guildID, req.session.guildRoles, process.env.DISCORD_CLIENT_ID),
			settings: await getGuildSettings(`${req.params.guildID}`)
		});
	} catch (error) { return next(error) }
});

router.get('/settings', (req, res, next) => {
	return res.render('settings/settings');
});

router.get('/serverMessages', async (req, res, next) => {
	try {
		return res.render('settings/serverMessages', {
			settings: await getGuildSettings(`${req.params.guildID}.serverMessages`)
		});
	} catch (error) { return next(error) }
});

router.get('/streamerShoutout', async (req, res, next) => {
	try {
		return res.render('settings/streamerShoutout', {
			settings: await getGuildSettings(`${req.params.guildID}.streamerShoutout`)
		});
	} catch (error) { return next(error) }
});

router.get('/twitch', async (req, res, next) => {
	try {
		const settings = await getGuildSettings(`${req.params.guildID}.twitch`);
		settings.channels = await Promise.all(settings.channels.map(async (channel) => ({ settings: channel, resources: await getTwitchChannelData(channel.username) })));

		return res.render('settings/twitch', {
			settings: settings
		});
	} catch (error) { return next(error) }
});

router.get('/youtube', async (req, res, next) => {
	try {
		const settings = await getGuildSettings(`${req.params.guildID}.youtube`);
		settings.channels = await Promise.all(settings.channels.map(async (channel) => ({ settings: channel, resources: await getYouTubeChannelData(channel.username) })));

		return res.render('settings/youtube', {
			settings: settings
		});
	} catch (error) { return next(error) }
});

router.get('/reactionRole', async (req, res, next) => {
	try {
		const settings = await getGuildSettings(`${req.params.guildID}.reactionRole`);

		for (const channel in settings.channels) {
			for (const message in settings.channels[channel]) settings.channels[channel][message].messageContent = (await getMessageData(channel, message))?.content;
		}

		return res.render('settings/reactionRole', {
			settings: settings
		});
	} catch (error) { return next(error) }
});
