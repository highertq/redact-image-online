# RedactMy.pics — SEO 诊断与增长策略

**诊断日期:** 2026-10-25
**被诊断对象:** https://redactmy.pics（生产环境，实测）+ `src/` 源码
**核心关键词目标:** `redact image online`（美国市场，英文）
**约束:** 遵守 PROJECT.md —— 不加统计/追踪脚本、不加未点名的依赖、图片不出设备

---

## 执行状态（2026-10-25 已落地）

Phase 0 技术补洞 + Phase 1 场景页 + Phase 2 信任页已全部完成并本地验证通过。

| 项目 | 修复前 | 修复后 |
|---|---|---|
| 可索引 URL | 3 | **16** |
| og:image / twitter 大图卡 | 无 | 全站 16 页均有，1200×630 |
| manifest / apple-touch-icon | 404 | 已提供 |
| 站点级结构化数据 | 无 | WebSite + Organization |
| 内容页结构化数据 | 无 | BreadcrumbList + Article（逐页） |
| 内链结构 | 仅 footer 两条 | hub→spoke，无孤儿页 |
| 页面正文词数（最低） | 222 | 312（/privacy，工具型页面正常） |
| 场景页词数 | — | 1342–1564 |
| 指南页词数 | — | 840–1173 |
| lint / test / build | 通过 | 通过（160 测试） |

**未做且不建议做**：补 `aggregateRating`。没有真实评分就编一个，违反 Google 结构化数据政策。宁可拿不到 SoftwareApplication 富媒体。

**执行细节**：
- 内容存在 `src/lib/content/`，页面由数据驱动渲染；新增页面只需加一条记录，sitemap 与内链自动跟随。
- `/guides` 一开始是孤儿页（0 入链），已通过页脚「All guides」修复。
- 构建期数据校验抓出一个真实 bug：指南的 `related` 字段混入了场景页 slug，导致 `/guides/remove-exif` 预渲染失败。已拆分为 `related`（指南互链）与 `relatedScenarios`（指南→场景）。
- 所有 16 页 title ≤65 字符、description ≤160 字符、H1 唯一、canonical 自引用，脚本逐页核验无失败项。
- 内容页只加载 7 个 JS，编辑器 bundle 未被带入；首页首屏 tesseract 仍不在初始 HTML 中。

**仍需你手动做**（代码层面已就绪，无法代劳）：
1. GSC → 重新提交 sitemap（从 3 条变 16 条），并对 6 个场景页逐个「请求编入索引」。
2. Bing Webmaster → 先 Add site 到 `https://redactmy.pics` 并验证，再提交 sitemap（上次是在 china-study-tour 属性下提交的）。
3. 部署后确认 `https://redactmy.pics/og-image.png` 返回 200。
4. 用 Facebook Sharing Debugger / Twitter Card Validator 各刷一次缓存，确认大图卡出图。

---

## 一、结论先行

**你的问题不是"SEO 没做好"，是"网站太新、页面太少"。这两件事的解法完全不同。**

三条硬事实：

1. **域名注册于 2026-10-25 13:33 UTC —— 就是今天。** WHOIS `Creation Date` 与首个 commit（2026-10-25 20:49 +0800）互相印证。所谓"自然搜索流量不足"，准确说法是**流量必然为零**：Google 从发现新域名到给出稳定排名，正常需要 3–6 个月，且新站有沙盒期观察。这跟你写得好不好无关。
2. **技术 SEO 目前是合格甚至优秀的。** 我逐项实测了 14 个技术项，12 项直接通过（见第二节）。在这个站上继续抠技术细节，边际收益接近零。
3. **真正的瓶颈是内容规模。** 目前全站只有 **3 个可索引 URL**。竞品 happyimg.com 的 sitemap 有 **1270 个 URL**，且他们用"16 个按场景细分的打码工具页"把你主关键词的每一个长尾都吃掉了。你 3 页对 1270 页，抢同一个词，这是结构性必输。

**所以策略重心：不碰技术，全力堆"有真实差异化的场景页"，用长尾绕过头部词。**

