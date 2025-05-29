import { BETSWIRL_API_URL, BETWIRL_TEST_API_URL } from "../constants";

export const getBetSwirlApiUrl = (isTestMode = false) => {
  return isTestMode ? BETWIRL_TEST_API_URL : BETSWIRL_API_URL;
};
