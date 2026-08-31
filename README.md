# deepseek-harness-rtl

إضافة **للمتصفح (Cordis client plugin)** تجعل النصوص العربية تُعرض صحيحة في واجهة
DeepSeek Harness: محاذاة RTL، جمل مختلطة بدون تشويش، محرر يبدأ من اليمين، وأكواد
تبقى LTR.

A **browser-side Cordis client plugin** that makes Arabic (RTL) text render
correctly in the DeepSeek Harness web UI: RTL alignment, clean mixed-sentence
punctuation, an RTL composer, and code areas that stay left-to-right.

[![npm](https://img.shields.io/npm/v/deepseek-harness-rtl.svg)](https://www.npmjs.com/package/deepseek-harness-rtl)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

---

## How it works / كيف تعمل

عند تحميل الصفحة، تحقن هذه الإضافة ورقة أنماط CSS على المحادثة:
On page load it injects a stylesheet that:

| المنطقة | Area | السلوك | Behavior |
|---|---|---|---|
| فقاعات رسائل | User bubbles | `direction: rtl` + فكّ العزل | RTL + un-isolate |
| فقرات الردود | Assistant prose | `direction: rtl` | RTL paragraph |
| جسم التفكير | Thinking body | `direction: rtl` | RTL |
| المحرر | Composer | `direction: rtl` | RTL typing |
| الأكواد | Code | `unicode-bidi: plaintext` | auto-detect (LTR for code) |

The plugin is **dual-face**, like every DSH client plugin:

| File | Runs in | Role |
|---|---|---|
| `index.js` | Node (the host) | `main` entry — a no-op `apply()`. It must never touch `window`. |
| `client.js` | The browser | `exports["./client"]` — the real work: injects the stylesheet. |

`package.json` declares `dsh.client.platform: "web"`, which is what makes the
host's client-modules node serve `client.js` to the browser at
`/plugins/deepseek-harness-rtl/client.js`.

---

## Install / التثبيت

### المتطلبات / Requirements
- DeepSeek Harness running the `web` profile (the browser GUI).
- `pnpm` on PATH.
- A different profile name? pass `-Profile <name>`.

### الطريقة ١ — سكربت التثبيت (الأسهل) / Method 1 — one command

```powershell
powershell -File install.ps1
# another profile:
powershell -File install.ps1 -Profile myweb
# link this folder instead of installing from npm (for development):
powershell -File install.ps1 -Local
```

It runs `pnpm add` inside the profile and appends the `ui-rtl-fix` row to
`cordis.patch.yml` (idempotent).

### الطريقة ٢ — يدوياً / Method 2 — manual

```bash
cd ~/.dsh/profiles/web        # $DSH_HOME defaults to ~/.dsh
pnpm add deepseek-harness-rtl
```

ثم أضف الكتلة التالية إلى `cordis.patch.yml` في نفس المجلد:
Then add this block to `cordis.patch.yml` in the same folder:

```yaml
- insert:
    - id: ui-rtl-fix
      name: 'deepseek-harness-rtl'
```

`id` معرّف حرّ، أما `name` فيجب أن يطابق اسم الحزمة المثبّتة.
`id` is a free-form row id; `name` must match the installed package name.

### ⚠️ Restart required / إعادة تشغيل مطلوبة
The loader reads the composition **at start**. Restart the web app (host) once.
Re-opening the browser tab alone is NOT enough.

---

## Verify / التحقق

بعد إعادة التشغيل / after the restart:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  http://127.0.0.1:3080/plugins/deepseek-harness-rtl/client.js   # expect 200
```

وفي أدوات مطوّري المتصفح / and in the browser devtools console:

```js
document.querySelector('style[data-plugin="deepseek-harness-rtl"]')  // not null
```

---

## Troubleshooting / حل المشكلات

| العَرَض / Symptom | السبب / Cause | الحل / Fix |
|---|---|---|
| `window is not defined` عند الإقلاع | الحزمة تشير بـ `main` إلى `client.js` — الـ loader يستوردها في Node | `main` يجب أن يكون `index.js`، و`client.js` تحت `exports["./client"]` |
| الحزمة تُحمَّل لكن لا شيء يتغيّر | الصف موجود لكن `dsh.client.platform` غير مُعلَن | أضف `dsh.client` إلى `package.json` |
| الإصلاح يختفي بعد إعادة التشغيل | نسخة معدّلة يدوياً داخل `node_modules` يدهسها `pnpm install` | ثبّت عبر `pnpm add` (تبعية حقيقية)، لا بالنسخ إلى `node_modules` |
| 404 على مسار `/plugins/...` | اسم الحزمة لا يطابق `id` داخل `client.js` | يجب تطابق الاسمين تماماً |

---

## CSS layers / طبقتا الأنماط

- **Layer 1 (portable)** targets build-stable anchors — `data-chat-flow-kind`
  attributes, `data-input-mirror` / `data-input-backdrop`, and structural
  elements (`p`, `li`, `textarea`, `pre`, `code`). This keeps the fix working
  across different Harness builds.
- **Layer 2 (per-build)** targets the exact CSS-module hashes one deployment
  ships (`.gdEzaW_bubble`, `[class*="Sxvs8a_root"]`, …). These refine the
  result; if a future upgrade renames them, those rules silently stop matching
  while Layer 1 keeps the main behavior.

مساهمات محدّثة للطبقة الثانية مرحّب بها عند تغيّر بناء الواجهة.
PRs refreshing Layer 2 for a newer build are welcome.

---

## Contributing / المساهمة

```bash
git clone https://github.com/almezaniy/Deepseek-Harness-RTL.git
cd Deepseek-Harness-RTL
powershell -File install.ps1 -Local   # links this checkout into your profile
```

Edit `client.js`, restart the Harness, reload the tab.

## Notes / ملاحظات
- غير تدخّلية: تحقن CSS فقط، بلا أثر جانبي.
- Non-intrusive: it only injects CSS, nothing else.

## License
MIT — see [LICENSE](./LICENSE).
