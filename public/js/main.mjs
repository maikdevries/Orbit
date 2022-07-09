(() => {
	window.localStorage.setItem('theme', window.localStorage.getItem('theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'colour'));
	if (window.localStorage.getItem('theme') === 'dark') { document.documentElement.classList.add('dark'); if (document.getElementById('themeSwitch')) document.getElementById('themeSwitch').checked = true }
})();

window.toggleTheme = (event) => {
	event.stopPropagation();

	const themeSwitch = document.getElementById('themeSwitch');
	themeSwitch.checked = !themeSwitch.checked;
	window.localStorage.setItem('theme', window.localStorage.getItem('theme') === 'colour' ? 'dark' : 'colour');

	document.documentElement.classList.toggle('dark');
}

const closeUserProfileDropdown = (event) => {
	event.stopPropagation();

	if (event.target.closest('#userProfileDropdown')) return;

	document.getElementById('userProfile').classList.remove('expanded');

	document.onclick = null;
}

window.expandUserProfileDropdown = (event) => {
	event.stopPropagation();

	if (event.target.closest('#userProfileDropdown')) return;

	event.currentTarget.classList.toggle('expanded');

	document.onclick = closeUserProfileDropdown;
}
