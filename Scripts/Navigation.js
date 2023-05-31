const checkBtn = document.querySelector('.checkbtn');
const navItems = document.querySelector('.nav-items');

checkBtn.addEventListener('click', () => {
    navItems.classList.toggle('active');
});