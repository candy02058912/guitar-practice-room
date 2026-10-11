(() => {
  const key = 'practice-room.palette.v1';
  const valid = value => value === 'pastel' ? 'pastel' : 'pancake';
  let palette = 'pancake';
  try { palette = valid(localStorage.getItem(key)); } catch { /* Optional preference. */ }
  // Runs before styles paint, so a saved palette is used from the first frame.
  document.documentElement.dataset.palette = palette;
  function apply(value) {
    palette = valid(value);
    document.documentElement.dataset.palette = palette;
    const select = document.getElementById('palette');
    if (select) select.value = palette;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', palette === 'pastel' ? '#fff9db' : '#fff9e6');
    document.querySelector('link[rel="icon"]')?.setAttribute('href', palette === 'pastel' ? 'assets/favicon-pastel.svg' : 'assets/favicon.svg');
  }
  document.addEventListener('DOMContentLoaded', () => {
    apply(palette);
    document.getElementById('palette').addEventListener('change', event => {
      apply(event.target.value);
      try { localStorage.setItem(key, palette); } catch { /* The chosen palette still applies for this visit. */ }
    });
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue);
  });
})();
