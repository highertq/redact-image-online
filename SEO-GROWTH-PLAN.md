# RedactMy.pics — SEO 增长方案（2026-10-29 实测版）

**被诊断对象**：https://redactmy.pics（生产环境全站 24 URL 实抓）+ `src/`
**诊断日期**：2026-10-29
**上一版**：`SEO-STRATEGY.md`（2026-10-25）。该版 Phase 0–2 已全部执行完毕，sitemap 从 3 条涨到 24 条，技术项复验通过。本文只做增量结论，不重复已完成的动作。
**约束**：遵守 PROJECT.md —— 不加统计/追踪脚本、不加未点名的依赖、图片不出设备。

---

## 一、结论先行

**当前的瓶颈不是"优化不够"，是三件物理事实。在它们被解除之前，任何 on-page 微调都不会产生可测量的变化。**

| # | 硬事实 | 实测证据 |
|---|---|---|
| 1 | **域名只有 4 天。** 现在讨论"排名不足"为时过早，Google 对新域的观察期以月计 | `whois redactmy.pics` → `Creation Date: 2026-10-25T13:33:28Z`；本次品牌词搜索 `redactmy.pics`，前 5 条结果**我们一次都没出现**（全是 redact.pics / redact.photo / redacted.app / joydemo） |
| 2 | **技术 SEO 已过关，继续抠等于零收益。** 14 个技术项实测全绿（见第二节） | 全站 24 页逐个抓取核算 |
| 3 | **结构性差距在规模与外链**：24 页 vs 竞品 1270 页；外链≈0，品牌搜索≈0 | `curl happyimg.com/sitemap.xml` → `<loc>` = 1270；本次搜索未见任何第三方提及本站 |

**一个被数据推翻的旧担忧**：上一版最怕的"批量模板页被判 doorway"，实测**不成立**——14 个场景页的独有内容占比 **97–98%**，两两 Jaccard 相似度平均仅 **1.9%**（最高一对 3.5%），全站共有的模板句只有 2 句。

> **这意味着"可以放心加页"，扩张内容规模这条路是干净的。** 这是本次最有价值的结论：之前因为怕踩红线而不敢放量的页面，现在有了数据背书。

---

## 二、技术体检（24 URL 全量实测，非抽查）

### 2.1 全绿项 —— 不要动

| 检查项 | 实测结果 |
|---|---|
| HTTP 状态 | 24/24 全 200；不存在页返回**真 404**（非软 404） |
| canonical | 全部自引用 |
| H1 | 全站每页恰好 1 个 |
| title 长度 | 30–45 字符，**无一超 65** |
| description | 23/24 在 160 内（唯一例外见 2.2） |
| og / twitter 大图卡 | 全站 `og:image` + `twitter:card=summary_large_image` + `twitter:image` 齐备；`/og-image.png` → 200 / 41.4 KB |
| 结构化数据 | 首页 WebSite/Organization/SoftwareApplication/FAQPage；内容页 BreadcrumbList + Article + WebPage；层级页 ListItem |
| 内链结构 | **无孤儿页**（0 入链页 = 0）；首页向外链出全部 23 个子页 |
| URL 归一 | 尾斜杠 308 → 无斜杠；www 307 → apex；`/index.html` 404 |
| SSR 正文 | 每页 379–1648 词真实文本在 HTML 里，非空壳 |
| 首屏体积 | **221 KB**（9 JS=205 KB + CSS=8.8 KB + HTML=12.9 KB，br/gzip 后） |
| OCR 隔离 | 首屏 HTML 内 `tesseract/traineddata` 命中 **0**；9 个 chunk 内 `traineddata` 命中 **0** → 38 MB 语言包**确实没有进首屏** |
| `lang` | `<html lang="en">` 正确 |

### 2.2 实测出的真实缺陷（4 条，都不大）