---

## 二、技术体检结果（实测，非推断）

### 2.1 已通过 —— 不要动

| 检查项 | 实测结果 | 判定 |
|---|---|---|
| robots.txt | `Allow: /` + Sitemap 声明，正确 | ✅ |
| sitemap.xml | 3 条 URL，lastmod/changefreq 齐全 | ✅ |
| canonical | 首页 `/about` `/privacy` 均自引用正确 | ✅ |
| H1 | 全站唯一，含主关键词 | ✅ |
| SSR 正文 | 首页 HTML 内含 899 词真实文本，非空壳 | ✅ |
| 404 | 返回真实 HTTP 404（不是软 404） | ✅ |
| www → apex | 307 重定向到 `redactmy.pics` | ✅ |
| http → https | 308 永久重定向 | ✅ |
| HSTS | `max-age=63072000` | ✅ |
| 首屏传输体积 | **192.4 KB**（br/gzip 后，8 个 JS + 1 CSS） | ✅ 优秀 |
| tesseract.js | **未进入首屏 HTML**，动态 import 生效 | ✅ 优秀 |
| title / description | 53 / 152 字符，长度合规 | ✅ |

这套底子在独立工具站里属于上游水平。**不要重构。**

### 2.2 真实缺口（按影响排序）

| # | 问题 | 实测证据 | 影响 | 工作量 |
|---|---|---|---|---|
| 1 | **只有 3 个可索引页面** | sitemap 仅 3 条 URL | 🔴 致命 | 大 |
| 2 | **完全没有 og:image / twitter:image** | HTML 内 `og:image` 出现次数 = 0 | 🟠 高 | 小 |
| 3 | **SoftwareApplication 结构化数据当前不合格** | 有 `name` + `offers.price`，但**缺 `aggregateRating` / `review`** —— Google 要求二者必居其一 | 🟠 中 | 小 |
| 4 | **FAQPage 结构化数据已失效** | Google 于 **2026-05-07 完全下线 FAQ 富媒体结果**，2026-06 移除测试工具支持 | 🟡 低（无害） | 0 |
| 5 | twitter:card 是 `summary` 而非 `summary_large_image` | meta 实测 | 🟡 低 | 小 |
| 6 | 无 manifest / apple-touch-icon | `/manifest.webmanifest` 返回 404 | 🟡 低 | 小 |
| 7 | 首页正文无指向 /about、/privacy 的正文内链 | 仅 footer 有 | 🟡 低 | 小 |

### 2.3 两个需要你决策的约束冲突

**（A）没有测量 = 无法做 SEO。**
PROJECT.md 规定"不允许加入任何统计、广告、追踪脚本"。这条我完全尊重，但 SEO 是纯数据驱动的活，没有 Search Console 数据，我们只能盲猜关键词。

**解法（不违反约束）：Google Search Console 用 DNS TXT 方式验证，一行代码都不用改，不加载任何脚本。** 数据从 Google 侧给你，站上一个字节都不多。这是唯一既合规又能测量的路径，**Phase 0 必做**。

**（B）不要为了"看起来有排名"而伪造 aggregateRating。**
你的 SoftwareApplication schema 现在拿不到富媒体，只要补一个评分就行 —— 但编造评分违反 Google 结构化数据政策，可导致手动处罚。**正确做法：暂时不补评分，等真的有用户评价再说。** 这一项我建议主动放弃。

---

## 三、关键词策略（基于实测自动补全数据）

以下长尾是**我从 Google Suggest 实际抓取的**（2026-10-25，en-US），不是凭记忆编的。搜索量我没有可靠数据源，**不给你编数字**——Phase 0 接上 GSC 后用真实展示量校准。

### 3.1 别再死磕头部词

`redact image online` 这个词的 SERP 前五：redacted.app、redact.photo、happyimg.com、practicaltools.co、joydemo.com。全部是 DR 高、内容几百到上千页的老站。**新域名 3 页，6 个月内进不去。** 这不是策略问题，是物理问题。

