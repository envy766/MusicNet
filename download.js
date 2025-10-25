
// ===== Global audio player untuk sidebar search =====
let sidebarAudio = new Audio();
let sidebarCurrentFile = "";
let currentAudio = null;
let currentFile = "";

// ===== Fungsi play sidebar toggle =====
function playSidebar(file, button) {
  // Toggle play/pause jika file sama
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

  // Jika lagu berbeda, hentikan audio lama
  if (!sidebarAudio.paused) {
    sidebarAudio.pause();
  }

  // Reset semua tombol lain menjadi Play
  document.querySelectorAll(".sidebar-play-btn").forEach(btn => {
    btn.textContent = "▶️ Play";
  });

  // Mainkan lagu baru
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

  <!-- Header (Now Playing + Close) sebagai handle drag -->
  <div id="miniPlayerHeader" style="
    cursor:move; display:flex; justify-content:space-between;
    align-items:center; padding:4px; background:rgba(0,0,0,0.6); z-index:2;">
    <span style="color:#00f6ff;font-weight:bold;">🎧 Now Playing...</span>
    <button id="closePlayer" style="
      background:none; border:none; color:#00f6ff; font-size:15px; cursor:pointer;">✖</button>
  </div>

  <!-- Video -->
  <iframe id="ytPlayerFrame" width="100%" height="100%"
    src="" frameborder="0"
    allow="autoplay; encrypted-media"
    allowfullscreen
    style="border:none; pointer-events:none;">
  </iframe>
</div>
`
);

// ===== Fungsi membuka mini player YouTube =====
window.openMiniPlayer = function(videoId) {
  const miniPlayer = document.getElementById("miniPlayer");
  const frame = document.getElementById("ytPlayerFrame");

  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  miniPlayer.style.display = "block";

  // Aktifkan draggable melalui header
  makeDraggable(miniPlayer, document.getElementById("miniPlayerHeader"));
};

document.getElementById("closePlayer").addEventListener("click", () => {
  const miniPlayer = document.getElementById("miniPlayer");
  const frame = document.getElementById("ytPlayerFrame");
  frame.src = ""; // stop video
  miniPlayer.style.display = "none";
});

/* ================== DRAG FUNCTION FIX ================== */
function makeDraggable(el, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;

    // sementara matikan pointer event iframe supaya drag bisa
    const iframe = el.querySelector("iframe");
    iframe.style.pointerEvents = "none";

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    el.style.top = (el.offsetTop - pos2) + "px";
    el.style.left = (el.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // aktifkan kembali pointer event iframe
    const iframe = el.querySelector("iframe");
    iframe.style.pointerEvents = "auto";

    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/* ========== MENU UTAMA ========== */
  document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebarMenu = document.getElementById("sidebarMenu");
  const closeMenu = document.getElementById("closeMenu");
  sidebarMenu.classList.add("hidden");

  menuToggle.addEventListener("click", () => {
    sidebarMenu.classList.remove("hidden");
    sidebarMenu.classList.add("active");
  });

  closeMenu.addEventListener("click", () => {
    sidebarMenu.classList.remove("active");
    sidebarMenu.classList.add("hidden");
  });

  document.getElementById("menuRequest").addEventListener("click", () => {
    window.open("https://t.me/RequestMusicNet", "_blank");
  });

  document.getElementById("menuShare").addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Link MusicNet disalin!");
    });
  });
});

/* ========== SEARCH (Local + YouTube via Vercel Proxy) ========== */
document.addEventListener("DOMContentLoaded", () => {
  const menuSearch = document.getElementById("menuSearch");
  const menuMyDownload = document.getElementById("menuMyDownload");
  const sidebarSub = document.getElementById("sidebarSubContent");

  const YT_API_KEY = "AIzaSyDRA_lMU97iqDLaJBi7up6qBtCsuwbZCwY"; // ganti dengan API key kamu
  const YT_PROXY = "https://ytproxy-pi.vercel.app/api/search?q=";

  // 🔊 Audio global untuk play lokal
  let currentAudio = null;

  function playLocal(file) {
    // hentikan audio lama kalau ada
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
    width: 90%; padding: 8px; margin: 10px 0; border: none;
    background: rgba(255,255,255,0.1); color: #fff; border-radius: 8px;">
  <button id="searchBtn" style="
    background: #00bfff; color: #fff; border: none; padding: 8px 15px;
    border-radius: 8px; cursor: pointer;">Search</button>
  <div id="searchResults" style="
    margin-top: 10px;
    max-height: 400px;        /* batas tinggi container */
    overflow-y: auto;          /* aktifkan scroll vertikal */
    padding-right: 5px;">
  </div>
  `;

    const searchBtn = document.getElementById("searchBtn");

    searchBtn.addEventListener("click", async () => {
      const q = document.getElementById("searchInput").value.trim();
      const resultsDiv = document.getElementById("searchResults");
      if (!q) return alert("Masukkan nama lagu atau artis!");
      resultsDiv.innerHTML = `<p style="color:#ccc;">Mencari "${q}"...</p>`;

      try {
        // === Fetch playlist lokal ===
        const localPath = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/playlist.json';
        let localData = [];
        try {
          const localRes = await fetch(localPath);
          if (localRes.ok) localData = await localRes.json();
        } catch (e) {
          console.warn("Gagal load playlist.json:", e);
        }
        const localMatches = localData.filter(song => song.title.toLowerCase().includes(q.toLowerCase()));

        // === Fetch YouTube via Vercel Proxy ===
        let ytMatches = [];
        try {
          const res = await fetch(`${YT_PROXY}?q=${encodeURIComponent(q)}&key=${YT_API_KEY}`);
          const data = await res.json(); // Proxy Vercel mengembalikan JSON langsung
          ytMatches = (data.items || []).map(item => ({
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
            videoId: item.id.videoId,
          }));
        } catch (err) {
          console.error("Fetch YouTube via proxy gagal:", err);
        }

        // === Gabungkan hasil ===
        let combined = [];

if (localMatches.length > 0) {
  combined.push(`<h4 style="color:#0ff;">🎵 Local Results</h4>`);
  combined = combined.concat(localMatches.map(song => `
    <div style="margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
      <strong>${song.title}</strong><br>
      <button class="sidebar-play-btn"
        onclick="playSidebar('${song.file}', this)"
        style="background:#00f6ff; color:#000; font-weight:bold; border:none; padding:6px 12px;
               border-radius:8px; cursor:pointer; margin-top:5px;">
        ▶️ Play
      </button>
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
      <button onclick="openMiniPlayer('${item.videoId}', '${item.title.replace(/'/g, "\\'")}')" style="
        background:#ff00ff;color:#000;font-weight:bold;border:none;padding:6px 12px;
        border-radius:8px;cursor:pointer;margin-top:5px;">▶️ Play Mini
      </button>
      <a href="https://www.youtube.com/watch?v=${item.videoId}" target="_blank" style="
        display:inline-block; margin-top:5px; padding:6px 12px;
        background:#007bff; color:#fff; border-radius:8px; text-decoration:none;
        box-shadow:0 0 10px #00bfff;">🌐 Buka YouTube</a>
    </div>
  `));
}

        resultsDiv.innerHTML = combined.length > 0 ? combined.join("") : `<p>Tidak ada hasil ditemukan.</p>`;

      } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `<p>Terjadi kesalahan saat mencari lagu.</p>`;
      }
    });
  });

  menuMyDownload.addEventListener("click", () => {
    sidebarSub.innerHTML = `
      <h3>📂 My Downloads</h3>
      <p>Daftar lagu yang telah kamu unduh akan muncul di sini (fitur akan datang).</p>
    `;
  });
});
