import { sendResponseMessage } from "./utils/index.js";

export const handleFetchApiRequest = (connection, responseMessage, buffer) => {
  const clientLength = buffer.subarray(12, 14);
  const clientLengthValue = clientLength.readInt16BE();
  const throttleTime = Buffer.from([0, 0, 0, 0]);
  const errorCode = Buffer.from([0, 0]);
  let responses = Buffer.from([1]);
  const tagBuffer = Buffer.from([0]);

  console.log("Buffer", buffer);

  const sessionIdIndex = clientLengthValue + 28; // skip 15 bytes before and 13 bytes after client record
  const sessionId = buffer.subarray(sessionIdIndex, sessionIdIndex + 4);
  const _sessionEpoch = buffer.subarray(sessionIdIndex + 4, sessionIdIndex + 8);
  const topicArrayLength = buffer.subarray(
    sessionIdIndex + 8,
    sessionIdIndex + 9,
  );
  console.log("sessionId", sessionId);
  console.log("sessionEpoch", _sessionEpoch);
  console.log("topicLength", topicArrayLength);

  console.log(
    "Array after fetching topicLength",
    buffer.subarray(sessionIdIndex + 9),
  );
  let topicIndex = sessionIdIndex + 9;
  if (topicArrayLength.readInt8() > 1) {
    const topics = new Array(topicArrayLength.readInt8() - 1)
      .fill(0)
      .map((_) => {
        const topicId = buffer.subarray(topicIndex, topicIndex + 16);
        console.log("topicId", topicId);
        topicIndex += 16;

        const partitionArrayIndex = topicIndex;
        const partitionLength = buffer.subarray(
          partitionArrayIndex,
          partitionArrayIndex + 1,
        );
        const partitionIndex = buffer.subarray(
          partitionArrayIndex + 1,
          partitionArrayIndex + 5,
        );
        console.log("partitionId", partitionIndex);
        const partitionError = Buffer.from([0, 100]);
        const highWaterMark = Buffer.from(new Array(8).fill(0));
        const last_stable_offset = Buffer.from(new Array(8).fill(0));
        const log_start_offset = Buffer.from(new Array(8).fill(0));
        const aborted_transactions = Buffer.from([0]);
        const preferredReadReplica = Buffer.from([0, 0, 0, 0]);
        const records = Buffer.from([0]);

        const partitionArrayBuffer = Buffer.concat([
          partitionLength,
          partitionIndex,
          partitionError,
          highWaterMark,
          last_stable_offset,
          log_start_offset,
          aborted_transactions,
          preferredReadReplica,
          records,
          tagBuffer,
        ]);

        return Buffer.concat([topicId, partitionArrayBuffer, tagBuffer]);
      });

    responses = Buffer.concat([topicArrayLength, ...topics]);
  }

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
