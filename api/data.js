const Express = require(`express`);
const router = Express.Router();

const Josh = require(`@joshdb/core`);
const provider = require(`@joshdb/mongo`);

const db = new Josh({
	name: `settings`,
	provider,
	providerOptions: {
		collection: `settings`,
		dbName: `Lunar`,
		url: `mongodb+srv://${process.env.DATABASE_URL}?retryWrites=true&w=majority`
	},
	ensureProps: true
});

module.exports = router;

router.post(`/getGuild`, async (req, res) => {
	return res.json(await db.get(req.body.guildID));
});

router.all(`/*`, (req, res) => {
	return res.redirect(`https://maikdevries.com/orbit`);
});
