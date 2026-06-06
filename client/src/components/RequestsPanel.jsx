import React, { useState } from "react";
import axios from "axios";
import UserAvatar from "./UserAvatar";
import ConfirmModal from "./ConfirmModal";

const RequestsPanel = ({
  incomingRequests,
  sentRequests,
  token,
  onBack,
  onChanged,
  onNotify,
}) => {
  const headers = { "x-token": token };
  const [confirmCancelRequest, setConfirmCancelRequest] = useState(null);

  const acceptRequest = (connectionId) => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/connections/accept/${connectionId}`,
        {},
        { headers }
      )
      .then(() => {
        onChanged();
        onNotify("Request accepted", "success");
      })
      .catch((err) =>
        onNotify(err.response?.data || "Accept failed", "error")
      );
  };

  const cancelRequest = (person) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/connections/request/${person._id}`, {
        headers,
      })
      .then((res) => {
        setConfirmCancelRequest(null);
        onChanged();
        onNotify(res.data || "Request cancelled", "success");
      })
      .catch((err) => {
        setConfirmCancelRequest(null);
        onNotify(err.response?.data || "Could not cancel request", "error");
      });
  };

  return (
    <div className="requests-screen">
      <div className="chat-title">
        <button
          type="button"
          className="back-btn"
          aria-label="Back to home"
          onClick={onBack}
        >
          <img src="/Arrow-left-gray.svg" alt="" />
        </button>
        <span>Requests</span>
      </div>

      <div className="requests-content">
        <section className="request-section">
          <h4>Received ({incomingRequests.length})</h4>

          {incomingRequests.length === 0 && <p>No received requests</p>}

          {incomingRequests.map((request) => (
            <div key={request._id} className="people-row">
              <div className="people-info-row">
                <UserAvatar user={request.requester} />
                <span>{request.requester.username}</span>
              </div>
              <button onClick={() => acceptRequest(request._id)}>Accept</button>
            </div>
          ))}
        </section>

        <section className="request-section">
          <h4>Requested ({sentRequests.length})</h4>

          {sentRequests.length === 0 && <p>No sent requests</p>}

          {sentRequests.map((person) => (
            <div key={person._id} className="people-row">
              <div className="people-info-row">
                <UserAvatar user={person} />
                <span>{person.username}</span>
              </div>
              <button
                className="danger-lite"
                onClick={() => setConfirmCancelRequest(person)}
              >
                Undo
              </button>
            </div>
          ))}
        </section>
      </div>

      {confirmCancelRequest && (
        <ConfirmModal
          title="Undo request?"
          message={`Cancel your follow request to ${confirmCancelRequest.username}?`}
          confirmText="Undo"
          danger
          onConfirm={() => cancelRequest(confirmCancelRequest)}
          onCancel={() => setConfirmCancelRequest(null)}
        />
      )}
    </div>
  );
};

export default RequestsPanel;
