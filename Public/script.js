function showTab(tabName) {
    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Remove 'active' class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(button => button.classList.remove('active'));

    // Show the selected tab and mark the button as active
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
}
