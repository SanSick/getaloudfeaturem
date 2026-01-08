import { useState, useEffect } from "react";

import questions from "./api/questions";
import "./index.css";

function App() {
  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  };

  const [currentQuestion, setCurrentQuestion] = useState(getRandomQuestion());

 const readAloud = () => {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-Speech not supported");
    return;
  }

  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  // Try to find Indian English / Hindi voice
  const indianVoice =
    voices.find(v => v.lang === "en-IN") ||
    voices.find(v => v.lang === "hi-IN") ||
    voices.find(v => v.name.toLowerCase().includes("india")) ||
    voices.find(v => v.name.toLowerCase().includes("heera")) ||
    voices.find(v => v.name.toLowerCase().includes("ravi")) ||
    voices.find(v => v.lang.startsWith("en"));

  const utterance = new SpeechSynthesisUtterance(currentQuestion.text);

  utterance.voice = indianVoice || null;
  utterance.lang = indianVoice?.lang || "en-IN";
  utterance.rate = 0.9;   // natural speed
  utterance.pitch = 1;    // natural tone
  utterance.volume = 1;

  synth.cancel();
  synth.speak(utterance);
};

  const nextQuestion = () => {
    window.speechSynthesis.cancel();
    setCurrentQuestion(getRandomQuestion());
  };


  useEffect(() => {
  window.speechSynthesis.getVoices();
}, []);

  return (
    <div className="container">
      <h1>Read Aloud Practice</h1>

      <div className="card">
        <p className="question">{currentQuestion.text}</p>

        <div className="btn-group">
          <button onClick={readAloud} className="btn">
            🔊 Read Aloud
          </button>

          <button onClick={nextQuestion} className="btn secondary">
            🔁 Next Question
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
