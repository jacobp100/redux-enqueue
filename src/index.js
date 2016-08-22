const ENQUEUE = '@@middleware/queue/ENQUEUE';


/*
If you look at the api docs, you queue an item by calling

const completionHandler = await dispatch(enqueue('id'));

So what this means is that the return value of dispatch(enqueue('id')) is a promise that resolves
to give the function completionHandler.

Firstly, we store a promise per id, and have a default value of Promise.resolve().

When we dispatch an item to enqueue, we make a new promise, continuationPromise, that will resolve
when completionHandler is called.

We get then the previous promise for the id, and append a new promise to create queuePromise.
queuePromise immediately resolves with the completionHandler function. This is the promise that is
returned from dispatch.

We then extend queuePromise by appending the continuationPromise, so that we have a promise that
will be resolved once completionHandler is called (assuming we didn't attempt to enqueue anything
in-between). We use this new promise as the promise for the id, and all subsequent calls to enqueue
will use this promise as the starting point. This means that every time you call enqueue, you're
just awaiting and appending to a long list of promises. Every time you call it, you'll create two
promises.
*/
export default () => {
  const promisesPerId = {};

  return next => action => {
    if (action && action.type === ENQUEUE) {
      const { id } = action;
      const existingPromise = promisesPerId[id] || Promise.resolve();

      let completionHandler;
      const continuationPromise = new Promise(res => {
        completionHandler = res;
      });
      const queuePromise = existingPromise.then(() => completionHandler);
      promisesPerId[id] = queuePromise.then(() => continuationPromise);

      return queuePromise;
    }

    return next(action);
  };
};

export const enqueue = id => ({
  type: ENQUEUE,
  id,
});
