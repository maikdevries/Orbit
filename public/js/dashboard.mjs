import {
	getEmojiPicker, createMutationObserver, setOriginalState, getOriginalState,
	createDiscordRoleElement, createReactionRoleReactionElement, createAddDiscordRoleElement, createMessageElement,
	postAPIGuild, deleteAPIGuild
} from './helperFunctions.mjs';

const currentPage = document.location.pathname.substring(document.location.pathname.lastIndexOf('/') + 1);

(() => {
	window.localStorage.setItem('sidebarCollapsed', window.localStorage.getItem('sidebarCollapsed') ?? 'false');
	if (window.localStorage.getItem('sidebarCollapsed') === 'true') document.getElementById('featureSidebar').classList.add('collapsed');

	if (document.getElementById(currentPage)) document.getElementById(currentPage).classList.add('currentPage');
	if (document.getElementById('saveChanges')) createMutationObserver(document.getElementById('featureSettings'));
})();

window.toggleSidebarCollapsed = () => {
	document.getElementById('featureSidebar').classList.toggle('collapsed');
	window.localStorage.setItem('sidebarCollapsed', window.localStorage.getItem('sidebarCollapsed') === 'false' ? 'true' : 'false');
}

window.expandSettings = (event, target) => {
	event.stopPropagation();

	const featureContainer = event.currentTarget;

	if (featureContainer.classList.contains('expanded')) return;

	setOriginalState(featureContainer.dataset.id, featureContainer.querySelector(target));
	featureContainer.classList.add('expanded');
}

window.saveSettingEnabled = async (event, subFeature = null) => {
	event.stopPropagation();

	const settingEnabledSwitch = event.currentTarget;
	const settingEnabled = settingEnabledSwitch.closest('.settingEnabled');

	settingEnabled.classList.remove('error');
	document.getElementById('featureSettingsContainer').classList.remove('error');

	settingEnabledSwitch.disabled = true;
	settingEnabled.classList.add('syncing');

	const data = {
		enabled: settingEnabledSwitch.checked
	}

	try { await postAPIGuild((subFeature ? `${currentPage}.${subFeature}` : currentPage), data) }
	catch {
		settingEnabled.classList.add('error');
		document.getElementById('featureSettingsContainer').classList.add('error');

		settingEnabledSwitch.checked = !settingEnabledSwitch.checked;
	}

	settingEnabled.classList.remove('syncing');
	settingEnabledSwitch.disabled = false;
}

window.cancelGeneralSettingsChanges = (event) => {
	event.stopPropagation();
}

window.saveGeneralSettingsChanges = async (event) => {
	event.stopPropagation();
}

window.cancelWelcomeMessageChanges = (event) => {
	event.stopPropagation();

	const welcomeMessageSettings = event.currentTarget.closest('.welcomeMessageSettings');
	const welcomeMessageFeature = welcomeMessageSettings.closest('.welcomeMessageFeature');

	welcomeMessageSettings.replaceWith(getOriginalState(welcomeMessageFeature.dataset.id));

	document.getElementById('featureSettingsContainer').classList.remove('error');
	welcomeMessageFeature.classList.remove('expanded');
}

window.saveWelcomeMessageChanges = async (event) => {
	event.stopPropagation();

	const saveChangesButton = event.currentTarget;
	const formButtonsContainer = saveChangesButton.closest('.formButtonsContainer');
	const welcomeMessageFeatureElement = saveChangesButton.closest('.welcomeMessageFeature');

	formButtonsContainer.classList.remove('error');
	document.getElementById('featureSettingsContainer').classList.remove('error');

	saveChangesButton.disabled = true;
	formButtonsContainer.classList.add('syncing');

	const data = {
		channel: welcomeMessageFeatureElement.querySelector('.discordChannelName').dataset.discordChannel,
		messages: [...welcomeMessageFeatureElement.querySelectorAll('.messageContent')].map((message) => message.textContent)
	}

	try {
		await postAPIGuild(`${currentPage}.${welcomeMessageFeatureElement.dataset.id}`, data);

		welcomeMessageFeatureElement.querySelector('.addMessage').reset();
		welcomeMessageFeatureElement.classList.remove('expanded');
	} catch {
		formButtonsContainer.classList.add('error');
		document.getElementById('featureSettingsContainer').classList.add('error');
	}

	formButtonsContainer.classList.remove('syncing');
	saveChangesButton.disabled = false;
}

window.cancelStreamerShoutoutChanges = (event) => {
	event.stopPropagation();

	document.getElementById('featureSettings').replaceWith(getOriginalState('mutation'));
	createMutationObserver(document.getElementById('featureSettings'));

	document.getElementById('featureSettingsContainer').classList.remove('error');
	event.currentTarget.closest('#saveChangesContainer').classList.remove('error', 'visible');
}

