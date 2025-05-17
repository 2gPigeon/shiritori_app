import React, { useState, useEffect } from "react";

const normalizeLastChar = (word) => {
  const small = { 'ぁ':'あ', 'ぃ':'い', 'ぅ':'う', 'ぇ':'え', 'ぉ':'お', 'ゃ':'や', 'ゅ':'ゆ', 'ょ':'よ', 'っ':'つ' };
  let char = word.at(-1);
  if (char === 'ー') char = word.at(-2);
  return small[char] || char;
};

const ShiritoriApp = () => {
  const [dictSet, setDictSet] = useState(new Set());
  const [history, setHistory] = useState([]);
  const [usedWords, setUsedWords] = useState(new Set());
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/words.json")
      .then(res => res.json())
      .then(data => {
        const set = new Set(data.map(item => item.word));
        setDictSet(set);
      });
  }, []);

  const resetGame = () => {
    setHistory([]);
    setUsedWords(new Set());
    setInput("");
    setMessage("ゲームをリスタートしました！");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const word = input.trim();
    if (!word) return;

    if (!dictSet.has(word)) {
      setMessage("辞書にない単語です");
      setInput("");
      return;
    }
    if (usedWords.has(word)) {
      setMessage("その単語はもう使いました、ゲームを終了します！");
      setUsedWords(new Set(usedWords).add(word));
      setHistory([...history, word]);
      return;
    }
    if (normalizeLastChar(word) === "ん" || normalizeLastChar(word) === "ン") {
      setMessage(`${word}で終了！「ん」が付きました`);
      setUsedWords(new Set(usedWords).add(word));
      setHistory([...history, word]);
      return;
    }
    if (history.length > 0) {
      const prev = normalizeLastChar(history.at(-1));
      const current = word[0];
      if (prev !== current) {
        setMessage(`「${prev}」から始まる言葉にしてね`);
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
    newSet.add(word);
    setUsedWords(newSet);
    setHistory([...history, word]);
    setInput("");
    setMessage("OK！");
  };

  return (
    <div>
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
    </div>
  );
};

export default ShiritoriApp;
