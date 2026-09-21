// Run before paint so returning home never flashes the entrance screen.
(() => {
  let entered = location.hash === '#archive';
  try { entered ||= sessionStorage.getItem('xiaoyuan-entered') === '1'; } catch {}
  if (entered) document.documentElement.classList.add('skip-intro');
})();
