import { searchInstance } from "../../../../../nexus-js-helpers";
import * as types from "./types";

// TODO should client be dep injected instead of hardcoded?
const client = ({ api, token, query, from, size }) => {
  if (!query) {
    return Promise.resolve({ results: [], total: 0 });
  }
  return searchInstance(query + "*", null, null, api, false, token, from, size);
};

const search = (typeActions, searchClient) => ({ query, api, token, from, size }) => {
  if (!api) { console.error('missing required property "api" for search action'); }
  return (dispatch, getState) => {
    dispatch(typeActions.searchPending());
    return searchClient({ api, token, query, from, size })
      .then(response =>
        dispatch(
          typeActions.searchFulfilled({
            results: response.results,
            hits: response.total
          })
        )
      )
      .catch(error => dispatch(typeActions.searchFailed(error)));
  };
};

const searchPending = reducerKey => () => {
  return {
    type: reducerKey + types.SEARCH_PENDING
  };
};

const searchFulfilled = reducerKey => ({ results, hits }) => {
  return {
    type: reducerKey + types.SEARCH_FULFILLED,
    payload: { results, hits }
  };
};

const searchFailed = reducerKey => error => {
  return {
    type: reducerKey + types.SEARCH_FAILED,
    error
  };
};

export default reducerKey => {
  const typeActions = {
    searchFulfilled: searchFulfilled(reducerKey),
    searchPending: searchPending(reducerKey),
    searchFailed: searchFailed(reducerKey)
  };
  return {
    search: search(typeActions, client),
    ...typeActions
  };
};