把头部词当"长期品牌锚"，短期靠长尾拿第一批流量。

### 3.2 你的真实护城河是什么

对比竞品后，你有一项别人普遍没有的组合能力：**按 PII 类型自动识别 + 纯本地处理**。

自动识别覆盖的 6 类全是高意图词：email、电话、SSN、信用卡号、IP、API key。竞品大多只做"画框 + 涂黑"，自动识别是它们的短板。**这是你唯一能打差异化内容的角度。**

### 3.3 目标关键词矩阵（长尾优先）

**A 组 —— PII 类型页（核心差异化，优先做）**

| 目标词（实测存在于 Suggest） | 承接页面 | 意图 | 优先级 |
|---|---|---|---|
| `redact ssn` / `redact social security number` | `/redact-ssn` | 事务 | P0 |
| `redact credit card number in screenshot` | `/redact-card-number` | 事务 | P0 |
| `hide email in screenshot` | `/redact-email-address` | 事务 | P0 |
| `redact phone number in image` | `/redact-phone-number` | 事务 | P1 |
| `redact api key before sharing` | `/redact-api-key` | 事务 | P1 |
| `remove ip address from screenshot` | `/redact-ip-address` | 事务 | P2 |

**B 组 —— 场景/文档类型页（对标 happyimg 的打法）**

| 目标词 | 承接页面 | 意图 | 优先级 |
|---|---|---|---|
| `redact bank statement` | `/redact-bank-statement` | 事务 | P0 |
| `redact receipt` | `/redact-receipt` | 事务 | P0 |
| `redact text in screenshot` | `/redact-screenshot` | 事务 | P0 |
| `redact invoice` | `/redact-invoice` | 事务 | P1 |
| `blur text in screenshot` | `/blur-text-in-screenshot` | 信息→事务 | P1 |
| `black out text in image` | `/black-out-text` | 信息→事务 | P2 |

**C 组 —— 认知/对比页（低竞争，好做，养 E-E-A-T）**

| 目标词 | 承接页面 | 意图 |
|---|---|---|
| `redact vs blur` | `/guides/redact-vs-blur` | 信息 |
| `is blurring text safe` | `/guides/is-blur-safe` | 信息 |
| `remove exif data from image online` | `/guides/remove-exif` | 信息→事务 |
| `redact image meaning`（高量认知词） | `/guides/what-does-redact-mean` | 信息 |

**D 组 —— 明确不做（能力不具备，做了就是不实陈述）**

- `blur face in photo free` / `pixelate face` —— 你没有人脸检测。**不要写这类页面。**
- `blur license plate` —— 同样无人脸/车牌检测，只能手画框，写这页属于擦边误导。
- `redact pdf` 全家桶 —— 你只处理图片，且转 PDF 会引入新问题。等真有 PDF 能力再说。

### 3.4 内容质量红线（防止做成 doorway page）

Google 对"批量生成的低质模板页"有明确打击政策。**每个新页必须满足：**

- ≥ 400 词，且其中 ≥ 60% 是该主题独有的内容（不是全站复用的模板段落）
- 必须包含：这类信息泄露的真实后果（1 段）→ 具体该遮哪些字段的清单 → 该类型的自动识别能力**及其失效边界** → 手动作业的兜底步骤
- 每页 H1 与 title 各不相同，不得只换一个关键词
- **必须诚实写明自动识别可能漏检**——这既是政策要求，也是你的可信度来源

---

## 四、四阶段执行路线

### Phase 0 —— 收口测量 + 补技术小洞（今天，2 小时）

> **修正说明：** GSC 与 Bing 你**早前已经提交过**（记录里两次"blocked by robots.txt" 是提交时刻早于部署造成的假阳性，线上 robots 实测正常）。所以这一阶段不是"从零接入"，而是**确认状态 + 补三个缺口**。

