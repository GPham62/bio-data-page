# Junior Data Analyst Resume Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a polished, print-ready Vietnamese CV for a Junior Data Analyst career pivot, delivered as `resume/cv.html` + `resume/cv.css`, exportable to PDF via browser print.

**Architecture:** Single-file HTML + companion CSS. No build tools, no dependencies, no npm. Open `cv.html` in Chrome → File → Print → Save as PDF. Version-controlled, easy to iterate. Vietnamese font served via Google Fonts CDN (`Be Vietnam Pro`) — renders correctly in both browser and print.

**Tech Stack:** HTML5, CSS3 (with `@media print`), Google Fonts CDN

## Global Constraints

- Language: Vietnamese (all user-facing text)
- Font: `Be Vietnam Pro` (Google Fonts) — supports Vietnamese diacritics
- Accent color: `#1a56db` (blue) for section headers and title
- Body text: `#2d2d2d`, secondary: `#555`
- Target page count: 1–2 pages A4 when printed
- All content verbatim from spec: `docs/superpowers/specs/2026-06-22-resume-junior-data-analyst-design.md`
- No images, no icons as images — Unicode symbols only (·, plain text)
- Portfolio URL: `bio-ta.vercel.app`
- Email: `ptuananh196@gmail.com`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `resume/cv.css` | Create | All visual styles + `@media print` rules |
| `resume/cv.html` | Create | Full CV content — all 6 sections |

---

### Task 1: Create `resume/cv.css`

**Files:**
- Create: `resume/cv.css`

**Interfaces:**
- Produces: CSS classes consumed by `cv.html` — `.cv`, `header`, `h1`, `.title`, `.contact`, `h2`, `.skills-grid`, `.skill-group`, `.project`, `.project-header`, `.tags`, `.job`, `.job-header`, `.period`, `.job-title`, `ul`, `li`, `a`, `@media print`

- [ ] **Step 1: Create the `resume/` folder and write `cv.css`**

Create `resume/cv.css` with this exact content:

```css
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 13px;
  line-height: 1.55;
  color: #2d2d2d;
  background: #f0f0f0;
}

.cv {
  max-width: 780px;
  margin: 32px auto;
  background: white;
  padding: 40px 48px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
}

/* ── Header ── */
header {
  border-bottom: 2px solid #1a56db;
  padding-bottom: 14px;
  margin-bottom: 18px;
}
header h1 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #1a1a1a;
}
.title {
  font-size: 14px;
  font-weight: 600;
  color: #1a56db;
  margin: 4px 0 10px;
}
.contact {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 18px;
  font-size: 12px;
  color: #555;
}

/* ── Section headings ── */
section { margin-top: 16px; }
h2 {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #1a56db;
  border-bottom: 1px solid #d6e4ff;
  padding-bottom: 3px;
  margin-bottom: 10px;
}

/* ── Tóm tắt ── */
section p.summary {
  color: #333;
  font-size: 12.5px;
}

/* ── Kỹ năng ── */
.skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 28px;
}
.skill-group strong {
  font-size: 12px;
  font-weight: 600;
  display: block;
  margin-bottom: 2px;
  color: #1a1a1a;
}
.skill-group p {
  color: #444;
  font-size: 12px;
}

/* ── Projects ── */
.project { margin-bottom: 11px; }
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.project-header strong { font-size: 13px; font-weight: 600; }
.tags { font-size: 11px; color: #777; font-style: italic; white-space: nowrap; }

/* ── Jobs / Education / Certs ── */
.job { margin-bottom: 11px; }
.job-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.job-header strong { font-size: 13px; font-weight: 600; }
.period { font-size: 12px; color: #666; white-space: nowrap; }
.job-title {
  font-size: 12px;
  color: #555;
  font-style: italic;
  margin: 2px 0 4px;
}

/* ── Lists ── */
ul { padding-left: 16px; margin-top: 4px; }
li { margin-bottom: 3px; color: #333; font-size: 12.5px; }
a { color: #1a56db; text-decoration: none; }

/* ── Print ── */
@media print {
  body { background: white; font-size: 12px; }
  .cv {
    margin: 0;
    padding: 16mm 18mm;
    box-shadow: none;
    max-width: 100%;
  }
  @page { margin: 0; size: A4; }
  a { color: #1a56db; }
  section { page-break-inside: avoid; }
}
```

- [ ] **Step 2: Verify the file exists**

Open `resume/cv.css` in the editor and confirm it has content. No browser check yet — HTML doesn't exist.

- [ ] **Step 3: Commit**

```bash
git add resume/cv.css
git commit -m "feat: add print-optimized CV stylesheet"
```

---

### Task 2: Create `resume/cv.html` — full CV content

**Files:**
- Create: `resume/cv.html`

**Interfaces:**
- Consumes: `resume/cv.css` (all class names defined in Task 1)
- Produces: Openable HTML file with all 6 CV sections

