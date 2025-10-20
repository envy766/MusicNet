#!/usr/bin/env python3
import os, json

home = os.path.expanduser('~/MusicNet')
mylist = os.path.join(home, 'Mylist')
out = os.path.join(home, 'playlist.json')

if not os.path.isdir(mylist):
    print("Folder Mylist tidak ditemukan:", mylist); exit(1)

tracks = []
for fn in sorted(os.listdir(mylist)):
    if fn.lower().endswith(('.mp3','.m4a','.ogg','.wav')):
        title = os.path.splitext(fn)[0]
        tracks.append({
            "file": f"Mylist/{fn}",
            "title": title,
            "artist": ""
        })

with open(out, 'w', encoding='utf-8') as f:
    json.dump(tracks, f, indent=2, ensure_ascii=False)
print(f"playlist.json dibuat: {len(tracks)} lagu")
