/* ── Typewriter ── */
const words = ["Hi, I'm Jeff", "Software Engineer", "Backend Developer", "Cloud Infrastructure Maintainer", "AI Explorer"];
let wIdx = 0, cIdx = 0, deleting = false;
const tw = document.getElementById('typewriter');

function type() {
  const word = words[wIdx];
  if (!deleting) {
    tw.textContent = word.slice(0, ++cIdx);
    if (cIdx === word.length) { deleting = true; setTimeout(type, 1800); return; }
  } else {
    tw.textContent = word.slice(0, --cIdx);
    if (cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; }
  }
  setTimeout(type, deleting ? 55 : 90);
}
type();

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once, then stop watching
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── Radar Chart ── */
const ctx = document.getElementById('radarChart').getContext('2d');
new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['Algorithms', 'Systems', 'Web Dev', 'AI/ML', 'Security', 'Databases'],
    datasets: [{
      label: 'Skill',
      data: [80, 70, 60, 80, 60, 60],
      backgroundColor: 'rgba(136, 132, 216, 0.45)',
      borderColor: '#8884d8',
      borderWidth: 2,
      pointBackgroundColor: '#8884d8'
    }]
  },
  options: {
    responsive: true,
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { display: false },
        pointLabels: { font: { family: 'DM Sans', size: 8 } }
      }
    },
    plugins: { legend: { display: false } }
  }
});

/* ── Contact Form ── */
const form = document.getElementById('contactForm');
const msg  = document.getElementById('formMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  try {
    const res = await fetch("https://formspree.io/f/mzzgbrvy", {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    });
    if (res.ok) {
      msg.textContent = "Thanks! Your message has been sent.";
      msg.className = "form-msg success";
      form.reset();
    } else {
      throw new Error();
    }
  } catch {
    msg.textContent = "Oops! Something went wrong. Please try again.";
    msg.className = "form-msg error";
  }
});