- [ ] **Step 1: Create `resume/cv.html` with the complete content**

Create `resume/cv.html` with this exact content:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV – Phạm Tuấn Anh</title>
  <link rel="stylesheet" href="cv.css">
</head>
<body>
<div class="cv">

  <!-- 1. Header -->
  <header>
    <h1>PHẠM TUẤN ANH</h1>
    <p class="title">Junior Data Analyst</p>
    <div class="contact">
      <span>0914 880 077</span>
      <span>ptuananh196@gmail.com</span>
      <span>bio-ta.vercel.app</span>
      <span>linkedin.com/in/tuananhpham6296</span>
      <span>Times City, Hà Nội</span>
    </div>
  </header>

  <!-- 2. Tóm tắt -->
  <section>
    <h2>Tóm Tắt</h2>
    <p class="summary">
      Cử nhân Khoa học Máy tính với kinh nghiệm thực tế phân tích dữ liệu người dùng
      trong ngành game (Firebase, AdMob, live-ops KPIs). Đã tự xây dựng 3 dự án phân
      tích độc lập sử dụng SQL, Python và Power BI trên tập dữ liệu thực tế quy mô lớn
      (&gt;1.6 triệu bản ghi). Tìm kiếm vị trí Junior Data Analyst để áp dụng kỹ năng
      phân tích vào môi trường kinh doanh.
    </p>
  </section>

  <!-- 3. Kỹ năng -->
  <section>
    <h2>Kỹ Năng</h2>
    <div class="skills-grid">
      <div class="skill-group">
        <strong>Ngôn ngữ &amp; Công cụ phân tích</strong>
        <p>SQL (PostgreSQL, MySQL) · Python (pandas, matplotlib, seaborn, scikit-learn) · Power BI (DAX, data modeling) · Excel (pivot table, VLOOKUP)</p>
      </div>
      <div class="skill-group">
        <strong>AI &amp; Agentic Workflow</strong>
        <p>Claude Code · LLM-assisted data analysis &amp; code generation · AI agent orchestration (multi-agent pipelines, MCP tools) · Prompt engineering cho tác vụ phân tích dữ liệu</p>
      </div>
      <div class="skill-group">
        <strong>Kỹ thuật phân tích</strong>
        <p>A/B Testing · RFM Segmentation · Machine Learning cơ bản · Trực quan hóa dữ liệu · Thống kê mô tả &amp; suy diễn</p>
      </div>
      <div class="skill-group">
        <strong>Công cụ khác</strong>
        <p>Jupyter Notebook · Git · Google Sheets · Firebase Analytics</p>
      </div>
    </div>
  </section>

  <!-- 4. Dự án phân tích dữ liệu -->
  <section>
    <h2>Dự Án Phân Tích Dữ Liệu</h2>

    <div class="project">
      <div class="project-header">
        <strong>Phân tích thị trường tuyển dụng Data Analyst</strong>
        <span class="tags">SQL · Python · Power BI</span>
      </div>
      <ul>
        <li>Phân tích 1.6 triệu bản ghi từ tập dữ liệu việc làm toàn cầu</li>
        <li>Xây dựng mô hình ML dự đoán mức lương với độ chính xác 80% (ROC-AUC)</li>
        <li>Trực quan hóa kết quả qua dashboard Power BI và portfolio web tương tác</li>
        <li>Portfolio: <a href="https://bio-ta.vercel.app">bio-ta.vercel.app</a></li>
      </ul>
    </div>

    <div class="project">
      <div class="project-header">
        <strong>A/B Testing: Cookie Cats Mobile Game</strong>
        <span class="tags">Python · Thống kê</span>
      </div>
      <ul>
        <li>Kiểm định giả thuyết trên dữ liệu hành vi 90,000+ người dùng</li>
        <li>Phát hiện sự khác biệt có ý nghĩa thống kê (p = 0.0016) giữa 2 nhóm</li>
        <li>Đưa ra khuyến nghị thiết kế dựa trên kết quả phân tích retention</li>
      </ul>
    </div>

    <div class="project">
      <div class="project-header">
        <strong>Phân khúc khách hàng E-Commerce (RFM)</strong>
        <span class="tags">SQL · Python</span>
      </div>
      <ul>
        <li>Phân khúc khách hàng theo mô hình RFM từ dữ liệu giao dịch thực tế</li>
        <li>Xác định nhóm khách hàng giá trị cao để hỗ trợ chiến lược marketing</li>
        <li>Trực quan hóa phân bố khách hàng theo segment bằng heatmap &amp; scatter plot</li>
      </ul>
    </div>
  </section>

  <!-- 5. Kinh nghiệm làm việc -->
  <section>
    <h2>Kinh Nghiệm Làm Việc</h2>

    <div class="job">
      <div class="job-header">
        <strong>Zitga Studio</strong>
        <span class="period">03/2024 – 05/2025</span>
      </div>
      <p class="job-title">Junior Unity Developer</p>
      <ul>
        <li>Theo dõi và phân tích KPIs người dùng (retention, DAU, ad revenue) qua Firebase Analytics, AdMob và AppLovin để ra quyết định tối ưu live-ops</li>
        <li>Quản lý và sử dụng dữ liệu stats người chơi cho hệ thống upgrade phức tạp (equipment, quest, daily/monthly events) — mỗi thay đổi đều dựa trên data</li>
        <li>Clone và prototype game theo market trends dựa trên phân tích dữ liệu xu hướng thị trường hyper-casual</li>
      </ul>
    </div>

    <div class="job">
      <div class="job-header">
        <strong>Wingsmob Studio</strong>
        <span class="period">05/2022 – 10/2023</span>
      </div>
      <p class="job-title">Junior Unity Developer</p>
      <ul>
        <li>Xây dựng hệ thống progression dựa trên dữ liệu hành vi người chơi</li>
        <li>Thiết kế và cân bằng combat systems dựa trên metrics thử nghiệm</li>
      </ul>
    </div>

    <div class="job">
      <div class="job-header">
        <strong>Mirabo JSC</strong>
        <span class="period">02/2021 – 03/2022</span>
      </div>
      <p class="job-title">Fresher Unity Developer</p>
      <ul>
        <li>Phát triển các dự án outsource cho thị trường Nhật Bản</li>
      </ul>
    </div>
  </section>

  <!-- 6. Học vấn -->
  <section>
    <h2>Học Vấn</h2>
    <div class="job">
      <div class="job-header">
        <strong>Đại học FPT Greenwich</strong>
        <span class="period">01/2018 – 02/2021</span>
      </div>
      <p class="job-title">Cử nhân Khoa học Máy tính</p>
      <ul>
        <li>Data Structures &amp; Algorithms, Agile/Scrum, Mobile &amp; Web Development</li>
      </ul>
    </div>
  </section>

  <!-- 7. Chứng chỉ -->
  <section>
    <h2>Chứng Chỉ</h2>

    <div class="job">
      <div class="job-header">
        <strong>Google Data Analytics Professional Certificate</strong>
        <span class="period">04/2026</span>
      </div>
      <p class="job-title">Coursera</p>
      <ul>
        <li>8-course program: data cleaning, SQL, R, Tableau, case studies</li>
      </ul>
    </div>

    <div class="job">
      <div class="job-header">
        <strong>Machine Learning</strong>
        <span class="period">04/2026</span>
      </div>
      <p class="job-title">Coursera — Andrew Ng / Stanford</p>
      <ul>
        <li>Supervised learning, model evaluation &amp; optimization</li>
      </ul>
    </div>
  </section>

