export const replaceGraphQlKey = (endpoint: string, key: string) => {
  const updatedEndpoint = endpoint.includes("{key}") ? endpoint.replace("{key}", key) : endpoint;
  return updatedEndpoint;
};
