// Main site JS: contact form handler and small UI helpers
(function(){
  'use strict';

  function sendMailFromForm(form){
    var name = (form.querySelector('#name') || {}).value || '';
    var subject = (form.querySelector('#subject') || {}).value || 'Message from website';
    var message = (form.querySelector('#message') || {}).value || '';
    var body = encodeURIComponent('Name: ' + name + '\n\n' + message);
    var href = 'mailto:hello@example.com?subject=' + encodeURIComponent(subject) + '&body=' + body;
    window.location.href = href;
  }

  function initContactForms(){
    var form = document.getElementById('contactForm');
    if(!form) return;
    // If form has an action attribute, allow normal submit (e.g., FormSubmit).
    if(!form.getAttribute('action')){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        sendMailFromForm(form);
      });
    }
  }

  function initSmoothLinks(){
    // Smooth scroll for internal anchors that start with '#'
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var href = a.getAttribute('href');
        if(href === '#' || !href.startsWith('#')) return;
        var target = document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth'});
        }
      });
    });
  }

  function initNavDropdowns(){
    document.querySelectorAll('.nav-dropdown').forEach(function(dd){
      var btn = dd.querySelector('.drop-toggle');
      if(!btn) return;
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var open = dd.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function(){
      document.querySelectorAll('.nav-dropdown.open').forEach(function(dd){
        dd.classList.remove('open');
        var btn = dd.querySelector('.drop-toggle');
        if(btn) btn.setAttribute('aria-expanded','false');
      });
    });
  }

  function initTutorialSwitcher(){
    var links = document.querySelectorAll('.tutorial-link');
    if(!links || links.length === 0) return;

    function showTarget(selector, updateHistory){
      var all = document.querySelectorAll('.tutorial-section');
      all.forEach(function(s){ s.classList.remove('active'); });
      var target = document.querySelector(selector);
      if(target) target.classList.add('active');
      if(updateHistory){
        try{ history.replaceState(null,'',selector); }catch(e){}
      }
    }

    links.forEach(function(a){
      a.addEventListener('click', function(e){
        // If the link points to the same page, intercept and switch content
        var href = a.getAttribute('href') || '';
        var target = a.getAttribute('data-target');
        if(target && (href.indexOf(location.pathname.split('/').pop()) !== -1 || href.indexOf('#') !== -1)){
          e.preventDefault();
          showTarget(target, true);
        }
      });
    });

    // On load, show section from hash if present
    var h = location.hash;
    if(h){
      showTarget(h, false);
    } else {
      // show first tutorial section by default
      var first = document.querySelector('.tutorial-section');
      if(first) first.classList.add('active');
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    initContactForms();
    initSmoothLinks();
    initNavDropdowns();
    initTutorialSwitcher();
  });

  // Expose for debugging if needed
  window.__site = window.__site || {};
  window.__site.sendMailFromForm = sendMailFromForm;
})();