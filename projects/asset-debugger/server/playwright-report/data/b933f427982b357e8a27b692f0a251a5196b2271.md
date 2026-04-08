# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: prompt-presets.spec.js >> 提示词预设功能 E2E 验收测试 >> TC-P08 生成页-点击选择模板按钮打开选择器弹窗
- Location: e2e\prompt-presets.spec.js:190:3

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 10
Received:    9
```

# Test source

```ts
  116 |       await page.screenshot({ path: `${SCREENSHOT_DIR}/TC-P05_创建成功验证.png`, fullPage: true }).catch(() => {});
  117 |     }
  118 |   });
  119 | 
  120 |   // ========== TC-P06: 编辑预设功能 ==========
  121 |   test('TC-P06 编辑预设-修改名称并提交更新请求', async ({ page }) => {
  122 |     await page.goto(PAGE_URL);
  123 |     await page.waitForLoadState('networkidle');
  124 |     await page.locator('[data-tab="promptsLibrary"]').click();
  125 |     await page.waitForTimeout(800);
  126 | 
  127 |     const editBtns = page.locator('[data-prompt-action="editPreset"]');
  128 |     const editCount = await editBtns.count();
  129 |     expect(editCount).toBeGreaterThan(0);
  130 |     await editBtns.first().click();
  131 |     await page.waitForTimeout(300);
  132 | 
  133 |     const modal = page.locator('#promptCreateModal');
  134 |     await expect(modal).toBeVisible();
  135 | 
  136 |     const nameInput = page.locator('input[name="name"]');
  137 |     const currentName = await nameInput.inputValue();
  138 |     await nameInput.fill(currentName + '-已编辑-E2E');
  139 |     await page.fill('input[name="description"]', 'E2E编辑测试-' + new Date().toISOString());
  140 | 
  141 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/TC-P06_编辑预设表单.png` });
  142 | 
  143 |     page.once('dialog', async d => { await d.accept(); });
  144 |     const updateRespPromise = page.waitForResponse(resp =>
  145 |       resp.url().includes('/api/presets/') && resp.request().method() === 'PUT'
  146 |     , { timeout: 10000 }).catch(() => null);
  147 | 
  148 |     await page.locator('[data-prompt-action="submitCreate"]').click();
  149 |     await page.waitForTimeout(1000);
  150 | 
  151 |     const updateResp = await updateRespPromise;
  152 |     if (updateResp) {
  153 |       console.log(`[TC-P06] PASS: PUT API调用成功 status=${updateResp.status()}`);
  154 |     } else {
  155 |       console.log('[TC-P06] WARN: PUT响应未捕获');
  156 |     }
  157 | 
  158 |     if (!page.isClosed()) {
  159 |       await page.screenshot({ path: `${SCREENSHOT_DIR}/TC-P06_编辑完成.png`, fullPage: true }).catch(() => {});
  160 |     }
  161 |   });
  162 | 
  163 |   // ========== TC-P07: 删除预设功能 ==========
  164 |   test('TC-P07 删除预设-点击删除按钮触发确认和API调用', async ({ page }) => {
  165 |     await page.goto(PAGE_URL);
  166 |     await page.waitForLoadState('networkidle');
  167 |     await page.locator('[data-tab="promptsLibrary"]').click();
  168 |     await page.waitForTimeout(800);
  169 | 
  170 |     const deleteBtns = page.locator('[data-prompt-action="deletePreset"]');
  171 |     const deleteCount = await deleteBtns.count();
  172 |     expect(deleteCount).toBeGreaterThan(0);
  173 | 
  174 |     let dialogHandled = false;
  175 |     page.on('dialog', async dialog => {
  176 |       dialogHandled = true;
  177 |       const msg = dialog.message();
  178 |       console.log(`[TC-P07] Dialog message: "${msg}"`);
  179 |       await dialog.accept();
  180 |     });
  181 | 
  182 |     await deleteBtns.last().click();
  183 |     await page.waitForTimeout(1500);
  184 | 
  185 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/TC-P07_删除完成.png`, fullPage: true }).catch(() => {});
  186 |     console.log(`[TC-P07] PASS: 删除流程执行完毕, dialogHandled=${dialogHandled}`);
  187 |   });
  188 | 
  189 |   // ========== TC-P08: 生成页-选择器弹窗打开与分类Tab ==========
  190 |   test('TC-P08 生成页-点击选择模板按钮打开选择器弹窗', async ({ page }) => {
  191 |     await page.goto(PAGE_URL);
  192 |     await page.waitForLoadState('networkidle');
  193 | 
  194 |     const promptSelectBtn = page.locator('[data-prompt-action="openSelector"][data-target="prompt"]');
  195 |     await expect(promptSelectBtn).toBeVisible();
  196 |     await expect(promptSelectBtn).toContainText('选择模板');
  197 | 
  198 |     await promptSelectBtn.click();
  199 |     await page.waitForTimeout(1000);
  200 | 
  201 |     const modal = page.locator('#promptSelectorModal');
  202 |     await expect(modal).toBeVisible();
  203 | 
  204 |     const categoryTabs = page.locator('#promptCategoryTabs');
  205 |     await expect(categoryTabs).toBeVisible();
  206 | 
  207 |     const tabButtons = categoryTabs.locator('button');
  208 |     const tabCount = await tabButtons.count();
  209 |     expect(tabCount).toBe(7);
  210 | 
  211 |     const cardsGrid = page.locator('#promptCardsGrid');
  212 |     await expect(cardsGrid).toBeVisible();
  213 | 
  214 |     const cards = cardsGrid.locator('.prompt-card');
  215 |     const cardCount = await cards.count();
> 216 |     expect(cardCount).toBeGreaterThanOrEqual(10);
      |                       ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  217 | 
  218 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/TC-P08_选择器弹窗打开.png`, fullPage: true });
  219 |     console.log(`[TC-P08] PASS: 选择器弹窗打开, ${tabCount}个分类Tab, ${cardCount}张预设卡片`);
  220 |   });
  221 | 
  222 |   // ========== TC-P09: 选择器-应用预设到正向提示词 ==========
  223 |   test('TC-P09 选择器-点击应用按钮将预设填入正向提示词textarea', async ({ page }) => {
  224 |     await page.goto(PAGE_URL);
  225 |     await page.waitForLoadState('networkidle');
  226 | 
  227 |     await page.locator('[data-prompt-action="openSelector"][data-target="prompt"]').click();
  228 |     await page.waitForTimeout(1000);
  229 | 
  230 |     const firstCard = page.locator('#promptCardsGrid .prompt-card').first();
  231 |     const firstApplyBtn = firstCard.locator('[data-prompt-action="applyPreset"]').first();
  232 |     await expect(firstApplyBtn).toBeVisible();
  233 | 
  234 |     page.once('dialog', async d => { await d.accept(); });
  235 |     await firstApplyBtn.click();
  236 |     await page.waitForTimeout(800);
  237 | 
  238 |     const promptValue = await page.locator('#prompt').inputValue();
  239 |     expect(promptValue.length).toBeGreaterThan(5);
  240 | 
  241 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/TC-P09_应用到正向提示词.png` });
  242 |     console.log(`[TC-P09] PASS: 正向提示词已填充, 长度=${promptValue.length}字符`);
  243 |   });
  244 | 
  245 |   // ========== TC-P10: 选择器-分类筛选功能 ==========
  246 |   test('TC-P10 选择器-切换分类Tab过滤预设卡片', async ({ page }) => {
  247 |     await page.goto(PAGE_URL);
  248 |     await page.waitForLoadState('networkidle');
  249 | 
  250 |     await page.locator('[data-prompt-action="openSelector"][data-target="prompt"]').click();
  251 |     await page.waitForTimeout(1000);
  252 | 
  253 |     const allCards = page.locator('#promptCardsGrid .prompt-card');
  254 |     const allCount = await allCards.count();
  255 | 
  256 |     await page.locator('[data-prompt-action="switchCategory"][data-category="character"]').click();
  257 |     await page.waitForTimeout(800);
  258 | 
  259 |     const filteredCards = page.locator('#promptCardsGrid .prompt-card');
  260 |     const filteredCount = await filteredCards.count();
  261 | 
  262 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/TC-P10_分类筛选角色.png` });
  263 |     console.log(`[TC-P10] PASS: 分类筛选: 全部${allCount}条 → 角色类${filteredCount}条`);
  264 |   });
  265 | 
  266 |   // ========== TC-P11: 选择器-搜索功能 ==========
  267 |   test('TC-P11 选择器-搜索栏输入关键词过滤卡片', async ({ page }) => {
  268 |     await page.goto(PAGE_URL);
  269 |     await page.waitForLoadState('networkidle');
  270 | 
  271 |     await page.locator('[data-prompt-action="openSelector"][data-target="prompt"]').click();
  272 |     await page.waitForTimeout(1000);
  273 | 
  274 |     await page.locator('#promptSearchInput').fill('质量');
  275 |     await page.locator('#promptSelectorModal [data-prompt-action="searchPresets"]').click();
  276 |     await page.waitForTimeout(800);
  277 | 
  278 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/TC-P11_搜索质量结果.png` });
  279 |     console.log('[TC-P11] PASS: 搜索"质量"执行成功');
  280 |   });
  281 | 
  282 |   // ========== TC-P12: 反向提示词选择器 ==========
  283 |   test('TC-P12 反向提示词-从选择器打开并展示预设卡片', async ({ page }) => {
  284 |     await page.goto(PAGE_URL);
  285 |     await page.waitForLoadState('networkidle');
  286 | 
  287 |     const negSelectBtn = page.locator('[data-prompt-action="openSelector"][data-target="negativePrompt"]');
  288 |     await expect(negSelectBtn).toBeVisible();
  289 | 
  290 |     await negSelectBtn.click();
  291 |     await page.waitForTimeout(1000);
  292 | 
  293 |     const negCards = page.locator('#promptCardsGrid .prompt-card');
  294 |     const negCardCount = await negCards.count();
  295 |     expect(negCardCount).toBeGreaterThan(0);
  296 | 
  297 |     const firstNegCardText = await negCards.first().textContent();
  298 |     expect(firstNegCardText.length).toBeGreaterThan(5);
  299 | 
  300 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/TC-P12_反向提示词应用.png` });
  301 |     console.log(`[TC-P12] PASS: 反向提示词选择器打开, 显示${negCardCount}张卡片`);
  302 |   });
  303 | 
  304 |   // ========== TC-P13: 应用模式切换（替换vs追加） ==========
  305 |   test('TC-P13 应用模式-替换模式和追加模式切换', async ({ page }) => {
  306 |     await page.goto(PAGE_URL);
  307 |     await page.waitForLoadState('networkidle');
  308 | 
  309 |     await page.locator('#prompt').fill('原始提示词内容');
  310 | 
  311 |     await page.locator('[data-prompt-action="openSelector"][data-target="prompt"]').click();
  312 |     await page.waitForTimeout(1000);
  313 | 
  314 |     const replaceMode = page.locator('[data-prompt-action="switchApplyMode"][data-mode="replace"]');
  315 |     const appendMode = page.locator('[data-prompt-action="switchApplyMode"][data-mode="append"]');
  316 |     await expect(replaceMode).toBeVisible();
```