let settingTypes;
(async () => settingTypes = await (await fetch('/resources/settingTypes.json')).json())();

function displaySettingData (featurePath) {
	// TODO: Remove from production
	document.getElementById('logSettingData').textContent = JSON.stringify(getProperty(guildSettings, featurePath), null, 2);

	const settingDataElement = document.getElementById('settingData');
	settingDataElement.replaceChildren();
	settingDataElement.dataset.feature = featurePath;

	return settingDataElement.append(...generateSettingElements(featurePath));
}

function generateSettingElements (featurePath) {
	const elements = [];
	for (const setting in getProperty(guildSettings, featurePath)) {
		const settingType = determineSettingType(`${featurePath}.${setting}`);

		if (settingType === 'hidden') continue;
		if (settingType === 'Object') generateSettingElements(`${featurePath}.${setting}`);

		elements.push(determineElementType(settingType, featurePath, setting));
	}

	return elements;
}

function determineSettingType (featurePath) {
	const settingType = getProperty(settingTypes, featurePath);
	return (typeof settingType === 'object') ? 'Object' : settingType;
}

function determineElementType (settingType, featurePath, setting) {
	switch (settingType) {
		case 'boolean': return createCheckBoxElement(featurePath, setting);
		case 'Role': return createSelectElement(roles, featurePath, setting);
		case 'Channel': return createSelectElement(channels, featurePath, setting);
		case 'string': return createTextBoxElement(featurePath, setting);
		case 'Object': return createObjectElement(featurePath, setting);
		case 'stringArray': return createListElement(getProperty(guildSettings, `${featurePath}.${setting}`), featurePath, setting);
		case 'TwitchUsername': return createTextBoxElement(featurePath, setting);
		case 'YouTubeUsername': return createTextBoxElement(featurePath, setting);
	}
}

async function updateSettingData () {
	const featurePath = document.getElementById('settingData').dataset.feature;

	const data = {};
	for (const setting in getProperty(guildSettings, featurePath)) {
		const settingType = determineSettingType(`${featurePath}.${setting}`);

		if (settingType === 'Object' || settingType === 'hidden') continue;

		const settingData = extractSettingData(settingType, document.getElementById(setting));
		Array.isArray(settingData) ? await saveSettingData(`${featurePath}.${setting}`, settingData) : data[setting] = settingData;
	}

	const response = await postFetch(`${window.location.href}/${featurePath}/update`, data);
	setProperty(guildSettings, featurePath, response);

	return displaySettingData(featurePath);
}

async function saveSettingData (featurePath, data) {
	return await postFetch(`${window.location.href}/${featurePath}/save`, data);
}

function extractSettingData (settingType, element) {
	switch (settingType) {
		case 'boolean': return element.checked;
		case 'Role': return element.value;
		case 'Channel': return element.value;
		case 'string': return element.value;
		case 'stringArray': return extractListEntries(element);
		case 'TwitchUsername': return element.value;
		case 'YouTubeUsername': return element.value;
	}
}

function extractListEntries (element) {
	const entries = [];
	for (const entry of element.children) if (entry.id !== 'addListEntryButton') entries.push(entry.dataset.value);

	return entries;
}

function createCheckBoxElement (featurePath, setting) {
	const checkboxElement = document.createElement('input');
	checkboxElement.type = 'checkbox';
	checkboxElement.id = setting;
	checkboxElement.checked = getProperty(guildSettings, `${featurePath}.${setting}`);

	return createLabelElement(setting, checkboxElement);
}

function createSelectElement (allData, featurePath, setting) {
	const options = [];
	for (const data of allData) options.push(new Option(data.name, data.id));

	const selectElement = document.createElement('select');
	selectElement.id = setting;
	selectElement.append(...options);

	const currentOptionIndex = options.findIndex((option) => option.value === getProperty(guildSettings, `${featurePath}.${setting}`));
	selectElement.options[currentOptionIndex < 0 ? 0 : currentOptionIndex].selected = true;

	return createLabelElement(setting, selectElement);
}

function createTextBoxElement (featurePath, setting) {
	const textBoxElement = document.createElement('input');
	textBoxElement.type = 'text';
	textBoxElement.id = setting;
	textBoxElement.value = getProperty(guildSettings, `${featurePath}.${setting}`);

	return createLabelElement(setting, textBoxElement);
}

function createObjectElement (featurePath, setting) {
	const buttonElement = document.createElement('button');
	buttonElement.type = 'button';
	buttonElement.id = featurePath;
	buttonElement.textContent = setting;
	buttonElement.setAttribute('onclick', `displaySettingData('${featurePath}.${setting}')`);

	return buttonElement;
}

function createListElement (allData, featurePath, setting) {
	const entries = [];
	for (const data of allData) entries.push(createListEntryElement(data));

	const listElement = document.createElement('ul');
	listElement.id = setting;
	listElement.append(...entries, createAddListEntryButtonElement());

	return listElement;
}

function createListEntryElement (data) {
	const entryElement = document.createElement('li');
	entryElement.dataset.value = data;
	entryElement.textContent = data;
	entryElement.append(createDeleteListEntryButtonElement());

	return entryElement;
}

function createDeleteListEntryButtonElement () {
	const deleteButtonElement = document.createElement('button');
	deleteButtonElement.type = 'button';
	deleteButtonElement.textContent = 'x';
	deleteButtonElement.addEventListener('click', () => deleteButtonElement.parentElement.remove());

	return deleteButtonElement;
}

function createAddListEntryButtonElement () {
	const addListEntryElement = document.createElement('li');
	addListEntryElement.id = 'addListEntryButton';
	addListEntryElement.textContent = '+';
	addListEntryElement.addEventListener('click', () => { addListEntryElement.textContent = ''; addListEntryElement.contentEditable = true; addListEntryElement.focus() });
	addListEntryElement.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			addListEntryElement.parentElement.insertBefore(createListEntryElement(addListEntryElement.textContent), addListEntryElement);
			addListEntryElement.textContent = '+';
			addListEntryElement.contentEditable = false;
		}
	});

	return addListEntryElement;
}

function createLabelElement (setting, element) {
	const labelElement = document.createElement('label');
	labelElement.textContent = setting;
	labelElement.append(element);

	return labelElement;
}

async function postFetch (url, data) {
	try {
		const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
		return await response.json();
	} catch (error) { console.error(error) }
}

function getProperty (data, path) {
	return path.split('.').reduce((a, b) => a?.[b], data);
}

function setProperty (data, path, value) {
	return path.split('.').reduce((a, b, i) => a[b] = path.split('.').length === ++i ? value : a[b] || {}, data);
}
