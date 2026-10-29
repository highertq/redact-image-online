# RedactMy.pics — 外链与收录执行名单

生成日期：2026-10-29
用途：`SEO-GROWTH-PLAN.md` 第四节（外链与分发）的执行清单。
所有"对方缺口"均来自**本次实际抓取对方页面**得到的原文，不是推测；发信前请再打开一次链接确认内容仍在（清单文改版很常见）。

---

## 零、发信前必读的三条纪律

| 纪律 | 原因 |
|---|---|
| 不群发模板信。每封必须点名对方文章里**一个具体缺口**，且该缺口是本次核对过的 | 这类清单文的作者每天收封"我们也是免费工具，请加我们"。能被采纳的那一封，通常是替对方把表格补得更准的那一封 |
| 不自报"最强"。只给可验证陈述：12 种语言的字段名规则、390 个词、IBAN mod-97 校验、无广告、无上传、以及那份可复现的还原实验 | 本站的全部说服力来自"我们说的话你可以自己查"。一句夸大话会连带废掉其他九句真话 |
| 不请求"给个链接"，请求"你的对比表里有一列现在只能填两个值" | 收录与否取决于对方读者是否受益，不取决于我们的诉求 |

---

## 一、最高优先：已经在做同类对比的文章（有现成缺口）

### 1. ImgTools — *Best free tools to blur part of a photo in 2026*
`http://www.imgtools.co/blog/best-free-tools-to-blur-part-of-a-photo`

| 项 | 实测到的内容 |
|---|---|
| 表格列 | `Finds faces / Manual areas / Where it runs / Animated / Free output`（10 个工具） |
| 有文字检测的只有两家 | Redacted（"yes, plus text"）、Aspose（"yes, plus text"） |
| 它自己的结论（原文） | *"For passwords, identity numbers, card numbers and signatures, do not use blur or pixelation: use a solid fill, which hides by removing the pixels rather than by scrambling them."* |
| 它对自家 #1 的批评（原文） | Aspose：*"It uploads. The privacy pitch rests on deleting your file after thirty minutes, which is a promise rather than an absence."* 且 *"the file size ceiling is 5 MB... rules out a phone photo at full resolution"* |
| 它自承的缺口（原文） | ImgTools：*"The manual tool finds nothing for you, by design. The automatic one detects faces and only faces"*；*"the site carries advertising"* |
| 它已经承认的元事实（原文） | *"Every page that currently ranks for this subject is published by one of the tools it compares, and every one of them puts itself first."* |

**pitch 角度（三条按优先级）**
1. **它把"是否上传"当作最重批判标准**，而它推荐的检测最强项（Aspose）恰好上传 → 补一个"浏览器内、可复核检测框、还免广告"的条目，是替它把论证补严，不是求它加广告位。
2. 它的表格没有"能读哪些语言的文字"这一维。我们：字段名规则 12 种语言、390 个词、15 套非 ASCII 数字折成 ASCII 再匹配，`+1`、`415 555 0132`、`090-1234-5678`、`١٢٣٤٥٦٧٨٩` 都算数。建议它加一列 `Reads text in which languages`。
3. **它文章里"blur 不安全"那段是断言**，我们有可复现数据（半径 2px 在 26px 字高上 8 条还原 7 条、纯色填充 0/8、以及字高扫描表）。提供引用/提供脚本，不要求对方一定要提本站。

**要给的资产**：`/guides/can-blurred-text-be-recovered`（含脚本路径） > `/methodology` > 首页。
**风险**：作者是竞品（ImgTools 自己上榜），大概率不会加我们；但**它是我们那篇实验页最合适的引用对象**——被对手引用一次的价值高于排名。

### 2. HideFaces — *Best Free Image Privacy Tools for Faces, Text, and License Plates*
`https://hidefaces.com/blog/best-free-image-privacy-tools`

| 项 | 实测到的内容 |
|---|---|
| 表格列 | `Tool / Platform / Face Blur / Plate Blur / Text Redaction / Batch Processing`（6 行） |
| 对 Redacted.app 的记录 | Text Redaction = `Blur/Blackout`（不是自动） |
| 它自己写的选品标准（原文） | *"Local processing is another key factor. Tools that run entirely in the browser or on your device reduce privacy risks"* |
| 明显薄弱处 | 全文 5 分钟读完、每工具无深度段落、`Text Redaction` 一列没有任何工具标注"自动 + 多语言"；Batch 一列只有 ExifCleaner 填 Yes |

**pitch 角度**
- 我们能让它这张表更诚实：`Text Redaction` 列可填 **Automatic (12 languages)**，而 `Face Blur / Plate Blur` 老实填 **No**——一个如实填 No 的行比一个满行 Yes 的行更容易被接受，也更不容易被读者挑刺。
- 它的正文有"metadata  equally important"一句但没有展开：我们的 `/guides/remove-exif` 可直接引。
**要给的资产**：`/redact-foreign-language-document`（多语言检测） + `/guides/can-blurred-text-be-recovered`。

### 3. 軟博 Dean（繁体中文）— *線上馬賽克推薦：4 款免費工具*
`https://deanlife.blog/?p=67309`

