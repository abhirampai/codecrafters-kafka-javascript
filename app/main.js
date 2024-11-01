import net from "net";

const server = net.createServer((connection) => {
  const responseMessage = {
    messageSize: Buffer.from(new Array(4).fill(0)),
    correlationId: Buffer.from([...new Array(3).fill(0), 7])
  }

  connection.write(Buffer.concat(Object.values(responseMessage)));
});

server.listen(9092, "127.0.0.1");
