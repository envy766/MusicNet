// ===== Global audio player untuk sidebar search =====
let sidebarAudio = new Audio();
let sidebarCurrentFile = "";
let currentAudio = null;
let currentFile = "";

/* ========= STORAGE (my downloads) ========= */
function getDownloadedList(){ return JSON.parse(localStorage.getItem("myDownloads") || "[]"); }
function saveDownloadedList(list){ localStorage.setItem("myDownloads", JSON.stringify(list)); }

function addToMyDownload(file, title){
  if(!file || !title) return;
  const list = getDownloadedList();
  if(!list.some(i => i.file === file)){
    list.push({ file, title });
    saveDownloadedList(list);
  }
  renderMyDownload();
}

function renderMyDownload(){
  const container = document.getElementById("myDownloadMenu") || document.getElementById("myDownloadList");
  if(!container) return;
  const downloads = getDownloadedList();
  if(!downloads.length){
    container.innerHTML = `<p style="color:rgba(255,255,255,0.6);">Belum ada lagu yang diunduh.</p>`;
    return;
  }
  container.innerHTML = downloads.map(d => `
    <div style="margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:8px;">
      <strong>${escapeHtml(d.title)}</strong><br>
      <audio controls style="width:100%; margin-top:6px;" src="${d.file}"></audio>
    </div>
  `).join('');
}

// ===== Fungsi play sidebar toggle =====
function playSidebar(file, button) {
  if (sidebarCurrentFile === file) {
    if (sidebarAudio.paused) {
      sidebarAudio.play();
      button.textContent = "⏸ Pause";
    } else {
      sidebarAudio.pause();
      button.textContent = "▶️ Play";
    }
    return;
  }

  if (!sidebarAudio.paused) {
    sidebarAudio.pause();
  }

  document.querySelectorAll(".sidebar-play-btn").forEach(btn => {
    btn.textContent = "▶️ Play";
  });

  sidebarAudio.src = file;
  sidebarCurrentFile = file;
  sidebarAudio.play();
  button.textContent = "⏸ Pause";
}

