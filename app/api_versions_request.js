import { API_KEY_VERSIONS } from "./constants.js";
import { apiVersioningResponseFields, pick, sendResponseMessage } from "./utils/index.js";

export const handleApiVersionsRequest = (
  connection,
  responseMessage,
  requestVersion,
) => {
  const errorCode = Buffer.from([0, 0]);
  const maxVersion = Buffer.from([0, 4]);
  const minVersion = Buffer.from([0, 0]);
  const throttleTimeMs = Buffer.from([0, 0, 0, 0]);
  const tagBuffer = Buffer.from([0]);
  const apiKeyLength = Buffer.from([2]);
  
  const updatedResponseMessage = {
    ...responseMessage,
    errorCode,
    apiKeyLength,
    maxVersion,
    minVersion,
    arrayTagBuffer: tagBuffer,
    throttleTimeMs,
    tagBuffer,
  };

  if (!API_KEY_VERSIONS.includes(requestVersion)) {
    updatedResponseMessage.errorCode = Buffer.from([0, 35]);
    sendResponseMessage(
      connection,
      pick(updatedResponseMessage, "messageSize", "correlationId", "errorCode"),
    );
  } else {
    updatedResponseMessage.messageSize = Buffer.from([0, 0, 0, 19]);
    sendResponseMessage(
      connection,
      pick(
        updatedResponseMessage,
        "messageSize",
        ...apiVersioningResponseFields(requestVersion),
      ),
    );
  }
};