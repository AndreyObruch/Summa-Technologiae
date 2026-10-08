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
  var modal = document.getElementById('form-modal');
  var frame = document.getElementById('form-frame');
  var formCloseBtn = document.getElementById('form-close');
  var successMsg = document.getElementById('success-message');
  var successCloseBtn = document.getElementById('success-close');

  var modalOpen = false;
  var frameLoads = 0;
  var formSubmitted = false;
  var autoTimer = null;

  // Первая загрузка iframe — анкета. Вторая (после отправки) — страница «отправлено».
  frame.onload = function(){
    if (!modalOpen) return;
    frameLoads++;
    if (frameLoads > 1) {
      formSubmitted = true;
      if (!autoTimer) {
        autoTimer = setTimeout(function(){ finish(true); }, 3000);
      }
    }
  };

  function openForm(e){
    e.preventDefault();
    modalOpen = true;
    frameLoads = 0;
    formSubmitted = false;
    autoTimer = null;
    frame.src = FORM_URL;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function finish(showSuccess){
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
    modalOpen = false;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    frame.removeAttribute('src');
    document.body.style.overflow = '';
    if (showSuccess) successMsg.classList.add('show');
  }

  function closeSuccess(){
    successMsg.classList.remove('show');
  }

  var triggers = document.querySelectorAll('[data-open-form]');
  for (var i = 0; i < triggers.length; i++) triggers[i].addEventListener('click', openForm);
  formCloseBtn.addEventListener('click', function(){ finish(formSubmitted); });
  modal.addEventListener('click', function(e){ if (e.target === modal) finish(formSubmitted); });
  successCloseBtn.addEventListener('click', closeSuccess);
  successMsg.addEventListener('click', function(e){ if (e.target === successMsg) closeSuccess(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      if (successMsg.classList.contains('show')) closeSuccess();
      else if (modal.classList.contains('open')) finish(formSubmitted);
    }
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