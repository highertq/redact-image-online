# RedactMy.pics — UX & Functional Audit

**Audit date:** 2026-10-25
**Scenario:** a first-time US visitor opens the site wanting to hide an email address in a screenshot and download it.
**Scope:** read-only. Every file under `src/` was read; `.next/` build output was inspected for payload numbers. No source file was modified, nothing was committed.

---

## Verdict

最严重的问题不是"细节没打磨"，而是**功能根本不存在，但界面和文档都在承诺它**：站内两处文案写着"可以 Ctrl/Cmd+V 粘贴"，全站没有任何 `paste` 监听器。分享截图时最自然的动作就是粘贴——用户按下去，页面毫无反应，也没有一句"不支持"。这是第一顺位的流失点。

顺带说一句：上一份 `AUDIT.md:241` 写着 "`window` `paste` listener in `useImageLoader.ts`"。`useImageLoader.ts` 全文没有一个 `paste`。那份审计把没验证的东西写成了结论。本次每一条都附行号，可逐条复验。

真正做对、别在改动中弄坏的：tesseract 确认是懒加载（首屏 176 KB gzip 里没有它）；`touch-action: none` 保证了画框不误滚；导出走独立 canvas，隐私链路干净。

排序规则：`影响 ÷ 改动量`。唯一被这个公式埋没的是最后一条（框不能拖动/改尺寸）——按规定排在末位，但它是产品完整度的最大缺口，请先看它再决定要不要动手。

---

## Issues

