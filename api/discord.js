const Express = require(`express`);
const router = Express.Router();

const fetch = require(`node-fetch`);

module.exports = router;

router.post(`/getUser`, async (req, res) => {
	try {
		const response = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `${req.body.tokenType} ${req.body.accessToken}`, 'Content-Type': 'application/json' } });
		return res.json(await response.json());
	} catch (error) { console.error(error) }
});

router.post(`/getGuilds`, async (req, res) => {
	try {
		const response = await fetch(`https://discord.com/api/users/@me/guilds`, { headers: { Authorization: `${req.body.tokenType} ${req.body.accessToken}`, 'Content-Type': 'application/json' } });
		return res.json((await response.json()).filter((guild) => guild.owner || (guild.permissions & 0x20) === 0x20 || (guild.permissions & 0x8) === 0x8));
	} catch (error) { console.error(error) }
});

router.all(`/*`, (req, res) => {
	return res.redirect(`https://maikdevries.com/orbit`);
});
