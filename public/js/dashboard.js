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
