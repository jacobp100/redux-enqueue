# redux-enqueue

Simple queue system for redux. Use with redux-thunk.

```
npm install --save redux-enqueue
```

# Create Store

Create a redux store using the enqueue middleware.

```js
// createStore.js
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import enqueueMiddleware from 'redux-enqueue';

const middlewares = applyMiddleware(
  thunkMiddleware,
  enqueueMiddleware
);

return createStore(reducers, initialState, middlewares);
```

# Integrate into Actions

Call `await dispatch(enqueue(queueId))`, which will return a function that you must call when the action is finished. This will ensure that actions sharing a `queueId`s will not be run concurrently, but actions with other `queueId`s may be.

Note that we're using try/finally. This is recommended: the code in the finally block is **guaranteed** to be run.

```js
// authentication.js
import { enqueue } from 'redux-enqueue';

export const login = (username, password) => async dispatch => {
  const completionHandler = await dispatch(enqueue('authentication:login')); // arbitrary id

  try {
    api.login(username, password);
  } finally {
    completionHandler();
  }
};

export const logout = () => async dispatch => {
  const completionHandler = await dispatch(enqueue('authentication:login')); // don't log out whilst logging in
  try {
    api.login();
  } finally {
    completionHandler();
  }
};
```

# Cookbook

## Fetching data

The below example will load messages for an id unless they've already been loaded. Fetching messages for different ids can happen concurrently. Fetching for the same id will not be able to happen in parallel, and no subsequent calls for this id will be executed after the first successful run.

```js
// messages.js
import { enqueue } from 'redux-enqueue';

export const loadMessages = id => async (dispatch, getState) => {
  const completionHandler = await dispatch(enqueue(`messages:loadMessages:${id}`));

  try {
    const { currentMessages } = getState().messages;
    if (currentMessages[id]) return;
    const messages = await api.loadMessages(id);
    dispatch({ type: SET_MESSAGES, messages });
  } finally {
    completionHandler();
  }
};
```
