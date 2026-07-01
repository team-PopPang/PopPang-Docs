import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  base: '/PopPang-Docs/',
  globalStyles: path.join(__dirname, 'theme/index.css'),
  lang: 'ko',
  title: '팝팡 개발자 가이드',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-icon.png',
    dark: '/rspress-icon.png',
  },
  themeConfig: {
    darkMode: false, // 다크모드
    showNavDivider: false, // 상단 네비게이션바 가로줄
    showSidebarDivider: false, // 사이드바 구분선
    searchPlaceholderText: '검색',
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/team-PopPang',
      },
    ],
  },
});
