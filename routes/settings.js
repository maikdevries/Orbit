const Express = require('express');

const router = Express.Router({ mergeParams: true });

module.exports = router;

router.use((req, res, next) => {
	res.locals.guildID = req.params.guildID;
	next();
});

router.get('/', (req, res, next) => {
	res.render('dashboard');
});

router.get('/settings', (req, res, next) => {
	res.render('settings/settings');
});

router.get('/welcomeMessage', (req, res, next) => {
	res.render('settings/welcomeMessage');
});

router.get('/currentlyStreaming', (req, res, next) => {
	res.render('settings/currentlyStreaming');
});

router.get('/twitch', (req, res, next) => {
	res.render('settings/twitch');
});

router.get('/youtube', (req, res, next) => {
	res.render('settings/youtube');
});

router.get('/reactionRole', (req, res, next) => {
	res.render('settings/reactionRole');
});