| 优先级 | 任务 | 具体动作 | 约束合规 |
|---|---|---|---|
| P0 | 确认 GSC 状态 | 看"页面"报告是否已产出"已发现/已编入索引"；若仍是 0，用 URL Inspection 对 3 个页面逐个"请求编入索引" | ✅ 无需改代码 |
| P0 | 确认 Bing 站点归属 | 记录里明确根因是**在 `china-study-tour.pages.dev` 属性下提交了 redactmy 的 sitemap**。必须先 Add site → `https://redactmy.pics` → 验证 → 切过去再提交 | ✅ |
| P1 | 补 `og:image` | 生成 1200×630 静态 PNG 放 `public/`，`layout.tsx` 声明默认值，首页单独覆写 | ✅ 纯静态资源 |
| P1 | `twitter:card` 改 `summary_large_image` | 现在实测是 `summary`，配了图也不显示大图卡 | ✅ |
| P2 | 补 manifest + apple-touch-icon | `/manifest.webmanifest` 实测 404 | ✅ |

**验收标准：** GSC 三页状态为"已编入索引"（不是"已发现"）；`og:image` 在 HTML 里可抓到且图片 URL 返回 200；Bing 站点归属正确。

**关键提醒：** 不要再为 robots 报错改代码。线上 robots.txt 我这次实测是 `Allow: /` + Sitemap 行，完全正常。GSC 缓存最长 24h，刷不出新结果只是还没过期。

### Phase 1 —— 建 6 个 P0 页面（第 1–2 周）

A 组 3 个 + B 组 3 个 P0 页面。首页改为"工具入口 + 场景导航中心"，把新页面从正文内链出去（每页至少 3 条实体内链，不是 footer 堆链接）。

**验收标准：** sitemap 从 3 URL → 9 URL；每页词数、内链数、schema 全部达标；`npm run lint && npm run test && npm run build` 全绿。

**诚实预期：** 这批页面在 4–8 周后开始有零星长尾排名。

### Phase 2 —— 内容纵深 + E-E-A-T（第 3–6 周）

- 补完 B 组剩余 + C 组 4 个指南页
- **把 `AUDIT.md` 做成公开页面 `/security-audit`** —— 第三方审计报告是罕见的、真正值得外链的资产，"我们连网络请求都逐行审计过" 是可被引用的事实
- 加 `/methodology`：解释自动识别的正则规则和已知失效场景
- 首页正文加内链，形成 hub → spoke 结构

**验收标准：** 15–18 个可索引 URL，内链无孤儿页。

### Phase 3 —— 外链与分发（第 2–3 个月）

工具站的外链只有一条路：**被人主动引用**。

| 渠道 | 打法 | 风险 |
|---|---|---|
| Product Hunt 发布 | "no upload, no tracking, audited" 是 PH 受众喜欢的叙事 | 一次性爆发，需备好首日流量承接 |
| Show HN | 纯技术角度：纯前端 OCR + canvas 重编码 + 公开审计 | 需真技术含量，你具备 |
| AlternativeTo / 隐私工具清单 | 主动提交，不必等别人收录 | 慢但持续 |
| 隐私向博客/清单收录 | 用 `/security-audit` 作为 pitch 抓手 | 需逐个邮件，转化率低 |

**红线：不买链接、不做 PBN、不批量互换。** 隐私工具站一旦被判定有作弊链接，信任度归零，得不偿失。

### Phase 4 —— 用数据收敛（第 3–6 个月起）

每月看 GSC 三张表：Queries（哪些词已有展示但 CTR 低）→ Pages（哪些页已在 8–20 位）→ 针对 8–20 位的词做内容加深，这是投入产出比最高的一步。**不要凭感觉加页面，凭 GSC 的展示数据加。**

---

## 五、诚实的预期管理

| 时间 | 现实目标 | 说明 |
|---|---|---|
| 1 个月内 | 被收录 9–15 页，几乎无自然流量 | 沙盒期 + 发现延迟，这是正常的 |
| 3 个月 | 长尾词开始有零星排名（一天几次访问量级） | 前提是 Phase 1/2 按时交付 |
| 6 个月 | 长尾组合能带来日均几十次访问 | 这已经是新站在该赛道的正常速度 |
| 12 个月 | `redact image online` 有机会进第二页 | 需外链配合，且竞品不加速 |
| 头部词进前 3 | **没有时间表** | 取决于竞品动作和你的权威度，我不给假承诺 |

