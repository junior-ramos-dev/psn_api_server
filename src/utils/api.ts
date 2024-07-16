// helper function to get token value
export const getBearerTokenFromHeader = (authToken: any) => {
  return authToken.split(" ")[1];
};
