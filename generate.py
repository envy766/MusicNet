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

# Ambil semua file audio dari internal storage
tracks = []
for fn in sorted(os.listdir(internal_mylist)):
    if fn.lower().endswith(('.mp3','.m4a','.ogg','.wav')):
        src = os.path.join(internal_mylist, fn)
        dst = os.path.join(local_mylist, fn)
        # Copy file ke folder lokal Termux
        shutil.copy2(src, dst)

        # Ambil genre dari nama file [pop][slow][cover] dst
        tags = [m.lower() for m in re.findall(r'\[([^\]]+)\]', fn)]

        # Bersihkan title dari tag
        title_clean = re.sub(r'\[[^\]]+\]', '', os.path.splitext(fn)[0]).strip()

        tracks.append({
            "file": f"Mylist/{fn}",
            "title": title_clean,
            "artist": "",
            "tags": tags
        })

# Buat playlist.json di folder lokal Termux
with open(out, 'w', encoding='utf-8') as f:
    json.dump(tracks, f, indent=2, ensure_ascii=False)

print(f"playlist.json dibuat: {len(tracks)} lagu")
