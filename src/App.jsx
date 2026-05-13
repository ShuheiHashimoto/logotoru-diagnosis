import { useState, useEffect, useRef } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycbzzs98F0KjbeAZtQ07K3RtCdL8AeUrsVzvihAKXrONhb7KSmQDnQ37-0mer-sxtWWfESg/exec";

const STEPS = [
  {
    title: "営業思想",
    icon: "🧠",
    questions: [
      {
        q: "営業チームの朝会で最も飛び交う言葉は？",
        options: [
          { text: "「市場の反応データから何が見えた？」", score: 0 },
          { text: "「今月の着地は？」", score: 2 },
          { text: "「先週のアポの進捗を共有して」", score: 3 },
          { text: "「アポ数が足りない、もっと打て」", score: 4 },
          { text: "「とにかく電話しろ。考えるのは後だ」", score: 5 },
        ],
      },
      {
        q: "「BDR活動を止めましょう」と言える人は社内にいますか？",
        options: [
          { text: "いる。データで判断して実際に止めた実績がある", score: 0 },
          { text: "いる。ただし発言力が弱く、結局続行になる", score: 2 },
          { text: "言いたい人はいるが、誰も言い出せない空気がある", score: 3 },
          { text: "いない。止めたら売上が消えるから", score: 4 },
          { text: "止める？そんな発想自体がなかった", score: 5 },
        ],
      },
      {
        q: "「質より量」と「量より質」、社内ではどちらが正義ですか？",
        options: [
          { text: "質。データで「量の限界」を証明済み", score: 0 },
          { text: "質寄り。ただし数字が厳しくなると量に逃げることもある", score: 2 },
          { text: "建前は質、本音は量。結局アポ数で評価される", score: 3 },
          { text: "量。打たなきゃ始まらない", score: 4 },
          { text: "圧倒的に量。リストが尽きたら新しいリストを買う", score: 5 },
        ],
      },
    ],
  },
  {
    title: "組織の目標設計",
    icon: "🎯",
    questions: [
      {
        q: "BDRチームのKPIは？",
        options: [
          { text: "有効会話率・ネガ蓄積率などの市場指標", score: 0 },
          { text: "有効会話数（率ではなく数）", score: 2 },
          { text: "アポ数（商談設定数）", score: 3 },
          { text: "架電数・メール送信数", score: 4 },
          { text: "KPIが明確に設定されていない", score: 5 },
        ],
      },
      {
        q: "BDRが「今月は市場の反応が悪い」と報告したら上司は何と言う？",
        options: [
          { text: "「データ見せて。閾値と比較して判断しよう」", score: 0 },
          { text: "「なるほど。原因を一緒に分析しよう」", score: 1 },
          { text: "「そうなんだ…（で、アポは？）」", score: 3 },
          { text: "「言い訳するな。数を打て」", score: 4 },
          { text: "そもそもそういう報告の仕組みがない", score: 5 },
        ],
      },
      {
        q: "BDR活動の「撤退基準」は明文化されていますか？",
        options: [
          { text: "ある。指標がX%を切ったら止めるルールがある", score: 0 },
          { text: "ある。ただし守られないことが多い", score: 2 },
          { text: "明文化はないが、暗黙の判断基準はある", score: 3 },
          { text: "ない。予算がある限り続ける", score: 4 },
          { text: "撤退？考えたこともなかった", score: 5 },
        ],
      },
    ],
  },
  {
    title: "営業活動の品質",
    icon: "📊",
    questions: [
      {
        q: "同じ企業に何回アプローチしたか、把握していますか？",
        options: [
          { text: "全件トラッキングし、接触回数別の効果分析もしている", score: 0 },
          { text: "全件トラッキングしている", score: 1 },
          { text: "SFAに記録はあるが集計してない", score: 3 },
          { text: "たぶん誰も正確には知らない", score: 4 },
          { text: "重複してても気にしてない", score: 5 },
        ],
      },
      {
        q: "「受付ブロック」が増えてきたとき、何が起きますか？",
        options: [
          { text: "接触密度を分析して、チャネルや頻度を調整する", score: 0 },
          { text: "一旦止めて、時間を空けてから再アプローチ", score: 2 },
          { text: "トークスクリプトを変えて再トライ", score: 3 },
          { text: "気合で突破。数を打てば当たる", score: 4 },
          { text: "受付ブロックが増えてるかどうか把握してない", score: 5 },
        ],
      },
      {
        q: "ターゲットリストの「残り」をどれくらい把握していますか？",
        options: [
          { text: "残存率を月次でモニタリングし、補充計画もある", score: 0 },
          { text: "残存率は見ている。ただし補充は後手に回りがち", score: 2 },
          { text: "リストの総数は分かるが消化率は不明", score: 3 },
          { text: "リストが尽きたら新しく買う", score: 4 },
          { text: "リスト？無限にあるでしょ", score: 5 },
        ],
      },
    ],
  },
  {
    title: "営業組織の構造",
    icon: "🏗️",
    questions: [
      {
        q: "BDRの成果が落ちたとき、最初に疑うのは？",
        options: [
          { text: "市場の状態（ネガ蓄積、残存率、接触密度）", score: 0 },
          { text: "リストの質やターゲティング", score: 2 },
          { text: "トークスクリプトやオファー設計", score: 3 },
          { text: "担当者のスキル・やる気", score: 4 },
          { text: "特に分析せず「もっと頑張れ」で終わる", score: 5 },
        ],
      },
      {
        q: "BDR代行を使ったことがある場合、何が起きましたか？",
        options: [
          { text: "使ったことがない", score: 1 },
          { text: "使って成果も出たが、市場データの引き継ぎに課題があった", score: 2 },
          { text: "アポは出たが質が低かった", score: 3 },
          { text: "最初は良かったが、だんだん数が減った", score: 4 },
          { text: "使ったが何が起きたかよく分からないまま終わった", score: 5 },
        ],
      },
      {
        q: "BDR活動の「引き継ぎ」で、何が引き継がれますか？",
        options: [
          { text: "企業ごとの反応履歴・温度感・NG理由の構造化データ", score: 0 },
          { text: "企業ごとの反応履歴と温度感メモ", score: 1 },
          { text: "リストと架電結果のメモ", score: 3 },
          { text: "リストだけ。あとは口頭で引き継ぎ", score: 4 },
          { text: "ほぼ何も。また一からやり直し", score: 5 },
        ],
      },
    ],
  },
  {
    title: "現状把握",
    icon: "🔍",
    questions: [
      {
        q: "BDR活動の「有効会話率」を即答できますか？",
        options: [
          { text: "できる。月次推移もトレンドも把握している", score: 0 },
          { text: "できる。先月は○%だった", score: 1 },
          { text: "多分出せるが、集計に時間がかかる", score: 3 },
          { text: "出せるか分からない。SFAにデータはあるはず", score: 4 },
          { text: "有効会話率って何？", score: 5 },
        ],
      },
      {
        q: "3ヶ月前の営業活動が今月の成果にどう影響しているか、説明できますか？",
        options: [
          { text: "時間ラグ付きの相関分析で定量的に把握している", score: 0 },
          { text: "肌感として「前に頑張った分が今効いてる」程度の理解", score: 2 },
          { text: "なんとなくそういうこともあるかな、という認識", score: 3 },
          { text: "3ヶ月前？そんなに遡って考えたことがない", score: 4 },
          { text: "今月の成果は今月の行動量で決まるものでは？", score: 5 },
        ],
      },
      {
        q: "BDR活動を「続けるべきか・変えるべきか・止めるべきか」の判断は、何に基づいていますか？",
        options: [
          { text: "構造化されたデータと明確な閾値", score: 0 },
          { text: "月次レポートの数字をざっと見て判断", score: 2 },
          { text: "マネージャーの経験と勘", score: 3 },
          { text: "予算が残っている限り続ける", score: 4 },
          { text: "そもそも「止める」という選択肢を検討したことがない", score: 5 },
        ],
      },
    ],
  },
];

