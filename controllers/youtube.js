const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
	getYouTubeChannelData
}

async function getYouTubeChannelData (username) {
	return (await getFetch(`channels?part=snippet&id=${username}`)).items?.[0]?.snippet ?? { };
}

async function getFetch (url) {
	try {
		const response = await fetch(`https://www.googleapis.com/youtube/v3/${url}&key=${process.env.YOUTUBE_KEY}`);
		return await response.json();
	} catch (error) { console.error(error) }
}