const openDropDownEventListener = ((event) => {
	event.stopPropagation();

	const dropDownElementStyle = document.getElementById('userDropdown').style;
	dropDownElementStyle.visibility = 'visible';
	dropDownElementStyle.opacity = 1;

	document.getElementById('userProfile').onclick = null;
	document.onclick = closeDropDownEventListener;
});

const closeDropDownEventListener = ((event) => {
	event.stopPropagation();

	if (event.target.matches('#userDropdown')) return;

	const dropDownElementStyle = document.getElementById('userDropdown').style;
	dropDownElementStyle.visibility = 'hidden';
	dropDownElementStyle.opacity = 0;

	document.onclick = null;
	document.getElementById('userProfile').onclick = openDropDownEventListener;
});

(() => {
	if (document.getElementById('userProfile')) document.getElementById('userProfile').onclick = openDropDownEventListener;
})();
