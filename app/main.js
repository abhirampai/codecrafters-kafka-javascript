import net from "net";

import { sendResponseMessage, pick } from "./utils/index.js";

const server = net.createServer((connection) => {
  connection.on("data", (buffer) => {
    const messageSize = buffer.subarray(0, 4);
    const requestApiKey = buffer.subarray(4, 6);
    const requestApiVersion = buffer.subarray(6, 8);
    const correlationId = buffer.subarray(8, 12);

    const responseMessage = {
      messageSize,
      requestApiKey,
      requestApiVersion,
      correlationId,
    };

    return sendResponseMessage(
      connection,
      pick(responseMessage, "messageSize", "correlationId"),
    );
  });
});

server.listen(9092, "127.0.0.1");
