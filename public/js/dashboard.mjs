import { getEmojiPicker, createDiscordRoleElement, createReactionRoleReactionElement, createAddDiscordRoleElement, createMessageElement } from './helperFunctions.mjs';

(() => {
	window.localStorage.setItem('sidebarCollapsed', window.localStorage.getItem('sidebarCollapsed') ?? 'false');
	if (window.localStorage.getItem('sidebarCollapsed') === 'true') document.getElementById('featureSidebar').classList.add('collapsed');

	const currentPage = document.location.pathname.substring(document.location.pathname.lastIndexOf('/') + 1);
	if (document.getElementById(currentPage)) document.getElementById(currentPage).classList.add('currentPage');
})();

window.toggleSidebarCollapsed = () => {
	document.getElementById('featureSidebar').classList.toggle('collapsed');
	window.localStorage.setItem('sidebarCollapsed', window.localStorage.getItem('sidebarCollapsed') === 'false' ? 'true' : 'false');
}

window.expandSettings = (event) => {
	if (event.target.closest('.settingEnabled')) return;

	event.currentTarget.classList.add('expanded');
}

window.deleteMessage = (event) => {
	event.stopPropagation();

	event.currentTarget.closest('.message').remove();
}

window.addMessage = (event) => {
	event.stopPropagation();

	if (event.target.closest('.addMessage')) return;

	event.currentTarget.classList.toggle('expanded');

	document.onclick = closeAddMessageContainer;
}

const closeAddMessageContainer = (event) => {
	event.stopPropagation();

	if (event.target.closest('.addMessage')) return;

	for (const element of document.getElementsByClassName('addMessageContainer')) element.classList.remove('expanded');

	document.onclick = null;
}

window.cancelWelcomeMessageAddMessage = (event) => {
	event.stopPropagation();

	event.currentTarget.closest('.addMessage').reset();
	event.currentTarget.closest('.addMessageContainer').classList.remove('expanded');

	document.onclick = null;
}

window.saveWelcomeMessageAddMessage = (event) => {
	event.stopPropagation();

	const addMessageReference = event.currentTarget.closest('.addMessage');
	event.currentTarget.closest('.messageListContainer').insertBefore(createMessageElement(addMessageReference.querySelector('.addMessageInput').value), event.currentTarget.closest('.messageListContainerFooter'));

	addMessageReference.reset();
	event.currentTarget.closest('.addMessageContainer').classList.remove('expanded');

	document.onclick = null;
}

window.cancelWelcomeMessageChanges = (event) => {
	event.stopPropagation();

	const welcomeMessageFeatureElement = event.currentTarget.closest('.welcomeMessageFeature');

	// TODO: Reset any changes to channel and list of messages.

	event.currentTarget.closest('.messageListContainerFooter').querySelector('.addMessage').reset();

	welcomeMessageFeatureElement.classList.remove('expanded');
}

window.saveWelcomeMessageChanges = (event) => {
	event.stopPropagation();

	const welcomeMessageFeatureElement = event.currentTarget.closest('.welcomeMessageFeature');

	// TODO: Create data object and save to back-end. If something goes wrong, don't continue.

	event.currentTarget.closest('.messageListContainerFooter').querySelector('.addMessage').reset();

	welcomeMessageFeatureElement.classList.remove('expanded');
}

window.deleteSubscribedChannel = (event) => {
	event.stopPropagation();

	// TODO: Make back-end call to delete subscribed channel from database. If something went wrong, don't continue.

	event.currentTarget.closest('.subscribedChannel').remove();
}

window.cancelSubscribedChannelChanges = (event) => {
	event.stopPropagation();

	event.currentTarget.closest('form').reset();

	const subscribedChannelElement = event.currentTarget.closest('.subscribedChannel');
	event.currentTarget.closest('.subscribedChannelSettingsSideContainer').querySelector('.discordChannelName').textContent = subscribedChannelElement.querySelector('.headerDiscordChannelName').textContent;
	subscribedChannelElement.classList.remove('expanded');
}

