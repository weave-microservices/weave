exports.emitter = (_, broker) => ({
  emit (eventName, payload, groups) {
    return broker.emit(eventName, payload, groups)
  }
})
