'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var ENQUEUE = '@@middleware/queue/ENQUEUE';

exports.default = function () {
  var promisesPerId = {};

  return function (next) {
    return function (action) {
      if (action && action.type === ENQUEUE) {
        var _ret = function () {
          var id = action.id;

          var existingPromise = promisesPerId[id] || Promise.resolve();

          var completionHandler = void 0;
          var continuationPromise = new Promise(function (res) {
            completionHandler = res;
          });
          var queuePromise = existingPromise.then(function () {
            return completionHandler;
          });
          promisesPerId[id] = queuePromise.then(function () {
            return continuationPromise;
          });

          return {
            v: queuePromise
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }

      return next(action);
    };
  };
};

var enqueue = exports.enqueue = function enqueue(id) {
  return {
    type: ENQUEUE,
    id: id
  };
};