const RESULTS = [
  {
    min: 0, max: 15,
    type: "市場観測型",
    emoji: "🟢",
    color: "#10B981",
    bg: "linear-gradient(135deg, #064E3B 0%, #10B981 100%)",
    tagline: "あなたの組織はBDR市場を「観測」できている。",
    description: "データに基づいた判断ができる、かなり成熟したBDR組織。有効会話率、ネガ蓄積率、残存率。市場の状態を数字で把握し、「止める」判断もできている。",
    advice: "次のステップは、時間ラグ付きの相関分析。「今月のネガ率上昇が3ヶ月後に何を引き起こすか」を予測できるようになると、さらに判断精度が上がる。",
    metrics: [
      { name: "時間ラグ付き相関", desc: "ネガ率とN月後の有効会話率の関係" },
      { name: "チャネル別CPA", desc: "投資効率を最適化する次の一手" },
      { name: "判断バッジの的中率", desc: "過去の判断が正しかったかの検証" },
    ],
    danger: "低",
    shareText: "🟢 焼畑危険度：低\n市場観測型と診断されました。BDR市場を「観測」できている成熟した組織。",
  },
  {
    min: 16, max: 35,
    type: "経験依存型",
    emoji: "🟡",
    color: "#F59E0B",
    bg: "linear-gradient(135deg, #78350F 0%, #F59E0B 100%)",
    tagline: "勘は鋭い。でもデータの裏付けがない。",
    description: "優秀なマネージャーの経験値で回っている組織。市場の変化に「なんとなく」気づけているが、それを構造化されたデータで説明できない。判断の再現性がなく、人が変わると崩壊するリスクがある。",
    advice: "まず有効会話率とネガ蓄積率の月次モニタリングを始めること。「今の市場は健全なのか」をデータで答えられる状態にするだけで、判断の質が劇的に変わる。",
    metrics: [
      { name: "有効会話率", desc: "アプローチ対比の会話到達割合" },
      { name: "累積ネガパーソン率", desc: "市場の不可逆な毀損の度合い" },
      { name: "パーソン残存率", desc: "まだ接触していないリストの残り" },
    ],
    danger: "中",
    shareText: "🟡 焼畑危険度：中\n経験依存型と診断されました。勘は鋭いが、データの裏付けがない。人が変わると崩壊するリスクあり。",
  },
  {
    min: 36, max: 55,
    type: "焼畑予備軍",
    emoji: "🟠",
    color: "#F97316",
    bg: "linear-gradient(135deg, #7C2D12 0%, #F97316 100%)",
    tagline: "市場を、燃やしかけている。",
    description: "「量を打てば当たる」が組織の基本思想。アポ数がKPIで、受付ブロックが増えても気合で突破しようとする。市場は有限資源であるという認識がなく、気づかないうちにターゲットリストが摩耗している。",
    advice: "至急やるべきこと：残存率の確認。「まだアプローチしていない企業が何%残っているか」。この数字が50%を切っていたら、市場は既に半分消費されている。これ以上量を増やすと不可逆な摩耗が始まる。",
    metrics: [
      { name: "パーソン残存率", desc: "リストの何%がまだ未接触か" },
      { name: "ネガティブ率（月次）", desc: "今月のNG反応の割合" },
      { name: "接触密度", desc: "1社あたりの平均接触回数" },
    ],
    danger: "高",
    shareText: "🟠 焼畑危険度：高\n焼畑予備軍と診断されました。市場を燃やしかけている。「量を打てば当たる」が組織の基本思想。",
  },
  {
    min: 56, max: 75,
    type: "焼畑進行型",
    emoji: "🔴",
    color: "#EF4444",
    bg: "linear-gradient(135deg, #7F1D1D 0%, #EF4444 100%)",
    tagline: "市場は、もう燃えている。",
    description: "アポ数を追い、量で補填し、受付ブロックをスクリプト変更で突破しようとしている。BDR活動の撤退基準がなく、予算がある限り続ける。3ヶ月前の活動が今月の成果を蝕んでいることに気づいていない。市場の摩耗は既に進行中。",
    advice: "今すぐやるべきこと：2週間、BDR活動を完全に止めてデータを棚卸しする。有効会話率、ネガ蓄積率、残存率を計算する。その数字が「続けるべきか、止めるべきか」を教えてくれる。",
    metrics: [
      { name: "有効会話率", desc: "アプローチ対比の会話到達割合" },
      { name: "累積ネガパーソン率", desc: "市場がどこまで毀損しているか" },
      { name: "パーソン残存率", desc: "リストの枯渇度を確認" },
    ],
    danger: "極めて高い",
    shareText: "🔴 焼畑危険度：極めて高い\n焼畑進行型と診断されました。市場は既に燃えている。3ヶ月前の活動が今月の成果を蝕んでいる。",
  },
];

