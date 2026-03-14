// ============================================
// AVA WANG 个人网站配置文件
// 所有需要修改的内容都在这里！
// ============================================

const SITE_CONFIG = {

  // ----------------------------------------
  // 基本信息
  // ----------------------------------------
  name: "AVA WANG",
  nameDisplay: "AVA\nWANG",          // Hero 大字，\n 换行
  tagline: "Shanghai based creative director specializing in branding & visual storytelling in expressive forms.",
  // ↑ 修改这里改副标题

  copyright: "©2026",

  // ----------------------------------------
  // 导航链接
  // ----------------------------------------
  nav: [
    { label: "WORK",    href: "#works"   },
    { label: "ABOUT",   href: "#about"   },
    { label: "CONTACT", href: "#contact" },
  ],

  // ----------------------------------------
  // 项目列表
  // 替换图片方法：把 image 改成你的图片路径
  // 例如: image: "images/project-1.jpg"
  // 建议把图片放在 /home/admin/ava-portfolio/images/ 文件夹里
  // ----------------------------------------
  projects: [
    {
      id: 1,
      title: "Brand Identity Redesign",
      category: "BRANDING",
      image: "https://picsum.photos/700/500?random=11",
      // image: "images/project-1.jpg",  // ← 替换为你的图片
      link: "#",   // ← 替换为项目详情页链接
    },
    {
      id: 2,
      title: "Visual Campaign 2026",
      category: "ART DIRECTION",
      image: "https://picsum.photos/700/500?random=22",
      // image: "images/project-2.jpg",  // ← 替换为你的图片
      link: "#",
    },
    {
      id: 3,
      title: "Packaging & Identity",
      category: "PACKAGING",
      image: "https://picsum.photos/700/500?random=33",
      // image: "images/project-3.jpg",  // ← 替换为你的图片
      link: "#",
    },
    {
      id: 4,
      title: "Digital Experience Design",
      category: "UX/UI",
      image: "https://picsum.photos/700/500?random=44",
      // image: "images/project-4.jpg",  // ← 替换为你的图片
      link: "#",
    },
    {
      id: 5,
      title: "Brand Strategy & Naming",
      category: "STRATEGY",
      image: "https://picsum.photos/700/500?random=55",
      // image: "images/project-5.jpg",  // ← 替换为你的图片
      link: "#",
    },
    {
      id: 6,
      title: "Editorial & Typography",
      category: "EDITORIAL",
      image: "https://picsum.photos/700/500?random=66",
      // image: "images/project-6.jpg",  // ← 替换为你的图片
      link: "#",
    },
  ],

  // ----------------------------------------
  // 关于我
  // ----------------------------------------
  about: {
    title: "Hello there\nI'm Ava Wang",   // \n 换行
    bio: "Specializing in branding and creative direction, I bring a distinctive, expressive flair to every project. With a keen eye for bold visual storytelling, my work spans brand identity, packaging, and digital design — crafting compelling experiences that resonate and leave a lasting impression.",
    // ↑ 修改这里改个人简介

    photo: "https://picsum.photos/480/620?random=99",
    // photo: "images/avatar.jpg",  // ← 替换为你的照片

    services: [
      "Creative Direction",
      "Brand Identity",
      "Packaging",
      "Art Direction",
      "Brand Strategy",
      "Copywriting",
      "Digital Design",
      "UX/UI Design",
    ],
    // ↑ 修改这里改服务列表

    clients: [
      "Nike",
      "Adidas",
      "Hermès",
      "Burberry",
      "Google",
      "Instagram",
      "Estée Lauder",
    ],
    // ↑ 修改这里改客户列表
  },

  // ----------------------------------------
  // 联系方式 — 修改这里
  // ----------------------------------------
  contact: {
    heading: "Let's talk",
    email: "hello@avawang.com",         // ← 改成你的邮箱
    instagram: "https://instagram.com", // ← 改成你的 Instagram 链接（留空则不显示）
    linkedin:  "https://linkedin.com",  // ← 改成你的 LinkedIn 链接
    twitter:   "",                       // ← 留空则不显示
    location:  "Shanghai, China",       // ← 地址
  },

  // ----------------------------------------
  // Footer
  // ----------------------------------------
  footer: {
    tagline: "Do you like\nWhat you see?",  // 右侧文字
    cta:     "Let's connect",
  },

};
