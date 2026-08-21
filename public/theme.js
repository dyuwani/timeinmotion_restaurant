/* ═══════════════════════════════════════════════════════
   THEME — shared by index.html and report.html.
   Applies the saved/preferred theme to <html data-theme="..."> as early
   as possible (this script runs synchronously in <head>, before body
   paints) so there's no flash of the wrong theme. All actual coloring
   lives in theme.css as CSS variables — toggling data-theme repaints
   everything live, no re-render needed on either page.
═══════════════════════════════════════════════════════ */
(function(){
  const KEY='tim-theme';
  function preferredTheme(){
    const saved=localStorage.getItem(KEY);
    if(saved==='light'||saved==='dark')return saved;
    return window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
  }
  document.documentElement.setAttribute('data-theme',preferredTheme());
})();

function currentTheme(){return document.documentElement.getAttribute('data-theme')==='light'?'light':'dark';}

function toggleTheme(){
  const next=currentTheme()==='light'?'dark':'light';
  document.documentElement.setAttribute('data-theme',next);
  localStorage.setItem('tim-theme',next);
  updateThemeToggleButton();
}

function updateThemeToggleButton(){
  const btn=document.getElementById('themeToggle');
  if(!btn)return;
  btn.textContent=currentTheme()==='light'?'🌙':'☀️';
  btn.title=currentTheme()==='light'?'Switch to dark theme':'Switch to light theme';
}

document.addEventListener('DOMContentLoaded',updateThemeToggleButton);