| # | 问题 | 影响 | 改动量 | 涉及文件 | 是否触及隐私承诺 |
|---|------|------|--------|----------|------------------|
| 1 | **粘贴功能完全不存在，但两处文案承诺了它。** 全站 `grep` 无 `onPaste`、无 `clipboardData`、无 `paste` 事件监听，只有 `useEditorShortcuts.ts:43` 一个 `keydown` 监听（管 Ctrl+Z 和 Delete）。用户按 Ctrl/Cmd+V 什么都不发生。 | 高 | 小 | `src/components/Redactor.tsx:209`（文案）、`src/app/page.tsx:26`（文案）、`src/hooks/useImageLoader.ts`（需新增 `window` paste 监听） | 不触及。新监听只读 `clipboardData.files[0]` 交给现有 `openFile`，纯内存。但它违反的是 `PROJECT.md` 那条"承诺只能声明真正实现并验证过的内容"——**这是虚假功能声明，比隐私瑕疵更该先修**。 |
| 2 | **"只在浏览器处理"的承诺埋在整页最底部。** `Redactor.tsx:241` 那行是 `text-xs`，位置在工具栏**下方**，首屏看不见。而空态拖拽区（`193-211`，用户此刻最需要被安抚的地方）里一句都没有。美国用户对 "upload" 极度敏感，这是转化率的核心信息，现在排在最末的视觉优先级。 | 高 | 小 | `src/components/Redactor.tsx:241` → 移入 `193-211` 空态区 | 不触及，纯强化。文案已存在且已被 `AUDIT.md` 验证为真，只是搬家，不需要新写承诺。 |
| 3 | **`touch-action: none` 把整页滚动一起锁死了。** 该样式打在 `w-full` 的 canvas 上。一张 1:3 的竖长手机截图，高度远超视口，用户手指落在图上就滚不动页面，只能从左右极窄留白蹭——而那里恰好也是画框区。画框不误滚是对的，代价是**整页没法滚**。 | 高 | 小 | `src/components/Redactor.tsx:187` | 不触及。纯 CSS 手势策略。 |
| 4 | **重复点 Auto-detect 会叠加重复框。** `commit([...rects, ...found])` 直接往现有框上追加。第二次点击后同一个邮箱上压两个框，标签重叠。用户看到框数翻倍，只会怀疑工具坏了。 | 中 | 小 | `src/components/Redactor.tsx:55-63` | 不触及。 |
| 5 | **识别失败的提示太弱，且没有重试。** 失败走 `role="status"` + `text-neutral-700`（`EditorToolbar.tsx:116`），和"Found 3 items"的成功提示**视觉上完全一样**；文案不说明原因，也没有 Retry。另外进度条直接映射 tesseract 的分阶段 `progress`，一次识别会经历 `loading core → loading language → recognizing` 多次 0%→100%，百分比反复归零，用户会以为卡死。 | 中 | 小 | `src/hooks/useAutoDetect.ts:63-70`、`src/components/EditorToolbar.tsx:96-119` | 不触及。若加 Retry，只重跑同一段本地 OCR，不新增网络路径。 |
| 6 | **下载后没有任何后续反馈。** `useExportPng` 只做 `anchor.click()` 就返回，组件不感知"已下载"，界面毫无变化，用户不确定是否成功。而唯一的"下一张"入口 `Start over` 是个灰色次要按钮，**点击立即清空全部框和历史，没有确认**——误触就是全盘重来。 | 中 | 小 | `src/hooks/useExportPng.ts:64-72`、`src/components/EditorToolbar.tsx:159-167`、`src/components/Redactor.tsx:107-112` | 不触及。只要"继续处理下一张"还是本地 `reset()`，不引历史记录、不存图片。 |
| 7 | **不能复制到剪贴板。** 分享截图时用户真正要的是"粘进 Slack / iMessage / 邮件正文"，现在只能下载再去文件夹里翻。全站 `clipboard` 零命中。 | 中 | 小 | `src/hooks/useExportPng.ts`（扩展）、`src/components/EditorToolbar.tsx:168-176` | **需注意**：只能用 `navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])` 走本地 blob。**绝不能**为了兼容旧浏览器去接任何服务端转换或图片代理——那会当场摧毁"图片不离开设备"。降级方案是"不支持则只保留下载"，不是"想办法上传一下"。 |
| 8 | **三种上传方式在视觉上是三块东西，而且拖拽区点不动。** 原生 `<input type="file">` 独立悬在拖拽区**上方**，样式是浏览器默认文件按钮；下面的虚线框写着 "Drop an image here"，却没有 `onClick`、不是 `<button>`、连 `role` 都没有，**点它毫无反应**。用户第一反应就是点那个虚线框。 | 中 | 小 | `src/components/Redactor.tsx:139-151`、`193-211` | 不触及。 |
| 9 | **自动识别不能按类型开关。** `PiiBox.type` 已经带上了 `email` / `us_phone` / `ssn` / `credit_card` / `api_key`（`pii-boxes.ts:12-18`），数据齐备，但 UI 一次性把全部类型涂黑。本场景用户只想遮邮箱，工具却顺手把他客户的电话和卡号也框了——多余的黑条让人不敢用。 | 高 | 中 | `src/hooks/useAutoDetect.ts:39-47`、`src/lib/pii-boxes.ts:12-18`、`src/components/EditorToolbar.tsx`（新增筛选条） | 不触及，反而增强安全性：按类型开关鼓励用户把该遮的全遮上，而不是因为"一糊全糊"就放弃自动识别。 |
| 10 | **大图没有缩放和平移。** canvas 固定 `h-auto w-full`，3024×4032 的手机截图被压到约 340 px 宽，缩放比约 1:9。要框住一行 14 px 的邮箱，落点误差几十像素。没有滚轮缩放、没有捏合、没有放大镜。 | 高 | 中 | `src/hooks/useCanvasEditor.ts:109-124`、`src/components/Redactor.tsx:180-189` | 不触及。但坐标换算必须继续在**图像原始像素空间**做（现在是对的，`toImagePoint` 用 `canvas.width / rect.width`），缩放只改 CSS 尺寸。若把 rect 存成屏幕坐标，导出会错位——这会连带破坏"真正的涂黑"那条承诺。 |
| 11 | **`pointermove` 每次全图重绘，大图必然掉帧。** `draw()` 里 `clearRect` + 对 40 MP backing store 做 `drawImage`，而 `setGhost` 在每次指针移动都触发，`draw` 的 `useCallback` 依赖 `ghost` → 每帧重绘整张位图。4K 图拖动桌面端都卡，手机端基本是幻灯片。没有 `requestAnimationFrame` 合并。 | 高 | 中 | `src/hooks/useCanvasEditor.ts:49-107`、`145-161` | 不触及。注意：别用"把图缩小编码再画"这类优化，那会改变导出分辨率。正确做法是底图与覆盖层分层 + rAF 节流。 |
| 12 | **导出前没有预览。** 点 Download 直接落盘，用户无法在下载前确认"框是否真的盖住了"。对一个"遮错了等于没遮"的工具，这是最大的信任缺口——尤其当他刚用完自动识别，本来就该核对一遍。 | 高 | 中 | `src/hooks/useExportPng.ts`、`src/components/Redactor.tsx:230-239` | **需注意**：预览必须是**本地 canvas 渲染**。绝不做"生成分享链接"或"上传预览图"。预览除了多一次 `toBlob` 之外不该产生任何东西。 |
| 13 | **键盘无法完成核心任务，单选框焦点不可见。** canvas 是 `role="img"`、无 `tabIndex`，画框这件事**只能用鼠标或手指**，纯键盘用户零可能。快捷键只有 Ctrl/Cmd+Z 和 Delete，没有方向键微调。另外 fill-style 三个 radio 用了 `sr-only`（`EditorToolbar.tsx:75`），而 `label` 上**没有 `focus-within` 样式**，Tab 过去焦点完全看不见——这是明确的 WCAG 2.4.7 违规。 | 中 | 中 | `src/hooks/useEditorShortcuts.ts`、`src/components/EditorToolbar.tsx:61-79`、`src/components/Redactor.tsx:180-189` | 不触及。 |
| 14 | **手机上图片和工具栏隔着滚动，下载按钮不随时可见。** 工具栏是 canvas 下方的流式布局（不遮挡画布，这点做对了），但长图上用户要"画完 → 滚下去 → 点下载 → 滚回来看效果"。Download 挤在 `flex-wrap` 一排的**最后**（`EditorToolbar.tsx:168`），窄屏上会被折到第二行。 | 中 | 中 | `src/components/EditorToolbar.tsx:122-177`、`src/components/Redactor.tsx:214` | 不触及。若做 sticky 悬浮栏，注意别盖住 canvas 底边——那会重新引入"工具栏遮挡画布"的问题。 |
| 15 | **已画好的框不能移动，也不能调整大小。** `useCanvasEditor.ts:132-136`：`hitTest` 命中后只调 `onSelect(hit)` 然后 `return`，没有 drag 状态机，也没有 corner handle。画歪一像素的唯二选择是"删掉重画"或"整张重来"。这是画框类工具的底线功能，缺了它前 14 条修得再漂亮，这个工具也只是个"能用一次"的玩具。 | 高 | 大 | `src/hooks/useCanvasEditor.ts:126-143`、`src/lib/geometry.ts`（需新增 resize/handle 命中） | 不触及。 |

