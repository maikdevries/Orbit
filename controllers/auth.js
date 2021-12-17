const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
	getAuthentication
}

async function getAuthentication (authCode) {
	const data = {
		'client_id': process.env.DISCORD_ID,
		'client_secret': process.env.DISCORD_SECRET,
		'grant_type': 'authorization_code',
		'code': authCode,
		'redirect_uri': `${process.env.BASE_URL}/auth/login`
	}

	const response = await authFetch('oauth2/token', data);
	return { token: response.access_token, tokenType: response.token_type };
}

async function authFetch (url, data) {
	try {
		const response = await fetch(`https://discord.com/api/${url}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data) });
		return await response.json();
	} catch (error) { console.error(error) }
}
