# Upwork portfolio · 3 pieces

All three use fictional businesses and say so. Capture screenshots at 1280 px wide (and one at 390 px for mobile), plus a short screen recording where noted.

---

## 1. Speed-to-lead demo for home services

**Title:** Web form lead gets a text back in under 60 seconds

**Link:** https://timbre-demo.netlify.app/demo/en.html (and https://timbre-demo.netlify.app/en/)

**Description:**

```
A working simulation of the speed-to-lead system I install for home service businesses. A homeowner submits a quote request on a (fictional) cleaning company's site; a visible timer shows the text reply landing in seconds, the same reply goes out by email, the lead appears in a Google Sheet and the owner gets an alert. The Pro flow adds missed-call text-back, two follow-ups and a review request. Built with plain HTML, CSS and JavaScript; the real version runs on the client's own n8n or Make, texting number and Google account. Consent checkbox and STOP opt-out included.
```

**Role:** Design, front-end, automation design · **Tools:** HTML, CSS, JavaScript, n8n, Google Sheets, Twilio-compatible SMS

**Media to capture:**
1. Form being filled (16:9).
2. Timer at 0:07 with the text on the phone and the new sheet row.
3. Owner alert + follow-up thread.
4. 9:16 recording of the auto mode (`?formato=916&grabar=1`).

---

## 2. WhatsApp Business + Google Maps setup simulator

**Title:** "No customer goes unanswered": WhatsApp Business demo for small businesses

**Link:** https://timbre-demo.netlify.app/demo/ and the landing page https://timbre-demo.netlify.app/

**Description:**

```
A sales demo for Timbre, my WhatsApp and Google Maps setup service in Latin America. A customer messages a (fictional) business at 9:47 PM and gets the away message instantly with the catalog and hours. Visitors drag a time-of-day slider to 3 AM and watch it still answer. An owner panel shows each contact with labels and alerts. Includes 11 trade templates, a lost-customers calculator with the owner's own numbers, auto mode with captions for 16:9 and 9:16 video, and a field tool sales reps use to build a personalized demo with a QR code in seconds.
```

**Role:** Product, design, front-end · **Tools:** HTML, CSS, JavaScript, JSON templates, QR generation

**Media to capture:**
1. Landing hero with the phone and the time slider at 3:00 AM.
2. Simulator with the owner panel (16:9).
3. The field tool on a phone (390 px) with the QR.

---

## 3. Client delivery kit and n8n automations

**Title:** From one JSON file to a full client delivery: texts, images, QR codes, website and n8n workflows

**Link:** https://timbre-demo.netlify.app/entregas/ejemplo-barberia-el-parche/pagina/ · https://timbre-demo.netlify.app/constructor/ · https://github.com/AndresDiezT/Timbre/tree/main/automatizaciones/n8n

**Description:**

```
A template system that turns one JSON file per client into everything I deliver: copy-ready WhatsApp Business and Google Business Profile texts, 1080×1080 catalog images, WhatsApp and review QR codes (SVG and PNG), a one-page website in three visual styles, and a delivery checklist. A browser builder lets me fill the client's data step by step with a live preview. On top of that, five importable n8n workflows: form to Sheets and email, form to WhatsApp template, keyword auto-replies with an optional AI step, appointment reminders, and review requests with quote follow-ups. Each client runs everything on their own accounts.
```

**Role:** Architecture, Node.js tooling, automation · **Tools:** Node.js, resvg, n8n, Make, WhatsApp Cloud API, Google Sheets, Gmail

**Media to capture:**
1. The three website styles side by side (sobrio, cálido, moderno).
2. Catalog image and QR card examples.
3. Screenshot of the E3 workflow open in n8n (after importing it).
