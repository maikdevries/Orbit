(() => {
	window.localStorage.setItem('sidebarCollapsed', window.localStorage.getItem('sidebarCollapsed') ?? 'false');
	if (window.localStorage.getItem('sidebarCollapsed') === 'true') document.getElementById('featureSidebar').classList.add('collapsedSidebar');

	const categoryLinkPath = document.location.pathname.substring(document.location.pathname.lastIndexOf('/') + 1);
	if (document.getElementById(categoryLinkPath)) document.getElementById(categoryLinkPath).classList.add('currentPage');
})();

function toggleCollapseSidebar () {
	document.getElementById('featureSidebar').classList.toggle('collapsedSidebar');
	window.localStorage.setItem('sidebarCollapsed', window.localStorage.getItem('sidebarCollapsed') === 'false' ? 'true' : 'false');
}

function revertChanges () {

}

function saveChanges () {

}

function deleteSubscribedChannel () {
	event.stopPropagation();

	// TODO: Make back-end call to delete subscribed channel from database. If something went wrong, don't continue.

	event.currentTarget.closest('.subscribedChannel').remove();
}

function cancelSubscribedChannelFormChanges () {
	event.stopPropagation();

	event.currentTarget.closest('form').reset();

	const subscribedChannelElement = event.currentTarget.closest('.subscribedChannel');
	event.currentTarget.closest('.channelSettingsSideContainer').querySelector('.discordChannelName').textContent = subscribedChannelElement.querySelector('.headerDiscordChannelName').textContent;
	subscribedChannelElement.classList.remove('expanded');
}

function saveSubscribedChannelFormChanges () {
	event.stopPropagation();

	const channelSettingsElement = event.currentTarget.closest('.channelSettings');
	const data = {
		message: channelSettingsElement.querySelector('.channelSettingsMessage').value,
		channel: channelSettingsElement.querySelector('.discordChannelName').textContent
	}

	// TODO: Make back-end call to save form changes to database. If something went wrong, don't continue.

	const subscribedChannelElement = event.currentTarget.closest('.subscribedChannel');
	subscribedChannelElement.querySelector('.headerDiscordChannelName').textContent = data.channel;
	subscribedChannelElement.classList.remove('expanded');
}

function expandSubscribedChannelSettings () {
	event.currentTarget.classList.add('expanded');
}

const closeSelectDiscordChannelList = ((event) => {
	event.stopPropagation();

	if (event.target.closest('.selectDiscordChannelList')) return;

	for (const element of document.getElementsByClassName('selectDiscordChannel')) element.classList.remove('expanded');

	document.onclick = null;
});

function expandSelectDiscordChannel () {
	event.stopPropagation();

	if (event.target.closest('.selectDiscordChannelList')) return;

	event.currentTarget.classList.toggle('expanded');

	document.onclick ? document.onclick = null : document.onclick = closeSelectDiscordChannelList;
}

function changeDiscordChannel () {
	event.stopPropagation();

	const selectDiscordChannelElement = event.currentTarget.closest('.selectDiscordChannel');
	selectDiscordChannelElement.querySelector('.discordChannelName').textContent = event.currentTarget.querySelector('p').textContent;
	selectDiscordChannelElement.classList.remove('expanded');

	document.onclick = null;
}