window.saveSubscribedChannelChanges = (event) => {
	event.stopPropagation();

	const channelSettingsElement = event.currentTarget.closest('.subscribedChannelSettings');
	const data = {
		message: channelSettingsElement.querySelector('.subscribedChannelSettingsMessage').value,
		channel: channelSettingsElement.querySelector('.discordChannelName').textContent
	}

	// TODO: Make back-end call to save form changes to database. If something went wrong, don't continue.

	const subscribedChannelElement = event.currentTarget.closest('.subscribedChannel');
	subscribedChannelElement.querySelector('.headerDiscordChannelName').textContent = data.channel;
	subscribedChannelElement.classList.remove('expanded');
}

window.deleteReactionRole = (event) => {
	event.stopPropagation();

	// TODO: Make back-end call to delete reaction role from database. If something wrong, don't continue.

	event.currentTarget.closest('.reactionRole').remove();
}

window.deleteReactionRoleReaction = (event) => {
	event.stopPropagation();

	event.currentTarget.closest('.reactionRoleReaction').remove();
}

window.addReactionRoleReaction = async (event) => {
	event.stopPropagation();

	const addReactionButtonReference = event.currentTarget;
	const emojiPicker = await getEmojiPicker();

	emojiPicker.on('hidden', () => emojiPicker.off('emoji'));
	emojiPicker.on('emoji', async (emoji) => addReactionButtonReference.closest('.reactionRoleSettingsContainer').insertBefore(await createReactionRoleReactionElement(emoji), addReactionButtonReference.closest('.reactionRoleSettingsContainerFooter')));

	emojiPicker.togglePicker(addReactionButtonReference);
}

window.deleteDiscordRole = async (event) => {
	event.stopPropagation();

	const discordRoleContainerReference = event.currentTarget.closest('.discordRoles');

	event.currentTarget.closest('.discordRole').remove();

	if ('singleRole' in discordRoleContainerReference.dataset) discordRoleContainerReference.append(await createAddDiscordRoleElement());
}

window.addDiscordRole = (event) => {
	event.stopPropagation();

	const discordRoleContainerReference = event.currentTarget.closest('.discordRoles');
	const addDiscordRoleButtonReference = event.currentTarget.closest('.addDiscordRole');
	discordRoleContainerReference.insertBefore(createDiscordRoleElement(event.currentTarget), addDiscordRoleButtonReference);

	if ('singleRole' in discordRoleContainerReference.dataset) addDiscordRoleButtonReference.remove();
	else addDiscordRoleButtonReference.classList.remove('expanded');

	document.onclick = null;
}

window.cancelReactionRoleChanges = (event) => {
	event.stopPropagation();

	const reactionRoleElement = event.currentTarget.closest('.reactionRole');

	// TODO: Reset any changes to new reactions/roles

	reactionRoleElement.classList.remove('expanded');
}

window.saveReactionRoleChanges = (event) => {
	event.stopPropagation();

	const reactionRoleElement = event.currentTarget.closest('.reactionRole');

	// TODO: Create object of all reactions/roles, send them to back-end and update HTML

	reactionRoleElement.classList.remove('expanded');
}

window.expandDiscordRoleList = (event) => {
	event.stopPropagation();

	if (event.target.closest('.discordRoleList')) return;

	event.currentTarget.classList.toggle('expanded');

	document.onclick = closeDiscordRoleList;
}

const closeDiscordRoleList = (event) => {
	event.stopPropagation();

	if (event.target.closest('.discordRoleList')) return;

	for (const element of document.getElementsByClassName('addDiscordRole')) element.classList.remove('expanded');

	document.onclick = null;
}

window.expandDiscordChannelList = (event) => {
	event.stopPropagation();

	if (event.target.closest('.discordChannelList')) return;

	event.currentTarget.classList.toggle('expanded');

	document.onclick = closeDiscordChannelList;
}

const closeDiscordChannelList = (event) => {
	event.stopPropagation();

	if (event.target.closest('.discordChannelList')) return;

	for (const element of document.getElementsByClassName('discordChannelListContainer')) element.classList.remove('expanded');

	document.onclick = null;
}

window.changeSelectedDiscordChannel = (event) => {
	event.stopPropagation();

	const discordChannelList = event.currentTarget.closest('.discordChannelListContainer');
	discordChannelList.querySelector('.discordChannelName').textContent = event.currentTarget.querySelector('p').textContent;
	discordChannelList.classList.remove('expanded');

	document.onclick = null;
}
