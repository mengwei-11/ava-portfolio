// 项目子页面公共脚本
// PROJECT_ID 由各子页面在加载此脚本前定义

(async function() {
  // 读取 site_config.json
  let config;
  try {
    const r = await fetch('../site_config.json?t=' + Date.now());
    config = await r.json();
  } catch(e) {
    console.warn('site_config.json not found, using fallback');
    config = null;
  }

  const projects = config ? config.projects : [];
  const idx = (typeof PROJECT_ID !== 'undefined' ? PROJECT_ID : 1) - 1;
  const p = projects[idx] || {};
  const prevP = projects[idx - 1];
  const nextP = projects[idx + 1];

  // 渲染内容
  if (p.title) document.getElementById('pTitle').textContent = p.title;
  if (p.category) {
    document.getElementById('pCategory').textContent = p.category;
    const meta = document.getElementById('pCategoryMeta');
    if (meta) meta.textContent = p.category;
  }
  if (p.year) document.getElementById('pYear').textContent = p.year;
  if (p.description) document.getElementById('pDesc').textContent = p.description;
  document.title = (p.title || 'Project') + ' — Ava Wang';

  // 图片展示
  const imgs = p.images || (p.image ? [p.image] : []);
  const imgContainer = document.getElementById('pImages');
  if (imgs.length > 0) {
    // 第一张大图单独占满
    const first = document.createElement('div');
    first.className = 'project-img-wrap';
    first.innerHTML = `<img src="${imgs[0]}" alt="${p.title||''}" />`;
    imgContainer.appendChild(first);

    // 其余图片两列一行
    if (imgs.length > 1) {
      const remaining = imgs.slice(1);
      for (let i = 0; i < remaining.length; i += 2) {
        if (i + 1 < remaining.length) {
          const grid = document.createElement('div');
          grid.className = 'images-grid';
          [remaining[i], remaining[i+1]].forEach(src => {
            const wrap = document.createElement('div');
            wrap.className = 'project-img-wrap';
            wrap.innerHTML = `<img src="${src}" alt="" />`;
            grid.appendChild(wrap);
          });
          imgContainer.appendChild(grid);
        } else {
          const wrap = document.createElement('div');
          wrap.className = 'project-img-wrap';
          wrap.innerHTML = `<img src="${remaining[i]}" alt="" />`;
          imgContainer.appendChild(wrap);
        }
      }
    }
  }

  // 上下项目导航
  const navEl = document.getElementById('pNav');
  navEl.innerHTML = `
    <a class="proj-nav-item" href="${prevP ? 'project-' + prevP.id + '.html' : '#'}" style="${!prevP?'opacity:.3;pointer-events:none':''}">
      <span class="proj-nav-dir">← Previous</span>
      <span class="proj-nav-title">${prevP ? prevP.title : '—'}</span>
    </a>
    <a class="proj-nav-item proj-nav-right" href="${nextP ? 'project-' + nextP.id + '.html' : '#'}" style="${!nextP?'opacity:.3;pointer-events:none':''}">
      <span class="proj-nav-dir">Next →</span>
      <span class="proj-nav-title">${nextP ? nextP.title : '—'}</span>
    </a>
  `;

  // 子页面使用系统默认鼠标，不自定义

  // 导航滚动
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, {passive:true});

  // 滚动淡入
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in-view'); });
  }, {threshold: 0.1});
  document.querySelectorAll('.reveal, .project-img-wrap').forEach(el => obs.observe(el));
})();