function getResult(score) {
  return RESULTS.find(r => score >= r.min && score <= r.max) || RESULTS[RESULTS.length - 1];
}

const Progress = ({ current, total }) => (
  <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        flex: 1, height: 4, borderRadius: 2,
        background: i <= current ? "#F97316" : "rgba(255,255,255,0.15)",
        transition: "background 0.3s ease",
      }} />
    ))}
  </div>
);

const StartScreen = ({ onStart }) => (
  <div style={{
    minHeight: "100dvh", display: "flex", flexDirection: "column",
    justifyContent: "center", alignItems: "center", padding: "40px 24px",
    background: "linear-gradient(180deg, #0C0C0C 0%, #1A0A00 50%, #0C0C0C 100%)",
    textAlign: "center",
  }}>
    <div style={{
      fontSize: 64, marginBottom: 16,
      animation: "pulse 2s ease-in-out infinite",
    }}>🔥</div>
    <h1 style={{
      fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900,
      fontSize: "clamp(28px, 7vw, 40px)", color: "#FFF",
      lineHeight: 1.3, marginBottom: 12, letterSpacing: "-0.02em",
    }}>
      焼畑営業<br />危険度診断
    </h1>
    <p style={{
      fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14,
      color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.05em",
    }}>
      by LOGOTORU
    </p>
    <p style={{
      fontFamily: "'Noto Sans JP', sans-serif", fontSize: 15,
      color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: 32,
      maxWidth: 320,
    }}>
      あなたの営業組織は<br />
      市場を「観測」できているか？<br />
      それとも「焼いて」いるか？<br /><br />
      <span style={{ color: "#F97316", fontWeight: 700 }}>15問・約3分</span>で判明します。
    </p>
    <button onClick={onStart} style={{
      fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700,
      fontSize: 16, color: "#FFF", background: "#F97316",
      border: "none", borderRadius: 12, padding: "16px 48px",
      cursor: "pointer", transition: "all 0.2s ease",
      boxShadow: "0 0 24px rgba(249,115,22,0.4)",
    }}>
      診断を始める
    </button>
    <style>{`@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
  </div>
);

const QuestionScreen = ({ step, qIndex, question, onAnswer, totalQ, answeredCount }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (idx) => {
    setSelected(idx);
    setTimeout(() => {
      onAnswer(question.options[idx].score);
      setSelected(null);
    }, 400);
  };

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      padding: "24px 20px", background: "#0C0C0C",
    }}>
      <Progress current={answeredCount} total={totalQ} />
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
      }}>
        <span style={{ fontSize: 20 }}>{STEPS[step].icon}</span>
        <span style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12,
          color: "#F97316", fontWeight: 700, letterSpacing: "0.1em",
        }}>
          STEP {step + 1}/5 — {STEPS[step].title}
        </span>
      </div>
      <p style={{
        fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13,
        color: "rgba(255,255,255,0.4)", marginBottom: 16,
      }}>
        Q{answeredCount + 1} / {totalQ}
      </p>
      <h2 style={{
        fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 800,
        fontSize: "clamp(18px, 5vw, 22px)", color: "#FFF",
        lineHeight: 1.6, marginBottom: 32, letterSpacing: "-0.01em",
      }}>
        {question.q}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {question.options.map((opt, idx) => (
          <button key={idx} onClick={() => handleSelect(idx)} style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: 15,
            fontWeight: 600, color: selected === idx ? "#0C0C0C" : "#FFF",
            background: selected === idx ? "#F97316" : "rgba(255,255,255,0.06)",
            border: "1px solid",
            borderColor: selected === idx ? "#F97316" : "rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "16px 20px",
            cursor: "pointer", textAlign: "left",
            transition: "all 0.3s ease", lineHeight: 1.5,
            transform: selected === idx ? "scale(0.98)" : "scale(1)",
          }}>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
};

const ResultScreen = ({ score, onRestart }) => {
  const result = getResult(score);
  const maxScore = 75;
  const pct = Math.round((score / maxScore) * 100);

  const cardRef = useRef(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ score, result_type: result.type, danger_level: result.danger, user_agent: navigator.userAgent })
    }).catch(() => {});
  }, []);

  const shareUrl = "https://claude.ai/public/artifacts/10d051bc-33b7-4026-bc86-b3a95fb0bd3b";
  const shareTextFull = `${result.shareText}\n\n3分で診断 👇\n${shareUrl}`;

  const handleShareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextFull)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopy = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = shareTextFull;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.width = "2em";
      ta.style.height = "2em";
      ta.style.padding = "0";
      ta.style.border = "none";
      ta.style.outline = "none";
      ta.style.boxShadow = "none";
      ta.style.background = "transparent";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      document.execCommand("copy");
      document.body.removeChild(ta);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch (e) {
      window.prompt("下のテキストをコピーしてください：", shareTextFull);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "32px 20px",
      background: "#0C0C0C",
    }}>
      <p style={{
        fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12,
        color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em",
        marginBottom: 16, fontWeight: 600,
      }}>
        DIAGNOSIS RESULT
      </p>

      {/* Card */}
      <div ref={cardRef} style={{
        width: "100%", maxWidth: 360, borderRadius: 20,
        background: result.bg, padding: "32px 24px",
        position: "relative", overflow: "hidden",
        boxShadow: `0 0 40px ${result.color}33`,
        marginBottom: 24,
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />
        <div style={{
          position: "absolute", bottom: -20, left: -20,
          width: 100, height: 100, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{result.emoji}</div>
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12,
            color: "rgba(255,255,255,0.6)", fontWeight: 600,
            letterSpacing: "0.1em", marginBottom: 4,
          }}>
            焼畑危険度
          </p>
          <h2 style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900,
            fontSize: 28, color: "#FFF", marginBottom: 4, letterSpacing: "-0.02em",
          }}>
            {result.type}
          </h2>
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13,
            color: "rgba(255,255,255,0.7)", marginBottom: 16,
          }}>
            危険度スコア: {score}/{maxScore}（{pct}%）
          </p>

          {/* Danger bar */}
          <div style={{
            height: 6, borderRadius: 3, background: "rgba(0,0,0,0.3)",
            marginBottom: 16, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${pct}%`, background: "#FFF",
              transition: "width 1.5s ease-out",
            }} />
          </div>

          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14,
            color: "#FFF", fontWeight: 700, lineHeight: 1.6,
          }}>
            {result.tagline}
          </p>

          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: 11,
            color: "rgba(255,255,255,0.5)", marginTop: 16,
            letterSpacing: "0.05em",
          }}>
            LOGOTORU 焼畑営業危険度診断
          </p>
        </div>
      </div>

      {/* Description */}
      <div style={{
        width: "100%", maxWidth: 360, background: "rgba(255,255,255,0.04)",
        borderRadius: 16, padding: "24px 20px", marginBottom: 16,
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14,
          color: "rgba(255,255,255,0.8)", lineHeight: 1.8,
        }}>
          {result.description}
        </p>
      </div>

      {/* Advice */}
      <div style={{
        width: "100%", maxWidth: 360,
        background: `${result.color}15`, borderRadius: 16,
        padding: "24px 20px", marginBottom: 16,
        border: `1px solid ${result.color}33`,
      }}>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12,
          color: result.color, fontWeight: 700, letterSpacing: "0.1em",
          marginBottom: 8,
        }}>
          💡 NEXT ACTION
        </p>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14,
          color: "rgba(255,255,255,0.8)", lineHeight: 1.8,
        }}>
          {result.advice}
        </p>
      </div>

      {/* Metrics - 今すぐ見るべき3指標 */}
      <div style={{
        width: "100%", maxWidth: 360, background: "rgba(255,255,255,0.04)",
        borderRadius: 16, padding: "24px 20px", marginBottom: 24,
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12,
          color: "#F97316", fontWeight: 700, letterSpacing: "0.1em",
          marginBottom: 16,
        }}>
          📊 今すぐ確認すべき3指標
        </p>
        {result.metrics.map((m, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            marginBottom: i < 2 ? 14 : 0,
            paddingBottom: i < 2 ? 14 : 0,
            borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <span style={{
              fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13,
              color: result.color, fontWeight: 800, minWidth: 20,
            }}>{i + 1}</span>
            <div>
              <p style={{
                fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14,
                color: "#FFF", fontWeight: 700, marginBottom: 2,
              }}>{m.name}</p>
              <p style={{
                fontFamily: "'Noto Sans JP', sans-serif", fontSize: 12,
                color: "rgba(255,255,255,0.5)", lineHeight: 1.5,
              }}>{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Share buttons */}
      <div style={{
        width: "100%", maxWidth: 360, display: "flex", gap: 8, marginBottom: 16,
      }}>
        <button onClick={handleShareX} style={{
          flex: 1, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700,
          fontSize: 14, color: "#FFF", background: "#000",
          border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12,
          padding: "14px 16px", cursor: "pointer",
        }}>
          𝕏 でシェア
        </button>
        <button onClick={handleCopy} style={{
          flex: 1, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700,
          fontSize: 14, color: "#FFF", background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12,
          padding: "14px 16px", cursor: "pointer",
        }}>
          {shared ? "✓ コピー済み" : "結果をコピー"}
        </button>
      </div>

      {/* CTA */}
      <div style={{
        width: "100%", maxWidth: 360, background: "linear-gradient(135deg, #1A0A00 0%, #2D1200 100%)",
        borderRadius: 16, padding: "28px 20px", marginBottom: 16,
        border: "1px solid rgba(249,115,22,0.3)", textAlign: "center",
      }}>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13,
          color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 4,
        }}>
          この診断は入口に過ぎません。
        </p>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 15,
          color: "#FFF", fontWeight: 700, lineHeight: 1.8, marginBottom: 16,
        }}>
          御社のBDRデータを基に<br />
          <span style={{ color: "#F97316" }}>今後6ヶ月の市場摩耗予測</span>を<br />
          無料で算出します。
        </p>
        <a href="https://meetings-na2.hubspot.com/info12998" target="_blank" rel="noopener noreferrer" style={{
          display: "inline-block", fontFamily: "'Noto Sans JP', sans-serif",
          fontWeight: 700, fontSize: 15, color: "#FFF",
          background: "#F97316", border: "none", borderRadius: 12,
          padding: "14px 32px", textDecoration: "none",
          boxShadow: "0 0 24px rgba(249,115,22,0.4)",
        }}>
          30分で御社の市場残存率を算出する（無料）→
        </a>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 11,
          color: "rgba(255,255,255,0.35)", marginTop: 12,
        }}>
          無料・30分・BDRデータなしでもヒアリングで算出可能
        </p>
      </div>

      {/* note CTA - 市場健全性診断への誘導 */}
      <div style={{
        width: "100%", maxWidth: 360, textAlign: "center",
        padding: "20px 20px", marginBottom: 16,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14,
          color: "#FFF", fontWeight: 700, lineHeight: 1.8, marginBottom: 8,
        }}>
          📊 さらに詳しく診断したい方へ
        </p>
        <p style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13,
          color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 12,
        }}>
          具体的な数値を入力すると、3ヶ月後の有効会話率・商談数・リスト枯渇時期を予測できます。
        </p>
        <a href="https://note.com/logotoru/n/n536f16992fea" target="_blank" rel="noopener noreferrer" style={{
          display: "inline-block", fontFamily: "'Noto Sans JP', sans-serif",
          fontWeight: 700, fontSize: 14, color: "#F97316",
          background: "rgba(249,115,22,0.1)",
          border: "1px solid rgba(249,115,22,0.3)", borderRadius: 10,
          padding: "12px 24px", textDecoration: "none",
        }}>
          BDR市場健全性 簡易診断（無料）→
        </a>
      </div>

      {/* Restart */}
      <button onClick={onRestart} style={{
        fontFamily: "'Noto Sans JP', sans-serif", fontSize: 13,
        color: "rgba(255,255,255,0.4)", background: "none",
        border: "none", cursor: "pointer", padding: "8px 16px",
      }}>
        もう一度診断する
      </button>
    </div>
  );
};

export default function App() {
  const [phase, setPhase] = useState("start");
  const [step, setStep] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const totalQ = STEPS.reduce((sum, s) => sum + s.questions.length, 0);

  const handleStart = () => setPhase("quiz");

  const handleAnswer = (pts) => {
    const newScore = score + pts;
    setScore(newScore);
    const newAnswered = answeredCount + 1;
    setAnsweredCount(newAnswered);

    const currentStep = STEPS[step];
    if (qIndex + 1 < currentStep.questions.length) {
      setQIndex(qIndex + 1);
    } else if (step + 1 < STEPS.length) {
      setStep(step + 1);
      setQIndex(0);
    } else {
      setPhase("result");
    }
  };

  const handleRestart = () => {
    setPhase("start");
    setStep(0);
    setQIndex(0);
    setScore(0);
    setAnsweredCount(0);
  };

  if (phase === "start") return <StartScreen onStart={handleStart} />;
  if (phase === "result") return <ResultScreen score={score} onRestart={handleRestart} />;

  const question = STEPS[step].questions[qIndex];
  return (
    <QuestionScreen
      step={step} qIndex={qIndex} question={question}
      onAnswer={handleAnswer} totalQ={totalQ} answeredCount={answeredCount}
    />
  );
}
