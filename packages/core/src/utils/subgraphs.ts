export const replaceGraphQlKey = (endpoint: string, key: string) => {
  if (endpoint.includes("{key}")) {
    endpoint = endpoint.replace("{key}", key);
  }
  return endpoint;
};
