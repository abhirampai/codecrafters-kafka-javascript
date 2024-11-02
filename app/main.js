import net from "net";

import { sendResponseMessage, pick } from "./utils/index.js";
import { handleApiVersionsRequest } from "./api_versions_request.js";
import { parseRequest } from "./request_parser.js";
import { handleDescribeTopicPartitionsRequest } from "./describe_topic_partitions_request.js";

const handleFetchApiRequest = (connection, responseMessage, buffer) => {
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

const server = net.createServer((connection) => {
  connection.on("data", (buffer) => {
    const { messageSize, requestApiKey, requestApiVersion, correlationId } =
      parseRequest(buffer);

    const responseMessage = {
      messageSize,
      requestApiKey,
      requestApiVersion,
      correlationId,
    };

    const requestVersion = requestApiVersion.readInt16BE();

    if (requestApiKey.readInt16BE() === 18) {
      handleApiVersionsRequest(connection, responseMessage, requestVersion);
    } else if (requestApiKey.readInt16BE() === 1) {
      handleFetchApiRequest(connection, responseMessage, buffer);
    } else if (requestApiKey.readInt16BE() === 75) {
      handleDescribeTopicPartitionsRequest(connection, responseMessage, buffer);
    } else {
      sendResponseMessage(
        connection,
        pick(responseMessage, "messageSize", "correlationId"),
      );
    }
  });
});

server.listen(9092, "127.0.0.1");
