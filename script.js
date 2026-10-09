(function(){
  function toTop(){
    if (location.hash) return;
    var sb = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = sb || '';
  }
  toTop();
  window.addEventListener('load', toTop);
  window.addEventListener('pageshow', function(e){ if (e.persisted) toTop(); });

  var FORM_URL = 'https://forms.yandex.ru/u/6ac20eb91f1eb51bc88cc4bd/';
  var SUBMIT_MIN = 8000;

  var isMobile = (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    || (navigator.maxTouchPoints > 0 && window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

  var toastEl = null, toastTimer = null;
  function showToast(msg){
    if (!toastEl){
      toastEl = document.createElement('div');
      toastEl.setAttribute('role','status');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);background:#002140;border:1px solid rgba(240,180,41,.6);color:#e6edf7;padding:14px 22px;border-radius:12px;font-size:15px;z-index:300;box-shadow:0 8px 30px rgba(0,0,0,.45);opacity:0;transition:opacity .3s ease,transform .3s ease;max-width:90%;text-align:center;pointer-events:none;';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(function(){
      toastEl.style.opacity = '1';
      toastEl.style.transform = 'translateX(-50%) translateY(0)';
    });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2600);
  }

  function copyText(text, cb){
    function fallback(){
      try{
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta); cb(ok);
      } catch(err){ cb(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ cb(true); }, fallback);
    } else { fallback(); }
  }

  var modal = document.getElementById('form-modal');
  var frame = document.getElementById('form-frame');
  var formCloseBtn = document.getElementById('form-close');
  var successMsg = document.getElementById('success-message');
  var successCloseBtn = document.getElementById('success-close');

  var modalOpen = false, formSubmitted = false, openedAt = 0;

  function ready(){ return modalOpen && (Date.now() - openedAt > SUBMIT_MIN); }
  function finish(showSuccess){
    modalOpen = false;
    if (modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
    if (frame) frame.removeAttribute('src');
    document.body.style.overflow = '';
    if (showSuccess && successMsg) successMsg.classList.add('show');
  }
  function submitted(){ if (formSubmitted) return; formSubmitted = true; finish(true); }

  if (modal && frame && formCloseBtn){
    frame.onload = function(){ if (ready()) submitted(); };
    formCloseBtn.addEventListener('click', function(){ finish(formSubmitted); });
    modal.addEventListener('click', function(e){ if (e.target === modal) finish(formSubmitted); });
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Escape') return;
      if (successMsg && successMsg.classList.contains('show')){ successMsg.classList.remove('show'); return; }
      if (modalOpen) finish(formSubmitted);
    });
  }
  if (successCloseBtn) successCloseBtn.addEventListener('click', function(){ successMsg.classList.remove('show'); });
  if (successMsg) successMsg.addEventListener('click', function(e){ if (e.target === successMsg) successMsg.classList.remove('show'); });

  window.addEventListener('message', function(ev){
    if (!ready()) return;
    if (ev.origin !== 'https://forms.yandex.ru' && ev.origin !== 'https://forms.yandex.net') return;
    var d = ev.data;
    if (!d || typeof d !== 'object') return;
    if ('height' in d || d.type === 'resize' || d.event === 'resize') return;
    submitted();
  });

  function openForm(){
    if (!modal || !frame) return;
    modalOpen = true; formSubmitted = false; openedAt = Date.now();
    frame.src = FORM_URL;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  document.addEventListener('click', function(e){
    var trigger = e.target.closest ? e.target.closest('[data-open-form]') : null;
    if (trigger){ e.preventDefault(); openForm(); return; }
    var btn = e.target.closest ? e.target.closest('.contact-btn') : null;
    if (!btn) return;
    var href = btn.getAttribute('href') || '';
    var isTel = href.indexOf('tel:') === 0;
    var isMail = href.indexOf('mailto:') === 0;
    if (!isTel && !isMail) return;
    if (isMobile) return;
    e.preventDefault();
    var raw = href.replace(/^tel:/,'').replace(/^mailto:/,'');
    var label = isTel ? '+7 (812) 71-646-74' : raw;
    copyText(raw, function(ok){ showToast(ok ? ('Скопировано: ' + label) : ('Скопируйте вручную: ' + label)); });
  });

  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    for (var j = 0; j < els.length; j++) els[j].classList.add('visible');
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});
  for (var j = 0; j < els.length; j++) io.observe(els[j]);
})();