function toggleNav() {
  const navItems = document.querySelector('.nav-items');
  navItems.classList.toggle('show');
}

const checkBtn = document.querySelector('.check-btn');
checkBtn.addEventListener('click', toggleNav);