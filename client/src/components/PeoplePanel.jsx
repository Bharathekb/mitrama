import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";
import UserAvatar from "./UserAvatar";
import ConfirmModal from "./ConfirmModal";

const PeoplePanel = ({ token, onBack, onNotify, onChanged }) => {
    const [users, setUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [confirmUnfollow, setConfirmUnfollow] = useState(null);
    const [confirmCancelRequest, setConfirmCancelRequest] = useState(null);

    const headers = useMemo(() => ({ "x-token": token }), [token]);

    const getFollowButtonText = (person) => {
        if (person.connectionStatus === "accepted") return "Unfollow";
        if (person.connectionStatus === "pending") {
            return person.connectionDirection === "sent" ? "Undo" : "Respond";
        }
        return "Follow";
    };

    const isFollowDisabled = (person) => {
        return (
            person.connectionStatus === "pending" &&
            person.connectionDirection !== "sent"
        );
    };

    const filteredUsers = users.filter((person) => {
        const query = searchText.trim().toLowerCase();

        if (!query) return true;

        return person.username?.toLowerCase().includes(query);
    });

    const loadData = useCallback(() => {
        setIsLoading(true);

        axios
            .get(`${process.env.REACT_APP_API_URL}/users`, { headers })
            .then((res) => setUsers(res.data))
            .catch((err) => console.log(err))
            .finally(() => setIsLoading(false));
    }, [headers]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const sendRequest = (receiverId) => {
        axios
            .post(
                `${process.env.REACT_APP_API_URL}/connections/request/${receiverId}`,
                {},
                { headers }
            )
            .then(() => {
                onNotify("Request sent", "success");
                loadData();
                onChanged();
            })
            .catch((err) => {
                loadData();
                onNotify(err.response?.data || "Request failed", "error");
            });
    };

    const cancelRequest = (person) => {
        axios
            .delete(`${process.env.REACT_APP_API_URL}/connections/request/${person._id}`, {
                headers,
            })
            .then((res) => {
                onNotify(res.data || "Request cancelled", "success");
                setConfirmCancelRequest(null);
                loadData();
                onChanged();
            })
            .catch((err) => {
                setConfirmCancelRequest(null);
                onNotify(err.response?.data || "Could not cancel request", "error");
            });
    };

    const unfollowUser = (person) => {
        axios
            .delete(`${process.env.REACT_APP_API_URL}/connections/${person._id}`, {
                headers,
            })
            .then((res) => {
                onNotify(res.data || "Unfollowed", "success");
                setConfirmUnfollow(null);
                loadData();
                onChanged();
            })
            .catch((err) => {
                setConfirmUnfollow(null);
                onNotify(err.response?.data || "Could not unfollow", "error");
            });
    };

    return (
        <div className="people-screen">
            <div className="chat-title">
                <button
                    type="button"
                    className="back-btn"
                    aria-label="Back to home"
                    onClick={onBack}
                >
                    <img src="/Arrow-left-gray.svg" alt="" />
                </button>
                <span>Find People</span>
            </div>

            <div className="people-content">
                <input
                    type="search"
                    className="people-search"
                    placeholder="Search people"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />

                {isLoading && <LoadingSpinner label="Loading people" />}

                {!isLoading && filteredUsers.length === 0 && (
                    <p className="people-empty">No people found</p>
                )}

                {!isLoading && filteredUsers.map((person) => (
                    <div key={person._id} className="people-row">
                        <div className="people-info-row">
                            <UserAvatar user={person} />
                            <span>{person.username}</span>
                        </div>
                        <button
                            disabled={isFollowDisabled(person)}
                            className={
                                person.connectionStatus === "accepted" ||
                                person.connectionDirection === "sent"
                                    ? "danger-lite"
                                    : ""
                            }
                            onClick={() => {
                                if (person.connectionStatus === "accepted") {
                                    setConfirmUnfollow(person);
                                    return;
                                }

                                if (
                                    person.connectionStatus === "pending" &&
                                    person.connectionDirection === "sent"
                                ) {
                                    setConfirmCancelRequest(person);
                                    return;
                                }

                                sendRequest(person._id);
                            }}
                        >
                            {getFollowButtonText(person)}
                        </button>
                    </div>
                ))}
            </div>

            {confirmUnfollow && (
                <ConfirmModal
                    title="Unfollow user?"
                    message={`You will no longer be able to chat with ${confirmUnfollow.username}.`}
                    confirmText="Unfollow"
                    danger
                    onConfirm={() => unfollowUser(confirmUnfollow)}
                    onCancel={() => setConfirmUnfollow(null)}
                />
            )}

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

export default PeoplePanel;
