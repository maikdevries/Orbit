const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
	getTwitchChannelData
}

let oAuth = {
	token: '',
	expires: 0
}

async function getTwitchChannelData (username) {
	const channel = (await getFetch(`users?login=${username}`)).data?.[0] ?? { };
	return { ...channel, profile_image_url: channel?.profile_image_url?.replace(/profile_image-([0-9]+)x([0-9]+).png/, 'profile_image-50x50.png') };
}

async function getFetch (url) {
	if (!hasTwitchToken()) {
		try { await validateTwitchToken() }
		catch { await getTwitchToken() }
	}

	try {
		const response = await fetch(`https://api.twitch.tv/helix/${url}`, { headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID, 'Authorization': `Bearer ${oAuth.token}` } });
		return response.ok ? await response.json() : (() => { throw new Error(`Fetching Twitch API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { throw error.toString() }
}

function hasTwitchToken () {
	return (oAuth.token && oAuth.expires > Date.now());
}

async function getTwitchToken () {
	try {
		const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, { method: 'POST' });
		return response.ok ? oAuth = { token: (await response.json()).access_token, expires: Date.now() + 3420000 } : (() => { throw new Error(`Fetching Twitch Auth API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { throw error.toString() }
}

async function validateTwitchToken () {
	try {
		const response = await fetch(`https://id.twitch.tv/oauth2/validate`, { headers: { 'Authorization': `OAuth ${oAuth.token}` } });
		return response.ok ? oAuth = { ...oAuth, expires: Date.now() + (3420000 > (await response.json()).expires_in * 1000 ? (await response.json()).expires_in * 1000 : 3420000) } : (() => { throw new Error(`Fetching Twitch Auth API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { throw error.toString() }
}
