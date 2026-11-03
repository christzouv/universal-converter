// Point the Windows button straight at the newest installer; without this it opens the latest release page.
fetch("https://api.github.com/repos/christzouv/universal-converter/releases/latest")
  .then(r => r.ok ? r.json() : null)
  .then(release => {
    const setup = release && release.assets.find(a => /Setup.*\.exe$/i.test(a.name));
    if (setup) document.querySelectorAll("#dl-windows").forEach(a => a.href = setup.browser_download_url);
  })
  .catch(() => {});