| 项 | 实测到的内容 |
|---|---|
| 已收录工具 | Redacted、Radact、Fotor、MiniWebtool（皆无中文语义识别能力描述） |
| 它的关键论点（原文） | *"不透明遮蔽(Solid Block) 安全性最高…直接用一個色塊蓋住資訊，沒有任何視覺資訊可以被還原"*；并指出像素化 *"存在被 AI 工具部分還元的風險"* |
| 缺口 | 4 款工具都不提**中文字段名/大陆手机号/18 位身份证**识别；对岸读者最常打的码恰恰是快递单与账单 |

**pitch 角度**：本站有 61 个中文字段名词项、大陆手机号与身份证规则（18 位含校验和与出生日期校验），导出 PNG 重编码顺带丢 EXIF/GPS——正好补齐它"选工具"那段。可另附我们实验里的**大字号像素化可被还原**数据（48px 字 + 4px 块 5 条还原 2 条），支撑它"像素化有还原风险"的判断。
**语言**：给对方繁中材料或至少中文摘要；用英文群发大概率沉底。

---

## 二、目录与收录型（慢、持续、且是 LLM 的检索源）

| 目标 | 动作 | 诚实填写项 |
|---|---|---|
| AlternativeTo | 提交条目，类别 `Screenshot Redaction / Image Privacy`，并在对比页主动标注"无脸/车牌检测" | 竞品列表里已有 Redacted、Facepixelizer 等，我们要的是被并列，不是被置顶 |
| GitHub `awesome-privacy` / `awesome-selfhosted` 类清单 | 找 PR 模板，按"浏览器内处理、可离线验证（飞行模式复测）"写一行 | 必须写它**不做**的事，否则第一次 issue 就被打回 |
| Product Hunt | 叙事固定为三件可核事实：no upload、no tracking、公开网络审计 + 12 语言字段名识别 | 上线当天把 `/security-audit` 和实验页放在首评，承接搜索与引用 |
| Show HN | 技术角度：纯前端 OCR（tesseract.js 资产自托管）、canvas 重编码丢元数据、手机端手势契约与"弹层吞掉召唤它的那次点击"这个真实 bug | 这个题目的价值在引用与技术信誉，不在排名 |
| Bing Webmaster Tools | **先 Add site → 验证 `https://redactmy.pics` → 再提交 sitemap（29 URL）** | Bing 索引是 ChatGPT 搜索的数据源；历史上曾误在 `china-study-tour` 属性下提交，归属必须先纠正 |
| Google Search Console | 确认"网页"报告里"已编入索引"计数，对 4 个新页逐个"请求编入索引" | 没有这个数字，后面所有优先级排序都是猜 |

> **不做**：买链接、PBN、交换链接、批量提交低质目录站群。隐私工具站一旦被判定操纵链接，信任归零，本站唯一的资产就是"说的话可验证"。

---

## 三、内容侧继续制造的引用理由（外链是因变量）

| 资产 | 状态 | 还能加什么 |
|---|---|---|
| 还原攻击实验 + 脚本 | ✅ 已上线 | 补 2 个变量：**JPEG 质量维度**（截图经 WhatsApp 压缩后还剩多少可还原）与**手机 Markup 真实样本**（用真机 Markup 导出的图跑同一攻击）——这两点一旦补齐，就是全网唯一带数据的"手机涂黑到底安不安全" |
| `/methodology` 规则表（9 类 + 12 语词表 + 失效边界） | ✅ 已上线 | 加"我们测过的文档样本数与语言分布"小节，让它成为可引用的事实来源 |
| `/security-audit` | ✅ 已上线 | 把"飞行模式下可完成全流程"写成可复现步骤，供清单文引用 |
| 手机簇三页 | ✅ 新上 | 缺真机截图；补 3 张（iPhone Safari / Android Chrome / 弹层遮挡）会显著提升被引用概率 |

---

## 四、节奏与追踪（每周 30 分钟）

| 周 | 动作 | 记录字段 |
|---|---|---|
| W1 | GSC + Bing 归属与提交；PH/HN 择日 | `已收录 N/29` |
| W2 | 上述 3 篇清单文逐一个性化发信（各 1 封，不跟催第 2 次） | 收件人 / 引用了哪段缺口 / 回复 / 是否收录 |
| W3 | GitHub 清单 PR + AlternativeTo | 同上 |
| W4+ | 每周只看 GSC：8–20 位词所在页加深；有展示无点击的页改 title/desc | 展示量、点击、平均位、ref domains |

追踪表建议直接建在本文档末尾，一行一条，**记下你引用了对方哪句话**——没有这一列，三个月后你自己也不知道哪封信有效。

---

## 五、预期管理（数字，不是安慰）

- 清单文收录转化率经验值低：3 封精心个性化 → **0–1 条**，这是正常结果，不是失败。
- 真正决定这个站 6 个月内能不能拿到长尾展示的，不是外链条数，而是 **GSC 里"已编入索引"是否接近 29**。这件事今天就能确认，且不依赖任何人回信。
