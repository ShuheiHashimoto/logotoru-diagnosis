#!/usr/bin/env python3
"""
焼畑診断ツール GA4導入スクリプト
index.html にGA4タグを追加し、App.jsx にカスタムイベントを仕込む
"""

import re

GA4_ID = "G-C0EPJY9QNT"

# ========== index.html ==========
with open("index.html", "r") as f:
    html = f.read()

ga4_tag = f"""<!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={GA4_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', '{GA4_ID}');
    </script>"""

if GA4_ID not in html:
    html = html.replace("</head>", f"{ga4_tag}\n  </head>")
    with open("index.html", "w") as f:
        f.write(html)
    print("✅ index.html: GA4タグ追加完了")
else:
    print("⏭️ index.html: GA4タグ既に存在")

# ========== App.jsx ==========
with open("src/App.jsx", "r") as f:
    jsx = f.read()

# 1. gtagヘルパー関数を先頭に追加（GAS_URLの後）
gtag_helper = """
// GA4 event helper
const gtag_event = (name, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
};
"""

if "gtag_event" not in jsx:
    jsx = jsx.replace(
        'const GAS_URL =',
        gtag_helper + 'const GAS_URL ='
    )
    print("✅ App.jsx: gtagヘルパー関数追加")

# 2. 診断開始イベント（StartScreen の「診断を始める」ボタン）
# setPhase("questions") を探して、その前にイベント発火を入れる
if 'gtag_event("diag_start")' not in jsx:
    # StartScreen内のボタンonClickでsetPhase("questions")が呼ばれる箇所
    jsx = jsx.replace(
        'setPhase("questions")',
        'gtag_event("diag_start"); setPhase("questions")',
        1  # 最初の1箇所だけ
    )
    print("✅ App.jsx: diag_start イベント追加")

# 3. STEP完了イベント（各質問回答時）
# answeredCount が更新される箇所 = 選択肢クリック時
if 'gtag_event("diag_answer"' not in jsx:
    # setScore(prev => prev + ... の前にイベントを入れる
    jsx = jsx.replace(
        'setScore(prev => prev +',
        'gtag_event("diag_answer", { step: step + 1, question: qIndex + 1, score: opt.score }); setScore(prev => prev +',
        1
    )
    print("✅ App.jsx: diag_answer イベント追加")

# 4. 診断完了イベント（ResultScreen表示時のuseEffect内）
if 'gtag_event("diag_complete"' not in jsx:
    # 既存のuseEffectでGAS_URLにfetchしてる箇所の直前に追加
    jsx = jsx.replace(
        'fetch(GAS_URL,',
        'gtag_event("diag_complete", { score, result_type: result.type, danger_level: result.danger }); fetch(GAS_URL,',
        1
    )
    print("✅ App.jsx: diag_complete イベント追加")

# 5. CTAクリックイベント（HubSpotリンク）
if 'gtag_event("cta_click_hubspot"' not in jsx:
    jsx = jsx.replace(
        'href="https://meetings-na2.hubspot.com/info12998"',
        'href="https://meetings-na2.hubspot.com/info12998" onClick={() => gtag_event("cta_click_hubspot", { result_type: result.type })}',
        1
    )
    print("✅ App.jsx: cta_click_hubspot イベント追加")

# 6. CTAクリックイベント（note簡易診断リンク）
if 'gtag_event("cta_click_note"' not in jsx:
    jsx = jsx.replace(
        'href="https://note.com/logotoru/n/n536f16992fea"',
        'href="https://note.com/logotoru/n/n536f16992fea" onClick={() => gtag_event("cta_click_note", { result_type: result.type })}',
        1
    )
    print("✅ App.jsx: cta_click_note イベント追加")

# 7. Xシェアクリックイベント
if 'gtag_event("share_x"' not in jsx:
    # twitter.com/intent/tweet の箇所
    jsx = jsx.replace(
        'window.open(`https://twitter.com/intent/tweet',
        'gtag_event("share_x", { result_type: result.type, score }); window.open(`https://twitter.com/intent/tweet',
        1
    )
    print("✅ App.jsx: share_x イベント追加")

with open("src/App.jsx", "w") as f:
    f.write(jsx)

print("\n🎉 完了。git add . && git commit -m 'add GA4 analytics' && git push を実行してください。")
