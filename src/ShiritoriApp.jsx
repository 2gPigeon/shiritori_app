import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const toKatakana = (str) =>
  str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );

const normalizeLastChar = (word) => {
  const small = { 'ァ':'ア', 'ィ':'イ', 'ゥ':'ウ', 'ェ':'エ', 'ォ':'オ', 'ャ':'ヤ', 'ュ':'ユ', 'ョ':'ヨ', 'ッ':'ツ' };
  let char = word.at(-1);
  if (char === 'ー') char = word.at(-2);
  return small[char] || char;
};

const ShiritoriApp = () => {
  const [dictSet, setDictSet] = useState(new Set());
  const [history, setHistory] = useState([]);
  const [usedWords, setUsedWords] = useState(new Set());
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("ゲームを始めよう!");
  const [showRules, setShowRules] = useState(false);


  useEffect(() => {
    fetch(process.env.PUBLIC_URL +"/words.json")
      .then(res => res.json())
      .then(data => {
        const set = new Set(data.map(item => item.word));
        setDictSet(set);

        let first = null;
        for (let i = 0; i < 50; i++) {
          const candidate = data[Math.floor(Math.random() * data.length)].word;
          const firstChar = candidate[0];
          const lastChar = candidate.at(-1);
          if (firstChar !== "ン" && firstChar !== "ん" &&
              lastChar !== "ン" && lastChar !== "ん") {
            first = candidate;
            break;
          }
        }
        if (first) {
          setHistory([first]);
          setUsedWords(new Set([first]));
        } else {
          setMessage("適切な初期単語が見つかりませんでした");
        }
      });
  }, []);

  const resetGame = () => {
    if (dictSet.size === 0) return;

    const wordsArray = Array.from(dictSet);
    let first = null;

    for (let i = 0; i < 50; i++) {
      const candidate = wordsArray[Math.floor(Math.random() * wordsArray.length)];
      const firstChar = candidate[0];
      const lastChar = candidate.at(-1);
      if (firstChar !== "ン" && firstChar !== "ん" &&
          lastChar !== "ン" && lastChar !== "ん") {
        first = candidate;
        break;
      }
    }
    if (first){
      setHistory([first]);
      setUsedWords(new Set(first));
      setInput("");
      setMessage("ゲームをリスタートしました！");
    }else{
      setMessage("初期単語が見つからない！")
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const word = input.trim();
    const katakanaInput = toKatakana(word);
    if (!word) return;

    if (!dictSet.has(katakanaInput)) {
      setMessage("辞書にない単語です");
      setInput("");
      return;
    }
    if (usedWords.has(katakanaInput)) {
      setMessage("その単語はもう使いました、ゲームを終了します！");
      setUsedWords(new Set(usedWords).add(word));
      setHistory([...history, word]);
      setInput("");
      return;
    }
    if (["ン", "ん"].includes(normalizeLastChar(katakanaInput))) {
      setMessage(`${word}で終了！「ん」が付きました`);
      setUsedWords(new Set(usedWords).add(katakanaInput));
      setHistory([...history, word]); 
      setInput("");
      return;
    }
    if (history.length > 0) {
      const prev = normalizeLastChar(toKatakana(history.at(-1)));
      const current = katakanaInput[0];
      if (prev !== current) {
        setMessage(`「${prev}」から始まる言葉にしてね`);
        setInput("");
        return;
      }
    }
    if (word.length < 2) {
      setMessage("1文字の単語は使えません");
      setInput("");
      return;
    }

    // OK
    const newSet = new Set(usedWords);
    newSet.add(katakanaInput);
    setUsedWords(newSet);
    setHistory([...history, word]);
    setInput("");
    setMessage("OK！");
  };

  return (
    <div>
      <button
        className="btn btn-outline-info position-fixed"
        style={{ right: "0%", top: "0%", zIndex: 1001 }}
        onClick={() => setShowRules(!showRules)}
      >
        {showRules ? "閉じる" : "ルール"}
      </button>
      <h1>しりとり</h1>
      <p>{message}</p>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={message.includes("終了")}
        />
        <button type="submit">送信</button>
      </form>
      <ul>
        {history.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
      <button onClick={resetGame}>リセット</button>
        <div
          className={`position-fixed top-0 end-0 bg-light border-start p-3 shadow ${showRules ? 'd-block' : 'd-none'}`}
          style={{ width: "300px", height: "100vh", zIndex: 1000 }}
        >
          <h5>しりとりのルール</h5>
          <ul>
            <li>最後の文字から始まる言葉をつなげます</li>
            <li>同じ単語は使えません</li>
            <li>「ん」「ン」で終わったらゲーム終了</li>
            <li>辞書に存在しない語は無効です</li>
            <li>1文字・無意味な語も不可</li>
          </ul>
        </div>
    </div>
  );
};

export default ShiritoriApp;
