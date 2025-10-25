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

/* ========== SEARCH (Local + YouTube) ========== */
document.addEventListener("DOMContentLoaded", () => {
  const menuSearch = document.getElementById("menuSearch");
  const menuMyDownload = document.getElementById("menuMyDownload");
  const sidebarSub = document.getElementById("sidebarSubContent");

  // 🔑 Ganti dengan API key milikmu
  const YT_API_KEY = "AIzaSyDRA_lMU97iqDLaJBi7up6qBtCsuwbZCwY";

  menuSearch.addEventListener("click", () => {
    sidebarSub.innerHTML = `
      <h3>🔍 Search Music</h3>
      <input id="searchInput" placeholder="Cari lagu atau artis..." style="
        width: 90%; padding: 8px; margin: 10px 0; border: none;
        background: rgba(255,255,255,0.1); color: #fff; border-radius: 8px;">
      <button id="searchBtn" style="
        background: #00bfff; color: #fff; border: none; padding: 8px 15px;
        border-radius: 8px; cursor: pointer;">Search</button>
      <div id="searchResults" style="margin-top: 10px;"></div>
    `;

    const searchBtn = document.getElementById("searchBtn");

    searchBtn.addEventListener("click", async () => {
      const q = document.getElementById("searchInput").value.trim();
      const resultsDiv = document.getElementById("searchResults");

      if (!q) return alert("Masukkan nama lagu atau artis!");
      resultsDiv.innerHTML = `<p style="color:#ccc;">Mencari "${q}"...</p>`;

try {
  // === Fetch dari playlist.json (lokal di repo kamu) ===
  const localPath = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/playlist.json';
  const localRes = await fetch(localPath);
  let localData = [];
  if (localRes.ok) {
    localData = await localRes.json();
  } else {
    console.warn("Gagal load playlist.json, status:", localRes.status);
  }

  const localMatches = localData.filter(song =>
    song.title.toLowerCase().includes(q.toLowerCase())
  );

  // === Fetch dari YouTube API via proxy aman (allorigins fallback ke corsproxy) ===
  const ytURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(q)}&key=${YT_API_KEY}`;
  let ytData = null;

  try {
    // 🟢 Gunakan proxy pertama (allorigins)
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(ytURL)}`);
    const raw = await res.json();
    ytData = JSON.parse(raw.contents);
  } catch (err1) {
    console.warn("Proxy allorigins gagal, mencoba corsproxy.io...");
    const res2 = await fetch(`https://corsproxy.io/?${ytURL}`);
    ytData = await res2.json();
  }

  console.log("YouTube response:", ytData);

  const ytMatches = (ytData && ytData.items ? ytData.items : []).map(item => ({
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium.url,
    videoId: item.id.videoId,
  }));

  // === Gabungkan hasil ===
  let combined = [];

  if (localMatches.length > 0) {
    combined.push(`<h4 style="color:#0ff;">🎵 Local Results</h4>`);
    combined = combined.concat(localMatches.map(song => `
      <div style="margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
        <strong>${song.title}</strong><br>
        <button onclick="playLocal('${song.file}')" style="
          background:#00f6ff;color:#000;font-weight:bold;border:none;padding:6px 12px;
          border-radius:8px;cursor:pointer;margin-top:5px;">▶️ Play
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

  if (combined.length === 0) {
    resultsDiv.innerHTML = `<p>Tidak ada hasil ditemukan.</p>`;
  } else {
    resultsDiv.innerHTML = combined.join("");
  }

} catch (err) {
  console.error("❌ Search error:", err);
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

/* ========== MINI PLAYER YOUTUBE ========== */
document.body.insertAdjacentHTML(
  "beforeend",
  `
<div id="miniPlayer" style="
  display:none; position:fixed; bottom:20px; right:20px;
  width:300px; height:170px; background:rgba(0,0,0,0.9);
  border:1px solid #00f6ff; border-radius:12px; padding:5px;
  box-shadow:0 0 20px #00f6ff; z-index:9999;">
  <div style="display:flex; justify-content:space-between; align-items:center; padding:5px;">
    <span style="color:#00f6ff;font-weight:bold;">🎧 Now Playing</span>
    <button id="closePlayer" style="
      background:none; border:none; color:#00f6ff; font-size:18px; cursor:pointer;">✖</button>
  </div>
  <iframe id="ytPlayerFrame" width="100%" height="130"
    src="" frameborder="0"
    allow="autoplay; encrypted-media"
    allowfullscreen
    style="border-radius:8px;">
  </iframe>
</div>
`
);

window.openMiniPlayer = function (videoId, title) {
  const miniPlayer = document.getElementById("miniPlayer");
  const frame = document.getElementById("ytPlayerFrame");

  frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  miniPlayer.style.display = "block";
};

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "closePlayer") {
    const miniPlayer = document.getElementById("miniPlayer");
    const frame = document.getElementById("ytPlayerFrame");
    frame.src = ""; // stop video
    miniPlayer.style.display = "none";
  }
});

/* ========== PEMUTAR LOKAL ========== */
window.playLocal = function (file) {
  const audio = new Audio(file);
  audio.play();
  alert("🎵 Memutar: " + file.split("/").pop());
};
