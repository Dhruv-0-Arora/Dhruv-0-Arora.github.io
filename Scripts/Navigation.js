const checkBtn = document.getElementsByClassName('checkbtn');
const navUl = document.getElementsByTagName('ul');

checkBtn.addEventListener("click", () => {
    console.log("here");
    if (navUl.style.display === 'none') {
        navUl.style.display = 'block';
    } else {
        navUl.style.display = 'none';
    }
});