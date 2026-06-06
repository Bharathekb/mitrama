import React, { useRef, useState } from "react";

const MessageBox = ({ message, isOwnMessage, onDelete }) => {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const longPressTimerRef = useRef(null);
  const downloadName =
    message.mediaName ||
    (message.type === "audio"
      ? `voice-message-${message._id}.webm`
      : `mitrama-file-${message._id}`);

  const renderDownloadButton = (href, label) => (
    <a
      className="message-download-icon"
      href={href}
      download={downloadName}
      aria-label={label}
      title={label}
    >
      <img src="/download.svg" alt="" />
    </a>
  );

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

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) return;

    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const startLongPress = () => {
    if (!isOwnMessage) return;

    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      setIsActionOpen(true);
    }, 550);
  };

  const cancelLongPress = () => {
    clearLongPressTimer();
  };

  const requestDelete = () => {
    setIsActionOpen(false);
    onDelete(message._id);
  };

  const renderMessageStatus = () => {
    if (!isOwnMessage) return null;

    if (message.isRead) {
      return <span className="message-status seen">Seen</span>;
    }

    return (
      <span className={`message-status ${message.isDelivered ? "delivered" : ""}`}>
        {message.isDelivered ? "✓✓" : "✓"}
      </span>
    );
  };

  return (
    <div className={`message-row ${isOwnMessage ? "own" : ""}`}>
      <div className="message-content">
        {!isOwnMessage && (
          <p className="message-sender">{message.sender?.username}</p>
        )}

        <div
          className={`message-box ${isActionOpen ? "action-open" : ""}`}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchCancel={cancelLongPress}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onContextMenu={(event) => {
            if (!isOwnMessage) return;
            event.preventDefault();
            setIsActionOpen(true);
          }}
        >
          {isOwnMessage && (
            <button
              type="button"
              className="message-delete-btn"
              aria-label="Delete message"
              onClick={requestDelete}
            >
              &times;
            </button>
          )}

          {isOwnMessage && isActionOpen && (
            <div className="message-action-popover">
              <button type="button" onClick={requestDelete}>
                Delete
              </button>
              <button type="button" onClick={() => setIsActionOpen(false)}>
                Cancel
              </button>
            </div>
          )}

          {message.type === "audio" ? (
            <div className="message-audio-card">
              <div className="audio-card-icon">
                <span></span>
              </div>
              <div className="audio-card-body">
                <span>Voice message</span>
                <audio className="message-audio" controls src={message.audioData}>
                  <source src={message.audioData} type={message.audioMimeType} />
                </audio>
              </div>
              {renderDownloadButton(message.audioData, "Download audio")}
            </div>
          ) : message.type === "image" ? (
            <>
              <button
                type="button"
                className="message-image-btn"
                onClick={() => setIsImageOpen(true)}
                aria-label="Open image preview"
              >
                <img
                  className="message-media-image"
                  src={message.mediaData}
                  alt={message.mediaName || "Shared image"}
                />
              </button>
              {renderDownloadButton(message.mediaData, "Download image")}
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
              {renderDownloadButton(message.mediaData, "Download video")}
            </>
          ) : message.type === "file" ? (
            <div className="message-file">
              <span>FILE</span>
              <strong>{message.mediaName || "Shared file"}</strong>
              {renderDownloadButton(message.mediaData, "Download file")}
            </div>
          ) : (
            <p className="msg-text">{message.text}</p>
          )}
          <span className="message-time">
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
        {renderMessageStatus()}
      </div>

      {isImageOpen && (
        <div className="image-preview-overlay" role="dialog" aria-modal="true">
          <div className="image-preview-header">
            <span>{message.mediaName || "Image"}</span>
            <div>
              {renderDownloadButton(message.mediaData, "Download image")}
              <button
                type="button"
                className="image-preview-close"
                aria-label="Close image preview"
                onClick={() => setIsImageOpen(false)}
              >
                &times;
              </button>
            </div>
          </div>
          <button
            type="button"
            className="image-preview-backdrop"
            aria-label="Close image preview"
            onClick={() => setIsImageOpen(false)}
          />
          <img
            className="image-preview-large"
            src={message.mediaData}
            alt={message.mediaName || "Shared image"}
          />
        </div>
      )}
    </div>
  );
};

export default MessageBox;
