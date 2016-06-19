import test from 'ava';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import queue, { enqueue } from '../src';

const createReduxStore = () => {
  const middlewares = applyMiddleware(
    thunk,
    queue
  );

  return createStore(x => x, {}, middlewares);
};

test('simple queue', t => {
  t.plan(1);

  const store = createReduxStore();
  return store.dispatch(async dispatch => {
    const completionHandler = await dispatch(enqueue('id'));
    completionHandler();
    t.pass();
  });
});

test('multiple queues', t => {
  t.plan(2);

  let currentValue;

  const store = createReduxStore();
  return Promise.all([
    store.dispatch(async dispatch => {
      currentValue = 1;
      const completionHandler = await dispatch(enqueue('id'));

      await new Promise(res => { setTimeout(res, 200); });

      t.is(currentValue, 1);
      completionHandler();
    }),
    store.dispatch(async dispatch => {
      const completionHandler = await dispatch(enqueue('id'));
      currentValue = 2;
      completionHandler();
      t.is(currentValue, 2);
    }),
  ]);
});

test('tangent queues', t => {
  t.plan(2);

  let currentValue;

  const store = createReduxStore();
  return Promise.all([
    store.dispatch(async dispatch => {
      currentValue = 1;
      const completionHandler = await dispatch(enqueue('id1'));

      await new Promise(res => { setTimeout(res, 200); });

      t.is(currentValue, 2);
      completionHandler();
    }),
    store.dispatch(async dispatch => {
      const completionHandler = await dispatch(enqueue('id2'));
      currentValue = 2;
      completionHandler();
      t.is(currentValue, 2);
    }),
  ]);
});