| # | 问题 | 证据 | 影响 | 优先级 |
|---|---|---|---|---|
| 1 | **AI 搜索通道未准备**：`llms.txt` 404，robots.txt 无 AI 爬虫声明 | 竞品对照实测：`happyimg.com` 有 llms.txt(200) + 6 条 AI 爬虫规则；`redact.pics` 有 llms.txt(200)；我们 404 / 0 条 | 🟠 对 4 天新站这是**最快的引用来源**（ChatGPT/Perplexity 的清单文靠这些源），比 Google 排名早见效 | **P1** |
| 2 | sitemap `lastmod` 全站同一个日期，且不反映真实变更 | 24 条 `<lastmod>` 全是 `2026-10-27`，但 10-28、10-29 我们改了 `/methodology`（规则表 8→9 类、12 语言）与 `/redact-invoice`、`/redact-bank-statement` 的 FAQ | 🟡 lastmod 是 Google 分配重抓预算的信号；全站同一天且与事实不符 = 长期会被忽略 | P2 |
| 3 | 首页 canonical 缺尾斜杠 | 实测 `href="https://redactmy.pics"`，而 sitemap 里是 `…/` | 🟡 归一化不一致（Google 会自己合并，但是无谓的歧义） | P2 |
| 4 | `/methodology` description 197 字符，SERP 会被截断 | 实测长度 197 > 160 | 🟡 展示不全，CTR 折损 | P2 |

> Core Web Vitals 的**字段数据（CrUX）目前不存在**：PSI 返回无字段数据、lab 配额当日耗尽。这是"流量太少"的必然结果，不是缺陷。等有访问后复测即可（LCP/INP/CLS 目标：<2.5s / <200ms / <0.1）。

---

## 三、关键词与内容矩阵

**诚实声明**：我没有本站的 GSC 数据，也没有可靠的第三方关键词量级工具。**下列所有词都标注可验证依据，我不编搜索量数字。** 等 GSC 出数后（第 3–4 周）用真实展示量重排优先级。

### 3.1 P0 —— 只有我们能写、竞品写不了的簇

**簇 A：手机打码（最优先）**

| 目标词 | 承接页 | 依据 |
|---|---|---|
| `redact screenshot on iphone` | `/redact-screenshot-on-iphone` | 竞品 redacted.app 已有 iPhone/Android 分步指南页并参与 SERP 竞争，说明需求存在 |
| `redact image on android` | `/redact-screenshot-on-android` | 同上 |
| `black out text on phone` | 并入上面两页，不单独建页 | 避免同义页自相蚕食 |

> **前提条件已满足**：这两天我们刚把手机端做成 Browse / Draw boxes 双模式 + 点按遮盖，并用 CDP 真实触摸序列在 360/390/414 三宽度验证过（划动可滚、点按不误遮、弹层 242px）。没有这个实测，写"手机也能用"就是虚假陈述；现在可以写出**别人抄不了的具体细节**（一行文字在 390px 屏上只有约 30px 高、为什么把编辑权默认关闭、可编辑时画布为什么加描边）。

**簇 B：多语言打码（几乎无竞争，新站最现实的首批排名）**

| 目标词 | 承接页 | 依据 |
|---|---|---|
| `redact chinese receipt` / `银行流水截图打码`（英文页内提及） | `/redact-multilanguage` 单页 + 锚点分语言 | `/methodology` 已实测声明 12 语言、390 个字段名词表、15 套非 ASCII 数字归一；竞品对比表里**无人声称按字段名跨语言识别** |
| `redact foreign language document` | 同上 | 同上 |
| IBAN / 跨国银行账号 | **不建页**，深化进 `/redact-bank-statement`（现有 1434 词） | 加词不如加深：该页结构与内链已就位，`redact iban` 独立量太小 |

> **不做小语种站群 / hreflang 空壳**：没有人力维护翻译，做了就是 doorway + 垃圾本地化，比不做更糟。

### 3.2 P1 —— 原创实验数据（唯一能让别人主动链向你的资产）

| 页面 | 内容 | 为什么它是外链钩子 |
|---|---|---|
| `/guides/can-blurred-text-be-recovered` | **真做还原攻击实验**：对本站三种填充（solid black / solid white / pixelate，外加 blur）生成同尺寸样张，用 OpenCV 去模糊 + 超分 + OCR 复原，公开参数、原图、失败率、逐例截图，给出可复现脚本 | 竞品（redact.pics、redacted.app、deanlife.blog）在这道题上**只给观点，没有实验**。有方法与数据的原创结论是站长唯一愿意引用的东西 |

配套动作：把实验结论同步投稿给"best free redaction tools"清单文（本次 SERP 实测目标：`imgtools.co/blog/best-free-tools-to-blur-part-of-a-photo`、`hidefaces.com/blog/best-free-image-privacy-tools`、`deanlife.blog`（繁体）、`smartimgkit.com`）。这些页面**已经在互相列举竞品**，我们的缺失就是切入点。

