import { useState, useEffect, useRef } from "react";
import questions from "./api/questions";
import { supabase } from "./supabaseClient";
import "./index.css";

function App() {
  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  };

  const [currentQuestion, setCurrentQuestion] = useState(getRandomQuestion());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [score, setScore] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Load voices once
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  const readAloud = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-Speech not supported");
      return;
    }

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    // 🔁 If already speaking → STOP
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    // Try to find Indian English / Hindi voice
    const indianVoice =
      voices.find((v) => v.lang === "en-IN") ||
      voices.find((v) => v.lang === "hi-IN") ||
      voices.find((v) => v.name.toLowerCase().includes("india")) ||
      voices.find((v) => v.name.toLowerCase().includes("heera")) ||
      voices.find((v) => v.name.toLowerCase().includes("ravi")) ||
      voices.find((v) => v.lang.startsWith("en"));

    const utterance = new SpeechSynthesisUtterance(currentQuestion.text);

    utterance.voice = indianVoice || null;
    utterance.lang = indianVoice?.lang || "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    synth.cancel();
    synth.speak(utterance);
    setIsSpeaking(true);
  };

  //  Start Recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  //  Stop Recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm"
      });
  
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
  
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
  
        let calculatedScore = 0;
        if (duration < 5) calculatedScore = 15;
        else if (duration < 10) calculatedScore = 30;
        else if (duration < 15) calculatedScore = 50;
        else if (duration < 20) calculatedScore = 70;
        else if (duration < 25) calculatedScore = 80;
        else calculatedScore = 90;
  
        setScore(calculatedScore);
      };
  
      uploadRecording(audioBlob);
    };
  };
  

  // Upload to Supabase
  const uploadRecording = async (audioBlob) => {
    const fileName = `recordings/${currentQuestion.id}-${Date.now()}.webm`;

    const { error } = await supabase.storage
      .from("read-aloud-recordings")
      .upload(fileName, audioBlob);

    if (error) {
      console.error("Supabase upload error:", error);
      alert(error.message);
      return;
    }

    const { data } = supabase.storage
      .from("read-aloud-recordings")
      .getPublicUrl(fileName);

    setRecordingUrl(data.publicUrl);
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

        {!isAdminView && (
          <>
            <div className="btn-group">
              <button onClick={readAloud}>🔊 Read Aloud</button>

              {!isRecording ? (
                <button onClick={startRecording}>🎙 Start</button>
              ) : (
                <button onClick={stopRecording}>⏹ Stop</button>
              )}
            </div>

            <button className="next" onClick={nextQuestion}>
              🔁 Next Question
            </button>
          </>
        )}

        {recordingUrl && (
          <div className="audio">
            <p>
              {isAdminView ? "User Recording (Admin Access)" : "Your Recording"}
            </p>
            <audio controls src={recordingUrl}></audio>
          </div>
        )}

        {score !== null && (
          <p>
            <strong>Score:</strong> {score} / 90
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
