const Express = require(`express`);
const router = Express.Router();

module.exports = router;


router.use(`/discord`, require(`./discord.js`));

router.all(`/*`, (req, res) => {
	return res.redirect(`https://maikdevries.com/orbit`);
});
