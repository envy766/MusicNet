


/* ------------------------
   Background canvas & audio visualizer
------------------------ */
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
const logo = document.getElementById('logo');
const visualizerBars = document.querySelectorAll('#visualizer span');
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;

addEventListener('resize',()=>{
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
});

const particles = [];
for(let i=0;i<120;i++){
  particles.push({
    x:Math.random()*W,
    y:Math.random()*H,
    r:Math.random()*1.6+0.6,
    dx:(Math.random()-0.5)*0.6,
    dy:(Math.random()-0.5)*0.6,
    hue:Math.random()*70+175
  });
}

let audioCtx, analyser, dataArray;

function setupAudioAnalyzer(audioEl){
  if(audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const src = audioCtx.createMediaElementSource(audioEl);

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.72;

  dataArray = new Uint8Array(analyser.frequencyBinCount);

  src.connect(analyser);
  analyser.connect(audioCtx.destination);
}

let beatLevel = 0;
let targetBeat = 0;
let overallLevel = 0;

function draw(){
  requestAnimationFrame(draw);
  ctx.clearRect(0,0,W,H);

  if(analyser){
    analyser.getByteFrequencyData(dataArray);

    const lowCount = Math.max(
      4,
      Math.floor(dataArray.length*0.08)
    );

    let lowSum = 0;
    for(let i=0;i<lowCount;i++){
      lowSum += dataArray[i];
    }
    targetBeat = lowSum/lowCount/255;

    let total = 0;
    for(let i=0;i<dataArray.length;i++){
      total += dataArray[i];
    }
    overallLevel = total/dataArray.length/255;

    beatLevel += (targetBeat-beatLevel)*0.22;

    window.__music_overall = overallLevel;
    window.__music_beat = beatLevel;

  }else{
    beatLevel *= 0.92;
    overallLevel *= 0.96;

    window.__music_overall = overallLevel;
    window.__music_beat = beatLevel;
  }

  /* ------------------------
     Global beat effects
  ------------------------ */
const beat = Math.min(1,beatLevel);
  const overall = Math.min(1,overallLevel);

  document.documentElement.style.setProperty(
    '--music-beat',
    beat.toFixed(3)
  );

  document.documentElement.style.setProperty(
    '--music-overall',
    overall.toFixed(3)
  );

  /* ------------------------
     Wave
  ------------------------ */
  const t = Date.now()*0.001;

  for(let x=0;x<W;x+=7){
    const amp = 18+60*beat;

    const y =
      H/2+
      Math.sin(x*0.012+t)*amp+
      Math.sin(x*0.006+t*2)*(amp*0.6);

    const alpha = 0.08+beat*0.5;

    ctx.fillStyle =
      `rgba(110,240,255,${alpha})`;

    ctx.fillRect(x,y,2,2);
  }

  /* ------------------------
     Living particles
  ------------------------ */

ctx.shadowBlur =
  6+
  overall*8+
  beat*12;

ctx.shadowColor =
  'rgba(110,240,255,.65)';

  particles.forEach(p=>{
    p.x += p.dx*(1+overall*2);
    p.y += p.dy*(1+overall*2);

    if(p.x < -10) p.x = W+10;
    if(p.x > W+10) p.x = -10;
    if(p.y < -10) p.y = H+10;
    if(p.y > H+10) p.y = -10;

    const hue = p.hue+beat*35;

    const alpha =
      0.28+
      overall*0.55+
      beat*0.25;

    const size =
      p.r*(1+overall*1.5+beat*0.65);

    ctx.beginPath();
    ctx.arc(p.x,p.y,size,0,Math.PI*2);

    ctx.fillStyle =
      `hsla(${hue},100%,78%,${Math.min(1,alpha)})`;
    ctx.fill();
  });

  /* ------------------------
     Logo beat light
  ------------------------ */
  if(logo){
    const scale = 1+beat*0.08;

    const glow =
      24+
      beat*78+
      overall*18;

    const opacity =
      0.42+
      beat*0.58;

    logo.style.transform =
      `scale(${scale})`;

    logo.style.setProperty(
      '--logo-beat',
      beat.toFixed(3)
    );

    logo.style.setProperty(
      '--logo-glow',
      `${glow}px`
    );

    logo.style.setProperty(
      '--logo-opacity',
      opacity.toFixed(3)
    );
  }

  /* ------------------------
     Progress bar beat light
  ------------------------ */
  if(bar){
    const progressGlow = 8+beat*28;

    bar.style.setProperty(
      '--progress-beat',
      beat.toFixed(3)
    );

    bar.style.boxShadow =
      `0 0 ${progressGlow}px rgba(110,240,255,${0.35+beat*0.6})`;
  }

  /* ------------------------
     Visualizer bars
  ------------------------ */
if(analyser && visualizerBars.length){
for(let i=0;i<visualizerBars.length;i++){
      const index =
        Math.min(dataArray.length-1,i*2);

      const v = dataArray[index]/255;

   visualizerBars[i].style.height =
        `${8+v*32+beat*8}px`;
   visualizerBars[i].style.opacity =
        `${0.4+v*0.6}`;
    }
  }
}

/* ------------------------
   Player logic
------------------------ */
const playlistURL = 'playlist.json';
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const bar = document.getElementById('bar');
const progress = document.getElementById('progress');
const curTimeEl = document.getElementById('curTime');
const durTimeEl = document.getElementById('durTime');
const playlistEl = document.getElementById('playlist');
const searchInput = document.getElementById('search');
const genreBtn = document.getElementById('genreBtn');
const genrePanel = document.getElementById('genrePanel');
const favOnlyBtn = document.getElementById('favOnly');
const toggleListBtn = document.getElementById('toggleList');
const logoEl = document.getElementById('logo');
const volumeSlider = document.getElementById('volume');
const muteBtn = document.getElementById('mute');
const rateDisplay = document.getElementById('rateDisplay');

let playlist = [];
let filteredIndexes = [];
let favorites = JSON.parse(
  localStorage.getItem('musicnet_favorites') || '[]'
);
let savedState = JSON.parse(
  localStorage.getItem('musicnet_last') || '{}'
);
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let showFavOnly = false;
let visInterval = null;

const ALLOWED_GENRES =
  ['pop','poprock','slow','breakbeat','cover'];

let selectedGenres = [];


/* ------------------------
   Fungsi Update Judul Lagu
------------------------ */
function updateSongTitle(title){
  const songTitle =
    document.getElementById('songTitle');

  if(songTitle){
    songTitle.textContent = title;
  }
}

function tagsToLower(arr){
  return (arr||[]).map(
    x=>String(x).toLowerCase().trim()
  );
}


/* ------------------------
   LOAD PLAYLIST
------------------------ */
async function loadPlaylist(){
  try{
    const res =
      await fetch(playlistURL,{cache:'no-store'});

    if(!res.ok){
      throw new Error('playlist.json not found');
    }

    playlist = await res.json();

    playlist = playlist.map(p=>({
      file:p.url||p.file||p.src||'',
      title:p.title||p.name||'',
      artist:p.artist||'',
      tags:Array.isArray(p.tags)
        ? tagsToLower(p.tags)
        : (
          p.tags
            ? tagsToLower(
                String(p.tags)
                  .split(',')
                  .map(s=>s.trim())
              )
            : []
        )
    }));

    buildGenrePanel();
    applyFilters();

    if(
      savedState &&
      typeof savedState.index === 'number' &&
      playlist[savedState.index]
    ){
      const filteredPosition =
        filteredIndexes.indexOf(savedState.index);

      currentIndex =
        filteredPosition >= 0
          ? filteredPosition
          : 0;

      loadTrack(
        filteredIndexes.length
          ? filteredIndexes[currentIndex]
          : savedState.index
      );

      if(savedState.time){
        audio.currentTime = savedState.time;
      }

    }else if(playlist.length){
      currentIndex = 0;
      loadTrack(0);
    }

  }catch(err){
    console.error(err);
alert('MusicNet Error: ' + err.message);

    if(titleEl){
      titleEl.textContent =
        'Gagal memuat playlist.json';
    }
  }
}


/* ------------------------
   GENRE PANEL
------------------------ */
function buildGenrePanel(){
  genrePanel.innerHTML = '';

  ALLOWED_GENRES.forEach(g=>{
    const label =
      document.createElement('label');

    label.className = 'genre-chip';

    const cb =
      document.createElement('input');

    cb.type = 'checkbox';
    cb.value = g;
    cb.checked =
      selectedGenres.includes(g);

    cb.addEventListener('change',()=>{
      toggleGenre(g,cb.checked);
    });

    label.appendChild(cb);
    label.appendChild(
      document.createTextNode(' '+g)
    );

    genrePanel.appendChild(label);
  });

  highlightActiveGenres();
}

function toggleGenre(g,checked){
  if(checked){
    if(!selectedGenres.includes(g)){
      selectedGenres.push(g);
    }
  }else{
    selectedGenres =
      selectedGenres.filter(x=>x!==g);
  }

  applyFilters();
  highlightActiveGenres();
}


/* ------------------------
   FILTER & PLAYLIST RULE
------------------------ */
function applyFilters(){
  const q =
    (searchInput.value||'')
      .trim()
      .toLowerCase();

  playlistEl.innerHTML = '';
  filteredIndexes = [];

  playlist.forEach((t,i)=>{
    if(
      showFavOnly &&
      !favorites.includes(t.file)
    ) return;

  const cleanTags =
  (t.tags||[]).map(tag=>tag.toLowerCase());

    if(
      selectedGenres.length &&
      !cleanTags.some(
        tag=>selectedGenres.includes(tag)
      )
    ) return;

    const searchable =
      ((t.title||'')+' '+(t.artist||''))
        .toLowerCase();

    if(q && !searchable.includes(q)) return;

    filteredIndexes.push(i);
  });

  filteredIndexes.forEach(i=>{
    createListItem(i);
  });

  const genreIndicator =
    document.getElementById(
      'activeGenreIndicator'
    );

  if(genreIndicator){
    genreIndicator.textContent =
      selectedGenres.length === 0
        ? 'Genre: All Music'
        : 'Genre: '+
          selectedGenres.join(', ')
            .toUpperCase();
  }

  highlightActiveGenres();
}


/* ------------------------
   HIGHLIGHT GENRE
------------------------ */
function highlightActiveGenres(){
  document
    .querySelectorAll('#genrePanel label')
    .forEach(label=>{
      const input =
        label.querySelector('input');

      if(
        input &&
        selectedGenres.includes(input.value)
      ){
        label.classList.add('active');
      }else{
        label.classList.remove('active');
      }
    });
}


/* ------------------------
   ITEM
------------------------ */
function createListItem(i){
  const t = playlist[i];

  const row =
    document.createElement('div');

  row.className = 'item';
  row.dataset.i = i;

  /* Perbaikan active item */
  if(i === filteredIndexes[currentIndex]){
    row.classList.add('active');
  }

  const meta =
    document.createElement('div');

  meta.className = 'meta';

  const tt =
    document.createElement('div');

  tt.className = 't';
  tt.textContent =
    t.title || 'Tanpa Judul';

  const aa =
    document.createElement('div');

  aa.className = 'a';
  aa.textContent = t.artist || '';

  meta.appendChild(tt);
  meta.appendChild(aa);

  const fav =
    document.createElement('div');

  fav.className = 'fav';
  fav.textContent =
    favorites.includes(t.file)
      ? '★'
      : '☆';

  if(favorites.includes(t.file)){
    fav.classList.add('active');
  }

  row.appendChild(meta);
  row.appendChild(fav);

  row.addEventListener('click',ev=>{
    if(
      ev.target === fav ||
      ev.target.classList.contains('fav')
    ){
      toggleFavorite(t.file,fav);
      ev.stopPropagation();
      return;
    }

    const position =
      filteredIndexes.indexOf(i);

    if(position >= 0){
      currentIndex = position;
    }

    loadTrack(i);
    playAudio();
  });

  playlistEl.appendChild(row);
}


/* ------------------------
   FAVORITE
------------------------ */
function toggleFavorite(file,dom){
  if(favorites.includes(file)){
    favorites =
      favorites.filter(f=>f!==file);

    dom.textContent = '☆';
    dom.classList.remove('active');

  }else{
    favorites.push(file);

    dom.textContent = '★';
    dom.classList.add('active');
  }

  localStorage.setItem(
    'musicnet_favorites',
    JSON.stringify(favorites)
  );
}


/* ------------------------
   LOAD TRACK
------------------------ */
function loadTrack(i){
  if(!playlist[i]) return;

  const t = playlist[i];

  audio.src = t.file;
  audio.load();

  titleEl.textContent =
    t.title || 'Tanpa Judul';

  artistEl.textContent =
    t.artist || '';

  updateSongTitle(
    t.title || 'Tanpa Judul'
  );

  document
    .querySelectorAll('.item')
    .forEach(el=>{
      const idx =
        Number(el.dataset.i);

      el.classList.toggle(
        'active',
        idx === i
      );
    });

  saveLast();
}


/* ------------------------
   PLAY / PAUSE
------------------------ */
function startVisualizer(){
  document.documentElement
    .classList.add('music-playing');
}

function stopVisualizer(){
  document.documentElement
    .classList.remove('music-playing');

  document.documentElement
    .style.setProperty(
      '--music-beat',
      '0'
    );

  document.documentElement
    .style.setProperty(
      '--edge-glow',
      '8px'
    );

  document.documentElement
    .style.setProperty(
      '--edge-opacity',
      '0.08'
    );
}

function playAudio(){
  try{
    if(!audioCtx){
      setupAudioAnalyzer(audio);
    }

    if(
      audioCtx &&
      audioCtx.state === 'suspended'
    ){
      audioCtx.resume();
    }

  }catch(e){
    console.warn(e);
  }

  audio.play()
    .then(()=>{
      isPlaying = true;
      playBtn.textContent = '⏸️';

      if(logoEl){
        logoEl.style.animationPlayState =
          'running';
      }

      startVisualizer();
    })
    .catch(err=>{
      console.warn(
        'Audio play failed:',
        err
      );

      isPlaying = false;
      playBtn.textContent = '▶️';
    });
}

function pauseAudio(){
  audio.pause();

  isPlaying = false;
  playBtn.textContent = '▶️';

  if(logoEl){
    logoEl.style.animationPlayState =
      'paused';
  }

  stopVisualizer();
}

playBtn.addEventListener('click',()=>{
  isPlaying
    ? pauseAudio()
    : playAudio();
});

audio.addEventListener('play',()=>{
  isPlaying = true;
  playBtn.textContent = '⏸️';
  startVisualizer();
});

audio.addEventListener('pause',()=>{
  if(!audio.ended){
    isPlaying = false;
    playBtn.textContent = '▶️';
    stopVisualizer();
  }
});


/* ------------------------
   VOLUME
------------------------ */
let lastVolume = 1;

audio.volume =
  volumeSlider.value || 1;

volumeSlider.addEventListener('input',e=>{
  audio.volume = e.target.value;

  muteBtn.textContent =
    audio.volume === 0
      ? '🔇'
      : '🔊';

  if(audio.volume > 0){
    lastVolume = audio.volume;
  }
});

muteBtn.addEventListener('click',()=>{
  if(audio.volume > 0){
    lastVolume = audio.volume;

    audio.volume = 0;
    volumeSlider.value = 0;
    muteBtn.textContent = '🔇';

  }else{
    audio.volume =
      lastVolume || 0.8;

    volumeSlider.value =
      audio.volume;

    muteBtn.textContent = '🔊';
  }
});


/* ------------------------
   PREV / NEXT
------------------------ */
prevBtn.addEventListener('click',()=>{
  if(audio.currentTime > 3){
    audio.currentTime = 0;
    return;
  }

  if(filteredIndexes.length === 0){
    return;
  }

  currentIndex =
    (currentIndex-1+
      filteredIndexes.length) %
    filteredIndexes.length;

  loadTrack(
    filteredIndexes[currentIndex]
  );

  playAudio();
});

nextBtn.addEventListener('click',()=>{
  nextTrack();
});

function nextTrack(){
  if(filteredIndexes.length === 0){
    return;
  }

  if(isRepeat){
    audio.currentTime = 0;
    playAudio();
    return;
  }

  if(isShuffle){
    currentIndex =
      Math.floor(
        Math.random()*
        filteredIndexes.length
      );
  }else{
    currentIndex =
      (currentIndex+1) %
      filteredIndexes.length;
  }

  loadTrack(
    filteredIndexes[currentIndex]
  );

  playAudio();
}


/* ------------------------
   SHUFFLE / REPEAT
------------------------ */
shuffleBtn.addEventListener('click',()=>{
  isShuffle = !isShuffle;

  shuffleBtn.classList.toggle(
    'active',
    isShuffle
  );
});

repeatBtn.addEventListener('click',()=>{
  isRepeat = !isRepeat;

  repeatBtn.classList.toggle(
    'active',
    isRepeat
  );
});


/* ------------------------
   SAVE STATE
------------------------ */
function saveLast(){
  try{
    const absoluteIndex =
      filteredIndexes.length &&
      filteredIndexes[currentIndex] !== undefined
        ? filteredIndexes[currentIndex]
        : currentIndex;

    localStorage.setItem(
      'musicnet_last',
      JSON.stringify({
        index:absoluteIndex || 0,
        time:audio.currentTime || 0
      })
    );

  }catch(e){}
}


/* ------------------------
   TOOLBAR
------------------------ */
searchInput.addEventListener('input',()=>{
  const currentFile =
    playlist[
      filteredIndexes[currentIndex]
    ]?.file;

  applyFilters();

  if(currentFile){
    const newPosition =
      filteredIndexes.findIndex(
        i=>playlist[i]?.file === currentFile
      );

    if(newPosition >= 0){
      currentIndex = newPosition;
    }
  }
});

favOnlyBtn.addEventListener('click',()=>{
  showFavOnly = !showFavOnly;

  favOnlyBtn.classList.toggle(
    'active',
    showFavOnly
  );

  applyFilters();
});

toggleListBtn.addEventListener('click',()=>{
  const wrap =
    document.querySelector('.playlist-wrap');

  if(wrap){
    const isHidden =
      wrap.classList.toggle('hidden');

    toggleListBtn.textContent =
      isHidden ? '▼' : '▲';
  }
});

genreBtn.addEventListener('click',ev=>{
  const open =
    genrePanel.style.display !== 'none';

  genrePanel.style.display =
    open ? 'none' : 'flex';

  genreBtn.setAttribute(
    'aria-expanded',
    (!open).toString()
  );

  highlightActiveGenres();
});

document.addEventListener('click',ev=>{
  if(
    !genrePanel.contains(ev.target) &&
    ev.target !== genreBtn
  ){
    genrePanel.style.display = 'none';

    genreBtn.setAttribute(
      'aria-expanded',
      'false'
    );
  }
});


/* ------------------------
   PROGRESS
------------------------ */
function formatTime(sec){
  const m = Math.floor(sec/60);
  const s = Math.floor(sec%60);

  return `${m}:${s<10?'0'+s:s}`;
}

function updateProgress(){
  if(audio.duration){
    const pct =
      (audio.currentTime/audio.duration)*100;

    bar.style.width = pct+'%';

    curTimeEl.textContent =
      formatTime(audio.currentTime);

    durTimeEl.textContent =
      formatTime(audio.duration);
  }
}

audio.addEventListener(
  'timeupdate',
  updateProgress
);

progress.addEventListener('click',e=>{
  if(!audio.duration) return;

  const rect =
    progress.getBoundingClientRect();

  const clickX =
    e.clientX-rect.left;

  const newTime =
    (clickX/rect.width)*
    audio.duration;

  audio.currentTime = newTime;
  updateProgress();
});

let isDragging = false;

progress.addEventListener('mousedown',()=>{
  isDragging = true;
});

progress.addEventListener('mouseup',()=>{
  isDragging = false;
});

progress.addEventListener('mousemove',e=>{
  if(
    !isDragging ||
    !audio.duration
  ) return;

  const rect =
    progress.getBoundingClientRect();

  const moveX =
    e.clientX-rect.left;

  const newTime =
    Math.max(
      0,
      Math.min(
        1,
        moveX/rect.width
      )
    )*audio.duration;

  audio.currentTime = newTime;
  updateProgress();
});

document.addEventListener('mouseup',()=>{
  isDragging = false;
});


/* ------------------------
   AUDIO EVENTS
------------------------ */
audio.addEventListener(
  'loadedmetadata',
  ()=>{
    updateProgress();
  }
);

audio.addEventListener('ended',()=>{
  isPlaying = false;
  nextTrack();
});


/* ------------------------
   INIT
------------------------ */
loadPlaylist();
draw();
