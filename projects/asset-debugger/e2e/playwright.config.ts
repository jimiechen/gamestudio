import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright 配置文件
 * 每个步骤自动截图和视频保存作为测试证据
 */
export default defineConfig({
  testDir: './tests',
  
  /* 并行执行 */
  fullyParallel: false, // 最小集合测试串行执行，确保截图顺序
  
  /* 失败时重试 */
  retries: 0,
  
  /*  workers 数量 */
  workers: 1,
  
  /* 报告器 */
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  /* 共享配置 */
  use: {
    /* 基础 URL */
    baseURL: 'http://localhost:5000',
    
    /* 浏览器配置 */
    headless: false, // 显示浏览器便于调试
    viewport: { width: 1280, height: 720 },
    
    /* 截图配置 - 每个步骤自动截图 */
    screenshot: 'on',
    
    /* 视频录制 - 始终录制视频 */
    video: 'on',
    
    /* 跟踪 - 失败时保留 */
    trace: 'retain-on-failure',
    
    /* 超时 */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* 项目配置 */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 500, // 慢动作便于观察
        }
      },
    },
  ],

  /* 截图输出目录 */
  outputDir: path.join(__dirname, 'screenshots'),
});
