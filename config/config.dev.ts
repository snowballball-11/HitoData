// https://umijs.org/config/
import { defineConfig } from '@umijs/max';

export default defineConfig({
  publicPath: '/',
  define: {
    API_URL: "http://60.10.135.150:23739",
    ERD_API_URL: "http://60.10.135.150:23739",
  },
  // Fast Refresh 热更新
  fastRefresh: true,
  title:'HitoData',
  mfsu: {
    exclude :['@playwright/test']
  },
});
