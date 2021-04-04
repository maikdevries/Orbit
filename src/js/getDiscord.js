async function getGuilds () {
	await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `${localStorage.getItem('tokenType')} ${localStorage.getItem('accessToken')}` } }).then(async (res) => {
		const { username } = await res.json();
		document.getElementById('welcome').innerText = `Welcome to Orbit, ${username}!`
	}).catch((error) => console.error(error));
}
