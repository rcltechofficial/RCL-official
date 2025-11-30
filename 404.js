let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > lastScrollY) {
    // Scrolling down → hide navbar
    navbar.style.transform = 'translateY(-100%)';
  } else {
    // Scrolling up → show navbar
    navbar.style.transform = 'translateY(0)';
  }
  lastScrollY = window.scrollY;
});