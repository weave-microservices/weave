interface TCPMessageTypeHelper {
  getIndexByType(messageType: string): number;
  getTypeByIndex(index: number): string | undefined;
}

export default (messagetypes: Record<string, string>): TCPMessageTypeHelper => {
  const messageTypeIndexes: Record<string, number> = {};

  Object.keys(messagetypes).forEach((messageType, index) => {
    messageTypeIndexes[messagetypes[messageType]] = index;
  });

  return {
    getIndexByType(messageType: string): number {
      return messageTypeIndexes[messageType];
    },
    getTypeByIndex(index: number): string | undefined {
      return Object.keys(messageTypeIndexes).find((key) => messageTypeIndexes[key] === index);
    },
  };
};