### 3.3 P2 —— 结构与深度（不加页）

| 动作 | 证据 |
|---|---|
| `/guides` hub 从 611 词扩到约 1000 词，每篇加一句"这篇解决什么问题" | 全站最薄的导航页；pillar 太薄会导致簇内权重无法汇聚 |
| 4 个指南页（946 / 956 / 980 / 1287 词）vs 场景页（1400–1650 词）做加深 | 同簇内深度落差明显 |

### 3.4 明确不做（红线）

- **不做人脸 / 车牌打码页**——没有人脸检测能力，写了就是虚假陈述，同时自杀于本站最大卖点（诚实）。
- **不编 `aggregateRating` 或用户数**。宁可拿不到 SoftwareApplication 富媒体。
- **不买链接、不做 PBN、不批量换链**。隐私工具站一旦被判定作弊链接，信任归零。
- **不再为 FAQ 富媒体投入**（Google 已下线该展示；现有 FAQPage 留着无害，因为它对 AI 引擎解析问答结构仍有价值，但不追加）。
- **不重构渲染方案**。SSR 全文 + 221 KB 首屏 + 38 MB 语言包完全隔离，是同类站的上游水平。
- **一次不超过 5 个新页**，间隔 1–2 周（项目规矩 + 新域放量节奏）。

---

## 四、外链与分发（新站唯一的权威度起点）

| 渠道 | 具体动作 | 预期 | 备注 |
|---|---|---|---|
| **Product Hunt** | 叙事用"no upload / no tracking / audited network behavior / 12-language auto-detect" | 首日爆发 + 若干自然外链 | 需备好 PH 首日流量的承接页（首页 + /methodology） |
| **Show HN** | 技术角度：纯前端 OCR + canvas 重编码丢 EXIF + 公开网络行为审计 + 手机端手势契约 | 高质量引用与讨论 | 必须有真技术含量，本站具备（AUDIT.md / methodology 是证据） |
| **Bing Webmaster** | **先 Add site → `https://redactmy.pics` → 验证 → 再提交 sitemap** | Bing 对新站收录显著快于 Google，且 **Bing 索引是 ChatGPT 搜索的数据源** | 历史记录显示曾误在 `china-study-tour` 属性下提交，务必先改正归属 |
| 隐私向目录 / 清单 | AlternativeTo、awesome-privacy 类 GitHub 清单、隐私博客收录申请 | 慢但持续，且是 LLM 训练/检索源 | 用 `/security-audit` 作为 pitch 抓手 |
| 清单文 outreach | 逐个向 3.2 列出的对比文提交"加入对比表"请求，附实验数据页作证据 | 单条转化低，但一条顶十条内链 | 不群发模板信，每条附上对方文章的具体缺口 |

**红线**：不买链接、不虚报数据、不在自己无法兑现的说法上拿引用（例如"支持人脸检测"）。

---

## 五、90 天排期（每阶段带验收标准）

| 周 | 动作 | 验收 |
|---|---|---|
| **W0（今天，你手动）** | GSC 状态确认：`站点属性 → 网页`报告里"已编入索引"数量；sitemap 重提（24 条）；对 14 个场景页逐个"请求编入索引"。Bing 改正归属后提交 | GSC 可报告"已收录 N/24"，这个数字决定 W1 是修索引还是加内容 |
| **W1** | 技术 4 项修复（llms.txt、lastmod 逐页化、canonical 归一、methodology description 压长）；上线 PH / Show HN | 24 页 canonical 与 sitemap 完全一致；`/llms.txt` 返回 200 |
| **W2–W3** | P0 簇 A 三页（iPhone / Android / 合并同义词）上线，逐页 ≥1200 词、含真实实测细节 | +3 页，sitemap 27 条，无孤儿页，`lint && test && build` 全绿 |
| **W4–W6** | P1 还原攻击实验做完 → 发 `/guides/can-blurred-text-be-recovered` → 开始清单文 outreach（每周 5 封，个性化） | 实验可复现（附脚本）；发出 ≥15 封，目标 3 条收录 |
| **W7–W8** | P0 簇 B（多语言）上线 1 页 + `/guides` hub 加深 | 29 条 URL；hub ≥950 词 |
| **W9–W12** | **停止凭感觉加页**。只看 GSC：① 8–20 位的词所在页做内容加深；② 有展示无点击的页改 title/description；③ 每周记录展示量与 ref domains | 建立每周数据例会节奏；产出第一份基于真实展示量的重排优先级 |

