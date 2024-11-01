import net from "net";

const pick = (obj, ...args) => ({
  ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), { })
})

const sendResponseMessage = (connection, messageObj) => {
  return connection.write(Buffer.concat(Object.values(messageObj)));
};

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

  // const responseMessage = {
  //   messageSize: Buffer.from(new Array(4).fill(0)),
  //   correlationId: Buffer.from([...new Array(3).fill(0), 7]),
  // };

  // sendResponseMessage(connection, responseMessage);
});

server.listen(9092, "127.0.0.1");
