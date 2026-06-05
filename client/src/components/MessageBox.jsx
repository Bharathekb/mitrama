import React from "react";

const MessageBox = ({ message, isOwnMessage, onDelete }) => {
  const downloadName =
    message.mediaName ||
    (message.type === "audio"
      ? `voice-message-${message._id}.webm`
      : `mitrama-file-${message._id}`);

  const formatMessageTime = (value) => {
    if (!value) return "";

    const messageDate = new Date(value);
    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();

    const time = messageDate.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    if (isToday) {
      return `Today ${time}`;
    }

    const date = messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });

    return `${date}, ${time}`;
  };

  return (
    <div className={`message-row ${isOwnMessage ? "own" : ""}`}>
      <div className="message-content">
        {!isOwnMessage && (
          <p className="message-sender">{message.sender?.username}</p>
        )}

        <div className="message-box">
          {isOwnMessage && (
            <button
              type="button"
              className="message-delete-btn"
              aria-label="Delete message"
              onClick={() => onDelete(message._id)}
            >
              &times;
            </button>
          )}

          {message.type === "audio" ? (
            <>
              <audio className="message-audio" controls src={message.audioData}>
                <source src={message.audioData} type={message.audioMimeType} />
              </audio>
              <a
                className="message-download"
                href={message.audioData}
                download={downloadName}
              >
                Download audio
              </a>
            </>
          ) : message.type === "image" ? (
            <>
              <img
                className="message-media-image"
                src={message.mediaData}
                alt={message.mediaName || "Shared image"}
              />
              <a
                className="message-download"
                href={message.mediaData}
                download={downloadName}
              >
                Download image
              </a>
            </>
          ) : message.type === "video" ? (
            <>
              <video
                className="message-media-video"
                controls
                src={message.mediaData}
              >
                <source src={message.mediaData} type={message.mediaMimeType} />
              </video>
              <a
                className="message-download"
                href={message.mediaData}
                download={downloadName}
              >
                Download video
              </a>
            </>
          ) : message.type === "file" ? (
            <div className="message-file">
              <span>FILE</span>
              <strong>{message.mediaName || "Shared file"}</strong>
              <a href={message.mediaData} download={downloadName}>
                Download
              </a>
            </div>
          ) : (
            <p className="msg-text">{message.text}</p>
          )}
          <span className="message-time">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
