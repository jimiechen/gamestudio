/**
 * 测试辅助函数
 * 包含截图和视频功能作为测试证据存档
 * 所有步骤名称必须使用中文
 */

import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// 截图保存目录
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

/**
 * 确保截图目录存在
 */
export function ensureScreenshotDir(): void {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

/**
 * 生成截图文件名
 * @param testName 测试名称
 * @param stepName 步骤名称（中文）
 * @param timestamp 时间戳
 */
export function generateScreenshotName(
  testName: string,
  stepName: string,
  timestamp: string = new Date().toISOString().replace(/[:.]/g, '-')
): string {
  const safeTestName = testName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  // 步骤名称保持中文
  const safeStepName = stepName.replace(/[\/\\:*?"<>|]/g, '_');
  return `${safeTestName}_${safeStepName}_${timestamp}.png`;
}

/**
 * 保存测试步骤截图
 * @param page Playwright 页面对象
 * @param testName 测试名称
 * @param stepName 步骤名称（中文）
 * @param description 步骤描述（中文，可选）
 */
export async function saveStepScreenshot(
  page: Page,
  testName: string,
  stepName: string,
  description?: string
): Promise<string> {
  ensureScreenshotDir();
  
  const filename = generateScreenshotName(testName, stepName);
  const filepath = path.join(SCREENSHOT_DIR, filename);
  
  // 保存截图
  await page.screenshot({
    path: filepath,
    fullPage: true,
  });
  
  // 如果有描述，同时保存描述文件
  if (description) {
    const descFilepath = filepath.replace('.png', '.txt');
    fs.writeFileSync(descFilepath, description, 'utf-8');
  }
  
  console.log(`[截图已保存] ${filepath}`);
  return filepath;
}

/**
 * 保存元素截图
 * @param page Playwright 页面对象
 * @param testName 测试名称
 * @param stepName 步骤名称（中文）
 * @param selector 元素选择器
 */
export async function saveElementScreenshot(
  page: Page,
  testName: string,
  stepName: string,
  selector: string
): Promise<string> {
  ensureScreenshotDir();
  
  const filename = generateScreenshotName(testName, `${stepName}_元素截图`);
  const filepath = path.join(SCREENSHOT_DIR, filename);
  
  const element = page.locator(selector);
  await element.screenshot({ path: filepath });
  
  console.log(`[元素截图已保存] ${filepath}`);
  return filepath;
}

/**
 * 延迟等待 (带截图)
 * @param page Playwright 页面对象
 * @param ms 延迟毫秒数
 * @param testName 测试名称
 * @param stepName 步骤名称（中文）
 */
export async function delayWithScreenshot(
  page: Page,
  ms: number,
  testName: string,
  stepName: string
): Promise<void> {
  await page.waitForTimeout(ms);
  await saveStepScreenshot(page, testName, `${stepName}_等待${ms}毫秒后`);
}

/**
 * 等待元素并截图
 * @param page Playwright 页面对象
 * @param selector 元素选择器
 * @param testName 测试名称
 * @param stepName 步骤名称（中文）
 */
export async function waitForSelectorWithScreenshot(
  page: Page,
  selector: string,
  testName: string,
  stepName: string
): Promise<void> {
  await page.waitForSelector(selector);
  await saveStepScreenshot(page, testName, stepName);
}

/**
 * 点击元素并截图
 * @param page Playwright 页面对象
 * @param selector 元素选择器
 * @param testName 测试名称
 * @param stepName 步骤名称（中文）
 */
export async function clickWithScreenshot(
  page: Page,
  selector: string,
  testName: string,
  stepName: string
): Promise<void> {
  await saveStepScreenshot(page, testName, `${stepName}_点击前`);
  await page.click(selector);
  await saveStepScreenshot(page, testName, `${stepName}_点击后`);
}

/**
 * 填写表单并截图
 * @param page Playwright 页面对象
 * @param selector 元素选择器
 * @param value 填写值
 * @param testName 测试名称
 * @param stepName 步骤名称（中文）
 */
export async function fillWithScreenshot(
  page: Page,
  selector: string,
  value: string,
  testName: string,
  stepName: string
): Promise<void> {
  await page.fill(selector, value);
  await saveStepScreenshot(page, testName, `${stepName}_填写值为_${value.substring(0, 20)}`);
}

/**
 * 选择下拉框并截图
 * @param page Playwright 页面对象
 * @param selector 元素选择器
 * @param value 选择值
 * @param testName 测试名称
 * @param stepName 步骤名称（中文）
 */
export async function selectWithScreenshot(
  page: Page,
  selector: string,
  value: string,
  testName: string,
  stepName: string
): Promise<void> {
  await page.selectOption(selector, value);
  await saveStepScreenshot(page, testName, `${stepName}_选择_${value}`);
}

/**
 * 勾选/取消勾选并截图
 * @param page Playwright 页面对象
 * @param selector 元素选择器
 * @param checked 是否勾选
 * @param testName 测试名称
 * @param stepName 步骤名称（中文）
 */
export async function checkWithScreenshot(
  page: Page,
  selector: string,
  checked: boolean,
  testName: string,
  stepName: string
): Promise<void> {
  if (checked) {
    await page.check(selector);
  } else {
    await page.uncheck(selector);
  }
  await saveStepScreenshot(page, testName, `${stepName}_${checked ? '已勾选' : '已取消勾选'}`);
}

/**
 * 获取截图目录路径
 */
export function getScreenshotDir(): string {
  return SCREENSHOT_DIR;
}

/**
 * 清理旧截图 (保留最近24小时)
 */
export function cleanOldScreenshots(): void {
  if (!fs.existsSync(SCREENSHOT_DIR)) return;
  
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  fs.readdirSync(SCREENSHOT_DIR).forEach(file => {
    const filepath = path.join(SCREENSHOT_DIR, file);
    const stats = fs.statSync(filepath);
    
    if (now - stats.mtime.getTime() > oneDay) {
      fs.unlinkSync(filepath);
      console.log(`[已删除旧截图] ${file}`);
    }
  });
}
