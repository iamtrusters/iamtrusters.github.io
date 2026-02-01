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

    // Smooth page transitions for navigation links
    document.querySelectorAll('a[href]').forEach(function(a){
      // Skip anchor links, external links, and links with target="_blank"
      if(a.getAttribute('href').startsWith('#') ||
         a.getAttribute('href').startsWith('http') ||
         a.getAttribute('target') === '_blank') return;

      a.addEventListener('click', function(e){
        e.preventDefault();
        var href = a.getAttribute('href');

        // Fade out
        document.body.style.opacity = '0';

        // Navigate after fade
        setTimeout(function(){
          window.location.href = href;
        }, 200);
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

  function initThemeToggle(){
    var nav = document.querySelector('.main-nav');
    if(!nav) return;

    // Remove any existing theme toggle buttons to prevent duplicates
    var existingBtns = nav.querySelectorAll('#themeToggle');
    existingBtns.forEach(function(btn){
      btn.remove();
    });

    // Add theme toggle button
    var themeBtn = document.createElement('button');
    themeBtn.id = 'themeToggle';
    themeBtn.title = 'Toggle Theme';
    themeBtn.textContent = '🌙';
    var musicToggle = nav.querySelector('.music-toggle') || nav.lastElementChild;
    nav.insertBefore(themeBtn, musicToggle);

    // Check saved theme and update button state
    var savedTheme = localStorage.getItem('theme');
    if(savedTheme === 'dark'){
      document.documentElement.classList.add('dark');
      themeBtn.textContent = '☀️';
    } else {
      document.documentElement.classList.remove('dark');
      themeBtn.textContent = '🌙';
    }

    // Toggle theme
    themeBtn.addEventListener('click', function(){
      var isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeBtn.textContent = isDark ? '☀️' : '🌙';
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

  function sortByViewsThenDate(a, b){
    var viewsDiff = (b.views || 0) - (a.views || 0);
    if(viewsDiff !== 0) return viewsDiff;
    var dateA = Date.parse(a.date || 0) || 0;
    var dateB = Date.parse(b.date || 0) || 0;
    return dateB - dateA;
  }

  function renderMostViewed(list, target){
    if(!list || list.length === 0) return;
    var html = '';
    list.forEach(function(item){
      html += '<li><a href="' + item.url + '">' + item.title + '</a></li>';
    });
    target.innerHTML = html;
  }

  function getRecentFallback(){
    var cards = document.querySelectorAll('.card.recent');
    var recentCard = null;
    cards.forEach(function(card){
      var h3 = card.querySelector('h3');
      if(h3 && h3.textContent.trim().toLowerCase() === 'recent'){
        recentCard = card;
      }
    });
    if(!recentCard) return [];
    var links = recentCard.querySelectorAll('li a');
    var list = [];
    for(var i = 0; i < links.length && list.length < 3; i++){
      list.push({ title: links[i].textContent, url: links[i].getAttribute('href') });
    }
    return list;
  }

  function initMostViewed(){
    var target = document.getElementById('mostViewedList');
    if(!target) return;
    fetch('assets/data/posts.json')
      .then(function(res){ return res.json(); })
      .then(function(posts){
        if(!Array.isArray(posts) || posts.length === 0){
          renderMostViewed(getRecentFallback(), target);
          return;
        }
        posts.sort(sortByViewsThenDate);
        renderMostViewed(posts.slice(0, 3), target);
      })
      .catch(function(){
        renderMostViewed(getRecentFallback(), target);
      });
  }

  function initMusicPlayer(isPersisted){
    var toggle = document.getElementById('musicToggle');
    var nextBtn = document.getElementById('musicNext');
    var typeDisplay = document.getElementById('musicType');
    var audio = document.getElementById('backgroundMusic');
    if(!toggle || !nextBtn || !typeDisplay || !audio) return;

    var musicTypes = [
      {
        name: 'Lofi',
        sources: [
          'https://lofi.stream.laut.fm/lofi',
          'https://usa9.fastcast4u.com/proxy/jamz?mp=/1',
          'https://streams.radiomast.io/lofi-hip-hop',
          'https://www.lofi.cafe/lofi.mp3',
          'https://streams.ilovemusic.de/lofi.mp3',
          'https://radio.streemlion.com:1780/stream'
        ]
      },
      {
        name: 'Classical',
        sources: [
          'https://streaming.radionomy.com/classical',
          'https://live-radio01.mediahubaustralia.com/2TJW/mp3/',
          'https://streaming.radionomy.com/classicalradio',
          'https://live.leanstream.co/CLASSICALUK',
          'https://radio.streemlion.com:2690/stream',
          'https://classical.stream.laut.fm/classical'
        ]
      },
      {
        name: 'Jazz',
        sources: [
          'https://streaming.radionomy.com/jazzradio',
          'https://jazz.stream.laut.fm/jazz',
          'https://live.leanstream.co/JAZZUK',
          'https://streaming.radionomy.com/smoothjazz',
          'https://jazzradio.com/stream',
          'https://smoothjazz.stream.laut.fm/smoothjazz'
        ]
      },
      {
        name: 'Ambient',
        sources: [
          'https://streaming.radionomy.com/ambient',
          'https://ambient.stream.laut.fm/ambient',
          'https://live.leanstream.co/AMBIENTUK',
          'https://streaming.radionomy.com/ambientradio',
          'https://ambientmusicmix.com/stream',
          'https://chillout.stream.laut.fm/chillout'
        ]
      }
    ];

    var currentTypeIndex = parseInt(localStorage.getItem('musicTypeIndex')) || 0;
    var currentSourceIndex = -1;
    var wasPlaying = localStorage.getItem('musicPlaying') === 'true';

    function saveState(){
      localStorage.setItem('musicTypeIndex', currentTypeIndex);
      localStorage.setItem('musicPlaying', !audio.paused);
    }

    function setType(index){
      currentTypeIndex = index % musicTypes.length;
      currentSourceIndex = 0;
      typeDisplay.textContent = musicTypes[currentTypeIndex].name;
      setRandomSource();
      saveState();
    }

    function setRandomSource(){
      var type = musicTypes[currentTypeIndex];
      console.log('Setting source:', type.sources[currentSourceIndex]);
      audio.src = type.sources[currentSourceIndex];
      currentSourceIndex = (currentSourceIndex + 1) % type.sources.length;
      audio.load();
    }

    function updateIcon(){
      toggle.textContent = audio.paused ? '♪' : '⏸️';
    }

    function playWithFallback(tryCount = 0){
      if (tryCount > 5) {
        console.log('Max tries reached, stopping fallback');
        return;
      }
      console.log('Trying to play source, attempt:', tryCount + 1);
      var timeout = setTimeout(function(){
        console.log('Timeout, trying next source');
        // If not playing after 2s, try another source
        setRandomSource();
        playWithFallback(tryCount + 1);
      }, 2000);

      audio.addEventListener('playing', function onPlaying(){
        console.log('Playing started');
        clearTimeout(timeout);
        audio.removeEventListener('playing', onPlaying);
      }, { once: true });

      audio.play().catch(function(){
        console.log('Play failed (autoplay blocked or error)');
        clearTimeout(timeout);
        // Autoplay blocked or error
      });
    }

    if (!isPersisted) {
      // Full init for new page load
      setType(currentTypeIndex);
      updateIcon();

      // If it was playing before, start playing
      if(wasPlaying){
        playWithFallback();
      }
    } else {
      // For persisted page (back/forward), just restore UI and resume if needed
      typeDisplay.textContent = musicTypes[currentTypeIndex].name;
      updateIcon();
      if (wasPlaying && audio.paused) {
        playWithFallback();
      }
    }

    toggle.addEventListener('click', function(){
      if(audio.paused){
        setRandomSource();
        playWithFallback();
      } else {
        audio.pause();
      }
      updateIcon();
      saveState();
    });

    nextBtn.addEventListener('click', function(){
      var wasPlaying = !audio.paused;
      setType(currentTypeIndex + 1);
      if(wasPlaying){
        playWithFallback();
      }
    });

    // Update icon and save state on audio events
    audio.addEventListener('play', function(){
      updateIcon();
      saveState();
    });
    audio.addEventListener('pause', function(){
      updateIcon();
      saveState();
    });
    audio.addEventListener('ended', function(){
      updateIcon();
      saveState();
    });

    // Change source on error
    audio.addEventListener('error', function(){
      console.log('Audio error, trying next source');
      setRandomSource();
      if(!audio.paused){
        playWithFallback();
      }
    });

    // Volume control
    var volumeSlider = document.getElementById('volumeSlider');
    if(volumeSlider){
      var savedVolume = localStorage.getItem('musicVolume') || 0.5;
      audio.volume = savedVolume;
      volumeSlider.value = savedVolume;
      volumeSlider.addEventListener('input', function(){
        audio.volume = this.value;
        localStorage.setItem('musicVolume', this.value);
      });
    }
  }

  window.addEventListener('pageshow', function(event){
    var isPersisted = event.persisted;

    // Fade in on page load
    document.body.style.opacity = '0';
    setTimeout(function(){
      document.body.style.opacity = '1';
    }, 50);

    initContactForms();
    initSmoothLinks();
    initNavDropdowns();
    initTutorialSwitcher();
    initMostViewed();
    initMusicPlayer(isPersisted);
    initThemeToggle();
  });

  // Expose for debugging if needed
  window.__site = window.__site || {};
  window.__site.sendMailFromForm = sendMailFromForm;
})();