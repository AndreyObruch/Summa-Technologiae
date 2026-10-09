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

  // ---- окно "Заявка принята" после редиректа с анкеты (?thanks=1 или #thanks) ----
  var successMsg = document.getElementById('success-message');
  var successCloseBtn = document.getElementById('success-close');
  var thanksOpen = false;

  function hasThanks(){
    if (location.hash === '#thanks') return true;
    var q = location.search.replace(/^\?/, '');
    if (!q) return false;
    var parts = q.split('&');
    for (var i = 0; i < parts.length; i++){
      if (parts[i] === 'thanks=1' || parts[i] === 'thanks') return true;
    }
    return false;
  }
  function cleanUrl(){
    try{
      if (!history.replaceState) return;
      var q = location.search.replace(/^\?/, '');
      var parts = q ? q.split('&') : [];
      var keep = [];
      for (var i = 0; i < parts.length; i++){
        if (parts[i] && parts[i].indexOf('thanks=') !== 0 && parts[i] !== 'thanks') keep.push(parts[i]);
      }
      var newSearch = keep.length ? ('?' + keep.join('&')) : '';
      var newHash = (location.hash === '#thanks') ? '' : location.hash;
      history.replaceState(null, '', location.pathname + newSearch + newHash);
    } catch(e){}
  }
  function showThanks(){
    if (!successMsg) return;
    successMsg.classList.add('show');
    thanksOpen = true;
  }
  function closeThanks(){
    if (!successMsg) return;
    successMsg.classList.remove('show');
    thanksOpen = false;
    cleanUrl();
  }

  if (hasThanks()){
    setTimeout(showThanks, 150);
  }
  if (successCloseBtn) successCloseBtn.addEventListener('click', closeThanks);
  if (successMsg) successMsg.addEventListener('click', function(e){ if (e.target === successMsg) closeThanks(); });
  document.addEventListener('mousedown', function(e){
    if (!thanksOpen || !successMsg) return;
    if (successMsg.contains(e.target)) return;
    closeThanks();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && thanksOpen) closeThanks();
  });

  // ---- клики: открыть анкету / скопировать контакт ----
  document.addEventListener('click', function(e){
    var trigger = e.target.closest ? e.target.closest('[data-open-form]') : null;
    if (trigger){
      e.preventDefault();
      location.href = FORM_URL;
      return;
    }
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
    copyText(raw, function(ok){
      showToast(ok ? ('Скопировано: ' + label) : ('Скопируйте вручную: ' + label));
    });
  });

  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    for (var j = 0; j < els.length; j++) els[j].classList.add('visible');
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});
  for (var j = 0; j < els.length; j++) io.observe(els[j]);
})();