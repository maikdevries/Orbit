function isAuthenticated () {
	return (localStorage.getItem('accessToken') !== null && localStorage.getItem('tokenType') !== null);
}

function logout () {
	localStorage.clear();
	window.location.reload();
}

function generateState () {
	const rand = Math.floor(Math.random() * 10);
	let randStr = ``;

	for (let i = 0; i < 20 + rand; i++) randStr += String.fromCharCode(33 + Math.floor(Math.random() * 94));

	localStorage.setItem(`stateParameter`, randStr);
	document.getElementById(`authDiscord`).href += `&state=${btoa(randStr)}`;
}