</div>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify visually**

Open `resume/cv.html` in Chrome (double-click the file or drag into browser). Check:
- [ ] Name "PHẠM TUẤN ANH" renders correctly with diacritics
- [ ] Title "Junior Data Analyst" appears in blue below name
- [ ] 4 skills sub-groups appear in a 2-column grid
- [ ] 3 project blocks each show tags on the right
- [ ] 3 job entries show company + right-aligned date
- [ ] Education and 2 cert entries appear at bottom
- [ ] No layout overflow (nothing clipped or wrapping badly)

- [ ] **Step 3: Test print layout**

In Chrome: `Ctrl+P` → Destination: "Save as PDF" → Paper: A4 → Margins: None → verify it fits cleanly in 1–2 pages. If it spills past 2 pages, reduce `padding` in `.cv` from `40px 48px` to `28px 36px` in `cv.css` and retry.

- [ ] **Step 4: Commit**

```bash
git add resume/cv.html
git commit -m "feat: add Junior Data Analyst CV (Vietnamese, print-ready)"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered in |
|-----------------|-----------|
| Vietnamese language | All text in Task 2 HTML |
| Header: name, title, contact, portfolio URL | Task 2 — `<header>` block |
| Tóm tắt paragraph | Task 2 — section 2 |
| Kỹ năng: SQL, Python, Power BI, AI agentic workflow | Task 2 — section 3 |
| 3 data projects with metrics (1.6M, p=0.0016, 90K users) | Task 2 — section 4 |
| Zitga reframe with Firebase/AdMob/AppLovin KPIs | Task 2 — section 5 |
| Wingsmob 2-line, Mirabo 1-line | Task 2 — section 5 |
| FPT Greenwich education | Task 2 — section 6 |
| Google DA cert + ML cert, dated 04/2026 | Task 2 — section 7 |
| ML cert: supervised only (not unsupervised) | Task 2 — "Supervised learning, model evaluation & optimization" |
| Print-ready A4 | Task 1 `@media print`, Task 2 Step 3 |

**Placeholder scan:** None found. All steps have complete code.

**Type consistency:** CSS classes defined in Task 1 match class names used in Task 2 HTML exactly.
