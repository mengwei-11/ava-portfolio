/* ============================================
   AVA WANG — 交互脚本
   ============================================ */

// ── 轻量 Markdown 渲染（支持换行、粗体、分段）──
function renderMarkdown(text) {
  if (!text) return '';
  return text
    // XSS 防护：转义 HTML 特殊字符
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // **粗体**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // 空行 → 段落分隔
    .replace(/\n{2,}/g, '</p><p>')
    // 单个换行 → <br>
    .replace(/\n/g, '<br>')
    // 包裹段落
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

// ============ 0. 优先加载 site_config.json，fallback 到 config.js ============

async function loadSiteConfig() {
  // 始终以 config.js 的 SITE_CONFIG 为基础（包含 nav、copyright 等字段）
  // 再用 site_config.json 覆盖可编辑的字段
  const base = {
    name:      SITE_CONFIG.name,
    tagline:   SITE_CONFIG.tagline,
    copyright: SITE_CONFIG.copyright || '©2026',
    nav:       SITE_CONFIG.nav,
    about:     JSON.parse(JSON.stringify(SITE_CONFIG.about)),
    contact:   { ...SITE_CONFIG.contact, wechat: '', wechatQR: '' },
    footer:    { ...SITE_CONFIG.footer },
    projects:  JSON.parse(JSON.stringify(SITE_CONFIG.projects)),
  };
  try {
    // 优先从 Railway API 读取最新配置，fallback 到静态文件
    const RAILWAY_API = 'https://ava-portfolio-backend-production.up.railway.app/api/public/site-config';
    const staticUrl = location.hostname.includes('vercel.app') || location.hostname.includes('avawang')
      ? '/site_config.json?t=' + Date.now()
      : '/portfolio/site_config.json?t=' + Date.now();
    let r = await fetch(RAILWAY_API).catch(() => null);
    if (!r || !r.ok) r = await fetch(staticUrl);
    if (!r.ok) return base;
    const remote = await r.json();
    // 只覆盖 site_config.json 里存在的字段，nav/copyright 保留 base
    if (remote.name)    base.name    = remote.name;
    if (remote.tagline) base.tagline = remote.tagline;
    if (remote.about)   base.about   = remote.about;
    if (remote.contact) base.contact = { ...base.contact, ...remote.contact };
    if (remote.footer)  base.footer  = remote.footer;
    if (remote.projects && remote.projects.length) base.projects = remote.projects;
    if (remote.heroImages && remote.heroImages.length) base.heroImages = remote.heroImages;
  } catch { /* 静默失败，用 base */ }
  return base;
}

// ============ 1. 渲染内容 ============

function renderSite() {
  const C = window.__siteConfig || SITE_CONFIG;

  // 导航
  document.getElementById('navName').textContent = C.name;
  document.getElementById('navCopyright').textContent = C.copyright;
  const navLinks = document.getElementById('navLinks');
  C.nav.forEach(item => {
    const a = document.createElement('a');
    a.href = item.href; a.textContent = item.label;
    navLinks.appendChild(a);
  });

  // Hero 大字 — 扫光动画（从暗到白，像光束从左往右扫）
  // tagline 支持 \n 换行（中英双语分行）
  const taglineEl2 = document.getElementById('heroTagline');
  taglineEl2.style.whiteSpace = 'pre-line';
  taglineEl2.textContent = (C.tagline || '').replace(/\\n/g, '\n');
  const heroNameWrap = document.getElementById('heroName');
  // 拆成单词，每个单词独立一行
  C.name.split(' ').forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'hero-name-text';
    span.textContent = word;
    span.style.setProperty('--reveal-pct', '-10%');
    heroNameWrap.appendChild(span);
    heroNameWrap.appendChild(document.createElement('br'));
  });
  // 扫光动画：用 RAF 推进每个字的 --reveal-pct 从 -10% 到 110%
  animateNameReveal();

  // ── 项目网格（每行 2 个，左小右大，奇偶行 CSS 自动反转）──
  const grid = document.getElementById('projectGrid');
  const projects = C.projects;

  for (let i = 0; i < projects.length; i += 2) {
    const row = document.createElement('div');
    row.className = 'project-row';

    [projects[i], projects[i + 1]].forEach((p, j) => {
      if (!p) return;
      // 奇偶列：j=0 小, j=1 大
      const isSmall = j === 0;
      const card = document.createElement('a');
      card.className = `project-card ${isSmall ? 'card-small' : 'card-large'}`;
      card.href = p.link || '#';
      card.innerHTML = `
        <div class="project-card-img">
          <img src="${p.image}" alt="${p.title}" loading="lazy" />
        </div>
        <div class="project-card-info">
          <div class="project-card-title">${p.title}</div>
          <div class="project-card-category">${p.category}</div>
        </div>`;
      row.appendChild(card);
    });

    grid.appendChild(row);
  }

  // ── All Projects 网格 ──
  const allGrid = document.getElementById('allProjectsGrid');
  projects.forEach(p => {
    const a = document.createElement('a');
    a.className = 'all-project-item';
    a.href = p.link || '#';
    a.innerHTML = `
      <div class="all-project-img">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
      </div>
      <div class="all-project-title">${p.title}</div>
      <div class="all-project-category">${p.category}</div>`;
    allGrid.appendChild(a);
  });

  // see them all 点击展开
  document.getElementById('seeAllBtn').addEventListener('click', e => {
    e.preventDefault();
    const sec = document.getElementById('all-projects');
    sec.classList.toggle('open');
    e.target.textContent = sec.classList.contains('open')
      ? 'hide ↑'
      : 'see them all ↗';
    if (sec.classList.contains('open')) {
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // About
  document.getElementById('aboutTitle').textContent = C.about.title.replace(/\\n/g, '\n');
  document.getElementById('aboutBio').innerHTML = renderMarkdown(C.about.bio);
  document.getElementById('aboutPhoto').src = C.about.photo;
  const svcList = document.getElementById('servicesList');
  C.about.services.forEach(s => {
    const li = document.createElement('li'); li.textContent = s; svcList.appendChild(li);
  });
  const cliList = document.getElementById('clientsList');
  C.about.clients.forEach(c => {
    const li = document.createElement('li'); li.textContent = c; cliList.appendChild(li);
  });

  // Contact heading
  const ch = document.getElementById('contactHeading');
  if (ch) ch.textContent = C.contact.heading || "Let's talk";

  // Footer links
  const fl = document.getElementById('footerLinks');
  if (fl) {
    if (C.contact.instagram) {
      const a = document.createElement('a');
      a.href = C.contact.instagram; a.target = '_blank';
      a.textContent = 'INSTAGRAM'; fl.appendChild(a);
    }
    if (C.contact.linkedin) {
      const a = document.createElement('a');
      a.href = C.contact.linkedin; a.target = '_blank';
      a.textContent = 'LINKEDIN'; fl.appendChild(a);
    }
    if (C.contact.twitter) {
      const a = document.createElement('a');
      a.href = C.contact.twitter; a.target = '_blank';
      a.textContent = 'TWITTER'; fl.appendChild(a);
    }
  }

  // 微信按钮
  const wechatBtn = document.getElementById('wechatBtn');
  if (wechatBtn && C.contact.wechat) {
    wechatBtn.style.display = 'flex';
    document.getElementById('wechatId').textContent = C.contact.wechat;
    const qrImg = document.getElementById('wechatQRImg');
    if (C.contact.wechatQR) {
      qrImg.src = C.contact.wechatQR;
    } else {
      qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(C.contact.wechat);
    }
  }

  const addrEl = document.getElementById('footerAddress');
  if (addrEl) addrEl.innerHTML = (C.contact.location || '').replace(', ', '<br>');

  const taglineEl = document.getElementById('footerTagline');
  if (taglineEl) taglineEl.textContent = (C.footer.tagline || '').replace(/\\n/g, '\n');

  const copyrightEl = document.getElementById('footerCopyright');
  if (copyrightEl) copyrightEl.textContent = (C.copyright || '©2026') + ' ' + C.name;

  const cta = document.getElementById('footerCta');
  if (cta) {
    cta.textContent = C.footer.cta || "Let's connect";
    cta.href = 'mailto:' + (C.contact.email || '');
  }
}

// ============ 1c. 微信浮层 ============
function openWechat() {
  document.getElementById('wechatOverlay').classList.add('open');
}
function closeWechat() {
  document.getElementById('wechatOverlay').classList.remove('open');
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeWechat();
});

// ============ 1d. 联系表单提交 ============
async function submitContact(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('cfBtn');
  const successEl = document.getElementById('cfSuccess');
  const errorEl = document.getElementById('cfError');

  btn.disabled = true;
  btn.textContent = 'SENDING...';
  successEl.style.display = 'none';
  errorEl.style.display = 'none';

  const data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    company: form.company.value.trim(),
    message: form.message.value.trim(),
  };

  try {
    const r = await fetch('https://ava-portfolio-backend-production.up.railway.app/api/portfolio/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const res = await r.json();
    if (res.ok) {
      successEl.style.display = 'block';
      form.reset();
    } else {
      errorEl.textContent = res.error || 'Something went wrong.';
      errorEl.style.display = 'block';
    }
  } catch {
    errorEl.textContent = 'Network error. Please try again.';
    errorEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'SEND MESSAGE';
  }
}

// ============ 1b. Hero 名字扫光动画 ============
// 效果：白色光束从左向右扫过名字，左边亮起后保持白色，右边还是暗色

function animateNameReveal() {
  const spans = document.querySelectorAll('.hero-name-text');
  if (!spans.length) return;

  const delay   = 300;   // 开始前等待 ms
  const duration = 1000; // 每个词扫完需要 ms
  const stagger  = 120;  // 每个词错开 ms

  spans.forEach((span, i) => {
    let startTime = null;
    const wordDelay = delay + i * stagger;

    function step(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime - wordDelay;
      if (elapsed < 0) { requestAnimationFrame(step); return; }

      // pct: -10% → 110%，范围 120%
      const pct = Math.min((elapsed / duration) * 120 - 10, 110);
      span.style.setProperty('--reveal-pct', pct + '%');

      // 扫完后固定为纯白色（background 变成全白）
      if (pct >= 108) {
        span.style.background = 'none';
        span.style.webkitTextFillColor = '#ffffff';
        span.style.color = '#ffffff';
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// ============ 2. 自定义光标 ============
// 默认：小白点（cursor-dot）跟随鼠标
// Works 区域：换成自定义图标（cursor），隐藏小点

const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0;
let dotX = 0, dotY = 0;
let iconX = 0, iconY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
});

function animateCursor() {
  // 小点：即时跟随
  dotX += (mouseX - dotX) * 0.9;
  dotY += (mouseY - dotY) * 0.9;
  cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;

  // 图标光标：轻微 lerp 跟随（稍有延迟感）
  iconX += (mouseX - iconX) * 0.18;
  iconY += (mouseY - iconY) * 0.18;
  cursor.style.transform = `translate(${iconX}px, ${iconY}px) translate(-50%, -50%)`;

  requestAnimationFrame(animateCursor);
}
animateCursor();

// Works 区域：进入时显示图标光标，隐藏小点
function initWorksCursor() {
  const worksSection = document.getElementById('works');
  worksSection.addEventListener('mouseenter', () => {
    cursor.classList.add('visible');
    cursorDot.style.opacity = '0';
  });
  worksSection.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
    cursorDot.style.opacity = '1';
  });
}

// ============ 3. Hero 鼠标图片轨迹效果 ⭐⭐⭐ ============
// 真实原理（逆向自 Framer Cursor Image Trail 插件）：
// - 鼠标移动时，每隔 FREQUENCY px 距离，在当前鼠标位置"印下"一张图片
// - 图片出现：opacity 0→1，scale 0.5→1，blur 8px→0（spring 动画）
// - 图片固定在印下时的位置（不跟随鼠标！是轨迹残像）
// - VISIBLE_FOR 秒后：opacity→0，scale→0.5，blur→8px（消失）

function lerp(a, b, t) { return a + (b - a) * t; }

// 原网站参数（逆向自 Framer 源码）：
//   frequency=50 → 距离阈值≈1px（非常密）
//   visibleFor=1s
//   spring: stiffness=300, damping=30
//   in:  opacity 0→1, scale 0.5→1, blur 8→0
//   out: opacity 1→0, scale 1→0.5, blur 0→8
//
// 本实现调整：
//   - 图片尺寸 260×185px
//   - 距离阈值 = 图片宽度 * 0.52 ≈ 135px，确保相邻图片重叠 < 50%
//   - spring 用 CSS cubic-bezier 近似：cubic-bezier(0.34,1.56,0.64,1) 带轻微弹性超出

const TRAIL_IMG_W     = 208;   // 图片宽 px（260 * 0.8）
const TRAIL_IMG_H     = 148;   // 图片高 px（185 * 0.8）
const TRAIL_MIN_DIST  = Math.round(TRAIL_IMG_W * 0.52);  // ≈135px，相邻重叠<50%
const TRAIL_VISIBLE_MS = 600;  // 图片停留 ms，600ms 后开始消失
// spring(300,30) 近似贝塞尔：带一点弹性超量的快速回落
const SPRING_IN  = 'cubic-bezier(0.34, 1.56, 0.64, 1)';  // 弹入（稍微超出再回）
const SPRING_OUT = 'cubic-bezier(0.55, 0, 1, 0.45)';      // 快速收缩退出
const ENTER_MS   = 420;   // 进入动画时长
const EXIT_MS    = 380;   // 退出动画时长

function initHeroImages() {
  const hero   = document.getElementById('hero');
  const C      = window.__siteConfig || SITE_CONFIG;
  // 优先使用独立配置的 heroImages，否则降级到项目封面图
  const images = (C.heroImages && C.heroImages.length)
    ? C.heroImages.filter(Boolean)
    : C.projects.map(p => p.image).filter(Boolean);
  if (!images.length) return;

  // 预加载图片，避免首次出现时闪烁
  images.forEach(src => { const img = new Image(); img.src = src; });

  const container = document.createElement('div');
  container.style.cssText =
    'position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
  hero.appendChild(container);

  let lastX = -9999, lastY = -9999;
  let imgIndex = 0;
  let zBase = 10;

  function spawnCard(x, y) {
    const imgSrc = images[imgIndex % images.length];
    imgIndex++;
    const rot = (Math.random() - 0.5) * 22; // -11° ~ +11°

    const card = document.createElement('div');
    card.style.cssText = `
      position: absolute;
      width: ${TRAIL_IMG_W}px;
      height: ${TRAIL_IMG_H}px;
      left: ${x - TRAIL_IMG_W / 2}px;
      top:  ${y - TRAIL_IMG_H / 2}px;
      border-radius: 8px;
      pointer-events: none;
      background: url(${imgSrc}) center / cover no-repeat;
      z-index: ${zBase++};
      will-change: opacity, transform, filter;
      /* 初始状态：透明 + 缩小 + 模糊 */
      opacity: 0;
      transform: rotate(${rot}deg) scale(0.5);
      filter: blur(8px);
    `;
    container.appendChild(card);

    // ── 进入动画：下一帧切换到终态，transition 驱动 spring 效果 ──
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {            // 双 rAF 确保初始样式已渲染
        card.style.transition = `
          opacity  ${ENTER_MS}ms ${SPRING_IN},
          transform ${ENTER_MS}ms ${SPRING_IN},
          filter   ${ENTER_MS}ms ${SPRING_IN}
        `;
        card.style.opacity   = '1';
        card.style.transform = `rotate(${rot}deg) scale(1)`;
        card.style.filter    = 'blur(0px)';
      });
    });

    // ── 停留后退出动画 ──
    setTimeout(() => {
      card.style.transition = `
        opacity  ${EXIT_MS}ms ${SPRING_OUT},
        transform ${EXIT_MS}ms ${SPRING_OUT},
        filter   ${EXIT_MS}ms ${SPRING_OUT}
      `;
      card.style.opacity   = '0';
      card.style.transform = `rotate(${rot}deg) scale(0.5)`;
      card.style.filter    = 'blur(8px)';
      setTimeout(() => card.remove(), EXIT_MS + 50);
    }, TRAIL_VISIBLE_MS);
  }

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dist = Math.hypot(x - lastX, y - lastY);
    if (dist >= TRAIL_MIN_DIST) {
      spawnCard(x, y);
      lastX = x; lastY = y;
    }
  });
}

