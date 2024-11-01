export const pick = (obj, ...args) => ({
  ...args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {}),
});

export const sendResponseMessage = (connection, messageObj) => {
  return connection.write(Buffer.concat(Object.values(messageObj)));
};

export const apiVersioningResponseFields = (version) => {
  const defaultFields = [
    "correlationId",
    "errorCode",
    "apiKeyLength",
    "requestApiKey",
    "minVersion",
    "maxVersion"
  ];
  switch (version) {
    case 0:
      return defaultFields;
    case 1:
    case 2:
      return [...defaultFields, "throttleTimeMs"];
    case 3:
    case 4:
      return [...defaultFields, "arrayTagBuffer","throttleTimeMs", "tagBuffer"];
  }
};
