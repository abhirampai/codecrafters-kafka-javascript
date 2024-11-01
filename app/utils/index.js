export const pick = (obj, ...args) => ({
  ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {}),
});

export const sendResponseMessage = (connection, messageObj) => {
  return connection.write(Buffer.concat(Object.values(messageObj)));
};
