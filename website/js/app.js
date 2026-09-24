/* ============================================================ 
   LIONS INTERNATIONAL SCHOOL — app.js 
   ============================================================ */ 
 
document.documentElement.classList.add('js-on'); 
 
/* ── NAVBAR SCROLL SHADOW ── */ 
(function() { 
  const nav = document.querySelector('.main-navbar'); 
  if (!nav) return; 
  window.addEventListener('scroll', () => { 
    nav.classList.toggle('shadow-sm', window.scrollY > 30); 
  }, { passive: true }); 
})(); 
 
/* ── ACTIVE NAV LINK ── */ 
(function() { 
  const page = location.pathname.split('/').pop() || 'index.html'; 
  document.querySelectorAll('.main-navbar .nav-link').forEach(a => { 
    const href = a.getAttribute('href'); 
    if (href && (href === page || (page === '' && href === 'index.html'))) { 
      a.classList.add('active'); 
    } 
  }); 
})(); 
 
/* ── SCROLL REVEAL ── */ 
(function() { 
  const els = document.querySelectorAll('.reveal'); 
  if (!els.length) return; 
  const io = new IntersectionObserver(entries => { 
    entries.forEach(e => { 
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } 
    }); 
  }, { threshold: 0.1 }); 
  els.forEach(el => io.observe(el)); 
  setTimeout(() => els.forEach(el => el.classList.add('in')), 2500); 
})(); 
 
/* ── COUNTER ANIMATION ── */ 
(function() { 
  document.querySelectorAll('[data-count]').forEach(el => { 
    const io = new IntersectionObserver(entries => { 
      if (!entries[0].isIntersecting) return; 
      io.disconnect(); 
      const target = parseFloat(el.dataset.count); 
      const suffix = el.dataset.suffix || ''; 
      const prefix = el.dataset.prefix || ''; 
      const dur = 1800; 
      const start = performance.now(); 
      function step(now) { 
        const p = Math.min((now - start) / dur, 1); 
        const ease = 1 - Math.pow(1 - p, 3); 
        const val = ease * target; 
        el.textContent = prefix + (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix; 
        if (p < 1) requestAnimationFrame(step); 
      } 
      requestAnimationFrame(step); 
    }, { threshold: 0.5 }); 
    io.observe(el); 
  }); 
})(); 
 
/* ── ENQUIRY FORM ── */ 
(function() { 
  const form = document.getElementById('enquiryForm'); 
  if (!form) return; 
  form.addEventListener('submit', function(e) { 
    e.preventDefault(); 
    const btn = form.querySelector('[type=submit]'); 
    const orig = btn.textContent; 
    btn.textContent = 'Submitting…'; 
    btn.disabled = true; 
    setTimeout(() => { 
      btn.textContent = '✓ Enquiry Submitted Successfully!'; 
      btn.style.background = '#1B3A6B'; 
      btn.style.color = '#fff'; 
      form.reset(); 
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; btn.style.color = ''; }, 3500); 
    }, 1200); 
  }); 
})(); 
 
/* ── SMOOTH SCROLL ANCHORS ── */ 
document.querySelectorAll('a[href^="#"]').forEach(a => { 
  a.addEventListener('click', e => { 
    const id = a.getAttribute('href'); 
    if (id.length < 2) return; 
    const t = document.querySelector(id); 
    if (!t) return; 
    e.preventDefault(); 
    const offset = (document.querySelector('.main-navbar')?.offsetHeight || 80) + 12; 
    window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - offset, behavior: 'smooth' }); 
  }); 
}); 

/* ── EVENT TOGGLE ── */ 

function toggleEvent(button) { 
    const details = button.previousElementSibling; 
 
    details.classList.toggle('show'); 
 
    if (details.classList.contains('show')) { 
        button.innerHTML = 'Read Less ↑'; 
    } else { 
        button.innerHTML = 'Read More →'; 
    } 
} 

/* ========================================================= 
   PREMIUM SCROLL TO TOP 
   ========================================================= */ 
 
document.addEventListener("DOMContentLoaded", function () { 
 
    const scrollTopBtn = document.getElementById("scrollTopBtn"); 
 
    if (!scrollTopBtn) return; 
 
    function updateScrollTopButton() { 
 
        if (window.scrollY > 420) { 
            scrollTopBtn.classList.add("show"); 
        } else { 
            scrollTopBtn.classList.remove("show"); 
        } 
 
    } 
 
    window.addEventListener( 
        "scroll", 
        updateScrollTopButton, 
        { passive: true } 
    ); 
 
    scrollTopBtn.addEventListener("click", function () { 
 
        window.scrollTo({ 
            top: 0, 
            behavior: "smooth" 
        }); 
 
    }); 
 
    updateScrollTopButton(); 
 
});