/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'TripCraft';
const isUserSite = repoName.toLowerCase().endsWith('.github.io');
const defaultBasePath = isGithubPages && !isUserSite ? `/${repoName}` : '';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined ? process.env.NEXT_PUBLIC_BASE_PATH : defaultBasePath;

const nextConfig = {
  // 纯静态导出（SSG），可部署至 GitHub Pages / Cloudflare Pages，构建后可脱机预览。
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
  trailingSlash: true,
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
