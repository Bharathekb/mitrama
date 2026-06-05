import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";

const PeoplePanel = ({ token, onBack, onNotify, onChanged }) => {
    const [users, setUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const headers = useMemo(() => ({ "x-token": token }), [token]);

    const getFollowButtonText = (person) => {
        if (person.connectionStatus === "accepted") return "Following";
        if (person.connectionStatus === "pending") {
            return person.connectionDirection === "sent" ? "Requested" : "Respond";
        }
        return "Follow";
    };

    const isFollowDisabled = (person) => {
        return Boolean(person.connectionStatus);
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
                        <div className="people-info">
                            <span>{person.username}</span>
                        </div>
                        <button
                            disabled={isFollowDisabled(person)}
                            onClick={() => sendRequest(person._id)}
                        >
                            {getFollowButtonText(person)}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PeoplePanel;