window.saveStreamerShoutoutChanges = async (event) => {
	event.stopPropagation();

	const saveButton = event.currentTarget;
	const saveChangesContainer = saveButton.closest('#saveChangesContainer');

	saveChangesContainer.classList.remove('error');
	document.getElementById('featureSettingsContainer').classList.remove('error');

	saveButton.disabled = true;
	saveChangesContainer.classList.add('syncing');

	const data = {
		requiredRole: [...document.getElementById('requiredRole').querySelectorAll('.discordRole')].map((role) => role.dataset.discordRole),
		shoutoutRole: document.getElementById('shoutoutRole').querySelector('.discordRole')?.dataset.discordRole ?? ''
	}

	try {
		await postAPIGuild(currentPage, data);
		createMutationObserver(document.getElementById('featureSettings'));

		saveChangesContainer.classList.remove('visible');
	} catch {
		saveChangesContainer.classList.add('error');
		document.getElementById('featureSettingsContainer').classList.add('error');
	}

	saveChangesContainer.classList.remove('syncing');
	saveButton.disabled = false;
}

window.deleteSubscribedChannel = async (event) => {
	event.stopPropagation();

	const deleteButton = event.currentTarget;
	const subscribedChannel = deleteButton.closest('.subscribedChannel');

	subscribedChannel.classList.remove('error');
	document.getElementById('featureSettingsContainer').classList.remove('error');

	deleteButton.disabled = true;
	subscribedChannel.classList.add('syncing');

	try {
		await deleteAPIGuild(`${currentPage}.channels?channelUsername=${subscribedChannel.dataset.id}`);
		subscribedChannel.remove();
	} catch {
		subscribedChannel.classList.add('error');
		document.getElementById('featureSettingsContainer').classList.add('error');

		subscribedChannel.classList.remove('syncing');
		deleteButton.disabled = false;
	}
}

window.cancelSubscribedChannelChanges = (event) => {
	event.stopPropagation();

	const subscribedChannelSettings = event.currentTarget.closest('.subscribedChannelSettings');
	const subscribedChannel = subscribedChannelSettings.closest('.subscribedChannel');

	subscribedChannelSettings.replaceWith(getOriginalState(subscribedChannel.dataset.id));

	document.getElementById('featureSettingsContainer').classList.remove('error');
	subscribedChannel.classList.remove('expanded');
}

window.saveSubscribedChannelChanges = async (event) => {
	event.stopPropagation();

	const saveButton = event.currentTarget;
	const subscribedChannel = saveButton.closest('.subscribedChannel');
	const selectedDiscordChannel = subscribedChannel.querySelector('.discordChannelName');

	subscribedChannel.classList.remove('error');
	document.getElementById('featureSettingsContainer').classList.remove('error');

	saveButton.disabled = true;
	subscribedChannel.classList.add('syncing');

	const data = {
		username: subscribedChannel.dataset.id,
		channel: selectedDiscordChannel.dataset.discordChannel,
		message: subscribedChannel.querySelector('.subscribedChannelMessage').value
	}

	try {
		await postAPIGuild(`${currentPage}.channels?channelUsername=${subscribedChannel.dataset.id}`, data);

		subscribedChannel.querySelector('.headerDiscordChannelName').textContent = selectedDiscordChannel.textContent;
		subscribedChannel.classList.remove('expanded');
	} catch {
		subscribedChannel.classList.add('error');
		document.getElementById('featureSettingsContainer').classList.add('error');
	}

	subscribedChannel.classList.remove('syncing');
	saveButton.disabled = false;
}

window.deleteReactionRole = async (event) => {
	event.stopPropagation();

	const deleteButton = event.currentTarget;
	const reactionRoleHeader = deleteButton.closest('.reactionRoleHeader');
	const reactionRole = deleteButton.closest('.reactionRole');

	reactionRoleHeader.classList.remove('error');
	document.getElementById('featureSettingsContainer').classList.remove('error');

	deleteButton.disabled = true;
	reactionRoleHeader.classList.add('syncing');

	try {
		await deleteAPIGuild(`${currentPage}.channels.${reactionRole.dataset.discordChannel}.${reactionRole.dataset.id}`);
		reactionRole.remove();
	} catch {
		reactionRoleHeader.classList.add('error');
		document.getElementById('featureSettingsContainer').classList.add('error');

		reactionRoleHeader.classList.remove('syncing');
		deleteButton.disabled = false;
	}
}

window.cancelReactionRoleChanges = (event) => {
	event.stopPropagation();

	const reactionRoleSettings = event.currentTarget.closest('.reactionRoleSettings');
	const reactionRole = reactionRoleSettings.closest('.reactionRole');

	reactionRoleSettings.replaceWith(getOriginalState(reactionRole.dataset.id));

	document.getElementById('featureSettingsContainer').classList.remove('error');
	reactionRole.classList.remove('expanded');
}