---

## 已完成、别在改动中弄坏的部分

| 项 | 证据 |
|---|---|
| **tesseract 确实只在点击时才加载** | `src/lib/ocr.ts:17` 用 `await import()`；构建产物 `.next/static/chunks/42--ssu5nl6oh.js`（20 KB）**未出现在** `index.html` 的任何 `<script>` / `<link rel=preload>` 里（`grep` 命中 0 次），是独立异步 chunk。修第 5 条时别把 import 提到模块顶层。 |
| **首屏 JS 实测** | `index.html` 引用 8 个 chunk，gzip 合计约 **176 KB**（最大两块 70 KB + 45 KB，是 React/Next 运行时），CSS gzip 3 KB。对这个工具量级合理，没有可榨空间。 |
| **画框不误触滚动** | `touchAction: "none"` 确实生效——代价见第 3 条。 |
| **导出的隐私链路干净** | 独立 `document.createElement("canvas")` → `toBlob` → 临时 blob URL → 立即 `revokeObjectURL`（`useExportPng.ts:37-71`）；`paintRedaction` 只写不透明像素，编辑态的红色虚线描边不会进导出。 |
| **加载失败的边界覆盖不错** | `REJECT_MESSAGES`（`image.ts:17-23`）覆盖 unsupported / too-large / too-many-pixels / decode-failed 四类，且"先验元信息再解码"的顺序正确。 |
| **pixelate 先铺黑底再画马赛克** | `image.ts:115-121`。这是安全修正，不是样式偏好，改渲染分层时别把它拆掉。 |

