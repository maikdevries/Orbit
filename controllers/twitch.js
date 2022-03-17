const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
	getTwitchChannelData
}

let twitchToken;

async function getTwitchChannelData (username) {
	return (await getFetch(`users?login=${username}`)).data?.[0] ?? { };
}

async function getFetch (url) {
	if (!hasTwitchToken()) await getTwitchToken();

	try { await validateTwitchToken() }
	catch { await getTwitchToken() }

	try {
		const response = await fetch(`https://api.twitch.tv/helix/${url}`, { headers: { 'Client-ID': process.env.TWITCH_ID, 'Authorization': `Bearer ${twitchToken}` } });
		return await response.json();
	} catch (error) { console.error(error) }
}

function hasTwitchToken () {
	return (typeof twitchToken !== 'undefined' && twitchToken !== null);
}

async function getTwitchToken () {
	try {
		const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`, { method: 'POST' });
		return twitchToken = (await response.json()).access_token;
	} catch (error) { console.error(error) }
}

async function validateTwitchToken () {
	try {
		const response = await fetch(`https://id.twitch.tv/oauth2/validate`, { headers: { 'Authorization': `OAuth ${twitchToken}` } });
		return await response.json();
	} catch (error) { console.error(error) }
}