window.saveReactionRoleChanges = async (event) => {
	event.stopPropagation();

	const saveButton = event.currentTarget;
	const formButtonsContainer = saveButton.closest('.formButtonsContainer');
	const reactionRole = saveButton.closest('.reactionRole');

	formButtonsContainer.classList.remove('error');
	document.getElementById('featureSettingsContainer').classList.remove('error');

	saveButton.disabled = true;
	formButtonsContainer.classList.add('syncing');

	const data = { };
	[...reactionRole.querySelectorAll('.reactionRoleReaction')].forEach((reaction) => data[reactionRole.dataset.id] = { ...data[reactionRole.dataset.id], [reaction.querySelector('.reactionRoleEmoji').dataset.emoji]: [...reaction.querySelectorAll('.discordRole')].map((role) => role.dataset.discordRole) });

	try {
		await postAPIGuild(`${currentPage}.channels.${reactionRole.dataset.discordChannel}`, data);
		reactionRole.classList.remove('expanded');
	} catch {
		formButtonsContainer.classList.add('error');
		document.getElementById('featureSettingsContainer').classList.add('error');
	}

	formButtonsContainer.classList.remove('syncing');
	saveButton.disabled = false;
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

window.deleteReactionRoleReaction = (event) => {
	event.stopPropagation();

	event.currentTarget.closest('.reactionRoleReaction').remove();
}

window.addReactionRoleReaction = async (event) => {
	event.stopPropagation();

	const featureSettingsContainer = document.getElementById('featureSettingsContainer');
	featureSettingsContainer.classList.remove('error');

	try {
		const addReactionButton = event.currentTarget;
		const emojiPicker = await getEmojiPicker();

		emojiPicker.on('hidden', () => emojiPicker.off('emoji'));

		emojiPicker.on('emoji', async (emoji) => {
			try { addReactionButton.closest('.reactionRoleSettingsContainer').insertBefore(await createReactionRoleReactionElement(emoji), addReactionButton.closest('.reactionRoleSettingsContainerFooter')) }
			catch { featureSettingsContainer.classList.add('error') }
		});

		emojiPicker.togglePicker(addReactionButton);
	} catch { featureSettingsContainer.classList.add('error') }
}

window.deleteMessage = (event) => {
	event.stopPropagation();

	event.currentTarget.closest('.message').remove();
}

window.addMessage = (event) => {
	event.stopPropagation();

	if (event.target.closest('.addMessage')) return;

	event.currentTarget.classList.toggle('expanded');
	event.currentTarget.querySelector('.addMessageInput').focus();

	document.onclick = closeAddMessageContainer;
}

window.deleteDiscordRole = async (event) => {
	event.stopPropagation();

	const featureSettingsContainer = document.getElementById('featureSettingsContainer');
	featureSettingsContainer.classList.remove('error');

	try {
		const discordRole = event.currentTarget.closest('.discordRole');
		const discordRoleContainer = discordRole.closest('.discordRoles');

		if ('singleRole' in discordRoleContainer.dataset) discordRoleContainer.append(await createAddDiscordRoleElement());

		discordRole.remove();
	} catch { featureSettingsContainer.classList.add('error') }
}

window.addDiscordRole = (event) => {
	event.stopPropagation();

	const discordRoleContainer = event.currentTarget.closest('.discordRoles');
	const addDiscordRoleButton = event.currentTarget.closest('.addDiscordRole');
	discordRoleContainer.insertBefore(createDiscordRoleElement(event.currentTarget), addDiscordRoleButton);

	if ('singleRole' in discordRoleContainer.dataset) addDiscordRoleButton.remove();
	else addDiscordRoleButton.classList.remove('expanded');

	document.onclick = null;
}

window.changeSelectedDiscordChannel = (event) => {
	event.stopPropagation();

	const discordChannelList = event.currentTarget.closest('.discordChannelListContainer');
	const discordChannelName = discordChannelList.querySelector('.discordChannelName');

	discordChannelName.textContent = event.currentTarget.textContent;
	discordChannelName.dataset.discordChannel = event.currentTarget.dataset.discordChannel;

	discordChannelList.classList.remove('expanded');

	document.onclick = null;
}

const closeAddMessageContainer = (event) => {
	event.stopPropagation();

	if (event.target.closest('.addMessage')) return;

	for (const element of document.getElementsByClassName('addMessageContainer')) element.classList.remove('expanded');

	document.onclick = null;
}

const closeDiscordRoleList = (event) => {
	event.stopPropagation();

	if (event.target.closest('.discordRoleList')) return;

	for (const element of document.getElementsByClassName('addDiscordRole')) element.classList.remove('expanded');

	document.onclick = null;
}

window.expandDiscordRoleList = (event) => {
	event.stopPropagation();

	if (event.target.closest('.discordRoleList')) return;

	event.currentTarget.classList.toggle('expanded');

	document.onclick = closeDiscordRoleList;
}

const closeDiscordChannelList = (event) => {
	event.stopPropagation();

	if (event.target.closest('.discordChannelList')) return;

	for (const element of document.getElementsByClassName('discordChannelListContainer')) element.classList.remove('expanded');

	document.onclick = null;
}

window.expandDiscordChannelList = (event) => {
	event.stopPropagation();

	if (event.target.closest('.discordChannelList')) return;

	event.currentTarget.classList.toggle('expanded');

	document.onclick = closeDiscordChannelList;
}