---

## 六、诚实的预期管理

| 时间 | 现实目标 | 说明 |
|---|---|---|
| W1–W2 | 收录页数出现，自然流量≈0 | 沙盒期 + 发现延迟，正常 |
| 1 个月 | 长尾零星展示（GSC 里能看到词，日均点击可能 <10） | 前提是 W2–W6 按时交付 |
| 3 个月 | 长尾组合日均几十次；referring domains 20–40（靠 PH/目录/清单） | 新站在该赛道的正常速度 |
| 6 个月 | `redact image online` 有机会进 30–60 位 | 需外链配合且竞品不加速 |
| 头部词前 10 | **没有时间表** | 我不给假承诺 |

**一句话结论：这个站在 12 个月内不会靠 SEO 活下来。** 如果你需要短期流量，SEO 不是答案——它是复利，不是速效药。要不要并行开别的分发渠道（内容社区、Chrome 扩展商店、GitHub 生态）需要你单独决策。

---

## 七、度量口径（每周只看这些数）

| 指标 | 来源 | 阈值/动作 |
|---|---|---|
| 已收录页数 / 24 | GSC「网页」索引报告 | 若 2 周后 <60%，先查内链与 sitemap，不要加页 |
| 展示量、点击量、平均位 | GSC「效果」 | 关注 8–20 位的词 → 优先加深该页 |
| 有展示、CTR <1% 的页 | GSC | 改 title/description，一周后复看 |
| 品牌词展示（`redactmy`） | GSC + 手测 | 品牌搜索为 0 = 分发未启动，去查 PH/目录是否收录成功 |
| referring domains | Ahrefs 免费档 / 手查 | 3 个月目标 20–40；不追质量差的量 |
| CrUX LCP/INP/CLS | PSI（有流量后） | <2.5s / <200ms / <0.1；不达标再优化，**现在不优化** |
| AI 引擎引荐 | 分析工具不可用（无统计脚本），改为每周手测 ChatGPT/Perplexity 是否提及本站 | 这是无脚本约束下唯一的替代测法，成本 5 分钟 |

---

## 附：本次诊断方法与可复验证据

| 结论 | 证据来源 |
|---|---|
| 域名 4 天 | `whois redactmy.pics` → `Creation Date: 2026-10-25T13:33:28.0Z` |
| 品牌词搜不到 | WebSearch `redactmy.pics`（2026-10-29）前 5 条：redact.photo / redact.pics ×2 / redacted.app ×2 / joydemo，无本站 |
| 24 页全 200、canonical、H1、title/desc 长度、schema、og、内链入出 | `sitemap.xml` 取全部 `<loc>` → 逐页 `fetch` 后正则解析统计（脚本 `/tmp/seo-audit/crawl.mjs`） |
| 无孤儿页 | 同一脚本按入链计数，0 入链页 = 0 |
| 内容独有性 97–98%、Jaccard 1.9% | 句子级集合运算（脚本 `/tmp/seo-audit/dupe.mjs`），14 个场景页两两比对 91 对 |
| 首屏 221 KB | 逐个 `curl -H "Accept-Encoding: br, gzip"` 累加 9 个 JS + 1 CSS + HTML 的 `size_download` |
| OCR 未进首屏 | 首屏 HTML `tesseract|traineddata` 命中 0；9 个 chunk 逐个 `grep -c traineddata` 全 0 |
| lastmod 全站同一天 | `curl sitemap.xml \| grep lastmod \| sort \| uniq -c` → `24 <lastmod>2026-10-27…` |
| 竞品 llms.txt / AI 爬虫规则 | `curl -o /dev/null -w %{http_code} <域名>/llms.txt` + `robots.txt` 关键字计数（happyimg 200/6、redact.pics 200/0、redacted.app 404/0、joydemo 404/4；本站 404/0） |
| 竞品内容规模 | `curl happyimg.com/sitemap.xml \| grep -c "<loc>"` = 1270 |
| 手机能力真实可写 | 仓库提交 `d431bed`（Browse/Draw boxes 契约 + CDP 三宽度实测：划动可滚不建框、点按遮盖、弹层 242px） |
| FAQ 富媒体已下线 | 上一版策略已多源核实，本文不再重复投入 |
| CrUX 无字段数据 | PSI 返回无 `loadingExperience`（新站样本不足），lab 当日配额耗尽，待复测 |