**一句话：这个站在 12 个月内不会靠 SEO 活下来。** 如果你需要一个短期内能带来流量的渠道，SEO 不是答案——它是复利，不是速效药。要不要同时走别的分发渠道，你需要单独决策。

---

## 六、我不建议做的事

1. **不要在首页堆更多关键词段落。** 899 词已经够，再加只会稀释意图、且容易被判 keyword stuffing。
2. **不要为 FAQ 做优化。** FAQPage 富媒体结果 2026-05-07 已全球下线，留着无害，但别再投入。它现在唯一价值是给 AI 引擎读结构——顺带，不值得专门做。
3. **不要编造评分和用户数。** schema 不合格就不合格，比被手动处罚好一万倍。
4. **不要做"人脸模糊""车牌模糊"页面。** 你的产品不具备这个能力，写了就是虚假陈述，同时也是对你站点最大卖点（诚实）的自杀。
5. **不要重构技术栈或改渲染策略。** 现在这套 Next.js 静态输出 + 动态 import 的底子，在同类站里是优等生。
6. **不要一次性上 20 个页面。** 3 页 → 23 页的跳变，在新域上极易被判定为批量生成内容。**一次 6 页，间隔 1–2 周。**

---

## 七、我需要你决策的三件事

1. **Phase 1 的 6 个页面，我按 A 组 3 个 + B 组 3 个的组合出，还是你想先只做 A 组验证效果？**
   - 建议：A 组 3 个 + B 组里 `redact-screenshot` / `redact-bank-statement` / `redact-receipt` 这 3 个。理由：A 组吃你的差异化能力，B 组吃已有搜索量的通用场景。
2. **`/security-audit` 公开审计页 —— 你介意公开 `AUDIT.md` 全文吗？**
   里面提到 jsDelivr 的 CDN 请求细节。公开反而增加可信度（"我们连网络请求都逐行审计过"是极好的外链钩子），但这是你的判断。
3. **要不要顺带做 `/guides/*` 认知页？**
   这类页竞争低、好写，但不带直接转化。做的话是养权威度，不做就集中火力做场景页。

定了之后我按 PROJECT.md 的规矩来：一次一个任务、每次最多 5 个文件、跑完 `lint && test && build` 再汇报，不 push。

---

## 附：本次诊断的方法与可复验证据

| 结论 | 证据来源 |
|---|---|
| 域名今天注册 | `whois redactmy.pics` → `Creation Date: 2026-10-25T13:33:28Z`；`git log --reverse` 首个 commit `2026-10-25 20:49 +0800` |
| 只有 3 个可索引页 | `curl https://redactmy.pics/sitemap.xml` → 3 条 `<loc>` |
| 竞品 1270 页 | `curl https://happyimg.com/sitemap.xml` → `grep -c "<loc>"` = 1270 |
| 首屏 192.4 KB | 逐个 curl 8 个 JS + 1 CSS，带 `Accept-Encoding: br, gzip` 累加 `size_download` |
| tesseract 未进首屏 | 首屏 HTML 中 `tesseract` 字符串命中 0 次；8 个 script 里无 OCR chunk |
| 无 og:image | 首页 HTML 中 `og:image` / `twitter:image` 命中 0 次 |
| FAQ 富媒体已下线 | Google 官方文档 + 2026-05-07 下线公告（多源一致） |
| schema 不合格 | 实测 JSON-LD 有 `name` + `offers.price`，无 `aggregateRating` / `review`；Google 文档要求二者必居其一 |
| 长尾词确实存在 | Google Suggest `client=firefox&hl=en&gl=us` 实抓，2026-10-25 |
| 无测量数据 | 站点零统计脚本（AUDIT.md 已核实），GSC 数据未在本轮提供 |