---

## 未列入 15 项、但值得知道的观察

1. **HEIC 与超高像素。** `MAX_PIXELS = 40_000_000` 会拒掉 iPhone 的 48 MP 照片（8064×6048 ≈ 48.8 MP）和多数全景图。iOS 通过 `<input accept>` 通常自动转 JPEG，桌面端拖 HEIC 会撞上 "Only PNG, JPEG, and WebP"。只能改文案（提示"先导出为 JPEG"），不建议为此装解码库——`PROJECT.md` 禁止未点名的依赖。
2. **首次点 Auto-detect 的真实等待是 5–10 秒。** 除 20 KB 的 JS 壳，还要从 jsDelivr 拉 worker、WASM core（约 4 MB）和 eng 语言包（约 5 MB）。第 5 条修好只是让等待可见，等待本身还在。自托管这三个资源能砍掉 CDN 跳转——根目录那个被 `.gitignore:46` 排除的 `eng.traineddata`（5.0 MB）看着正是为此准备却没接上，代价是得改 `PROJECT.md` 和隐私页里关于 CDN 的措辞。
3. **拖入多个文件只取第一个，也不提示。** `Redactor.tsx:118` 的 `dataTransfer.files?.[0]`。
4. **canvas 的 `aria-label` 是静态的**（`Redactor.tsx:185`），不反映当前框数量；编辑器整块没有标题（`<h2>` / `aria-label`），屏幕阅读器用户不知道这块是干什么的。
5. **对比度没有硬伤。** 最小的 `text-neutral-500`（#737373，白底 4.74:1）刚过 AA 4.5:1；`neutral-600` 是 7.5:1。这条不用动。
6. **`page.tsx` 里 `FAQ` 说自动识别找 "emails, phone numbers, SSNs, card numbers, and API keys"** —— 与 `pii.ts` 完全一致，但漏了 `ipv4`（`pii.ts:107`）。这是文案少写，不是功能多写，改动量为零，顺手补上。

---

## 需要在浏览器里手动验证（我看不到画面，不做视觉断言）

1. 虚线拖拽区在手机上点击是否真的无反应（第 8 条）。
2. 一张 1:3 竖长截图在手机上，手指落在图中央能否滚动页面（第 3 条）。
3. 4K 图拖动时是否明显掉帧（第 11 条）——开 DevTools Performance 录一段。
4. Auto-detect 连点两次，框是否重叠加倍（第 4 条）。
5. 进度条在 `loading language` → `recognizing` 切换时是否归零（第 5 条）。
6. Tab 遍历工具栏，选中 fill-style 时能否看见焦点（第 13 条）。
7. 导出 PNG 后用 `exiftool` 确认 EXIF 已剥离（`AUDIT.md` 遗留的 UNVERIFIED 项，与本次无关但一直没关）。
8. 手机端 Safari 的 `a[download]` 行为是"存储到文件"还是直接开新标签——这决定第 6 条"下载后提示"的文案怎么写。

---

## 修复顺序建议

**第一批（一个下午，5 项，纯补漏不引入新概念）**
第 1 条粘贴（或先把两处文案删掉，二选一，别继续挂着假承诺）、第 2 条隐私提示移位、第 3 条滚动策略、第 4 条去重、第 8 条拖拽区可点。
改完能从"半成品"变"能用"。

**第二批（同一个"导出体验"闭环，一起做）**
第 12 条导出预览 + 第 7 条复制到剪贴板 + 第 6 条下载后引导。三条共享同一套 blob 生成与状态反馈，拆开做会重复劳动。

**第三批（互相耦合，必须同一轮提交）**
第 10 条缩放平移 + 第 11 条渲染分层 + 第 15 条框的拖动与手柄。这三条任何一条单独做都会和另外两条打架：分层之后才能高效支持缩放，缩放坐标空间定了才敢写 resize 手柄。建议先把 `useCanvasEditor` 拆成"底图渲染 / 交互状态机 / 覆盖层绘制"三层再动手。

**随时可做**
第 5、9、13、14 条互不依赖，谁有空谁做。
