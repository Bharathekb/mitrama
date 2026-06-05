import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";

const PeoplePanel = ({ token, onAccepted, onNotify, onChanged }) => {
    const [users, setUsers] = useState([]);
    const [pending, setPending] = useState([]);
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

    const loadData = useCallback(() => {
        setIsLoading(true);

        Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/users`, { headers }),
            axios.get(`${process.env.REACT_APP_API_URL}/connections/pending`, {
                headers,
            }),
        ])
            .then(([usersRes, pendingRes]) => {
                setUsers(usersRes.data);
                setPending(pendingRes.data);
            })
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

    const acceptRequest = (connectionId) => {
        axios
            .put(
                `${process.env.REACT_APP_API_URL}/connections/accept/${connectionId}`,
                {},
                { headers }
            )
            .then(() => {
                loadData();
                onAccepted();
                onNotify("Request accepted", "success");
            })
            .catch((err) =>
                onNotify(err.response?.data || "Accept failed", "error")
            );
    };

    return (
        <div className="people-panel">
            {isLoading && <LoadingSpinner label="Loading people" />}

            {!isLoading && (
                <>
            <h4>Requests</h4>

            {pending.length === 0 && <p>No requests</p>}

            {pending.map((request) => (
                <div key={request._id} className="people-row">
                    <span>{request.requester.username}</span>
                    <button onClick={() => acceptRequest(request._id)}>Accept</button>
                </div>
            ))}

            <h4>Find People</h4>

            {users.map((person) => (
                <div key={person._id} className="people-row">
                    <span>{person.username}</span>
                    <button
                        disabled={isFollowDisabled(person)}
                        onClick={() => sendRequest(person._id)}
                    >
                        {getFollowButtonText(person)}
                    </button>
                </div>
            ))}
                </>
            )}
        </div>
    );
};

export default PeoplePanel;
