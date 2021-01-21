exports.broadcaster = (broker) => ({
    broadcaster(eventName, payload, groups) {
        return broker.broadcast(eventName, payload, groups);
    }
});