// Works 已改为图片卡片网格，不再需要悬浮预览层
function initProjectPreview() {
  const preview = document.getElementById('projectPreview');
  if (preview) preview.style.display = 'none';
}

// ============ 4. 导航滚动效果 ============

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ============ 5. Hero 视差 ============

const heroContent = document.querySelector('.hero-content');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y < window.innerHeight && heroContent) {
    heroContent.style.transform = `translateY(${y * 0.3}px)`;
    heroContent.style.opacity = 1 - y / (window.innerHeight * 0.7);
  }
}, { passive: true });

// ============ 6. 滚动淡入（IntersectionObserver）============

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .project-card, .about-photo-wrap').forEach(el => {
    observer.observe(el);
  });
}

// ============ 7. 启动 ============

// ============ 8. 滚动（使用原生滚动，不拦截）============
function initSmoothScroll() {
  // 不做任何处理，使用浏览器原生滚动行为
}

document.addEventListener('DOMContentLoaded', async () => {
  // 优先用 site_config.json，fallback 到 config.js
  window.__siteConfig = await loadSiteConfig();
  renderSite();
  initHeroImages();    // Hero 鼠标跟随多图 ⭐
  initWorksCursor();   // Works 区自定义图标光标
  initProjectPreview();
  initReveal();
  initSmoothScroll();  // 惯性缓停滚动
});
