// Every download link starts the newest file straight away (installer, .dmg, .apk), and the virus scan link
// points at the newest installer's report. Without this script,
// or if GitHub can't be reached, the links open the releases page instead.
const wanted = [
  ["dl-windows", a => /Setup.*\.exe$/i.test(a.name), r => !r.prerelease],  // Windows: the latest full release
  ["dl-mac", a => /mac-arm64\.dmg$/i.test(a.name), () => true],            // Mac and Android: newest, betas too
  ["dl-android", a => /\.apk$/i.test(a.name), () => true],
];
fetch("https://api.github.com/repos/christzouv/universal-converter/releases?per_page=30")
  .then(r => r.ok ? r.json() : [])
  .then(releases => {
    for (const [id, isFile, isRelease] of wanted) {
      for (const release of releases) {
        const file = isRelease(release) && release.assets.find(isFile);
        if (file) {
          document.querySelectorAll("#" + id).forEach(a => a.href = file.browser_download_url);
          // The virus scan link follows the installer: VirusTotal reports are found by the file's SHA-256.
          const sha = id === "dl-windows" && /^sha256:/.test(file.digest || "") && file.digest.slice(7);
          if (sha) document.querySelectorAll("#virus-scan").forEach(a => a.href = "https://www.virustotal.com/gui/file/" + sha);
          break;
        }
      }
    }
  })
  .catch(() => {});
