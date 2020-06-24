module.exports = messagetypes => {
  const messageTypeIndexes = {}
  Object.keys(messagetypes).forEach((messageType, index) => {
    messageTypeIndexes[messagetypes[messageType]] = index
  })
  return {
    getIndexByType (messageType) {
      return messageTypeIndexes[messageType]
    },
    getTypeByIndex (index) {
      return Object.keys(messageTypeIndexes).find(key => messageTypeIndexes[key] === index)
    }
  }
}
