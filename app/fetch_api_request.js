import { sendResponseMessage } from "./utils/index.js";

export const handleFetchApiRequest = (connection, responseMessage, buffer) => {
  const throttleTime = Buffer.from([0, 0, 0, 0]);
  const errorCode = Buffer.from([0, 0]);
  const sessionId = Buffer.from([0, 0, 0, 0]);
  const responses = Buffer.from([1]);
  const tagBuffer = Buffer.from([0]);

  let fetchRequestResponse = {
    correlationId: responseMessage.correlationId,
    responseHeaderTagbuffer: tagBuffer,
    throttleTime,
    errorCode,
    sessionId,
    responses,
    tagBuffer,
  };

  const messageSizeBuffer = Buffer.alloc(4);
  messageSizeBuffer.writeInt32BE([
    Buffer.concat(Object.values(fetchRequestResponse)).length,
  ]);
  fetchRequestResponse = {
    messageSize: messageSizeBuffer,
    ...fetchRequestResponse,
  };

  sendResponseMessage(connection, fetchRequestResponse);
};