// ===== Fungsi play lokal toggle =====
function playLocal(file) {
  if (currentFile === file) {
    if (currentAudio.paused) {
      currentAudio.play();
    } else {
      currentAudio.pause();
    }
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentAudio = new Audio(file);
  currentFile = file;
  currentAudio.play();
}

/* ================== MINI PLAYER YOUTUBE ================== */
document.body.insertAdjacentHTML(
  "beforeend",
  `
<div id="miniPlayer" style="
  display:none; position:fixed; bottom:20px; right:20px;
  width:320px; height:190px; background:rgba(0,0,0,0.9);
  border:1px solid #00f6ff; border-radius:12px; padding:0;
  box-shadow:0 0 20px #00f6ff; z-index:9999; overflow:hidden;">
  <div id="miniPlayerHeader" style="
    cursor:move; display:flex;
    align-items:left; padding:4px; background:rgba(0,0,0,0.6); z-index:2;">
    <span style="color:#00f6ff;font-weight:bold;">🎧 Now Playing...</span>
  </div>
  <iframe id="ytPlayerFrame" width="100%" height="100%"
    src="" frameborder="0"
    allow="autoplay; encrypted-media"
    allowfullscreen
    style="border:none; pointer-events:none;">
  </iframe>
  <!-- Tombol tutup di pojok kanan bawah -->
  <button id="closePlayer" style="
    position:absolute;
    bottom:8px; right:10px;
    background:#ff0044;
    border:none;
    color:white;
    font-size:13px;
    font-weight:bold;
    padding:5px 10px;
    border-radius:8px;
    cursor:pointer;
    transition:0.2s;
  ">Close</button>
</div>
`
);

// ===== Fungsi membuka mini player YouTube =====
window.openMiniPlayer = function(videoId) {
  const miniPlayer = document.getElementById("miniPlayer");
  const frame = document.getElementById("ytPlayerFrame");

  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  miniPlayer.style.display = "block";
  makeDraggable(miniPlayer, document.getElementById("miniPlayerHeader"));
};

// ===== Tombol Tutup di kanan bawah =====
document.addEventListener("click", (e) => {
  if (e.target.id === "closePlayer") {
    const miniPlayer = document.getElementById("miniPlayer");
    const frame = document.getElementById("ytPlayerFrame");
    frame.src = "";
    miniPlayer.style.display = "none";
  }
});

// ===== Fungsi draggable untuk mini player =====
function makeDraggable(el, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  handle.addEventListener("mousedown", dragStart);
  handle.addEventListener("touchstart", touchStart, { passive: false });

  function dragStart(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    const iframe = el.querySelector("iframe");
    if (iframe) iframe.style.pointerEvents = "none";
    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", dragEnd);
  }

  function touchStart(e) {
    e.preventDefault();
    const t = e.touches[0];
    pos3 = t.clientX;
    pos4 = t.clientY;
    const iframe = el.querySelector("iframe");
    if (iframe) iframe.style.pointerEvents = "none";
    document.addEventListener("touchmove", touchMove, { passive: false });
    document.addEventListener("touchend", dragEnd);
  }

  function dragMove(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
  }

  function touchMove(e) {
    const t = e.touches[0];
    pos1 = pos3 - t.clientX;
    pos2 = pos4 - t.clientY;
    pos3 = t.clientX;
    pos4 = t.clientY;
    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
  }

  function dragEnd() {
    const iframe = el.querySelector("iframe");
    if (iframe) iframe.style.pointerEvents = "auto";
    document.removeEventListener("mousemove", dragMove);
    document.removeEventListener("mouseup", dragEnd);
    document.removeEventListener("touchmove", touchMove);
    document.removeEventListener("touchend", dragEnd);
  }
}

/* ========= EVENT DELEGATION ========= */
document.addEventListener("click", function(ev) {
  const target = ev.target;

  const dl = target.closest && target.closest(".download-btn");
  if (dl) {
    ev.preventDefault();
    const file = dl.getAttribute("data-file") || dl.getAttribute("href");
    const title = dl.getAttribute("data-title") || dl.textContent || "Unknown";
    if (file) addToMyDownload(file, title);
    return;
  }

  if (target.classList && target.classList.contains("sidebar-play-btn")) {
    const file = target.getAttribute("data-file");
    if (file) playSidebar(file, target);
    return;
  }
});

/* ========== MENU UTAMA ========== */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebarMenu = document.getElementById("sidebarMenu");
  const closeMenu = document.getElementById("closeMenu");
  const menuShare = document.getElementById('menuShare') || document.getElementById('share-btn');

  if (!menuToggle || !sidebarMenu) return;

  sidebarMenu.classList.add("hidden");

  menuToggle.addEventListener("click", () => {
    sidebarMenu.classList.remove("hidden");
    sidebarMenu.classList.add("active");
  });

  closeMenu?.addEventListener("click", () => {
    sidebarMenu.classList.remove("active");
    sidebarMenu.classList.add("hidden");
  });

  document.getElementById("menuRequest")?.addEventListener("click", () => {
    window.open("https://t.me/RequestMusicNet", "_blank");
  });

  document.getElementById("menuShare")?.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Link MusicNet disalin!");
    });
  });
});

