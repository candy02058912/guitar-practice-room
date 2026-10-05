"""Copy only browser assets into the directory exposed by Tailscale Serve."""
from pathlib import Path
from shutil import copyfile, copytree

root = Path(__file__).resolve().parent.parent
destination = root / '.tailnet-public'
destination.mkdir(exist_ok=True)
for name in ('index.html', 'style.css', 'app.js', 'engine.js'):
    copyfile(root / name, destination / name)
copytree(root / 'assets', destination / 'assets', dirs_exist_ok=True)
print(f'Prepared browser assets in {destination}')
