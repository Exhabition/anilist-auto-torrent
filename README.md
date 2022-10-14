# anilist-auto-torrent
Automatically fetch torrents from nyaa.si once you add anime to your AniList

# Getting Started
## Adding a config
### Method 1: config.json

```json
{
    "uploaders": ["Ember_Encodes", "Judas"], // uploaders on nyaa.si to check first
    "fallbackToAllUploaders": true,          // if torrent isn't found by uploaders, find torrent by any uploader or not?
    "userId": 862658,                        // your AniList ID
    "savePath": "path/to/something", 
    "maxActiveTorrents": 4                   // default is 4, lower or higher depending on your resources 
}
```

### Method 2: .env
```env
UPLOADERS=Ember_Encodes,Judas
FALLBACK_TO_ALL_UPLOADERS=true
USER_ID=862658
SAVE_PATH=path/to/something
MAX_ACTIVE_TORRENTS=4
```


# Features
- [x] Set preferred nyaa.si uploaders
- [x] Set max active torrents
- [ ] Set max download/upload speed

![image](https://user-images.githubusercontent.com/63742759/195425325-af91c815-983c-435a-8009-8d8eddbed892.png)
