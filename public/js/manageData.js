let settingTypes;
(async () => settingTypes = await (await fetch('/resources/settingTypes.json')).json())();

function displaySettingData (featureName) {
	// TODO: Remove from production
	document.getElementById('logSettingData').textContent = JSON.stringify(getProperty(guildSettings, featureName), null, 2);

	const settingDataElement = document.getElementById('settingData');
	settingDataElement.replaceChildren();
	settingDataElement.dataset.feature = featureName;

	return generateSettingElements(featureName);
}

function generateSettingElements (featureName) {
	const elements = [];
	for (const setting in getProperty(guildSettings, featureName)) {
		const settingType = determineSettingType(`${featureName}.${setting}`);

		elements.push(determineElementType(settingType, featureName, setting));
	}

	return document.getElementById('settingData').append(...elements);
}

function determineElementType (settingType, featureName, setting) {
	switch (settingType) {
		case 'boolean': return createCheckBoxElement(featureName, setting);
		case 'Role': return createSelectElement(roles, featureName, setting);
		case 'Channel': return createSelectElement(channels, featureName, setting);
		case 'string': return createTextBoxElement(featureName, setting);
		case 'Object': return createObjectElement(featureName, setting);
		// case 'hide': return;
		// case 'stringArray': return;
		// case 'stringObject': return;
		// case 'RoleArray': return;
		// case 'TwitchUsername': return;
		// case 'YouTubeUsername': return;
	}
}

async function saveSettingData () {
	const featureName = document.getElementById('settingData').dataset.feature;

	const data = {};
	for (const setting in getProperty(guildSettings, featureName)) {
		const settingType = determineSettingType(`${featureName}.${setting}`);

		data[setting] = extractSettingData(settingType, document.getElementById(setting));
	}

	const response = await postFetch(`${window.location.href}/${featureName}/save`, data);
	setProperty(guildSettings, featureName, response);

	return displaySettingData(featureName);
}

function extractSettingData (settingType, element) {
	switch (settingType) {
		case 'boolean': return element.checked;
		case 'Role': return element.value;
		case 'Channel': return element.value;
		case 'string': return element.value;
		case 'Object': return '';
		// case 'hide': return;
		// case 'stringArray': return;
		// case 'stringObject': return;
		// case 'RoleArray': return;
		// case 'TwitchUsername': return;
		// case 'YouTubeUsername': return;
	}
}

function determineSettingType (featureName) {
	const settingType = getProperty(settingTypes, featureName);

	return typeof settingType === 'object' ? 'Object' : settingType;
}

function createCheckBoxElement (featureName, setting) {
	const checkboxElement = document.createElement('input');
	checkboxElement.type = 'checkbox';
	checkboxElement.id = setting;
	checkboxElement.checked = getProperty(guildSettings, `${featureName}.${setting}`);

	return createLabelElement(setting, checkboxElement);
}

function createSelectElement (allData, featureName, setting) {
	const options = [];
	for (const data of allData) options.push(new Option(data.name, data.id));

	const selectElement = document.createElement('select');
	selectElement.id = setting;
	selectElement.append(...options);

	const currentOptionIndex = options.findIndex((option) => option.value === getProperty(guildSettings, `${featureName}.${setting}`));
	selectElement.options[currentOptionIndex < 0 ? 0 : currentOptionIndex].selected = true;

	return createLabelElement(setting, selectElement);
}

function createTextBoxElement (featureName, setting) {
	const textBoxElement = document.createElement('input');
	textBoxElement.type = 'text';
	textBoxElement.id = setting;
	textBoxElement.value = getProperty(guildSettings, `${featureName}.${setting}`);

	return createLabelElement(setting, textBoxElement);
}

function createObjectElement (featureName, setting) {
	const buttonElement = document.createElement('button');
	buttonElement.type = 'button';
	buttonElement.id = featureName;
	buttonElement.textContent = setting;
	buttonElement.setAttribute('onclick', `displaySettingData('${featureName}.${setting}')`);

	return createLabelElement(setting, buttonElement);
}

function createLabelElement (setting, element) {
	const labelElement = document.createElement('label');
	labelElement.textContent = setting;
	labelElement.appendChild(element);

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
