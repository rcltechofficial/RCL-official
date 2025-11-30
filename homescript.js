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
// Scroll reveal using Intersection Observer
document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        // Remove this line if you don't want them to animate again when scrolling back
        entry.target.classList.remove("active");
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
});
document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom");
  const staggered = document.querySelectorAll(".reveal-stagger");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        // Remove this if you want one-time animation only
        entry.target.classList.remove("active");
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));

  // Handle staggered items
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll(".reveal-stagger");
        children.forEach((child, i) => {
          setTimeout(() => child.classList.add("active"), i * 200); // 200ms delay each
        });
      } else {
        const children = entry.target.querySelectorAll(".reveal-stagger");
        children.forEach(child => child.classList.remove("active"));
      }
    });
  }, { threshold: 0.2 });

  // Observe parent containers that hold staggered items
  document.querySelectorAll(".grid, .feature-grid").forEach(container => {
    staggerObserver.observe(container);
  });
});
