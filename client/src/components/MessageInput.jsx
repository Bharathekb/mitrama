import React, { useEffect, useRef, useState } from "react";

const MessageInput = ({ onSend, onSendAudio, onSendMedia }) => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaPreview, setMediaPreview] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    const timer = setInterval(() => {
      setRecordingSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording]);

  const formatRecordingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError("Please enter a message");
      return;
    }

    onSend(text);
    setText("");
    setError("");
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const startRecording = async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Recording is not supported in this browser");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      streamRef.current = stream;
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        const reader = new FileReader();

        reader.onloadend = () => {
          onSendAudio({
            audioData: reader.result,
            audioMimeType: audioBlob.type,
          });
        };

        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.log(err);
      setError("Microphone permission is required");
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError("File must be under 8MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview({
        mediaData: reader.result,
        mediaMimeType: file.type,
        mediaName: file.name,
      });
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const sendMediaPreview = () => {
    if (!mediaPreview) return;

    onSendMedia(mediaPreview);
    setMediaPreview(null);
  };

  return (
    <div className="message-composer">
      {mediaPreview && (
        <div className="media-preview">
          <div className="media-preview-frame">
            {mediaPreview.mediaMimeType.startsWith("image/") ? (
              <img src={mediaPreview.mediaData} alt={mediaPreview.mediaName} />
            ) : mediaPreview.mediaMimeType.startsWith("video/") ? (
              <video src={mediaPreview.mediaData} controls />
            ) : (
              <div className="file-preview">
                <span className="file-preview-icon">PDF</span>
                <strong>{mediaPreview.mediaName}</strong>
              </div>
            )}
          </div>
          <div className="media-preview-actions">
            <span>{mediaPreview.mediaName}</span>
            <button type="button" onClick={() => setMediaPreview(null)}>
              Cancel
            </button>
            <button type="button" onClick={sendMediaPreview}>
              Send
            </button>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="recording-banner">
          <span className="recording-pulse"></span>
          <span>Recording...</span>
          <strong>{formatRecordingTime(recordingSeconds)}</strong>
        </div>
      )}

      <form className="message-input" onSubmit={handleSubmit}>
        <div className="message-input-field">
          <input
            type="text"
            placeholder="Type a message"
            value={text}
            aria-invalid={Boolean(error)}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError("");
            }}
          />
          {error && <p className="message-input-error">{error}</p>}
        </div>
        <input
          ref={fileInputRef}
        className="media-file-input"
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        onChange={handleFileChange}
      />
        <button
        type="button"
        className="attach-btn"
        aria-label="Attach file"
          onClick={() => fileInputRef.current?.click()}
        >
          +
        </button>
        <button
          type="button"
          className={`mic-btn ${isRecording ? "recording" : ""}`}
          aria-label={isRecording ? "Stop recording" : "Record voice message"}
          onClick={handleRecordClick}
        >
          <img src="/mic.svg" alt="" />
        </button>
        <button type="submit" aria-label="Send message">
          <img src="/send-icon.svg" alt="" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
