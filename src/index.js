const ENQUEUE = '@@middleware/queue/ENQUEUE';

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
