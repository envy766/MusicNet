

#!/usr/bin/env python3
import os, json, shutil, re

# Folder internal storage Android
internal_mylist = '/storage/emulated/0/MusicNet/Mylist'

# Folder lokal Termux
home = os.path.expanduser('~/MusicNet')
local_mylist = os.path.join(home, 'Mylist')
out = os.path.join(home, 'playlist.json')

# Pastikan folder lokal ada
os.makedirs(local_mylist, exist_ok=True)

# =========================================
# LOAD PLAYLIST LAMA
# =========================================

tracks = []

if os.path.exists(out):
    try:
        with open(out, 'r', encoding='utf-8') as f:
            tracks = json.load(f)

        if not isinstance(tracks, list):
            tracks = []

    except (json.JSONDecodeError, OSError):
        tracks = []

# File yang sudah ada di playlist
existing_files = {track.get("file") for track in tracks}

# =========================================
# TAMBAHKAN LAGU BARU
# =========================================

new_tracks = 0

for fn in sorted(os.listdir(internal_mylist)):
    if not fn.lower().endswith(('.mp3', '.m4a', '.ogg', '.wav')):
        continue

    src = os.path.join(internal_mylist, fn)
    dst = os.path.join(local_mylist, fn)

    playlist_file = f"Mylist/{fn}"

    # Jika lagu sudah ada di playlist, jangan tambahkan lagi
    if playlist_file in existing_files:
        continue

    # Copy file baru ke folder lokal Termux
    shutil.copy2(src, dst)

    # Ambil genre dari nama file [pop][slow][cover] dst
    tags = [m.lower() for m in re.findall(r'\[([^\]]+)\]', fn)]

    # Bersihkan title dari tag
    title_clean = re.sub(
        r'\[[^\]]+\]',
        '',
        os.path.splitext(fn)[0]
    ).strip()

    tracks.append({
        "file": playlist_file,
        "title": title_clean,
        "artist": "",
        "tags": tags
    })

    existing_files.add(playlist_file)
    new_tracks += 1

tracks.sort(key=lambda track: track.get("title", "").lower())

# =========================================
# SIMPAN PLAYLIST
# =========================================
print("TOTAL TRACKS:", len(tracks))
print("LAST TRACK:", tracks[-1])

with open(out, 'w', encoding='utf-8') as f:
    json.dump(
        tracks,
        f,
        indent=2,
        ensure_ascii=False
    )

print(f"playlist.json diperbarui: {len(tracks)} lagu")
print(f"Lagu baru ditambahkan: {new_tracks}")