// ========= 📤 SHARE =========
  if(menuShare){
    menuShare.addEventListener('click', () => {
      const musicNetUrl = window.location.href || 'https://envy766.github.io/MusicNet/';
      const modal = document.createElement('div');
      modal.className = 'share-modal';
      modal.innerHTML = `
        <div class="share-content">
          <h3 style="color:#00f6ff">Bagikan MusicNet</h3>
          <p style="color:#cfefff">Pilih platform:</p>
          <div class="share-icons" style="display:flex; justify-content:center; align-items:center;">
            <a href="https://wa.me/?text=${encodeURIComponent('Dengarkan musik favoritmu di MusicNet! ' + musicNetUrl)}" target="_blank" style="margin:0 8px;">
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/whatsapp.svg" alt="wa">
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(musicNetUrl)}" target="_blank" style="margin:0 8px;">
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" alt="fb">
            </a>
            <a href="https://www.instagram.com/" target="_blank" style="margin:0 8px;">
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" alt="ig">
            </a>
          </div>
          <button id="close-share" style="margin-top:12px; background:#00bfff; color:#001; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">Close</button>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector('#close-share').addEventListener('click', () => modal.remove());
    });
  }

/* ========== SEARCH (Local + YouTube via Vercel Proxy) ========== */
document.addEventListener("DOMContentLoaded", () => {
  const menuSearch = document.getElementById("menuSearch");
  const menuMyDownload = document.getElementById("menuMyDownload");
  const sidebarSub = document.getElementById("sidebarSubContent");

  if (!menuSearch || !sidebarSub) return;

  const YT_API_KEY = "AIzaSyDRA_lMU97iqDLaJBi7up6qBtCsuwbZCwY";
  const YT_PROXY = "https://ytproxy-pi.vercel.app/api/search?q=";

  let currentAudio = null;

  function playLocal(file) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(file);
    currentAudio.play().catch(err => console.error("Error play audio:", err));
  }

  menuSearch.addEventListener("click", () => {
    sidebarSub.innerHTML = `
      <h3>🔍 Search Music</h3>
      <input id="searchInput" placeholder="Cari lagu atau artis..." style="
        width:90%; padding:8px; margin:10px 0; border:none;
        background:rgba(255,255,255,0.1); color:#fff; border-radius:8px;">
      <button id="searchBtn" style="
        background:#00bfff; color:#fff; border:none; padding:8px 15px;
        border-radius:8px; cursor:pointer;">Search</button>
      <div id="searchResults" style="
        margin-top:10px; max-height:400px; overflow-y:auto; padding-right:5px;">
      </div>
    `;

    const searchBtn = document.getElementById("searchBtn");
    searchBtn.addEventListener("click", async () => {
      const q = document.getElementById("searchInput").value.trim();
      const resultsDiv = document.getElementById("searchResults");
      if (!q) return alert("Masukkan nama lagu atau artis!");
      resultsDiv.innerHTML = `<p style="color:#ccc;">Mencari "${q}"...</p>`;

      try {
        const localPath = window.location.origin + window.location.pathname.replace(/\/$/, "") + "/playlist.json";
        let localData = [];
        try {
          const localRes = await fetch(localPath);
          if (localRes.ok) localData = await localRes.json();
        } catch (e) {
          console.warn("Gagal load playlist.json:", e);
        }
        const localMatches = localData.filter(song => song.title.toLowerCase().includes(q.toLowerCase()));

        let ytMatches = [];
        try {
          const res = await fetch(`${YT_PROXY}${encodeURIComponent(q)}&key=${YT_API_KEY}`);
          const data = await res.json();
          ytMatches = (data.items || []).map(item => ({
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
            videoId: item.id.videoId
          }));
        } catch (err) {
          console.error("Fetch YouTube via proxy gagal:", err);
        }

        let combined = [];

        if (localMatches.length > 0) {
          combined.push(`<h4 style="color:#0ff;">🎵 Local Results</h4>`);
          combined = combined.concat(localMatches.map(song => `
            <div style="margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
              <strong>${song.title}</strong><br>
              <button class="sidebar-play-btn"
                onclick="playSidebar('${song.file}', this)"
                style="background:#00f6ff; color:#000; font-weight:bold; border:none; padding:6px 12px;
                       border-radius:8px; cursor:pointer; margin-top:5px;">▶️ Play</button>
              <a href="${song.file}" download style="
                display:inline-block; margin-top:5px; padding:6px 12px;
                background:#007bff; color:#fff; border-radius:8px; text-decoration:none;
                box-shadow:0 0 10px #00bfff;">⬇️ Download</a>
            </div>
          `));
        }

        if (ytMatches.length > 0) {
          combined.push(`<h4 style="color:#ff00ff;">📺 YouTube Results</h4>`);
          combined = combined.concat(ytMatches.map(item => `
            <div style="margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
              <strong>${item.title}</strong><br>
              <small>${item.channel}</small><br>
              <img src="${item.thumbnail}" style="width:100%; max-width:250px; margin:5px 0; border-radius:10px;"><br>
              <button onclick="openMiniPlayer('${item.videoId}')" style="
                background:#ff00ff;color:#000;font-weight:bold;border:none;padding:6px 12px;
                border-radius:8px;cursor:pointer;margin-top:5px;">▶️ Play Mini</button>
              <a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" style="
                display:inline-block; margin-top:5px; padding:6px 12px;
                background:#007bff; color:#fff; border-radius:8px; text-decoration:none;
                box-shadow:0 0 10px #00bfff;">🌐 Buka YouTube</a>
            </div>
          `));
        }

        resultsDiv.innerHTML = combined.length > 0
          ? combined.join("")
          : `<p>Tidak ada hasil ditemukan.</p>`;
      } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `<p>Terjadi kesalahan saat mencari lagu.</p>`;
      }
    });
  });
  
  // ========= 📂 MY DOWNLOAD =========
  if(menuMyDownload && sidebarSub){
    menuMyDownload.addEventListener('click', () => {
      sidebarSub.innerHTML = `<h3>📂 My Downloads</h3>
        <div id="myDownloadMenu" style="max-height:420px; overflow-y:auto; padding-right:6px;"></div>`;
      renderMyDownload();
    });
    }
  });
