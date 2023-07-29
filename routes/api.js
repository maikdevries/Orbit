const Express = require('express');
const { createGuildSetting, updateGuildSetting, deleteGuildSetting } = require('../controllers/data.js');
const { getGuildData, getMessageData } = require('../controllers/discord.js');
const { getYouTubeChannelData, getYouTubeChannelIDByHandle } = require('../controllers/youtube.js');
const { getTwitchChannelData } = require('../controllers/twitch.js');

const router = Express.Router();

module.exports = router;

const allowedPaths = [
	'serverMessages.welcoming',
	'serverMessages.farewell',
	'reactionRole',
	'streamerShoutout',
	'twitch',
	'youtube'
]

router.use((req, res, next) => {
	if (!req.session.tokenType || !req.session.token) return res.status(401).json('This request lacks proper authentication.');
	else return next();
});

router.use('/guilds/:guildID([0-9]{17,19})', (req, res, next) => {
	if (req.session.currentGuild !== req.params.guildID) return res.status(403).json('This data is not allowed to be accessed at this time.');
	else return next();
});

router.get('/guilds/:guildID([0-9]{17,19})', (req, res, next) => {
	return res.json(req.session.guildData);
});

router.get('/guilds/:guildID([0-9]{17,19})/refresh', async (req, res, next) => {
	try {
		Object.assign(req.session, await getGuildData(req.params.guildID));
		return res.status(200).json('Successfully refreshed cached Discord data with the latest updates.');
	} catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.get('/guilds/:guildID([0-9]{17,19})/roles', (req, res, next) => {
	return res.json(req.session.guildRoles);
});

router.get('/guilds/:guildID([0-9]{17,19})/emojis', (req, res, next) => {
	return res.json(req.session.guildEmojis);
});

router.get('/guilds/:guildID([0-9]{17,19})/channels', (req, res, next) => {
	return res.json(req.session.guildChannels);
});

router.get('/guilds/:guildID([0-9]{17,19})/categories', (req, res, next) => {
	return res.json(req.session.guildCategories);
});

router.get('/channels/:channelID([0-9]{17,19})', async (req, res, next) => {
	try {
		const channel = req.session.guildChannels.find((guildChannel) => guildChannel.id === req.params.channelID);
		return channel ? res.json(channel) : res.status(404).json('This Discord channel is not part of the current guild.');
	} catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.get('/channels/:channelID([0-9]{17,19})/messages/:messageID([0-9]{17,19})', async (req, res, next) => {
	try {
		if (!req.session.guildChannels.find((guildChannel) => guildChannel.id === req.params.channelID)) return res.status(404).json('This Discord channel is not part of the current guild.');
		return res.json(await getMessageData(req.params.channelID, req.params.messageID));
	} catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.get('/twitch/:channelURL', async (req, res, next) => {
	const username = req.params.channelURL.match(/^(?:https:\/\/)?(?:www\.)?twitch\.tv\/(?<username>[a-zA-Z0-9]\w{0,24})$/)?.groups?.username;
	if (!username) return res.status(400).json('This is not a valid Twitch channel URL.');

	try { return res.json(await getTwitchChannelData(username)) }
	catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.get('/youtube/:channelURL', async (req, res, next) => {
	let { channelID, handle } = req.params.channelURL.match(/^(?:https:\/\/)?(?:www\.)?youtube\.com\/(?:channel\/(?<channelID>UC[\w-]{21}[AQgw])|(?<handle>@[\w-]+))$/)?.groups ?? { undefined, undefined };
	if (!channelID && !handle) return res.status(400).json('This is not a valid YouTube channel URL.');

	try {
		let channelSnippet = null;

		if (handle) ({ channelID, ...channelSnippet } = await getYouTubeChannelIDByHandle(handle));

		if (!channelID) return res.status(404).json('The YouTube channel with that URL could not be found.');

		return channelSnippet ? res.json({ channelID, ...channelSnippet }) : res.json({ channelID, ...await getYouTubeChannelData(channelID) });
	} catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.use('/:guildID([0-9]{17,19})/:featurePath([a-zA-Z0-9.]+)', (req, res, next) => {
	if (req.session.currentGuild !== req.params.guildID || !allowedPaths.some((path) => req.params.featurePath.startsWith(path))) return res.status(403).json('This operation is not to be performed at this time.');
	else return next();
});

router.post('/:guildID([0-9]{17,19})/:featurePath([a-zA-Z0-9.]+)', async (req, res, next) => {
	try { return res.json(await createGuildSetting(`${req.params.guildID}.${req.params.featurePath}`, req.body)) }
	catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.patch('/:guildID([0-9]{17,19})/:featurePath([a-zA-Z0-9.]+)', async (req, res, next) => {
	try { return res.json(await updateGuildSetting(`${req.params.guildID}.${req.params.featurePath}`, req.body, req.query.channelUsername)) }
	catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.delete('/:guildID([0-9]{17,19})/:featurePath([a-zA-Z0-9.]+)', async (req, res, next) => {
	try { return res.json(await deleteGuildSetting(`${req.params.guildID}.${req.params.featurePath}`, req.query.channelUsername)) }
	catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});
