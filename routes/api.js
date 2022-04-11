const Express = require('express');
const { createGuildSetting, updateGuildSetting, deleteGuildSetting } = require('../controllers/data.js');
const { getMessageData } = require('../controllers/discord.js');
const { getYouTubeChannelData, getYouTubeChannelIDByUsername, getYouTubeChannelIDByCustomURL } = require('../controllers/youtube.js');
const { getTwitchChannelData } = require('../controllers/twitch.js');

const router = Express.Router();

module.exports = router;

router.get('/guilds/:guildID', (req, res, next) => {
	return res.json(req.session.guildData);
});

router.get('/guilds/:guildID/roles', (req, res, next) => {
	return res.json(req.session.guildRoles);
});

router.get('/guilds/:guildID/emojis', (req, res, next) => {
	return res.json(req.session.guildEmojis);
});

router.get('/guilds/:guildID/channels', (req, res, next) => {
	return res.json(req.session.guildChannels);
});

router.get('/guilds/:guildID/categories', (req, res, next) => {
	return res.json(req.session.guildCategories);
});

router.get('/channels/:channelID', async (req, res, next) => {
	try {
		const channel = req.session.guildChannels.find((guildChannel) => guildChannel.id === req.params.channelID);
		return channel ? res.json(channel) : res.status(404).json('This Discord channel is not part of the current guild.');
	} catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.get('/channels/:channelID/messages/:messageID', async (req, res, next) => {
	try {
		if (!req.session.guildChannels.find((guildChannel) => guildChannel.id === req.params.channelID)) return res.status(404).json('This Discord channel is not part of the current guild.');
		return res.json(await getMessageData(req.params.channelID, req.params.messageID, process.env.TOKEN_TYPE, process.env.TOKEN));
	} catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.get('/twitch/:channelURL', async (req, res, next) => {
	const username = req.params.channelURL.match(/^(?:https:\/\/)?(?:www\.)?twitch\.tv\/(?<username>[a-zA-Z0-9]\w{0,24})$/)?.groups?.username;
	if (!username) return res.status(400).json('This is not a valid Twitch channel URL.');

	try { return res.json(await getTwitchChannelData(username)) }
	catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.get('/youtube/:channelURL', async (req, res, next) => {
	let { channelID, username, customURL } = req.params.channelURL.match(/^(?:https:\/\/)?(?:www\.)?youtube\.com\/(?:channel\/(?<channelID>UC[\w-]{21}[AQgw])|(?:user\/(?<username>[\w-]+))|(?:c\/)?(?<customURL>[\w-]+))$/)?.groups ?? { undefined, undefined, undefined };
	if (!channelID && !username && !customURL) return res.status(400).json('This is not a valid YouTube channel URL.');

	try {
		let channelSnippet = null;

		if (username) channelID = await getYouTubeChannelIDByUsername(username);
		else if (customURL) ({ channelID, ...channelSnippet } = await getYouTubeChannelIDByCustomURL(customURL));

		if (!channelID) return res.status(404).json('The YouTube channel with that URL could not be found.');

		return channelSnippet ? res.json({ channelID, ...channelSnippet }) : res.json({ channelID, ...await getYouTubeChannelData(channelID) });
	} catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.post('/:guildID/:featurePath', async (req, res, next) => {
	try { return res.json(await createGuildSetting(`${req.params.guildID}.${req.params.featurePath}`, req.body)) }
	catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.patch('/:guildID/:featurePath', async (req, res, next) => {
	try { return res.json(await updateGuildSetting(`${req.params.guildID}.${req.params.featurePath}`, req.body, req.query.channelUsername)) }
	catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});

router.delete('/:guildID/:featurePath', async (req, res, next) => {
	try { return res.json(await deleteGuildSetting(`${req.params.guildID}.${req.params.featurePath}`, req.query.channelUsername)) }
	catch (error) { console.error(error); return res.status(500).json('Something went terribly wrong on our side of the internet.') }
});
