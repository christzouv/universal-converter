// On an Android phone the Android download comes first (and bigger); computers keep Windows first.
if (/Android/i.test(navigator.userAgent)) document.querySelectorAll(".downloads").forEach(d => d.classList.add("android"));
else if (/Linux/i.test(navigator.userAgent)) document.querySelectorAll(".downloads").forEach(d => d.classList.add("linux"));

// Every download link starts the newest file straight away (installer, .dmg, .apk, .AppImage), and the virus scan link
// under each one points at that file's VirusTotal report. Without this script,
// or if GitHub can't be reached, the links open the releases page instead.
const virus = {"dl-windows": "virus-scan", "dl-mac": "virus-mac", "dl-android": "virus-android", "dl-linux": "virus-linux"};
const wanted = [
  ["dl-windows", a => /Setup.*\.exe$/i.test(a.name), r => !r.prerelease],  // Windows: the latest full release
  ["dl-mac", a => /mac-arm64\.dmg$/i.test(a.name), () => true],            // Mac and Android: newest, betas too
  ["dl-android", a => /\.apk$/i.test(a.name), () => true],
  ["dl-linux", a => /x86_64\.AppImage$/i.test(a.name), () => true],       // Linux (from 3.7): newest, not the .sig
];
fetch("https://api.github.com/repos/christzouv/universal-converter/releases?per_page=30")
  .then(r => r.ok ? r.json() : [])
  .then(releases => {
    for (const [id, isFile, isRelease] of wanted) {
      for (const release of releases) {
        const file = isRelease(release) && release.assets.find(isFile);
        if (file) {
          document.querySelectorAll("#" + id).forEach(a => a.href = file.browser_download_url);
          // The virus scan link follows the file: VirusTotal reports are found by the file's SHA-256.
          const sha = /^sha256:/.test(file.digest || "") && file.digest.slice(7);
          if (sha) document.querySelectorAll("#" + virus[id]).forEach(a => a.href = "https://www.virustotal.com/gui/file/" + sha);
          break;
        }
      }
    }
  })
  .catch(() => {});
