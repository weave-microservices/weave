function qg(a, u) {
  for (var r = 0; r < u.length; r++) {
    const o = u[r];
    if (typeof o != "string" && !Array.isArray(o)) {
      for (const s in o)
        if (s !== "default" && !(s in a)) {
          const d = Object.getOwnPropertyDescriptor(o, s);
          d && Object.defineProperty(a, s, d.get ? d : { enumerable: !0, get: () => o[s] });
        }
    }
  }
  return Object.freeze(Object.defineProperty(a, Symbol.toStringTag, { value: "Module" }));
}
(function () {
  const u = document.createElement("link").relList;
  if (u && u.supports && u.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) o(s);
  new MutationObserver((s) => {
    for (const d of s)
      if (d.type === "childList")
        for (const m of d.addedNodes) m.tagName === "LINK" && m.rel === "modulepreload" && o(m);
  }).observe(document, { childList: !0, subtree: !0 });
  function r(s) {
    const d = {};
    return (
      s.integrity && (d.integrity = s.integrity),
      s.referrerPolicy && (d.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === "use-credentials"
        ? (d.credentials = "include")
        : s.crossOrigin === "anonymous"
          ? (d.credentials = "omit")
          : (d.credentials = "same-origin"),
      d
    );
  }
  function o(s) {
    if (s.ep) return;
    s.ep = !0;
    const d = r(s);
    fetch(s.href, d);
  }
})();
function Yh(a) {
  return a && a.__esModule && Object.prototype.hasOwnProperty.call(a, "default") ? a.default : a;
}
var vr = { exports: {} },
  ci = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ch;
function Vg() {
  if (ch) return ci;
  ch = 1;
  var a = Symbol.for("react.transitional.element"),
    u = Symbol.for("react.fragment");
  function r(o, s, d) {
    var m = null;
    if ((d !== void 0 && (m = "" + d), s.key !== void 0 && (m = "" + s.key), "key" in s)) {
      d = {};
      for (var h in s) h !== "key" && (d[h] = s[h]);
    } else d = s;
    return ((s = d.ref), { $$typeof: a, type: o, key: m, ref: s !== void 0 ? s : null, props: d });
  }
  return ((ci.Fragment = u), (ci.jsx = r), (ci.jsxs = r), ci);
}
var oh;
function Yg() {
  return (oh || ((oh = 1), (vr.exports = Vg())), vr.exports);
}
var b = Yg(),
  gr = { exports: {} },
  it = {};
/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var rh;
function Gg() {
  if (rh) return it;
  rh = 1;
  var a = Symbol.for("react.transitional.element"),
    u = Symbol.for("react.portal"),
    r = Symbol.for("react.fragment"),
    o = Symbol.for("react.strict_mode"),
    s = Symbol.for("react.profiler"),
    d = Symbol.for("react.consumer"),
    m = Symbol.for("react.context"),
    h = Symbol.for("react.forward_ref"),
    v = Symbol.for("react.suspense"),
    p = Symbol.for("react.memo"),
    S = Symbol.for("react.lazy"),
    x = Symbol.for("react.activity"),
    N = Symbol.iterator;
  function z(A) {
    return A === null || typeof A != "object"
      ? null
      : ((A = (N && A[N]) || A["@@iterator"]), typeof A == "function" ? A : null);
  }
  var D = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    U = Object.assign,
    M = {};
  function V(A, q, J) {
    ((this.props = A), (this.context = q), (this.refs = M), (this.updater = J || D));
  }
  ((V.prototype.isReactComponent = {}),
    (V.prototype.setState = function (A, q) {
      if (typeof A != "object" && typeof A != "function" && A != null)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, A, q, "setState");
    }),
    (V.prototype.forceUpdate = function (A) {
      this.updater.enqueueForceUpdate(this, A, "forceUpdate");
    }));
  function Y() {}
  Y.prototype = V.prototype;
  function X(A, q, J) {
    ((this.props = A), (this.context = q), (this.refs = M), (this.updater = J || D));
  }
  var Z = (X.prototype = new Y());
  ((Z.constructor = X), U(Z, V.prototype), (Z.isPureReactComponent = !0));
  var W = Array.isArray;
  function F() {}
  var Q = { H: null, A: null, T: null, S: null },
    et = Object.prototype.hasOwnProperty;
  function bt(A, q, J) {
    var k = J.ref;
    return { $$typeof: a, type: A, key: q, ref: k !== void 0 ? k : null, props: J };
  }
  function ht(A, q) {
    return bt(A.type, q, A.props);
  }
  function xt(A) {
    return typeof A == "object" && A !== null && A.$$typeof === a;
  }
  function I(A) {
    var q = { "=": "=0", ":": "=2" };
    return (
      "$" +
      A.replace(/[=:]/g, function (J) {
        return q[J];
      })
    );
  }
  var St = /\/+/g;
  function ft(A, q) {
    return typeof A == "object" && A !== null && A.key != null ? I("" + A.key) : q.toString(36);
  }
  function Ct(A) {
    switch (A.status) {
      case "fulfilled":
        return A.value;
      case "rejected":
        throw A.reason;
      default:
        switch (
          (typeof A.status == "string"
            ? A.then(F, F)
            : ((A.status = "pending"),
              A.then(
                function (q) {
                  A.status === "pending" && ((A.status = "fulfilled"), (A.value = q));
                },
                function (q) {
                  A.status === "pending" && ((A.status = "rejected"), (A.reason = q));
                },
              )),
          A.status)
        ) {
          case "fulfilled":
            return A.value;
          case "rejected":
            throw A.reason;
        }
    }
    throw A;
  }
  function _(A, q, J, k, at) {
    var st = typeof A;
    (st === "undefined" || st === "boolean") && (A = null);
    var pt = !1;
    if (A === null) pt = !0;
    else
      switch (st) {
        case "bigint":
        case "string":
        case "number":
          pt = !0;
          break;
        case "object":
          switch (A.$$typeof) {
            case a:
            case u:
              pt = !0;
              break;
            case S:
              return ((pt = A._init), _(pt(A._payload), q, J, k, at));
          }
      }
    if (pt)
      return (
        (at = at(A)),
        (pt = k === "" ? "." + ft(A, 0) : k),
        W(at)
          ? ((J = ""),
            pt != null && (J = pt.replace(St, "$&/") + "/"),
            _(at, q, J, "", function (Pn) {
              return Pn;
            }))
          : at != null &&
            (xt(at) &&
              (at = ht(
                at,
                J +
                  (at.key == null || (A && A.key === at.key)
                    ? ""
                    : ("" + at.key).replace(St, "$&/") + "/") +
                  pt,
              )),
            q.push(at)),
        1
      );
    pt = 0;
    var Kt = k === "" ? "." : k + ":";
    if (W(A))
      for (var Ht = 0; Ht < A.length; Ht++)
        ((k = A[Ht]), (st = Kt + ft(k, Ht)), (pt += _(k, q, J, st, at)));
    else if (((Ht = z(A)), typeof Ht == "function"))
      for (A = Ht.call(A), Ht = 0; !(k = A.next()).done; )
        ((k = k.value), (st = Kt + ft(k, Ht++)), (pt += _(k, q, J, st, at)));
    else if (st === "object") {
      if (typeof A.then == "function") return _(Ct(A), q, J, k, at);
      throw (
        (q = String(A)),
        Error(
          "Objects are not valid as a React child (found: " +
            (q === "[object Object]" ? "object with keys {" + Object.keys(A).join(", ") + "}" : q) +
            "). If you meant to render a collection of children, use an array instead.",
        )
      );
    }
    return pt;
  }
  function G(A, q, J) {
    if (A == null) return A;
    var k = [],
      at = 0;
    return (
      _(A, k, "", "", function (st) {
        return q.call(J, st, at++);
      }),
      k
    );
  }
  function K(A) {
    if (A._status === -1) {
      var q = A._result;
      ((q = q()),
        q.then(
          function (J) {
            (A._status === 0 || A._status === -1) && ((A._status = 1), (A._result = J));
          },
          function (J) {
            (A._status === 0 || A._status === -1) && ((A._status = 2), (A._result = J));
          },
        ),
        A._status === -1 && ((A._status = 0), (A._result = q)));
    }
    if (A._status === 1) return A._result.default;
    throw A._result;
  }
  var nt =
      typeof reportError == "function"
        ? reportError
        : function (A) {
            if (typeof window == "object" && typeof window.ErrorEvent == "function") {
              var q = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message:
                  typeof A == "object" && A !== null && typeof A.message == "string"
                    ? String(A.message)
                    : String(A),
                error: A,
              });
              if (!window.dispatchEvent(q)) return;
            } else if (typeof process == "object" && typeof process.emit == "function") {
              process.emit("uncaughtException", A);
              return;
            }
            console.error(A);
          },
    ct = {
      map: G,
      forEach: function (A, q, J) {
        G(
          A,
          function () {
            q.apply(this, arguments);
          },
          J,
        );
      },
      count: function (A) {
        var q = 0;
        return (
          G(A, function () {
            q++;
          }),
          q
        );
      },
      toArray: function (A) {
        return (
          G(A, function (q) {
            return q;
          }) || []
        );
      },
      only: function (A) {
        if (!xt(A))
          throw Error("React.Children.only expected to receive a single React element child.");
        return A;
      },
    };
  return (
    (it.Activity = x),
    (it.Children = ct),
    (it.Component = V),
    (it.Fragment = r),
    (it.Profiler = s),
    (it.PureComponent = X),
    (it.StrictMode = o),
    (it.Suspense = v),
    (it.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Q),
    (it.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function (A) {
        return Q.H.useMemoCache(A);
      },
    }),
    (it.cache = function (A) {
      return function () {
        return A.apply(null, arguments);
      };
    }),
    (it.cacheSignal = function () {
      return null;
    }),
    (it.cloneElement = function (A, q, J) {
      if (A == null) throw Error("The argument must be a React element, but you passed " + A + ".");
      var k = U({}, A.props),
        at = A.key;
      if (q != null)
        for (st in (q.key !== void 0 && (at = "" + q.key), q))
          !et.call(q, st) ||
            st === "key" ||
            st === "__self" ||
            st === "__source" ||
            (st === "ref" && q.ref === void 0) ||
            (k[st] = q[st]);
      var st = arguments.length - 2;
      if (st === 1) k.children = J;
      else if (1 < st) {
        for (var pt = Array(st), Kt = 0; Kt < st; Kt++) pt[Kt] = arguments[Kt + 2];
        k.children = pt;
      }
      return bt(A.type, at, k);
    }),
    (it.createContext = function (A) {
      return (
        (A = {
          $$typeof: m,
          _currentValue: A,
          _currentValue2: A,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (A.Provider = A),
        (A.Consumer = { $$typeof: d, _context: A }),
        A
      );
    }),
    (it.createElement = function (A, q, J) {
      var k,
        at = {},
        st = null;
      if (q != null)
        for (k in (q.key !== void 0 && (st = "" + q.key), q))
          et.call(q, k) && k !== "key" && k !== "__self" && k !== "__source" && (at[k] = q[k]);
      var pt = arguments.length - 2;
      if (pt === 1) at.children = J;
      else if (1 < pt) {
        for (var Kt = Array(pt), Ht = 0; Ht < pt; Ht++) Kt[Ht] = arguments[Ht + 2];
        at.children = Kt;
      }
      if (A && A.defaultProps)
        for (k in ((pt = A.defaultProps), pt)) at[k] === void 0 && (at[k] = pt[k]);
      return bt(A, st, at);
    }),
    (it.createRef = function () {
      return { current: null };
    }),
    (it.forwardRef = function (A) {
      return { $$typeof: h, render: A };
    }),
    (it.isValidElement = xt),
    (it.lazy = function (A) {
      return { $$typeof: S, _payload: { _status: -1, _result: A }, _init: K };
    }),
    (it.memo = function (A, q) {
      return { $$typeof: p, type: A, compare: q === void 0 ? null : q };
    }),
    (it.startTransition = function (A) {
      var q = Q.T,
        J = {};
      Q.T = J;
      try {
        var k = A(),
          at = Q.S;
        (at !== null && at(J, k),
          typeof k == "object" && k !== null && typeof k.then == "function" && k.then(F, nt));
      } catch (st) {
        nt(st);
      } finally {
        (q !== null && J.types !== null && (q.types = J.types), (Q.T = q));
      }
    }),
    (it.unstable_useCacheRefresh = function () {
      return Q.H.useCacheRefresh();
    }),
    (it.use = function (A) {
      return Q.H.use(A);
    }),
    (it.useActionState = function (A, q, J) {
      return Q.H.useActionState(A, q, J);
    }),
    (it.useCallback = function (A, q) {
      return Q.H.useCallback(A, q);
    }),
    (it.useContext = function (A) {
      return Q.H.useContext(A);
    }),
    (it.useDebugValue = function () {}),
    (it.useDeferredValue = function (A, q) {
      return Q.H.useDeferredValue(A, q);
    }),
    (it.useEffect = function (A, q) {
      return Q.H.useEffect(A, q);
    }),
    (it.useEffectEvent = function (A) {
      return Q.H.useEffectEvent(A);
    }),
    (it.useId = function () {
      return Q.H.useId();
    }),
    (it.useImperativeHandle = function (A, q, J) {
      return Q.H.useImperativeHandle(A, q, J);
    }),
    (it.useInsertionEffect = function (A, q) {
      return Q.H.useInsertionEffect(A, q);
    }),
    (it.useLayoutEffect = function (A, q) {
      return Q.H.useLayoutEffect(A, q);
    }),
    (it.useMemo = function (A, q) {
      return Q.H.useMemo(A, q);
    }),
    (it.useOptimistic = function (A, q) {
      return Q.H.useOptimistic(A, q);
    }),
    (it.useReducer = function (A, q, J) {
      return Q.H.useReducer(A, q, J);
    }),
    (it.useRef = function (A) {
      return Q.H.useRef(A);
    }),
    (it.useState = function (A) {
      return Q.H.useState(A);
    }),
    (it.useSyncExternalStore = function (A, q, J) {
      return Q.H.useSyncExternalStore(A, q, J);
    }),
    (it.useTransition = function () {
      return Q.H.useTransition();
    }),
    (it.version = "19.2.4"),
    it
  );
}
var sh;
function Yr() {
  return (sh || ((sh = 1), (gr.exports = Gg())), gr.exports);
}
var g = Yr();
const De = Yh(g),
  Gr = qg({ __proto__: null, default: De }, [g]);
var br = { exports: {} },
  oi = {},
  xr = { exports: {} },
  Sr = {};
/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var fh;
function Xg() {
  return (
    fh ||
      ((fh = 1),
      (function (a) {
        function u(_, G) {
          var K = _.length;
          _.push(G);
          t: for (; 0 < K; ) {
            var nt = (K - 1) >>> 1,
              ct = _[nt];
            if (0 < s(ct, G)) ((_[nt] = G), (_[K] = ct), (K = nt));
            else break t;
          }
        }
        function r(_) {
          return _.length === 0 ? null : _[0];
        }
        function o(_) {
          if (_.length === 0) return null;
          var G = _[0],
            K = _.pop();
          if (K !== G) {
            _[0] = K;
            t: for (var nt = 0, ct = _.length, A = ct >>> 1; nt < A; ) {
              var q = 2 * (nt + 1) - 1,
                J = _[q],
                k = q + 1,
                at = _[k];
              if (0 > s(J, K))
                k < ct && 0 > s(at, J)
                  ? ((_[nt] = at), (_[k] = K), (nt = k))
                  : ((_[nt] = J), (_[q] = K), (nt = q));
              else if (k < ct && 0 > s(at, K)) ((_[nt] = at), (_[k] = K), (nt = k));
              else break t;
            }
          }
          return G;
        }
        function s(_, G) {
          var K = _.sortIndex - G.sortIndex;
          return K !== 0 ? K : _.id - G.id;
        }
        if (
          ((a.unstable_now = void 0),
          typeof performance == "object" && typeof performance.now == "function")
        ) {
          var d = performance;
          a.unstable_now = function () {
            return d.now();
          };
        } else {
          var m = Date,
            h = m.now();
          a.unstable_now = function () {
            return m.now() - h;
          };
        }
        var v = [],
          p = [],
          S = 1,
          x = null,
          N = 3,
          z = !1,
          D = !1,
          U = !1,
          M = !1,
          V = typeof setTimeout == "function" ? setTimeout : null,
          Y = typeof clearTimeout == "function" ? clearTimeout : null,
          X = typeof setImmediate < "u" ? setImmediate : null;
        function Z(_) {
          for (var G = r(p); G !== null; ) {
            if (G.callback === null) o(p);
            else if (G.startTime <= _) (o(p), (G.sortIndex = G.expirationTime), u(v, G));
            else break;
            G = r(p);
          }
        }
        function W(_) {
          if (((U = !1), Z(_), !D))
            if (r(v) !== null) ((D = !0), F || ((F = !0), I()));
            else {
              var G = r(p);
              G !== null && Ct(W, G.startTime - _);
            }
        }
        var F = !1,
          Q = -1,
          et = 5,
          bt = -1;
        function ht() {
          return M ? !0 : !(a.unstable_now() - bt < et);
        }
        function xt() {
          if (((M = !1), F)) {
            var _ = a.unstable_now();
            bt = _;
            var G = !0;
            try {
              t: {
                ((D = !1), U && ((U = !1), Y(Q), (Q = -1)), (z = !0));
                var K = N;
                try {
                  e: {
                    for (Z(_), x = r(v); x !== null && !(x.expirationTime > _ && ht()); ) {
                      var nt = x.callback;
                      if (typeof nt == "function") {
                        ((x.callback = null), (N = x.priorityLevel));
                        var ct = nt(x.expirationTime <= _);
                        if (((_ = a.unstable_now()), typeof ct == "function")) {
                          ((x.callback = ct), Z(_), (G = !0));
                          break e;
                        }
                        (x === r(v) && o(v), Z(_));
                      } else o(v);
                      x = r(v);
                    }
                    if (x !== null) G = !0;
                    else {
                      var A = r(p);
                      (A !== null && Ct(W, A.startTime - _), (G = !1));
                    }
                  }
                  break t;
                } finally {
                  ((x = null), (N = K), (z = !1));
                }
                G = void 0;
              }
            } finally {
              G ? I() : (F = !1);
            }
          }
        }
        var I;
        if (typeof X == "function")
          I = function () {
            X(xt);
          };
        else if (typeof MessageChannel < "u") {
          var St = new MessageChannel(),
            ft = St.port2;
          ((St.port1.onmessage = xt),
            (I = function () {
              ft.postMessage(null);
            }));
        } else
          I = function () {
            V(xt, 0);
          };
        function Ct(_, G) {
          Q = V(function () {
            _(a.unstable_now());
          }, G);
        }
        ((a.unstable_IdlePriority = 5),
          (a.unstable_ImmediatePriority = 1),
          (a.unstable_LowPriority = 4),
          (a.unstable_NormalPriority = 3),
          (a.unstable_Profiling = null),
          (a.unstable_UserBlockingPriority = 2),
          (a.unstable_cancelCallback = function (_) {
            _.callback = null;
          }),
          (a.unstable_forceFrameRate = function (_) {
            0 > _ || 125 < _
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
                )
              : (et = 0 < _ ? Math.floor(1e3 / _) : 5);
          }),
          (a.unstable_getCurrentPriorityLevel = function () {
            return N;
          }),
          (a.unstable_next = function (_) {
            switch (N) {
              case 1:
              case 2:
              case 3:
                var G = 3;
                break;
              default:
                G = N;
            }
            var K = N;
            N = G;
            try {
              return _();
            } finally {
              N = K;
            }
          }),
          (a.unstable_requestPaint = function () {
            M = !0;
          }),
          (a.unstable_runWithPriority = function (_, G) {
            switch (_) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                _ = 3;
            }
            var K = N;
            N = _;
            try {
              return G();
            } finally {
              N = K;
            }
          }),
          (a.unstable_scheduleCallback = function (_, G, K) {
            var nt = a.unstable_now();
            switch (
              (typeof K == "object" && K !== null
                ? ((K = K.delay), (K = typeof K == "number" && 0 < K ? nt + K : nt))
                : (K = nt),
              _)
            ) {
              case 1:
                var ct = -1;
                break;
              case 2:
                ct = 250;
                break;
              case 5:
                ct = 1073741823;
                break;
              case 4:
                ct = 1e4;
                break;
              default:
                ct = 5e3;
            }
            return (
              (ct = K + ct),
              (_ = {
                id: S++,
                callback: G,
                priorityLevel: _,
                startTime: K,
                expirationTime: ct,
                sortIndex: -1,
              }),
              K > nt
                ? ((_.sortIndex = K),
                  u(p, _),
                  r(v) === null && _ === r(p) && (U ? (Y(Q), (Q = -1)) : (U = !0), Ct(W, K - nt)))
                : ((_.sortIndex = ct), u(v, _), D || z || ((D = !0), F || ((F = !0), I()))),
              _
            );
          }),
          (a.unstable_shouldYield = ht),
          (a.unstable_wrapCallback = function (_) {
            var G = N;
            return function () {
              var K = N;
              N = G;
              try {
                return _.apply(this, arguments);
              } finally {
                N = K;
              }
            };
          }));
      })(Sr)),
    Sr
  );
}
var dh;
function Qg() {
  return (dh || ((dh = 1), (xr.exports = Xg())), xr.exports);
}
var Er = { exports: {} },
  le = {};
/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var mh;
function Zg() {
  if (mh) return le;
  mh = 1;
  var a = Yr();
  function u(v) {
    var p = "https://react.dev/errors/" + v;
    if (1 < arguments.length) {
      p += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var S = 2; S < arguments.length; S++) p += "&args[]=" + encodeURIComponent(arguments[S]);
    }
    return (
      "Minified React error #" +
      v +
      "; visit " +
      p +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function r() {}
  var o = {
      d: {
        f: r,
        r: function () {
          throw Error(u(522));
        },
        D: r,
        C: r,
        L: r,
        m: r,
        X: r,
        S: r,
        M: r,
      },
      p: 0,
      findDOMNode: null,
    },
    s = Symbol.for("react.portal");
  function d(v, p, S) {
    var x = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: s,
      key: x == null ? null : "" + x,
      children: v,
      containerInfo: p,
      implementation: S,
    };
  }
  var m = a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function h(v, p) {
    if (v === "font") return "";
    if (typeof p == "string") return p === "use-credentials" ? p : "";
  }
  return (
    (le.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = o),
    (le.createPortal = function (v, p) {
      var S = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!p || (p.nodeType !== 1 && p.nodeType !== 9 && p.nodeType !== 11)) throw Error(u(299));
      return d(v, p, null, S);
    }),
    (le.flushSync = function (v) {
      var p = m.T,
        S = o.p;
      try {
        if (((m.T = null), (o.p = 2), v)) return v();
      } finally {
        ((m.T = p), (o.p = S), o.d.f());
      }
    }),
    (le.preconnect = function (v, p) {
      typeof v == "string" &&
        (p
          ? ((p = p.crossOrigin),
            (p = typeof p == "string" ? (p === "use-credentials" ? p : "") : void 0))
          : (p = null),
        o.d.C(v, p));
    }),
    (le.prefetchDNS = function (v) {
      typeof v == "string" && o.d.D(v);
    }),
    (le.preinit = function (v, p) {
      if (typeof v == "string" && p && typeof p.as == "string") {
        var S = p.as,
          x = h(S, p.crossOrigin),
          N = typeof p.integrity == "string" ? p.integrity : void 0,
          z = typeof p.fetchPriority == "string" ? p.fetchPriority : void 0;
        S === "style"
          ? o.d.S(v, typeof p.precedence == "string" ? p.precedence : void 0, {
              crossOrigin: x,
              integrity: N,
              fetchPriority: z,
            })
          : S === "script" &&
            o.d.X(v, {
              crossOrigin: x,
              integrity: N,
              fetchPriority: z,
              nonce: typeof p.nonce == "string" ? p.nonce : void 0,
            });
      }
    }),
    (le.preinitModule = function (v, p) {
      if (typeof v == "string")
        if (typeof p == "object" && p !== null) {
          if (p.as == null || p.as === "script") {
            var S = h(p.as, p.crossOrigin);
            o.d.M(v, {
              crossOrigin: S,
              integrity: typeof p.integrity == "string" ? p.integrity : void 0,
              nonce: typeof p.nonce == "string" ? p.nonce : void 0,
            });
          }
        } else p == null && o.d.M(v);
    }),
    (le.preload = function (v, p) {
      if (typeof v == "string" && typeof p == "object" && p !== null && typeof p.as == "string") {
        var S = p.as,
          x = h(S, p.crossOrigin);
        o.d.L(v, S, {
          crossOrigin: x,
          integrity: typeof p.integrity == "string" ? p.integrity : void 0,
          nonce: typeof p.nonce == "string" ? p.nonce : void 0,
          type: typeof p.type == "string" ? p.type : void 0,
          fetchPriority: typeof p.fetchPriority == "string" ? p.fetchPriority : void 0,
          referrerPolicy: typeof p.referrerPolicy == "string" ? p.referrerPolicy : void 0,
          imageSrcSet: typeof p.imageSrcSet == "string" ? p.imageSrcSet : void 0,
          imageSizes: typeof p.imageSizes == "string" ? p.imageSizes : void 0,
          media: typeof p.media == "string" ? p.media : void 0,
        });
      }
    }),
    (le.preloadModule = function (v, p) {
      if (typeof v == "string")
        if (p) {
          var S = h(p.as, p.crossOrigin);
          o.d.m(v, {
            as: typeof p.as == "string" && p.as !== "script" ? p.as : void 0,
            crossOrigin: S,
            integrity: typeof p.integrity == "string" ? p.integrity : void 0,
          });
        } else o.d.m(v);
    }),
    (le.requestFormReset = function (v) {
      o.d.r(v);
    }),
    (le.unstable_batchedUpdates = function (v, p) {
      return v(p);
    }),
    (le.useFormState = function (v, p, S) {
      return m.H.useFormState(v, p, S);
    }),
    (le.useFormStatus = function () {
      return m.H.useHostTransitionStatus();
    }),
    (le.version = "19.2.4"),
    le
  );
}
var hh;
function Gh() {
  if (hh) return Er.exports;
  hh = 1;
  function a() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (u) {
        console.error(u);
      }
  }
  return (a(), (Er.exports = Zg()), Er.exports);
}
/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ph;
function Kg() {
  if (ph) return oi;
  ph = 1;
  var a = Qg(),
    u = Yr(),
    r = Gh();
  function o(t) {
    var e = "https://react.dev/errors/" + t;
    if (1 < arguments.length) {
      e += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var n = 2; n < arguments.length; n++) e += "&args[]=" + encodeURIComponent(arguments[n]);
    }
    return (
      "Minified React error #" +
      t +
      "; visit " +
      e +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  function s(t) {
    return !(!t || (t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11));
  }
  function d(t) {
    var e = t,
      n = t;
    if (t.alternate) for (; e.return; ) e = e.return;
    else {
      t = e;
      do ((e = t), (e.flags & 4098) !== 0 && (n = e.return), (t = e.return));
      while (t);
    }
    return e.tag === 3 ? n : null;
  }
  function m(t) {
    if (t.tag === 13) {
      var e = t.memoizedState;
      if ((e === null && ((t = t.alternate), t !== null && (e = t.memoizedState)), e !== null))
        return e.dehydrated;
    }
    return null;
  }
  function h(t) {
    if (t.tag === 31) {
      var e = t.memoizedState;
      if ((e === null && ((t = t.alternate), t !== null && (e = t.memoizedState)), e !== null))
        return e.dehydrated;
    }
    return null;
  }
  function v(t) {
    if (d(t) !== t) throw Error(o(188));
  }
  function p(t) {
    var e = t.alternate;
    if (!e) {
      if (((e = d(t)), e === null)) throw Error(o(188));
      return e !== t ? null : t;
    }
    for (var n = t, l = e; ; ) {
      var i = n.return;
      if (i === null) break;
      var c = i.alternate;
      if (c === null) {
        if (((l = i.return), l !== null)) {
          n = l;
          continue;
        }
        break;
      }
      if (i.child === c.child) {
        for (c = i.child; c; ) {
          if (c === n) return (v(i), t);
          if (c === l) return (v(i), e);
          c = c.sibling;
        }
        throw Error(o(188));
      }
      if (n.return !== l.return) ((n = i), (l = c));
      else {
        for (var f = !1, y = i.child; y; ) {
          if (y === n) {
            ((f = !0), (n = i), (l = c));
            break;
          }
          if (y === l) {
            ((f = !0), (l = i), (n = c));
            break;
          }
          y = y.sibling;
        }
        if (!f) {
          for (y = c.child; y; ) {
            if (y === n) {
              ((f = !0), (n = c), (l = i));
              break;
            }
            if (y === l) {
              ((f = !0), (l = c), (n = i));
              break;
            }
            y = y.sibling;
          }
          if (!f) throw Error(o(189));
        }
      }
      if (n.alternate !== l) throw Error(o(190));
    }
    if (n.tag !== 3) throw Error(o(188));
    return n.stateNode.current === n ? t : e;
  }
  function S(t) {
    var e = t.tag;
    if (e === 5 || e === 26 || e === 27 || e === 6) return t;
    for (t = t.child; t !== null; ) {
      if (((e = S(t)), e !== null)) return e;
      t = t.sibling;
    }
    return null;
  }
  var x = Object.assign,
    N = Symbol.for("react.element"),
    z = Symbol.for("react.transitional.element"),
    D = Symbol.for("react.portal"),
    U = Symbol.for("react.fragment"),
    M = Symbol.for("react.strict_mode"),
    V = Symbol.for("react.profiler"),
    Y = Symbol.for("react.consumer"),
    X = Symbol.for("react.context"),
    Z = Symbol.for("react.forward_ref"),
    W = Symbol.for("react.suspense"),
    F = Symbol.for("react.suspense_list"),
    Q = Symbol.for("react.memo"),
    et = Symbol.for("react.lazy"),
    bt = Symbol.for("react.activity"),
    ht = Symbol.for("react.memo_cache_sentinel"),
    xt = Symbol.iterator;
  function I(t) {
    return t === null || typeof t != "object"
      ? null
      : ((t = (xt && t[xt]) || t["@@iterator"]), typeof t == "function" ? t : null);
  }
  var St = Symbol.for("react.client.reference");
  function ft(t) {
    if (t == null) return null;
    if (typeof t == "function") return t.$$typeof === St ? null : t.displayName || t.name || null;
    if (typeof t == "string") return t;
    switch (t) {
      case U:
        return "Fragment";
      case V:
        return "Profiler";
      case M:
        return "StrictMode";
      case W:
        return "Suspense";
      case F:
        return "SuspenseList";
      case bt:
        return "Activity";
    }
    if (typeof t == "object")
      switch (t.$$typeof) {
        case D:
          return "Portal";
        case X:
          return t.displayName || "Context";
        case Y:
          return (t._context.displayName || "Context") + ".Consumer";
        case Z:
          var e = t.render;
          return (
            (t = t.displayName),
            t ||
              ((t = e.displayName || e.name || ""),
              (t = t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef")),
            t
          );
        case Q:
          return ((e = t.displayName || null), e !== null ? e : ft(t.type) || "Memo");
        case et:
          ((e = t._payload), (t = t._init));
          try {
            return ft(t(e));
          } catch {}
      }
    return null;
  }
  var Ct = Array.isArray,
    _ = u.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    G = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
    K = { pending: !1, data: null, method: null, action: null },
    nt = [],
    ct = -1;
  function A(t) {
    return { current: t };
  }
  function q(t) {
    0 > ct || ((t.current = nt[ct]), (nt[ct] = null), ct--);
  }
  function J(t, e) {
    (ct++, (nt[ct] = t.current), (t.current = e));
  }
  var k = A(null),
    at = A(null),
    st = A(null),
    pt = A(null);
  function Kt(t, e) {
    switch ((J(st, e), J(at, t), J(k, null), e.nodeType)) {
      case 9:
      case 11:
        t = (t = e.documentElement) && (t = t.namespaceURI) ? Rm(t) : 0;
        break;
      default:
        if (((t = e.tagName), (e = e.namespaceURI))) ((e = Rm(e)), (t = zm(e, t)));
        else
          switch (t) {
            case "svg":
              t = 1;
              break;
            case "math":
              t = 2;
              break;
            default:
              t = 0;
          }
    }
    (q(k), J(k, t));
  }
  function Ht() {
    (q(k), q(at), q(st));
  }
  function Pn(t) {
    t.memoizedState !== null && J(pt, t);
    var e = k.current,
      n = zm(e, t.type);
    e !== n && (J(at, t), J(k, n));
  }
  function xl(t) {
    (at.current === t && (q(k), q(at)), pt.current === t && (q(pt), (li._currentValue = K)));
  }
  var ha, In;
  function tl(t) {
    if (ha === void 0)
      try {
        throw Error();
      } catch (n) {
        var e = n.stack.trim().match(/\n( *(at )?)/);
        ((ha = (e && e[1]) || ""),
          (In =
            -1 <
            n.stack.indexOf(`
    at`)
              ? " (<anonymous>)"
              : -1 < n.stack.indexOf("@")
                ? "@unknown:0:0"
                : ""));
      }
    return (
      `
` +
      ha +
      t +
      In
    );
  }
  var Iu = !1;
  function tc(t, e) {
    if (!t || Iu) return "";
    Iu = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var l = {
        DetermineComponentFrameRoot: function () {
          try {
            if (e) {
              var L = function () {
                throw Error();
              };
              if (
                (Object.defineProperty(L.prototype, "props", {
                  set: function () {
                    throw Error();
                  },
                }),
                typeof Reflect == "object" && Reflect.construct)
              ) {
                try {
                  Reflect.construct(L, []);
                } catch (j) {
                  var R = j;
                }
                Reflect.construct(t, [], L);
              } else {
                try {
                  L.call();
                } catch (j) {
                  R = j;
                }
                t.call(L.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (j) {
                R = j;
              }
              (L = t()) && typeof L.catch == "function" && L.catch(function () {});
            }
          } catch (j) {
            if (j && R && typeof j.stack == "string") return [j.stack, R.stack];
          }
          return [null, null];
        },
      };
      l.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var i = Object.getOwnPropertyDescriptor(l.DetermineComponentFrameRoot, "name");
      i &&
        i.configurable &&
        Object.defineProperty(l.DetermineComponentFrameRoot, "name", {
          value: "DetermineComponentFrameRoot",
        });
      var c = l.DetermineComponentFrameRoot(),
        f = c[0],
        y = c[1];
      if (f && y) {
        var E = f.split(`
`),
          w = y.split(`
`);
        for (i = l = 0; l < E.length && !E[l].includes("DetermineComponentFrameRoot"); ) l++;
        for (; i < w.length && !w[i].includes("DetermineComponentFrameRoot"); ) i++;
        if (l === E.length || i === w.length)
          for (l = E.length - 1, i = w.length - 1; 1 <= l && 0 <= i && E[l] !== w[i]; ) i--;
        for (; 1 <= l && 0 <= i; l--, i--)
          if (E[l] !== w[i]) {
            if (l !== 1 || i !== 1)
              do
                if ((l--, i--, 0 > i || E[l] !== w[i])) {
                  var H =
                    `
` + E[l].replace(" at new ", " at ");
                  return (
                    t.displayName &&
                      H.includes("<anonymous>") &&
                      (H = H.replace("<anonymous>", t.displayName)),
                    H
                  );
                }
              while (1 <= l && 0 <= i);
            break;
          }
      }
    } finally {
      ((Iu = !1), (Error.prepareStackTrace = n));
    }
    return (n = t ? t.displayName || t.name : "") ? tl(n) : "";
  }
  function yy(t, e) {
    switch (t.tag) {
      case 26:
      case 27:
      case 5:
        return tl(t.type);
      case 16:
        return tl("Lazy");
      case 13:
        return t.child !== e && e !== null ? tl("Suspense Fallback") : tl("Suspense");
      case 19:
        return tl("SuspenseList");
      case 0:
      case 15:
        return tc(t.type, !1);
      case 11:
        return tc(t.type.render, !1);
      case 1:
        return tc(t.type, !0);
      case 31:
        return tl("Activity");
      default:
        return "";
    }
  }
  function us(t) {
    try {
      var e = "",
        n = null;
      do ((e += yy(t, n)), (n = t), (t = t.return));
      while (t);
      return e;
    } catch (l) {
      return (
        `
Error generating stack: ` +
        l.message +
        `
` +
        l.stack
      );
    }
  }
  var ec = Object.prototype.hasOwnProperty,
    nc = a.unstable_scheduleCallback,
    lc = a.unstable_cancelCallback,
    vy = a.unstable_shouldYield,
    gy = a.unstable_requestPaint,
    de = a.unstable_now,
    by = a.unstable_getCurrentPriorityLevel,
    cs = a.unstable_ImmediatePriority,
    os = a.unstable_UserBlockingPriority,
    gi = a.unstable_NormalPriority,
    xy = a.unstable_LowPriority,
    rs = a.unstable_IdlePriority,
    Sy = a.log,
    Ey = a.unstable_setDisableYieldValue,
    pa = null,
    me = null;
  function En(t) {
    if ((typeof Sy == "function" && Ey(t), me && typeof me.setStrictMode == "function"))
      try {
        me.setStrictMode(pa, t);
      } catch {}
  }
  var he = Math.clz32 ? Math.clz32 : Cy,
    Ay = Math.log,
    Ty = Math.LN2;
  function Cy(t) {
    return ((t >>>= 0), t === 0 ? 32 : (31 - ((Ay(t) / Ty) | 0)) | 0);
  }
  var bi = 256,
    xi = 262144,
    Si = 4194304;
  function el(t) {
    var e = t & 42;
    if (e !== 0) return e;
    switch (t & -t) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return t & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return t & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return t;
    }
  }
  function Ei(t, e, n) {
    var l = t.pendingLanes;
    if (l === 0) return 0;
    var i = 0,
      c = t.suspendedLanes,
      f = t.pingedLanes;
    t = t.warmLanes;
    var y = l & 134217727;
    return (
      y !== 0
        ? ((l = y & ~c),
          l !== 0
            ? (i = el(l))
            : ((f &= y), f !== 0 ? (i = el(f)) : n || ((n = y & ~t), n !== 0 && (i = el(n)))))
        : ((y = l & ~c),
          y !== 0
            ? (i = el(y))
            : f !== 0
              ? (i = el(f))
              : n || ((n = l & ~t), n !== 0 && (i = el(n)))),
      i === 0
        ? 0
        : e !== 0 &&
            e !== i &&
            (e & c) === 0 &&
            ((c = i & -i), (n = e & -e), c >= n || (c === 32 && (n & 4194048) !== 0))
          ? e
          : i
    );
  }
  function ya(t, e) {
    return (t.pendingLanes & ~(t.suspendedLanes & ~t.pingedLanes) & e) === 0;
  }
  function Ny(t, e) {
    switch (t) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return e + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function ss() {
    var t = Si;
    return ((Si <<= 1), (Si & 62914560) === 0 && (Si = 4194304), t);
  }
  function ac(t) {
    for (var e = [], n = 0; 31 > n; n++) e.push(t);
    return e;
  }
  function va(t, e) {
    ((t.pendingLanes |= e),
      e !== 268435456 && ((t.suspendedLanes = 0), (t.pingedLanes = 0), (t.warmLanes = 0)));
  }
  function Oy(t, e, n, l, i, c) {
    var f = t.pendingLanes;
    ((t.pendingLanes = n),
      (t.suspendedLanes = 0),
      (t.pingedLanes = 0),
      (t.warmLanes = 0),
      (t.expiredLanes &= n),
      (t.entangledLanes &= n),
      (t.errorRecoveryDisabledLanes &= n),
      (t.shellSuspendCounter = 0));
    var y = t.entanglements,
      E = t.expirationTimes,
      w = t.hiddenUpdates;
    for (n = f & ~n; 0 < n; ) {
      var H = 31 - he(n),
        L = 1 << H;
      ((y[H] = 0), (E[H] = -1));
      var R = w[H];
      if (R !== null)
        for (w[H] = null, H = 0; H < R.length; H++) {
          var j = R[H];
          j !== null && (j.lane &= -536870913);
        }
      n &= ~L;
    }
    (l !== 0 && fs(t, l, 0),
      c !== 0 && i === 0 && t.tag !== 0 && (t.suspendedLanes |= c & ~(f & ~e)));
  }
  function fs(t, e, n) {
    ((t.pendingLanes |= e), (t.suspendedLanes &= ~e));
    var l = 31 - he(e);
    ((t.entangledLanes |= e),
      (t.entanglements[l] = t.entanglements[l] | 1073741824 | (n & 261930)));
  }
  function ds(t, e) {
    var n = (t.entangledLanes |= e);
    for (t = t.entanglements; n; ) {
      var l = 31 - he(n),
        i = 1 << l;
      ((i & e) | (t[l] & e) && (t[l] |= e), (n &= ~i));
    }
  }
  function ms(t, e) {
    var n = e & -e;
    return ((n = (n & 42) !== 0 ? 1 : ic(n)), (n & (t.suspendedLanes | e)) !== 0 ? 0 : n);
  }
  function ic(t) {
    switch (t) {
      case 2:
        t = 1;
        break;
      case 8:
        t = 4;
        break;
      case 32:
        t = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        t = 128;
        break;
      case 268435456:
        t = 134217728;
        break;
      default:
        t = 0;
    }
    return t;
  }
  function uc(t) {
    return ((t &= -t), 2 < t ? (8 < t ? ((t & 134217727) !== 0 ? 32 : 268435456) : 8) : 2);
  }
  function hs() {
    var t = G.p;
    return t !== 0 ? t : ((t = window.event), t === void 0 ? 32 : th(t.type));
  }
  function ps(t, e) {
    var n = G.p;
    try {
      return ((G.p = t), e());
    } finally {
      G.p = n;
    }
  }
  var An = Math.random().toString(36).slice(2),
    Ft = "__reactFiber$" + An,
    ie = "__reactProps$" + An,
    Sl = "__reactContainer$" + An,
    cc = "__reactEvents$" + An,
    wy = "__reactListeners$" + An,
    _y = "__reactHandles$" + An,
    ys = "__reactResources$" + An,
    ga = "__reactMarker$" + An;
  function oc(t) {
    (delete t[Ft], delete t[ie], delete t[cc], delete t[wy], delete t[_y]);
  }
  function El(t) {
    var e = t[Ft];
    if (e) return e;
    for (var n = t.parentNode; n; ) {
      if ((e = n[Sl] || n[Ft])) {
        if (((n = e.alternate), e.child !== null || (n !== null && n.child !== null)))
          for (t = Lm(t); t !== null; ) {
            if ((n = t[Ft])) return n;
            t = Lm(t);
          }
        return e;
      }
      ((t = n), (n = t.parentNode));
    }
    return null;
  }
  function Al(t) {
    if ((t = t[Ft] || t[Sl])) {
      var e = t.tag;
      if (e === 5 || e === 6 || e === 13 || e === 31 || e === 26 || e === 27 || e === 3) return t;
    }
    return null;
  }
  function ba(t) {
    var e = t.tag;
    if (e === 5 || e === 26 || e === 27 || e === 6) return t.stateNode;
    throw Error(o(33));
  }
  function Tl(t) {
    var e = t[ys];
    return (e || (e = t[ys] = { hoistableStyles: new Map(), hoistableScripts: new Map() }), e);
  }
  function Jt(t) {
    t[ga] = !0;
  }
  var vs = new Set(),
    gs = {};
  function nl(t, e) {
    (Cl(t, e), Cl(t + "Capture", e));
  }
  function Cl(t, e) {
    for (gs[t] = e, t = 0; t < e.length; t++) vs.add(e[t]);
  }
  var Ry = RegExp(
      "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$",
    ),
    bs = {},
    xs = {};
  function zy(t) {
    return ec.call(xs, t)
      ? !0
      : ec.call(bs, t)
        ? !1
        : Ry.test(t)
          ? (xs[t] = !0)
          : ((bs[t] = !0), !1);
  }
  function Ai(t, e, n) {
    if (zy(e))
      if (n === null) t.removeAttribute(e);
      else {
        switch (typeof n) {
          case "undefined":
          case "function":
          case "symbol":
            t.removeAttribute(e);
            return;
          case "boolean":
            var l = e.toLowerCase().slice(0, 5);
            if (l !== "data-" && l !== "aria-") {
              t.removeAttribute(e);
              return;
            }
        }
        t.setAttribute(e, "" + n);
      }
  }
  function Ti(t, e, n) {
    if (n === null) t.removeAttribute(e);
    else {
      switch (typeof n) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          t.removeAttribute(e);
          return;
      }
      t.setAttribute(e, "" + n);
    }
  }
  function Fe(t, e, n, l) {
    if (l === null) t.removeAttribute(n);
    else {
      switch (typeof l) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          t.removeAttribute(n);
          return;
      }
      t.setAttributeNS(e, n, "" + l);
    }
  }
  function Te(t) {
    switch (typeof t) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return t;
      case "object":
        return t;
      default:
        return "";
    }
  }
  function Ss(t) {
    var e = t.type;
    return (t = t.nodeName) && t.toLowerCase() === "input" && (e === "checkbox" || e === "radio");
  }
  function jy(t, e, n) {
    var l = Object.getOwnPropertyDescriptor(t.constructor.prototype, e);
    if (
      !t.hasOwnProperty(e) &&
      typeof l < "u" &&
      typeof l.get == "function" &&
      typeof l.set == "function"
    ) {
      var i = l.get,
        c = l.set;
      return (
        Object.defineProperty(t, e, {
          configurable: !0,
          get: function () {
            return i.call(this);
          },
          set: function (f) {
            ((n = "" + f), c.call(this, f));
          },
        }),
        Object.defineProperty(t, e, { enumerable: l.enumerable }),
        {
          getValue: function () {
            return n;
          },
          setValue: function (f) {
            n = "" + f;
          },
          stopTracking: function () {
            ((t._valueTracker = null), delete t[e]);
          },
        }
      );
    }
  }
  function rc(t) {
    if (!t._valueTracker) {
      var e = Ss(t) ? "checked" : "value";
      t._valueTracker = jy(t, e, "" + t[e]);
    }
  }
  function Es(t) {
    if (!t) return !1;
    var e = t._valueTracker;
    if (!e) return !0;
    var n = e.getValue(),
      l = "";
    return (
      t && (l = Ss(t) ? (t.checked ? "true" : "false") : t.value),
      (t = l),
      t !== n ? (e.setValue(t), !0) : !1
    );
  }
  function Ci(t) {
    if (((t = t || (typeof document < "u" ? document : void 0)), typeof t > "u")) return null;
    try {
      return t.activeElement || t.body;
    } catch {
      return t.body;
    }
  }
  var My = /[\n"\\]/g;
  function Ce(t) {
    return t.replace(My, function (e) {
      return "\\" + e.charCodeAt(0).toString(16) + " ";
    });
  }
  function sc(t, e, n, l, i, c, f, y) {
    ((t.name = ""),
      f != null && typeof f != "function" && typeof f != "symbol" && typeof f != "boolean"
        ? (t.type = f)
        : t.removeAttribute("type"),
      e != null
        ? f === "number"
          ? ((e === 0 && t.value === "") || t.value != e) && (t.value = "" + Te(e))
          : t.value !== "" + Te(e) && (t.value = "" + Te(e))
        : (f !== "submit" && f !== "reset") || t.removeAttribute("value"),
      e != null
        ? fc(t, f, Te(e))
        : n != null
          ? fc(t, f, Te(n))
          : l != null && t.removeAttribute("value"),
      i == null && c != null && (t.defaultChecked = !!c),
      i != null && (t.checked = i && typeof i != "function" && typeof i != "symbol"),
      y != null && typeof y != "function" && typeof y != "symbol" && typeof y != "boolean"
        ? (t.name = "" + Te(y))
        : t.removeAttribute("name"));
  }
  function As(t, e, n, l, i, c, f, y) {
    if (
      (c != null &&
        typeof c != "function" &&
        typeof c != "symbol" &&
        typeof c != "boolean" &&
        (t.type = c),
      e != null || n != null)
    ) {
      if (!((c !== "submit" && c !== "reset") || e != null)) {
        rc(t);
        return;
      }
      ((n = n != null ? "" + Te(n) : ""),
        (e = e != null ? "" + Te(e) : n),
        y || e === t.value || (t.value = e),
        (t.defaultValue = e));
    }
    ((l = l ?? i),
      (l = typeof l != "function" && typeof l != "symbol" && !!l),
      (t.checked = y ? t.checked : !!l),
      (t.defaultChecked = !!l),
      f != null &&
        typeof f != "function" &&
        typeof f != "symbol" &&
        typeof f != "boolean" &&
        (t.name = f),
      rc(t));
  }
  function fc(t, e, n) {
    (e === "number" && Ci(t.ownerDocument) === t) ||
      t.defaultValue === "" + n ||
      (t.defaultValue = "" + n);
  }
  function Nl(t, e, n, l) {
    if (((t = t.options), e)) {
      e = {};
      for (var i = 0; i < n.length; i++) e["$" + n[i]] = !0;
      for (n = 0; n < t.length; n++)
        ((i = e.hasOwnProperty("$" + t[n].value)),
          t[n].selected !== i && (t[n].selected = i),
          i && l && (t[n].defaultSelected = !0));
    } else {
      for (n = "" + Te(n), e = null, i = 0; i < t.length; i++) {
        if (t[i].value === n) {
          ((t[i].selected = !0), l && (t[i].defaultSelected = !0));
          return;
        }
        e !== null || t[i].disabled || (e = t[i]);
      }
      e !== null && (e.selected = !0);
    }
  }
  function Ts(t, e, n) {
    if (e != null && ((e = "" + Te(e)), e !== t.value && (t.value = e), n == null)) {
      t.defaultValue !== e && (t.defaultValue = e);
      return;
    }
    t.defaultValue = n != null ? "" + Te(n) : "";
  }
  function Cs(t, e, n, l) {
    if (e == null) {
      if (l != null) {
        if (n != null) throw Error(o(92));
        if (Ct(l)) {
          if (1 < l.length) throw Error(o(93));
          l = l[0];
        }
        n = l;
      }
      (n == null && (n = ""), (e = n));
    }
    ((n = Te(e)),
      (t.defaultValue = n),
      (l = t.textContent),
      l === n && l !== "" && l !== null && (t.value = l),
      rc(t));
  }
  function Ol(t, e) {
    if (e) {
      var n = t.firstChild;
      if (n && n === t.lastChild && n.nodeType === 3) {
        n.nodeValue = e;
        return;
      }
    }
    t.textContent = e;
  }
  var Dy = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " ",
    ),
  );
  function Ns(t, e, n) {
    var l = e.indexOf("--") === 0;
    n == null || typeof n == "boolean" || n === ""
      ? l
        ? t.setProperty(e, "")
        : e === "float"
          ? (t.cssFloat = "")
          : (t[e] = "")
      : l
        ? t.setProperty(e, n)
        : typeof n != "number" || n === 0 || Dy.has(e)
          ? e === "float"
            ? (t.cssFloat = n)
            : (t[e] = ("" + n).trim())
          : (t[e] = n + "px");
  }
  function Os(t, e, n) {
    if (e != null && typeof e != "object") throw Error(o(62));
    if (((t = t.style), n != null)) {
      for (var l in n)
        !n.hasOwnProperty(l) ||
          (e != null && e.hasOwnProperty(l)) ||
          (l.indexOf("--") === 0
            ? t.setProperty(l, "")
            : l === "float"
              ? (t.cssFloat = "")
              : (t[l] = ""));
      for (var i in e) ((l = e[i]), e.hasOwnProperty(i) && n[i] !== l && Ns(t, i, l));
    } else for (var c in e) e.hasOwnProperty(c) && Ns(t, c, e[c]);
  }
  function dc(t) {
    if (t.indexOf("-") === -1) return !1;
    switch (t) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Uy = new Map([
      ["acceptCharset", "accept-charset"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
      ["crossOrigin", "crossorigin"],
      ["accentHeight", "accent-height"],
      ["alignmentBaseline", "alignment-baseline"],
      ["arabicForm", "arabic-form"],
      ["baselineShift", "baseline-shift"],
      ["capHeight", "cap-height"],
      ["clipPath", "clip-path"],
      ["clipRule", "clip-rule"],
      ["colorInterpolation", "color-interpolation"],
      ["colorInterpolationFilters", "color-interpolation-filters"],
      ["colorProfile", "color-profile"],
      ["colorRendering", "color-rendering"],
      ["dominantBaseline", "dominant-baseline"],
      ["enableBackground", "enable-background"],
      ["fillOpacity", "fill-opacity"],
      ["fillRule", "fill-rule"],
      ["floodColor", "flood-color"],
      ["floodOpacity", "flood-opacity"],
      ["fontFamily", "font-family"],
      ["fontSize", "font-size"],
      ["fontSizeAdjust", "font-size-adjust"],
      ["fontStretch", "font-stretch"],
      ["fontStyle", "font-style"],
      ["fontVariant", "font-variant"],
      ["fontWeight", "font-weight"],
      ["glyphName", "glyph-name"],
      ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
      ["glyphOrientationVertical", "glyph-orientation-vertical"],
      ["horizAdvX", "horiz-adv-x"],
      ["horizOriginX", "horiz-origin-x"],
      ["imageRendering", "image-rendering"],
      ["letterSpacing", "letter-spacing"],
      ["lightingColor", "lighting-color"],
      ["markerEnd", "marker-end"],
      ["markerMid", "marker-mid"],
      ["markerStart", "marker-start"],
      ["overlinePosition", "overline-position"],
      ["overlineThickness", "overline-thickness"],
      ["paintOrder", "paint-order"],
      ["panose-1", "panose-1"],
      ["pointerEvents", "pointer-events"],
      ["renderingIntent", "rendering-intent"],
      ["shapeRendering", "shape-rendering"],
      ["stopColor", "stop-color"],
      ["stopOpacity", "stop-opacity"],
      ["strikethroughPosition", "strikethrough-position"],
      ["strikethroughThickness", "strikethrough-thickness"],
      ["strokeDasharray", "stroke-dasharray"],
      ["strokeDashoffset", "stroke-dashoffset"],
      ["strokeLinecap", "stroke-linecap"],
      ["strokeLinejoin", "stroke-linejoin"],
      ["strokeMiterlimit", "stroke-miterlimit"],
      ["strokeOpacity", "stroke-opacity"],
      ["strokeWidth", "stroke-width"],
      ["textAnchor", "text-anchor"],
      ["textDecoration", "text-decoration"],
      ["textRendering", "text-rendering"],
      ["transformOrigin", "transform-origin"],
      ["underlinePosition", "underline-position"],
      ["underlineThickness", "underline-thickness"],
      ["unicodeBidi", "unicode-bidi"],
      ["unicodeRange", "unicode-range"],
      ["unitsPerEm", "units-per-em"],
      ["vAlphabetic", "v-alphabetic"],
      ["vHanging", "v-hanging"],
      ["vIdeographic", "v-ideographic"],
      ["vMathematical", "v-mathematical"],
      ["vectorEffect", "vector-effect"],
      ["vertAdvY", "vert-adv-y"],
      ["vertOriginX", "vert-origin-x"],
      ["vertOriginY", "vert-origin-y"],
      ["wordSpacing", "word-spacing"],
      ["writingMode", "writing-mode"],
      ["xmlnsXlink", "xmlns:xlink"],
      ["xHeight", "x-height"],
    ]),
    Hy =
      /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function Ni(t) {
    return Hy.test("" + t)
      ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
      : t;
  }
  function Pe() {}
  var mc = null;
  function hc(t) {
    return (
      (t = t.target || t.srcElement || window),
      t.correspondingUseElement && (t = t.correspondingUseElement),
      t.nodeType === 3 ? t.parentNode : t
    );
  }
  var wl = null,
    _l = null;
  function ws(t) {
    var e = Al(t);
    if (e && (t = e.stateNode)) {
      var n = t[ie] || null;
      t: switch (((t = e.stateNode), e.type)) {
        case "input":
          if (
            (sc(
              t,
              n.value,
              n.defaultValue,
              n.defaultValue,
              n.checked,
              n.defaultChecked,
              n.type,
              n.name,
            ),
            (e = n.name),
            n.type === "radio" && e != null)
          ) {
            for (n = t; n.parentNode; ) n = n.parentNode;
            for (
              n = n.querySelectorAll('input[name="' + Ce("" + e) + '"][type="radio"]'), e = 0;
              e < n.length;
              e++
            ) {
              var l = n[e];
              if (l !== t && l.form === t.form) {
                var i = l[ie] || null;
                if (!i) throw Error(o(90));
                sc(
                  l,
                  i.value,
                  i.defaultValue,
                  i.defaultValue,
                  i.checked,
                  i.defaultChecked,
                  i.type,
                  i.name,
                );
              }
            }
            for (e = 0; e < n.length; e++) ((l = n[e]), l.form === t.form && Es(l));
          }
          break t;
        case "textarea":
          Ts(t, n.value, n.defaultValue);
          break t;
        case "select":
          ((e = n.value), e != null && Nl(t, !!n.multiple, e, !1));
      }
    }
  }
  var pc = !1;
  function _s(t, e, n) {
    if (pc) return t(e, n);
    pc = !0;
    try {
      var l = t(e);
      return l;
    } finally {
      if (
        ((pc = !1),
        (wl !== null || _l !== null) &&
          (mu(), wl && ((e = wl), (t = _l), (_l = wl = null), ws(e), t)))
      )
        for (e = 0; e < t.length; e++) ws(t[e]);
    }
  }
  function xa(t, e) {
    var n = t.stateNode;
    if (n === null) return null;
    var l = n[ie] || null;
    if (l === null) return null;
    n = l[e];
    t: switch (e) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        ((l = !l.disabled) ||
          ((t = t.type),
          (l = !(t === "button" || t === "input" || t === "select" || t === "textarea"))),
          (t = !l));
        break t;
      default:
        t = !1;
    }
    if (t) return null;
    if (n && typeof n != "function") throw Error(o(231, e, typeof n));
    return n;
  }
  var Ie = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    yc = !1;
  if (Ie)
    try {
      var Sa = {};
      (Object.defineProperty(Sa, "passive", {
        get: function () {
          yc = !0;
        },
      }),
        window.addEventListener("test", Sa, Sa),
        window.removeEventListener("test", Sa, Sa));
    } catch {
      yc = !1;
    }
  var Tn = null,
    vc = null,
    Oi = null;
  function Rs() {
    if (Oi) return Oi;
    var t,
      e = vc,
      n = e.length,
      l,
      i = "value" in Tn ? Tn.value : Tn.textContent,
      c = i.length;
    for (t = 0; t < n && e[t] === i[t]; t++);
    var f = n - t;
    for (l = 1; l <= f && e[n - l] === i[c - l]; l++);
    return (Oi = i.slice(t, 1 < l ? 1 - l : void 0));
  }
  function wi(t) {
    var e = t.keyCode;
    return (
      "charCode" in t ? ((t = t.charCode), t === 0 && e === 13 && (t = 13)) : (t = e),
      t === 10 && (t = 13),
      32 <= t || t === 13 ? t : 0
    );
  }
  function _i() {
    return !0;
  }
  function zs() {
    return !1;
  }
  function ue(t) {
    function e(n, l, i, c, f) {
      ((this._reactName = n),
        (this._targetInst = i),
        (this.type = l),
        (this.nativeEvent = c),
        (this.target = f),
        (this.currentTarget = null));
      for (var y in t) t.hasOwnProperty(y) && ((n = t[y]), (this[y] = n ? n(c) : c[y]));
      return (
        (this.isDefaultPrevented = (
          c.defaultPrevented != null ? c.defaultPrevented : c.returnValue === !1
        )
          ? _i
          : zs),
        (this.isPropagationStopped = zs),
        this
      );
    }
    return (
      x(e.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var n = this.nativeEvent;
          n &&
            (n.preventDefault
              ? n.preventDefault()
              : typeof n.returnValue != "unknown" && (n.returnValue = !1),
            (this.isDefaultPrevented = _i));
        },
        stopPropagation: function () {
          var n = this.nativeEvent;
          n &&
            (n.stopPropagation
              ? n.stopPropagation()
              : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
            (this.isPropagationStopped = _i));
        },
        persist: function () {},
        isPersistent: _i,
      }),
      e
    );
  }
  var ll = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (t) {
        return t.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    Ri = ue(ll),
    Ea = x({}, ll, { view: 0, detail: 0 }),
    By = ue(Ea),
    gc,
    bc,
    Aa,
    zi = x({}, Ea, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: Sc,
      button: 0,
      buttons: 0,
      relatedTarget: function (t) {
        return t.relatedTarget === void 0
          ? t.fromElement === t.srcElement
            ? t.toElement
            : t.fromElement
          : t.relatedTarget;
      },
      movementX: function (t) {
        return "movementX" in t
          ? t.movementX
          : (t !== Aa &&
              (Aa && t.type === "mousemove"
                ? ((gc = t.screenX - Aa.screenX), (bc = t.screenY - Aa.screenY))
                : (bc = gc = 0),
              (Aa = t)),
            gc);
      },
      movementY: function (t) {
        return "movementY" in t ? t.movementY : bc;
      },
    }),
    js = ue(zi),
    Ly = x({}, zi, { dataTransfer: 0 }),
    qy = ue(Ly),
    Vy = x({}, Ea, { relatedTarget: 0 }),
    xc = ue(Vy),
    Yy = x({}, ll, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    Gy = ue(Yy),
    Xy = x({}, ll, {
      clipboardData: function (t) {
        return "clipboardData" in t ? t.clipboardData : window.clipboardData;
      },
    }),
    Qy = ue(Xy),
    Zy = x({}, ll, { data: 0 }),
    Ms = ue(Zy),
    Ky = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    Jy = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    $y = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function ky(t) {
    var e = this.nativeEvent;
    return e.getModifierState ? e.getModifierState(t) : (t = $y[t]) ? !!e[t] : !1;
  }
  function Sc() {
    return ky;
  }
  var Wy = x({}, Ea, {
      key: function (t) {
        if (t.key) {
          var e = Ky[t.key] || t.key;
          if (e !== "Unidentified") return e;
        }
        return t.type === "keypress"
          ? ((t = wi(t)), t === 13 ? "Enter" : String.fromCharCode(t))
          : t.type === "keydown" || t.type === "keyup"
            ? Jy[t.keyCode] || "Unidentified"
            : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: Sc,
      charCode: function (t) {
        return t.type === "keypress" ? wi(t) : 0;
      },
      keyCode: function (t) {
        return t.type === "keydown" || t.type === "keyup" ? t.keyCode : 0;
      },
      which: function (t) {
        return t.type === "keypress"
          ? wi(t)
          : t.type === "keydown" || t.type === "keyup"
            ? t.keyCode
            : 0;
      },
    }),
    Fy = ue(Wy),
    Py = x({}, zi, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    Ds = ue(Py),
    Iy = x({}, Ea, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: Sc,
    }),
    tv = ue(Iy),
    ev = x({}, ll, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    nv = ue(ev),
    lv = x({}, zi, {
      deltaX: function (t) {
        return "deltaX" in t ? t.deltaX : "wheelDeltaX" in t ? -t.wheelDeltaX : 0;
      },
      deltaY: function (t) {
        return "deltaY" in t
          ? t.deltaY
          : "wheelDeltaY" in t
            ? -t.wheelDeltaY
            : "wheelDelta" in t
              ? -t.wheelDelta
              : 0;
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    av = ue(lv),
    iv = x({}, ll, { newState: 0, oldState: 0 }),
    uv = ue(iv),
    cv = [9, 13, 27, 32],
    Ec = Ie && "CompositionEvent" in window,
    Ta = null;
  Ie && "documentMode" in document && (Ta = document.documentMode);
  var ov = Ie && "TextEvent" in window && !Ta,
    Us = Ie && (!Ec || (Ta && 8 < Ta && 11 >= Ta)),
    Hs = " ",
    Bs = !1;
  function Ls(t, e) {
    switch (t) {
      case "keyup":
        return cv.indexOf(e.keyCode) !== -1;
      case "keydown":
        return e.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function qs(t) {
    return ((t = t.detail), typeof t == "object" && "data" in t ? t.data : null);
  }
  var Rl = !1;
  function rv(t, e) {
    switch (t) {
      case "compositionend":
        return qs(e);
      case "keypress":
        return e.which !== 32 ? null : ((Bs = !0), Hs);
      case "textInput":
        return ((t = e.data), t === Hs && Bs ? null : t);
      default:
        return null;
    }
  }
  function sv(t, e) {
    if (Rl)
      return t === "compositionend" || (!Ec && Ls(t, e))
        ? ((t = Rs()), (Oi = vc = Tn = null), (Rl = !1), t)
        : null;
    switch (t) {
      case "paste":
        return null;
      case "keypress":
        if (!(e.ctrlKey || e.altKey || e.metaKey) || (e.ctrlKey && e.altKey)) {
          if (e.char && 1 < e.char.length) return e.char;
          if (e.which) return String.fromCharCode(e.which);
        }
        return null;
      case "compositionend":
        return Us && e.locale !== "ko" ? null : e.data;
      default:
        return null;
    }
  }
  var fv = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function Vs(t) {
    var e = t && t.nodeName && t.nodeName.toLowerCase();
    return e === "input" ? !!fv[t.type] : e === "textarea";
  }
  function Ys(t, e, n, l) {
    (wl ? (_l ? _l.push(l) : (_l = [l])) : (wl = l),
      (e = xu(e, "onChange")),
      0 < e.length &&
        ((n = new Ri("onChange", "change", null, n, l)), t.push({ event: n, listeners: e })));
  }
  var Ca = null,
    Na = null;
  function dv(t) {
    Tm(t, 0);
  }
  function ji(t) {
    var e = ba(t);
    if (Es(e)) return t;
  }
  function Gs(t, e) {
    if (t === "change") return e;
  }
  var Xs = !1;
  if (Ie) {
    var Ac;
    if (Ie) {
      var Tc = "oninput" in document;
      if (!Tc) {
        var Qs = document.createElement("div");
        (Qs.setAttribute("oninput", "return;"), (Tc = typeof Qs.oninput == "function"));
      }
      Ac = Tc;
    } else Ac = !1;
    Xs = Ac && (!document.documentMode || 9 < document.documentMode);
  }
  function Zs() {
    Ca && (Ca.detachEvent("onpropertychange", Ks), (Na = Ca = null));
  }
  function Ks(t) {
    if (t.propertyName === "value" && ji(Na)) {
      var e = [];
      (Ys(e, Na, t, hc(t)), _s(dv, e));
    }
  }
  function mv(t, e, n) {
    t === "focusin"
      ? (Zs(), (Ca = e), (Na = n), Ca.attachEvent("onpropertychange", Ks))
      : t === "focusout" && Zs();
  }
  function hv(t) {
    if (t === "selectionchange" || t === "keyup" || t === "keydown") return ji(Na);
  }
  function pv(t, e) {
    if (t === "click") return ji(e);
  }
  function yv(t, e) {
    if (t === "input" || t === "change") return ji(e);
  }
  function vv(t, e) {
    return (t === e && (t !== 0 || 1 / t === 1 / e)) || (t !== t && e !== e);
  }
  var pe = typeof Object.is == "function" ? Object.is : vv;
  function Oa(t, e) {
    if (pe(t, e)) return !0;
    if (typeof t != "object" || t === null || typeof e != "object" || e === null) return !1;
    var n = Object.keys(t),
      l = Object.keys(e);
    if (n.length !== l.length) return !1;
    for (l = 0; l < n.length; l++) {
      var i = n[l];
      if (!ec.call(e, i) || !pe(t[i], e[i])) return !1;
    }
    return !0;
  }
  function Js(t) {
    for (; t && t.firstChild; ) t = t.firstChild;
    return t;
  }
  function $s(t, e) {
    var n = Js(t);
    t = 0;
    for (var l; n; ) {
      if (n.nodeType === 3) {
        if (((l = t + n.textContent.length), t <= e && l >= e)) return { node: n, offset: e - t };
        t = l;
      }
      t: {
        for (; n; ) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break t;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = Js(n);
    }
  }
  function ks(t, e) {
    return t && e
      ? t === e
        ? !0
        : t && t.nodeType === 3
          ? !1
          : e && e.nodeType === 3
            ? ks(t, e.parentNode)
            : "contains" in t
              ? t.contains(e)
              : t.compareDocumentPosition
                ? !!(t.compareDocumentPosition(e) & 16)
                : !1
      : !1;
  }
  function Ws(t) {
    t =
      t != null && t.ownerDocument != null && t.ownerDocument.defaultView != null
        ? t.ownerDocument.defaultView
        : window;
    for (var e = Ci(t.document); e instanceof t.HTMLIFrameElement; ) {
      try {
        var n = typeof e.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) t = e.contentWindow;
      else break;
      e = Ci(t.document);
    }
    return e;
  }
  function Cc(t) {
    var e = t && t.nodeName && t.nodeName.toLowerCase();
    return (
      e &&
      ((e === "input" &&
        (t.type === "text" ||
          t.type === "search" ||
          t.type === "tel" ||
          t.type === "url" ||
          t.type === "password")) ||
        e === "textarea" ||
        t.contentEditable === "true")
    );
  }
  var gv = Ie && "documentMode" in document && 11 >= document.documentMode,
    zl = null,
    Nc = null,
    wa = null,
    Oc = !1;
  function Fs(t, e, n) {
    var l = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    Oc ||
      zl == null ||
      zl !== Ci(l) ||
      ((l = zl),
      "selectionStart" in l && Cc(l)
        ? (l = { start: l.selectionStart, end: l.selectionEnd })
        : ((l = ((l.ownerDocument && l.ownerDocument.defaultView) || window).getSelection()),
          (l = {
            anchorNode: l.anchorNode,
            anchorOffset: l.anchorOffset,
            focusNode: l.focusNode,
            focusOffset: l.focusOffset,
          })),
      (wa && Oa(wa, l)) ||
        ((wa = l),
        (l = xu(Nc, "onSelect")),
        0 < l.length &&
          ((e = new Ri("onSelect", "select", null, e, n)),
          t.push({ event: e, listeners: l }),
          (e.target = zl))));
  }
  function al(t, e) {
    var n = {};
    return (
      (n[t.toLowerCase()] = e.toLowerCase()),
      (n["Webkit" + t] = "webkit" + e),
      (n["Moz" + t] = "moz" + e),
      n
    );
  }
  var jl = {
      animationend: al("Animation", "AnimationEnd"),
      animationiteration: al("Animation", "AnimationIteration"),
      animationstart: al("Animation", "AnimationStart"),
      transitionrun: al("Transition", "TransitionRun"),
      transitionstart: al("Transition", "TransitionStart"),
      transitioncancel: al("Transition", "TransitionCancel"),
      transitionend: al("Transition", "TransitionEnd"),
    },
    wc = {},
    Ps = {};
  Ie &&
    ((Ps = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete jl.animationend.animation,
      delete jl.animationiteration.animation,
      delete jl.animationstart.animation),
    "TransitionEvent" in window || delete jl.transitionend.transition);
  function il(t) {
    if (wc[t]) return wc[t];
    if (!jl[t]) return t;
    var e = jl[t],
      n;
    for (n in e) if (e.hasOwnProperty(n) && n in Ps) return (wc[t] = e[n]);
    return t;
  }
  var Is = il("animationend"),
    tf = il("animationiteration"),
    ef = il("animationstart"),
    bv = il("transitionrun"),
    xv = il("transitionstart"),
    Sv = il("transitioncancel"),
    nf = il("transitionend"),
    lf = new Map(),
    _c =
      "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
        " ",
      );
  _c.push("scrollEnd");
  function Ue(t, e) {
    (lf.set(t, e), nl(e, [t]));
  }
  var Mi =
      typeof reportError == "function"
        ? reportError
        : function (t) {
            if (typeof window == "object" && typeof window.ErrorEvent == "function") {
              var e = new window.ErrorEvent("error", {
                bubbles: !0,
                cancelable: !0,
                message:
                  typeof t == "object" && t !== null && typeof t.message == "string"
                    ? String(t.message)
                    : String(t),
                error: t,
              });
              if (!window.dispatchEvent(e)) return;
            } else if (typeof process == "object" && typeof process.emit == "function") {
              process.emit("uncaughtException", t);
              return;
            }
            console.error(t);
          },
    Ne = [],
    Ml = 0,
    Rc = 0;
  function Di() {
    for (var t = Ml, e = (Rc = Ml = 0); e < t; ) {
      var n = Ne[e];
      Ne[e++] = null;
      var l = Ne[e];
      Ne[e++] = null;
      var i = Ne[e];
      Ne[e++] = null;
      var c = Ne[e];
      if (((Ne[e++] = null), l !== null && i !== null)) {
        var f = l.pending;
        (f === null ? (i.next = i) : ((i.next = f.next), (f.next = i)), (l.pending = i));
      }
      c !== 0 && af(n, i, c);
    }
  }
  function Ui(t, e, n, l) {
    ((Ne[Ml++] = t),
      (Ne[Ml++] = e),
      (Ne[Ml++] = n),
      (Ne[Ml++] = l),
      (Rc |= l),
      (t.lanes |= l),
      (t = t.alternate),
      t !== null && (t.lanes |= l));
  }
  function zc(t, e, n, l) {
    return (Ui(t, e, n, l), Hi(t));
  }
  function ul(t, e) {
    return (Ui(t, null, null, e), Hi(t));
  }
  function af(t, e, n) {
    t.lanes |= n;
    var l = t.alternate;
    l !== null && (l.lanes |= n);
    for (var i = !1, c = t.return; c !== null; )
      ((c.childLanes |= n),
        (l = c.alternate),
        l !== null && (l.childLanes |= n),
        c.tag === 22 && ((t = c.stateNode), t === null || t._visibility & 1 || (i = !0)),
        (t = c),
        (c = c.return));
    return t.tag === 3
      ? ((c = t.stateNode),
        i &&
          e !== null &&
          ((i = 31 - he(n)),
          (t = c.hiddenUpdates),
          (l = t[i]),
          l === null ? (t[i] = [e]) : l.push(e),
          (e.lane = n | 536870912)),
        c)
      : null;
  }
  function Hi(t) {
    if (50 < Wa) throw ((Wa = 0), (Yo = null), Error(o(185)));
    for (var e = t.return; e !== null; ) ((t = e), (e = t.return));
    return t.tag === 3 ? t.stateNode : null;
  }
  var Dl = {};
  function Ev(t, e, n, l) {
    ((this.tag = t),
      (this.key = n),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.refCleanup = this.ref = null),
      (this.pendingProps = e),
      (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
      (this.mode = l),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null));
  }
  function ye(t, e, n, l) {
    return new Ev(t, e, n, l);
  }
  function jc(t) {
    return ((t = t.prototype), !(!t || !t.isReactComponent));
  }
  function tn(t, e) {
    var n = t.alternate;
    return (
      n === null
        ? ((n = ye(t.tag, e, t.key, t.mode)),
          (n.elementType = t.elementType),
          (n.type = t.type),
          (n.stateNode = t.stateNode),
          (n.alternate = t),
          (t.alternate = n))
        : ((n.pendingProps = e),
          (n.type = t.type),
          (n.flags = 0),
          (n.subtreeFlags = 0),
          (n.deletions = null)),
      (n.flags = t.flags & 65011712),
      (n.childLanes = t.childLanes),
      (n.lanes = t.lanes),
      (n.child = t.child),
      (n.memoizedProps = t.memoizedProps),
      (n.memoizedState = t.memoizedState),
      (n.updateQueue = t.updateQueue),
      (e = t.dependencies),
      (n.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }),
      (n.sibling = t.sibling),
      (n.index = t.index),
      (n.ref = t.ref),
      (n.refCleanup = t.refCleanup),
      n
    );
  }
  function uf(t, e) {
    t.flags &= 65011714;
    var n = t.alternate;
    return (
      n === null
        ? ((t.childLanes = 0),
          (t.lanes = e),
          (t.child = null),
          (t.subtreeFlags = 0),
          (t.memoizedProps = null),
          (t.memoizedState = null),
          (t.updateQueue = null),
          (t.dependencies = null),
          (t.stateNode = null))
        : ((t.childLanes = n.childLanes),
          (t.lanes = n.lanes),
          (t.child = n.child),
          (t.subtreeFlags = 0),
          (t.deletions = null),
          (t.memoizedProps = n.memoizedProps),
          (t.memoizedState = n.memoizedState),
          (t.updateQueue = n.updateQueue),
          (t.type = n.type),
          (e = n.dependencies),
          (t.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext })),
      t
    );
  }
  function Bi(t, e, n, l, i, c) {
    var f = 0;
    if (((l = t), typeof t == "function")) jc(t) && (f = 1);
    else if (typeof t == "string")
      f = Og(t, n, k.current) ? 26 : t === "html" || t === "head" || t === "body" ? 27 : 5;
    else
      t: switch (t) {
        case bt:
          return ((t = ye(31, n, e, i)), (t.elementType = bt), (t.lanes = c), t);
        case U:
          return cl(n.children, i, c, e);
        case M:
          ((f = 8), (i |= 24));
          break;
        case V:
          return ((t = ye(12, n, e, i | 2)), (t.elementType = V), (t.lanes = c), t);
        case W:
          return ((t = ye(13, n, e, i)), (t.elementType = W), (t.lanes = c), t);
        case F:
          return ((t = ye(19, n, e, i)), (t.elementType = F), (t.lanes = c), t);
        default:
          if (typeof t == "object" && t !== null)
            switch (t.$$typeof) {
              case X:
                f = 10;
                break t;
              case Y:
                f = 9;
                break t;
              case Z:
                f = 11;
                break t;
              case Q:
                f = 14;
                break t;
              case et:
                ((f = 16), (l = null));
                break t;
            }
          ((f = 29), (n = Error(o(130, t === null ? "null" : typeof t, ""))), (l = null));
      }
    return ((e = ye(f, n, e, i)), (e.elementType = t), (e.type = l), (e.lanes = c), e);
  }
  function cl(t, e, n, l) {
    return ((t = ye(7, t, l, e)), (t.lanes = n), t);
  }
  function Mc(t, e, n) {
    return ((t = ye(6, t, null, e)), (t.lanes = n), t);
  }
  function cf(t) {
    var e = ye(18, null, null, 0);
    return ((e.stateNode = t), e);
  }
  function Dc(t, e, n) {
    return (
      (e = ye(4, t.children !== null ? t.children : [], t.key, e)),
      (e.lanes = n),
      (e.stateNode = {
        containerInfo: t.containerInfo,
        pendingChildren: null,
        implementation: t.implementation,
      }),
      e
    );
  }
  var of = new WeakMap();
  function Oe(t, e) {
    if (typeof t == "object" && t !== null) {
      var n = of.get(t);
      return n !== void 0 ? n : ((e = { value: t, source: e, stack: us(e) }), of.set(t, e), e);
    }
    return { value: t, source: e, stack: us(e) };
  }
  var Ul = [],
    Hl = 0,
    Li = null,
    _a = 0,
    we = [],
    _e = 0,
    Cn = null,
    Ge = 1,
    Xe = "";
  function en(t, e) {
    ((Ul[Hl++] = _a), (Ul[Hl++] = Li), (Li = t), (_a = e));
  }
  function rf(t, e, n) {
    ((we[_e++] = Ge), (we[_e++] = Xe), (we[_e++] = Cn), (Cn = t));
    var l = Ge;
    t = Xe;
    var i = 32 - he(l) - 1;
    ((l &= ~(1 << i)), (n += 1));
    var c = 32 - he(e) + i;
    if (30 < c) {
      var f = i - (i % 5);
      ((c = (l & ((1 << f) - 1)).toString(32)),
        (l >>= f),
        (i -= f),
        (Ge = (1 << (32 - he(e) + i)) | (n << i) | l),
        (Xe = c + t));
    } else ((Ge = (1 << c) | (n << i) | l), (Xe = t));
  }
  function Uc(t) {
    t.return !== null && (en(t, 1), rf(t, 1, 0));
  }
  function Hc(t) {
    for (; t === Li; ) ((Li = Ul[--Hl]), (Ul[Hl] = null), (_a = Ul[--Hl]), (Ul[Hl] = null));
    for (; t === Cn; )
      ((Cn = we[--_e]),
        (we[_e] = null),
        (Xe = we[--_e]),
        (we[_e] = null),
        (Ge = we[--_e]),
        (we[_e] = null));
  }
  function sf(t, e) {
    ((we[_e++] = Ge), (we[_e++] = Xe), (we[_e++] = Cn), (Ge = e.id), (Xe = e.overflow), (Cn = t));
  }
  var Pt = null,
    jt = null,
    gt = !1,
    Nn = null,
    Re = !1,
    Bc = Error(o(519));
  function On(t) {
    var e = Error(
      o(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", ""),
    );
    throw (Ra(Oe(e, t)), Bc);
  }
  function ff(t) {
    var e = t.stateNode,
      n = t.type,
      l = t.memoizedProps;
    switch (((e[Ft] = t), (e[ie] = l), n)) {
      case "dialog":
        (mt("cancel", e), mt("close", e));
        break;
      case "iframe":
      case "object":
      case "embed":
        mt("load", e);
        break;
      case "video":
      case "audio":
        for (n = 0; n < Pa.length; n++) mt(Pa[n], e);
        break;
      case "source":
        mt("error", e);
        break;
      case "img":
      case "image":
      case "link":
        (mt("error", e), mt("load", e));
        break;
      case "details":
        mt("toggle", e);
        break;
      case "input":
        (mt("invalid", e),
          As(e, l.value, l.defaultValue, l.checked, l.defaultChecked, l.type, l.name, !0));
        break;
      case "select":
        mt("invalid", e);
        break;
      case "textarea":
        (mt("invalid", e), Cs(e, l.value, l.defaultValue, l.children));
    }
    ((n = l.children),
      (typeof n != "string" && typeof n != "number" && typeof n != "bigint") ||
      e.textContent === "" + n ||
      l.suppressHydrationWarning === !0 ||
      wm(e.textContent, n)
        ? (l.popover != null && (mt("beforetoggle", e), mt("toggle", e)),
          l.onScroll != null && mt("scroll", e),
          l.onScrollEnd != null && mt("scrollend", e),
          l.onClick != null && (e.onclick = Pe),
          (e = !0))
        : (e = !1),
      e || On(t, !0));
  }
  function df(t) {
    for (Pt = t.return; Pt; )
      switch (Pt.tag) {
        case 5:
        case 31:
        case 13:
          Re = !1;
          return;
        case 27:
        case 3:
          Re = !0;
          return;
        default:
          Pt = Pt.return;
      }
  }
  function Bl(t) {
    if (t !== Pt) return !1;
    if (!gt) return (df(t), (gt = !0), !1);
    var e = t.tag,
      n;
    if (
      ((n = e !== 3 && e !== 27) &&
        ((n = e === 5) &&
          ((n = t.type), (n = !(n !== "form" && n !== "button") || nr(t.type, t.memoizedProps))),
        (n = !n)),
      n && jt && On(t),
      df(t),
      e === 13)
    ) {
      if (((t = t.memoizedState), (t = t !== null ? t.dehydrated : null), !t)) throw Error(o(317));
      jt = Bm(t);
    } else if (e === 31) {
      if (((t = t.memoizedState), (t = t !== null ? t.dehydrated : null), !t)) throw Error(o(317));
      jt = Bm(t);
    } else
      e === 27
        ? ((e = jt), Yn(t.type) ? ((t = cr), (cr = null), (jt = t)) : (jt = e))
        : (jt = Pt ? je(t.stateNode.nextSibling) : null);
    return !0;
  }
  function ol() {
    ((jt = Pt = null), (gt = !1));
  }
  function Lc() {
    var t = Nn;
    return (t !== null && (se === null ? (se = t) : se.push.apply(se, t), (Nn = null)), t);
  }
  function Ra(t) {
    Nn === null ? (Nn = [t]) : Nn.push(t);
  }
  var qc = A(null),
    rl = null,
    nn = null;
  function wn(t, e, n) {
    (J(qc, e._currentValue), (e._currentValue = n));
  }
  function ln(t) {
    ((t._currentValue = qc.current), q(qc));
  }
  function Vc(t, e, n) {
    for (; t !== null; ) {
      var l = t.alternate;
      if (
        ((t.childLanes & e) !== e
          ? ((t.childLanes |= e), l !== null && (l.childLanes |= e))
          : l !== null && (l.childLanes & e) !== e && (l.childLanes |= e),
        t === n)
      )
        break;
      t = t.return;
    }
  }
  function Yc(t, e, n, l) {
    var i = t.child;
    for (i !== null && (i.return = t); i !== null; ) {
      var c = i.dependencies;
      if (c !== null) {
        var f = i.child;
        c = c.firstContext;
        t: for (; c !== null; ) {
          var y = c;
          c = i;
          for (var E = 0; E < e.length; E++)
            if (y.context === e[E]) {
              ((c.lanes |= n),
                (y = c.alternate),
                y !== null && (y.lanes |= n),
                Vc(c.return, n, t),
                l || (f = null));
              break t;
            }
          c = y.next;
        }
      } else if (i.tag === 18) {
        if (((f = i.return), f === null)) throw Error(o(341));
        ((f.lanes |= n), (c = f.alternate), c !== null && (c.lanes |= n), Vc(f, n, t), (f = null));
      } else f = i.child;
      if (f !== null) f.return = i;
      else
        for (f = i; f !== null; ) {
          if (f === t) {
            f = null;
            break;
          }
          if (((i = f.sibling), i !== null)) {
            ((i.return = f.return), (f = i));
            break;
          }
          f = f.return;
        }
      i = f;
    }
  }
  function Ll(t, e, n, l) {
    t = null;
    for (var i = e, c = !1; i !== null; ) {
      if (!c) {
        if ((i.flags & 524288) !== 0) c = !0;
        else if ((i.flags & 262144) !== 0) break;
      }
      if (i.tag === 10) {
        var f = i.alternate;
        if (f === null) throw Error(o(387));
        if (((f = f.memoizedProps), f !== null)) {
          var y = i.type;
          pe(i.pendingProps.value, f.value) || (t !== null ? t.push(y) : (t = [y]));
        }
      } else if (i === pt.current) {
        if (((f = i.alternate), f === null)) throw Error(o(387));
        f.memoizedState.memoizedState !== i.memoizedState.memoizedState &&
          (t !== null ? t.push(li) : (t = [li]));
      }
      i = i.return;
    }
    (t !== null && Yc(e, t, n, l), (e.flags |= 262144));
  }
  function qi(t) {
    for (t = t.firstContext; t !== null; ) {
      if (!pe(t.context._currentValue, t.memoizedValue)) return !0;
      t = t.next;
    }
    return !1;
  }
  function sl(t) {
    ((rl = t), (nn = null), (t = t.dependencies), t !== null && (t.firstContext = null));
  }
  function It(t) {
    return mf(rl, t);
  }
  function Vi(t, e) {
    return (rl === null && sl(t), mf(t, e));
  }
  function mf(t, e) {
    var n = e._currentValue;
    if (((e = { context: e, memoizedValue: n, next: null }), nn === null)) {
      if (t === null) throw Error(o(308));
      ((nn = e), (t.dependencies = { lanes: 0, firstContext: e }), (t.flags |= 524288));
    } else nn = nn.next = e;
    return n;
  }
  var Av =
      typeof AbortController < "u"
        ? AbortController
        : function () {
            var t = [],
              e = (this.signal = {
                aborted: !1,
                addEventListener: function (n, l) {
                  t.push(l);
                },
              });
            this.abort = function () {
              ((e.aborted = !0),
                t.forEach(function (n) {
                  return n();
                }));
            };
          },
    Tv = a.unstable_scheduleCallback,
    Cv = a.unstable_NormalPriority,
    Yt = {
      $$typeof: X,
      Consumer: null,
      Provider: null,
      _currentValue: null,
      _currentValue2: null,
      _threadCount: 0,
    };
  function Gc() {
    return { controller: new Av(), data: new Map(), refCount: 0 };
  }
  function za(t) {
    (t.refCount--,
      t.refCount === 0 &&
        Tv(Cv, function () {
          t.controller.abort();
        }));
  }
  var ja = null,
    Xc = 0,
    ql = 0,
    Vl = null;
  function Nv(t, e) {
    if (ja === null) {
      var n = (ja = []);
      ((Xc = 0),
        (ql = Jo()),
        (Vl = {
          status: "pending",
          value: void 0,
          then: function (l) {
            n.push(l);
          },
        }));
    }
    return (Xc++, e.then(hf, hf), e);
  }
  function hf() {
    if (--Xc === 0 && ja !== null) {
      Vl !== null && (Vl.status = "fulfilled");
      var t = ja;
      ((ja = null), (ql = 0), (Vl = null));
      for (var e = 0; e < t.length; e++) (0, t[e])();
    }
  }
  function Ov(t, e) {
    var n = [],
      l = {
        status: "pending",
        value: null,
        reason: null,
        then: function (i) {
          n.push(i);
        },
      };
    return (
      t.then(
        function () {
          ((l.status = "fulfilled"), (l.value = e));
          for (var i = 0; i < n.length; i++) (0, n[i])(e);
        },
        function (i) {
          for (l.status = "rejected", l.reason = i, i = 0; i < n.length; i++) (0, n[i])(void 0);
        },
      ),
      l
    );
  }
  var pf = _.S;
  _.S = function (t, e) {
    ((Pd = de()),
      typeof e == "object" && e !== null && typeof e.then == "function" && Nv(t, e),
      pf !== null && pf(t, e));
  };
  var fl = A(null);
  function Qc() {
    var t = fl.current;
    return t !== null ? t : zt.pooledCache;
  }
  function Yi(t, e) {
    e === null ? J(fl, fl.current) : J(fl, e.pool);
  }
  function yf() {
    var t = Qc();
    return t === null ? null : { parent: Yt._currentValue, pool: t };
  }
  var Yl = Error(o(460)),
    Zc = Error(o(474)),
    Gi = Error(o(542)),
    Xi = { then: function () {} };
  function vf(t) {
    return ((t = t.status), t === "fulfilled" || t === "rejected");
  }
  function gf(t, e, n) {
    switch (
      ((n = t[n]), n === void 0 ? t.push(e) : n !== e && (e.then(Pe, Pe), (e = n)), e.status)
    ) {
      case "fulfilled":
        return e.value;
      case "rejected":
        throw ((t = e.reason), xf(t), t);
      default:
        if (typeof e.status == "string") e.then(Pe, Pe);
        else {
          if (((t = zt), t !== null && 100 < t.shellSuspendCounter)) throw Error(o(482));
          ((t = e),
            (t.status = "pending"),
            t.then(
              function (l) {
                if (e.status === "pending") {
                  var i = e;
                  ((i.status = "fulfilled"), (i.value = l));
                }
              },
              function (l) {
                if (e.status === "pending") {
                  var i = e;
                  ((i.status = "rejected"), (i.reason = l));
                }
              },
            ));
        }
        switch (e.status) {
          case "fulfilled":
            return e.value;
          case "rejected":
            throw ((t = e.reason), xf(t), t);
        }
        throw ((ml = e), Yl);
    }
  }
  function dl(t) {
    try {
      var e = t._init;
      return e(t._payload);
    } catch (n) {
      throw n !== null && typeof n == "object" && typeof n.then == "function" ? ((ml = n), Yl) : n;
    }
  }
  var ml = null;
  function bf() {
    if (ml === null) throw Error(o(459));
    var t = ml;
    return ((ml = null), t);
  }
  function xf(t) {
    if (t === Yl || t === Gi) throw Error(o(483));
  }
  var Gl = null,
    Ma = 0;
  function Qi(t) {
    var e = Ma;
    return ((Ma += 1), Gl === null && (Gl = []), gf(Gl, t, e));
  }
  function Da(t, e) {
    ((e = e.props.ref), (t.ref = e !== void 0 ? e : null));
  }
  function Zi(t, e) {
    throw e.$$typeof === N
      ? Error(o(525))
      : ((t = Object.prototype.toString.call(e)),
        Error(
          o(
            31,
            t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t,
          ),
        ));
  }
  function Sf(t) {
    function e(C, T) {
      if (t) {
        var O = C.deletions;
        O === null ? ((C.deletions = [T]), (C.flags |= 16)) : O.push(T);
      }
    }
    function n(C, T) {
      if (!t) return null;
      for (; T !== null; ) (e(C, T), (T = T.sibling));
      return null;
    }
    function l(C) {
      for (var T = new Map(); C !== null; )
        (C.key !== null ? T.set(C.key, C) : T.set(C.index, C), (C = C.sibling));
      return T;
    }
    function i(C, T) {
      return ((C = tn(C, T)), (C.index = 0), (C.sibling = null), C);
    }
    function c(C, T, O) {
      return (
        (C.index = O),
        t
          ? ((O = C.alternate),
            O !== null
              ? ((O = O.index), O < T ? ((C.flags |= 67108866), T) : O)
              : ((C.flags |= 67108866), T))
          : ((C.flags |= 1048576), T)
      );
    }
    function f(C) {
      return (t && C.alternate === null && (C.flags |= 67108866), C);
    }
    function y(C, T, O, B) {
      return T === null || T.tag !== 6
        ? ((T = Mc(O, C.mode, B)), (T.return = C), T)
        : ((T = i(T, O)), (T.return = C), T);
    }
    function E(C, T, O, B) {
      var tt = O.type;
      return tt === U
        ? H(C, T, O.props.children, B, O.key)
        : T !== null &&
            (T.elementType === tt ||
              (typeof tt == "object" && tt !== null && tt.$$typeof === et && dl(tt) === T.type))
          ? ((T = i(T, O.props)), Da(T, O), (T.return = C), T)
          : ((T = Bi(O.type, O.key, O.props, null, C.mode, B)), Da(T, O), (T.return = C), T);
    }
    function w(C, T, O, B) {
      return T === null ||
        T.tag !== 4 ||
        T.stateNode.containerInfo !== O.containerInfo ||
        T.stateNode.implementation !== O.implementation
        ? ((T = Dc(O, C.mode, B)), (T.return = C), T)
        : ((T = i(T, O.children || [])), (T.return = C), T);
    }
    function H(C, T, O, B, tt) {
      return T === null || T.tag !== 7
        ? ((T = cl(O, C.mode, B, tt)), (T.return = C), T)
        : ((T = i(T, O)), (T.return = C), T);
    }
    function L(C, T, O) {
      if ((typeof T == "string" && T !== "") || typeof T == "number" || typeof T == "bigint")
        return ((T = Mc("" + T, C.mode, O)), (T.return = C), T);
      if (typeof T == "object" && T !== null) {
        switch (T.$$typeof) {
          case z:
            return ((O = Bi(T.type, T.key, T.props, null, C.mode, O)), Da(O, T), (O.return = C), O);
          case D:
            return ((T = Dc(T, C.mode, O)), (T.return = C), T);
          case et:
            return ((T = dl(T)), L(C, T, O));
        }
        if (Ct(T) || I(T)) return ((T = cl(T, C.mode, O, null)), (T.return = C), T);
        if (typeof T.then == "function") return L(C, Qi(T), O);
        if (T.$$typeof === X) return L(C, Vi(C, T), O);
        Zi(C, T);
      }
      return null;
    }
    function R(C, T, O, B) {
      var tt = T !== null ? T.key : null;
      if ((typeof O == "string" && O !== "") || typeof O == "number" || typeof O == "bigint")
        return tt !== null ? null : y(C, T, "" + O, B);
      if (typeof O == "object" && O !== null) {
        switch (O.$$typeof) {
          case z:
            return O.key === tt ? E(C, T, O, B) : null;
          case D:
            return O.key === tt ? w(C, T, O, B) : null;
          case et:
            return ((O = dl(O)), R(C, T, O, B));
        }
        if (Ct(O) || I(O)) return tt !== null ? null : H(C, T, O, B, null);
        if (typeof O.then == "function") return R(C, T, Qi(O), B);
        if (O.$$typeof === X) return R(C, T, Vi(C, O), B);
        Zi(C, O);
      }
      return null;
    }
    function j(C, T, O, B, tt) {
      if ((typeof B == "string" && B !== "") || typeof B == "number" || typeof B == "bigint")
        return ((C = C.get(O) || null), y(T, C, "" + B, tt));
      if (typeof B == "object" && B !== null) {
        switch (B.$$typeof) {
          case z:
            return ((C = C.get(B.key === null ? O : B.key) || null), E(T, C, B, tt));
          case D:
            return ((C = C.get(B.key === null ? O : B.key) || null), w(T, C, B, tt));
          case et:
            return ((B = dl(B)), j(C, T, O, B, tt));
        }
        if (Ct(B) || I(B)) return ((C = C.get(O) || null), H(T, C, B, tt, null));
        if (typeof B.then == "function") return j(C, T, O, Qi(B), tt);
        if (B.$$typeof === X) return j(C, T, O, Vi(T, B), tt);
        Zi(T, B);
      }
      return null;
    }
    function $(C, T, O, B) {
      for (
        var tt = null, Et = null, P = T, ot = (T = 0), vt = null;
        P !== null && ot < O.length;
        ot++
      ) {
        P.index > ot ? ((vt = P), (P = null)) : (vt = P.sibling);
        var At = R(C, P, O[ot], B);
        if (At === null) {
          P === null && (P = vt);
          break;
        }
        (t && P && At.alternate === null && e(C, P),
          (T = c(At, T, ot)),
          Et === null ? (tt = At) : (Et.sibling = At),
          (Et = At),
          (P = vt));
      }
      if (ot === O.length) return (n(C, P), gt && en(C, ot), tt);
      if (P === null) {
        for (; ot < O.length; ot++)
          ((P = L(C, O[ot], B)),
            P !== null && ((T = c(P, T, ot)), Et === null ? (tt = P) : (Et.sibling = P), (Et = P)));
        return (gt && en(C, ot), tt);
      }
      for (P = l(P); ot < O.length; ot++)
        ((vt = j(P, C, ot, O[ot], B)),
          vt !== null &&
            (t && vt.alternate !== null && P.delete(vt.key === null ? ot : vt.key),
            (T = c(vt, T, ot)),
            Et === null ? (tt = vt) : (Et.sibling = vt),
            (Et = vt)));
      return (
        t &&
          P.forEach(function (Kn) {
            return e(C, Kn);
          }),
        gt && en(C, ot),
        tt
      );
    }
    function lt(C, T, O, B) {
      if (O == null) throw Error(o(151));
      for (
        var tt = null, Et = null, P = T, ot = (T = 0), vt = null, At = O.next();
        P !== null && !At.done;
        ot++, At = O.next()
      ) {
        P.index > ot ? ((vt = P), (P = null)) : (vt = P.sibling);
        var Kn = R(C, P, At.value, B);
        if (Kn === null) {
          P === null && (P = vt);
          break;
        }
        (t && P && Kn.alternate === null && e(C, P),
          (T = c(Kn, T, ot)),
          Et === null ? (tt = Kn) : (Et.sibling = Kn),
          (Et = Kn),
          (P = vt));
      }
      if (At.done) return (n(C, P), gt && en(C, ot), tt);
      if (P === null) {
        for (; !At.done; ot++, At = O.next())
          ((At = L(C, At.value, B)),
            At !== null &&
              ((T = c(At, T, ot)), Et === null ? (tt = At) : (Et.sibling = At), (Et = At)));
        return (gt && en(C, ot), tt);
      }
      for (P = l(P); !At.done; ot++, At = O.next())
        ((At = j(P, C, ot, At.value, B)),
          At !== null &&
            (t && At.alternate !== null && P.delete(At.key === null ? ot : At.key),
            (T = c(At, T, ot)),
            Et === null ? (tt = At) : (Et.sibling = At),
            (Et = At)));
      return (
        t &&
          P.forEach(function (Lg) {
            return e(C, Lg);
          }),
        gt && en(C, ot),
        tt
      );
    }
    function Rt(C, T, O, B) {
      if (
        (typeof O == "object" &&
          O !== null &&
          O.type === U &&
          O.key === null &&
          (O = O.props.children),
        typeof O == "object" && O !== null)
      ) {
        switch (O.$$typeof) {
          case z:
            t: {
              for (var tt = O.key; T !== null; ) {
                if (T.key === tt) {
                  if (((tt = O.type), tt === U)) {
                    if (T.tag === 7) {
                      (n(C, T.sibling), (B = i(T, O.props.children)), (B.return = C), (C = B));
                      break t;
                    }
                  } else if (
                    T.elementType === tt ||
                    (typeof tt == "object" &&
                      tt !== null &&
                      tt.$$typeof === et &&
                      dl(tt) === T.type)
                  ) {
                    (n(C, T.sibling), (B = i(T, O.props)), Da(B, O), (B.return = C), (C = B));
                    break t;
                  }
                  n(C, T);
                  break;
                } else e(C, T);
                T = T.sibling;
              }
              O.type === U
                ? ((B = cl(O.props.children, C.mode, B, O.key)), (B.return = C), (C = B))
                : ((B = Bi(O.type, O.key, O.props, null, C.mode, B)),
                  Da(B, O),
                  (B.return = C),
                  (C = B));
            }
            return f(C);
          case D:
            t: {
              for (tt = O.key; T !== null; ) {
                if (T.key === tt)
                  if (
                    T.tag === 4 &&
                    T.stateNode.containerInfo === O.containerInfo &&
                    T.stateNode.implementation === O.implementation
                  ) {
                    (n(C, T.sibling), (B = i(T, O.children || [])), (B.return = C), (C = B));
                    break t;
                  } else {
                    n(C, T);
                    break;
                  }
                else e(C, T);
                T = T.sibling;
              }
              ((B = Dc(O, C.mode, B)), (B.return = C), (C = B));
            }
            return f(C);
          case et:
            return ((O = dl(O)), Rt(C, T, O, B));
        }
        if (Ct(O)) return $(C, T, O, B);
        if (I(O)) {
          if (((tt = I(O)), typeof tt != "function")) throw Error(o(150));
          return ((O = tt.call(O)), lt(C, T, O, B));
        }
        if (typeof O.then == "function") return Rt(C, T, Qi(O), B);
        if (O.$$typeof === X) return Rt(C, T, Vi(C, O), B);
        Zi(C, O);
      }
      return (typeof O == "string" && O !== "") || typeof O == "number" || typeof O == "bigint"
        ? ((O = "" + O),
          T !== null && T.tag === 6
            ? (n(C, T.sibling), (B = i(T, O)), (B.return = C), (C = B))
            : (n(C, T), (B = Mc(O, C.mode, B)), (B.return = C), (C = B)),
          f(C))
        : n(C, T);
    }
    return function (C, T, O, B) {
      try {
        Ma = 0;
        var tt = Rt(C, T, O, B);
        return ((Gl = null), tt);
      } catch (P) {
        if (P === Yl || P === Gi) throw P;
        var Et = ye(29, P, null, C.mode);
        return ((Et.lanes = B), (Et.return = C), Et);
      } finally {
      }
    };
  }
  var hl = Sf(!0),
    Ef = Sf(!1),
    _n = !1;
  function Kc(t) {
    t.updateQueue = {
      baseState: t.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null,
    };
  }
  function Jc(t, e) {
    ((t = t.updateQueue),
      e.updateQueue === t &&
        (e.updateQueue = {
          baseState: t.baseState,
          firstBaseUpdate: t.firstBaseUpdate,
          lastBaseUpdate: t.lastBaseUpdate,
          shared: t.shared,
          callbacks: null,
        }));
  }
  function Rn(t) {
    return { lane: t, tag: 0, payload: null, callback: null, next: null };
  }
  function zn(t, e, n) {
    var l = t.updateQueue;
    if (l === null) return null;
    if (((l = l.shared), (Tt & 2) !== 0)) {
      var i = l.pending;
      return (
        i === null ? (e.next = e) : ((e.next = i.next), (i.next = e)),
        (l.pending = e),
        (e = Hi(t)),
        af(t, null, n),
        e
      );
    }
    return (Ui(t, l, e, n), Hi(t));
  }
  function Ua(t, e, n) {
    if (((e = e.updateQueue), e !== null && ((e = e.shared), (n & 4194048) !== 0))) {
      var l = e.lanes;
      ((l &= t.pendingLanes), (n |= l), (e.lanes = n), ds(t, n));
    }
  }
  function $c(t, e) {
    var n = t.updateQueue,
      l = t.alternate;
    if (l !== null && ((l = l.updateQueue), n === l)) {
      var i = null,
        c = null;
      if (((n = n.firstBaseUpdate), n !== null)) {
        do {
          var f = { lane: n.lane, tag: n.tag, payload: n.payload, callback: null, next: null };
          (c === null ? (i = c = f) : (c = c.next = f), (n = n.next));
        } while (n !== null);
        c === null ? (i = c = e) : (c = c.next = e);
      } else i = c = e;
      ((n = {
        baseState: l.baseState,
        firstBaseUpdate: i,
        lastBaseUpdate: c,
        shared: l.shared,
        callbacks: l.callbacks,
      }),
        (t.updateQueue = n));
      return;
    }
    ((t = n.lastBaseUpdate),
      t === null ? (n.firstBaseUpdate = e) : (t.next = e),
      (n.lastBaseUpdate = e));
  }
  var kc = !1;
  function Ha() {
    if (kc) {
      var t = Vl;
      if (t !== null) throw t;
    }
  }
  function Ba(t, e, n, l) {
    kc = !1;
    var i = t.updateQueue;
    _n = !1;
    var c = i.firstBaseUpdate,
      f = i.lastBaseUpdate,
      y = i.shared.pending;
    if (y !== null) {
      i.shared.pending = null;
      var E = y,
        w = E.next;
      ((E.next = null), f === null ? (c = w) : (f.next = w), (f = E));
      var H = t.alternate;
      H !== null &&
        ((H = H.updateQueue),
        (y = H.lastBaseUpdate),
        y !== f && (y === null ? (H.firstBaseUpdate = w) : (y.next = w), (H.lastBaseUpdate = E)));
    }
    if (c !== null) {
      var L = i.baseState;
      ((f = 0), (H = w = E = null), (y = c));
      do {
        var R = y.lane & -536870913,
          j = R !== y.lane;
        if (j ? (yt & R) === R : (l & R) === R) {
          (R !== 0 && R === ql && (kc = !0),
            H !== null &&
              (H = H.next =
                { lane: 0, tag: y.tag, payload: y.payload, callback: null, next: null }));
          t: {
            var $ = t,
              lt = y;
            R = e;
            var Rt = n;
            switch (lt.tag) {
              case 1:
                if ((($ = lt.payload), typeof $ == "function")) {
                  L = $.call(Rt, L, R);
                  break t;
                }
                L = $;
                break t;
              case 3:
                $.flags = ($.flags & -65537) | 128;
              case 0:
                if (
                  (($ = lt.payload), (R = typeof $ == "function" ? $.call(Rt, L, R) : $), R == null)
                )
                  break t;
                L = x({}, L, R);
                break t;
              case 2:
                _n = !0;
            }
          }
          ((R = y.callback),
            R !== null &&
              ((t.flags |= 64),
              j && (t.flags |= 8192),
              (j = i.callbacks),
              j === null ? (i.callbacks = [R]) : j.push(R)));
        } else
          ((j = { lane: R, tag: y.tag, payload: y.payload, callback: y.callback, next: null }),
            H === null ? ((w = H = j), (E = L)) : (H = H.next = j),
            (f |= R));
        if (((y = y.next), y === null)) {
          if (((y = i.shared.pending), y === null)) break;
          ((j = y),
            (y = j.next),
            (j.next = null),
            (i.lastBaseUpdate = j),
            (i.shared.pending = null));
        }
      } while (!0);
      (H === null && (E = L),
        (i.baseState = E),
        (i.firstBaseUpdate = w),
        (i.lastBaseUpdate = H),
        c === null && (i.shared.lanes = 0),
        (Hn |= f),
        (t.lanes = f),
        (t.memoizedState = L));
    }
  }
  function Af(t, e) {
    if (typeof t != "function") throw Error(o(191, t));
    t.call(e);
  }
  function Tf(t, e) {
    var n = t.callbacks;
    if (n !== null) for (t.callbacks = null, t = 0; t < n.length; t++) Af(n[t], e);
  }
  var Xl = A(null),
    Ki = A(0);
  function Cf(t, e) {
    ((t = mn), J(Ki, t), J(Xl, e), (mn = t | e.baseLanes));
  }
  function Wc() {
    (J(Ki, mn), J(Xl, Xl.current));
  }
  function Fc() {
    ((mn = Ki.current), q(Xl), q(Ki));
  }
  var ve = A(null),
    ze = null;
  function jn(t) {
    var e = t.alternate;
    (J(qt, qt.current & 1),
      J(ve, t),
      ze === null && (e === null || Xl.current !== null || e.memoizedState !== null) && (ze = t));
  }
  function Pc(t) {
    (J(qt, qt.current), J(ve, t), ze === null && (ze = t));
  }
  function Nf(t) {
    t.tag === 22 ? (J(qt, qt.current), J(ve, t), ze === null && (ze = t)) : Mn();
  }
  function Mn() {
    (J(qt, qt.current), J(ve, ve.current));
  }
  function ge(t) {
    (q(ve), ze === t && (ze = null), q(qt));
  }
  var qt = A(0);
  function Ji(t) {
    for (var e = t; e !== null; ) {
      if (e.tag === 13) {
        var n = e.memoizedState;
        if (n !== null && ((n = n.dehydrated), n === null || ir(n) || ur(n))) return e;
      } else if (
        e.tag === 19 &&
        (e.memoizedProps.revealOrder === "forwards" ||
          e.memoizedProps.revealOrder === "backwards" ||
          e.memoizedProps.revealOrder === "unstable_legacy-backwards" ||
          e.memoizedProps.revealOrder === "together")
      ) {
        if ((e.flags & 128) !== 0) return e;
      } else if (e.child !== null) {
        ((e.child.return = e), (e = e.child));
        continue;
      }
      if (e === t) break;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) return null;
        e = e.return;
      }
      ((e.sibling.return = e.return), (e = e.sibling));
    }
    return null;
  }
  var an = 0,
    ut = null,
    wt = null,
    Gt = null,
    $i = !1,
    Ql = !1,
    pl = !1,
    ki = 0,
    La = 0,
    Zl = null,
    wv = 0;
  function Bt() {
    throw Error(o(321));
  }
  function Ic(t, e) {
    if (e === null) return !1;
    for (var n = 0; n < e.length && n < t.length; n++) if (!pe(t[n], e[n])) return !1;
    return !0;
  }
  function to(t, e, n, l, i, c) {
    return (
      (an = c),
      (ut = e),
      (e.memoizedState = null),
      (e.updateQueue = null),
      (e.lanes = 0),
      (_.H = t === null || t.memoizedState === null ? rd : yo),
      (pl = !1),
      (c = n(l, i)),
      (pl = !1),
      Ql && (c = wf(e, n, l, i)),
      Of(t),
      c
    );
  }
  function Of(t) {
    _.H = Ya;
    var e = wt !== null && wt.next !== null;
    if (((an = 0), (Gt = wt = ut = null), ($i = !1), (La = 0), (Zl = null), e)) throw Error(o(300));
    t === null || Xt || ((t = t.dependencies), t !== null && qi(t) && (Xt = !0));
  }
  function wf(t, e, n, l) {
    ut = t;
    var i = 0;
    do {
      if ((Ql && (Zl = null), (La = 0), (Ql = !1), 25 <= i)) throw Error(o(301));
      if (((i += 1), (Gt = wt = null), t.updateQueue != null)) {
        var c = t.updateQueue;
        ((c.lastEffect = null),
          (c.events = null),
          (c.stores = null),
          c.memoCache != null && (c.memoCache.index = 0));
      }
      ((_.H = sd), (c = e(n, l)));
    } while (Ql);
    return c;
  }
  function _v() {
    var t = _.H,
      e = t.useState()[0];
    return (
      (e = typeof e.then == "function" ? qa(e) : e),
      (t = t.useState()[0]),
      (wt !== null ? wt.memoizedState : null) !== t && (ut.flags |= 1024),
      e
    );
  }
  function eo() {
    var t = ki !== 0;
    return ((ki = 0), t);
  }
  function no(t, e, n) {
    ((e.updateQueue = t.updateQueue), (e.flags &= -2053), (t.lanes &= ~n));
  }
  function lo(t) {
    if ($i) {
      for (t = t.memoizedState; t !== null; ) {
        var e = t.queue;
        (e !== null && (e.pending = null), (t = t.next));
      }
      $i = !1;
    }
    ((an = 0), (Gt = wt = ut = null), (Ql = !1), (La = ki = 0), (Zl = null));
  }
  function ae() {
    var t = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return (Gt === null ? (ut.memoizedState = Gt = t) : (Gt = Gt.next = t), Gt);
  }
  function Vt() {
    if (wt === null) {
      var t = ut.alternate;
      t = t !== null ? t.memoizedState : null;
    } else t = wt.next;
    var e = Gt === null ? ut.memoizedState : Gt.next;
    if (e !== null) ((Gt = e), (wt = t));
    else {
      if (t === null) throw ut.alternate === null ? Error(o(467)) : Error(o(310));
      ((wt = t),
        (t = {
          memoizedState: wt.memoizedState,
          baseState: wt.baseState,
          baseQueue: wt.baseQueue,
          queue: wt.queue,
          next: null,
        }),
        Gt === null ? (ut.memoizedState = Gt = t) : (Gt = Gt.next = t));
    }
    return Gt;
  }
  function Wi() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function qa(t) {
    var e = La;
    return (
      (La += 1),
      Zl === null && (Zl = []),
      (t = gf(Zl, t, e)),
      (e = ut),
      (Gt === null ? e.memoizedState : Gt.next) === null &&
        ((e = e.alternate), (_.H = e === null || e.memoizedState === null ? rd : yo)),
      t
    );
  }
  function Fi(t) {
    if (t !== null && typeof t == "object") {
      if (typeof t.then == "function") return qa(t);
      if (t.$$typeof === X) return It(t);
    }
    throw Error(o(438, String(t)));
  }
  function ao(t) {
    var e = null,
      n = ut.updateQueue;
    if ((n !== null && (e = n.memoCache), e == null)) {
      var l = ut.alternate;
      l !== null &&
        ((l = l.updateQueue),
        l !== null &&
          ((l = l.memoCache),
          l != null &&
            (e = {
              data: l.data.map(function (i) {
                return i.slice();
              }),
              index: 0,
            })));
    }
    if (
      (e == null && (e = { data: [], index: 0 }),
      n === null && ((n = Wi()), (ut.updateQueue = n)),
      (n.memoCache = e),
      (n = e.data[e.index]),
      n === void 0)
    )
      for (n = e.data[e.index] = Array(t), l = 0; l < t; l++) n[l] = ht;
    return (e.index++, n);
  }
  function un(t, e) {
    return typeof e == "function" ? e(t) : e;
  }
  function Pi(t) {
    var e = Vt();
    return io(e, wt, t);
  }
  function io(t, e, n) {
    var l = t.queue;
    if (l === null) throw Error(o(311));
    l.lastRenderedReducer = n;
    var i = t.baseQueue,
      c = l.pending;
    if (c !== null) {
      if (i !== null) {
        var f = i.next;
        ((i.next = c.next), (c.next = f));
      }
      ((e.baseQueue = i = c), (l.pending = null));
    }
    if (((c = t.baseState), i === null)) t.memoizedState = c;
    else {
      e = i.next;
      var y = (f = null),
        E = null,
        w = e,
        H = !1;
      do {
        var L = w.lane & -536870913;
        if (L !== w.lane ? (yt & L) === L : (an & L) === L) {
          var R = w.revertLane;
          if (R === 0)
            (E !== null &&
              (E = E.next =
                {
                  lane: 0,
                  revertLane: 0,
                  gesture: null,
                  action: w.action,
                  hasEagerState: w.hasEagerState,
                  eagerState: w.eagerState,
                  next: null,
                }),
              L === ql && (H = !0));
          else if ((an & R) === R) {
            ((w = w.next), R === ql && (H = !0));
            continue;
          } else
            ((L = {
              lane: 0,
              revertLane: w.revertLane,
              gesture: null,
              action: w.action,
              hasEagerState: w.hasEagerState,
              eagerState: w.eagerState,
              next: null,
            }),
              E === null ? ((y = E = L), (f = c)) : (E = E.next = L),
              (ut.lanes |= R),
              (Hn |= R));
          ((L = w.action), pl && n(c, L), (c = w.hasEagerState ? w.eagerState : n(c, L)));
        } else
          ((R = {
            lane: L,
            revertLane: w.revertLane,
            gesture: w.gesture,
            action: w.action,
            hasEagerState: w.hasEagerState,
            eagerState: w.eagerState,
            next: null,
          }),
            E === null ? ((y = E = R), (f = c)) : (E = E.next = R),
            (ut.lanes |= L),
            (Hn |= L));
        w = w.next;
      } while (w !== null && w !== e);
      if (
        (E === null ? (f = c) : (E.next = y),
        !pe(c, t.memoizedState) && ((Xt = !0), H && ((n = Vl), n !== null)))
      )
        throw n;
      ((t.memoizedState = c), (t.baseState = f), (t.baseQueue = E), (l.lastRenderedState = c));
    }
    return (i === null && (l.lanes = 0), [t.memoizedState, l.dispatch]);
  }
  function uo(t) {
    var e = Vt(),
      n = e.queue;
    if (n === null) throw Error(o(311));
    n.lastRenderedReducer = t;
    var l = n.dispatch,
      i = n.pending,
      c = e.memoizedState;
    if (i !== null) {
      n.pending = null;
      var f = (i = i.next);
      do ((c = t(c, f.action)), (f = f.next));
      while (f !== i);
      (pe(c, e.memoizedState) || (Xt = !0),
        (e.memoizedState = c),
        e.baseQueue === null && (e.baseState = c),
        (n.lastRenderedState = c));
    }
    return [c, l];
  }
  function _f(t, e, n) {
    var l = ut,
      i = Vt(),
      c = gt;
    if (c) {
      if (n === void 0) throw Error(o(407));
      n = n();
    } else n = e();
    var f = !pe((wt || i).memoizedState, n);
    if (
      (f && ((i.memoizedState = n), (Xt = !0)),
      (i = i.queue),
      ro(jf.bind(null, l, i, t), [t]),
      i.getSnapshot !== e || f || (Gt !== null && Gt.memoizedState.tag & 1))
    ) {
      if (
        ((l.flags |= 2048),
        Kl(9, { destroy: void 0 }, zf.bind(null, l, i, n, e), null),
        zt === null)
      )
        throw Error(o(349));
      c || (an & 127) !== 0 || Rf(l, e, n);
    }
    return n;
  }
  function Rf(t, e, n) {
    ((t.flags |= 16384),
      (t = { getSnapshot: e, value: n }),
      (e = ut.updateQueue),
      e === null
        ? ((e = Wi()), (ut.updateQueue = e), (e.stores = [t]))
        : ((n = e.stores), n === null ? (e.stores = [t]) : n.push(t)));
  }
  function zf(t, e, n, l) {
    ((e.value = n), (e.getSnapshot = l), Mf(e) && Df(t));
  }
  function jf(t, e, n) {
    return n(function () {
      Mf(e) && Df(t);
    });
  }
  function Mf(t) {
    var e = t.getSnapshot;
    t = t.value;
    try {
      var n = e();
      return !pe(t, n);
    } catch {
      return !0;
    }
  }
  function Df(t) {
    var e = ul(t, 2);
    e !== null && fe(e, t, 2);
  }
  function co(t) {
    var e = ae();
    if (typeof t == "function") {
      var n = t;
      if (((t = n()), pl)) {
        En(!0);
        try {
          n();
        } finally {
          En(!1);
        }
      }
    }
    return (
      (e.memoizedState = e.baseState = t),
      (e.queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: un,
        lastRenderedState: t,
      }),
      e
    );
  }
  function Uf(t, e, n, l) {
    return ((t.baseState = n), io(t, wt, typeof l == "function" ? l : un));
  }
  function Rv(t, e, n, l, i) {
    if (eu(t)) throw Error(o(485));
    if (((t = e.action), t !== null)) {
      var c = {
        payload: i,
        action: t,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function (f) {
          c.listeners.push(f);
        },
      };
      (_.T !== null ? n(!0) : (c.isTransition = !1),
        l(c),
        (n = e.pending),
        n === null
          ? ((c.next = e.pending = c), Hf(e, c))
          : ((c.next = n.next), (e.pending = n.next = c)));
    }
  }
  function Hf(t, e) {
    var n = e.action,
      l = e.payload,
      i = t.state;
    if (e.isTransition) {
      var c = _.T,
        f = {};
      _.T = f;
      try {
        var y = n(i, l),
          E = _.S;
        (E !== null && E(f, y), Bf(t, e, y));
      } catch (w) {
        oo(t, e, w);
      } finally {
        (c !== null && f.types !== null && (c.types = f.types), (_.T = c));
      }
    } else
      try {
        ((c = n(i, l)), Bf(t, e, c));
      } catch (w) {
        oo(t, e, w);
      }
  }
  function Bf(t, e, n) {
    n !== null && typeof n == "object" && typeof n.then == "function"
      ? n.then(
          function (l) {
            Lf(t, e, l);
          },
          function (l) {
            return oo(t, e, l);
          },
        )
      : Lf(t, e, n);
  }
  function Lf(t, e, n) {
    ((e.status = "fulfilled"),
      (e.value = n),
      qf(e),
      (t.state = n),
      (e = t.pending),
      e !== null &&
        ((n = e.next), n === e ? (t.pending = null) : ((n = n.next), (e.next = n), Hf(t, n))));
  }
  function oo(t, e, n) {
    var l = t.pending;
    if (((t.pending = null), l !== null)) {
      l = l.next;
      do ((e.status = "rejected"), (e.reason = n), qf(e), (e = e.next));
      while (e !== l);
    }
    t.action = null;
  }
  function qf(t) {
    t = t.listeners;
    for (var e = 0; e < t.length; e++) (0, t[e])();
  }
  function Vf(t, e) {
    return e;
  }
  function Yf(t, e) {
    if (gt) {
      var n = zt.formState;
      if (n !== null) {
        t: {
          var l = ut;
          if (gt) {
            if (jt) {
              e: {
                for (var i = jt, c = Re; i.nodeType !== 8; ) {
                  if (!c) {
                    i = null;
                    break e;
                  }
                  if (((i = je(i.nextSibling)), i === null)) {
                    i = null;
                    break e;
                  }
                }
                ((c = i.data), (i = c === "F!" || c === "F" ? i : null));
              }
              if (i) {
                ((jt = je(i.nextSibling)), (l = i.data === "F!"));
                break t;
              }
            }
            On(l);
          }
          l = !1;
        }
        l && (e = n[0]);
      }
    }
    return (
      (n = ae()),
      (n.memoizedState = n.baseState = e),
      (l = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Vf,
        lastRenderedState: e,
      }),
      (n.queue = l),
      (n = ud.bind(null, ut, l)),
      (l.dispatch = n),
      (l = co(!1)),
      (c = po.bind(null, ut, !1, l.queue)),
      (l = ae()),
      (i = { state: e, dispatch: null, action: t, pending: null }),
      (l.queue = i),
      (n = Rv.bind(null, ut, i, c, n)),
      (i.dispatch = n),
      (l.memoizedState = t),
      [e, n, !1]
    );
  }
  function Gf(t) {
    var e = Vt();
    return Xf(e, wt, t);
  }
  function Xf(t, e, n) {
    if (
      ((e = io(t, e, Vf)[0]),
      (t = Pi(un)[0]),
      typeof e == "object" && e !== null && typeof e.then == "function")
    )
      try {
        var l = qa(e);
      } catch (f) {
        throw f === Yl ? Gi : f;
      }
    else l = e;
    e = Vt();
    var i = e.queue,
      c = i.dispatch;
    return (
      n !== e.memoizedState &&
        ((ut.flags |= 2048), Kl(9, { destroy: void 0 }, zv.bind(null, i, n), null)),
      [l, c, t]
    );
  }
  function zv(t, e) {
    t.action = e;
  }
  function Qf(t) {
    var e = Vt(),
      n = wt;
    if (n !== null) return Xf(e, n, t);
    (Vt(), (e = e.memoizedState), (n = Vt()));
    var l = n.queue.dispatch;
    return ((n.memoizedState = t), [e, l, !1]);
  }
  function Kl(t, e, n, l) {
    return (
      (t = { tag: t, create: n, deps: l, inst: e, next: null }),
      (e = ut.updateQueue),
      e === null && ((e = Wi()), (ut.updateQueue = e)),
      (n = e.lastEffect),
      n === null
        ? (e.lastEffect = t.next = t)
        : ((l = n.next), (n.next = t), (t.next = l), (e.lastEffect = t)),
      t
    );
  }
  function Zf() {
    return Vt().memoizedState;
  }
  function Ii(t, e, n, l) {
    var i = ae();
    ((ut.flags |= t),
      (i.memoizedState = Kl(1 | e, { destroy: void 0 }, n, l === void 0 ? null : l)));
  }
  function tu(t, e, n, l) {
    var i = Vt();
    l = l === void 0 ? null : l;
    var c = i.memoizedState.inst;
    wt !== null && l !== null && Ic(l, wt.memoizedState.deps)
      ? (i.memoizedState = Kl(e, c, n, l))
      : ((ut.flags |= t), (i.memoizedState = Kl(1 | e, c, n, l)));
  }
  function Kf(t, e) {
    Ii(8390656, 8, t, e);
  }
  function ro(t, e) {
    tu(2048, 8, t, e);
  }
  function jv(t) {
    ut.flags |= 4;
    var e = ut.updateQueue;
    if (e === null) ((e = Wi()), (ut.updateQueue = e), (e.events = [t]));
    else {
      var n = e.events;
      n === null ? (e.events = [t]) : n.push(t);
    }
  }
  function Jf(t) {
    var e = Vt().memoizedState;
    return (
      jv({ ref: e, nextImpl: t }),
      function () {
        if ((Tt & 2) !== 0) throw Error(o(440));
        return e.impl.apply(void 0, arguments);
      }
    );
  }
  function $f(t, e) {
    return tu(4, 2, t, e);
  }
  function kf(t, e) {
    return tu(4, 4, t, e);
  }
  function Wf(t, e) {
    if (typeof e == "function") {
      t = t();
      var n = e(t);
      return function () {
        typeof n == "function" ? n() : e(null);
      };
    }
    if (e != null)
      return (
        (t = t()),
        (e.current = t),
        function () {
          e.current = null;
        }
      );
  }
  function Ff(t, e, n) {
    ((n = n != null ? n.concat([t]) : null), tu(4, 4, Wf.bind(null, e, t), n));
  }
  function so() {}
  function Pf(t, e) {
    var n = Vt();
    e = e === void 0 ? null : e;
    var l = n.memoizedState;
    return e !== null && Ic(e, l[1]) ? l[0] : ((n.memoizedState = [t, e]), t);
  }
  function If(t, e) {
    var n = Vt();
    e = e === void 0 ? null : e;
    var l = n.memoizedState;
    if (e !== null && Ic(e, l[1])) return l[0];
    if (((l = t()), pl)) {
      En(!0);
      try {
        t();
      } finally {
        En(!1);
      }
    }
    return ((n.memoizedState = [l, e]), l);
  }
  function fo(t, e, n) {
    return n === void 0 || ((an & 1073741824) !== 0 && (yt & 261930) === 0)
      ? (t.memoizedState = e)
      : ((t.memoizedState = n), (t = tm()), (ut.lanes |= t), (Hn |= t), n);
  }
  function td(t, e, n, l) {
    return pe(n, e)
      ? n
      : Xl.current !== null
        ? ((t = fo(t, n, l)), pe(t, e) || (Xt = !0), t)
        : (an & 42) === 0 || ((an & 1073741824) !== 0 && (yt & 261930) === 0)
          ? ((Xt = !0), (t.memoizedState = n))
          : ((t = tm()), (ut.lanes |= t), (Hn |= t), e);
  }
  function ed(t, e, n, l, i) {
    var c = G.p;
    G.p = c !== 0 && 8 > c ? c : 8;
    var f = _.T,
      y = {};
    ((_.T = y), po(t, !1, e, n));
    try {
      var E = i(),
        w = _.S;
      if (
        (w !== null && w(y, E), E !== null && typeof E == "object" && typeof E.then == "function")
      ) {
        var H = Ov(E, l);
        Va(t, e, H, Se(t));
      } else Va(t, e, l, Se(t));
    } catch (L) {
      Va(t, e, { then: function () {}, status: "rejected", reason: L }, Se());
    } finally {
      ((G.p = c), f !== null && y.types !== null && (f.types = y.types), (_.T = f));
    }
  }
  function Mv() {}
  function mo(t, e, n, l) {
    if (t.tag !== 5) throw Error(o(476));
    var i = nd(t).queue;
    ed(
      t,
      i,
      e,
      K,
      n === null
        ? Mv
        : function () {
            return (ld(t), n(l));
          },
    );
  }
  function nd(t) {
    var e = t.memoizedState;
    if (e !== null) return e;
    e = {
      memoizedState: K,
      baseState: K,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: un,
        lastRenderedState: K,
      },
      next: null,
    };
    var n = {};
    return (
      (e.next = {
        memoizedState: n,
        baseState: n,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: un,
          lastRenderedState: n,
        },
        next: null,
      }),
      (t.memoizedState = e),
      (t = t.alternate),
      t !== null && (t.memoizedState = e),
      e
    );
  }
  function ld(t) {
    var e = nd(t);
    (e.next === null && (e = t.alternate.memoizedState), Va(t, e.next.queue, {}, Se()));
  }
  function ho() {
    return It(li);
  }
  function ad() {
    return Vt().memoizedState;
  }
  function id() {
    return Vt().memoizedState;
  }
  function Dv(t) {
    for (var e = t.return; e !== null; ) {
      switch (e.tag) {
        case 24:
        case 3:
          var n = Se();
          t = Rn(n);
          var l = zn(e, t, n);
          (l !== null && (fe(l, e, n), Ua(l, e, n)), (e = { cache: Gc() }), (t.payload = e));
          return;
      }
      e = e.return;
    }
  }
  function Uv(t, e, n) {
    var l = Se();
    ((n = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
      eu(t) ? cd(e, n) : ((n = zc(t, e, n, l)), n !== null && (fe(n, t, l), od(n, e, l))));
  }
  function ud(t, e, n) {
    var l = Se();
    Va(t, e, n, l);
  }
  function Va(t, e, n, l) {
    var i = {
      lane: l,
      revertLane: 0,
      gesture: null,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    };
    if (eu(t)) cd(e, i);
    else {
      var c = t.alternate;
      if (
        t.lanes === 0 &&
        (c === null || c.lanes === 0) &&
        ((c = e.lastRenderedReducer), c !== null)
      )
        try {
          var f = e.lastRenderedState,
            y = c(f, n);
          if (((i.hasEagerState = !0), (i.eagerState = y), pe(y, f)))
            return (Ui(t, e, i, 0), zt === null && Di(), !1);
        } catch {
        } finally {
        }
      if (((n = zc(t, e, i, l)), n !== null)) return (fe(n, t, l), od(n, e, l), !0);
    }
    return !1;
  }
  function po(t, e, n, l) {
    if (
      ((l = {
        lane: 2,
        revertLane: Jo(),
        gesture: null,
        action: l,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      eu(t))
    ) {
      if (e) throw Error(o(479));
    } else ((e = zc(t, n, l, 2)), e !== null && fe(e, t, 2));
  }
  function eu(t) {
    var e = t.alternate;
    return t === ut || (e !== null && e === ut);
  }
  function cd(t, e) {
    Ql = $i = !0;
    var n = t.pending;
    (n === null ? (e.next = e) : ((e.next = n.next), (n.next = e)), (t.pending = e));
  }
  function od(t, e, n) {
    if ((n & 4194048) !== 0) {
      var l = e.lanes;
      ((l &= t.pendingLanes), (n |= l), (e.lanes = n), ds(t, n));
    }
  }
  var Ya = {
    readContext: It,
    use: Fi,
    useCallback: Bt,
    useContext: Bt,
    useEffect: Bt,
    useImperativeHandle: Bt,
    useLayoutEffect: Bt,
    useInsertionEffect: Bt,
    useMemo: Bt,
    useReducer: Bt,
    useRef: Bt,
    useState: Bt,
    useDebugValue: Bt,
    useDeferredValue: Bt,
    useTransition: Bt,
    useSyncExternalStore: Bt,
    useId: Bt,
    useHostTransitionStatus: Bt,
    useFormState: Bt,
    useActionState: Bt,
    useOptimistic: Bt,
    useMemoCache: Bt,
    useCacheRefresh: Bt,
  };
  Ya.useEffectEvent = Bt;
  var rd = {
      readContext: It,
      use: Fi,
      useCallback: function (t, e) {
        return ((ae().memoizedState = [t, e === void 0 ? null : e]), t);
      },
      useContext: It,
      useEffect: Kf,
      useImperativeHandle: function (t, e, n) {
        ((n = n != null ? n.concat([t]) : null), Ii(4194308, 4, Wf.bind(null, e, t), n));
      },
      useLayoutEffect: function (t, e) {
        return Ii(4194308, 4, t, e);
      },
      useInsertionEffect: function (t, e) {
        Ii(4, 2, t, e);
      },
      useMemo: function (t, e) {
        var n = ae();
        e = e === void 0 ? null : e;
        var l = t();
        if (pl) {
          En(!0);
          try {
            t();
          } finally {
            En(!1);
          }
        }
        return ((n.memoizedState = [l, e]), l);
      },
      useReducer: function (t, e, n) {
        var l = ae();
        if (n !== void 0) {
          var i = n(e);
          if (pl) {
            En(!0);
            try {
              n(e);
            } finally {
              En(!1);
            }
          }
        } else i = e;
        return (
          (l.memoizedState = l.baseState = i),
          (t = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: t,
            lastRenderedState: i,
          }),
          (l.queue = t),
          (t = t.dispatch = Uv.bind(null, ut, t)),
          [l.memoizedState, t]
        );
      },
      useRef: function (t) {
        var e = ae();
        return ((t = { current: t }), (e.memoizedState = t));
      },
      useState: function (t) {
        t = co(t);
        var e = t.queue,
          n = ud.bind(null, ut, e);
        return ((e.dispatch = n), [t.memoizedState, n]);
      },
      useDebugValue: so,
      useDeferredValue: function (t, e) {
        var n = ae();
        return fo(n, t, e);
      },
      useTransition: function () {
        var t = co(!1);
        return ((t = ed.bind(null, ut, t.queue, !0, !1)), (ae().memoizedState = t), [!1, t]);
      },
      useSyncExternalStore: function (t, e, n) {
        var l = ut,
          i = ae();
        if (gt) {
          if (n === void 0) throw Error(o(407));
          n = n();
        } else {
          if (((n = e()), zt === null)) throw Error(o(349));
          (yt & 127) !== 0 || Rf(l, e, n);
        }
        i.memoizedState = n;
        var c = { value: n, getSnapshot: e };
        return (
          (i.queue = c),
          Kf(jf.bind(null, l, c, t), [t]),
          (l.flags |= 2048),
          Kl(9, { destroy: void 0 }, zf.bind(null, l, c, n, e), null),
          n
        );
      },
      useId: function () {
        var t = ae(),
          e = zt.identifierPrefix;
        if (gt) {
          var n = Xe,
            l = Ge;
          ((n = (l & ~(1 << (32 - he(l) - 1))).toString(32) + n),
            (e = "_" + e + "R_" + n),
            (n = ki++),
            0 < n && (e += "H" + n.toString(32)),
            (e += "_"));
        } else ((n = wv++), (e = "_" + e + "r_" + n.toString(32) + "_"));
        return (t.memoizedState = e);
      },
      useHostTransitionStatus: ho,
      useFormState: Yf,
      useActionState: Yf,
      useOptimistic: function (t) {
        var e = ae();
        e.memoizedState = e.baseState = t;
        var n = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: null,
          lastRenderedState: null,
        };
        return ((e.queue = n), (e = po.bind(null, ut, !0, n)), (n.dispatch = e), [t, e]);
      },
      useMemoCache: ao,
      useCacheRefresh: function () {
        return (ae().memoizedState = Dv.bind(null, ut));
      },
      useEffectEvent: function (t) {
        var e = ae(),
          n = { impl: t };
        return (
          (e.memoizedState = n),
          function () {
            if ((Tt & 2) !== 0) throw Error(o(440));
            return n.impl.apply(void 0, arguments);
          }
        );
      },
    },
    yo = {
      readContext: It,
      use: Fi,
      useCallback: Pf,
      useContext: It,
      useEffect: ro,
      useImperativeHandle: Ff,
      useInsertionEffect: $f,
      useLayoutEffect: kf,
      useMemo: If,
      useReducer: Pi,
      useRef: Zf,
      useState: function () {
        return Pi(un);
      },
      useDebugValue: so,
      useDeferredValue: function (t, e) {
        var n = Vt();
        return td(n, wt.memoizedState, t, e);
      },
      useTransition: function () {
        var t = Pi(un)[0],
          e = Vt().memoizedState;
        return [typeof t == "boolean" ? t : qa(t), e];
      },
      useSyncExternalStore: _f,
      useId: ad,
      useHostTransitionStatus: ho,
      useFormState: Gf,
      useActionState: Gf,
      useOptimistic: function (t, e) {
        var n = Vt();
        return Uf(n, wt, t, e);
      },
      useMemoCache: ao,
      useCacheRefresh: id,
    };
  yo.useEffectEvent = Jf;
  var sd = {
    readContext: It,
    use: Fi,
    useCallback: Pf,
    useContext: It,
    useEffect: ro,
    useImperativeHandle: Ff,
    useInsertionEffect: $f,
    useLayoutEffect: kf,
    useMemo: If,
    useReducer: uo,
    useRef: Zf,
    useState: function () {
      return uo(un);
    },
    useDebugValue: so,
    useDeferredValue: function (t, e) {
      var n = Vt();
      return wt === null ? fo(n, t, e) : td(n, wt.memoizedState, t, e);
    },
    useTransition: function () {
      var t = uo(un)[0],
        e = Vt().memoizedState;
      return [typeof t == "boolean" ? t : qa(t), e];
    },
    useSyncExternalStore: _f,
    useId: ad,
    useHostTransitionStatus: ho,
    useFormState: Qf,
    useActionState: Qf,
    useOptimistic: function (t, e) {
      var n = Vt();
      return wt !== null ? Uf(n, wt, t, e) : ((n.baseState = t), [t, n.queue.dispatch]);
    },
    useMemoCache: ao,
    useCacheRefresh: id,
  };
  sd.useEffectEvent = Jf;
  function vo(t, e, n, l) {
    ((e = t.memoizedState),
      (n = n(l, e)),
      (n = n == null ? e : x({}, e, n)),
      (t.memoizedState = n),
      t.lanes === 0 && (t.updateQueue.baseState = n));
  }
  var go = {
    enqueueSetState: function (t, e, n) {
      t = t._reactInternals;
      var l = Se(),
        i = Rn(l);
      ((i.payload = e),
        n != null && (i.callback = n),
        (e = zn(t, i, l)),
        e !== null && (fe(e, t, l), Ua(e, t, l)));
    },
    enqueueReplaceState: function (t, e, n) {
      t = t._reactInternals;
      var l = Se(),
        i = Rn(l);
      ((i.tag = 1),
        (i.payload = e),
        n != null && (i.callback = n),
        (e = zn(t, i, l)),
        e !== null && (fe(e, t, l), Ua(e, t, l)));
    },
    enqueueForceUpdate: function (t, e) {
      t = t._reactInternals;
      var n = Se(),
        l = Rn(n);
      ((l.tag = 2),
        e != null && (l.callback = e),
        (e = zn(t, l, n)),
        e !== null && (fe(e, t, n), Ua(e, t, n)));
    },
  };
  function fd(t, e, n, l, i, c, f) {
    return (
      (t = t.stateNode),
      typeof t.shouldComponentUpdate == "function"
        ? t.shouldComponentUpdate(l, c, f)
        : e.prototype && e.prototype.isPureReactComponent
          ? !Oa(n, l) || !Oa(i, c)
          : !0
    );
  }
  function dd(t, e, n, l) {
    ((t = e.state),
      typeof e.componentWillReceiveProps == "function" && e.componentWillReceiveProps(n, l),
      typeof e.UNSAFE_componentWillReceiveProps == "function" &&
        e.UNSAFE_componentWillReceiveProps(n, l),
      e.state !== t && go.enqueueReplaceState(e, e.state, null));
  }
  function yl(t, e) {
    var n = e;
    if ("ref" in e) {
      n = {};
      for (var l in e) l !== "ref" && (n[l] = e[l]);
    }
    if ((t = t.defaultProps)) {
      n === e && (n = x({}, n));
      for (var i in t) n[i] === void 0 && (n[i] = t[i]);
    }
    return n;
  }
  function md(t) {
    Mi(t);
  }
  function hd(t) {
    console.error(t);
  }
  function pd(t) {
    Mi(t);
  }
  function nu(t, e) {
    try {
      var n = t.onUncaughtError;
      n(e.value, { componentStack: e.stack });
    } catch (l) {
      setTimeout(function () {
        throw l;
      });
    }
  }
  function yd(t, e, n) {
    try {
      var l = t.onCaughtError;
      l(n.value, { componentStack: n.stack, errorBoundary: e.tag === 1 ? e.stateNode : null });
    } catch (i) {
      setTimeout(function () {
        throw i;
      });
    }
  }
  function bo(t, e, n) {
    return (
      (n = Rn(n)),
      (n.tag = 3),
      (n.payload = { element: null }),
      (n.callback = function () {
        nu(t, e);
      }),
      n
    );
  }
  function vd(t) {
    return ((t = Rn(t)), (t.tag = 3), t);
  }
  function gd(t, e, n, l) {
    var i = n.type.getDerivedStateFromError;
    if (typeof i == "function") {
      var c = l.value;
      ((t.payload = function () {
        return i(c);
      }),
        (t.callback = function () {
          yd(e, n, l);
        }));
    }
    var f = n.stateNode;
    f !== null &&
      typeof f.componentDidCatch == "function" &&
      (t.callback = function () {
        (yd(e, n, l),
          typeof i != "function" && (Bn === null ? (Bn = new Set([this])) : Bn.add(this)));
        var y = l.stack;
        this.componentDidCatch(l.value, { componentStack: y !== null ? y : "" });
      });
  }
  function Hv(t, e, n, l, i) {
    if (((n.flags |= 32768), l !== null && typeof l == "object" && typeof l.then == "function")) {
      if (((e = n.alternate), e !== null && Ll(e, n, i, !0), (n = ve.current), n !== null)) {
        switch (n.tag) {
          case 31:
          case 13:
            return (
              ze === null ? hu() : n.alternate === null && Lt === 0 && (Lt = 3),
              (n.flags &= -257),
              (n.flags |= 65536),
              (n.lanes = i),
              l === Xi
                ? (n.flags |= 16384)
                : ((e = n.updateQueue),
                  e === null ? (n.updateQueue = new Set([l])) : e.add(l),
                  Qo(t, l, i)),
              !1
            );
          case 22:
            return (
              (n.flags |= 65536),
              l === Xi
                ? (n.flags |= 16384)
                : ((e = n.updateQueue),
                  e === null
                    ? ((e = { transitions: null, markerInstances: null, retryQueue: new Set([l]) }),
                      (n.updateQueue = e))
                    : ((n = e.retryQueue), n === null ? (e.retryQueue = new Set([l])) : n.add(l)),
                  Qo(t, l, i)),
              !1
            );
        }
        throw Error(o(435, n.tag));
      }
      return (Qo(t, l, i), hu(), !1);
    }
    if (gt)
      return (
        (e = ve.current),
        e !== null
          ? ((e.flags & 65536) === 0 && (e.flags |= 256),
            (e.flags |= 65536),
            (e.lanes = i),
            l !== Bc && ((t = Error(o(422), { cause: l })), Ra(Oe(t, n))))
          : (l !== Bc && ((e = Error(o(423), { cause: l })), Ra(Oe(e, n))),
            (t = t.current.alternate),
            (t.flags |= 65536),
            (i &= -i),
            (t.lanes |= i),
            (l = Oe(l, n)),
            (i = bo(t.stateNode, l, i)),
            $c(t, i),
            Lt !== 4 && (Lt = 2)),
        !1
      );
    var c = Error(o(520), { cause: l });
    if (((c = Oe(c, n)), ka === null ? (ka = [c]) : ka.push(c), Lt !== 4 && (Lt = 2), e === null))
      return !0;
    ((l = Oe(l, n)), (n = e));
    do {
      switch (n.tag) {
        case 3:
          return (
            (n.flags |= 65536),
            (t = i & -i),
            (n.lanes |= t),
            (t = bo(n.stateNode, l, t)),
            $c(n, t),
            !1
          );
        case 1:
          if (
            ((e = n.type),
            (c = n.stateNode),
            (n.flags & 128) === 0 &&
              (typeof e.getDerivedStateFromError == "function" ||
                (c !== null &&
                  typeof c.componentDidCatch == "function" &&
                  (Bn === null || !Bn.has(c)))))
          )
            return (
              (n.flags |= 65536),
              (i &= -i),
              (n.lanes |= i),
              (i = vd(i)),
              gd(i, t, n, l),
              $c(n, i),
              !1
            );
      }
      n = n.return;
    } while (n !== null);
    return !1;
  }
  var xo = Error(o(461)),
    Xt = !1;
  function te(t, e, n, l) {
    e.child = t === null ? Ef(e, null, n, l) : hl(e, t.child, n, l);
  }
  function bd(t, e, n, l, i) {
    n = n.render;
    var c = e.ref;
    if ("ref" in l) {
      var f = {};
      for (var y in l) y !== "ref" && (f[y] = l[y]);
    } else f = l;
    return (
      sl(e),
      (l = to(t, e, n, f, c, i)),
      (y = eo()),
      t !== null && !Xt
        ? (no(t, e, i), cn(t, e, i))
        : (gt && y && Uc(e), (e.flags |= 1), te(t, e, l, i), e.child)
    );
  }
  function xd(t, e, n, l, i) {
    if (t === null) {
      var c = n.type;
      return typeof c == "function" && !jc(c) && c.defaultProps === void 0 && n.compare === null
        ? ((e.tag = 15), (e.type = c), Sd(t, e, c, l, i))
        : ((t = Bi(n.type, null, l, e, e.mode, i)), (t.ref = e.ref), (t.return = e), (e.child = t));
    }
    if (((c = t.child), !wo(t, i))) {
      var f = c.memoizedProps;
      if (((n = n.compare), (n = n !== null ? n : Oa), n(f, l) && t.ref === e.ref))
        return cn(t, e, i);
    }
    return ((e.flags |= 1), (t = tn(c, l)), (t.ref = e.ref), (t.return = e), (e.child = t));
  }
  function Sd(t, e, n, l, i) {
    if (t !== null) {
      var c = t.memoizedProps;
      if (Oa(c, l) && t.ref === e.ref)
        if (((Xt = !1), (e.pendingProps = l = c), wo(t, i))) (t.flags & 131072) !== 0 && (Xt = !0);
        else return ((e.lanes = t.lanes), cn(t, e, i));
    }
    return So(t, e, n, l, i);
  }
  function Ed(t, e, n, l) {
    var i = l.children,
      c = t !== null ? t.memoizedState : null;
    if (
      (t === null &&
        e.stateNode === null &&
        (e.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null,
        }),
      l.mode === "hidden")
    ) {
      if ((e.flags & 128) !== 0) {
        if (((c = c !== null ? c.baseLanes | n : n), t !== null)) {
          for (l = e.child = t.child, i = 0; l !== null; )
            ((i = i | l.lanes | l.childLanes), (l = l.sibling));
          l = i & ~c;
        } else ((l = 0), (e.child = null));
        return Ad(t, e, c, n, l);
      }
      if ((n & 536870912) !== 0)
        ((e.memoizedState = { baseLanes: 0, cachePool: null }),
          t !== null && Yi(e, c !== null ? c.cachePool : null),
          c !== null ? Cf(e, c) : Wc(),
          Nf(e));
      else return ((l = e.lanes = 536870912), Ad(t, e, c !== null ? c.baseLanes | n : n, n, l));
    } else
      c !== null
        ? (Yi(e, c.cachePool), Cf(e, c), Mn(), (e.memoizedState = null))
        : (t !== null && Yi(e, null), Wc(), Mn());
    return (te(t, e, i, n), e.child);
  }
  function Ga(t, e) {
    return (
      (t !== null && t.tag === 22) ||
        e.stateNode !== null ||
        (e.stateNode = {
          _visibility: 1,
          _pendingMarkers: null,
          _retryCache: null,
          _transitions: null,
        }),
      e.sibling
    );
  }
  function Ad(t, e, n, l, i) {
    var c = Qc();
    return (
      (c = c === null ? null : { parent: Yt._currentValue, pool: c }),
      (e.memoizedState = { baseLanes: n, cachePool: c }),
      t !== null && Yi(e, null),
      Wc(),
      Nf(e),
      t !== null && Ll(t, e, l, !0),
      (e.childLanes = i),
      null
    );
  }
  function lu(t, e) {
    return (
      (e = iu({ mode: e.mode, children: e.children }, t.mode)),
      (e.ref = t.ref),
      (t.child = e),
      (e.return = t),
      e
    );
  }
  function Td(t, e, n) {
    return (
      hl(e, t.child, null, n),
      (t = lu(e, e.pendingProps)),
      (t.flags |= 2),
      ge(e),
      (e.memoizedState = null),
      t
    );
  }
  function Bv(t, e, n) {
    var l = e.pendingProps,
      i = (e.flags & 128) !== 0;
    if (((e.flags &= -129), t === null)) {
      if (gt) {
        if (l.mode === "hidden") return ((t = lu(e, l)), (e.lanes = 536870912), Ga(null, t));
        if (
          (Pc(e),
          (t = jt)
            ? ((t = Hm(t, Re)),
              (t = t !== null && t.data === "&" ? t : null),
              t !== null &&
                ((e.memoizedState = {
                  dehydrated: t,
                  treeContext: Cn !== null ? { id: Ge, overflow: Xe } : null,
                  retryLane: 536870912,
                  hydrationErrors: null,
                }),
                (n = cf(t)),
                (n.return = e),
                (e.child = n),
                (Pt = e),
                (jt = null)))
            : (t = null),
          t === null)
        )
          throw On(e);
        return ((e.lanes = 536870912), null);
      }
      return lu(e, l);
    }
    var c = t.memoizedState;
    if (c !== null) {
      var f = c.dehydrated;
      if ((Pc(e), i))
        if (e.flags & 256) ((e.flags &= -257), (e = Td(t, e, n)));
        else if (e.memoizedState !== null) ((e.child = t.child), (e.flags |= 128), (e = null));
        else throw Error(o(558));
      else if ((Xt || Ll(t, e, n, !1), (i = (n & t.childLanes) !== 0), Xt || i)) {
        if (((l = zt), l !== null && ((f = ms(l, n)), f !== 0 && f !== c.retryLane)))
          throw ((c.retryLane = f), ul(t, f), fe(l, t, f), xo);
        (hu(), (e = Td(t, e, n)));
      } else
        ((t = c.treeContext),
          (jt = je(f.nextSibling)),
          (Pt = e),
          (gt = !0),
          (Nn = null),
          (Re = !1),
          t !== null && sf(e, t),
          (e = lu(e, l)),
          (e.flags |= 4096));
      return e;
    }
    return (
      (t = tn(t.child, { mode: l.mode, children: l.children })),
      (t.ref = e.ref),
      (e.child = t),
      (t.return = e),
      t
    );
  }
  function au(t, e) {
    var n = e.ref;
    if (n === null) t !== null && t.ref !== null && (e.flags |= 4194816);
    else {
      if (typeof n != "function" && typeof n != "object") throw Error(o(284));
      (t === null || t.ref !== n) && (e.flags |= 4194816);
    }
  }
  function So(t, e, n, l, i) {
    return (
      sl(e),
      (n = to(t, e, n, l, void 0, i)),
      (l = eo()),
      t !== null && !Xt
        ? (no(t, e, i), cn(t, e, i))
        : (gt && l && Uc(e), (e.flags |= 1), te(t, e, n, i), e.child)
    );
  }
  function Cd(t, e, n, l, i, c) {
    return (
      sl(e),
      (e.updateQueue = null),
      (n = wf(e, l, n, i)),
      Of(t),
      (l = eo()),
      t !== null && !Xt
        ? (no(t, e, c), cn(t, e, c))
        : (gt && l && Uc(e), (e.flags |= 1), te(t, e, n, c), e.child)
    );
  }
  function Nd(t, e, n, l, i) {
    if ((sl(e), e.stateNode === null)) {
      var c = Dl,
        f = n.contextType;
      (typeof f == "object" && f !== null && (c = It(f)),
        (c = new n(l, c)),
        (e.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null),
        (c.updater = go),
        (e.stateNode = c),
        (c._reactInternals = e),
        (c = e.stateNode),
        (c.props = l),
        (c.state = e.memoizedState),
        (c.refs = {}),
        Kc(e),
        (f = n.contextType),
        (c.context = typeof f == "object" && f !== null ? It(f) : Dl),
        (c.state = e.memoizedState),
        (f = n.getDerivedStateFromProps),
        typeof f == "function" && (vo(e, n, f, l), (c.state = e.memoizedState)),
        typeof n.getDerivedStateFromProps == "function" ||
          typeof c.getSnapshotBeforeUpdate == "function" ||
          (typeof c.UNSAFE_componentWillMount != "function" &&
            typeof c.componentWillMount != "function") ||
          ((f = c.state),
          typeof c.componentWillMount == "function" && c.componentWillMount(),
          typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(),
          f !== c.state && go.enqueueReplaceState(c, c.state, null),
          Ba(e, l, c, i),
          Ha(),
          (c.state = e.memoizedState)),
        typeof c.componentDidMount == "function" && (e.flags |= 4194308),
        (l = !0));
    } else if (t === null) {
      c = e.stateNode;
      var y = e.memoizedProps,
        E = yl(n, y);
      c.props = E;
      var w = c.context,
        H = n.contextType;
      ((f = Dl), typeof H == "object" && H !== null && (f = It(H)));
      var L = n.getDerivedStateFromProps;
      ((H = typeof L == "function" || typeof c.getSnapshotBeforeUpdate == "function"),
        (y = e.pendingProps !== y),
        H ||
          (typeof c.UNSAFE_componentWillReceiveProps != "function" &&
            typeof c.componentWillReceiveProps != "function") ||
          ((y || w !== f) && dd(e, c, l, f)),
        (_n = !1));
      var R = e.memoizedState;
      ((c.state = R),
        Ba(e, l, c, i),
        Ha(),
        (w = e.memoizedState),
        y || R !== w || _n
          ? (typeof L == "function" && (vo(e, n, L, l), (w = e.memoizedState)),
            (E = _n || fd(e, n, E, l, R, w, f))
              ? (H ||
                  (typeof c.UNSAFE_componentWillMount != "function" &&
                    typeof c.componentWillMount != "function") ||
                  (typeof c.componentWillMount == "function" && c.componentWillMount(),
                  typeof c.UNSAFE_componentWillMount == "function" &&
                    c.UNSAFE_componentWillMount()),
                typeof c.componentDidMount == "function" && (e.flags |= 4194308))
              : (typeof c.componentDidMount == "function" && (e.flags |= 4194308),
                (e.memoizedProps = l),
                (e.memoizedState = w)),
            (c.props = l),
            (c.state = w),
            (c.context = f),
            (l = E))
          : (typeof c.componentDidMount == "function" && (e.flags |= 4194308), (l = !1)));
    } else {
      ((c = e.stateNode),
        Jc(t, e),
        (f = e.memoizedProps),
        (H = yl(n, f)),
        (c.props = H),
        (L = e.pendingProps),
        (R = c.context),
        (w = n.contextType),
        (E = Dl),
        typeof w == "object" && w !== null && (E = It(w)),
        (y = n.getDerivedStateFromProps),
        (w = typeof y == "function" || typeof c.getSnapshotBeforeUpdate == "function") ||
          (typeof c.UNSAFE_componentWillReceiveProps != "function" &&
            typeof c.componentWillReceiveProps != "function") ||
          ((f !== L || R !== E) && dd(e, c, l, E)),
        (_n = !1),
        (R = e.memoizedState),
        (c.state = R),
        Ba(e, l, c, i),
        Ha());
      var j = e.memoizedState;
      f !== L || R !== j || _n || (t !== null && t.dependencies !== null && qi(t.dependencies))
        ? (typeof y == "function" && (vo(e, n, y, l), (j = e.memoizedState)),
          (H =
            _n ||
            fd(e, n, H, l, R, j, E) ||
            (t !== null && t.dependencies !== null && qi(t.dependencies)))
            ? (w ||
                (typeof c.UNSAFE_componentWillUpdate != "function" &&
                  typeof c.componentWillUpdate != "function") ||
                (typeof c.componentWillUpdate == "function" && c.componentWillUpdate(l, j, E),
                typeof c.UNSAFE_componentWillUpdate == "function" &&
                  c.UNSAFE_componentWillUpdate(l, j, E)),
              typeof c.componentDidUpdate == "function" && (e.flags |= 4),
              typeof c.getSnapshotBeforeUpdate == "function" && (e.flags |= 1024))
            : (typeof c.componentDidUpdate != "function" ||
                (f === t.memoizedProps && R === t.memoizedState) ||
                (e.flags |= 4),
              typeof c.getSnapshotBeforeUpdate != "function" ||
                (f === t.memoizedProps && R === t.memoizedState) ||
                (e.flags |= 1024),
              (e.memoizedProps = l),
              (e.memoizedState = j)),
          (c.props = l),
          (c.state = j),
          (c.context = E),
          (l = H))
        : (typeof c.componentDidUpdate != "function" ||
            (f === t.memoizedProps && R === t.memoizedState) ||
            (e.flags |= 4),
          typeof c.getSnapshotBeforeUpdate != "function" ||
            (f === t.memoizedProps && R === t.memoizedState) ||
            (e.flags |= 1024),
          (l = !1));
    }
    return (
      (c = l),
      au(t, e),
      (l = (e.flags & 128) !== 0),
      c || l
        ? ((c = e.stateNode),
          (n = l && typeof n.getDerivedStateFromError != "function" ? null : c.render()),
          (e.flags |= 1),
          t !== null && l
            ? ((e.child = hl(e, t.child, null, i)), (e.child = hl(e, null, n, i)))
            : te(t, e, n, i),
          (e.memoizedState = c.state),
          (t = e.child))
        : (t = cn(t, e, i)),
      t
    );
  }
  function Od(t, e, n, l) {
    return (ol(), (e.flags |= 256), te(t, e, n, l), e.child);
  }
  var Eo = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
  function Ao(t) {
    return { baseLanes: t, cachePool: yf() };
  }
  function To(t, e, n) {
    return ((t = t !== null ? t.childLanes & ~n : 0), e && (t |= xe), t);
  }
  function wd(t, e, n) {
    var l = e.pendingProps,
      i = !1,
      c = (e.flags & 128) !== 0,
      f;
    if (
      ((f = c) || (f = t !== null && t.memoizedState === null ? !1 : (qt.current & 2) !== 0),
      f && ((i = !0), (e.flags &= -129)),
      (f = (e.flags & 32) !== 0),
      (e.flags &= -33),
      t === null)
    ) {
      if (gt) {
        if (
          (i ? jn(e) : Mn(),
          (t = jt)
            ? ((t = Hm(t, Re)),
              (t = t !== null && t.data !== "&" ? t : null),
              t !== null &&
                ((e.memoizedState = {
                  dehydrated: t,
                  treeContext: Cn !== null ? { id: Ge, overflow: Xe } : null,
                  retryLane: 536870912,
                  hydrationErrors: null,
                }),
                (n = cf(t)),
                (n.return = e),
                (e.child = n),
                (Pt = e),
                (jt = null)))
            : (t = null),
          t === null)
        )
          throw On(e);
        return (ur(t) ? (e.lanes = 32) : (e.lanes = 536870912), null);
      }
      var y = l.children;
      return (
        (l = l.fallback),
        i
          ? (Mn(),
            (i = e.mode),
            (y = iu({ mode: "hidden", children: y }, i)),
            (l = cl(l, i, n, null)),
            (y.return = e),
            (l.return = e),
            (y.sibling = l),
            (e.child = y),
            (l = e.child),
            (l.memoizedState = Ao(n)),
            (l.childLanes = To(t, f, n)),
            (e.memoizedState = Eo),
            Ga(null, l))
          : (jn(e), Co(e, y))
      );
    }
    var E = t.memoizedState;
    if (E !== null && ((y = E.dehydrated), y !== null)) {
      if (c)
        e.flags & 256
          ? (jn(e), (e.flags &= -257), (e = No(t, e, n)))
          : e.memoizedState !== null
            ? (Mn(), (e.child = t.child), (e.flags |= 128), (e = null))
            : (Mn(),
              (y = l.fallback),
              (i = e.mode),
              (l = iu({ mode: "visible", children: l.children }, i)),
              (y = cl(y, i, n, null)),
              (y.flags |= 2),
              (l.return = e),
              (y.return = e),
              (l.sibling = y),
              (e.child = l),
              hl(e, t.child, null, n),
              (l = e.child),
              (l.memoizedState = Ao(n)),
              (l.childLanes = To(t, f, n)),
              (e.memoizedState = Eo),
              (e = Ga(null, l)));
      else if ((jn(e), ur(y))) {
        if (((f = y.nextSibling && y.nextSibling.dataset), f)) var w = f.dgst;
        ((f = w),
          (l = Error(o(419))),
          (l.stack = ""),
          (l.digest = f),
          Ra({ value: l, source: null, stack: null }),
          (e = No(t, e, n)));
      } else if ((Xt || Ll(t, e, n, !1), (f = (n & t.childLanes) !== 0), Xt || f)) {
        if (((f = zt), f !== null && ((l = ms(f, n)), l !== 0 && l !== E.retryLane)))
          throw ((E.retryLane = l), ul(t, l), fe(f, t, l), xo);
        (ir(y) || hu(), (e = No(t, e, n)));
      } else
        ir(y)
          ? ((e.flags |= 192), (e.child = t.child), (e = null))
          : ((t = E.treeContext),
            (jt = je(y.nextSibling)),
            (Pt = e),
            (gt = !0),
            (Nn = null),
            (Re = !1),
            t !== null && sf(e, t),
            (e = Co(e, l.children)),
            (e.flags |= 4096));
      return e;
    }
    return i
      ? (Mn(),
        (y = l.fallback),
        (i = e.mode),
        (E = t.child),
        (w = E.sibling),
        (l = tn(E, { mode: "hidden", children: l.children })),
        (l.subtreeFlags = E.subtreeFlags & 65011712),
        w !== null ? (y = tn(w, y)) : ((y = cl(y, i, n, null)), (y.flags |= 2)),
        (y.return = e),
        (l.return = e),
        (l.sibling = y),
        (e.child = l),
        Ga(null, l),
        (l = e.child),
        (y = t.child.memoizedState),
        y === null
          ? (y = Ao(n))
          : ((i = y.cachePool),
            i !== null
              ? ((E = Yt._currentValue), (i = i.parent !== E ? { parent: E, pool: E } : i))
              : (i = yf()),
            (y = { baseLanes: y.baseLanes | n, cachePool: i })),
        (l.memoizedState = y),
        (l.childLanes = To(t, f, n)),
        (e.memoizedState = Eo),
        Ga(t.child, l))
      : (jn(e),
        (n = t.child),
        (t = n.sibling),
        (n = tn(n, { mode: "visible", children: l.children })),
        (n.return = e),
        (n.sibling = null),
        t !== null &&
          ((f = e.deletions), f === null ? ((e.deletions = [t]), (e.flags |= 16)) : f.push(t)),
        (e.child = n),
        (e.memoizedState = null),
        n);
  }
  function Co(t, e) {
    return ((e = iu({ mode: "visible", children: e }, t.mode)), (e.return = t), (t.child = e));
  }
  function iu(t, e) {
    return ((t = ye(22, t, null, e)), (t.lanes = 0), t);
  }
  function No(t, e, n) {
    return (
      hl(e, t.child, null, n),
      (t = Co(e, e.pendingProps.children)),
      (t.flags |= 2),
      (e.memoizedState = null),
      t
    );
  }
  function _d(t, e, n) {
    t.lanes |= e;
    var l = t.alternate;
    (l !== null && (l.lanes |= e), Vc(t.return, e, n));
  }
  function Oo(t, e, n, l, i, c) {
    var f = t.memoizedState;
    f === null
      ? (t.memoizedState = {
          isBackwards: e,
          rendering: null,
          renderingStartTime: 0,
          last: l,
          tail: n,
          tailMode: i,
          treeForkCount: c,
        })
      : ((f.isBackwards = e),
        (f.rendering = null),
        (f.renderingStartTime = 0),
        (f.last = l),
        (f.tail = n),
        (f.tailMode = i),
        (f.treeForkCount = c));
  }
  function Rd(t, e, n) {
    var l = e.pendingProps,
      i = l.revealOrder,
      c = l.tail;
    l = l.children;
    var f = qt.current,
      y = (f & 2) !== 0;
    if (
      (y ? ((f = (f & 1) | 2), (e.flags |= 128)) : (f &= 1),
      J(qt, f),
      te(t, e, l, n),
      (l = gt ? _a : 0),
      !y && t !== null && (t.flags & 128) !== 0)
    )
      t: for (t = e.child; t !== null; ) {
        if (t.tag === 13) t.memoizedState !== null && _d(t, n, e);
        else if (t.tag === 19) _d(t, n, e);
        else if (t.child !== null) {
          ((t.child.return = t), (t = t.child));
          continue;
        }
        if (t === e) break t;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) break t;
          t = t.return;
        }
        ((t.sibling.return = t.return), (t = t.sibling));
      }
    switch (i) {
      case "forwards":
        for (n = e.child, i = null; n !== null; )
          ((t = n.alternate), t !== null && Ji(t) === null && (i = n), (n = n.sibling));
        ((n = i),
          n === null ? ((i = e.child), (e.child = null)) : ((i = n.sibling), (n.sibling = null)),
          Oo(e, !1, i, n, c, l));
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (n = null, i = e.child, e.child = null; i !== null; ) {
          if (((t = i.alternate), t !== null && Ji(t) === null)) {
            e.child = i;
            break;
          }
          ((t = i.sibling), (i.sibling = n), (n = i), (i = t));
        }
        Oo(e, !0, n, null, c, l);
        break;
      case "together":
        Oo(e, !1, null, null, void 0, l);
        break;
      default:
        e.memoizedState = null;
    }
    return e.child;
  }
  function cn(t, e, n) {
    if (
      (t !== null && (e.dependencies = t.dependencies), (Hn |= e.lanes), (n & e.childLanes) === 0)
    )
      if (t !== null) {
        if ((Ll(t, e, n, !1), (n & e.childLanes) === 0)) return null;
      } else return null;
    if (t !== null && e.child !== t.child) throw Error(o(153));
    if (e.child !== null) {
      for (t = e.child, n = tn(t, t.pendingProps), e.child = n, n.return = e; t.sibling !== null; )
        ((t = t.sibling), (n = n.sibling = tn(t, t.pendingProps)), (n.return = e));
      n.sibling = null;
    }
    return e.child;
  }
  function wo(t, e) {
    return (t.lanes & e) !== 0 ? !0 : ((t = t.dependencies), !!(t !== null && qi(t)));
  }
  function Lv(t, e, n) {
    switch (e.tag) {
      case 3:
        (Kt(e, e.stateNode.containerInfo), wn(e, Yt, t.memoizedState.cache), ol());
        break;
      case 27:
      case 5:
        Pn(e);
        break;
      case 4:
        Kt(e, e.stateNode.containerInfo);
        break;
      case 10:
        wn(e, e.type, e.memoizedProps.value);
        break;
      case 31:
        if (e.memoizedState !== null) return ((e.flags |= 128), Pc(e), null);
        break;
      case 13:
        var l = e.memoizedState;
        if (l !== null)
          return l.dehydrated !== null
            ? (jn(e), (e.flags |= 128), null)
            : (n & e.child.childLanes) !== 0
              ? wd(t, e, n)
              : (jn(e), (t = cn(t, e, n)), t !== null ? t.sibling : null);
        jn(e);
        break;
      case 19:
        var i = (t.flags & 128) !== 0;
        if (
          ((l = (n & e.childLanes) !== 0),
          l || (Ll(t, e, n, !1), (l = (n & e.childLanes) !== 0)),
          i)
        ) {
          if (l) return Rd(t, e, n);
          e.flags |= 128;
        }
        if (
          ((i = e.memoizedState),
          i !== null && ((i.rendering = null), (i.tail = null), (i.lastEffect = null)),
          J(qt, qt.current),
          l)
        )
          break;
        return null;
      case 22:
        return ((e.lanes = 0), Ed(t, e, n, e.pendingProps));
      case 24:
        wn(e, Yt, t.memoizedState.cache);
    }
    return cn(t, e, n);
  }
  function zd(t, e, n) {
    if (t !== null)
      if (t.memoizedProps !== e.pendingProps) Xt = !0;
      else {
        if (!wo(t, n) && (e.flags & 128) === 0) return ((Xt = !1), Lv(t, e, n));
        Xt = (t.flags & 131072) !== 0;
      }
    else ((Xt = !1), gt && (e.flags & 1048576) !== 0 && rf(e, _a, e.index));
    switch (((e.lanes = 0), e.tag)) {
      case 16:
        t: {
          var l = e.pendingProps;
          if (((t = dl(e.elementType)), (e.type = t), typeof t == "function"))
            jc(t)
              ? ((l = yl(t, l)), (e.tag = 1), (e = Nd(null, e, t, l, n)))
              : ((e.tag = 0), (e = So(null, e, t, l, n)));
          else {
            if (t != null) {
              var i = t.$$typeof;
              if (i === Z) {
                ((e.tag = 11), (e = bd(null, e, t, l, n)));
                break t;
              } else if (i === Q) {
                ((e.tag = 14), (e = xd(null, e, t, l, n)));
                break t;
              }
            }
            throw ((e = ft(t) || t), Error(o(306, e, "")));
          }
        }
        return e;
      case 0:
        return So(t, e, e.type, e.pendingProps, n);
      case 1:
        return ((l = e.type), (i = yl(l, e.pendingProps)), Nd(t, e, l, i, n));
      case 3:
        t: {
          if ((Kt(e, e.stateNode.containerInfo), t === null)) throw Error(o(387));
          l = e.pendingProps;
          var c = e.memoizedState;
          ((i = c.element), Jc(t, e), Ba(e, l, null, n));
          var f = e.memoizedState;
          if (
            ((l = f.cache),
            wn(e, Yt, l),
            l !== c.cache && Yc(e, [Yt], n, !0),
            Ha(),
            (l = f.element),
            c.isDehydrated)
          )
            if (
              ((c = { element: l, isDehydrated: !1, cache: f.cache }),
              (e.updateQueue.baseState = c),
              (e.memoizedState = c),
              e.flags & 256)
            ) {
              e = Od(t, e, l, n);
              break t;
            } else if (l !== i) {
              ((i = Oe(Error(o(424)), e)), Ra(i), (e = Od(t, e, l, n)));
              break t;
            } else {
              switch (((t = e.stateNode.containerInfo), t.nodeType)) {
                case 9:
                  t = t.body;
                  break;
                default:
                  t = t.nodeName === "HTML" ? t.ownerDocument.body : t;
              }
              for (
                jt = je(t.firstChild),
                  Pt = e,
                  gt = !0,
                  Nn = null,
                  Re = !0,
                  n = Ef(e, null, l, n),
                  e.child = n;
                n;
              )
                ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
            }
          else {
            if ((ol(), l === i)) {
              e = cn(t, e, n);
              break t;
            }
            te(t, e, l, n);
          }
          e = e.child;
        }
        return e;
      case 26:
        return (
          au(t, e),
          t === null
            ? (n = Gm(e.type, null, e.pendingProps, null))
              ? (e.memoizedState = n)
              : gt ||
                ((n = e.type),
                (t = e.pendingProps),
                (l = Su(st.current).createElement(n)),
                (l[Ft] = e),
                (l[ie] = t),
                ee(l, n, t),
                Jt(l),
                (e.stateNode = l))
            : (e.memoizedState = Gm(e.type, t.memoizedProps, e.pendingProps, t.memoizedState)),
          null
        );
      case 27:
        return (
          Pn(e),
          t === null &&
            gt &&
            ((l = e.stateNode = qm(e.type, e.pendingProps, st.current)),
            (Pt = e),
            (Re = !0),
            (i = jt),
            Yn(e.type) ? ((cr = i), (jt = je(l.firstChild))) : (jt = i)),
          te(t, e, e.pendingProps.children, n),
          au(t, e),
          t === null && (e.flags |= 4194304),
          e.child
        );
      case 5:
        return (
          t === null &&
            gt &&
            ((i = l = jt) &&
              ((l = hg(l, e.type, e.pendingProps, Re)),
              l !== null
                ? ((e.stateNode = l), (Pt = e), (jt = je(l.firstChild)), (Re = !1), (i = !0))
                : (i = !1)),
            i || On(e)),
          Pn(e),
          (i = e.type),
          (c = e.pendingProps),
          (f = t !== null ? t.memoizedProps : null),
          (l = c.children),
          nr(i, c) ? (l = null) : f !== null && nr(i, f) && (e.flags |= 32),
          e.memoizedState !== null && ((i = to(t, e, _v, null, null, n)), (li._currentValue = i)),
          au(t, e),
          te(t, e, l, n),
          e.child
        );
      case 6:
        return (
          t === null &&
            gt &&
            ((t = n = jt) &&
              ((n = pg(n, e.pendingProps, Re)),
              n !== null ? ((e.stateNode = n), (Pt = e), (jt = null), (t = !0)) : (t = !1)),
            t || On(e)),
          null
        );
      case 13:
        return wd(t, e, n);
      case 4:
        return (
          Kt(e, e.stateNode.containerInfo),
          (l = e.pendingProps),
          t === null ? (e.child = hl(e, null, l, n)) : te(t, e, l, n),
          e.child
        );
      case 11:
        return bd(t, e, e.type, e.pendingProps, n);
      case 7:
        return (te(t, e, e.pendingProps, n), e.child);
      case 8:
        return (te(t, e, e.pendingProps.children, n), e.child);
      case 12:
        return (te(t, e, e.pendingProps.children, n), e.child);
      case 10:
        return ((l = e.pendingProps), wn(e, e.type, l.value), te(t, e, l.children, n), e.child);
      case 9:
        return (
          (i = e.type._context),
          (l = e.pendingProps.children),
          sl(e),
          (i = It(i)),
          (l = l(i)),
          (e.flags |= 1),
          te(t, e, l, n),
          e.child
        );
      case 14:
        return xd(t, e, e.type, e.pendingProps, n);
      case 15:
        return Sd(t, e, e.type, e.pendingProps, n);
      case 19:
        return Rd(t, e, n);
      case 31:
        return Bv(t, e, n);
      case 22:
        return Ed(t, e, n, e.pendingProps);
      case 24:
        return (
          sl(e),
          (l = It(Yt)),
          t === null
            ? ((i = Qc()),
              i === null &&
                ((i = zt),
                (c = Gc()),
                (i.pooledCache = c),
                c.refCount++,
                c !== null && (i.pooledCacheLanes |= n),
                (i = c)),
              (e.memoizedState = { parent: l, cache: i }),
              Kc(e),
              wn(e, Yt, i))
            : ((t.lanes & n) !== 0 && (Jc(t, e), Ba(e, null, null, n), Ha()),
              (i = t.memoizedState),
              (c = e.memoizedState),
              i.parent !== l
                ? ((i = { parent: l, cache: l }),
                  (e.memoizedState = i),
                  e.lanes === 0 && (e.memoizedState = e.updateQueue.baseState = i),
                  wn(e, Yt, l))
                : ((l = c.cache), wn(e, Yt, l), l !== i.cache && Yc(e, [Yt], n, !0))),
          te(t, e, e.pendingProps.children, n),
          e.child
        );
      case 29:
        throw e.pendingProps;
    }
    throw Error(o(156, e.tag));
  }
  function on(t) {
    t.flags |= 4;
  }
  function _o(t, e, n, l, i) {
    if (((e = (t.mode & 32) !== 0) && (e = !1), e)) {
      if (((t.flags |= 16777216), (i & 335544128) === i))
        if (t.stateNode.complete) t.flags |= 8192;
        else if (am()) t.flags |= 8192;
        else throw ((ml = Xi), Zc);
    } else t.flags &= -16777217;
  }
  function jd(t, e) {
    if (e.type !== "stylesheet" || (e.state.loading & 4) !== 0) t.flags &= -16777217;
    else if (((t.flags |= 16777216), !Jm(e)))
      if (am()) t.flags |= 8192;
      else throw ((ml = Xi), Zc);
  }
  function uu(t, e) {
    (e !== null && (t.flags |= 4),
      t.flags & 16384 && ((e = t.tag !== 22 ? ss() : 536870912), (t.lanes |= e), (Wl |= e)));
  }
  function Xa(t, e) {
    if (!gt)
      switch (t.tailMode) {
        case "hidden":
          e = t.tail;
          for (var n = null; e !== null; ) (e.alternate !== null && (n = e), (e = e.sibling));
          n === null ? (t.tail = null) : (n.sibling = null);
          break;
        case "collapsed":
          n = t.tail;
          for (var l = null; n !== null; ) (n.alternate !== null && (l = n), (n = n.sibling));
          l === null
            ? e || t.tail === null
              ? (t.tail = null)
              : (t.tail.sibling = null)
            : (l.sibling = null);
      }
  }
  function Mt(t) {
    var e = t.alternate !== null && t.alternate.child === t.child,
      n = 0,
      l = 0;
    if (e)
      for (var i = t.child; i !== null; )
        ((n |= i.lanes | i.childLanes),
          (l |= i.subtreeFlags & 65011712),
          (l |= i.flags & 65011712),
          (i.return = t),
          (i = i.sibling));
    else
      for (i = t.child; i !== null; )
        ((n |= i.lanes | i.childLanes),
          (l |= i.subtreeFlags),
          (l |= i.flags),
          (i.return = t),
          (i = i.sibling));
    return ((t.subtreeFlags |= l), (t.childLanes = n), e);
  }
  function qv(t, e, n) {
    var l = e.pendingProps;
    switch ((Hc(e), e.tag)) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return (Mt(e), null);
      case 1:
        return (Mt(e), null);
      case 3:
        return (
          (n = e.stateNode),
          (l = null),
          t !== null && (l = t.memoizedState.cache),
          e.memoizedState.cache !== l && (e.flags |= 2048),
          ln(Yt),
          Ht(),
          n.pendingContext && ((n.context = n.pendingContext), (n.pendingContext = null)),
          (t === null || t.child === null) &&
            (Bl(e)
              ? on(e)
              : t === null ||
                (t.memoizedState.isDehydrated && (e.flags & 256) === 0) ||
                ((e.flags |= 1024), Lc())),
          Mt(e),
          null
        );
      case 26:
        var i = e.type,
          c = e.memoizedState;
        return (
          t === null
            ? (on(e), c !== null ? (Mt(e), jd(e, c)) : (Mt(e), _o(e, i, null, l, n)))
            : c
              ? c !== t.memoizedState
                ? (on(e), Mt(e), jd(e, c))
                : (Mt(e), (e.flags &= -16777217))
              : ((t = t.memoizedProps), t !== l && on(e), Mt(e), _o(e, i, t, l, n)),
          null
        );
      case 27:
        if ((xl(e), (n = st.current), (i = e.type), t !== null && e.stateNode != null))
          t.memoizedProps !== l && on(e);
        else {
          if (!l) {
            if (e.stateNode === null) throw Error(o(166));
            return (Mt(e), null);
          }
          ((t = k.current), Bl(e) ? ff(e) : ((t = qm(i, l, n)), (e.stateNode = t), on(e)));
        }
        return (Mt(e), null);
      case 5:
        if ((xl(e), (i = e.type), t !== null && e.stateNode != null))
          t.memoizedProps !== l && on(e);
        else {
          if (!l) {
            if (e.stateNode === null) throw Error(o(166));
            return (Mt(e), null);
          }
          if (((c = k.current), Bl(e))) ff(e);
          else {
            var f = Su(st.current);
            switch (c) {
              case 1:
                c = f.createElementNS("http://www.w3.org/2000/svg", i);
                break;
              case 2:
                c = f.createElementNS("http://www.w3.org/1998/Math/MathML", i);
                break;
              default:
                switch (i) {
                  case "svg":
                    c = f.createElementNS("http://www.w3.org/2000/svg", i);
                    break;
                  case "math":
                    c = f.createElementNS("http://www.w3.org/1998/Math/MathML", i);
                    break;
                  case "script":
                    ((c = f.createElement("div")),
                      (c.innerHTML = "<script><\/script>"),
                      (c = c.removeChild(c.firstChild)));
                    break;
                  case "select":
                    ((c =
                      typeof l.is == "string"
                        ? f.createElement("select", { is: l.is })
                        : f.createElement("select")),
                      l.multiple ? (c.multiple = !0) : l.size && (c.size = l.size));
                    break;
                  default:
                    c =
                      typeof l.is == "string"
                        ? f.createElement(i, { is: l.is })
                        : f.createElement(i);
                }
            }
            ((c[Ft] = e), (c[ie] = l));
            t: for (f = e.child; f !== null; ) {
              if (f.tag === 5 || f.tag === 6) c.appendChild(f.stateNode);
              else if (f.tag !== 4 && f.tag !== 27 && f.child !== null) {
                ((f.child.return = f), (f = f.child));
                continue;
              }
              if (f === e) break t;
              for (; f.sibling === null; ) {
                if (f.return === null || f.return === e) break t;
                f = f.return;
              }
              ((f.sibling.return = f.return), (f = f.sibling));
            }
            e.stateNode = c;
            t: switch ((ee(c, i, l), i)) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                l = !!l.autoFocus;
                break t;
              case "img":
                l = !0;
                break t;
              default:
                l = !1;
            }
            l && on(e);
          }
        }
        return (Mt(e), _o(e, e.type, t === null ? null : t.memoizedProps, e.pendingProps, n), null);
      case 6:
        if (t && e.stateNode != null) t.memoizedProps !== l && on(e);
        else {
          if (typeof l != "string" && e.stateNode === null) throw Error(o(166));
          if (((t = st.current), Bl(e))) {
            if (((t = e.stateNode), (n = e.memoizedProps), (l = null), (i = Pt), i !== null))
              switch (i.tag) {
                case 27:
                case 5:
                  l = i.memoizedProps;
              }
            ((t[Ft] = e),
              (t = !!(
                t.nodeValue === n ||
                (l !== null && l.suppressHydrationWarning === !0) ||
                wm(t.nodeValue, n)
              )),
              t || On(e, !0));
          } else ((t = Su(t).createTextNode(l)), (t[Ft] = e), (e.stateNode = t));
        }
        return (Mt(e), null);
      case 31:
        if (((n = e.memoizedState), t === null || t.memoizedState !== null)) {
          if (((l = Bl(e)), n !== null)) {
            if (t === null) {
              if (!l) throw Error(o(318));
              if (((t = e.memoizedState), (t = t !== null ? t.dehydrated : null), !t))
                throw Error(o(557));
              t[Ft] = e;
            } else (ol(), (e.flags & 128) === 0 && (e.memoizedState = null), (e.flags |= 4));
            (Mt(e), (t = !1));
          } else
            ((n = Lc()),
              t !== null && t.memoizedState !== null && (t.memoizedState.hydrationErrors = n),
              (t = !0));
          if (!t) return e.flags & 256 ? (ge(e), e) : (ge(e), null);
          if ((e.flags & 128) !== 0) throw Error(o(558));
        }
        return (Mt(e), null);
      case 13:
        if (
          ((l = e.memoizedState),
          t === null || (t.memoizedState !== null && t.memoizedState.dehydrated !== null))
        ) {
          if (((i = Bl(e)), l !== null && l.dehydrated !== null)) {
            if (t === null) {
              if (!i) throw Error(o(318));
              if (((i = e.memoizedState), (i = i !== null ? i.dehydrated : null), !i))
                throw Error(o(317));
              i[Ft] = e;
            } else (ol(), (e.flags & 128) === 0 && (e.memoizedState = null), (e.flags |= 4));
            (Mt(e), (i = !1));
          } else
            ((i = Lc()),
              t !== null && t.memoizedState !== null && (t.memoizedState.hydrationErrors = i),
              (i = !0));
          if (!i) return e.flags & 256 ? (ge(e), e) : (ge(e), null);
        }
        return (
          ge(e),
          (e.flags & 128) !== 0
            ? ((e.lanes = n), e)
            : ((n = l !== null),
              (t = t !== null && t.memoizedState !== null),
              n &&
                ((l = e.child),
                (i = null),
                l.alternate !== null &&
                  l.alternate.memoizedState !== null &&
                  l.alternate.memoizedState.cachePool !== null &&
                  (i = l.alternate.memoizedState.cachePool.pool),
                (c = null),
                l.memoizedState !== null &&
                  l.memoizedState.cachePool !== null &&
                  (c = l.memoizedState.cachePool.pool),
                c !== i && (l.flags |= 2048)),
              n !== t && n && (e.child.flags |= 8192),
              uu(e, e.updateQueue),
              Mt(e),
              null)
        );
      case 4:
        return (Ht(), t === null && Fo(e.stateNode.containerInfo), Mt(e), null);
      case 10:
        return (ln(e.type), Mt(e), null);
      case 19:
        if ((q(qt), (l = e.memoizedState), l === null)) return (Mt(e), null);
        if (((i = (e.flags & 128) !== 0), (c = l.rendering), c === null))
          if (i) Xa(l, !1);
          else {
            if (Lt !== 0 || (t !== null && (t.flags & 128) !== 0))
              for (t = e.child; t !== null; ) {
                if (((c = Ji(t)), c !== null)) {
                  for (
                    e.flags |= 128,
                      Xa(l, !1),
                      t = c.updateQueue,
                      e.updateQueue = t,
                      uu(e, t),
                      e.subtreeFlags = 0,
                      t = n,
                      n = e.child;
                    n !== null;
                  )
                    (uf(n, t), (n = n.sibling));
                  return (J(qt, (qt.current & 1) | 2), gt && en(e, l.treeForkCount), e.child);
                }
                t = t.sibling;
              }
            l.tail !== null &&
              de() > fu &&
              ((e.flags |= 128), (i = !0), Xa(l, !1), (e.lanes = 4194304));
          }
        else {
          if (!i)
            if (((t = Ji(c)), t !== null)) {
              if (
                ((e.flags |= 128),
                (i = !0),
                (t = t.updateQueue),
                (e.updateQueue = t),
                uu(e, t),
                Xa(l, !0),
                l.tail === null && l.tailMode === "hidden" && !c.alternate && !gt)
              )
                return (Mt(e), null);
            } else
              2 * de() - l.renderingStartTime > fu &&
                n !== 536870912 &&
                ((e.flags |= 128), (i = !0), Xa(l, !1), (e.lanes = 4194304));
          l.isBackwards
            ? ((c.sibling = e.child), (e.child = c))
            : ((t = l.last), t !== null ? (t.sibling = c) : (e.child = c), (l.last = c));
        }
        return l.tail !== null
          ? ((t = l.tail),
            (l.rendering = t),
            (l.tail = t.sibling),
            (l.renderingStartTime = de()),
            (t.sibling = null),
            (n = qt.current),
            J(qt, i ? (n & 1) | 2 : n & 1),
            gt && en(e, l.treeForkCount),
            t)
          : (Mt(e), null);
      case 22:
      case 23:
        return (
          ge(e),
          Fc(),
          (l = e.memoizedState !== null),
          t !== null
            ? (t.memoizedState !== null) !== l && (e.flags |= 8192)
            : l && (e.flags |= 8192),
          l
            ? (n & 536870912) !== 0 &&
              (e.flags & 128) === 0 &&
              (Mt(e), e.subtreeFlags & 6 && (e.flags |= 8192))
            : Mt(e),
          (n = e.updateQueue),
          n !== null && uu(e, n.retryQueue),
          (n = null),
          t !== null &&
            t.memoizedState !== null &&
            t.memoizedState.cachePool !== null &&
            (n = t.memoizedState.cachePool.pool),
          (l = null),
          e.memoizedState !== null &&
            e.memoizedState.cachePool !== null &&
            (l = e.memoizedState.cachePool.pool),
          l !== n && (e.flags |= 2048),
          t !== null && q(fl),
          null
        );
      case 24:
        return (
          (n = null),
          t !== null && (n = t.memoizedState.cache),
          e.memoizedState.cache !== n && (e.flags |= 2048),
          ln(Yt),
          Mt(e),
          null
        );
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(o(156, e.tag));
  }
  function Vv(t, e) {
    switch ((Hc(e), e.tag)) {
      case 1:
        return ((t = e.flags), t & 65536 ? ((e.flags = (t & -65537) | 128), e) : null);
      case 3:
        return (
          ln(Yt),
          Ht(),
          (t = e.flags),
          (t & 65536) !== 0 && (t & 128) === 0 ? ((e.flags = (t & -65537) | 128), e) : null
        );
      case 26:
      case 27:
      case 5:
        return (xl(e), null);
      case 31:
        if (e.memoizedState !== null) {
          if ((ge(e), e.alternate === null)) throw Error(o(340));
          ol();
        }
        return ((t = e.flags), t & 65536 ? ((e.flags = (t & -65537) | 128), e) : null);
      case 13:
        if ((ge(e), (t = e.memoizedState), t !== null && t.dehydrated !== null)) {
          if (e.alternate === null) throw Error(o(340));
          ol();
        }
        return ((t = e.flags), t & 65536 ? ((e.flags = (t & -65537) | 128), e) : null);
      case 19:
        return (q(qt), null);
      case 4:
        return (Ht(), null);
      case 10:
        return (ln(e.type), null);
      case 22:
      case 23:
        return (
          ge(e),
          Fc(),
          t !== null && q(fl),
          (t = e.flags),
          t & 65536 ? ((e.flags = (t & -65537) | 128), e) : null
        );
      case 24:
        return (ln(Yt), null);
      case 25:
        return null;
      default:
        return null;
    }
  }
  function Md(t, e) {
    switch ((Hc(e), e.tag)) {
      case 3:
        (ln(Yt), Ht());
        break;
      case 26:
      case 27:
      case 5:
        xl(e);
        break;
      case 4:
        Ht();
        break;
      case 31:
        e.memoizedState !== null && ge(e);
        break;
      case 13:
        ge(e);
        break;
      case 19:
        q(qt);
        break;
      case 10:
        ln(e.type);
        break;
      case 22:
      case 23:
        (ge(e), Fc(), t !== null && q(fl));
        break;
      case 24:
        ln(Yt);
    }
  }
  function Qa(t, e) {
    try {
      var n = e.updateQueue,
        l = n !== null ? n.lastEffect : null;
      if (l !== null) {
        var i = l.next;
        n = i;
        do {
          if ((n.tag & t) === t) {
            l = void 0;
            var c = n.create,
              f = n.inst;
            ((l = c()), (f.destroy = l));
          }
          n = n.next;
        } while (n !== i);
      }
    } catch (y) {
      Ot(e, e.return, y);
    }
  }
  function Dn(t, e, n) {
    try {
      var l = e.updateQueue,
        i = l !== null ? l.lastEffect : null;
      if (i !== null) {
        var c = i.next;
        l = c;
        do {
          if ((l.tag & t) === t) {
            var f = l.inst,
              y = f.destroy;
            if (y !== void 0) {
              ((f.destroy = void 0), (i = e));
              var E = n,
                w = y;
              try {
                w();
              } catch (H) {
                Ot(i, E, H);
              }
            }
          }
          l = l.next;
        } while (l !== c);
      }
    } catch (H) {
      Ot(e, e.return, H);
    }
  }
  function Dd(t) {
    var e = t.updateQueue;
    if (e !== null) {
      var n = t.stateNode;
      try {
        Tf(e, n);
      } catch (l) {
        Ot(t, t.return, l);
      }
    }
  }
  function Ud(t, e, n) {
    ((n.props = yl(t.type, t.memoizedProps)), (n.state = t.memoizedState));
    try {
      n.componentWillUnmount();
    } catch (l) {
      Ot(t, e, l);
    }
  }
  function Za(t, e) {
    try {
      var n = t.ref;
      if (n !== null) {
        switch (t.tag) {
          case 26:
          case 27:
          case 5:
            var l = t.stateNode;
            break;
          case 30:
            l = t.stateNode;
            break;
          default:
            l = t.stateNode;
        }
        typeof n == "function" ? (t.refCleanup = n(l)) : (n.current = l);
      }
    } catch (i) {
      Ot(t, e, i);
    }
  }
  function Qe(t, e) {
    var n = t.ref,
      l = t.refCleanup;
    if (n !== null)
      if (typeof l == "function")
        try {
          l();
        } catch (i) {
          Ot(t, e, i);
        } finally {
          ((t.refCleanup = null), (t = t.alternate), t != null && (t.refCleanup = null));
        }
      else if (typeof n == "function")
        try {
          n(null);
        } catch (i) {
          Ot(t, e, i);
        }
      else n.current = null;
  }
  function Hd(t) {
    var e = t.type,
      n = t.memoizedProps,
      l = t.stateNode;
    try {
      t: switch (e) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          n.autoFocus && l.focus();
          break t;
        case "img":
          n.src ? (l.src = n.src) : n.srcSet && (l.srcset = n.srcSet);
      }
    } catch (i) {
      Ot(t, t.return, i);
    }
  }
  function Ro(t, e, n) {
    try {
      var l = t.stateNode;
      (og(l, t.type, n, e), (l[ie] = e));
    } catch (i) {
      Ot(t, t.return, i);
    }
  }
  function Bd(t) {
    return (
      t.tag === 5 || t.tag === 3 || t.tag === 26 || (t.tag === 27 && Yn(t.type)) || t.tag === 4
    );
  }
  function zo(t) {
    t: for (;;) {
      for (; t.sibling === null; ) {
        if (t.return === null || Bd(t.return)) return null;
        t = t.return;
      }
      for (
        t.sibling.return = t.return, t = t.sibling;
        t.tag !== 5 && t.tag !== 6 && t.tag !== 18;
      ) {
        if ((t.tag === 27 && Yn(t.type)) || t.flags & 2 || t.child === null || t.tag === 4)
          continue t;
        ((t.child.return = t), (t = t.child));
      }
      if (!(t.flags & 2)) return t.stateNode;
    }
  }
  function jo(t, e, n) {
    var l = t.tag;
    if (l === 5 || l === 6)
      ((t = t.stateNode),
        e
          ? (n.nodeType === 9
              ? n.body
              : n.nodeName === "HTML"
                ? n.ownerDocument.body
                : n
            ).insertBefore(t, e)
          : ((e = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n),
            e.appendChild(t),
            (n = n._reactRootContainer),
            n != null || e.onclick !== null || (e.onclick = Pe)));
    else if (
      l !== 4 &&
      (l === 27 && Yn(t.type) && ((n = t.stateNode), (e = null)), (t = t.child), t !== null)
    )
      for (jo(t, e, n), t = t.sibling; t !== null; ) (jo(t, e, n), (t = t.sibling));
  }
  function cu(t, e, n) {
    var l = t.tag;
    if (l === 5 || l === 6) ((t = t.stateNode), e ? n.insertBefore(t, e) : n.appendChild(t));
    else if (l !== 4 && (l === 27 && Yn(t.type) && (n = t.stateNode), (t = t.child), t !== null))
      for (cu(t, e, n), t = t.sibling; t !== null; ) (cu(t, e, n), (t = t.sibling));
  }
  function Ld(t) {
    var e = t.stateNode,
      n = t.memoizedProps;
    try {
      for (var l = t.type, i = e.attributes; i.length; ) e.removeAttributeNode(i[0]);
      (ee(e, l, n), (e[Ft] = t), (e[ie] = n));
    } catch (c) {
      Ot(t, t.return, c);
    }
  }
  var rn = !1,
    Qt = !1,
    Mo = !1,
    qd = typeof WeakSet == "function" ? WeakSet : Set,
    $t = null;
  function Yv(t, e) {
    if (((t = t.containerInfo), (tr = wu), (t = Ws(t)), Cc(t))) {
      if ("selectionStart" in t) var n = { start: t.selectionStart, end: t.selectionEnd };
      else
        t: {
          n = ((n = t.ownerDocument) && n.defaultView) || window;
          var l = n.getSelection && n.getSelection();
          if (l && l.rangeCount !== 0) {
            n = l.anchorNode;
            var i = l.anchorOffset,
              c = l.focusNode;
            l = l.focusOffset;
            try {
              (n.nodeType, c.nodeType);
            } catch {
              n = null;
              break t;
            }
            var f = 0,
              y = -1,
              E = -1,
              w = 0,
              H = 0,
              L = t,
              R = null;
            e: for (;;) {
              for (
                var j;
                L !== n || (i !== 0 && L.nodeType !== 3) || (y = f + i),
                  L !== c || (l !== 0 && L.nodeType !== 3) || (E = f + l),
                  L.nodeType === 3 && (f += L.nodeValue.length),
                  (j = L.firstChild) !== null;
              )
                ((R = L), (L = j));
              for (;;) {
                if (L === t) break e;
                if (
                  (R === n && ++w === i && (y = f),
                  R === c && ++H === l && (E = f),
                  (j = L.nextSibling) !== null)
                )
                  break;
                ((L = R), (R = L.parentNode));
              }
              L = j;
            }
            n = y === -1 || E === -1 ? null : { start: y, end: E };
          } else n = null;
        }
      n = n || { start: 0, end: 0 };
    } else n = null;
    for (er = { focusedElem: t, selectionRange: n }, wu = !1, $t = e; $t !== null; )
      if (((e = $t), (t = e.child), (e.subtreeFlags & 1028) !== 0 && t !== null))
        ((t.return = e), ($t = t));
      else
        for (; $t !== null; ) {
          switch (((e = $t), (c = e.alternate), (t = e.flags), e.tag)) {
            case 0:
              if (
                (t & 4) !== 0 &&
                ((t = e.updateQueue), (t = t !== null ? t.events : null), t !== null)
              )
                for (n = 0; n < t.length; n++) ((i = t[n]), (i.ref.impl = i.nextImpl));
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((t & 1024) !== 0 && c !== null) {
                ((t = void 0),
                  (n = e),
                  (i = c.memoizedProps),
                  (c = c.memoizedState),
                  (l = n.stateNode));
                try {
                  var $ = yl(n.type, i);
                  ((t = l.getSnapshotBeforeUpdate($, c)),
                    (l.__reactInternalSnapshotBeforeUpdate = t));
                } catch (lt) {
                  Ot(n, n.return, lt);
                }
              }
              break;
            case 3:
              if ((t & 1024) !== 0) {
                if (((t = e.stateNode.containerInfo), (n = t.nodeType), n === 9)) ar(t);
                else if (n === 1)
                  switch (t.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      ar(t);
                      break;
                    default:
                      t.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((t & 1024) !== 0) throw Error(o(163));
          }
          if (((t = e.sibling), t !== null)) {
            ((t.return = e.return), ($t = t));
            break;
          }
          $t = e.return;
        }
  }
  function Vd(t, e, n) {
    var l = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
        (fn(t, n), l & 4 && Qa(5, n));
        break;
      case 1:
        if ((fn(t, n), l & 4))
          if (((t = n.stateNode), e === null))
            try {
              t.componentDidMount();
            } catch (f) {
              Ot(n, n.return, f);
            }
          else {
            var i = yl(n.type, e.memoizedProps);
            e = e.memoizedState;
            try {
              t.componentDidUpdate(i, e, t.__reactInternalSnapshotBeforeUpdate);
            } catch (f) {
              Ot(n, n.return, f);
            }
          }
        (l & 64 && Dd(n), l & 512 && Za(n, n.return));
        break;
      case 3:
        if ((fn(t, n), l & 64 && ((t = n.updateQueue), t !== null))) {
          if (((e = null), n.child !== null))
            switch (n.child.tag) {
              case 27:
              case 5:
                e = n.child.stateNode;
                break;
              case 1:
                e = n.child.stateNode;
            }
          try {
            Tf(t, e);
          } catch (f) {
            Ot(n, n.return, f);
          }
        }
        break;
      case 27:
        e === null && l & 4 && Ld(n);
      case 26:
      case 5:
        (fn(t, n), e === null && l & 4 && Hd(n), l & 512 && Za(n, n.return));
        break;
      case 12:
        fn(t, n);
        break;
      case 31:
        (fn(t, n), l & 4 && Xd(t, n));
        break;
      case 13:
        (fn(t, n),
          l & 4 && Qd(t, n),
          l & 64 &&
            ((t = n.memoizedState),
            t !== null && ((t = t.dehydrated), t !== null && ((n = Wv.bind(null, n)), yg(t, n)))));
        break;
      case 22:
        if (((l = n.memoizedState !== null || rn), !l)) {
          ((e = (e !== null && e.memoizedState !== null) || Qt), (i = rn));
          var c = Qt;
          ((rn = l),
            (Qt = e) && !c ? dn(t, n, (n.subtreeFlags & 8772) !== 0) : fn(t, n),
            (rn = i),
            (Qt = c));
        }
        break;
      case 30:
        break;
      default:
        fn(t, n);
    }
  }
  function Yd(t) {
    var e = t.alternate;
    (e !== null && ((t.alternate = null), Yd(e)),
      (t.child = null),
      (t.deletions = null),
      (t.sibling = null),
      t.tag === 5 && ((e = t.stateNode), e !== null && oc(e)),
      (t.stateNode = null),
      (t.return = null),
      (t.dependencies = null),
      (t.memoizedProps = null),
      (t.memoizedState = null),
      (t.pendingProps = null),
      (t.stateNode = null),
      (t.updateQueue = null));
  }
  var Ut = null,
    ce = !1;
  function sn(t, e, n) {
    for (n = n.child; n !== null; ) (Gd(t, e, n), (n = n.sibling));
  }
  function Gd(t, e, n) {
    if (me && typeof me.onCommitFiberUnmount == "function")
      try {
        me.onCommitFiberUnmount(pa, n);
      } catch {}
    switch (n.tag) {
      case 26:
        (Qt || Qe(n, e),
          sn(t, e, n),
          n.memoizedState
            ? n.memoizedState.count--
            : n.stateNode && ((n = n.stateNode), n.parentNode.removeChild(n)));
        break;
      case 27:
        Qt || Qe(n, e);
        var l = Ut,
          i = ce;
        (Yn(n.type) && ((Ut = n.stateNode), (ce = !1)),
          sn(t, e, n),
          ti(n.stateNode),
          (Ut = l),
          (ce = i));
        break;
      case 5:
        Qt || Qe(n, e);
      case 6:
        if (((l = Ut), (i = ce), (Ut = null), sn(t, e, n), (Ut = l), (ce = i), Ut !== null))
          if (ce)
            try {
              (Ut.nodeType === 9
                ? Ut.body
                : Ut.nodeName === "HTML"
                  ? Ut.ownerDocument.body
                  : Ut
              ).removeChild(n.stateNode);
            } catch (c) {
              Ot(n, e, c);
            }
          else
            try {
              Ut.removeChild(n.stateNode);
            } catch (c) {
              Ot(n, e, c);
            }
        break;
      case 18:
        Ut !== null &&
          (ce
            ? ((t = Ut),
              Dm(
                t.nodeType === 9 ? t.body : t.nodeName === "HTML" ? t.ownerDocument.body : t,
                n.stateNode,
              ),
              aa(t))
            : Dm(Ut, n.stateNode));
        break;
      case 4:
        ((l = Ut),
          (i = ce),
          (Ut = n.stateNode.containerInfo),
          (ce = !0),
          sn(t, e, n),
          (Ut = l),
          (ce = i));
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        (Dn(2, n, e), Qt || Dn(4, n, e), sn(t, e, n));
        break;
      case 1:
        (Qt ||
          (Qe(n, e), (l = n.stateNode), typeof l.componentWillUnmount == "function" && Ud(n, e, l)),
          sn(t, e, n));
        break;
      case 21:
        sn(t, e, n);
        break;
      case 22:
        ((Qt = (l = Qt) || n.memoizedState !== null), sn(t, e, n), (Qt = l));
        break;
      default:
        sn(t, e, n);
    }
  }
  function Xd(t, e) {
    if (
      e.memoizedState === null &&
      ((t = e.alternate), t !== null && ((t = t.memoizedState), t !== null))
    ) {
      t = t.dehydrated;
      try {
        aa(t);
      } catch (n) {
        Ot(e, e.return, n);
      }
    }
  }
  function Qd(t, e) {
    if (
      e.memoizedState === null &&
      ((t = e.alternate),
      t !== null && ((t = t.memoizedState), t !== null && ((t = t.dehydrated), t !== null)))
    )
      try {
        aa(t);
      } catch (n) {
        Ot(e, e.return, n);
      }
  }
  function Gv(t) {
    switch (t.tag) {
      case 31:
      case 13:
      case 19:
        var e = t.stateNode;
        return (e === null && (e = t.stateNode = new qd()), e);
      case 22:
        return (
          (t = t.stateNode),
          (e = t._retryCache),
          e === null && (e = t._retryCache = new qd()),
          e
        );
      default:
        throw Error(o(435, t.tag));
    }
  }
  function ou(t, e) {
    var n = Gv(t);
    e.forEach(function (l) {
      if (!n.has(l)) {
        n.add(l);
        var i = Fv.bind(null, t, l);
        l.then(i, i);
      }
    });
  }
  function oe(t, e) {
    var n = e.deletions;
    if (n !== null)
      for (var l = 0; l < n.length; l++) {
        var i = n[l],
          c = t,
          f = e,
          y = f;
        t: for (; y !== null; ) {
          switch (y.tag) {
            case 27:
              if (Yn(y.type)) {
                ((Ut = y.stateNode), (ce = !1));
                break t;
              }
              break;
            case 5:
              ((Ut = y.stateNode), (ce = !1));
              break t;
            case 3:
            case 4:
              ((Ut = y.stateNode.containerInfo), (ce = !0));
              break t;
          }
          y = y.return;
        }
        if (Ut === null) throw Error(o(160));
        (Gd(c, f, i),
          (Ut = null),
          (ce = !1),
          (c = i.alternate),
          c !== null && (c.return = null),
          (i.return = null));
      }
    if (e.subtreeFlags & 13886) for (e = e.child; e !== null; ) (Zd(e, t), (e = e.sibling));
  }
  var He = null;
  function Zd(t, e) {
    var n = t.alternate,
      l = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        (oe(e, t), re(t), l & 4 && (Dn(3, t, t.return), Qa(3, t), Dn(5, t, t.return)));
        break;
      case 1:
        (oe(e, t),
          re(t),
          l & 512 && (Qt || n === null || Qe(n, n.return)),
          l & 64 &&
            rn &&
            ((t = t.updateQueue),
            t !== null &&
              ((l = t.callbacks),
              l !== null &&
                ((n = t.shared.hiddenCallbacks),
                (t.shared.hiddenCallbacks = n === null ? l : n.concat(l))))));
        break;
      case 26:
        var i = He;
        if ((oe(e, t), re(t), l & 512 && (Qt || n === null || Qe(n, n.return)), l & 4)) {
          var c = n !== null ? n.memoizedState : null;
          if (((l = t.memoizedState), n === null))
            if (l === null)
              if (t.stateNode === null) {
                t: {
                  ((l = t.type), (n = t.memoizedProps), (i = i.ownerDocument || i));
                  e: switch (l) {
                    case "title":
                      ((c = i.getElementsByTagName("title")[0]),
                        (!c ||
                          c[ga] ||
                          c[Ft] ||
                          c.namespaceURI === "http://www.w3.org/2000/svg" ||
                          c.hasAttribute("itemprop")) &&
                          ((c = i.createElement(l)),
                          i.head.insertBefore(c, i.querySelector("head > title"))),
                        ee(c, l, n),
                        (c[Ft] = t),
                        Jt(c),
                        (l = c));
                      break t;
                    case "link":
                      var f = Zm("link", "href", i).get(l + (n.href || ""));
                      if (f) {
                        for (var y = 0; y < f.length; y++)
                          if (
                            ((c = f[y]),
                            c.getAttribute("href") ===
                              (n.href == null || n.href === "" ? null : n.href) &&
                              c.getAttribute("rel") === (n.rel == null ? null : n.rel) &&
                              c.getAttribute("title") === (n.title == null ? null : n.title) &&
                              c.getAttribute("crossorigin") ===
                                (n.crossOrigin == null ? null : n.crossOrigin))
                          ) {
                            f.splice(y, 1);
                            break e;
                          }
                      }
                      ((c = i.createElement(l)), ee(c, l, n), i.head.appendChild(c));
                      break;
                    case "meta":
                      if ((f = Zm("meta", "content", i).get(l + (n.content || "")))) {
                        for (y = 0; y < f.length; y++)
                          if (
                            ((c = f[y]),
                            c.getAttribute("content") ===
                              (n.content == null ? null : "" + n.content) &&
                              c.getAttribute("name") === (n.name == null ? null : n.name) &&
                              c.getAttribute("property") ===
                                (n.property == null ? null : n.property) &&
                              c.getAttribute("http-equiv") ===
                                (n.httpEquiv == null ? null : n.httpEquiv) &&
                              c.getAttribute("charset") === (n.charSet == null ? null : n.charSet))
                          ) {
                            f.splice(y, 1);
                            break e;
                          }
                      }
                      ((c = i.createElement(l)), ee(c, l, n), i.head.appendChild(c));
                      break;
                    default:
                      throw Error(o(468, l));
                  }
                  ((c[Ft] = t), Jt(c), (l = c));
                }
                t.stateNode = l;
              } else Km(i, t.type, t.stateNode);
            else t.stateNode = Qm(i, l, t.memoizedProps);
          else
            c !== l
              ? (c === null
                  ? n.stateNode !== null && ((n = n.stateNode), n.parentNode.removeChild(n))
                  : c.count--,
                l === null ? Km(i, t.type, t.stateNode) : Qm(i, l, t.memoizedProps))
              : l === null && t.stateNode !== null && Ro(t, t.memoizedProps, n.memoizedProps);
        }
        break;
      case 27:
        (oe(e, t),
          re(t),
          l & 512 && (Qt || n === null || Qe(n, n.return)),
          n !== null && l & 4 && Ro(t, t.memoizedProps, n.memoizedProps));
        break;
      case 5:
        if ((oe(e, t), re(t), l & 512 && (Qt || n === null || Qe(n, n.return)), t.flags & 32)) {
          i = t.stateNode;
          try {
            Ol(i, "");
          } catch ($) {
            Ot(t, t.return, $);
          }
        }
        (l & 4 &&
          t.stateNode != null &&
          ((i = t.memoizedProps), Ro(t, i, n !== null ? n.memoizedProps : i)),
          l & 1024 && (Mo = !0));
        break;
      case 6:
        if ((oe(e, t), re(t), l & 4)) {
          if (t.stateNode === null) throw Error(o(162));
          ((l = t.memoizedProps), (n = t.stateNode));
          try {
            n.nodeValue = l;
          } catch ($) {
            Ot(t, t.return, $);
          }
        }
        break;
      case 3:
        if (
          ((Tu = null),
          (i = He),
          (He = Eu(e.containerInfo)),
          oe(e, t),
          (He = i),
          re(t),
          l & 4 && n !== null && n.memoizedState.isDehydrated)
        )
          try {
            aa(e.containerInfo);
          } catch ($) {
            Ot(t, t.return, $);
          }
        Mo && ((Mo = !1), Kd(t));
        break;
      case 4:
        ((l = He), (He = Eu(t.stateNode.containerInfo)), oe(e, t), re(t), (He = l));
        break;
      case 12:
        (oe(e, t), re(t));
        break;
      case 31:
        (oe(e, t),
          re(t),
          l & 4 && ((l = t.updateQueue), l !== null && ((t.updateQueue = null), ou(t, l))));
        break;
      case 13:
        (oe(e, t),
          re(t),
          t.child.flags & 8192 &&
            (t.memoizedState !== null) != (n !== null && n.memoizedState !== null) &&
            (su = de()),
          l & 4 && ((l = t.updateQueue), l !== null && ((t.updateQueue = null), ou(t, l))));
        break;
      case 22:
        i = t.memoizedState !== null;
        var E = n !== null && n.memoizedState !== null,
          w = rn,
          H = Qt;
        if (((rn = w || i), (Qt = H || E), oe(e, t), (Qt = H), (rn = w), re(t), l & 8192))
          t: for (
            e = t.stateNode,
              e._visibility = i ? e._visibility & -2 : e._visibility | 1,
              i && (n === null || E || rn || Qt || vl(t)),
              n = null,
              e = t;
            ;
          ) {
            if (e.tag === 5 || e.tag === 26) {
              if (n === null) {
                E = n = e;
                try {
                  if (((c = E.stateNode), i))
                    ((f = c.style),
                      typeof f.setProperty == "function"
                        ? f.setProperty("display", "none", "important")
                        : (f.display = "none"));
                  else {
                    y = E.stateNode;
                    var L = E.memoizedProps.style,
                      R = L != null && L.hasOwnProperty("display") ? L.display : null;
                    y.style.display = R == null || typeof R == "boolean" ? "" : ("" + R).trim();
                  }
                } catch ($) {
                  Ot(E, E.return, $);
                }
              }
            } else if (e.tag === 6) {
              if (n === null) {
                E = e;
                try {
                  E.stateNode.nodeValue = i ? "" : E.memoizedProps;
                } catch ($) {
                  Ot(E, E.return, $);
                }
              }
            } else if (e.tag === 18) {
              if (n === null) {
                E = e;
                try {
                  var j = E.stateNode;
                  i ? Um(j, !0) : Um(E.stateNode, !1);
                } catch ($) {
                  Ot(E, E.return, $);
                }
              }
            } else if (
              ((e.tag !== 22 && e.tag !== 23) || e.memoizedState === null || e === t) &&
              e.child !== null
            ) {
              ((e.child.return = e), (e = e.child));
              continue;
            }
            if (e === t) break t;
            for (; e.sibling === null; ) {
              if (e.return === null || e.return === t) break t;
              (n === e && (n = null), (e = e.return));
            }
            (n === e && (n = null), (e.sibling.return = e.return), (e = e.sibling));
          }
        l & 4 &&
          ((l = t.updateQueue),
          l !== null && ((n = l.retryQueue), n !== null && ((l.retryQueue = null), ou(t, n))));
        break;
      case 19:
        (oe(e, t),
          re(t),
          l & 4 && ((l = t.updateQueue), l !== null && ((t.updateQueue = null), ou(t, l))));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        (oe(e, t), re(t));
    }
  }
  function re(t) {
    var e = t.flags;
    if (e & 2) {
      try {
        for (var n, l = t.return; l !== null; ) {
          if (Bd(l)) {
            n = l;
            break;
          }
          l = l.return;
        }
        if (n == null) throw Error(o(160));
        switch (n.tag) {
          case 27:
            var i = n.stateNode,
              c = zo(t);
            cu(t, c, i);
            break;
          case 5:
            var f = n.stateNode;
            n.flags & 32 && (Ol(f, ""), (n.flags &= -33));
            var y = zo(t);
            cu(t, y, f);
            break;
          case 3:
          case 4:
            var E = n.stateNode.containerInfo,
              w = zo(t);
            jo(t, w, E);
            break;
          default:
            throw Error(o(161));
        }
      } catch (H) {
        Ot(t, t.return, H);
      }
      t.flags &= -3;
    }
    e & 4096 && (t.flags &= -4097);
  }
  function Kd(t) {
    if (t.subtreeFlags & 1024)
      for (t = t.child; t !== null; ) {
        var e = t;
        (Kd(e), e.tag === 5 && e.flags & 1024 && e.stateNode.reset(), (t = t.sibling));
      }
  }
  function fn(t, e) {
    if (e.subtreeFlags & 8772)
      for (e = e.child; e !== null; ) (Vd(t, e.alternate, e), (e = e.sibling));
  }
  function vl(t) {
    for (t = t.child; t !== null; ) {
      var e = t;
      switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          (Dn(4, e, e.return), vl(e));
          break;
        case 1:
          Qe(e, e.return);
          var n = e.stateNode;
          (typeof n.componentWillUnmount == "function" && Ud(e, e.return, n), vl(e));
          break;
        case 27:
          ti(e.stateNode);
        case 26:
        case 5:
          (Qe(e, e.return), vl(e));
          break;
        case 22:
          e.memoizedState === null && vl(e);
          break;
        case 30:
          vl(e);
          break;
        default:
          vl(e);
      }
      t = t.sibling;
    }
  }
  function dn(t, e, n) {
    for (n = n && (e.subtreeFlags & 8772) !== 0, e = e.child; e !== null; ) {
      var l = e.alternate,
        i = t,
        c = e,
        f = c.flags;
      switch (c.tag) {
        case 0:
        case 11:
        case 15:
          (dn(i, c, n), Qa(4, c));
          break;
        case 1:
          if ((dn(i, c, n), (l = c), (i = l.stateNode), typeof i.componentDidMount == "function"))
            try {
              i.componentDidMount();
            } catch (w) {
              Ot(l, l.return, w);
            }
          if (((l = c), (i = l.updateQueue), i !== null)) {
            var y = l.stateNode;
            try {
              var E = i.shared.hiddenCallbacks;
              if (E !== null)
                for (i.shared.hiddenCallbacks = null, i = 0; i < E.length; i++) Af(E[i], y);
            } catch (w) {
              Ot(l, l.return, w);
            }
          }
          (n && f & 64 && Dd(c), Za(c, c.return));
          break;
        case 27:
          Ld(c);
        case 26:
        case 5:
          (dn(i, c, n), n && l === null && f & 4 && Hd(c), Za(c, c.return));
          break;
        case 12:
          dn(i, c, n);
          break;
        case 31:
          (dn(i, c, n), n && f & 4 && Xd(i, c));
          break;
        case 13:
          (dn(i, c, n), n && f & 4 && Qd(i, c));
          break;
        case 22:
          (c.memoizedState === null && dn(i, c, n), Za(c, c.return));
          break;
        case 30:
          break;
        default:
          dn(i, c, n);
      }
      e = e.sibling;
    }
  }
  function Do(t, e) {
    var n = null;
    (t !== null &&
      t.memoizedState !== null &&
      t.memoizedState.cachePool !== null &&
      (n = t.memoizedState.cachePool.pool),
      (t = null),
      e.memoizedState !== null &&
        e.memoizedState.cachePool !== null &&
        (t = e.memoizedState.cachePool.pool),
      t !== n && (t != null && t.refCount++, n != null && za(n)));
  }
  function Uo(t, e) {
    ((t = null),
      e.alternate !== null && (t = e.alternate.memoizedState.cache),
      (e = e.memoizedState.cache),
      e !== t && (e.refCount++, t != null && za(t)));
  }
  function Be(t, e, n, l) {
    if (e.subtreeFlags & 10256) for (e = e.child; e !== null; ) (Jd(t, e, n, l), (e = e.sibling));
  }
  function Jd(t, e, n, l) {
    var i = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        (Be(t, e, n, l), i & 2048 && Qa(9, e));
        break;
      case 1:
        Be(t, e, n, l);
        break;
      case 3:
        (Be(t, e, n, l),
          i & 2048 &&
            ((t = null),
            e.alternate !== null && (t = e.alternate.memoizedState.cache),
            (e = e.memoizedState.cache),
            e !== t && (e.refCount++, t != null && za(t))));
        break;
      case 12:
        if (i & 2048) {
          (Be(t, e, n, l), (t = e.stateNode));
          try {
            var c = e.memoizedProps,
              f = c.id,
              y = c.onPostCommit;
            typeof y == "function" &&
              y(f, e.alternate === null ? "mount" : "update", t.passiveEffectDuration, -0);
          } catch (E) {
            Ot(e, e.return, E);
          }
        } else Be(t, e, n, l);
        break;
      case 31:
        Be(t, e, n, l);
        break;
      case 13:
        Be(t, e, n, l);
        break;
      case 23:
        break;
      case 22:
        ((c = e.stateNode),
          (f = e.alternate),
          e.memoizedState !== null
            ? c._visibility & 2
              ? Be(t, e, n, l)
              : Ka(t, e)
            : c._visibility & 2
              ? Be(t, e, n, l)
              : ((c._visibility |= 2), Jl(t, e, n, l, (e.subtreeFlags & 10256) !== 0 || !1)),
          i & 2048 && Do(f, e));
        break;
      case 24:
        (Be(t, e, n, l), i & 2048 && Uo(e.alternate, e));
        break;
      default:
        Be(t, e, n, l);
    }
  }
  function Jl(t, e, n, l, i) {
    for (i = i && ((e.subtreeFlags & 10256) !== 0 || !1), e = e.child; e !== null; ) {
      var c = t,
        f = e,
        y = n,
        E = l,
        w = f.flags;
      switch (f.tag) {
        case 0:
        case 11:
        case 15:
          (Jl(c, f, y, E, i), Qa(8, f));
          break;
        case 23:
          break;
        case 22:
          var H = f.stateNode;
          (f.memoizedState !== null
            ? H._visibility & 2
              ? Jl(c, f, y, E, i)
              : Ka(c, f)
            : ((H._visibility |= 2), Jl(c, f, y, E, i)),
            i && w & 2048 && Do(f.alternate, f));
          break;
        case 24:
          (Jl(c, f, y, E, i), i && w & 2048 && Uo(f.alternate, f));
          break;
        default:
          Jl(c, f, y, E, i);
      }
      e = e.sibling;
    }
  }
  function Ka(t, e) {
    if (e.subtreeFlags & 10256)
      for (e = e.child; e !== null; ) {
        var n = t,
          l = e,
          i = l.flags;
        switch (l.tag) {
          case 22:
            (Ka(n, l), i & 2048 && Do(l.alternate, l));
            break;
          case 24:
            (Ka(n, l), i & 2048 && Uo(l.alternate, l));
            break;
          default:
            Ka(n, l);
        }
        e = e.sibling;
      }
  }
  var Ja = 8192;
  function $l(t, e, n) {
    if (t.subtreeFlags & Ja) for (t = t.child; t !== null; ) ($d(t, e, n), (t = t.sibling));
  }
  function $d(t, e, n) {
    switch (t.tag) {
      case 26:
        ($l(t, e, n),
          t.flags & Ja && t.memoizedState !== null && wg(n, He, t.memoizedState, t.memoizedProps));
        break;
      case 5:
        $l(t, e, n);
        break;
      case 3:
      case 4:
        var l = He;
        ((He = Eu(t.stateNode.containerInfo)), $l(t, e, n), (He = l));
        break;
      case 22:
        t.memoizedState === null &&
          ((l = t.alternate),
          l !== null && l.memoizedState !== null
            ? ((l = Ja), (Ja = 16777216), $l(t, e, n), (Ja = l))
            : $l(t, e, n));
        break;
      default:
        $l(t, e, n);
    }
  }
  function kd(t) {
    var e = t.alternate;
    if (e !== null && ((t = e.child), t !== null)) {
      e.child = null;
      do ((e = t.sibling), (t.sibling = null), (t = e));
      while (t !== null);
    }
  }
  function $a(t) {
    var e = t.deletions;
    if ((t.flags & 16) !== 0) {
      if (e !== null)
        for (var n = 0; n < e.length; n++) {
          var l = e[n];
          (($t = l), Fd(l, t));
        }
      kd(t);
    }
    if (t.subtreeFlags & 10256) for (t = t.child; t !== null; ) (Wd(t), (t = t.sibling));
  }
  function Wd(t) {
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        ($a(t), t.flags & 2048 && Dn(9, t, t.return));
        break;
      case 3:
        $a(t);
        break;
      case 12:
        $a(t);
        break;
      case 22:
        var e = t.stateNode;
        t.memoizedState !== null && e._visibility & 2 && (t.return === null || t.return.tag !== 13)
          ? ((e._visibility &= -3), ru(t))
          : $a(t);
        break;
      default:
        $a(t);
    }
  }
  function ru(t) {
    var e = t.deletions;
    if ((t.flags & 16) !== 0) {
      if (e !== null)
        for (var n = 0; n < e.length; n++) {
          var l = e[n];
          (($t = l), Fd(l, t));
        }
      kd(t);
    }
    for (t = t.child; t !== null; ) {
      switch (((e = t), e.tag)) {
        case 0:
        case 11:
        case 15:
          (Dn(8, e, e.return), ru(e));
          break;
        case 22:
          ((n = e.stateNode), n._visibility & 2 && ((n._visibility &= -3), ru(e)));
          break;
        default:
          ru(e);
      }
      t = t.sibling;
    }
  }
  function Fd(t, e) {
    for (; $t !== null; ) {
      var n = $t;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          Dn(8, n, e);
          break;
        case 23:
        case 22:
          if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
            var l = n.memoizedState.cachePool.pool;
            l != null && l.refCount++;
          }
          break;
        case 24:
          za(n.memoizedState.cache);
      }
      if (((l = n.child), l !== null)) ((l.return = n), ($t = l));
      else
        t: for (n = t; $t !== null; ) {
          l = $t;
          var i = l.sibling,
            c = l.return;
          if ((Yd(l), l === n)) {
            $t = null;
            break t;
          }
          if (i !== null) {
            ((i.return = c), ($t = i));
            break t;
          }
          $t = c;
        }
    }
  }
  var Xv = {
      getCacheForType: function (t) {
        var e = It(Yt),
          n = e.data.get(t);
        return (n === void 0 && ((n = t()), e.data.set(t, n)), n);
      },
      cacheSignal: function () {
        return It(Yt).controller.signal;
      },
    },
    Qv = typeof WeakMap == "function" ? WeakMap : Map,
    Tt = 0,
    zt = null,
    dt = null,
    yt = 0,
    Nt = 0,
    be = null,
    Un = !1,
    kl = !1,
    Ho = !1,
    mn = 0,
    Lt = 0,
    Hn = 0,
    gl = 0,
    Bo = 0,
    xe = 0,
    Wl = 0,
    ka = null,
    se = null,
    Lo = !1,
    su = 0,
    Pd = 0,
    fu = 1 / 0,
    du = null,
    Bn = null,
    Zt = 0,
    Ln = null,
    Fl = null,
    hn = 0,
    qo = 0,
    Vo = null,
    Id = null,
    Wa = 0,
    Yo = null;
  function Se() {
    return (Tt & 2) !== 0 && yt !== 0 ? yt & -yt : _.T !== null ? Jo() : hs();
  }
  function tm() {
    if (xe === 0)
      if ((yt & 536870912) === 0 || gt) {
        var t = xi;
        ((xi <<= 1), (xi & 3932160) === 0 && (xi = 262144), (xe = t));
      } else xe = 536870912;
    return ((t = ve.current), t !== null && (t.flags |= 32), xe);
  }
  function fe(t, e, n) {
    (((t === zt && (Nt === 2 || Nt === 9)) || t.cancelPendingCommit !== null) &&
      (Pl(t, 0), qn(t, yt, xe, !1)),
      va(t, n),
      ((Tt & 2) === 0 || t !== zt) &&
        (t === zt && ((Tt & 2) === 0 && (gl |= n), Lt === 4 && qn(t, yt, xe, !1)), Ze(t)));
  }
  function em(t, e, n) {
    if ((Tt & 6) !== 0) throw Error(o(327));
    var l = (!n && (e & 127) === 0 && (e & t.expiredLanes) === 0) || ya(t, e),
      i = l ? Jv(t, e) : Xo(t, e, !0),
      c = l;
    do {
      if (i === 0) {
        kl && !l && qn(t, e, 0, !1);
        break;
      } else {
        if (((n = t.current.alternate), c && !Zv(n))) {
          ((i = Xo(t, e, !1)), (c = !1));
          continue;
        }
        if (i === 2) {
          if (((c = e), t.errorRecoveryDisabledLanes & c)) var f = 0;
          else
            ((f = t.pendingLanes & -536870913), (f = f !== 0 ? f : f & 536870912 ? 536870912 : 0));
          if (f !== 0) {
            e = f;
            t: {
              var y = t;
              i = ka;
              var E = y.current.memoizedState.isDehydrated;
              if ((E && (Pl(y, f).flags |= 256), (f = Xo(y, f, !1)), f !== 2)) {
                if (Ho && !E) {
                  ((y.errorRecoveryDisabledLanes |= c), (gl |= c), (i = 4));
                  break t;
                }
                ((c = se), (se = i), c !== null && (se === null ? (se = c) : se.push.apply(se, c)));
              }
              i = f;
            }
            if (((c = !1), i !== 2)) continue;
          }
        }
        if (i === 1) {
          (Pl(t, 0), qn(t, e, 0, !0));
          break;
        }
        t: {
          switch (((l = t), (c = i), c)) {
            case 0:
            case 1:
              throw Error(o(345));
            case 4:
              if ((e & 4194048) !== e) break;
            case 6:
              qn(l, e, xe, !Un);
              break t;
            case 2:
              se = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(o(329));
          }
          if ((e & 62914560) === e && ((i = su + 300 - de()), 10 < i)) {
            if ((qn(l, e, xe, !Un), Ei(l, 0, !0) !== 0)) break t;
            ((hn = e),
              (l.timeoutHandle = jm(
                nm.bind(null, l, n, se, du, Lo, e, xe, gl, Wl, Un, c, "Throttled", -0, 0),
                i,
              )));
            break t;
          }
          nm(l, n, se, du, Lo, e, xe, gl, Wl, Un, c, null, -0, 0);
        }
      }
      break;
    } while (!0);
    Ze(t);
  }
  function nm(t, e, n, l, i, c, f, y, E, w, H, L, R, j) {
    if (((t.timeoutHandle = -1), (L = e.subtreeFlags), L & 8192 || (L & 16785408) === 16785408)) {
      ((L = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: Pe,
      }),
        $d(e, c, L));
      var $ = (c & 62914560) === c ? su - de() : (c & 4194048) === c ? Pd - de() : 0;
      if ((($ = _g(L, $)), $ !== null)) {
        ((hn = c),
          (t.cancelPendingCommit = $(sm.bind(null, t, e, c, n, l, i, f, y, E, H, L, null, R, j))),
          qn(t, c, f, !w));
        return;
      }
    }
    sm(t, e, c, n, l, i, f, y, E);
  }
  function Zv(t) {
    for (var e = t; ; ) {
      var n = e.tag;
      if (
        (n === 0 || n === 11 || n === 15) &&
        e.flags & 16384 &&
        ((n = e.updateQueue), n !== null && ((n = n.stores), n !== null))
      )
        for (var l = 0; l < n.length; l++) {
          var i = n[l],
            c = i.getSnapshot;
          i = i.value;
          try {
            if (!pe(c(), i)) return !1;
          } catch {
            return !1;
          }
        }
      if (((n = e.child), e.subtreeFlags & 16384 && n !== null)) ((n.return = e), (e = n));
      else {
        if (e === t) break;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) return !0;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    }
    return !0;
  }
  function qn(t, e, n, l) {
    ((e &= ~Bo),
      (e &= ~gl),
      (t.suspendedLanes |= e),
      (t.pingedLanes &= ~e),
      l && (t.warmLanes |= e),
      (l = t.expirationTimes));
    for (var i = e; 0 < i; ) {
      var c = 31 - he(i),
        f = 1 << c;
      ((l[c] = -1), (i &= ~f));
    }
    n !== 0 && fs(t, n, e);
  }
  function mu() {
    return (Tt & 6) === 0 ? (Fa(0), !1) : !0;
  }
  function Go() {
    if (dt !== null) {
      if (Nt === 0) var t = dt.return;
      else ((t = dt), (nn = rl = null), lo(t), (Gl = null), (Ma = 0), (t = dt));
      for (; t !== null; ) (Md(t.alternate, t), (t = t.return));
      dt = null;
    }
  }
  function Pl(t, e) {
    var n = t.timeoutHandle;
    (n !== -1 && ((t.timeoutHandle = -1), fg(n)),
      (n = t.cancelPendingCommit),
      n !== null && ((t.cancelPendingCommit = null), n()),
      (hn = 0),
      Go(),
      (zt = t),
      (dt = n = tn(t.current, null)),
      (yt = e),
      (Nt = 0),
      (be = null),
      (Un = !1),
      (kl = ya(t, e)),
      (Ho = !1),
      (Wl = xe = Bo = gl = Hn = Lt = 0),
      (se = ka = null),
      (Lo = !1),
      (e & 8) !== 0 && (e |= e & 32));
    var l = t.entangledLanes;
    if (l !== 0)
      for (t = t.entanglements, l &= e; 0 < l; ) {
        var i = 31 - he(l),
          c = 1 << i;
        ((e |= t[i]), (l &= ~c));
      }
    return ((mn = e), Di(), n);
  }
  function lm(t, e) {
    ((ut = null),
      (_.H = Ya),
      e === Yl || e === Gi
        ? ((e = bf()), (Nt = 3))
        : e === Zc
          ? ((e = bf()), (Nt = 4))
          : (Nt =
              e === xo
                ? 8
                : e !== null && typeof e == "object" && typeof e.then == "function"
                  ? 6
                  : 1),
      (be = e),
      dt === null && ((Lt = 1), nu(t, Oe(e, t.current))));
  }
  function am() {
    var t = ve.current;
    return t === null
      ? !0
      : (yt & 4194048) === yt
        ? ze === null
        : (yt & 62914560) === yt || (yt & 536870912) !== 0
          ? t === ze
          : !1;
  }
  function im() {
    var t = _.H;
    return ((_.H = Ya), t === null ? Ya : t);
  }
  function um() {
    var t = _.A;
    return ((_.A = Xv), t);
  }
  function hu() {
    ((Lt = 4),
      Un || ((yt & 4194048) !== yt && ve.current !== null) || (kl = !0),
      ((Hn & 134217727) === 0 && (gl & 134217727) === 0) || zt === null || qn(zt, yt, xe, !1));
  }
  function Xo(t, e, n) {
    var l = Tt;
    Tt |= 2;
    var i = im(),
      c = um();
    ((zt !== t || yt !== e) && ((du = null), Pl(t, e)), (e = !1));
    var f = Lt;
    t: do
      try {
        if (Nt !== 0 && dt !== null) {
          var y = dt,
            E = be;
          switch (Nt) {
            case 8:
              (Go(), (f = 6));
              break t;
            case 3:
            case 2:
            case 9:
            case 6:
              ve.current === null && (e = !0);
              var w = Nt;
              if (((Nt = 0), (be = null), Il(t, y, E, w), n && kl)) {
                f = 0;
                break t;
              }
              break;
            default:
              ((w = Nt), (Nt = 0), (be = null), Il(t, y, E, w));
          }
        }
        (Kv(), (f = Lt));
        break;
      } catch (H) {
        lm(t, H);
      }
    while (!0);
    return (
      e && t.shellSuspendCounter++,
      (nn = rl = null),
      (Tt = l),
      (_.H = i),
      (_.A = c),
      dt === null && ((zt = null), (yt = 0), Di()),
      f
    );
  }
  function Kv() {
    for (; dt !== null; ) cm(dt);
  }
  function Jv(t, e) {
    var n = Tt;
    Tt |= 2;
    var l = im(),
      i = um();
    zt !== t || yt !== e ? ((du = null), (fu = de() + 500), Pl(t, e)) : (kl = ya(t, e));
    t: do
      try {
        if (Nt !== 0 && dt !== null) {
          e = dt;
          var c = be;
          e: switch (Nt) {
            case 1:
              ((Nt = 0), (be = null), Il(t, e, c, 1));
              break;
            case 2:
            case 9:
              if (vf(c)) {
                ((Nt = 0), (be = null), om(e));
                break;
              }
              ((e = function () {
                ((Nt !== 2 && Nt !== 9) || zt !== t || (Nt = 7), Ze(t));
              }),
                c.then(e, e));
              break t;
            case 3:
              Nt = 7;
              break t;
            case 4:
              Nt = 5;
              break t;
            case 7:
              vf(c) ? ((Nt = 0), (be = null), om(e)) : ((Nt = 0), (be = null), Il(t, e, c, 7));
              break;
            case 5:
              var f = null;
              switch (dt.tag) {
                case 26:
                  f = dt.memoizedState;
                case 5:
                case 27:
                  var y = dt;
                  if (f ? Jm(f) : y.stateNode.complete) {
                    ((Nt = 0), (be = null));
                    var E = y.sibling;
                    if (E !== null) dt = E;
                    else {
                      var w = y.return;
                      w !== null ? ((dt = w), pu(w)) : (dt = null);
                    }
                    break e;
                  }
              }
              ((Nt = 0), (be = null), Il(t, e, c, 5));
              break;
            case 6:
              ((Nt = 0), (be = null), Il(t, e, c, 6));
              break;
            case 8:
              (Go(), (Lt = 6));
              break t;
            default:
              throw Error(o(462));
          }
        }
        $v();
        break;
      } catch (H) {
        lm(t, H);
      }
    while (!0);
    return (
      (nn = rl = null),
      (_.H = l),
      (_.A = i),
      (Tt = n),
      dt !== null ? 0 : ((zt = null), (yt = 0), Di(), Lt)
    );
  }
  function $v() {
    for (; dt !== null && !vy(); ) cm(dt);
  }
  function cm(t) {
    var e = zd(t.alternate, t, mn);
    ((t.memoizedProps = t.pendingProps), e === null ? pu(t) : (dt = e));
  }
  function om(t) {
    var e = t,
      n = e.alternate;
    switch (e.tag) {
      case 15:
      case 0:
        e = Cd(n, e, e.pendingProps, e.type, void 0, yt);
        break;
      case 11:
        e = Cd(n, e, e.pendingProps, e.type.render, e.ref, yt);
        break;
      case 5:
        lo(e);
      default:
        (Md(n, e), (e = dt = uf(e, mn)), (e = zd(n, e, mn)));
    }
    ((t.memoizedProps = t.pendingProps), e === null ? pu(t) : (dt = e));
  }
  function Il(t, e, n, l) {
    ((nn = rl = null), lo(e), (Gl = null), (Ma = 0));
    var i = e.return;
    try {
      if (Hv(t, i, e, n, yt)) {
        ((Lt = 1), nu(t, Oe(n, t.current)), (dt = null));
        return;
      }
    } catch (c) {
      if (i !== null) throw ((dt = i), c);
      ((Lt = 1), nu(t, Oe(n, t.current)), (dt = null));
      return;
    }
    e.flags & 32768
      ? (gt || l === 1
          ? (t = !0)
          : kl || (yt & 536870912) !== 0
            ? (t = !1)
            : ((Un = t = !0),
              (l === 2 || l === 9 || l === 3 || l === 6) &&
                ((l = ve.current), l !== null && l.tag === 13 && (l.flags |= 16384))),
        rm(e, t))
      : pu(e);
  }
  function pu(t) {
    var e = t;
    do {
      if ((e.flags & 32768) !== 0) {
        rm(e, Un);
        return;
      }
      t = e.return;
      var n = qv(e.alternate, e, mn);
      if (n !== null) {
        dt = n;
        return;
      }
      if (((e = e.sibling), e !== null)) {
        dt = e;
        return;
      }
      dt = e = t;
    } while (e !== null);
    Lt === 0 && (Lt = 5);
  }
  function rm(t, e) {
    do {
      var n = Vv(t.alternate, t);
      if (n !== null) {
        ((n.flags &= 32767), (dt = n));
        return;
      }
      if (
        ((n = t.return),
        n !== null && ((n.flags |= 32768), (n.subtreeFlags = 0), (n.deletions = null)),
        !e && ((t = t.sibling), t !== null))
      ) {
        dt = t;
        return;
      }
      dt = t = n;
    } while (t !== null);
    ((Lt = 6), (dt = null));
  }
  function sm(t, e, n, l, i, c, f, y, E) {
    t.cancelPendingCommit = null;
    do yu();
    while (Zt !== 0);
    if ((Tt & 6) !== 0) throw Error(o(327));
    if (e !== null) {
      if (e === t.current) throw Error(o(177));
      if (
        ((c = e.lanes | e.childLanes),
        (c |= Rc),
        Oy(t, n, c, f, y, E),
        t === zt && ((dt = zt = null), (yt = 0)),
        (Fl = e),
        (Ln = t),
        (hn = n),
        (qo = c),
        (Vo = i),
        (Id = l),
        (e.subtreeFlags & 10256) !== 0 || (e.flags & 10256) !== 0
          ? ((t.callbackNode = null),
            (t.callbackPriority = 0),
            Pv(gi, function () {
              return (pm(), null);
            }))
          : ((t.callbackNode = null), (t.callbackPriority = 0)),
        (l = (e.flags & 13878) !== 0),
        (e.subtreeFlags & 13878) !== 0 || l)
      ) {
        ((l = _.T), (_.T = null), (i = G.p), (G.p = 2), (f = Tt), (Tt |= 4));
        try {
          Yv(t, e, n);
        } finally {
          ((Tt = f), (G.p = i), (_.T = l));
        }
      }
      ((Zt = 1), fm(), dm(), mm());
    }
  }
  function fm() {
    if (Zt === 1) {
      Zt = 0;
      var t = Ln,
        e = Fl,
        n = (e.flags & 13878) !== 0;
      if ((e.subtreeFlags & 13878) !== 0 || n) {
        ((n = _.T), (_.T = null));
        var l = G.p;
        G.p = 2;
        var i = Tt;
        Tt |= 4;
        try {
          Zd(e, t);
          var c = er,
            f = Ws(t.containerInfo),
            y = c.focusedElem,
            E = c.selectionRange;
          if (f !== y && y && y.ownerDocument && ks(y.ownerDocument.documentElement, y)) {
            if (E !== null && Cc(y)) {
              var w = E.start,
                H = E.end;
              if ((H === void 0 && (H = w), "selectionStart" in y))
                ((y.selectionStart = w), (y.selectionEnd = Math.min(H, y.value.length)));
              else {
                var L = y.ownerDocument || document,
                  R = (L && L.defaultView) || window;
                if (R.getSelection) {
                  var j = R.getSelection(),
                    $ = y.textContent.length,
                    lt = Math.min(E.start, $),
                    Rt = E.end === void 0 ? lt : Math.min(E.end, $);
                  !j.extend && lt > Rt && ((f = Rt), (Rt = lt), (lt = f));
                  var C = $s(y, lt),
                    T = $s(y, Rt);
                  if (
                    C &&
                    T &&
                    (j.rangeCount !== 1 ||
                      j.anchorNode !== C.node ||
                      j.anchorOffset !== C.offset ||
                      j.focusNode !== T.node ||
                      j.focusOffset !== T.offset)
                  ) {
                    var O = L.createRange();
                    (O.setStart(C.node, C.offset),
                      j.removeAllRanges(),
                      lt > Rt
                        ? (j.addRange(O), j.extend(T.node, T.offset))
                        : (O.setEnd(T.node, T.offset), j.addRange(O)));
                  }
                }
              }
            }
            for (L = [], j = y; (j = j.parentNode); )
              j.nodeType === 1 && L.push({ element: j, left: j.scrollLeft, top: j.scrollTop });
            for (typeof y.focus == "function" && y.focus(), y = 0; y < L.length; y++) {
              var B = L[y];
              ((B.element.scrollLeft = B.left), (B.element.scrollTop = B.top));
            }
          }
          ((wu = !!tr), (er = tr = null));
        } finally {
          ((Tt = i), (G.p = l), (_.T = n));
        }
      }
      ((t.current = e), (Zt = 2));
    }
  }
  function dm() {
    if (Zt === 2) {
      Zt = 0;
      var t = Ln,
        e = Fl,
        n = (e.flags & 8772) !== 0;
      if ((e.subtreeFlags & 8772) !== 0 || n) {
        ((n = _.T), (_.T = null));
        var l = G.p;
        G.p = 2;
        var i = Tt;
        Tt |= 4;
        try {
          Vd(t, e.alternate, e);
        } finally {
          ((Tt = i), (G.p = l), (_.T = n));
        }
      }
      Zt = 3;
    }
  }
  function mm() {
    if (Zt === 4 || Zt === 3) {
      ((Zt = 0), gy());
      var t = Ln,
        e = Fl,
        n = hn,
        l = Id;
      (e.subtreeFlags & 10256) !== 0 || (e.flags & 10256) !== 0
        ? (Zt = 5)
        : ((Zt = 0), (Fl = Ln = null), hm(t, t.pendingLanes));
      var i = t.pendingLanes;
      if (
        (i === 0 && (Bn = null),
        uc(n),
        (e = e.stateNode),
        me && typeof me.onCommitFiberRoot == "function")
      )
        try {
          me.onCommitFiberRoot(pa, e, void 0, (e.current.flags & 128) === 128);
        } catch {}
      if (l !== null) {
        ((e = _.T), (i = G.p), (G.p = 2), (_.T = null));
        try {
          for (var c = t.onRecoverableError, f = 0; f < l.length; f++) {
            var y = l[f];
            c(y.value, { componentStack: y.stack });
          }
        } finally {
          ((_.T = e), (G.p = i));
        }
      }
      ((hn & 3) !== 0 && yu(),
        Ze(t),
        (i = t.pendingLanes),
        (n & 261930) !== 0 && (i & 42) !== 0 ? (t === Yo ? Wa++ : ((Wa = 0), (Yo = t))) : (Wa = 0),
        Fa(0));
    }
  }
  function hm(t, e) {
    (t.pooledCacheLanes &= e) === 0 &&
      ((e = t.pooledCache), e != null && ((t.pooledCache = null), za(e)));
  }
  function yu() {
    return (fm(), dm(), mm(), pm());
  }
  function pm() {
    if (Zt !== 5) return !1;
    var t = Ln,
      e = qo;
    qo = 0;
    var n = uc(hn),
      l = _.T,
      i = G.p;
    try {
      ((G.p = 32 > n ? 32 : n), (_.T = null), (n = Vo), (Vo = null));
      var c = Ln,
        f = hn;
      if (((Zt = 0), (Fl = Ln = null), (hn = 0), (Tt & 6) !== 0)) throw Error(o(331));
      var y = Tt;
      if (
        ((Tt |= 4),
        Wd(c.current),
        Jd(c, c.current, f, n),
        (Tt = y),
        Fa(0, !1),
        me && typeof me.onPostCommitFiberRoot == "function")
      )
        try {
          me.onPostCommitFiberRoot(pa, c);
        } catch {}
      return !0;
    } finally {
      ((G.p = i), (_.T = l), hm(t, e));
    }
  }
  function ym(t, e, n) {
    ((e = Oe(n, e)),
      (e = bo(t.stateNode, e, 2)),
      (t = zn(t, e, 2)),
      t !== null && (va(t, 2), Ze(t)));
  }
  function Ot(t, e, n) {
    if (t.tag === 3) ym(t, t, n);
    else
      for (; e !== null; ) {
        if (e.tag === 3) {
          ym(e, t, n);
          break;
        } else if (e.tag === 1) {
          var l = e.stateNode;
          if (
            typeof e.type.getDerivedStateFromError == "function" ||
            (typeof l.componentDidCatch == "function" && (Bn === null || !Bn.has(l)))
          ) {
            ((t = Oe(n, t)),
              (n = vd(2)),
              (l = zn(e, n, 2)),
              l !== null && (gd(n, l, e, t), va(l, 2), Ze(l)));
            break;
          }
        }
        e = e.return;
      }
  }
  function Qo(t, e, n) {
    var l = t.pingCache;
    if (l === null) {
      l = t.pingCache = new Qv();
      var i = new Set();
      l.set(e, i);
    } else ((i = l.get(e)), i === void 0 && ((i = new Set()), l.set(e, i)));
    i.has(n) || ((Ho = !0), i.add(n), (t = kv.bind(null, t, e, n)), e.then(t, t));
  }
  function kv(t, e, n) {
    var l = t.pingCache;
    (l !== null && l.delete(e),
      (t.pingedLanes |= t.suspendedLanes & n),
      (t.warmLanes &= ~n),
      zt === t &&
        (yt & n) === n &&
        (Lt === 4 || (Lt === 3 && (yt & 62914560) === yt && 300 > de() - su)
          ? (Tt & 2) === 0 && Pl(t, 0)
          : (Bo |= n),
        Wl === yt && (Wl = 0)),
      Ze(t));
  }
  function vm(t, e) {
    (e === 0 && (e = ss()), (t = ul(t, e)), t !== null && (va(t, e), Ze(t)));
  }
  function Wv(t) {
    var e = t.memoizedState,
      n = 0;
    (e !== null && (n = e.retryLane), vm(t, n));
  }
  function Fv(t, e) {
    var n = 0;
    switch (t.tag) {
      case 31:
      case 13:
        var l = t.stateNode,
          i = t.memoizedState;
        i !== null && (n = i.retryLane);
        break;
      case 19:
        l = t.stateNode;
        break;
      case 22:
        l = t.stateNode._retryCache;
        break;
      default:
        throw Error(o(314));
    }
    (l !== null && l.delete(e), vm(t, n));
  }
  function Pv(t, e) {
    return nc(t, e);
  }
  var vu = null,
    ta = null,
    Zo = !1,
    gu = !1,
    Ko = !1,
    Vn = 0;
  function Ze(t) {
    (t !== ta && t.next === null && (ta === null ? (vu = ta = t) : (ta = ta.next = t)),
      (gu = !0),
      Zo || ((Zo = !0), tg()));
  }
  function Fa(t, e) {
    if (!Ko && gu) {
      Ko = !0;
      do
        for (var n = !1, l = vu; l !== null; ) {
          if (t !== 0) {
            var i = l.pendingLanes;
            if (i === 0) var c = 0;
            else {
              var f = l.suspendedLanes,
                y = l.pingedLanes;
              ((c = (1 << (31 - he(42 | t) + 1)) - 1),
                (c &= i & ~(f & ~y)),
                (c = c & 201326741 ? (c & 201326741) | 1 : c ? c | 2 : 0));
            }
            c !== 0 && ((n = !0), Sm(l, c));
          } else
            ((c = yt),
              (c = Ei(
                l,
                l === zt ? c : 0,
                l.cancelPendingCommit !== null || l.timeoutHandle !== -1,
              )),
              (c & 3) === 0 || ya(l, c) || ((n = !0), Sm(l, c)));
          l = l.next;
        }
      while (n);
      Ko = !1;
    }
  }
  function Iv() {
    gm();
  }
  function gm() {
    gu = Zo = !1;
    var t = 0;
    Vn !== 0 && sg() && (t = Vn);
    for (var e = de(), n = null, l = vu; l !== null; ) {
      var i = l.next,
        c = bm(l, e);
      (c === 0
        ? ((l.next = null), n === null ? (vu = i) : (n.next = i), i === null && (ta = n))
        : ((n = l), (t !== 0 || (c & 3) !== 0) && (gu = !0)),
        (l = i));
    }
    ((Zt !== 0 && Zt !== 5) || Fa(t), Vn !== 0 && (Vn = 0));
  }
  function bm(t, e) {
    for (
      var n = t.suspendedLanes,
        l = t.pingedLanes,
        i = t.expirationTimes,
        c = t.pendingLanes & -62914561;
      0 < c;
    ) {
      var f = 31 - he(c),
        y = 1 << f,
        E = i[f];
      (E === -1
        ? ((y & n) === 0 || (y & l) !== 0) && (i[f] = Ny(y, e))
        : E <= e && (t.expiredLanes |= y),
        (c &= ~y));
    }
    if (
      ((e = zt),
      (n = yt),
      (n = Ei(t, t === e ? n : 0, t.cancelPendingCommit !== null || t.timeoutHandle !== -1)),
      (l = t.callbackNode),
      n === 0 || (t === e && (Nt === 2 || Nt === 9)) || t.cancelPendingCommit !== null)
    )
      return (l !== null && l !== null && lc(l), (t.callbackNode = null), (t.callbackPriority = 0));
    if ((n & 3) === 0 || ya(t, n)) {
      if (((e = n & -n), e === t.callbackPriority)) return e;
      switch ((l !== null && lc(l), uc(n))) {
        case 2:
        case 8:
          n = os;
          break;
        case 32:
          n = gi;
          break;
        case 268435456:
          n = rs;
          break;
        default:
          n = gi;
      }
      return (
        (l = xm.bind(null, t)),
        (n = nc(n, l)),
        (t.callbackPriority = e),
        (t.callbackNode = n),
        e
      );
    }
    return (
      l !== null && l !== null && lc(l),
      (t.callbackPriority = 2),
      (t.callbackNode = null),
      2
    );
  }
  function xm(t, e) {
    if (Zt !== 0 && Zt !== 5) return ((t.callbackNode = null), (t.callbackPriority = 0), null);
    var n = t.callbackNode;
    if (yu() && t.callbackNode !== n) return null;
    var l = yt;
    return (
      (l = Ei(t, t === zt ? l : 0, t.cancelPendingCommit !== null || t.timeoutHandle !== -1)),
      l === 0
        ? null
        : (em(t, l, e),
          bm(t, de()),
          t.callbackNode != null && t.callbackNode === n ? xm.bind(null, t) : null)
    );
  }
  function Sm(t, e) {
    if (yu()) return null;
    em(t, e, !0);
  }
  function tg() {
    dg(function () {
      (Tt & 6) !== 0 ? nc(cs, Iv) : gm();
    });
  }
  function Jo() {
    if (Vn === 0) {
      var t = ql;
      (t === 0 && ((t = bi), (bi <<= 1), (bi & 261888) === 0 && (bi = 256)), (Vn = t));
    }
    return Vn;
  }
  function Em(t) {
    return t == null || typeof t == "symbol" || typeof t == "boolean"
      ? null
      : typeof t == "function"
        ? t
        : Ni("" + t);
  }
  function Am(t, e) {
    var n = e.ownerDocument.createElement("input");
    return (
      (n.name = e.name),
      (n.value = e.value),
      t.id && n.setAttribute("form", t.id),
      e.parentNode.insertBefore(n, e),
      (t = new FormData(t)),
      n.parentNode.removeChild(n),
      t
    );
  }
  function eg(t, e, n, l, i) {
    if (e === "submit" && n && n.stateNode === i) {
      var c = Em((i[ie] || null).action),
        f = l.submitter;
      f &&
        ((e = (e = f[ie] || null) ? Em(e.formAction) : f.getAttribute("formAction")),
        e !== null && ((c = e), (f = null)));
      var y = new Ri("action", "action", null, l, i);
      t.push({
        event: y,
        listeners: [
          {
            instance: null,
            listener: function () {
              if (l.defaultPrevented) {
                if (Vn !== 0) {
                  var E = f ? Am(i, f) : new FormData(i);
                  mo(n, { pending: !0, data: E, method: i.method, action: c }, null, E);
                }
              } else
                typeof c == "function" &&
                  (y.preventDefault(),
                  (E = f ? Am(i, f) : new FormData(i)),
                  mo(n, { pending: !0, data: E, method: i.method, action: c }, c, E));
            },
            currentTarget: i,
          },
        ],
      });
    }
  }
  for (var $o = 0; $o < _c.length; $o++) {
    var ko = _c[$o],
      ng = ko.toLowerCase(),
      lg = ko[0].toUpperCase() + ko.slice(1);
    Ue(ng, "on" + lg);
  }
  (Ue(Is, "onAnimationEnd"),
    Ue(tf, "onAnimationIteration"),
    Ue(ef, "onAnimationStart"),
    Ue("dblclick", "onDoubleClick"),
    Ue("focusin", "onFocus"),
    Ue("focusout", "onBlur"),
    Ue(bv, "onTransitionRun"),
    Ue(xv, "onTransitionStart"),
    Ue(Sv, "onTransitionCancel"),
    Ue(nf, "onTransitionEnd"),
    Cl("onMouseEnter", ["mouseout", "mouseover"]),
    Cl("onMouseLeave", ["mouseout", "mouseover"]),
    Cl("onPointerEnter", ["pointerout", "pointerover"]),
    Cl("onPointerLeave", ["pointerout", "pointerover"]),
    nl("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")),
    nl(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " ",
      ),
    ),
    nl("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    nl("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")),
    nl(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" "),
    ),
    nl(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
    ));
  var Pa =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " ",
      ),
    ag = new Set(
      "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Pa),
    );
  function Tm(t, e) {
    e = (e & 4) !== 0;
    for (var n = 0; n < t.length; n++) {
      var l = t[n],
        i = l.event;
      l = l.listeners;
      t: {
        var c = void 0;
        if (e)
          for (var f = l.length - 1; 0 <= f; f--) {
            var y = l[f],
              E = y.instance,
              w = y.currentTarget;
            if (((y = y.listener), E !== c && i.isPropagationStopped())) break t;
            ((c = y), (i.currentTarget = w));
            try {
              c(i);
            } catch (H) {
              Mi(H);
            }
            ((i.currentTarget = null), (c = E));
          }
        else
          for (f = 0; f < l.length; f++) {
            if (
              ((y = l[f]),
              (E = y.instance),
              (w = y.currentTarget),
              (y = y.listener),
              E !== c && i.isPropagationStopped())
            )
              break t;
            ((c = y), (i.currentTarget = w));
            try {
              c(i);
            } catch (H) {
              Mi(H);
            }
            ((i.currentTarget = null), (c = E));
          }
      }
    }
  }
  function mt(t, e) {
    var n = e[cc];
    n === void 0 && (n = e[cc] = new Set());
    var l = t + "__bubble";
    n.has(l) || (Cm(e, t, 2, !1), n.add(l));
  }
  function Wo(t, e, n) {
    var l = 0;
    (e && (l |= 4), Cm(n, t, l, e));
  }
  var bu = "_reactListening" + Math.random().toString(36).slice(2);
  function Fo(t) {
    if (!t[bu]) {
      ((t[bu] = !0),
        vs.forEach(function (n) {
          n !== "selectionchange" && (ag.has(n) || Wo(n, !1, t), Wo(n, !0, t));
        }));
      var e = t.nodeType === 9 ? t : t.ownerDocument;
      e === null || e[bu] || ((e[bu] = !0), Wo("selectionchange", !1, e));
    }
  }
  function Cm(t, e, n, l) {
    switch (th(e)) {
      case 2:
        var i = jg;
        break;
      case 8:
        i = Mg;
        break;
      default:
        i = dr;
    }
    ((n = i.bind(null, e, n, t)),
      (i = void 0),
      !yc || (e !== "touchstart" && e !== "touchmove" && e !== "wheel") || (i = !0),
      l
        ? i !== void 0
          ? t.addEventListener(e, n, { capture: !0, passive: i })
          : t.addEventListener(e, n, !0)
        : i !== void 0
          ? t.addEventListener(e, n, { passive: i })
          : t.addEventListener(e, n, !1));
  }
  function Po(t, e, n, l, i) {
    var c = l;
    if ((e & 1) === 0 && (e & 2) === 0 && l !== null)
      t: for (;;) {
        if (l === null) return;
        var f = l.tag;
        if (f === 3 || f === 4) {
          var y = l.stateNode.containerInfo;
          if (y === i) break;
          if (f === 4)
            for (f = l.return; f !== null; ) {
              var E = f.tag;
              if ((E === 3 || E === 4) && f.stateNode.containerInfo === i) return;
              f = f.return;
            }
          for (; y !== null; ) {
            if (((f = El(y)), f === null)) return;
            if (((E = f.tag), E === 5 || E === 6 || E === 26 || E === 27)) {
              l = c = f;
              continue t;
            }
            y = y.parentNode;
          }
        }
        l = l.return;
      }
    _s(function () {
      var w = c,
        H = hc(n),
        L = [];
      t: {
        var R = lf.get(t);
        if (R !== void 0) {
          var j = Ri,
            $ = t;
          switch (t) {
            case "keypress":
              if (wi(n) === 0) break t;
            case "keydown":
            case "keyup":
              j = Fy;
              break;
            case "focusin":
              (($ = "focus"), (j = xc));
              break;
            case "focusout":
              (($ = "blur"), (j = xc));
              break;
            case "beforeblur":
            case "afterblur":
              j = xc;
              break;
            case "click":
              if (n.button === 2) break t;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              j = js;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              j = qy;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              j = tv;
              break;
            case Is:
            case tf:
            case ef:
              j = Gy;
              break;
            case nf:
              j = nv;
              break;
            case "scroll":
            case "scrollend":
              j = By;
              break;
            case "wheel":
              j = av;
              break;
            case "copy":
            case "cut":
            case "paste":
              j = Qy;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              j = Ds;
              break;
            case "toggle":
            case "beforetoggle":
              j = uv;
          }
          var lt = (e & 4) !== 0,
            Rt = !lt && (t === "scroll" || t === "scrollend"),
            C = lt ? (R !== null ? R + "Capture" : null) : R;
          lt = [];
          for (var T = w, O; T !== null; ) {
            var B = T;
            if (
              ((O = B.stateNode),
              (B = B.tag),
              (B !== 5 && B !== 26 && B !== 27) ||
                O === null ||
                C === null ||
                ((B = xa(T, C)), B != null && lt.push(Ia(T, B, O))),
              Rt)
            )
              break;
            T = T.return;
          }
          0 < lt.length && ((R = new j(R, $, null, n, H)), L.push({ event: R, listeners: lt }));
        }
      }
      if ((e & 7) === 0) {
        t: {
          if (
            ((R = t === "mouseover" || t === "pointerover"),
            (j = t === "mouseout" || t === "pointerout"),
            R && n !== mc && ($ = n.relatedTarget || n.fromElement) && (El($) || $[Sl]))
          )
            break t;
          if (
            (j || R) &&
            ((R =
              H.window === H
                ? H
                : (R = H.ownerDocument)
                  ? R.defaultView || R.parentWindow
                  : window),
            j
              ? (($ = n.relatedTarget || n.toElement),
                (j = w),
                ($ = $ ? El($) : null),
                $ !== null &&
                  ((Rt = d($)), (lt = $.tag), $ !== Rt || (lt !== 5 && lt !== 27 && lt !== 6)) &&
                  ($ = null))
              : ((j = null), ($ = w)),
            j !== $)
          ) {
            if (
              ((lt = js),
              (B = "onMouseLeave"),
              (C = "onMouseEnter"),
              (T = "mouse"),
              (t === "pointerout" || t === "pointerover") &&
                ((lt = Ds), (B = "onPointerLeave"), (C = "onPointerEnter"), (T = "pointer")),
              (Rt = j == null ? R : ba(j)),
              (O = $ == null ? R : ba($)),
              (R = new lt(B, T + "leave", j, n, H)),
              (R.target = Rt),
              (R.relatedTarget = O),
              (B = null),
              El(H) === w &&
                ((lt = new lt(C, T + "enter", $, n, H)),
                (lt.target = O),
                (lt.relatedTarget = Rt),
                (B = lt)),
              (Rt = B),
              j && $)
            )
              e: {
                for (lt = ig, C = j, T = $, O = 0, B = C; B; B = lt(B)) O++;
                B = 0;
                for (var tt = T; tt; tt = lt(tt)) B++;
                for (; 0 < O - B; ) ((C = lt(C)), O--);
                for (; 0 < B - O; ) ((T = lt(T)), B--);
                for (; O--; ) {
                  if (C === T || (T !== null && C === T.alternate)) {
                    lt = C;
                    break e;
                  }
                  ((C = lt(C)), (T = lt(T)));
                }
                lt = null;
              }
            else lt = null;
            (j !== null && Nm(L, R, j, lt, !1), $ !== null && Rt !== null && Nm(L, Rt, $, lt, !0));
          }
        }
        t: {
          if (
            ((R = w ? ba(w) : window),
            (j = R.nodeName && R.nodeName.toLowerCase()),
            j === "select" || (j === "input" && R.type === "file"))
          )
            var Et = Gs;
          else if (Vs(R))
            if (Xs) Et = yv;
            else {
              Et = hv;
              var P = mv;
            }
          else
            ((j = R.nodeName),
              !j || j.toLowerCase() !== "input" || (R.type !== "checkbox" && R.type !== "radio")
                ? w && dc(w.elementType) && (Et = Gs)
                : (Et = pv));
          if (Et && (Et = Et(t, w))) {
            Ys(L, Et, n, H);
            break t;
          }
          (P && P(t, R, w),
            t === "focusout" &&
              w &&
              R.type === "number" &&
              w.memoizedProps.value != null &&
              fc(R, "number", R.value));
        }
        switch (((P = w ? ba(w) : window), t)) {
          case "focusin":
            (Vs(P) || P.contentEditable === "true") && ((zl = P), (Nc = w), (wa = null));
            break;
          case "focusout":
            wa = Nc = zl = null;
            break;
          case "mousedown":
            Oc = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            ((Oc = !1), Fs(L, n, H));
            break;
          case "selectionchange":
            if (gv) break;
          case "keydown":
          case "keyup":
            Fs(L, n, H);
        }
        var ot;
        if (Ec)
          t: {
            switch (t) {
              case "compositionstart":
                var vt = "onCompositionStart";
                break t;
              case "compositionend":
                vt = "onCompositionEnd";
                break t;
              case "compositionupdate":
                vt = "onCompositionUpdate";
                break t;
            }
            vt = void 0;
          }
        else
          Rl
            ? Ls(t, n) && (vt = "onCompositionEnd")
            : t === "keydown" && n.keyCode === 229 && (vt = "onCompositionStart");
        (vt &&
          (Us &&
            n.locale !== "ko" &&
            (Rl || vt !== "onCompositionStart"
              ? vt === "onCompositionEnd" && Rl && (ot = Rs())
              : ((Tn = H), (vc = "value" in Tn ? Tn.value : Tn.textContent), (Rl = !0))),
          (P = xu(w, vt)),
          0 < P.length &&
            ((vt = new Ms(vt, t, null, n, H)),
            L.push({ event: vt, listeners: P }),
            ot ? (vt.data = ot) : ((ot = qs(n)), ot !== null && (vt.data = ot)))),
          (ot = ov ? rv(t, n) : sv(t, n)) &&
            ((vt = xu(w, "onBeforeInput")),
            0 < vt.length &&
              ((P = new Ms("onBeforeInput", "beforeinput", null, n, H)),
              L.push({ event: P, listeners: vt }),
              (P.data = ot))),
          eg(L, t, w, n, H));
      }
      Tm(L, e);
    });
  }
  function Ia(t, e, n) {
    return { instance: t, listener: e, currentTarget: n };
  }
  function xu(t, e) {
    for (var n = e + "Capture", l = []; t !== null; ) {
      var i = t,
        c = i.stateNode;
      if (
        ((i = i.tag),
        (i !== 5 && i !== 26 && i !== 27) ||
          c === null ||
          ((i = xa(t, n)),
          i != null && l.unshift(Ia(t, i, c)),
          (i = xa(t, e)),
          i != null && l.push(Ia(t, i, c))),
        t.tag === 3)
      )
        return l;
      t = t.return;
    }
    return [];
  }
  function ig(t) {
    if (t === null) return null;
    do t = t.return;
    while (t && t.tag !== 5 && t.tag !== 27);
    return t || null;
  }
  function Nm(t, e, n, l, i) {
    for (var c = e._reactName, f = []; n !== null && n !== l; ) {
      var y = n,
        E = y.alternate,
        w = y.stateNode;
      if (((y = y.tag), E !== null && E === l)) break;
      ((y !== 5 && y !== 26 && y !== 27) ||
        w === null ||
        ((E = w),
        i
          ? ((w = xa(n, c)), w != null && f.unshift(Ia(n, w, E)))
          : i || ((w = xa(n, c)), w != null && f.push(Ia(n, w, E)))),
        (n = n.return));
    }
    f.length !== 0 && t.push({ event: e, listeners: f });
  }
  var ug = /\r\n?/g,
    cg = /\u0000|\uFFFD/g;
  function Om(t) {
    return (typeof t == "string" ? t : "" + t)
      .replace(
        ug,
        `
`,
      )
      .replace(cg, "");
  }
  function wm(t, e) {
    return ((e = Om(e)), Om(t) === e);
  }
  function _t(t, e, n, l, i, c) {
    switch (n) {
      case "children":
        typeof l == "string"
          ? e === "body" || (e === "textarea" && l === "") || Ol(t, l)
          : (typeof l == "number" || typeof l == "bigint") && e !== "body" && Ol(t, "" + l);
        break;
      case "className":
        Ti(t, "class", l);
        break;
      case "tabIndex":
        Ti(t, "tabindex", l);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Ti(t, n, l);
        break;
      case "style":
        Os(t, l, c);
        break;
      case "data":
        if (e !== "object") {
          Ti(t, "data", l);
          break;
        }
      case "src":
      case "href":
        if (l === "" && (e !== "a" || n !== "href")) {
          t.removeAttribute(n);
          break;
        }
        if (l == null || typeof l == "function" || typeof l == "symbol" || typeof l == "boolean") {
          t.removeAttribute(n);
          break;
        }
        ((l = Ni("" + l)), t.setAttribute(n, l));
        break;
      case "action":
      case "formAction":
        if (typeof l == "function") {
          t.setAttribute(
            n,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')",
          );
          break;
        } else
          typeof c == "function" &&
            (n === "formAction"
              ? (e !== "input" && _t(t, e, "name", i.name, i, null),
                _t(t, e, "formEncType", i.formEncType, i, null),
                _t(t, e, "formMethod", i.formMethod, i, null),
                _t(t, e, "formTarget", i.formTarget, i, null))
              : (_t(t, e, "encType", i.encType, i, null),
                _t(t, e, "method", i.method, i, null),
                _t(t, e, "target", i.target, i, null)));
        if (l == null || typeof l == "symbol" || typeof l == "boolean") {
          t.removeAttribute(n);
          break;
        }
        ((l = Ni("" + l)), t.setAttribute(n, l));
        break;
      case "onClick":
        l != null && (t.onclick = Pe);
        break;
      case "onScroll":
        l != null && mt("scroll", t);
        break;
      case "onScrollEnd":
        l != null && mt("scrollend", t);
        break;
      case "dangerouslySetInnerHTML":
        if (l != null) {
          if (typeof l != "object" || !("__html" in l)) throw Error(o(61));
          if (((n = l.__html), n != null)) {
            if (i.children != null) throw Error(o(60));
            t.innerHTML = n;
          }
        }
        break;
      case "multiple":
        t.multiple = l && typeof l != "function" && typeof l != "symbol";
        break;
      case "muted":
        t.muted = l && typeof l != "function" && typeof l != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (l == null || typeof l == "function" || typeof l == "boolean" || typeof l == "symbol") {
          t.removeAttribute("xlink:href");
          break;
        }
        ((n = Ni("" + l)), t.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n));
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        l != null && typeof l != "function" && typeof l != "symbol"
          ? t.setAttribute(n, "" + l)
          : t.removeAttribute(n);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        l && typeof l != "function" && typeof l != "symbol"
          ? t.setAttribute(n, "")
          : t.removeAttribute(n);
        break;
      case "capture":
      case "download":
        l === !0
          ? t.setAttribute(n, "")
          : l !== !1 && l != null && typeof l != "function" && typeof l != "symbol"
            ? t.setAttribute(n, l)
            : t.removeAttribute(n);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        l != null && typeof l != "function" && typeof l != "symbol" && !isNaN(l) && 1 <= l
          ? t.setAttribute(n, l)
          : t.removeAttribute(n);
        break;
      case "rowSpan":
      case "start":
        l == null || typeof l == "function" || typeof l == "symbol" || isNaN(l)
          ? t.removeAttribute(n)
          : t.setAttribute(n, l);
        break;
      case "popover":
        (mt("beforetoggle", t), mt("toggle", t), Ai(t, "popover", l));
        break;
      case "xlinkActuate":
        Fe(t, "http://www.w3.org/1999/xlink", "xlink:actuate", l);
        break;
      case "xlinkArcrole":
        Fe(t, "http://www.w3.org/1999/xlink", "xlink:arcrole", l);
        break;
      case "xlinkRole":
        Fe(t, "http://www.w3.org/1999/xlink", "xlink:role", l);
        break;
      case "xlinkShow":
        Fe(t, "http://www.w3.org/1999/xlink", "xlink:show", l);
        break;
      case "xlinkTitle":
        Fe(t, "http://www.w3.org/1999/xlink", "xlink:title", l);
        break;
      case "xlinkType":
        Fe(t, "http://www.w3.org/1999/xlink", "xlink:type", l);
        break;
      case "xmlBase":
        Fe(t, "http://www.w3.org/XML/1998/namespace", "xml:base", l);
        break;
      case "xmlLang":
        Fe(t, "http://www.w3.org/XML/1998/namespace", "xml:lang", l);
        break;
      case "xmlSpace":
        Fe(t, "http://www.w3.org/XML/1998/namespace", "xml:space", l);
        break;
      case "is":
        Ai(t, "is", l);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < n.length) || (n[0] !== "o" && n[0] !== "O") || (n[1] !== "n" && n[1] !== "N")) &&
          ((n = Uy.get(n) || n), Ai(t, n, l));
    }
  }
  function Io(t, e, n, l, i, c) {
    switch (n) {
      case "style":
        Os(t, l, c);
        break;
      case "dangerouslySetInnerHTML":
        if (l != null) {
          if (typeof l != "object" || !("__html" in l)) throw Error(o(61));
          if (((n = l.__html), n != null)) {
            if (i.children != null) throw Error(o(60));
            t.innerHTML = n;
          }
        }
        break;
      case "children":
        typeof l == "string"
          ? Ol(t, l)
          : (typeof l == "number" || typeof l == "bigint") && Ol(t, "" + l);
        break;
      case "onScroll":
        l != null && mt("scroll", t);
        break;
      case "onScrollEnd":
        l != null && mt("scrollend", t);
        break;
      case "onClick":
        l != null && (t.onclick = Pe);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!gs.hasOwnProperty(n))
          t: {
            if (
              n[0] === "o" &&
              n[1] === "n" &&
              ((i = n.endsWith("Capture")),
              (e = n.slice(2, i ? n.length - 7 : void 0)),
              (c = t[ie] || null),
              (c = c != null ? c[n] : null),
              typeof c == "function" && t.removeEventListener(e, c, i),
              typeof l == "function")
            ) {
              (typeof c != "function" &&
                c !== null &&
                (n in t ? (t[n] = null) : t.hasAttribute(n) && t.removeAttribute(n)),
                t.addEventListener(e, l, i));
              break t;
            }
            n in t ? (t[n] = l) : l === !0 ? t.setAttribute(n, "") : Ai(t, n, l);
          }
    }
  }
  function ee(t, e, n) {
    switch (e) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        (mt("error", t), mt("load", t));
        var l = !1,
          i = !1,
          c;
        for (c in n)
          if (n.hasOwnProperty(c)) {
            var f = n[c];
            if (f != null)
              switch (c) {
                case "src":
                  l = !0;
                  break;
                case "srcSet":
                  i = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(o(137, e));
                default:
                  _t(t, e, c, f, n, null);
              }
          }
        (i && _t(t, e, "srcSet", n.srcSet, n, null), l && _t(t, e, "src", n.src, n, null));
        return;
      case "input":
        mt("invalid", t);
        var y = (c = f = i = null),
          E = null,
          w = null;
        for (l in n)
          if (n.hasOwnProperty(l)) {
            var H = n[l];
            if (H != null)
              switch (l) {
                case "name":
                  i = H;
                  break;
                case "type":
                  f = H;
                  break;
                case "checked":
                  E = H;
                  break;
                case "defaultChecked":
                  w = H;
                  break;
                case "value":
                  c = H;
                  break;
                case "defaultValue":
                  y = H;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (H != null) throw Error(o(137, e));
                  break;
                default:
                  _t(t, e, l, H, n, null);
              }
          }
        As(t, c, y, E, w, f, i, !1);
        return;
      case "select":
        (mt("invalid", t), (l = f = c = null));
        for (i in n)
          if (n.hasOwnProperty(i) && ((y = n[i]), y != null))
            switch (i) {
              case "value":
                c = y;
                break;
              case "defaultValue":
                f = y;
                break;
              case "multiple":
                l = y;
              default:
                _t(t, e, i, y, n, null);
            }
        ((e = c),
          (n = f),
          (t.multiple = !!l),
          e != null ? Nl(t, !!l, e, !1) : n != null && Nl(t, !!l, n, !0));
        return;
      case "textarea":
        (mt("invalid", t), (c = i = l = null));
        for (f in n)
          if (n.hasOwnProperty(f) && ((y = n[f]), y != null))
            switch (f) {
              case "value":
                l = y;
                break;
              case "defaultValue":
                i = y;
                break;
              case "children":
                c = y;
                break;
              case "dangerouslySetInnerHTML":
                if (y != null) throw Error(o(91));
                break;
              default:
                _t(t, e, f, y, n, null);
            }
        Cs(t, l, i, c);
        return;
      case "option":
        for (E in n)
          if (n.hasOwnProperty(E) && ((l = n[E]), l != null))
            switch (E) {
              case "selected":
                t.selected = l && typeof l != "function" && typeof l != "symbol";
                break;
              default:
                _t(t, e, E, l, n, null);
            }
        return;
      case "dialog":
        (mt("beforetoggle", t), mt("toggle", t), mt("cancel", t), mt("close", t));
        break;
      case "iframe":
      case "object":
        mt("load", t);
        break;
      case "video":
      case "audio":
        for (l = 0; l < Pa.length; l++) mt(Pa[l], t);
        break;
      case "image":
        (mt("error", t), mt("load", t));
        break;
      case "details":
        mt("toggle", t);
        break;
      case "embed":
      case "source":
      case "link":
        (mt("error", t), mt("load", t));
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (w in n)
          if (n.hasOwnProperty(w) && ((l = n[w]), l != null))
            switch (w) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(o(137, e));
              default:
                _t(t, e, w, l, n, null);
            }
        return;
      default:
        if (dc(e)) {
          for (H in n)
            n.hasOwnProperty(H) && ((l = n[H]), l !== void 0 && Io(t, e, H, l, n, void 0));
          return;
        }
    }
    for (y in n) n.hasOwnProperty(y) && ((l = n[y]), l != null && _t(t, e, y, l, n, null));
  }
  function og(t, e, n, l) {
    switch (e) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var i = null,
          c = null,
          f = null,
          y = null,
          E = null,
          w = null,
          H = null;
        for (j in n) {
          var L = n[j];
          if (n.hasOwnProperty(j) && L != null)
            switch (j) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                E = L;
              default:
                l.hasOwnProperty(j) || _t(t, e, j, null, l, L);
            }
        }
        for (var R in l) {
          var j = l[R];
          if (((L = n[R]), l.hasOwnProperty(R) && (j != null || L != null)))
            switch (R) {
              case "type":
                c = j;
                break;
              case "name":
                i = j;
                break;
              case "checked":
                w = j;
                break;
              case "defaultChecked":
                H = j;
                break;
              case "value":
                f = j;
                break;
              case "defaultValue":
                y = j;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (j != null) throw Error(o(137, e));
                break;
              default:
                j !== L && _t(t, e, R, j, l, L);
            }
        }
        sc(t, f, y, E, w, H, c, i);
        return;
      case "select":
        j = f = y = R = null;
        for (c in n)
          if (((E = n[c]), n.hasOwnProperty(c) && E != null))
            switch (c) {
              case "value":
                break;
              case "multiple":
                j = E;
              default:
                l.hasOwnProperty(c) || _t(t, e, c, null, l, E);
            }
        for (i in l)
          if (((c = l[i]), (E = n[i]), l.hasOwnProperty(i) && (c != null || E != null)))
            switch (i) {
              case "value":
                R = c;
                break;
              case "defaultValue":
                y = c;
                break;
              case "multiple":
                f = c;
              default:
                c !== E && _t(t, e, i, c, l, E);
            }
        ((e = y),
          (n = f),
          (l = j),
          R != null
            ? Nl(t, !!n, R, !1)
            : !!l != !!n && (e != null ? Nl(t, !!n, e, !0) : Nl(t, !!n, n ? [] : "", !1)));
        return;
      case "textarea":
        j = R = null;
        for (y in n)
          if (((i = n[y]), n.hasOwnProperty(y) && i != null && !l.hasOwnProperty(y)))
            switch (y) {
              case "value":
                break;
              case "children":
                break;
              default:
                _t(t, e, y, null, l, i);
            }
        for (f in l)
          if (((i = l[f]), (c = n[f]), l.hasOwnProperty(f) && (i != null || c != null)))
            switch (f) {
              case "value":
                R = i;
                break;
              case "defaultValue":
                j = i;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (i != null) throw Error(o(91));
                break;
              default:
                i !== c && _t(t, e, f, i, l, c);
            }
        Ts(t, R, j);
        return;
      case "option":
        for (var $ in n)
          if (((R = n[$]), n.hasOwnProperty($) && R != null && !l.hasOwnProperty($)))
            switch ($) {
              case "selected":
                t.selected = !1;
                break;
              default:
                _t(t, e, $, null, l, R);
            }
        for (E in l)
          if (((R = l[E]), (j = n[E]), l.hasOwnProperty(E) && R !== j && (R != null || j != null)))
            switch (E) {
              case "selected":
                t.selected = R && typeof R != "function" && typeof R != "symbol";
                break;
              default:
                _t(t, e, E, R, l, j);
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var lt in n)
          ((R = n[lt]),
            n.hasOwnProperty(lt) && R != null && !l.hasOwnProperty(lt) && _t(t, e, lt, null, l, R));
        for (w in l)
          if (((R = l[w]), (j = n[w]), l.hasOwnProperty(w) && R !== j && (R != null || j != null)))
            switch (w) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (R != null) throw Error(o(137, e));
                break;
              default:
                _t(t, e, w, R, l, j);
            }
        return;
      default:
        if (dc(e)) {
          for (var Rt in n)
            ((R = n[Rt]),
              n.hasOwnProperty(Rt) &&
                R !== void 0 &&
                !l.hasOwnProperty(Rt) &&
                Io(t, e, Rt, void 0, l, R));
          for (H in l)
            ((R = l[H]),
              (j = n[H]),
              !l.hasOwnProperty(H) ||
                R === j ||
                (R === void 0 && j === void 0) ||
                Io(t, e, H, R, l, j));
          return;
        }
    }
    for (var C in n)
      ((R = n[C]),
        n.hasOwnProperty(C) && R != null && !l.hasOwnProperty(C) && _t(t, e, C, null, l, R));
    for (L in l)
      ((R = l[L]),
        (j = n[L]),
        !l.hasOwnProperty(L) || R === j || (R == null && j == null) || _t(t, e, L, R, l, j));
  }
  function _m(t) {
    switch (t) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function rg() {
    if (typeof performance.getEntriesByType == "function") {
      for (
        var t = 0, e = 0, n = performance.getEntriesByType("resource"), l = 0;
        l < n.length;
        l++
      ) {
        var i = n[l],
          c = i.transferSize,
          f = i.initiatorType,
          y = i.duration;
        if (c && y && _m(f)) {
          for (f = 0, y = i.responseEnd, l += 1; l < n.length; l++) {
            var E = n[l],
              w = E.startTime;
            if (w > y) break;
            var H = E.transferSize,
              L = E.initiatorType;
            H && _m(L) && ((E = E.responseEnd), (f += H * (E < y ? 1 : (y - w) / (E - w))));
          }
          if ((--l, (e += (8 * (c + f)) / (i.duration / 1e3)), t++, 10 < t)) break;
        }
      }
      if (0 < t) return e / t / 1e6;
    }
    return navigator.connection && ((t = navigator.connection.downlink), typeof t == "number")
      ? t
      : 5;
  }
  var tr = null,
    er = null;
  function Su(t) {
    return t.nodeType === 9 ? t : t.ownerDocument;
  }
  function Rm(t) {
    switch (t) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function zm(t, e) {
    if (t === 0)
      switch (e) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return t === 1 && e === "foreignObject" ? 0 : t;
  }
  function nr(t, e) {
    return (
      t === "textarea" ||
      t === "noscript" ||
      typeof e.children == "string" ||
      typeof e.children == "number" ||
      typeof e.children == "bigint" ||
      (typeof e.dangerouslySetInnerHTML == "object" &&
        e.dangerouslySetInnerHTML !== null &&
        e.dangerouslySetInnerHTML.__html != null)
    );
  }
  var lr = null;
  function sg() {
    var t = window.event;
    return t && t.type === "popstate" ? (t === lr ? !1 : ((lr = t), !0)) : ((lr = null), !1);
  }
  var jm = typeof setTimeout == "function" ? setTimeout : void 0,
    fg = typeof clearTimeout == "function" ? clearTimeout : void 0,
    Mm = typeof Promise == "function" ? Promise : void 0,
    dg =
      typeof queueMicrotask == "function"
        ? queueMicrotask
        : typeof Mm < "u"
          ? function (t) {
              return Mm.resolve(null).then(t).catch(mg);
            }
          : jm;
  function mg(t) {
    setTimeout(function () {
      throw t;
    });
  }
  function Yn(t) {
    return t === "head";
  }
  function Dm(t, e) {
    var n = e,
      l = 0;
    do {
      var i = n.nextSibling;
      if ((t.removeChild(n), i && i.nodeType === 8))
        if (((n = i.data), n === "/$" || n === "/&")) {
          if (l === 0) {
            (t.removeChild(i), aa(e));
            return;
          }
          l--;
        } else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") l++;
        else if (n === "html") ti(t.ownerDocument.documentElement);
        else if (n === "head") {
          ((n = t.ownerDocument.head), ti(n));
          for (var c = n.firstChild; c; ) {
            var f = c.nextSibling,
              y = c.nodeName;
            (c[ga] ||
              y === "SCRIPT" ||
              y === "STYLE" ||
              (y === "LINK" && c.rel.toLowerCase() === "stylesheet") ||
              n.removeChild(c),
              (c = f));
          }
        } else n === "body" && ti(t.ownerDocument.body);
      n = i;
    } while (n);
    aa(e);
  }
  function Um(t, e) {
    var n = t;
    t = 0;
    do {
      var l = n.nextSibling;
      if (
        (n.nodeType === 1
          ? e
            ? ((n._stashedDisplay = n.style.display), (n.style.display = "none"))
            : ((n.style.display = n._stashedDisplay || ""),
              n.getAttribute("style") === "" && n.removeAttribute("style"))
          : n.nodeType === 3 &&
            (e
              ? ((n._stashedText = n.nodeValue), (n.nodeValue = ""))
              : (n.nodeValue = n._stashedText || "")),
        l && l.nodeType === 8)
      )
        if (((n = l.data), n === "/$")) {
          if (t === 0) break;
          t--;
        } else (n !== "$" && n !== "$?" && n !== "$~" && n !== "$!") || t++;
      n = l;
    } while (n);
  }
  function ar(t) {
    var e = t.firstChild;
    for (e && e.nodeType === 10 && (e = e.nextSibling); e; ) {
      var n = e;
      switch (((e = e.nextSibling), n.nodeName)) {
        case "HTML":
        case "HEAD":
        case "BODY":
          (ar(n), oc(n));
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (n.rel.toLowerCase() === "stylesheet") continue;
      }
      t.removeChild(n);
    }
  }
  function hg(t, e, n, l) {
    for (; t.nodeType === 1; ) {
      var i = n;
      if (t.nodeName.toLowerCase() !== e.toLowerCase()) {
        if (!l && (t.nodeName !== "INPUT" || t.type !== "hidden")) break;
      } else if (l) {
        if (!t[ga])
          switch (e) {
            case "meta":
              if (!t.hasAttribute("itemprop")) break;
              return t;
            case "link":
              if (
                ((c = t.getAttribute("rel")),
                c === "stylesheet" && t.hasAttribute("data-precedence"))
              )
                break;
              if (
                c !== i.rel ||
                t.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) ||
                t.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) ||
                t.getAttribute("title") !== (i.title == null ? null : i.title)
              )
                break;
              return t;
            case "style":
              if (t.hasAttribute("data-precedence")) break;
              return t;
            case "script":
              if (
                ((c = t.getAttribute("src")),
                (c !== (i.src == null ? null : i.src) ||
                  t.getAttribute("type") !== (i.type == null ? null : i.type) ||
                  t.getAttribute("crossorigin") !==
                    (i.crossOrigin == null ? null : i.crossOrigin)) &&
                  c &&
                  t.hasAttribute("async") &&
                  !t.hasAttribute("itemprop"))
              )
                break;
              return t;
            default:
              return t;
          }
      } else if (e === "input" && t.type === "hidden") {
        var c = i.name == null ? null : "" + i.name;
        if (i.type === "hidden" && t.getAttribute("name") === c) return t;
      } else return t;
      if (((t = je(t.nextSibling)), t === null)) break;
    }
    return null;
  }
  function pg(t, e, n) {
    if (e === "") return null;
    for (; t.nodeType !== 3; )
      if (
        ((t.nodeType !== 1 || t.nodeName !== "INPUT" || t.type !== "hidden") && !n) ||
        ((t = je(t.nextSibling)), t === null)
      )
        return null;
    return t;
  }
  function Hm(t, e) {
    for (; t.nodeType !== 8; )
      if (
        ((t.nodeType !== 1 || t.nodeName !== "INPUT" || t.type !== "hidden") && !e) ||
        ((t = je(t.nextSibling)), t === null)
      )
        return null;
    return t;
  }
  function ir(t) {
    return t.data === "$?" || t.data === "$~";
  }
  function ur(t) {
    return t.data === "$!" || (t.data === "$?" && t.ownerDocument.readyState !== "loading");
  }
  function yg(t, e) {
    var n = t.ownerDocument;
    if (t.data === "$~") t._reactRetry = e;
    else if (t.data !== "$?" || n.readyState !== "loading") e();
    else {
      var l = function () {
        (e(), n.removeEventListener("DOMContentLoaded", l));
      };
      (n.addEventListener("DOMContentLoaded", l), (t._reactRetry = l));
    }
  }
  function je(t) {
    for (; t != null; t = t.nextSibling) {
      var e = t.nodeType;
      if (e === 1 || e === 3) break;
      if (e === 8) {
        if (
          ((e = t.data),
          e === "$" ||
            e === "$!" ||
            e === "$?" ||
            e === "$~" ||
            e === "&" ||
            e === "F!" ||
            e === "F")
        )
          break;
        if (e === "/$" || e === "/&") return null;
      }
    }
    return t;
  }
  var cr = null;
  function Bm(t) {
    t = t.nextSibling;
    for (var e = 0; t; ) {
      if (t.nodeType === 8) {
        var n = t.data;
        if (n === "/$" || n === "/&") {
          if (e === 0) return je(t.nextSibling);
          e--;
        } else (n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&") || e++;
      }
      t = t.nextSibling;
    }
    return null;
  }
  function Lm(t) {
    t = t.previousSibling;
    for (var e = 0; t; ) {
      if (t.nodeType === 8) {
        var n = t.data;
        if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
          if (e === 0) return t;
          e--;
        } else (n !== "/$" && n !== "/&") || e++;
      }
      t = t.previousSibling;
    }
    return null;
  }
  function qm(t, e, n) {
    switch (((e = Su(n)), t)) {
      case "html":
        if (((t = e.documentElement), !t)) throw Error(o(452));
        return t;
      case "head":
        if (((t = e.head), !t)) throw Error(o(453));
        return t;
      case "body":
        if (((t = e.body), !t)) throw Error(o(454));
        return t;
      default:
        throw Error(o(451));
    }
  }
  function ti(t) {
    for (var e = t.attributes; e.length; ) t.removeAttributeNode(e[0]);
    oc(t);
  }
  var Me = new Map(),
    Vm = new Set();
  function Eu(t) {
    return typeof t.getRootNode == "function"
      ? t.getRootNode()
      : t.nodeType === 9
        ? t
        : t.ownerDocument;
  }
  var pn = G.d;
  G.d = { f: vg, r: gg, D: bg, C: xg, L: Sg, m: Eg, X: Tg, S: Ag, M: Cg };
  function vg() {
    var t = pn.f(),
      e = mu();
    return t || e;
  }
  function gg(t) {
    var e = Al(t);
    e !== null && e.tag === 5 && e.type === "form" ? ld(e) : pn.r(t);
  }
  var ea = typeof document > "u" ? null : document;
  function Ym(t, e, n) {
    var l = ea;
    if (l && typeof e == "string" && e) {
      var i = Ce(e);
      ((i = 'link[rel="' + t + '"][href="' + i + '"]'),
        typeof n == "string" && (i += '[crossorigin="' + n + '"]'),
        Vm.has(i) ||
          (Vm.add(i),
          (t = { rel: t, crossOrigin: n, href: e }),
          l.querySelector(i) === null &&
            ((e = l.createElement("link")), ee(e, "link", t), Jt(e), l.head.appendChild(e))));
    }
  }
  function bg(t) {
    (pn.D(t), Ym("dns-prefetch", t, null));
  }
  function xg(t, e) {
    (pn.C(t, e), Ym("preconnect", t, e));
  }
  function Sg(t, e, n) {
    pn.L(t, e, n);
    var l = ea;
    if (l && t && e) {
      var i = 'link[rel="preload"][as="' + Ce(e) + '"]';
      e === "image" && n && n.imageSrcSet
        ? ((i += '[imagesrcset="' + Ce(n.imageSrcSet) + '"]'),
          typeof n.imageSizes == "string" && (i += '[imagesizes="' + Ce(n.imageSizes) + '"]'))
        : (i += '[href="' + Ce(t) + '"]');
      var c = i;
      switch (e) {
        case "style":
          c = na(t);
          break;
        case "script":
          c = la(t);
      }
      Me.has(c) ||
        ((t = x(
          { rel: "preload", href: e === "image" && n && n.imageSrcSet ? void 0 : t, as: e },
          n,
        )),
        Me.set(c, t),
        l.querySelector(i) !== null ||
          (e === "style" && l.querySelector(ei(c))) ||
          (e === "script" && l.querySelector(ni(c))) ||
          ((e = l.createElement("link")), ee(e, "link", t), Jt(e), l.head.appendChild(e)));
    }
  }
  function Eg(t, e) {
    pn.m(t, e);
    var n = ea;
    if (n && t) {
      var l = e && typeof e.as == "string" ? e.as : "script",
        i = 'link[rel="modulepreload"][as="' + Ce(l) + '"][href="' + Ce(t) + '"]',
        c = i;
      switch (l) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          c = la(t);
      }
      if (
        !Me.has(c) &&
        ((t = x({ rel: "modulepreload", href: t }, e)), Me.set(c, t), n.querySelector(i) === null)
      ) {
        switch (l) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (n.querySelector(ni(c))) return;
        }
        ((l = n.createElement("link")), ee(l, "link", t), Jt(l), n.head.appendChild(l));
      }
    }
  }
  function Ag(t, e, n) {
    pn.S(t, e, n);
    var l = ea;
    if (l && t) {
      var i = Tl(l).hoistableStyles,
        c = na(t);
      e = e || "default";
      var f = i.get(c);
      if (!f) {
        var y = { loading: 0, preload: null };
        if ((f = l.querySelector(ei(c)))) y.loading = 5;
        else {
          ((t = x({ rel: "stylesheet", href: t, "data-precedence": e }, n)),
            (n = Me.get(c)) && or(t, n));
          var E = (f = l.createElement("link"));
          (Jt(E),
            ee(E, "link", t),
            (E._p = new Promise(function (w, H) {
              ((E.onload = w), (E.onerror = H));
            })),
            E.addEventListener("load", function () {
              y.loading |= 1;
            }),
            E.addEventListener("error", function () {
              y.loading |= 2;
            }),
            (y.loading |= 4),
            Au(f, e, l));
        }
        ((f = { type: "stylesheet", instance: f, count: 1, state: y }), i.set(c, f));
      }
    }
  }
  function Tg(t, e) {
    pn.X(t, e);
    var n = ea;
    if (n && t) {
      var l = Tl(n).hoistableScripts,
        i = la(t),
        c = l.get(i);
      c ||
        ((c = n.querySelector(ni(i))),
        c ||
          ((t = x({ src: t, async: !0 }, e)),
          (e = Me.get(i)) && rr(t, e),
          (c = n.createElement("script")),
          Jt(c),
          ee(c, "link", t),
          n.head.appendChild(c)),
        (c = { type: "script", instance: c, count: 1, state: null }),
        l.set(i, c));
    }
  }
  function Cg(t, e) {
    pn.M(t, e);
    var n = ea;
    if (n && t) {
      var l = Tl(n).hoistableScripts,
        i = la(t),
        c = l.get(i);
      c ||
        ((c = n.querySelector(ni(i))),
        c ||
          ((t = x({ src: t, async: !0, type: "module" }, e)),
          (e = Me.get(i)) && rr(t, e),
          (c = n.createElement("script")),
          Jt(c),
          ee(c, "link", t),
          n.head.appendChild(c)),
        (c = { type: "script", instance: c, count: 1, state: null }),
        l.set(i, c));
    }
  }
  function Gm(t, e, n, l) {
    var i = (i = st.current) ? Eu(i) : null;
    if (!i) throw Error(o(446));
    switch (t) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof n.precedence == "string" && typeof n.href == "string"
          ? ((e = na(n.href)),
            (n = Tl(i).hoistableStyles),
            (l = n.get(e)),
            l || ((l = { type: "style", instance: null, count: 0, state: null }), n.set(e, l)),
            l)
          : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (
          n.rel === "stylesheet" &&
          typeof n.href == "string" &&
          typeof n.precedence == "string"
        ) {
          t = na(n.href);
          var c = Tl(i).hoistableStyles,
            f = c.get(t);
          if (
            (f ||
              ((i = i.ownerDocument || i),
              (f = {
                type: "stylesheet",
                instance: null,
                count: 0,
                state: { loading: 0, preload: null },
              }),
              c.set(t, f),
              (c = i.querySelector(ei(t))) && !c._p && ((f.instance = c), (f.state.loading = 5)),
              Me.has(t) ||
                ((n = {
                  rel: "preload",
                  as: "style",
                  href: n.href,
                  crossOrigin: n.crossOrigin,
                  integrity: n.integrity,
                  media: n.media,
                  hrefLang: n.hrefLang,
                  referrerPolicy: n.referrerPolicy,
                }),
                Me.set(t, n),
                c || Ng(i, t, n, f.state))),
            e && l === null)
          )
            throw Error(o(528, ""));
          return f;
        }
        if (e && l !== null) throw Error(o(529, ""));
        return null;
      case "script":
        return (
          (e = n.async),
          (n = n.src),
          typeof n == "string" && e && typeof e != "function" && typeof e != "symbol"
            ? ((e = la(n)),
              (n = Tl(i).hoistableScripts),
              (l = n.get(e)),
              l || ((l = { type: "script", instance: null, count: 0, state: null }), n.set(e, l)),
              l)
            : { type: "void", instance: null, count: 0, state: null }
        );
      default:
        throw Error(o(444, t));
    }
  }
  function na(t) {
    return 'href="' + Ce(t) + '"';
  }
  function ei(t) {
    return 'link[rel="stylesheet"][' + t + "]";
  }
  function Xm(t) {
    return x({}, t, { "data-precedence": t.precedence, precedence: null });
  }
  function Ng(t, e, n, l) {
    t.querySelector('link[rel="preload"][as="style"][' + e + "]")
      ? (l.loading = 1)
      : ((e = t.createElement("link")),
        (l.preload = e),
        e.addEventListener("load", function () {
          return (l.loading |= 1);
        }),
        e.addEventListener("error", function () {
          return (l.loading |= 2);
        }),
        ee(e, "link", n),
        Jt(e),
        t.head.appendChild(e));
  }
  function la(t) {
    return '[src="' + Ce(t) + '"]';
  }
  function ni(t) {
    return "script[async]" + t;
  }
  function Qm(t, e, n) {
    if ((e.count++, e.instance === null))
      switch (e.type) {
        case "style":
          var l = t.querySelector('style[data-href~="' + Ce(n.href) + '"]');
          if (l) return ((e.instance = l), Jt(l), l);
          var i = x({}, n, {
            "data-href": n.href,
            "data-precedence": n.precedence,
            href: null,
            precedence: null,
          });
          return (
            (l = (t.ownerDocument || t).createElement("style")),
            Jt(l),
            ee(l, "style", i),
            Au(l, n.precedence, t),
            (e.instance = l)
          );
        case "stylesheet":
          i = na(n.href);
          var c = t.querySelector(ei(i));
          if (c) return ((e.state.loading |= 4), (e.instance = c), Jt(c), c);
          ((l = Xm(n)),
            (i = Me.get(i)) && or(l, i),
            (c = (t.ownerDocument || t).createElement("link")),
            Jt(c));
          var f = c;
          return (
            (f._p = new Promise(function (y, E) {
              ((f.onload = y), (f.onerror = E));
            })),
            ee(c, "link", l),
            (e.state.loading |= 4),
            Au(c, n.precedence, t),
            (e.instance = c)
          );
        case "script":
          return (
            (c = la(n.src)),
            (i = t.querySelector(ni(c)))
              ? ((e.instance = i), Jt(i), i)
              : ((l = n),
                (i = Me.get(c)) && ((l = x({}, n)), rr(l, i)),
                (t = t.ownerDocument || t),
                (i = t.createElement("script")),
                Jt(i),
                ee(i, "link", l),
                t.head.appendChild(i),
                (e.instance = i))
          );
        case "void":
          return null;
        default:
          throw Error(o(443, e.type));
      }
    else
      e.type === "stylesheet" &&
        (e.state.loading & 4) === 0 &&
        ((l = e.instance), (e.state.loading |= 4), Au(l, n.precedence, t));
    return e.instance;
  }
  function Au(t, e, n) {
    for (
      var l = n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),
        i = l.length ? l[l.length - 1] : null,
        c = i,
        f = 0;
      f < l.length;
      f++
    ) {
      var y = l[f];
      if (y.dataset.precedence === e) c = y;
      else if (c !== i) break;
    }
    c
      ? c.parentNode.insertBefore(t, c.nextSibling)
      : ((e = n.nodeType === 9 ? n.head : n), e.insertBefore(t, e.firstChild));
  }
  function or(t, e) {
    (t.crossOrigin == null && (t.crossOrigin = e.crossOrigin),
      t.referrerPolicy == null && (t.referrerPolicy = e.referrerPolicy),
      t.title == null && (t.title = e.title));
  }
  function rr(t, e) {
    (t.crossOrigin == null && (t.crossOrigin = e.crossOrigin),
      t.referrerPolicy == null && (t.referrerPolicy = e.referrerPolicy),
      t.integrity == null && (t.integrity = e.integrity));
  }
  var Tu = null;
  function Zm(t, e, n) {
    if (Tu === null) {
      var l = new Map(),
        i = (Tu = new Map());
      i.set(n, l);
    } else ((i = Tu), (l = i.get(n)), l || ((l = new Map()), i.set(n, l)));
    if (l.has(t)) return l;
    for (l.set(t, null), n = n.getElementsByTagName(t), i = 0; i < n.length; i++) {
      var c = n[i];
      if (
        !(c[ga] || c[Ft] || (t === "link" && c.getAttribute("rel") === "stylesheet")) &&
        c.namespaceURI !== "http://www.w3.org/2000/svg"
      ) {
        var f = c.getAttribute(e) || "";
        f = t + f;
        var y = l.get(f);
        y ? y.push(c) : l.set(f, [c]);
      }
    }
    return l;
  }
  function Km(t, e, n) {
    ((t = t.ownerDocument || t),
      t.head.insertBefore(n, e === "title" ? t.querySelector("head > title") : null));
  }
  function Og(t, e, n) {
    if (n === 1 || e.itemProp != null) return !1;
    switch (t) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof e.precedence != "string" || typeof e.href != "string" || e.href === "") break;
        return !0;
      case "link":
        if (
          typeof e.rel != "string" ||
          typeof e.href != "string" ||
          e.href === "" ||
          e.onLoad ||
          e.onError
        )
          break;
        switch (e.rel) {
          case "stylesheet":
            return ((t = e.disabled), typeof e.precedence == "string" && t == null);
          default:
            return !0;
        }
      case "script":
        if (
          e.async &&
          typeof e.async != "function" &&
          typeof e.async != "symbol" &&
          !e.onLoad &&
          !e.onError &&
          e.src &&
          typeof e.src == "string"
        )
          return !0;
    }
    return !1;
  }
  function Jm(t) {
    return !(t.type === "stylesheet" && (t.state.loading & 3) === 0);
  }
  function wg(t, e, n, l) {
    if (
      n.type === "stylesheet" &&
      (typeof l.media != "string" || matchMedia(l.media).matches !== !1) &&
      (n.state.loading & 4) === 0
    ) {
      if (n.instance === null) {
        var i = na(l.href),
          c = e.querySelector(ei(i));
        if (c) {
          ((e = c._p),
            e !== null &&
              typeof e == "object" &&
              typeof e.then == "function" &&
              (t.count++, (t = Cu.bind(t)), e.then(t, t)),
            (n.state.loading |= 4),
            (n.instance = c),
            Jt(c));
          return;
        }
        ((c = e.ownerDocument || e),
          (l = Xm(l)),
          (i = Me.get(i)) && or(l, i),
          (c = c.createElement("link")),
          Jt(c));
        var f = c;
        ((f._p = new Promise(function (y, E) {
          ((f.onload = y), (f.onerror = E));
        })),
          ee(c, "link", l),
          (n.instance = c));
      }
      (t.stylesheets === null && (t.stylesheets = new Map()),
        t.stylesheets.set(n, e),
        (e = n.state.preload) &&
          (n.state.loading & 3) === 0 &&
          (t.count++,
          (n = Cu.bind(t)),
          e.addEventListener("load", n),
          e.addEventListener("error", n)));
    }
  }
  var sr = 0;
  function _g(t, e) {
    return (
      t.stylesheets && t.count === 0 && Ou(t, t.stylesheets),
      0 < t.count || 0 < t.imgCount
        ? function (n) {
            var l = setTimeout(function () {
              if ((t.stylesheets && Ou(t, t.stylesheets), t.unsuspend)) {
                var c = t.unsuspend;
                ((t.unsuspend = null), c());
              }
            }, 6e4 + e);
            0 < t.imgBytes && sr === 0 && (sr = 62500 * rg());
            var i = setTimeout(
              function () {
                if (
                  ((t.waitingForImages = !1),
                  t.count === 0 && (t.stylesheets && Ou(t, t.stylesheets), t.unsuspend))
                ) {
                  var c = t.unsuspend;
                  ((t.unsuspend = null), c());
                }
              },
              (t.imgBytes > sr ? 50 : 800) + e,
            );
            return (
              (t.unsuspend = n),
              function () {
                ((t.unsuspend = null), clearTimeout(l), clearTimeout(i));
              }
            );
          }
        : null
    );
  }
  function Cu() {
    if ((this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages))) {
      if (this.stylesheets) Ou(this, this.stylesheets);
      else if (this.unsuspend) {
        var t = this.unsuspend;
        ((this.unsuspend = null), t());
      }
    }
  }
  var Nu = null;
  function Ou(t, e) {
    ((t.stylesheets = null),
      t.unsuspend !== null &&
        (t.count++, (Nu = new Map()), e.forEach(Rg, t), (Nu = null), Cu.call(t)));
  }
  function Rg(t, e) {
    if (!(e.state.loading & 4)) {
      var n = Nu.get(t);
      if (n) var l = n.get(null);
      else {
        ((n = new Map()), Nu.set(t, n));
        for (
          var i = t.querySelectorAll("link[data-precedence],style[data-precedence]"), c = 0;
          c < i.length;
          c++
        ) {
          var f = i[c];
          (f.nodeName === "LINK" || f.getAttribute("media") !== "not all") &&
            (n.set(f.dataset.precedence, f), (l = f));
        }
        l && n.set(null, l);
      }
      ((i = e.instance),
        (f = i.getAttribute("data-precedence")),
        (c = n.get(f) || l),
        c === l && n.set(null, i),
        n.set(f, i),
        this.count++,
        (l = Cu.bind(this)),
        i.addEventListener("load", l),
        i.addEventListener("error", l),
        c
          ? c.parentNode.insertBefore(i, c.nextSibling)
          : ((t = t.nodeType === 9 ? t.head : t), t.insertBefore(i, t.firstChild)),
        (e.state.loading |= 4));
    }
  }
  var li = {
    $$typeof: X,
    Provider: null,
    Consumer: null,
    _currentValue: K,
    _currentValue2: K,
    _threadCount: 0,
  };
  function zg(t, e, n, l, i, c, f, y, E) {
    ((this.tag = 1),
      (this.containerInfo = t),
      (this.pingCache = this.current = this.pendingChildren = null),
      (this.timeoutHandle = -1),
      (this.callbackNode =
        this.next =
        this.pendingContext =
        this.context =
        this.cancelPendingCommit =
          null),
      (this.callbackPriority = 0),
      (this.expirationTimes = ac(-1)),
      (this.entangledLanes =
        this.shellSuspendCounter =
        this.errorRecoveryDisabledLanes =
        this.expiredLanes =
        this.warmLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = ac(0)),
      (this.hiddenUpdates = ac(null)),
      (this.identifierPrefix = l),
      (this.onUncaughtError = i),
      (this.onCaughtError = c),
      (this.onRecoverableError = f),
      (this.pooledCache = null),
      (this.pooledCacheLanes = 0),
      (this.formState = E),
      (this.incompleteTransitions = new Map()));
  }
  function $m(t, e, n, l, i, c, f, y, E, w, H, L) {
    return (
      (t = new zg(t, e, n, f, E, w, H, L, y)),
      (e = 1),
      c === !0 && (e |= 24),
      (c = ye(3, null, null, e)),
      (t.current = c),
      (c.stateNode = t),
      (e = Gc()),
      e.refCount++,
      (t.pooledCache = e),
      e.refCount++,
      (c.memoizedState = { element: l, isDehydrated: n, cache: e }),
      Kc(c),
      t
    );
  }
  function km(t) {
    return t ? ((t = Dl), t) : Dl;
  }
  function Wm(t, e, n, l, i, c) {
    ((i = km(i)),
      l.context === null ? (l.context = i) : (l.pendingContext = i),
      (l = Rn(e)),
      (l.payload = { element: n }),
      (c = c === void 0 ? null : c),
      c !== null && (l.callback = c),
      (n = zn(t, l, e)),
      n !== null && (fe(n, t, e), Ua(n, t, e)));
  }
  function Fm(t, e) {
    if (((t = t.memoizedState), t !== null && t.dehydrated !== null)) {
      var n = t.retryLane;
      t.retryLane = n !== 0 && n < e ? n : e;
    }
  }
  function fr(t, e) {
    (Fm(t, e), (t = t.alternate) && Fm(t, e));
  }
  function Pm(t) {
    if (t.tag === 13 || t.tag === 31) {
      var e = ul(t, 67108864);
      (e !== null && fe(e, t, 67108864), fr(t, 67108864));
    }
  }
  function Im(t) {
    if (t.tag === 13 || t.tag === 31) {
      var e = Se();
      e = ic(e);
      var n = ul(t, e);
      (n !== null && fe(n, t, e), fr(t, e));
    }
  }
  var wu = !0;
  function jg(t, e, n, l) {
    var i = _.T;
    _.T = null;
    var c = G.p;
    try {
      ((G.p = 2), dr(t, e, n, l));
    } finally {
      ((G.p = c), (_.T = i));
    }
  }
  function Mg(t, e, n, l) {
    var i = _.T;
    _.T = null;
    var c = G.p;
    try {
      ((G.p = 8), dr(t, e, n, l));
    } finally {
      ((G.p = c), (_.T = i));
    }
  }
  function dr(t, e, n, l) {
    if (wu) {
      var i = mr(l);
      if (i === null) (Po(t, e, l, _u, n), eh(t, l));
      else if (Ug(i, t, e, n, l)) l.stopPropagation();
      else if ((eh(t, l), e & 4 && -1 < Dg.indexOf(t))) {
        for (; i !== null; ) {
          var c = Al(i);
          if (c !== null)
            switch (c.tag) {
              case 3:
                if (((c = c.stateNode), c.current.memoizedState.isDehydrated)) {
                  var f = el(c.pendingLanes);
                  if (f !== 0) {
                    var y = c;
                    for (y.pendingLanes |= 2, y.entangledLanes |= 2; f; ) {
                      var E = 1 << (31 - he(f));
                      ((y.entanglements[1] |= E), (f &= ~E));
                    }
                    (Ze(c), (Tt & 6) === 0 && ((fu = de() + 500), Fa(0)));
                  }
                }
                break;
              case 31:
              case 13:
                ((y = ul(c, 2)), y !== null && fe(y, c, 2), mu(), fr(c, 2));
            }
          if (((c = mr(l)), c === null && Po(t, e, l, _u, n), c === i)) break;
          i = c;
        }
        i !== null && l.stopPropagation();
      } else Po(t, e, l, null, n);
    }
  }
  function mr(t) {
    return ((t = hc(t)), hr(t));
  }
  var _u = null;
  function hr(t) {
    if (((_u = null), (t = El(t)), t !== null)) {
      var e = d(t);
      if (e === null) t = null;
      else {
        var n = e.tag;
        if (n === 13) {
          if (((t = m(e)), t !== null)) return t;
          t = null;
        } else if (n === 31) {
          if (((t = h(e)), t !== null)) return t;
          t = null;
        } else if (n === 3) {
          if (e.stateNode.current.memoizedState.isDehydrated)
            return e.tag === 3 ? e.stateNode.containerInfo : null;
          t = null;
        } else e !== t && (t = null);
      }
    }
    return ((_u = t), null);
  }
  function th(t) {
    switch (t) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (by()) {
          case cs:
            return 2;
          case os:
            return 8;
          case gi:
          case xy:
            return 32;
          case rs:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var pr = !1,
    Gn = null,
    Xn = null,
    Qn = null,
    ai = new Map(),
    ii = new Map(),
    Zn = [],
    Dg =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
        " ",
      );
  function eh(t, e) {
    switch (t) {
      case "focusin":
      case "focusout":
        Gn = null;
        break;
      case "dragenter":
      case "dragleave":
        Xn = null;
        break;
      case "mouseover":
      case "mouseout":
        Qn = null;
        break;
      case "pointerover":
      case "pointerout":
        ai.delete(e.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        ii.delete(e.pointerId);
    }
  }
  function ui(t, e, n, l, i, c) {
    return t === null || t.nativeEvent !== c
      ? ((t = {
          blockedOn: e,
          domEventName: n,
          eventSystemFlags: l,
          nativeEvent: c,
          targetContainers: [i],
        }),
        e !== null && ((e = Al(e)), e !== null && Pm(e)),
        t)
      : ((t.eventSystemFlags |= l),
        (e = t.targetContainers),
        i !== null && e.indexOf(i) === -1 && e.push(i),
        t);
  }
  function Ug(t, e, n, l, i) {
    switch (e) {
      case "focusin":
        return ((Gn = ui(Gn, t, e, n, l, i)), !0);
      case "dragenter":
        return ((Xn = ui(Xn, t, e, n, l, i)), !0);
      case "mouseover":
        return ((Qn = ui(Qn, t, e, n, l, i)), !0);
      case "pointerover":
        var c = i.pointerId;
        return (ai.set(c, ui(ai.get(c) || null, t, e, n, l, i)), !0);
      case "gotpointercapture":
        return ((c = i.pointerId), ii.set(c, ui(ii.get(c) || null, t, e, n, l, i)), !0);
    }
    return !1;
  }
  function nh(t) {
    var e = El(t.target);
    if (e !== null) {
      var n = d(e);
      if (n !== null) {
        if (((e = n.tag), e === 13)) {
          if (((e = m(n)), e !== null)) {
            ((t.blockedOn = e),
              ps(t.priority, function () {
                Im(n);
              }));
            return;
          }
        } else if (e === 31) {
          if (((e = h(n)), e !== null)) {
            ((t.blockedOn = e),
              ps(t.priority, function () {
                Im(n);
              }));
            return;
          }
        } else if (e === 3 && n.stateNode.current.memoizedState.isDehydrated) {
          t.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    t.blockedOn = null;
  }
  function Ru(t) {
    if (t.blockedOn !== null) return !1;
    for (var e = t.targetContainers; 0 < e.length; ) {
      var n = mr(t.nativeEvent);
      if (n === null) {
        n = t.nativeEvent;
        var l = new n.constructor(n.type, n);
        ((mc = l), n.target.dispatchEvent(l), (mc = null));
      } else return ((e = Al(n)), e !== null && Pm(e), (t.blockedOn = n), !1);
      e.shift();
    }
    return !0;
  }
  function lh(t, e, n) {
    Ru(t) && n.delete(e);
  }
  function Hg() {
    ((pr = !1),
      Gn !== null && Ru(Gn) && (Gn = null),
      Xn !== null && Ru(Xn) && (Xn = null),
      Qn !== null && Ru(Qn) && (Qn = null),
      ai.forEach(lh),
      ii.forEach(lh));
  }
  function zu(t, e) {
    t.blockedOn === e &&
      ((t.blockedOn = null),
      pr || ((pr = !0), a.unstable_scheduleCallback(a.unstable_NormalPriority, Hg)));
  }
  var ju = null;
  function ah(t) {
    ju !== t &&
      ((ju = t),
      a.unstable_scheduleCallback(a.unstable_NormalPriority, function () {
        ju === t && (ju = null);
        for (var e = 0; e < t.length; e += 3) {
          var n = t[e],
            l = t[e + 1],
            i = t[e + 2];
          if (typeof l != "function") {
            if (hr(l || n) === null) continue;
            break;
          }
          var c = Al(n);
          c !== null &&
            (t.splice(e, 3),
            (e -= 3),
            mo(c, { pending: !0, data: i, method: n.method, action: l }, l, i));
        }
      }));
  }
  function aa(t) {
    function e(E) {
      return zu(E, t);
    }
    (Gn !== null && zu(Gn, t),
      Xn !== null && zu(Xn, t),
      Qn !== null && zu(Qn, t),
      ai.forEach(e),
      ii.forEach(e));
    for (var n = 0; n < Zn.length; n++) {
      var l = Zn[n];
      l.blockedOn === t && (l.blockedOn = null);
    }
    for (; 0 < Zn.length && ((n = Zn[0]), n.blockedOn === null); )
      (nh(n), n.blockedOn === null && Zn.shift());
    if (((n = (t.ownerDocument || t).$$reactFormReplay), n != null))
      for (l = 0; l < n.length; l += 3) {
        var i = n[l],
          c = n[l + 1],
          f = i[ie] || null;
        if (typeof c == "function") f || ah(n);
        else if (f) {
          var y = null;
          if (c && c.hasAttribute("formAction")) {
            if (((i = c), (f = c[ie] || null))) y = f.formAction;
            else if (hr(i) !== null) continue;
          } else y = f.action;
          (typeof y == "function" ? (n[l + 1] = y) : (n.splice(l, 3), (l -= 3)), ah(n));
        }
      }
  }
  function ih() {
    function t(c) {
      c.canIntercept &&
        c.info === "react-transition" &&
        c.intercept({
          handler: function () {
            return new Promise(function (f) {
              return (i = f);
            });
          },
          focusReset: "manual",
          scroll: "manual",
        });
    }
    function e() {
      (i !== null && (i(), (i = null)), l || setTimeout(n, 20));
    }
    function n() {
      if (!l && !navigation.transition) {
        var c = navigation.currentEntry;
        c &&
          c.url != null &&
          navigation.navigate(c.url, {
            state: c.getState(),
            info: "react-transition",
            history: "replace",
          });
      }
    }
    if (typeof navigation == "object") {
      var l = !1,
        i = null;
      return (
        navigation.addEventListener("navigate", t),
        navigation.addEventListener("navigatesuccess", e),
        navigation.addEventListener("navigateerror", e),
        setTimeout(n, 100),
        function () {
          ((l = !0),
            navigation.removeEventListener("navigate", t),
            navigation.removeEventListener("navigatesuccess", e),
            navigation.removeEventListener("navigateerror", e),
            i !== null && (i(), (i = null)));
        }
      );
    }
  }
  function yr(t) {
    this._internalRoot = t;
  }
  ((Mu.prototype.render = yr.prototype.render =
    function (t) {
      var e = this._internalRoot;
      if (e === null) throw Error(o(409));
      var n = e.current,
        l = Se();
      Wm(n, l, t, e, null, null);
    }),
    (Mu.prototype.unmount = yr.prototype.unmount =
      function () {
        var t = this._internalRoot;
        if (t !== null) {
          this._internalRoot = null;
          var e = t.containerInfo;
          (Wm(t.current, 2, null, t, null, null), mu(), (e[Sl] = null));
        }
      }));
  function Mu(t) {
    this._internalRoot = t;
  }
  Mu.prototype.unstable_scheduleHydration = function (t) {
    if (t) {
      var e = hs();
      t = { blockedOn: null, target: t, priority: e };
      for (var n = 0; n < Zn.length && e !== 0 && e < Zn[n].priority; n++);
      (Zn.splice(n, 0, t), n === 0 && nh(t));
    }
  };
  var uh = u.version;
  if (uh !== "19.2.4") throw Error(o(527, uh, "19.2.4"));
  G.findDOMNode = function (t) {
    var e = t._reactInternals;
    if (e === void 0)
      throw typeof t.render == "function"
        ? Error(o(188))
        : ((t = Object.keys(t).join(",")), Error(o(268, t)));
    return ((t = p(e)), (t = t !== null ? S(t) : null), (t = t === null ? null : t.stateNode), t);
  };
  var Bg = {
    bundleType: 0,
    version: "19.2.4",
    rendererPackageName: "react-dom",
    currentDispatcherRef: _,
    reconcilerVersion: "19.2.4",
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Du = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Du.isDisabled && Du.supportsFiber)
      try {
        ((pa = Du.inject(Bg)), (me = Du));
      } catch {}
  }
  return (
    (oi.createRoot = function (t, e) {
      if (!s(t)) throw Error(o(299));
      var n = !1,
        l = "",
        i = md,
        c = hd,
        f = pd;
      return (
        e != null &&
          (e.unstable_strictMode === !0 && (n = !0),
          e.identifierPrefix !== void 0 && (l = e.identifierPrefix),
          e.onUncaughtError !== void 0 && (i = e.onUncaughtError),
          e.onCaughtError !== void 0 && (c = e.onCaughtError),
          e.onRecoverableError !== void 0 && (f = e.onRecoverableError)),
        (e = $m(t, 1, !1, null, null, n, l, null, i, c, f, ih)),
        (t[Sl] = e.current),
        Fo(t),
        new yr(e)
      );
    }),
    (oi.hydrateRoot = function (t, e, n) {
      if (!s(t)) throw Error(o(299));
      var l = !1,
        i = "",
        c = md,
        f = hd,
        y = pd,
        E = null;
      return (
        n != null &&
          (n.unstable_strictMode === !0 && (l = !0),
          n.identifierPrefix !== void 0 && (i = n.identifierPrefix),
          n.onUncaughtError !== void 0 && (c = n.onUncaughtError),
          n.onCaughtError !== void 0 && (f = n.onCaughtError),
          n.onRecoverableError !== void 0 && (y = n.onRecoverableError),
          n.formState !== void 0 && (E = n.formState)),
        (e = $m(t, 1, !0, e, n ?? null, l, i, E, c, f, y, ih)),
        (e.context = km(null)),
        (n = e.current),
        (l = Se()),
        (l = ic(l)),
        (i = Rn(l)),
        (i.callback = null),
        zn(n, i, l),
        (n = l),
        (e.current.lanes = n),
        va(e, n),
        Ze(e),
        (t[Sl] = e.current),
        Fo(t),
        new Mu(e)
      );
    }),
    (oi.version = "19.2.4"),
    oi
  );
}
var yh;
function Jg() {
  if (yh) return br.exports;
  yh = 1;
  function a() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(a);
      } catch (u) {
        console.error(u);
      }
  }
  return (a(), (br.exports = Kg()), br.exports);
}
var $g = Jg();
function Xh(a) {
  var u,
    r,
    o = "";
  if (typeof a == "string" || typeof a == "number") o += a;
  else if (typeof a == "object")
    if (Array.isArray(a)) {
      var s = a.length;
      for (u = 0; u < s; u++) a[u] && (r = Xh(a[u])) && (o && (o += " "), (o += r));
    } else for (r in a) a[r] && (o && (o += " "), (o += r));
  return o;
}
function Qh() {
  for (var a, u, r = 0, o = "", s = arguments.length; r < s; r++)
    (a = arguments[r]) && (u = Xh(a)) && (o && (o += " "), (o += u));
  return o;
}
const Xr = "-",
  kg = (a) => {
    const u = Fg(a),
      { conflictingClassGroups: r, conflictingClassGroupModifiers: o } = a;
    return {
      getClassGroupId: (m) => {
        const h = m.split(Xr);
        return (h[0] === "" && h.length !== 1 && h.shift(), Zh(h, u) || Wg(m));
      },
      getConflictingClassGroupIds: (m, h) => {
        const v = r[m] || [];
        return h && o[m] ? [...v, ...o[m]] : v;
      },
    };
  },
  Zh = (a, u) => {
    if (a.length === 0) return u.classGroupId;
    const r = a[0],
      o = u.nextPart.get(r),
      s = o ? Zh(a.slice(1), o) : void 0;
    if (s) return s;
    if (u.validators.length === 0) return;
    const d = a.join(Xr);
    return u.validators.find(({ validator: m }) => m(d))?.classGroupId;
  },
  vh = /^\[(.+)\]$/,
  Wg = (a) => {
    if (vh.test(a)) {
      const u = vh.exec(a)[1],
        r = u?.substring(0, u.indexOf(":"));
      if (r) return "arbitrary.." + r;
    }
  },
  Fg = (a) => {
    const { theme: u, prefix: r } = a,
      o = { nextPart: new Map(), validators: [] };
    return (
      Ig(Object.entries(a.classGroups), r).forEach(([d, m]) => {
        wr(m, o, d, u);
      }),
      o
    );
  },
  wr = (a, u, r, o) => {
    a.forEach((s) => {
      if (typeof s == "string") {
        const d = s === "" ? u : gh(u, s);
        d.classGroupId = r;
        return;
      }
      if (typeof s == "function") {
        if (Pg(s)) {
          wr(s(o), u, r, o);
          return;
        }
        u.validators.push({ validator: s, classGroupId: r });
        return;
      }
      Object.entries(s).forEach(([d, m]) => {
        wr(m, gh(u, d), r, o);
      });
    });
  },
  gh = (a, u) => {
    let r = a;
    return (
      u.split(Xr).forEach((o) => {
        (r.nextPart.has(o) || r.nextPart.set(o, { nextPart: new Map(), validators: [] }),
          (r = r.nextPart.get(o)));
      }),
      r
    );
  },
  Pg = (a) => a.isThemeGetter,
  Ig = (a, u) =>
    u
      ? a.map(([r, o]) => {
          const s = o.map((d) =>
            typeof d == "string"
              ? u + d
              : typeof d == "object"
                ? Object.fromEntries(Object.entries(d).map(([m, h]) => [u + m, h]))
                : d,
          );
          return [r, s];
        })
      : a,
  t0 = (a) => {
    if (a < 1) return { get: () => {}, set: () => {} };
    let u = 0,
      r = new Map(),
      o = new Map();
    const s = (d, m) => {
      (r.set(d, m), u++, u > a && ((u = 0), (o = r), (r = new Map())));
    };
    return {
      get(d) {
        let m = r.get(d);
        if (m !== void 0) return m;
        if ((m = o.get(d)) !== void 0) return (s(d, m), m);
      },
      set(d, m) {
        r.has(d) ? r.set(d, m) : s(d, m);
      },
    };
  },
  Kh = "!",
  e0 = (a) => {
    const { separator: u, experimentalParseClassName: r } = a,
      o = u.length === 1,
      s = u[0],
      d = u.length,
      m = (h) => {
        const v = [];
        let p = 0,
          S = 0,
          x;
        for (let M = 0; M < h.length; M++) {
          let V = h[M];
          if (p === 0) {
            if (V === s && (o || h.slice(M, M + d) === u)) {
              (v.push(h.slice(S, M)), (S = M + d));
              continue;
            }
            if (V === "/") {
              x = M;
              continue;
            }
          }
          V === "[" ? p++ : V === "]" && p--;
        }
        const N = v.length === 0 ? h : h.substring(S),
          z = N.startsWith(Kh),
          D = z ? N.substring(1) : N,
          U = x && x > S ? x - S : void 0;
        return {
          modifiers: v,
          hasImportantModifier: z,
          baseClassName: D,
          maybePostfixModifierPosition: U,
        };
      };
    return r ? (h) => r({ className: h, parseClassName: m }) : m;
  },
  n0 = (a) => {
    if (a.length <= 1) return a;
    const u = [];
    let r = [];
    return (
      a.forEach((o) => {
        o[0] === "[" ? (u.push(...r.sort(), o), (r = [])) : r.push(o);
      }),
      u.push(...r.sort()),
      u
    );
  },
  l0 = (a) => ({ cache: t0(a.cacheSize), parseClassName: e0(a), ...kg(a) }),
  a0 = /\s+/,
  i0 = (a, u) => {
    const { parseClassName: r, getClassGroupId: o, getConflictingClassGroupIds: s } = u,
      d = [],
      m = a.trim().split(a0);
    let h = "";
    for (let v = m.length - 1; v >= 0; v -= 1) {
      const p = m[v],
        {
          modifiers: S,
          hasImportantModifier: x,
          baseClassName: N,
          maybePostfixModifierPosition: z,
        } = r(p);
      let D = !!z,
        U = o(D ? N.substring(0, z) : N);
      if (!U) {
        if (!D) {
          h = p + (h.length > 0 ? " " + h : h);
          continue;
        }
        if (((U = o(N)), !U)) {
          h = p + (h.length > 0 ? " " + h : h);
          continue;
        }
        D = !1;
      }
      const M = n0(S).join(":"),
        V = x ? M + Kh : M,
        Y = V + U;
      if (d.includes(Y)) continue;
      d.push(Y);
      const X = s(U, D);
      for (let Z = 0; Z < X.length; ++Z) {
        const W = X[Z];
        d.push(V + W);
      }
      h = p + (h.length > 0 ? " " + h : h);
    }
    return h;
  };
function u0() {
  let a = 0,
    u,
    r,
    o = "";
  for (; a < arguments.length; ) (u = arguments[a++]) && (r = Jh(u)) && (o && (o += " "), (o += r));
  return o;
}
const Jh = (a) => {
  if (typeof a == "string") return a;
  let u,
    r = "";
  for (let o = 0; o < a.length; o++) a[o] && (u = Jh(a[o])) && (r && (r += " "), (r += u));
  return r;
};
function c0(a, ...u) {
  let r,
    o,
    s,
    d = m;
  function m(v) {
    const p = u.reduce((S, x) => x(S), a());
    return ((r = l0(p)), (o = r.cache.get), (s = r.cache.set), (d = h), h(v));
  }
  function h(v) {
    const p = o(v);
    if (p) return p;
    const S = i0(v, r);
    return (s(v, S), S);
  }
  return function () {
    return d(u0.apply(null, arguments));
  };
}
const Dt = (a) => {
    const u = (r) => r[a] || [];
    return ((u.isThemeGetter = !0), u);
  },
  $h = /^\[(?:([a-z-]+):)?(.+)\]$/i,
  o0 = /^\d+\/\d+$/,
  r0 = new Set(["px", "full", "screen"]),
  s0 = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,
  f0 =
    /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,
  d0 = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,
  m0 = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,
  h0 =
    /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,
  yn = (a) => ia(a) || r0.has(a) || o0.test(a),
  Jn = (a) => fa(a, "length", E0),
  ia = (a) => !!a && !Number.isNaN(Number(a)),
  Ar = (a) => fa(a, "number", ia),
  ri = (a) => !!a && Number.isInteger(Number(a)),
  p0 = (a) => a.endsWith("%") && ia(a.slice(0, -1)),
  rt = (a) => $h.test(a),
  $n = (a) => s0.test(a),
  y0 = new Set(["length", "size", "percentage"]),
  v0 = (a) => fa(a, y0, kh),
  g0 = (a) => fa(a, "position", kh),
  b0 = new Set(["image", "url"]),
  x0 = (a) => fa(a, b0, T0),
  S0 = (a) => fa(a, "", A0),
  si = () => !0,
  fa = (a, u, r) => {
    const o = $h.exec(a);
    return o ? (o[1] ? (typeof u == "string" ? o[1] === u : u.has(o[1])) : r(o[2])) : !1;
  },
  E0 = (a) => f0.test(a) && !d0.test(a),
  kh = () => !1,
  A0 = (a) => m0.test(a),
  T0 = (a) => h0.test(a),
  C0 = () => {
    const a = Dt("colors"),
      u = Dt("spacing"),
      r = Dt("blur"),
      o = Dt("brightness"),
      s = Dt("borderColor"),
      d = Dt("borderRadius"),
      m = Dt("borderSpacing"),
      h = Dt("borderWidth"),
      v = Dt("contrast"),
      p = Dt("grayscale"),
      S = Dt("hueRotate"),
      x = Dt("invert"),
      N = Dt("gap"),
      z = Dt("gradientColorStops"),
      D = Dt("gradientColorStopPositions"),
      U = Dt("inset"),
      M = Dt("margin"),
      V = Dt("opacity"),
      Y = Dt("padding"),
      X = Dt("saturate"),
      Z = Dt("scale"),
      W = Dt("sepia"),
      F = Dt("skew"),
      Q = Dt("space"),
      et = Dt("translate"),
      bt = () => ["auto", "contain", "none"],
      ht = () => ["auto", "hidden", "clip", "visible", "scroll"],
      xt = () => ["auto", rt, u],
      I = () => [rt, u],
      St = () => ["", yn, Jn],
      ft = () => ["auto", ia, rt],
      Ct = () => [
        "bottom",
        "center",
        "left",
        "left-bottom",
        "left-top",
        "right",
        "right-bottom",
        "right-top",
        "top",
      ],
      _ = () => ["solid", "dashed", "dotted", "double", "none"],
      G = () => [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity",
      ],
      K = () => ["start", "end", "center", "between", "around", "evenly", "stretch"],
      nt = () => ["", "0", rt],
      ct = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"],
      A = () => [ia, rt];
    return {
      cacheSize: 500,
      separator: ":",
      theme: {
        colors: [si],
        spacing: [yn, Jn],
        blur: ["none", "", $n, rt],
        brightness: A(),
        borderColor: [a],
        borderRadius: ["none", "", "full", $n, rt],
        borderSpacing: I(),
        borderWidth: St(),
        contrast: A(),
        grayscale: nt(),
        hueRotate: A(),
        invert: nt(),
        gap: I(),
        gradientColorStops: [a],
        gradientColorStopPositions: [p0, Jn],
        inset: xt(),
        margin: xt(),
        opacity: A(),
        padding: I(),
        saturate: A(),
        scale: A(),
        sepia: nt(),
        skew: A(),
        space: I(),
        translate: I(),
      },
      classGroups: {
        aspect: [{ aspect: ["auto", "square", "video", rt] }],
        container: ["container"],
        columns: [{ columns: [$n] }],
        "break-after": [{ "break-after": ct() }],
        "break-before": [{ "break-before": ct() }],
        "break-inside": [{ "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"] }],
        "box-decoration": [{ "box-decoration": ["slice", "clone"] }],
        box: [{ box: ["border", "content"] }],
        display: [
          "block",
          "inline-block",
          "inline",
          "flex",
          "inline-flex",
          "table",
          "inline-table",
          "table-caption",
          "table-cell",
          "table-column",
          "table-column-group",
          "table-footer-group",
          "table-header-group",
          "table-row-group",
          "table-row",
          "flow-root",
          "grid",
          "inline-grid",
          "contents",
          "list-item",
          "hidden",
        ],
        float: [{ float: ["right", "left", "none", "start", "end"] }],
        clear: [{ clear: ["left", "right", "both", "none", "start", "end"] }],
        isolation: ["isolate", "isolation-auto"],
        "object-fit": [{ object: ["contain", "cover", "fill", "none", "scale-down"] }],
        "object-position": [{ object: [...Ct(), rt] }],
        overflow: [{ overflow: ht() }],
        "overflow-x": [{ "overflow-x": ht() }],
        "overflow-y": [{ "overflow-y": ht() }],
        overscroll: [{ overscroll: bt() }],
        "overscroll-x": [{ "overscroll-x": bt() }],
        "overscroll-y": [{ "overscroll-y": bt() }],
        position: ["static", "fixed", "absolute", "relative", "sticky"],
        inset: [{ inset: [U] }],
        "inset-x": [{ "inset-x": [U] }],
        "inset-y": [{ "inset-y": [U] }],
        start: [{ start: [U] }],
        end: [{ end: [U] }],
        top: [{ top: [U] }],
        right: [{ right: [U] }],
        bottom: [{ bottom: [U] }],
        left: [{ left: [U] }],
        visibility: ["visible", "invisible", "collapse"],
        z: [{ z: ["auto", ri, rt] }],
        basis: [{ basis: xt() }],
        "flex-direction": [{ flex: ["row", "row-reverse", "col", "col-reverse"] }],
        "flex-wrap": [{ flex: ["wrap", "wrap-reverse", "nowrap"] }],
        flex: [{ flex: ["1", "auto", "initial", "none", rt] }],
        grow: [{ grow: nt() }],
        shrink: [{ shrink: nt() }],
        order: [{ order: ["first", "last", "none", ri, rt] }],
        "grid-cols": [{ "grid-cols": [si] }],
        "col-start-end": [{ col: ["auto", { span: ["full", ri, rt] }, rt] }],
        "col-start": [{ "col-start": ft() }],
        "col-end": [{ "col-end": ft() }],
        "grid-rows": [{ "grid-rows": [si] }],
        "row-start-end": [{ row: ["auto", { span: [ri, rt] }, rt] }],
        "row-start": [{ "row-start": ft() }],
        "row-end": [{ "row-end": ft() }],
        "grid-flow": [{ "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"] }],
        "auto-cols": [{ "auto-cols": ["auto", "min", "max", "fr", rt] }],
        "auto-rows": [{ "auto-rows": ["auto", "min", "max", "fr", rt] }],
        gap: [{ gap: [N] }],
        "gap-x": [{ "gap-x": [N] }],
        "gap-y": [{ "gap-y": [N] }],
        "justify-content": [{ justify: ["normal", ...K()] }],
        "justify-items": [{ "justify-items": ["start", "end", "center", "stretch"] }],
        "justify-self": [{ "justify-self": ["auto", "start", "end", "center", "stretch"] }],
        "align-content": [{ content: ["normal", ...K(), "baseline"] }],
        "align-items": [{ items: ["start", "end", "center", "baseline", "stretch"] }],
        "align-self": [{ self: ["auto", "start", "end", "center", "stretch", "baseline"] }],
        "place-content": [{ "place-content": [...K(), "baseline"] }],
        "place-items": [{ "place-items": ["start", "end", "center", "baseline", "stretch"] }],
        "place-self": [{ "place-self": ["auto", "start", "end", "center", "stretch"] }],
        p: [{ p: [Y] }],
        px: [{ px: [Y] }],
        py: [{ py: [Y] }],
        ps: [{ ps: [Y] }],
        pe: [{ pe: [Y] }],
        pt: [{ pt: [Y] }],
        pr: [{ pr: [Y] }],
        pb: [{ pb: [Y] }],
        pl: [{ pl: [Y] }],
        m: [{ m: [M] }],
        mx: [{ mx: [M] }],
        my: [{ my: [M] }],
        ms: [{ ms: [M] }],
        me: [{ me: [M] }],
        mt: [{ mt: [M] }],
        mr: [{ mr: [M] }],
        mb: [{ mb: [M] }],
        ml: [{ ml: [M] }],
        "space-x": [{ "space-x": [Q] }],
        "space-x-reverse": ["space-x-reverse"],
        "space-y": [{ "space-y": [Q] }],
        "space-y-reverse": ["space-y-reverse"],
        w: [{ w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", rt, u] }],
        "min-w": [{ "min-w": [rt, u, "min", "max", "fit"] }],
        "max-w": [
          { "max-w": [rt, u, "none", "full", "min", "max", "fit", "prose", { screen: [$n] }, $n] },
        ],
        h: [{ h: [rt, u, "auto", "min", "max", "fit", "svh", "lvh", "dvh"] }],
        "min-h": [{ "min-h": [rt, u, "min", "max", "fit", "svh", "lvh", "dvh"] }],
        "max-h": [{ "max-h": [rt, u, "min", "max", "fit", "svh", "lvh", "dvh"] }],
        size: [{ size: [rt, u, "auto", "min", "max", "fit"] }],
        "font-size": [{ text: ["base", $n, Jn] }],
        "font-smoothing": ["antialiased", "subpixel-antialiased"],
        "font-style": ["italic", "not-italic"],
        "font-weight": [
          {
            font: [
              "thin",
              "extralight",
              "light",
              "normal",
              "medium",
              "semibold",
              "bold",
              "extrabold",
              "black",
              Ar,
            ],
          },
        ],
        "font-family": [{ font: [si] }],
        "fvn-normal": ["normal-nums"],
        "fvn-ordinal": ["ordinal"],
        "fvn-slashed-zero": ["slashed-zero"],
        "fvn-figure": ["lining-nums", "oldstyle-nums"],
        "fvn-spacing": ["proportional-nums", "tabular-nums"],
        "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
        tracking: [{ tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", rt] }],
        "line-clamp": [{ "line-clamp": ["none", ia, Ar] }],
        leading: [{ leading: ["none", "tight", "snug", "normal", "relaxed", "loose", yn, rt] }],
        "list-image": [{ "list-image": ["none", rt] }],
        "list-style-type": [{ list: ["none", "disc", "decimal", rt] }],
        "list-style-position": [{ list: ["inside", "outside"] }],
        "placeholder-color": [{ placeholder: [a] }],
        "placeholder-opacity": [{ "placeholder-opacity": [V] }],
        "text-alignment": [{ text: ["left", "center", "right", "justify", "start", "end"] }],
        "text-color": [{ text: [a] }],
        "text-opacity": [{ "text-opacity": [V] }],
        "text-decoration": ["underline", "overline", "line-through", "no-underline"],
        "text-decoration-style": [{ decoration: [..._(), "wavy"] }],
        "text-decoration-thickness": [{ decoration: ["auto", "from-font", yn, Jn] }],
        "underline-offset": [{ "underline-offset": ["auto", yn, rt] }],
        "text-decoration-color": [{ decoration: [a] }],
        "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
        "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
        "text-wrap": [{ text: ["wrap", "nowrap", "balance", "pretty"] }],
        indent: [{ indent: I() }],
        "vertical-align": [
          {
            align: [
              "baseline",
              "top",
              "middle",
              "bottom",
              "text-top",
              "text-bottom",
              "sub",
              "super",
              rt,
            ],
          },
        ],
        whitespace: [
          { whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"] },
        ],
        break: [{ break: ["normal", "words", "all", "keep"] }],
        hyphens: [{ hyphens: ["none", "manual", "auto"] }],
        content: [{ content: ["none", rt] }],
        "bg-attachment": [{ bg: ["fixed", "local", "scroll"] }],
        "bg-clip": [{ "bg-clip": ["border", "padding", "content", "text"] }],
        "bg-opacity": [{ "bg-opacity": [V] }],
        "bg-origin": [{ "bg-origin": ["border", "padding", "content"] }],
        "bg-position": [{ bg: [...Ct(), g0] }],
        "bg-repeat": [{ bg: ["no-repeat", { repeat: ["", "x", "y", "round", "space"] }] }],
        "bg-size": [{ bg: ["auto", "cover", "contain", v0] }],
        "bg-image": [
          { bg: ["none", { "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"] }, x0] },
        ],
        "bg-color": [{ bg: [a] }],
        "gradient-from-pos": [{ from: [D] }],
        "gradient-via-pos": [{ via: [D] }],
        "gradient-to-pos": [{ to: [D] }],
        "gradient-from": [{ from: [z] }],
        "gradient-via": [{ via: [z] }],
        "gradient-to": [{ to: [z] }],
        rounded: [{ rounded: [d] }],
        "rounded-s": [{ "rounded-s": [d] }],
        "rounded-e": [{ "rounded-e": [d] }],
        "rounded-t": [{ "rounded-t": [d] }],
        "rounded-r": [{ "rounded-r": [d] }],
        "rounded-b": [{ "rounded-b": [d] }],
        "rounded-l": [{ "rounded-l": [d] }],
        "rounded-ss": [{ "rounded-ss": [d] }],
        "rounded-se": [{ "rounded-se": [d] }],
        "rounded-ee": [{ "rounded-ee": [d] }],
        "rounded-es": [{ "rounded-es": [d] }],
        "rounded-tl": [{ "rounded-tl": [d] }],
        "rounded-tr": [{ "rounded-tr": [d] }],
        "rounded-br": [{ "rounded-br": [d] }],
        "rounded-bl": [{ "rounded-bl": [d] }],
        "border-w": [{ border: [h] }],
        "border-w-x": [{ "border-x": [h] }],
        "border-w-y": [{ "border-y": [h] }],
        "border-w-s": [{ "border-s": [h] }],
        "border-w-e": [{ "border-e": [h] }],
        "border-w-t": [{ "border-t": [h] }],
        "border-w-r": [{ "border-r": [h] }],
        "border-w-b": [{ "border-b": [h] }],
        "border-w-l": [{ "border-l": [h] }],
        "border-opacity": [{ "border-opacity": [V] }],
        "border-style": [{ border: [..._(), "hidden"] }],
        "divide-x": [{ "divide-x": [h] }],
        "divide-x-reverse": ["divide-x-reverse"],
        "divide-y": [{ "divide-y": [h] }],
        "divide-y-reverse": ["divide-y-reverse"],
        "divide-opacity": [{ "divide-opacity": [V] }],
        "divide-style": [{ divide: _() }],
        "border-color": [{ border: [s] }],
        "border-color-x": [{ "border-x": [s] }],
        "border-color-y": [{ "border-y": [s] }],
        "border-color-s": [{ "border-s": [s] }],
        "border-color-e": [{ "border-e": [s] }],
        "border-color-t": [{ "border-t": [s] }],
        "border-color-r": [{ "border-r": [s] }],
        "border-color-b": [{ "border-b": [s] }],
        "border-color-l": [{ "border-l": [s] }],
        "divide-color": [{ divide: [s] }],
        "outline-style": [{ outline: ["", ..._()] }],
        "outline-offset": [{ "outline-offset": [yn, rt] }],
        "outline-w": [{ outline: [yn, Jn] }],
        "outline-color": [{ outline: [a] }],
        "ring-w": [{ ring: St() }],
        "ring-w-inset": ["ring-inset"],
        "ring-color": [{ ring: [a] }],
        "ring-opacity": [{ "ring-opacity": [V] }],
        "ring-offset-w": [{ "ring-offset": [yn, Jn] }],
        "ring-offset-color": [{ "ring-offset": [a] }],
        shadow: [{ shadow: ["", "inner", "none", $n, S0] }],
        "shadow-color": [{ shadow: [si] }],
        opacity: [{ opacity: [V] }],
        "mix-blend": [{ "mix-blend": [...G(), "plus-lighter", "plus-darker"] }],
        "bg-blend": [{ "bg-blend": G() }],
        filter: [{ filter: ["", "none"] }],
        blur: [{ blur: [r] }],
        brightness: [{ brightness: [o] }],
        contrast: [{ contrast: [v] }],
        "drop-shadow": [{ "drop-shadow": ["", "none", $n, rt] }],
        grayscale: [{ grayscale: [p] }],
        "hue-rotate": [{ "hue-rotate": [S] }],
        invert: [{ invert: [x] }],
        saturate: [{ saturate: [X] }],
        sepia: [{ sepia: [W] }],
        "backdrop-filter": [{ "backdrop-filter": ["", "none"] }],
        "backdrop-blur": [{ "backdrop-blur": [r] }],
        "backdrop-brightness": [{ "backdrop-brightness": [o] }],
        "backdrop-contrast": [{ "backdrop-contrast": [v] }],
        "backdrop-grayscale": [{ "backdrop-grayscale": [p] }],
        "backdrop-hue-rotate": [{ "backdrop-hue-rotate": [S] }],
        "backdrop-invert": [{ "backdrop-invert": [x] }],
        "backdrop-opacity": [{ "backdrop-opacity": [V] }],
        "backdrop-saturate": [{ "backdrop-saturate": [X] }],
        "backdrop-sepia": [{ "backdrop-sepia": [W] }],
        "border-collapse": [{ border: ["collapse", "separate"] }],
        "border-spacing": [{ "border-spacing": [m] }],
        "border-spacing-x": [{ "border-spacing-x": [m] }],
        "border-spacing-y": [{ "border-spacing-y": [m] }],
        "table-layout": [{ table: ["auto", "fixed"] }],
        caption: [{ caption: ["top", "bottom"] }],
        transition: [
          { transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", rt] },
        ],
        duration: [{ duration: A() }],
        ease: [{ ease: ["linear", "in", "out", "in-out", rt] }],
        delay: [{ delay: A() }],
        animate: [{ animate: ["none", "spin", "ping", "pulse", "bounce", rt] }],
        transform: [{ transform: ["", "gpu", "none"] }],
        scale: [{ scale: [Z] }],
        "scale-x": [{ "scale-x": [Z] }],
        "scale-y": [{ "scale-y": [Z] }],
        rotate: [{ rotate: [ri, rt] }],
        "translate-x": [{ "translate-x": [et] }],
        "translate-y": [{ "translate-y": [et] }],
        "skew-x": [{ "skew-x": [F] }],
        "skew-y": [{ "skew-y": [F] }],
        "transform-origin": [
          {
            origin: [
              "center",
              "top",
              "top-right",
              "right",
              "bottom-right",
              "bottom",
              "bottom-left",
              "left",
              "top-left",
              rt,
            ],
          },
        ],
        accent: [{ accent: ["auto", a] }],
        appearance: [{ appearance: ["none", "auto"] }],
        cursor: [
          {
            cursor: [
              "auto",
              "default",
              "pointer",
              "wait",
              "text",
              "move",
              "help",
              "not-allowed",
              "none",
              "context-menu",
              "progress",
              "cell",
              "crosshair",
              "vertical-text",
              "alias",
              "copy",
              "no-drop",
              "grab",
              "grabbing",
              "all-scroll",
              "col-resize",
              "row-resize",
              "n-resize",
              "e-resize",
              "s-resize",
              "w-resize",
              "ne-resize",
              "nw-resize",
              "se-resize",
              "sw-resize",
              "ew-resize",
              "ns-resize",
              "nesw-resize",
              "nwse-resize",
              "zoom-in",
              "zoom-out",
              rt,
            ],
          },
        ],
        "caret-color": [{ caret: [a] }],
        "pointer-events": [{ "pointer-events": ["none", "auto"] }],
        resize: [{ resize: ["none", "y", "x", ""] }],
        "scroll-behavior": [{ scroll: ["auto", "smooth"] }],
        "scroll-m": [{ "scroll-m": I() }],
        "scroll-mx": [{ "scroll-mx": I() }],
        "scroll-my": [{ "scroll-my": I() }],
        "scroll-ms": [{ "scroll-ms": I() }],
        "scroll-me": [{ "scroll-me": I() }],
        "scroll-mt": [{ "scroll-mt": I() }],
        "scroll-mr": [{ "scroll-mr": I() }],
        "scroll-mb": [{ "scroll-mb": I() }],
        "scroll-ml": [{ "scroll-ml": I() }],
        "scroll-p": [{ "scroll-p": I() }],
        "scroll-px": [{ "scroll-px": I() }],
        "scroll-py": [{ "scroll-py": I() }],
        "scroll-ps": [{ "scroll-ps": I() }],
        "scroll-pe": [{ "scroll-pe": I() }],
        "scroll-pt": [{ "scroll-pt": I() }],
        "scroll-pr": [{ "scroll-pr": I() }],
        "scroll-pb": [{ "scroll-pb": I() }],
        "scroll-pl": [{ "scroll-pl": I() }],
        "snap-align": [{ snap: ["start", "end", "center", "align-none"] }],
        "snap-stop": [{ snap: ["normal", "always"] }],
        "snap-type": [{ snap: ["none", "x", "y", "both"] }],
        "snap-strictness": [{ snap: ["mandatory", "proximity"] }],
        touch: [{ touch: ["auto", "none", "manipulation"] }],
        "touch-x": [{ "touch-pan": ["x", "left", "right"] }],
        "touch-y": [{ "touch-pan": ["y", "up", "down"] }],
        "touch-pz": ["touch-pinch-zoom"],
        select: [{ select: ["none", "text", "all", "auto"] }],
        "will-change": [{ "will-change": ["auto", "scroll", "contents", "transform", rt] }],
        fill: [{ fill: [a, "none"] }],
        "stroke-w": [{ stroke: [yn, Jn, Ar] }],
        stroke: [{ stroke: [a, "none"] }],
        sr: ["sr-only", "not-sr-only"],
        "forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }],
      },
      conflictingClassGroups: {
        overflow: ["overflow-x", "overflow-y"],
        overscroll: ["overscroll-x", "overscroll-y"],
        inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
        "inset-x": ["right", "left"],
        "inset-y": ["top", "bottom"],
        flex: ["basis", "grow", "shrink"],
        gap: ["gap-x", "gap-y"],
        p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
        px: ["pr", "pl"],
        py: ["pt", "pb"],
        m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
        mx: ["mr", "ml"],
        my: ["mt", "mb"],
        size: ["w", "h"],
        "font-size": ["leading"],
        "fvn-normal": [
          "fvn-ordinal",
          "fvn-slashed-zero",
          "fvn-figure",
          "fvn-spacing",
          "fvn-fraction",
        ],
        "fvn-ordinal": ["fvn-normal"],
        "fvn-slashed-zero": ["fvn-normal"],
        "fvn-figure": ["fvn-normal"],
        "fvn-spacing": ["fvn-normal"],
        "fvn-fraction": ["fvn-normal"],
        "line-clamp": ["display", "overflow"],
        rounded: [
          "rounded-s",
          "rounded-e",
          "rounded-t",
          "rounded-r",
          "rounded-b",
          "rounded-l",
          "rounded-ss",
          "rounded-se",
          "rounded-ee",
          "rounded-es",
          "rounded-tl",
          "rounded-tr",
          "rounded-br",
          "rounded-bl",
        ],
        "rounded-s": ["rounded-ss", "rounded-es"],
        "rounded-e": ["rounded-se", "rounded-ee"],
        "rounded-t": ["rounded-tl", "rounded-tr"],
        "rounded-r": ["rounded-tr", "rounded-br"],
        "rounded-b": ["rounded-br", "rounded-bl"],
        "rounded-l": ["rounded-tl", "rounded-bl"],
        "border-spacing": ["border-spacing-x", "border-spacing-y"],
        "border-w": [
          "border-w-s",
          "border-w-e",
          "border-w-t",
          "border-w-r",
          "border-w-b",
          "border-w-l",
        ],
        "border-w-x": ["border-w-r", "border-w-l"],
        "border-w-y": ["border-w-t", "border-w-b"],
        "border-color": [
          "border-color-s",
          "border-color-e",
          "border-color-t",
          "border-color-r",
          "border-color-b",
          "border-color-l",
        ],
        "border-color-x": ["border-color-r", "border-color-l"],
        "border-color-y": ["border-color-t", "border-color-b"],
        "scroll-m": [
          "scroll-mx",
          "scroll-my",
          "scroll-ms",
          "scroll-me",
          "scroll-mt",
          "scroll-mr",
          "scroll-mb",
          "scroll-ml",
        ],
        "scroll-mx": ["scroll-mr", "scroll-ml"],
        "scroll-my": ["scroll-mt", "scroll-mb"],
        "scroll-p": [
          "scroll-px",
          "scroll-py",
          "scroll-ps",
          "scroll-pe",
          "scroll-pt",
          "scroll-pr",
          "scroll-pb",
          "scroll-pl",
        ],
        "scroll-px": ["scroll-pr", "scroll-pl"],
        "scroll-py": ["scroll-pt", "scroll-pb"],
        touch: ["touch-x", "touch-y", "touch-pz"],
        "touch-x": ["touch"],
        "touch-y": ["touch"],
        "touch-pz": ["touch"],
      },
      conflictingClassGroupModifiers: { "font-size": ["leading"] },
    };
  },
  N0 = c0(C0);
function ne(...a) {
  return N0(Qh(a));
}
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const O0 = (a) => a.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
  Wh = (...a) =>
    a
      .filter((u, r, o) => !!u && u.trim() !== "" && o.indexOf(u) === r)
      .join(" ")
      .trim();
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var w0 = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _0 = g.forwardRef(
  (
    {
      color: a = "currentColor",
      size: u = 24,
      strokeWidth: r = 2,
      absoluteStrokeWidth: o,
      className: s = "",
      children: d,
      iconNode: m,
      ...h
    },
    v,
  ) =>
    g.createElement(
      "svg",
      {
        ref: v,
        ...w0,
        width: u,
        height: u,
        stroke: a,
        strokeWidth: o ? (Number(r) * 24) / Number(u) : r,
        className: Wh("lucide", s),
        ...h,
      },
      [...m.map(([p, S]) => g.createElement(p, S)), ...(Array.isArray(d) ? d : [d])],
    ),
);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Wt = (a, u) => {
  const r = g.forwardRef(({ className: o, ...s }, d) =>
    g.createElement(_0, { ref: d, iconNode: u, className: Wh(`lucide-${O0(a)}`, o), ...s }),
  );
  return ((r.displayName = `${a}`), r);
};
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const R0 = [
    [
      "path",
      {
        d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
        key: "169zse",
      },
    ],
  ],
  Fh = Wt("Activity", R0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const z0 = [
    ["path", { d: "M12 5v14", key: "s699le" }],
    ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }],
  ],
  j0 = Wt("ArrowDown", z0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const M0 = [
    ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
    ["path", { d: "M12 19V5", key: "x0mq9r" }],
  ],
  D0 = Wt("ArrowUp", M0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const U0 = [
    [
      "path",
      {
        d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",
        key: "hh9hay",
      },
    ],
    ["path", { d: "m3.3 7 8.7 5 8.7-5", key: "g66t2b" }],
    ["path", { d: "M12 22V12", key: "d0xqtd" }],
  ],
  H0 = Wt("Box", U0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const B0 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]],
  L0 = Wt("Check", B0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const q0 = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }],
  ],
  V0 = Wt("Clock", q0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Y0 = [
    ["rect", { width: "16", height: "16", x: "4", y: "4", rx: "2", key: "14l7u7" }],
    ["rect", { width: "6", height: "6", x: "9", y: "9", rx: "1", key: "5aljv4" }],
    ["path", { d: "M15 2v2", key: "13l42r" }],
    ["path", { d: "M15 20v2", key: "15mkzm" }],
    ["path", { d: "M2 15h2", key: "1gxd5l" }],
    ["path", { d: "M2 9h2", key: "1bbxkp" }],
    ["path", { d: "M20 15h2", key: "19e6y8" }],
    ["path", { d: "M20 9h2", key: "19tzq7" }],
    ["path", { d: "M9 2v2", key: "165o2o" }],
    ["path", { d: "M9 20v2", key: "i2bqo8" }],
  ],
  G0 = Wt("Cpu", Y0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const X0 = [
    ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
    ["path", { d: "M12 16v-4", key: "1dtifu" }],
    ["path", { d: "M12 8h.01", key: "e9boi3" }],
  ],
  Q0 = Wt("Info", X0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Z0 = [
    [
      "path",
      {
        d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
        key: "zw3jo",
      },
    ],
    [
      "path",
      {
        d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
        key: "1wduqc",
      },
    ],
    [
      "path",
      {
        d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
        key: "kqbvx6",
      },
    ],
  ],
  K0 = Wt("Layers", Z0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const J0 = [
    ["rect", { x: "16", y: "16", width: "6", height: "6", rx: "1", key: "4q2zg0" }],
    ["rect", { x: "2", y: "16", width: "6", height: "6", rx: "1", key: "8cvhb9" }],
    ["rect", { x: "9", y: "2", width: "6", height: "6", rx: "1", key: "1egb70" }],
    ["path", { d: "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3", key: "1jsf9p" }],
    ["path", { d: "M12 12V8", key: "2874zd" }],
  ],
  $0 = Wt("Network", J0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const k0 = [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]],
  W0 = Wt("Play", k0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const F0 = [
    ["path", { d: "M4.9 19.1C1 15.2 1 8.8 4.9 4.9", key: "1vaf9d" }],
    ["path", { d: "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5", key: "u1ii0m" }],
    ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
    ["path", { d: "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5", key: "1j5fej" }],
    ["path", { d: "M19.1 4.9C23 8.8 23 15.1 19.1 19", key: "10b0cb" }],
  ],
  _r = Wt("Radio", F0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const P0 = [
    ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
    ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }],
  ],
  Ph = Wt("Search", P0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const I0 = [
    ["rect", { width: "20", height: "8", x: "2", y: "2", rx: "2", ry: "2", key: "ngkwjq" }],
    ["rect", { width: "20", height: "8", x: "2", y: "14", rx: "2", ry: "2", key: "iecqi9" }],
    ["line", { x1: "6", x2: "6.01", y1: "6", y2: "6", key: "16zg32" }],
    ["line", { x1: "6", x2: "6.01", y1: "18", y2: "18", key: "nzw8ys" }],
  ],
  bh = Wt("Server", I0);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const tb = [
    [
      "path",
      {
        d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
        key: "1qme2f",
      },
    ],
    ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
  ],
  eb = Wt("Settings", tb);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const nb = [
    ["path", { d: "M3 6h18", key: "d0wm0j" }],
    ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
    ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
    ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
    ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }],
  ],
  lb = Wt("Trash2", nb);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ab = [
    ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
    ["path", { d: "m6 6 12 12", key: "d8bk6v" }],
  ],
  ib = Wt("X", ab);
/**
 * @license lucide-react v0.473.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ub = [
    [
      "path",
      {
        d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
        key: "1xq2db",
      },
    ],
  ],
  Rr = Wt("Zap", ub);
function xh(a, u) {
  if (typeof a == "function") return a(u);
  a != null && (a.current = u);
}
function Ye(...a) {
  return (u) => {
    let r = !1;
    const o = a.map((s) => {
      const d = xh(s, u);
      return (!r && typeof d == "function" && (r = !0), d);
    });
    if (r)
      return () => {
        for (let s = 0; s < o.length; s++) {
          const d = o[s];
          typeof d == "function" ? d() : xh(a[s], null);
        }
      };
  };
}
function $e(...a) {
  return g.useCallback(Ye(...a), a);
}
var cb = Symbol.for("react.lazy"),
  Lu = Gr[" use ".trim().toString()];
function ob(a) {
  return typeof a == "object" && a !== null && "then" in a;
}
function Ih(a) {
  return (
    a != null &&
    typeof a == "object" &&
    "$$typeof" in a &&
    a.$$typeof === cb &&
    "_payload" in a &&
    ob(a._payload)
  );
}
function tp(a) {
  const u = sb(a),
    r = g.forwardRef((o, s) => {
      let { children: d, ...m } = o;
      Ih(d) && typeof Lu == "function" && (d = Lu(d._payload));
      const h = g.Children.toArray(d),
        v = h.find(db);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
var rb = tp("Slot");
function sb(a) {
  const u = g.forwardRef((r, o) => {
    let { children: s, ...d } = r;
    if ((Ih(s) && typeof Lu == "function" && (s = Lu(s._payload)), g.isValidElement(s))) {
      const m = hb(s),
        h = mb(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var fb = Symbol("radix.slottable");
function db(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === fb
  );
}
function mb(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function hb(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
const Sh = (a) => (typeof a == "boolean" ? `${a}` : a === 0 ? "0" : a),
  Eh = Qh,
  ep = (a, u) => (r) => {
    var o;
    if (u?.variants == null) return Eh(a, r?.class, r?.className);
    const { variants: s, defaultVariants: d } = u,
      m = Object.keys(s).map((p) => {
        const S = r?.[p],
          x = d?.[p];
        if (S === null) return null;
        const N = Sh(S) || Sh(x);
        return s[p][N];
      }),
      h =
        r &&
        Object.entries(r).reduce((p, S) => {
          let [x, N] = S;
          return (N === void 0 || (p[x] = N), p);
        }, {}),
      v =
        u == null || (o = u.compoundVariants) === null || o === void 0
          ? void 0
          : o.reduce((p, S) => {
              let { class: x, className: N, ...z } = S;
              return Object.entries(z).every((D) => {
                let [U, M] = D;
                return Array.isArray(M) ? M.includes({ ...d, ...h }[U]) : { ...d, ...h }[U] === M;
              })
                ? [...p, x, N]
                : p;
            }, []);
    return Eh(a, m, v, r?.class, r?.className);
  },
  pb = ep(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
      variants: {
        variant: {
          default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
          destructive:
            "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
          outline:
            "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
          secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
          ghost: "hover:bg-accent hover:text-accent-foreground",
          link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
          default: "h-9 px-4 py-2",
          sm: "h-8 rounded-md px-3 text-xs",
          lg: "h-10 rounded-md px-8",
          icon: "h-9 w-9",
        },
      },
      defaultVariants: { variant: "default", size: "default" },
    },
  ),
  Xu = g.forwardRef(({ className: a, variant: u, size: r, asChild: o = !1, ...s }, d) => {
    const m = o ? rb : "button";
    return b.jsx(m, { className: ne(pb({ variant: u, size: r, className: a })), ref: d, ...s });
  });
Xu.displayName = "Button";
var Qr = Gh();
const yb = Yh(Qr);
var vb = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  gb = vb.reduce((a, u) => {
    const r = tp(`Primitive.${u}`),
      o = g.forwardRef((s, d) => {
        const { asChild: m, ...h } = s,
          v = m ? r : u;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          b.jsx(v, { ...h, ref: d })
        );
      });
    return ((o.displayName = `Primitive.${u}`), { ...a, [u]: o });
  }, {}),
  bb = "Separator",
  Ah = "horizontal",
  xb = ["horizontal", "vertical"],
  np = g.forwardRef((a, u) => {
    const { decorative: r, orientation: o = Ah, ...s } = a,
      d = Sb(o) ? o : Ah,
      h = r
        ? { role: "none" }
        : { "aria-orientation": d === "vertical" ? d : void 0, role: "separator" };
    return b.jsx(gb.div, { "data-orientation": d, ...h, ...s, ref: u });
  });
np.displayName = bb;
function Sb(a) {
  return xb.includes(a);
}
var lp = np;
const ap = g.forwardRef(
  ({ className: a, orientation: u = "horizontal", decorative: r = !0, ...o }, s) =>
    b.jsx(lp, {
      ref: s,
      decorative: r,
      orientation: u,
      className: ne(
        "shrink-0 bg-border",
        u === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        a,
      ),
      ...o,
    }),
);
ap.displayName = lp.displayName;
function kt(a, u, { checkForDefaultPrevented: r = !0 } = {}) {
  return function (s) {
    if ((a?.(s), r === !1 || !s.defaultPrevented)) return u?.(s);
  };
}
function mi(a, u = []) {
  let r = [];
  function o(d, m) {
    const h = g.createContext(m),
      v = r.length;
    r = [...r, m];
    const p = (x) => {
      const { scope: N, children: z, ...D } = x,
        U = N?.[a]?.[v] || h,
        M = g.useMemo(() => D, Object.values(D));
      return b.jsx(U.Provider, { value: M, children: z });
    };
    p.displayName = d + "Provider";
    function S(x, N) {
      const z = N?.[a]?.[v] || h,
        D = g.useContext(z);
      if (D) return D;
      if (m !== void 0) return m;
      throw new Error(`\`${x}\` must be used within \`${d}\``);
    }
    return [p, S];
  }
  const s = () => {
    const d = r.map((m) => g.createContext(m));
    return function (h) {
      const v = h?.[a] || d;
      return g.useMemo(() => ({ [`__scope${a}`]: { ...h, [a]: v } }), [h, v]);
    };
  };
  return ((s.scopeName = a), [o, Eb(s, ...u)]);
}
function Eb(...a) {
  const u = a[0];
  if (a.length === 1) return u;
  const r = () => {
    const o = a.map((s) => ({ useScope: s(), scopeName: s.scopeName }));
    return function (d) {
      const m = o.reduce((h, { useScope: v, scopeName: p }) => {
        const x = v(d)[`__scope${p}`];
        return { ...h, ...x };
      }, {});
      return g.useMemo(() => ({ [`__scope${u.scopeName}`]: m }), [m]);
    };
  };
  return ((r.scopeName = u.scopeName), r);
}
function Ab(a) {
  const u = Tb(a),
    r = g.forwardRef((o, s) => {
      const { children: d, ...m } = o,
        h = g.Children.toArray(d),
        v = h.find(Nb);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
function Tb(a) {
  const u = g.forwardRef((r, o) => {
    const { children: s, ...d } = r;
    if (g.isValidElement(s)) {
      const m = wb(s),
        h = Ob(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var Cb = Symbol("radix.slottable");
function Nb(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === Cb
  );
}
function Ob(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function wb(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
var _b = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  ip = _b.reduce((a, u) => {
    const r = Ab(`Primitive.${u}`),
      o = g.forwardRef((s, d) => {
        const { asChild: m, ...h } = s,
          v = m ? r : u;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          b.jsx(v, { ...h, ref: d })
        );
      });
    return ((o.displayName = `Primitive.${u}`), { ...a, [u]: o });
  }, {});
function Rb(a, u) {
  a && Qr.flushSync(() => a.dispatchEvent(u));
}
function hi(a) {
  const u = g.useRef(a);
  return (
    g.useEffect(() => {
      u.current = a;
    }),
    g.useMemo(
      () =>
        (...r) =>
          u.current?.(...r),
      [],
    )
  );
}
function zb(a, u = globalThis?.document) {
  const r = hi(a);
  g.useEffect(() => {
    const o = (s) => {
      s.key === "Escape" && r(s);
    };
    return (
      u.addEventListener("keydown", o, { capture: !0 }),
      () => u.removeEventListener("keydown", o, { capture: !0 })
    );
  }, [r, u]);
}
var jb = "DismissableLayer",
  zr = "dismissableLayer.update",
  Mb = "dismissableLayer.pointerDownOutside",
  Db = "dismissableLayer.focusOutside",
  Th,
  up = g.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
  }),
  cp = g.forwardRef((a, u) => {
    const {
        disableOutsidePointerEvents: r = !1,
        onEscapeKeyDown: o,
        onPointerDownOutside: s,
        onFocusOutside: d,
        onInteractOutside: m,
        onDismiss: h,
        ...v
      } = a,
      p = g.useContext(up),
      [S, x] = g.useState(null),
      N = S?.ownerDocument ?? globalThis?.document,
      [, z] = g.useState({}),
      D = $e(u, (Q) => x(Q)),
      U = Array.from(p.layers),
      [M] = [...p.layersWithOutsidePointerEventsDisabled].slice(-1),
      V = U.indexOf(M),
      Y = S ? U.indexOf(S) : -1,
      X = p.layersWithOutsidePointerEventsDisabled.size > 0,
      Z = Y >= V,
      W = Bb((Q) => {
        const et = Q.target,
          bt = [...p.branches].some((ht) => ht.contains(et));
        !Z || bt || (s?.(Q), m?.(Q), Q.defaultPrevented || h?.());
      }, N),
      F = Lb((Q) => {
        const et = Q.target;
        [...p.branches].some((ht) => ht.contains(et)) ||
          (d?.(Q), m?.(Q), Q.defaultPrevented || h?.());
      }, N);
    return (
      zb((Q) => {
        Y === p.layers.size - 1 && (o?.(Q), !Q.defaultPrevented && h && (Q.preventDefault(), h()));
      }, N),
      g.useEffect(() => {
        if (S)
          return (
            r &&
              (p.layersWithOutsidePointerEventsDisabled.size === 0 &&
                ((Th = N.body.style.pointerEvents), (N.body.style.pointerEvents = "none")),
              p.layersWithOutsidePointerEventsDisabled.add(S)),
            p.layers.add(S),
            Ch(),
            () => {
              r &&
                p.layersWithOutsidePointerEventsDisabled.size === 1 &&
                (N.body.style.pointerEvents = Th);
            }
          );
      }, [S, N, r, p]),
      g.useEffect(
        () => () => {
          S && (p.layers.delete(S), p.layersWithOutsidePointerEventsDisabled.delete(S), Ch());
        },
        [S, p],
      ),
      g.useEffect(() => {
        const Q = () => z({});
        return (document.addEventListener(zr, Q), () => document.removeEventListener(zr, Q));
      }, []),
      b.jsx(ip.div, {
        ...v,
        ref: D,
        style: { pointerEvents: X ? (Z ? "auto" : "none") : void 0, ...a.style },
        onFocusCapture: kt(a.onFocusCapture, F.onFocusCapture),
        onBlurCapture: kt(a.onBlurCapture, F.onBlurCapture),
        onPointerDownCapture: kt(a.onPointerDownCapture, W.onPointerDownCapture),
      })
    );
  });
cp.displayName = jb;
var Ub = "DismissableLayerBranch",
  Hb = g.forwardRef((a, u) => {
    const r = g.useContext(up),
      o = g.useRef(null),
      s = $e(u, o);
    return (
      g.useEffect(() => {
        const d = o.current;
        if (d)
          return (
            r.branches.add(d),
            () => {
              r.branches.delete(d);
            }
          );
      }, [r.branches]),
      b.jsx(ip.div, { ...a, ref: s })
    );
  });
Hb.displayName = Ub;
function Bb(a, u = globalThis?.document) {
  const r = hi(a),
    o = g.useRef(!1),
    s = g.useRef(() => {});
  return (
    g.useEffect(() => {
      const d = (h) => {
          if (h.target && !o.current) {
            let v = function () {
              op(Mb, r, p, { discrete: !0 });
            };
            const p = { originalEvent: h };
            h.pointerType === "touch"
              ? (u.removeEventListener("click", s.current),
                (s.current = v),
                u.addEventListener("click", s.current, { once: !0 }))
              : v();
          } else u.removeEventListener("click", s.current);
          o.current = !1;
        },
        m = window.setTimeout(() => {
          u.addEventListener("pointerdown", d);
        }, 0);
      return () => {
        (window.clearTimeout(m),
          u.removeEventListener("pointerdown", d),
          u.removeEventListener("click", s.current));
      };
    }, [u, r]),
    { onPointerDownCapture: () => (o.current = !0) }
  );
}
function Lb(a, u = globalThis?.document) {
  const r = hi(a),
    o = g.useRef(!1);
  return (
    g.useEffect(() => {
      const s = (d) => {
        d.target && !o.current && op(Db, r, { originalEvent: d }, { discrete: !1 });
      };
      return (u.addEventListener("focusin", s), () => u.removeEventListener("focusin", s));
    }, [u, r]),
    { onFocusCapture: () => (o.current = !0), onBlurCapture: () => (o.current = !1) }
  );
}
function Ch() {
  const a = new CustomEvent(zr);
  document.dispatchEvent(a);
}
function op(a, u, r, { discrete: o }) {
  const s = r.originalEvent.target,
    d = new CustomEvent(a, { bubbles: !1, cancelable: !0, detail: r });
  (u && s.addEventListener(a, u, { once: !0 }), o ? Rb(s, d) : s.dispatchEvent(d));
}
var kn = globalThis?.document ? g.useLayoutEffect : () => {},
  qb = Gr[" useId ".trim().toString()] || (() => {}),
  Vb = 0;
function Zr(a) {
  const [u, r] = g.useState(qb());
  return (
    kn(() => {
      r((o) => o ?? String(Vb++));
    }, [a]),
    u ? `radix-${u}` : ""
  );
}
const Yb = ["top", "right", "bottom", "left"],
  Wn = Math.min,
  Ee = Math.max,
  qu = Math.round,
  Uu = Math.floor,
  Je = (a) => ({ x: a, y: a }),
  Gb = { left: "right", right: "left", bottom: "top", top: "bottom" },
  Xb = { start: "end", end: "start" };
function jr(a, u, r) {
  return Ee(a, Wn(u, r));
}
function vn(a, u) {
  return typeof a == "function" ? a(u) : a;
}
function gn(a) {
  return a.split("-")[0];
}
function da(a) {
  return a.split("-")[1];
}
function Kr(a) {
  return a === "x" ? "y" : "x";
}
function Jr(a) {
  return a === "y" ? "height" : "width";
}
const Qb = new Set(["top", "bottom"]);
function Ke(a) {
  return Qb.has(gn(a)) ? "y" : "x";
}
function $r(a) {
  return Kr(Ke(a));
}
function Zb(a, u, r) {
  r === void 0 && (r = !1);
  const o = da(a),
    s = $r(a),
    d = Jr(s);
  let m =
    s === "x" ? (o === (r ? "end" : "start") ? "right" : "left") : o === "start" ? "bottom" : "top";
  return (u.reference[d] > u.floating[d] && (m = Vu(m)), [m, Vu(m)]);
}
function Kb(a) {
  const u = Vu(a);
  return [Mr(a), u, Mr(u)];
}
function Mr(a) {
  return a.replace(/start|end/g, (u) => Xb[u]);
}
const Nh = ["left", "right"],
  Oh = ["right", "left"],
  Jb = ["top", "bottom"],
  $b = ["bottom", "top"];
function kb(a, u, r) {
  switch (a) {
    case "top":
    case "bottom":
      return r ? (u ? Oh : Nh) : u ? Nh : Oh;
    case "left":
    case "right":
      return u ? Jb : $b;
    default:
      return [];
  }
}
function Wb(a, u, r, o) {
  const s = da(a);
  let d = kb(gn(a), r === "start", o);
  return (s && ((d = d.map((m) => m + "-" + s)), u && (d = d.concat(d.map(Mr)))), d);
}
function Vu(a) {
  return a.replace(/left|right|bottom|top/g, (u) => Gb[u]);
}
function Fb(a) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...a };
}
function rp(a) {
  return typeof a != "number" ? Fb(a) : { top: a, right: a, bottom: a, left: a };
}
function Yu(a) {
  const { x: u, y: r, width: o, height: s } = a;
  return { width: o, height: s, top: r, left: u, right: u + o, bottom: r + s, x: u, y: r };
}
function wh(a, u, r) {
  let { reference: o, floating: s } = a;
  const d = Ke(u),
    m = $r(u),
    h = Jr(m),
    v = gn(u),
    p = d === "y",
    S = o.x + o.width / 2 - s.width / 2,
    x = o.y + o.height / 2 - s.height / 2,
    N = o[h] / 2 - s[h] / 2;
  let z;
  switch (v) {
    case "top":
      z = { x: S, y: o.y - s.height };
      break;
    case "bottom":
      z = { x: S, y: o.y + o.height };
      break;
    case "right":
      z = { x: o.x + o.width, y: x };
      break;
    case "left":
      z = { x: o.x - s.width, y: x };
      break;
    default:
      z = { x: o.x, y: o.y };
  }
  switch (da(u)) {
    case "start":
      z[m] -= N * (r && p ? -1 : 1);
      break;
    case "end":
      z[m] += N * (r && p ? -1 : 1);
      break;
  }
  return z;
}
async function Pb(a, u) {
  var r;
  u === void 0 && (u = {});
  const { x: o, y: s, platform: d, rects: m, elements: h, strategy: v } = a,
    {
      boundary: p = "clippingAncestors",
      rootBoundary: S = "viewport",
      elementContext: x = "floating",
      altBoundary: N = !1,
      padding: z = 0,
    } = vn(u, a),
    D = rp(z),
    M = h[N ? (x === "floating" ? "reference" : "floating") : x],
    V = Yu(
      await d.getClippingRect({
        element:
          (r = await (d.isElement == null ? void 0 : d.isElement(M))) == null || r
            ? M
            : M.contextElement ||
              (await (d.getDocumentElement == null ? void 0 : d.getDocumentElement(h.floating))),
        boundary: p,
        rootBoundary: S,
        strategy: v,
      }),
    ),
    Y =
      x === "floating"
        ? { x: o, y: s, width: m.floating.width, height: m.floating.height }
        : m.reference,
    X = await (d.getOffsetParent == null ? void 0 : d.getOffsetParent(h.floating)),
    Z = (await (d.isElement == null ? void 0 : d.isElement(X)))
      ? (await (d.getScale == null ? void 0 : d.getScale(X))) || { x: 1, y: 1 }
      : { x: 1, y: 1 },
    W = Yu(
      d.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await d.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: h,
            rect: Y,
            offsetParent: X,
            strategy: v,
          })
        : Y,
    );
  return {
    top: (V.top - W.top + D.top) / Z.y,
    bottom: (W.bottom - V.bottom + D.bottom) / Z.y,
    left: (V.left - W.left + D.left) / Z.x,
    right: (W.right - V.right + D.right) / Z.x,
  };
}
const Ib = async (a, u, r) => {
    const {
        placement: o = "bottom",
        strategy: s = "absolute",
        middleware: d = [],
        platform: m,
      } = r,
      h = d.filter(Boolean),
      v = await (m.isRTL == null ? void 0 : m.isRTL(u));
    let p = await m.getElementRects({ reference: a, floating: u, strategy: s }),
      { x: S, y: x } = wh(p, o, v),
      N = o,
      z = {},
      D = 0;
    for (let M = 0; M < h.length; M++) {
      var U;
      const { name: V, fn: Y } = h[M],
        {
          x: X,
          y: Z,
          data: W,
          reset: F,
        } = await Y({
          x: S,
          y: x,
          initialPlacement: o,
          placement: N,
          strategy: s,
          middlewareData: z,
          rects: p,
          platform: { ...m, detectOverflow: (U = m.detectOverflow) != null ? U : Pb },
          elements: { reference: a, floating: u },
        });
      ((S = X ?? S),
        (x = Z ?? x),
        (z = { ...z, [V]: { ...z[V], ...W } }),
        F &&
          D <= 50 &&
          (D++,
          typeof F == "object" &&
            (F.placement && (N = F.placement),
            F.rects &&
              (p =
                F.rects === !0
                  ? await m.getElementRects({ reference: a, floating: u, strategy: s })
                  : F.rects),
            ({ x: S, y: x } = wh(p, N, v))),
          (M = -1)));
    }
    return { x: S, y: x, placement: N, strategy: s, middlewareData: z };
  },
  t1 = (a) => ({
    name: "arrow",
    options: a,
    async fn(u) {
      const { x: r, y: o, placement: s, rects: d, platform: m, elements: h, middlewareData: v } = u,
        { element: p, padding: S = 0 } = vn(a, u) || {};
      if (p == null) return {};
      const x = rp(S),
        N = { x: r, y: o },
        z = $r(s),
        D = Jr(z),
        U = await m.getDimensions(p),
        M = z === "y",
        V = M ? "top" : "left",
        Y = M ? "bottom" : "right",
        X = M ? "clientHeight" : "clientWidth",
        Z = d.reference[D] + d.reference[z] - N[z] - d.floating[D],
        W = N[z] - d.reference[z],
        F = await (m.getOffsetParent == null ? void 0 : m.getOffsetParent(p));
      let Q = F ? F[X] : 0;
      (!Q || !(await (m.isElement == null ? void 0 : m.isElement(F)))) &&
        (Q = h.floating[X] || d.floating[D]);
      const et = Z / 2 - W / 2,
        bt = Q / 2 - U[D] / 2 - 1,
        ht = Wn(x[V], bt),
        xt = Wn(x[Y], bt),
        I = ht,
        St = Q - U[D] - xt,
        ft = Q / 2 - U[D] / 2 + et,
        Ct = jr(I, ft, St),
        _ =
          !v.arrow &&
          da(s) != null &&
          ft !== Ct &&
          d.reference[D] / 2 - (ft < I ? ht : xt) - U[D] / 2 < 0,
        G = _ ? (ft < I ? ft - I : ft - St) : 0;
      return {
        [z]: N[z] + G,
        data: { [z]: Ct, centerOffset: ft - Ct - G, ...(_ && { alignmentOffset: G }) },
        reset: _,
      };
    },
  }),
  e1 = function (a) {
    return (
      a === void 0 && (a = {}),
      {
        name: "flip",
        options: a,
        async fn(u) {
          var r, o;
          const {
              placement: s,
              middlewareData: d,
              rects: m,
              initialPlacement: h,
              platform: v,
              elements: p,
            } = u,
            {
              mainAxis: S = !0,
              crossAxis: x = !0,
              fallbackPlacements: N,
              fallbackStrategy: z = "bestFit",
              fallbackAxisSideDirection: D = "none",
              flipAlignment: U = !0,
              ...M
            } = vn(a, u);
          if ((r = d.arrow) != null && r.alignmentOffset) return {};
          const V = gn(s),
            Y = Ke(h),
            X = gn(h) === h,
            Z = await (v.isRTL == null ? void 0 : v.isRTL(p.floating)),
            W = N || (X || !U ? [Vu(h)] : Kb(h)),
            F = D !== "none";
          !N && F && W.push(...Wb(h, U, D, Z));
          const Q = [h, ...W],
            et = await v.detectOverflow(u, M),
            bt = [];
          let ht = ((o = d.flip) == null ? void 0 : o.overflows) || [];
          if ((S && bt.push(et[V]), x)) {
            const ft = Zb(s, m, Z);
            bt.push(et[ft[0]], et[ft[1]]);
          }
          if (((ht = [...ht, { placement: s, overflows: bt }]), !bt.every((ft) => ft <= 0))) {
            var xt, I;
            const ft = (((xt = d.flip) == null ? void 0 : xt.index) || 0) + 1,
              Ct = Q[ft];
            if (
              Ct &&
              (!(x === "alignment" ? Y !== Ke(Ct) : !1) ||
                ht.every((K) => (Ke(K.placement) === Y ? K.overflows[0] > 0 : !0)))
            )
              return { data: { index: ft, overflows: ht }, reset: { placement: Ct } };
            let _ =
              (I = ht
                .filter((G) => G.overflows[0] <= 0)
                .sort((G, K) => G.overflows[1] - K.overflows[1])[0]) == null
                ? void 0
                : I.placement;
            if (!_)
              switch (z) {
                case "bestFit": {
                  var St;
                  const G =
                    (St = ht
                      .filter((K) => {
                        if (F) {
                          const nt = Ke(K.placement);
                          return nt === Y || nt === "y";
                        }
                        return !0;
                      })
                      .map((K) => [
                        K.placement,
                        K.overflows.filter((nt) => nt > 0).reduce((nt, ct) => nt + ct, 0),
                      ])
                      .sort((K, nt) => K[1] - nt[1])[0]) == null
                      ? void 0
                      : St[0];
                  G && (_ = G);
                  break;
                }
                case "initialPlacement":
                  _ = h;
                  break;
              }
            if (s !== _) return { reset: { placement: _ } };
          }
          return {};
        },
      }
    );
  };
function _h(a, u) {
  return {
    top: a.top - u.height,
    right: a.right - u.width,
    bottom: a.bottom - u.height,
    left: a.left - u.width,
  };
}
function Rh(a) {
  return Yb.some((u) => a[u] >= 0);
}
const n1 = function (a) {
    return (
      a === void 0 && (a = {}),
      {
        name: "hide",
        options: a,
        async fn(u) {
          const { rects: r, platform: o } = u,
            { strategy: s = "referenceHidden", ...d } = vn(a, u);
          switch (s) {
            case "referenceHidden": {
              const m = await o.detectOverflow(u, { ...d, elementContext: "reference" }),
                h = _h(m, r.reference);
              return { data: { referenceHiddenOffsets: h, referenceHidden: Rh(h) } };
            }
            case "escaped": {
              const m = await o.detectOverflow(u, { ...d, altBoundary: !0 }),
                h = _h(m, r.floating);
              return { data: { escapedOffsets: h, escaped: Rh(h) } };
            }
            default:
              return {};
          }
        },
      }
    );
  },
  sp = new Set(["left", "top"]);
async function l1(a, u) {
  const { placement: r, platform: o, elements: s } = a,
    d = await (o.isRTL == null ? void 0 : o.isRTL(s.floating)),
    m = gn(r),
    h = da(r),
    v = Ke(r) === "y",
    p = sp.has(m) ? -1 : 1,
    S = d && v ? -1 : 1,
    x = vn(u, a);
  let {
    mainAxis: N,
    crossAxis: z,
    alignmentAxis: D,
  } = typeof x == "number"
    ? { mainAxis: x, crossAxis: 0, alignmentAxis: null }
    : { mainAxis: x.mainAxis || 0, crossAxis: x.crossAxis || 0, alignmentAxis: x.alignmentAxis };
  return (
    h && typeof D == "number" && (z = h === "end" ? D * -1 : D),
    v ? { x: z * S, y: N * p } : { x: N * p, y: z * S }
  );
}
const a1 = function (a) {
    return (
      a === void 0 && (a = 0),
      {
        name: "offset",
        options: a,
        async fn(u) {
          var r, o;
          const { x: s, y: d, placement: m, middlewareData: h } = u,
            v = await l1(u, a);
          return m === ((r = h.offset) == null ? void 0 : r.placement) &&
            (o = h.arrow) != null &&
            o.alignmentOffset
            ? {}
            : { x: s + v.x, y: d + v.y, data: { ...v, placement: m } };
        },
      }
    );
  },
  i1 = function (a) {
    return (
      a === void 0 && (a = {}),
      {
        name: "shift",
        options: a,
        async fn(u) {
          const { x: r, y: o, placement: s, platform: d } = u,
            {
              mainAxis: m = !0,
              crossAxis: h = !1,
              limiter: v = {
                fn: (V) => {
                  let { x: Y, y: X } = V;
                  return { x: Y, y: X };
                },
              },
              ...p
            } = vn(a, u),
            S = { x: r, y: o },
            x = await d.detectOverflow(u, p),
            N = Ke(gn(s)),
            z = Kr(N);
          let D = S[z],
            U = S[N];
          if (m) {
            const V = z === "y" ? "top" : "left",
              Y = z === "y" ? "bottom" : "right",
              X = D + x[V],
              Z = D - x[Y];
            D = jr(X, D, Z);
          }
          if (h) {
            const V = N === "y" ? "top" : "left",
              Y = N === "y" ? "bottom" : "right",
              X = U + x[V],
              Z = U - x[Y];
            U = jr(X, U, Z);
          }
          const M = v.fn({ ...u, [z]: D, [N]: U });
          return { ...M, data: { x: M.x - r, y: M.y - o, enabled: { [z]: m, [N]: h } } };
        },
      }
    );
  },
  u1 = function (a) {
    return (
      a === void 0 && (a = {}),
      {
        options: a,
        fn(u) {
          const { x: r, y: o, placement: s, rects: d, middlewareData: m } = u,
            { offset: h = 0, mainAxis: v = !0, crossAxis: p = !0 } = vn(a, u),
            S = { x: r, y: o },
            x = Ke(s),
            N = Kr(x);
          let z = S[N],
            D = S[x];
          const U = vn(h, u),
            M =
              typeof U == "number"
                ? { mainAxis: U, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...U };
          if (v) {
            const X = N === "y" ? "height" : "width",
              Z = d.reference[N] - d.floating[X] + M.mainAxis,
              W = d.reference[N] + d.reference[X] - M.mainAxis;
            z < Z ? (z = Z) : z > W && (z = W);
          }
          if (p) {
            var V, Y;
            const X = N === "y" ? "width" : "height",
              Z = sp.has(gn(s)),
              W =
                d.reference[x] -
                d.floating[X] +
                ((Z && ((V = m.offset) == null ? void 0 : V[x])) || 0) +
                (Z ? 0 : M.crossAxis),
              F =
                d.reference[x] +
                d.reference[X] +
                (Z ? 0 : ((Y = m.offset) == null ? void 0 : Y[x]) || 0) -
                (Z ? M.crossAxis : 0);
            D < W ? (D = W) : D > F && (D = F);
          }
          return { [N]: z, [x]: D };
        },
      }
    );
  },
  c1 = function (a) {
    return (
      a === void 0 && (a = {}),
      {
        name: "size",
        options: a,
        async fn(u) {
          var r, o;
          const { placement: s, rects: d, platform: m, elements: h } = u,
            { apply: v = () => {}, ...p } = vn(a, u),
            S = await m.detectOverflow(u, p),
            x = gn(s),
            N = da(s),
            z = Ke(s) === "y",
            { width: D, height: U } = d.floating;
          let M, V;
          x === "top" || x === "bottom"
            ? ((M = x),
              (V =
                N === ((await (m.isRTL == null ? void 0 : m.isRTL(h.floating))) ? "start" : "end")
                  ? "left"
                  : "right"))
            : ((V = x), (M = N === "end" ? "top" : "bottom"));
          const Y = U - S.top - S.bottom,
            X = D - S.left - S.right,
            Z = Wn(U - S[M], Y),
            W = Wn(D - S[V], X),
            F = !u.middlewareData.shift;
          let Q = Z,
            et = W;
          if (
            ((r = u.middlewareData.shift) != null && r.enabled.x && (et = X),
            (o = u.middlewareData.shift) != null && o.enabled.y && (Q = Y),
            F && !N)
          ) {
            const ht = Ee(S.left, 0),
              xt = Ee(S.right, 0),
              I = Ee(S.top, 0),
              St = Ee(S.bottom, 0);
            z
              ? (et = D - 2 * (ht !== 0 || xt !== 0 ? ht + xt : Ee(S.left, S.right)))
              : (Q = U - 2 * (I !== 0 || St !== 0 ? I + St : Ee(S.top, S.bottom)));
          }
          await v({ ...u, availableWidth: et, availableHeight: Q });
          const bt = await m.getDimensions(h.floating);
          return D !== bt.width || U !== bt.height ? { reset: { rects: !0 } } : {};
        },
      }
    );
  };
function Qu() {
  return typeof window < "u";
}
function ma(a) {
  return fp(a) ? (a.nodeName || "").toLowerCase() : "#document";
}
function Ae(a) {
  var u;
  return (a == null || (u = a.ownerDocument) == null ? void 0 : u.defaultView) || window;
}
function We(a) {
  var u;
  return (u = (fp(a) ? a.ownerDocument : a.document) || window.document) == null
    ? void 0
    : u.documentElement;
}
function fp(a) {
  return Qu() ? a instanceof Node || a instanceof Ae(a).Node : !1;
}
function qe(a) {
  return Qu() ? a instanceof Element || a instanceof Ae(a).Element : !1;
}
function ke(a) {
  return Qu() ? a instanceof HTMLElement || a instanceof Ae(a).HTMLElement : !1;
}
function zh(a) {
  return !Qu() || typeof ShadowRoot > "u"
    ? !1
    : a instanceof ShadowRoot || a instanceof Ae(a).ShadowRoot;
}
const o1 = new Set(["inline", "contents"]);
function pi(a) {
  const { overflow: u, overflowX: r, overflowY: o, display: s } = Ve(a);
  return /auto|scroll|overlay|hidden|clip/.test(u + o + r) && !o1.has(s);
}
const r1 = new Set(["table", "td", "th"]);
function s1(a) {
  return r1.has(ma(a));
}
const f1 = [":popover-open", ":modal"];
function Zu(a) {
  return f1.some((u) => {
    try {
      return a.matches(u);
    } catch {
      return !1;
    }
  });
}
const d1 = ["transform", "translate", "scale", "rotate", "perspective"],
  m1 = ["transform", "translate", "scale", "rotate", "perspective", "filter"],
  h1 = ["paint", "layout", "strict", "content"];
function kr(a) {
  const u = Wr(),
    r = qe(a) ? Ve(a) : a;
  return (
    d1.some((o) => (r[o] ? r[o] !== "none" : !1)) ||
    (r.containerType ? r.containerType !== "normal" : !1) ||
    (!u && (r.backdropFilter ? r.backdropFilter !== "none" : !1)) ||
    (!u && (r.filter ? r.filter !== "none" : !1)) ||
    m1.some((o) => (r.willChange || "").includes(o)) ||
    h1.some((o) => (r.contain || "").includes(o))
  );
}
function p1(a) {
  let u = Fn(a);
  for (; ke(u) && !ca(u); ) {
    if (kr(u)) return u;
    if (Zu(u)) return null;
    u = Fn(u);
  }
  return null;
}
function Wr() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
const y1 = new Set(["html", "body", "#document"]);
function ca(a) {
  return y1.has(ma(a));
}
function Ve(a) {
  return Ae(a).getComputedStyle(a);
}
function Ku(a) {
  return qe(a)
    ? { scrollLeft: a.scrollLeft, scrollTop: a.scrollTop }
    : { scrollLeft: a.scrollX, scrollTop: a.scrollY };
}
function Fn(a) {
  if (ma(a) === "html") return a;
  const u = a.assignedSlot || a.parentNode || (zh(a) && a.host) || We(a);
  return zh(u) ? u.host : u;
}
function dp(a) {
  const u = Fn(a);
  return ca(u) ? (a.ownerDocument ? a.ownerDocument.body : a.body) : ke(u) && pi(u) ? u : dp(u);
}
function fi(a, u, r) {
  var o;
  (u === void 0 && (u = []), r === void 0 && (r = !0));
  const s = dp(a),
    d = s === ((o = a.ownerDocument) == null ? void 0 : o.body),
    m = Ae(s);
  if (d) {
    const h = Dr(m);
    return u.concat(m, m.visualViewport || [], pi(s) ? s : [], h && r ? fi(h) : []);
  }
  return u.concat(s, fi(s, [], r));
}
function Dr(a) {
  return a.parent && Object.getPrototypeOf(a.parent) ? a.frameElement : null;
}
function mp(a) {
  const u = Ve(a);
  let r = parseFloat(u.width) || 0,
    o = parseFloat(u.height) || 0;
  const s = ke(a),
    d = s ? a.offsetWidth : r,
    m = s ? a.offsetHeight : o,
    h = qu(r) !== d || qu(o) !== m;
  return (h && ((r = d), (o = m)), { width: r, height: o, $: h });
}
function Fr(a) {
  return qe(a) ? a : a.contextElement;
}
function ua(a) {
  const u = Fr(a);
  if (!ke(u)) return Je(1);
  const r = u.getBoundingClientRect(),
    { width: o, height: s, $: d } = mp(u);
  let m = (d ? qu(r.width) : r.width) / o,
    h = (d ? qu(r.height) : r.height) / s;
  return (
    (!m || !Number.isFinite(m)) && (m = 1),
    (!h || !Number.isFinite(h)) && (h = 1),
    { x: m, y: h }
  );
}
const v1 = Je(0);
function hp(a) {
  const u = Ae(a);
  return !Wr() || !u.visualViewport
    ? v1
    : { x: u.visualViewport.offsetLeft, y: u.visualViewport.offsetTop };
}
function g1(a, u, r) {
  return (u === void 0 && (u = !1), !r || (u && r !== Ae(a)) ? !1 : u);
}
function bl(a, u, r, o) {
  (u === void 0 && (u = !1), r === void 0 && (r = !1));
  const s = a.getBoundingClientRect(),
    d = Fr(a);
  let m = Je(1);
  u && (o ? qe(o) && (m = ua(o)) : (m = ua(a)));
  const h = g1(d, r, o) ? hp(d) : Je(0);
  let v = (s.left + h.x) / m.x,
    p = (s.top + h.y) / m.y,
    S = s.width / m.x,
    x = s.height / m.y;
  if (d) {
    const N = Ae(d),
      z = o && qe(o) ? Ae(o) : o;
    let D = N,
      U = Dr(D);
    for (; U && o && z !== D; ) {
      const M = ua(U),
        V = U.getBoundingClientRect(),
        Y = Ve(U),
        X = V.left + (U.clientLeft + parseFloat(Y.paddingLeft)) * M.x,
        Z = V.top + (U.clientTop + parseFloat(Y.paddingTop)) * M.y;
      ((v *= M.x),
        (p *= M.y),
        (S *= M.x),
        (x *= M.y),
        (v += X),
        (p += Z),
        (D = Ae(U)),
        (U = Dr(D)));
    }
  }
  return Yu({ width: S, height: x, x: v, y: p });
}
function Ju(a, u) {
  const r = Ku(a).scrollLeft;
  return u ? u.left + r : bl(We(a)).left + r;
}
function pp(a, u) {
  const r = a.getBoundingClientRect(),
    o = r.left + u.scrollLeft - Ju(a, r),
    s = r.top + u.scrollTop;
  return { x: o, y: s };
}
function b1(a) {
  let { elements: u, rect: r, offsetParent: o, strategy: s } = a;
  const d = s === "fixed",
    m = We(o),
    h = u ? Zu(u.floating) : !1;
  if (o === m || (h && d)) return r;
  let v = { scrollLeft: 0, scrollTop: 0 },
    p = Je(1);
  const S = Je(0),
    x = ke(o);
  if ((x || (!x && !d)) && ((ma(o) !== "body" || pi(m)) && (v = Ku(o)), ke(o))) {
    const z = bl(o);
    ((p = ua(o)), (S.x = z.x + o.clientLeft), (S.y = z.y + o.clientTop));
  }
  const N = m && !x && !d ? pp(m, v) : Je(0);
  return {
    width: r.width * p.x,
    height: r.height * p.y,
    x: r.x * p.x - v.scrollLeft * p.x + S.x + N.x,
    y: r.y * p.y - v.scrollTop * p.y + S.y + N.y,
  };
}
function x1(a) {
  return Array.from(a.getClientRects());
}
function S1(a) {
  const u = We(a),
    r = Ku(a),
    o = a.ownerDocument.body,
    s = Ee(u.scrollWidth, u.clientWidth, o.scrollWidth, o.clientWidth),
    d = Ee(u.scrollHeight, u.clientHeight, o.scrollHeight, o.clientHeight);
  let m = -r.scrollLeft + Ju(a);
  const h = -r.scrollTop;
  return (
    Ve(o).direction === "rtl" && (m += Ee(u.clientWidth, o.clientWidth) - s),
    { width: s, height: d, x: m, y: h }
  );
}
const jh = 25;
function E1(a, u) {
  const r = Ae(a),
    o = We(a),
    s = r.visualViewport;
  let d = o.clientWidth,
    m = o.clientHeight,
    h = 0,
    v = 0;
  if (s) {
    ((d = s.width), (m = s.height));
    const S = Wr();
    (!S || (S && u === "fixed")) && ((h = s.offsetLeft), (v = s.offsetTop));
  }
  const p = Ju(o);
  if (p <= 0) {
    const S = o.ownerDocument,
      x = S.body,
      N = getComputedStyle(x),
      z =
        (S.compatMode === "CSS1Compat" && parseFloat(N.marginLeft) + parseFloat(N.marginRight)) ||
        0,
      D = Math.abs(o.clientWidth - x.clientWidth - z);
    D <= jh && (d -= D);
  } else p <= jh && (d += p);
  return { width: d, height: m, x: h, y: v };
}
const A1 = new Set(["absolute", "fixed"]);
function T1(a, u) {
  const r = bl(a, !0, u === "fixed"),
    o = r.top + a.clientTop,
    s = r.left + a.clientLeft,
    d = ke(a) ? ua(a) : Je(1),
    m = a.clientWidth * d.x,
    h = a.clientHeight * d.y,
    v = s * d.x,
    p = o * d.y;
  return { width: m, height: h, x: v, y: p };
}
function Mh(a, u, r) {
  let o;
  if (u === "viewport") o = E1(a, r);
  else if (u === "document") o = S1(We(a));
  else if (qe(u)) o = T1(u, r);
  else {
    const s = hp(a);
    o = { x: u.x - s.x, y: u.y - s.y, width: u.width, height: u.height };
  }
  return Yu(o);
}
function yp(a, u) {
  const r = Fn(a);
  return r === u || !qe(r) || ca(r) ? !1 : Ve(r).position === "fixed" || yp(r, u);
}
function C1(a, u) {
  const r = u.get(a);
  if (r) return r;
  let o = fi(a, [], !1).filter((h) => qe(h) && ma(h) !== "body"),
    s = null;
  const d = Ve(a).position === "fixed";
  let m = d ? Fn(a) : a;
  for (; qe(m) && !ca(m); ) {
    const h = Ve(m),
      v = kr(m);
    (!v && h.position === "fixed" && (s = null),
      (
        d
          ? !v && !s
          : (!v && h.position === "static" && !!s && A1.has(s.position)) ||
            (pi(m) && !v && yp(a, m))
      )
        ? (o = o.filter((S) => S !== m))
        : (s = h),
      (m = Fn(m)));
  }
  return (u.set(a, o), o);
}
function N1(a) {
  let { element: u, boundary: r, rootBoundary: o, strategy: s } = a;
  const m = [...(r === "clippingAncestors" ? (Zu(u) ? [] : C1(u, this._c)) : [].concat(r)), o],
    h = m[0],
    v = m.reduce(
      (p, S) => {
        const x = Mh(u, S, s);
        return (
          (p.top = Ee(x.top, p.top)),
          (p.right = Wn(x.right, p.right)),
          (p.bottom = Wn(x.bottom, p.bottom)),
          (p.left = Ee(x.left, p.left)),
          p
        );
      },
      Mh(u, h, s),
    );
  return { width: v.right - v.left, height: v.bottom - v.top, x: v.left, y: v.top };
}
function O1(a) {
  const { width: u, height: r } = mp(a);
  return { width: u, height: r };
}
function w1(a, u, r) {
  const o = ke(u),
    s = We(u),
    d = r === "fixed",
    m = bl(a, !0, d, u);
  let h = { scrollLeft: 0, scrollTop: 0 };
  const v = Je(0);
  function p() {
    v.x = Ju(s);
  }
  if (o || (!o && !d))
    if (((ma(u) !== "body" || pi(s)) && (h = Ku(u)), o)) {
      const z = bl(u, !0, d, u);
      ((v.x = z.x + u.clientLeft), (v.y = z.y + u.clientTop));
    } else s && p();
  d && !o && s && p();
  const S = s && !o && !d ? pp(s, h) : Je(0),
    x = m.left + h.scrollLeft - v.x - S.x,
    N = m.top + h.scrollTop - v.y - S.y;
  return { x, y: N, width: m.width, height: m.height };
}
function Tr(a) {
  return Ve(a).position === "static";
}
function Dh(a, u) {
  if (!ke(a) || Ve(a).position === "fixed") return null;
  if (u) return u(a);
  let r = a.offsetParent;
  return (We(a) === r && (r = r.ownerDocument.body), r);
}
function vp(a, u) {
  const r = Ae(a);
  if (Zu(a)) return r;
  if (!ke(a)) {
    let s = Fn(a);
    for (; s && !ca(s); ) {
      if (qe(s) && !Tr(s)) return s;
      s = Fn(s);
    }
    return r;
  }
  let o = Dh(a, u);
  for (; o && s1(o) && Tr(o); ) o = Dh(o, u);
  return o && ca(o) && Tr(o) && !kr(o) ? r : o || p1(a) || r;
}
const _1 = async function (a) {
  const u = this.getOffsetParent || vp,
    r = this.getDimensions,
    o = await r(a.floating);
  return {
    reference: w1(a.reference, await u(a.floating), a.strategy),
    floating: { x: 0, y: 0, width: o.width, height: o.height },
  };
};
function R1(a) {
  return Ve(a).direction === "rtl";
}
const z1 = {
  convertOffsetParentRelativeRectToViewportRelativeRect: b1,
  getDocumentElement: We,
  getClippingRect: N1,
  getOffsetParent: vp,
  getElementRects: _1,
  getClientRects: x1,
  getDimensions: O1,
  getScale: ua,
  isElement: qe,
  isRTL: R1,
};
function gp(a, u) {
  return a.x === u.x && a.y === u.y && a.width === u.width && a.height === u.height;
}
function j1(a, u) {
  let r = null,
    o;
  const s = We(a);
  function d() {
    var h;
    (clearTimeout(o), (h = r) == null || h.disconnect(), (r = null));
  }
  function m(h, v) {
    (h === void 0 && (h = !1), v === void 0 && (v = 1), d());
    const p = a.getBoundingClientRect(),
      { left: S, top: x, width: N, height: z } = p;
    if ((h || u(), !N || !z)) return;
    const D = Uu(x),
      U = Uu(s.clientWidth - (S + N)),
      M = Uu(s.clientHeight - (x + z)),
      V = Uu(S),
      X = {
        rootMargin: -D + "px " + -U + "px " + -M + "px " + -V + "px",
        threshold: Ee(0, Wn(1, v)) || 1,
      };
    let Z = !0;
    function W(F) {
      const Q = F[0].intersectionRatio;
      if (Q !== v) {
        if (!Z) return m();
        Q
          ? m(!1, Q)
          : (o = setTimeout(() => {
              m(!1, 1e-7);
            }, 1e3));
      }
      (Q === 1 && !gp(p, a.getBoundingClientRect()) && m(), (Z = !1));
    }
    try {
      r = new IntersectionObserver(W, { ...X, root: s.ownerDocument });
    } catch {
      r = new IntersectionObserver(W, X);
    }
    r.observe(a);
  }
  return (m(!0), d);
}
function M1(a, u, r, o) {
  o === void 0 && (o = {});
  const {
      ancestorScroll: s = !0,
      ancestorResize: d = !0,
      elementResize: m = typeof ResizeObserver == "function",
      layoutShift: h = typeof IntersectionObserver == "function",
      animationFrame: v = !1,
    } = o,
    p = Fr(a),
    S = s || d ? [...(p ? fi(p) : []), ...fi(u)] : [];
  S.forEach((V) => {
    (s && V.addEventListener("scroll", r, { passive: !0 }), d && V.addEventListener("resize", r));
  });
  const x = p && h ? j1(p, r) : null;
  let N = -1,
    z = null;
  m &&
    ((z = new ResizeObserver((V) => {
      let [Y] = V;
      (Y &&
        Y.target === p &&
        z &&
        (z.unobserve(u),
        cancelAnimationFrame(N),
        (N = requestAnimationFrame(() => {
          var X;
          (X = z) == null || X.observe(u);
        }))),
        r());
    })),
    p && !v && z.observe(p),
    z.observe(u));
  let D,
    U = v ? bl(a) : null;
  v && M();
  function M() {
    const V = bl(a);
    (U && !gp(U, V) && r(), (U = V), (D = requestAnimationFrame(M)));
  }
  return (
    r(),
    () => {
      var V;
      (S.forEach((Y) => {
        (s && Y.removeEventListener("scroll", r), d && Y.removeEventListener("resize", r));
      }),
        x?.(),
        (V = z) == null || V.disconnect(),
        (z = null),
        v && cancelAnimationFrame(D));
    }
  );
}
const D1 = a1,
  U1 = i1,
  H1 = e1,
  B1 = c1,
  L1 = n1,
  Uh = t1,
  q1 = u1,
  V1 = (a, u, r) => {
    const o = new Map(),
      s = { platform: z1, ...r },
      d = { ...s.platform, _c: o };
    return Ib(a, u, { ...s, platform: d });
  };
var Y1 = typeof document < "u",
  G1 = function () {},
  Bu = Y1 ? g.useLayoutEffect : G1;
function Gu(a, u) {
  if (a === u) return !0;
  if (typeof a != typeof u) return !1;
  if (typeof a == "function" && a.toString() === u.toString()) return !0;
  let r, o, s;
  if (a && u && typeof a == "object") {
    if (Array.isArray(a)) {
      if (((r = a.length), r !== u.length)) return !1;
      for (o = r; o-- !== 0; ) if (!Gu(a[o], u[o])) return !1;
      return !0;
    }
    if (((s = Object.keys(a)), (r = s.length), r !== Object.keys(u).length)) return !1;
    for (o = r; o-- !== 0; ) if (!{}.hasOwnProperty.call(u, s[o])) return !1;
    for (o = r; o-- !== 0; ) {
      const d = s[o];
      if (!(d === "_owner" && a.$$typeof) && !Gu(a[d], u[d])) return !1;
    }
    return !0;
  }
  return a !== a && u !== u;
}
function bp(a) {
  return typeof window > "u" ? 1 : (a.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Hh(a, u) {
  const r = bp(a);
  return Math.round(u * r) / r;
}
function Cr(a) {
  const u = g.useRef(a);
  return (
    Bu(() => {
      u.current = a;
    }),
    u
  );
}
function X1(a) {
  a === void 0 && (a = {});
  const {
      placement: u = "bottom",
      strategy: r = "absolute",
      middleware: o = [],
      platform: s,
      elements: { reference: d, floating: m } = {},
      transform: h = !0,
      whileElementsMounted: v,
      open: p,
    } = a,
    [S, x] = g.useState({
      x: 0,
      y: 0,
      strategy: r,
      placement: u,
      middlewareData: {},
      isPositioned: !1,
    }),
    [N, z] = g.useState(o);
  Gu(N, o) || z(o);
  const [D, U] = g.useState(null),
    [M, V] = g.useState(null),
    Y = g.useCallback((K) => {
      K !== F.current && ((F.current = K), U(K));
    }, []),
    X = g.useCallback((K) => {
      K !== Q.current && ((Q.current = K), V(K));
    }, []),
    Z = d || D,
    W = m || M,
    F = g.useRef(null),
    Q = g.useRef(null),
    et = g.useRef(S),
    bt = v != null,
    ht = Cr(v),
    xt = Cr(s),
    I = Cr(p),
    St = g.useCallback(() => {
      if (!F.current || !Q.current) return;
      const K = { placement: u, strategy: r, middleware: N };
      (xt.current && (K.platform = xt.current),
        V1(F.current, Q.current, K).then((nt) => {
          const ct = { ...nt, isPositioned: I.current !== !1 };
          ft.current &&
            !Gu(et.current, ct) &&
            ((et.current = ct),
            Qr.flushSync(() => {
              x(ct);
            }));
        }));
    }, [N, u, r, xt, I]);
  Bu(() => {
    p === !1 &&
      et.current.isPositioned &&
      ((et.current.isPositioned = !1), x((K) => ({ ...K, isPositioned: !1 })));
  }, [p]);
  const ft = g.useRef(!1);
  (Bu(
    () => (
      (ft.current = !0),
      () => {
        ft.current = !1;
      }
    ),
    [],
  ),
    Bu(() => {
      if ((Z && (F.current = Z), W && (Q.current = W), Z && W)) {
        if (ht.current) return ht.current(Z, W, St);
        St();
      }
    }, [Z, W, St, ht, bt]));
  const Ct = g.useMemo(
      () => ({ reference: F, floating: Q, setReference: Y, setFloating: X }),
      [Y, X],
    ),
    _ = g.useMemo(() => ({ reference: Z, floating: W }), [Z, W]),
    G = g.useMemo(() => {
      const K = { position: r, left: 0, top: 0 };
      if (!_.floating) return K;
      const nt = Hh(_.floating, S.x),
        ct = Hh(_.floating, S.y);
      return h
        ? {
            ...K,
            transform: "translate(" + nt + "px, " + ct + "px)",
            ...(bp(_.floating) >= 1.5 && { willChange: "transform" }),
          }
        : { position: r, left: nt, top: ct };
    }, [r, h, _.floating, S.x, S.y]);
  return g.useMemo(
    () => ({ ...S, update: St, refs: Ct, elements: _, floatingStyles: G }),
    [S, St, Ct, _, G],
  );
}
const Q1 = (a) => {
    function u(r) {
      return {}.hasOwnProperty.call(r, "current");
    }
    return {
      name: "arrow",
      options: a,
      fn(r) {
        const { element: o, padding: s } = typeof a == "function" ? a(r) : a;
        return o && u(o)
          ? o.current != null
            ? Uh({ element: o.current, padding: s }).fn(r)
            : {}
          : o
            ? Uh({ element: o, padding: s }).fn(r)
            : {};
      },
    };
  },
  Z1 = (a, u) => ({ ...D1(a), options: [a, u] }),
  K1 = (a, u) => ({ ...U1(a), options: [a, u] }),
  J1 = (a, u) => ({ ...q1(a), options: [a, u] }),
  $1 = (a, u) => ({ ...H1(a), options: [a, u] }),
  k1 = (a, u) => ({ ...B1(a), options: [a, u] }),
  W1 = (a, u) => ({ ...L1(a), options: [a, u] }),
  F1 = (a, u) => ({ ...Q1(a), options: [a, u] });
function P1(a) {
  const u = I1(a),
    r = g.forwardRef((o, s) => {
      const { children: d, ...m } = o,
        h = g.Children.toArray(d),
        v = h.find(ex);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
function I1(a) {
  const u = g.forwardRef((r, o) => {
    const { children: s, ...d } = r;
    if (g.isValidElement(s)) {
      const m = lx(s),
        h = nx(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var tx = Symbol("radix.slottable");
function ex(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === tx
  );
}
function nx(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function lx(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
var ax = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  ix = ax.reduce((a, u) => {
    const r = P1(`Primitive.${u}`),
      o = g.forwardRef((s, d) => {
        const { asChild: m, ...h } = s,
          v = m ? r : u;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          b.jsx(v, { ...h, ref: d })
        );
      });
    return ((o.displayName = `Primitive.${u}`), { ...a, [u]: o });
  }, {}),
  ux = "Arrow",
  xp = g.forwardRef((a, u) => {
    const { children: r, width: o = 10, height: s = 5, ...d } = a;
    return b.jsx(ix.svg, {
      ...d,
      ref: u,
      width: o,
      height: s,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: a.asChild ? r : b.jsx("polygon", { points: "0,0 30,0 15,10" }),
    });
  });
xp.displayName = ux;
var cx = xp;
function ox(a) {
  const u = rx(a),
    r = g.forwardRef((o, s) => {
      const { children: d, ...m } = o,
        h = g.Children.toArray(d),
        v = h.find(fx);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
function rx(a) {
  const u = g.forwardRef((r, o) => {
    const { children: s, ...d } = r;
    if (g.isValidElement(s)) {
      const m = mx(s),
        h = dx(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var sx = Symbol("radix.slottable");
function fx(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === sx
  );
}
function dx(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function mx(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
var hx = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  Sp = hx.reduce((a, u) => {
    const r = ox(`Primitive.${u}`),
      o = g.forwardRef((s, d) => {
        const { asChild: m, ...h } = s,
          v = m ? r : u;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          b.jsx(v, { ...h, ref: d })
        );
      });
    return ((o.displayName = `Primitive.${u}`), { ...a, [u]: o });
  }, {});
function px(a) {
  const [u, r] = g.useState(void 0);
  return (
    kn(() => {
      if (a) {
        r({ width: a.offsetWidth, height: a.offsetHeight });
        const o = new ResizeObserver((s) => {
          if (!Array.isArray(s) || !s.length) return;
          const d = s[0];
          let m, h;
          if ("borderBoxSize" in d) {
            const v = d.borderBoxSize,
              p = Array.isArray(v) ? v[0] : v;
            ((m = p.inlineSize), (h = p.blockSize));
          } else ((m = a.offsetWidth), (h = a.offsetHeight));
          r({ width: m, height: h });
        });
        return (o.observe(a, { box: "border-box" }), () => o.unobserve(a));
      } else r(void 0);
    }, [a]),
    u
  );
}
var Pr = "Popper",
  [Ep, Ap] = mi(Pr),
  [yx, Tp] = Ep(Pr),
  Cp = (a) => {
    const { __scopePopper: u, children: r } = a,
      [o, s] = g.useState(null);
    return b.jsx(yx, { scope: u, anchor: o, onAnchorChange: s, children: r });
  };
Cp.displayName = Pr;
var Np = "PopperAnchor",
  Op = g.forwardRef((a, u) => {
    const { __scopePopper: r, virtualRef: o, ...s } = a,
      d = Tp(Np, r),
      m = g.useRef(null),
      h = $e(u, m),
      v = g.useRef(null);
    return (
      g.useEffect(() => {
        const p = v.current;
        ((v.current = o?.current || m.current), p !== v.current && d.onAnchorChange(v.current));
      }),
      o ? null : b.jsx(Sp.div, { ...s, ref: h })
    );
  });
Op.displayName = Np;
var Ir = "PopperContent",
  [vx, gx] = Ep(Ir),
  wp = g.forwardRef((a, u) => {
    const {
        __scopePopper: r,
        side: o = "bottom",
        sideOffset: s = 0,
        align: d = "center",
        alignOffset: m = 0,
        arrowPadding: h = 0,
        avoidCollisions: v = !0,
        collisionBoundary: p = [],
        collisionPadding: S = 0,
        sticky: x = "partial",
        hideWhenDetached: N = !1,
        updatePositionStrategy: z = "optimized",
        onPlaced: D,
        ...U
      } = a,
      M = Tp(Ir, r),
      [V, Y] = g.useState(null),
      X = $e(u, (pt) => Y(pt)),
      [Z, W] = g.useState(null),
      F = px(Z),
      Q = F?.width ?? 0,
      et = F?.height ?? 0,
      bt = o + (d !== "center" ? "-" + d : ""),
      ht = typeof S == "number" ? S : { top: 0, right: 0, bottom: 0, left: 0, ...S },
      xt = Array.isArray(p) ? p : [p],
      I = xt.length > 0,
      St = { padding: ht, boundary: xt.filter(xx), altBoundary: I },
      {
        refs: ft,
        floatingStyles: Ct,
        placement: _,
        isPositioned: G,
        middlewareData: K,
      } = X1({
        strategy: "fixed",
        placement: bt,
        whileElementsMounted: (...pt) => M1(...pt, { animationFrame: z === "always" }),
        elements: { reference: M.anchor },
        middleware: [
          Z1({ mainAxis: s + et, alignmentAxis: m }),
          v && K1({ mainAxis: !0, crossAxis: !1, limiter: x === "partial" ? J1() : void 0, ...St }),
          v && $1({ ...St }),
          k1({
            ...St,
            apply: ({ elements: pt, rects: Kt, availableWidth: Ht, availableHeight: Pn }) => {
              const { width: xl, height: ha } = Kt.reference,
                In = pt.floating.style;
              (In.setProperty("--radix-popper-available-width", `${Ht}px`),
                In.setProperty("--radix-popper-available-height", `${Pn}px`),
                In.setProperty("--radix-popper-anchor-width", `${xl}px`),
                In.setProperty("--radix-popper-anchor-height", `${ha}px`));
            },
          }),
          Z && F1({ element: Z, padding: h }),
          Sx({ arrowWidth: Q, arrowHeight: et }),
          N && W1({ strategy: "referenceHidden", ...St }),
        ],
      }),
      [nt, ct] = zp(_),
      A = hi(D);
    kn(() => {
      G && A?.();
    }, [G, A]);
    const q = K.arrow?.x,
      J = K.arrow?.y,
      k = K.arrow?.centerOffset !== 0,
      [at, st] = g.useState();
    return (
      kn(() => {
        V && st(window.getComputedStyle(V).zIndex);
      }, [V]),
      b.jsx("div", {
        ref: ft.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...Ct,
          transform: G ? Ct.transform : "translate(0, -200%)",
          minWidth: "max-content",
          zIndex: at,
          "--radix-popper-transform-origin": [K.transformOrigin?.x, K.transformOrigin?.y].join(" "),
          ...(K.hide?.referenceHidden && { visibility: "hidden", pointerEvents: "none" }),
        },
        dir: a.dir,
        children: b.jsx(vx, {
          scope: r,
          placedSide: nt,
          onArrowChange: W,
          arrowX: q,
          arrowY: J,
          shouldHideArrow: k,
          children: b.jsx(Sp.div, {
            "data-side": nt,
            "data-align": ct,
            ...U,
            ref: X,
            style: { ...U.style, animation: G ? void 0 : "none" },
          }),
        }),
      })
    );
  });
wp.displayName = Ir;
var _p = "PopperArrow",
  bx = { top: "bottom", right: "left", bottom: "top", left: "right" },
  Rp = g.forwardRef(function (u, r) {
    const { __scopePopper: o, ...s } = u,
      d = gx(_p, o),
      m = bx[d.placedSide];
    return b.jsx("span", {
      ref: d.onArrowChange,
      style: {
        position: "absolute",
        left: d.arrowX,
        top: d.arrowY,
        [m]: 0,
        transformOrigin: { top: "", right: "0 0", bottom: "center 0", left: "100% 0" }[
          d.placedSide
        ],
        transform: {
          top: "translateY(100%)",
          right: "translateY(50%) rotate(90deg) translateX(-50%)",
          bottom: "rotate(180deg)",
          left: "translateY(50%) rotate(-90deg) translateX(50%)",
        }[d.placedSide],
        visibility: d.shouldHideArrow ? "hidden" : void 0,
      },
      children: b.jsx(cx, { ...s, ref: r, style: { ...s.style, display: "block" } }),
    });
  });
Rp.displayName = _p;
function xx(a) {
  return a !== null;
}
var Sx = (a) => ({
  name: "transformOrigin",
  options: a,
  fn(u) {
    const { placement: r, rects: o, middlewareData: s } = u,
      m = s.arrow?.centerOffset !== 0,
      h = m ? 0 : a.arrowWidth,
      v = m ? 0 : a.arrowHeight,
      [p, S] = zp(r),
      x = { start: "0%", center: "50%", end: "100%" }[S],
      N = (s.arrow?.x ?? 0) + h / 2,
      z = (s.arrow?.y ?? 0) + v / 2;
    let D = "",
      U = "";
    return (
      p === "bottom"
        ? ((D = m ? x : `${N}px`), (U = `${-v}px`))
        : p === "top"
          ? ((D = m ? x : `${N}px`), (U = `${o.floating.height + v}px`))
          : p === "right"
            ? ((D = `${-v}px`), (U = m ? x : `${z}px`))
            : p === "left" && ((D = `${o.floating.width + v}px`), (U = m ? x : `${z}px`)),
      { data: { x: D, y: U } }
    );
  },
});
function zp(a) {
  const [u, r = "center"] = a.split("-");
  return [u, r];
}
var Ex = Cp,
  Ax = Op,
  Tx = wp,
  Cx = Rp;
function Nx(a) {
  const u = Ox(a),
    r = g.forwardRef((o, s) => {
      const { children: d, ...m } = o,
        h = g.Children.toArray(d),
        v = h.find(_x);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
function Ox(a) {
  const u = g.forwardRef((r, o) => {
    const { children: s, ...d } = r;
    if (g.isValidElement(s)) {
      const m = zx(s),
        h = Rx(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var wx = Symbol("radix.slottable");
function _x(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === wx
  );
}
function Rx(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function zx(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
var jx = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  Mx = jx.reduce((a, u) => {
    const r = Nx(`Primitive.${u}`),
      o = g.forwardRef((s, d) => {
        const { asChild: m, ...h } = s,
          v = m ? r : u;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          b.jsx(v, { ...h, ref: d })
        );
      });
    return ((o.displayName = `Primitive.${u}`), { ...a, [u]: o });
  }, {}),
  Dx = "Portal",
  jp = g.forwardRef((a, u) => {
    const { container: r, ...o } = a,
      [s, d] = g.useState(!1);
    kn(() => d(!0), []);
    const m = r || (s && globalThis?.document?.body);
    return m ? yb.createPortal(b.jsx(Mx.div, { ...o, ref: u }), m) : null;
  });
jp.displayName = Dx;
function Ux(a, u) {
  return g.useReducer((r, o) => u[r][o] ?? r, a);
}
var $u = (a) => {
  const { present: u, children: r } = a,
    o = Hx(u),
    s = typeof r == "function" ? r({ present: o.isPresent }) : g.Children.only(r),
    d = $e(o.ref, Bx(s));
  return typeof r == "function" || o.isPresent ? g.cloneElement(s, { ref: d }) : null;
};
$u.displayName = "Presence";
function Hx(a) {
  const [u, r] = g.useState(),
    o = g.useRef(null),
    s = g.useRef(a),
    d = g.useRef("none"),
    m = a ? "mounted" : "unmounted",
    [h, v] = Ux(m, {
      mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" },
      unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
      unmounted: { MOUNT: "mounted" },
    });
  return (
    g.useEffect(() => {
      const p = Hu(o.current);
      d.current = h === "mounted" ? p : "none";
    }, [h]),
    kn(() => {
      const p = o.current,
        S = s.current;
      if (S !== a) {
        const N = d.current,
          z = Hu(p);
        (a
          ? v("MOUNT")
          : z === "none" || p?.display === "none"
            ? v("UNMOUNT")
            : v(S && N !== z ? "ANIMATION_OUT" : "UNMOUNT"),
          (s.current = a));
      }
    }, [a, v]),
    kn(() => {
      if (u) {
        let p;
        const S = u.ownerDocument.defaultView ?? window,
          x = (z) => {
            const U = Hu(o.current).includes(CSS.escape(z.animationName));
            if (z.target === u && U && (v("ANIMATION_END"), !s.current)) {
              const M = u.style.animationFillMode;
              ((u.style.animationFillMode = "forwards"),
                (p = S.setTimeout(() => {
                  u.style.animationFillMode === "forwards" && (u.style.animationFillMode = M);
                })));
            }
          },
          N = (z) => {
            z.target === u && (d.current = Hu(o.current));
          };
        return (
          u.addEventListener("animationstart", N),
          u.addEventListener("animationcancel", x),
          u.addEventListener("animationend", x),
          () => {
            (S.clearTimeout(p),
              u.removeEventListener("animationstart", N),
              u.removeEventListener("animationcancel", x),
              u.removeEventListener("animationend", x));
          }
        );
      } else v("ANIMATION_END");
    }, [u, v]),
    {
      isPresent: ["mounted", "unmountSuspended"].includes(h),
      ref: g.useCallback((p) => {
        ((o.current = p ? getComputedStyle(p) : null), r(p));
      }, []),
    }
  );
}
function Hu(a) {
  return a?.animationName || "none";
}
function Bx(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
function Lx(a) {
  const u = qx(a),
    r = g.forwardRef((o, s) => {
      const { children: d, ...m } = o,
        h = g.Children.toArray(d),
        v = h.find(Yx);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
function qx(a) {
  const u = g.forwardRef((r, o) => {
    const { children: s, ...d } = r;
    if (g.isValidElement(s)) {
      const m = Xx(s),
        h = Gx(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var Mp = Symbol("radix.slottable");
function Vx(a) {
  const u = ({ children: r }) => b.jsx(b.Fragment, { children: r });
  return ((u.displayName = `${a}.Slottable`), (u.__radixId = Mp), u);
}
function Yx(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === Mp
  );
}
function Gx(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function Xx(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
var Qx = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  Zx = Qx.reduce((a, u) => {
    const r = Lx(`Primitive.${u}`),
      o = g.forwardRef((s, d) => {
        const { asChild: m, ...h } = s,
          v = m ? r : u;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          b.jsx(v, { ...h, ref: d })
        );
      });
    return ((o.displayName = `Primitive.${u}`), { ...a, [u]: o });
  }, {}),
  Kx = Gr[" useInsertionEffect ".trim().toString()] || kn;
function ts({ prop: a, defaultProp: u, onChange: r = () => {}, caller: o }) {
  const [s, d, m] = Jx({ defaultProp: u, onChange: r }),
    h = a !== void 0,
    v = h ? a : s;
  {
    const S = g.useRef(a !== void 0);
    g.useEffect(() => {
      const x = S.current;
      (x !== h &&
        console.warn(
          `${o} is changing from ${x ? "controlled" : "uncontrolled"} to ${h ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
        ),
        (S.current = h));
    }, [h, o]);
  }
  const p = g.useCallback(
    (S) => {
      if (h) {
        const x = $x(S) ? S(a) : S;
        x !== a && m.current?.(x);
      } else d(S);
    },
    [h, a, d, m],
  );
  return [v, p];
}
function Jx({ defaultProp: a, onChange: u }) {
  const [r, o] = g.useState(a),
    s = g.useRef(r),
    d = g.useRef(u);
  return (
    Kx(() => {
      d.current = u;
    }, [u]),
    g.useEffect(() => {
      s.current !== r && (d.current?.(r), (s.current = r));
    }, [r, s]),
    [r, o, d]
  );
}
function $x(a) {
  return typeof a == "function";
}
function kx(a) {
  const u = Wx(a),
    r = g.forwardRef((o, s) => {
      const { children: d, ...m } = o,
        h = g.Children.toArray(d),
        v = h.find(Px);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
function Wx(a) {
  const u = g.forwardRef((r, o) => {
    const { children: s, ...d } = r;
    if (g.isValidElement(s)) {
      const m = tS(s),
        h = Ix(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var Fx = Symbol("radix.slottable");
function Px(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === Fx
  );
}
function Ix(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function tS(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
var eS = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  nS = eS.reduce((a, u) => {
    const r = kx(`Primitive.${u}`),
      o = g.forwardRef((s, d) => {
        const { asChild: m, ...h } = s,
          v = m ? r : u;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          b.jsx(v, { ...h, ref: d })
        );
      });
    return ((o.displayName = `Primitive.${u}`), { ...a, [u]: o });
  }, {}),
  lS = Object.freeze({
    position: "absolute",
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    wordWrap: "normal",
  }),
  aS = "VisuallyHidden",
  Dp = g.forwardRef((a, u) => b.jsx(nS.span, { ...a, ref: u, style: { ...lS, ...a.style } }));
Dp.displayName = aS;
var iS = Dp,
  [ku] = mi("Tooltip", [Ap]),
  Wu = Ap(),
  Up = "TooltipProvider",
  uS = 700,
  Ur = "tooltip.open",
  [cS, es] = ku(Up),
  Hp = (a) => {
    const {
        __scopeTooltip: u,
        delayDuration: r = uS,
        skipDelayDuration: o = 300,
        disableHoverableContent: s = !1,
        children: d,
      } = a,
      m = g.useRef(!0),
      h = g.useRef(!1),
      v = g.useRef(0);
    return (
      g.useEffect(() => {
        const p = v.current;
        return () => window.clearTimeout(p);
      }, []),
      b.jsx(cS, {
        scope: u,
        isOpenDelayedRef: m,
        delayDuration: r,
        onOpen: g.useCallback(() => {
          (window.clearTimeout(v.current), (m.current = !1));
        }, []),
        onClose: g.useCallback(() => {
          (window.clearTimeout(v.current),
            (v.current = window.setTimeout(() => (m.current = !0), o)));
        }, [o]),
        isPointerInTransitRef: h,
        onPointerInTransitChange: g.useCallback((p) => {
          h.current = p;
        }, []),
        disableHoverableContent: s,
        children: d,
      })
    );
  };
Hp.displayName = Up;
var di = "Tooltip",
  [oS, yi] = ku(di),
  Bp = (a) => {
    const {
        __scopeTooltip: u,
        children: r,
        open: o,
        defaultOpen: s,
        onOpenChange: d,
        disableHoverableContent: m,
        delayDuration: h,
      } = a,
      v = es(di, a.__scopeTooltip),
      p = Wu(u),
      [S, x] = g.useState(null),
      N = Zr(),
      z = g.useRef(0),
      D = m ?? v.disableHoverableContent,
      U = h ?? v.delayDuration,
      M = g.useRef(!1),
      [V, Y] = ts({
        prop: o,
        defaultProp: s ?? !1,
        onChange: (Q) => {
          (Q ? (v.onOpen(), document.dispatchEvent(new CustomEvent(Ur))) : v.onClose(), d?.(Q));
        },
        caller: di,
      }),
      X = g.useMemo(() => (V ? (M.current ? "delayed-open" : "instant-open") : "closed"), [V]),
      Z = g.useCallback(() => {
        (window.clearTimeout(z.current), (z.current = 0), (M.current = !1), Y(!0));
      }, [Y]),
      W = g.useCallback(() => {
        (window.clearTimeout(z.current), (z.current = 0), Y(!1));
      }, [Y]),
      F = g.useCallback(() => {
        (window.clearTimeout(z.current),
          (z.current = window.setTimeout(() => {
            ((M.current = !0), Y(!0), (z.current = 0));
          }, U)));
      }, [U, Y]);
    return (
      g.useEffect(
        () => () => {
          z.current && (window.clearTimeout(z.current), (z.current = 0));
        },
        [],
      ),
      b.jsx(Ex, {
        ...p,
        children: b.jsx(oS, {
          scope: u,
          contentId: N,
          open: V,
          stateAttribute: X,
          trigger: S,
          onTriggerChange: x,
          onTriggerEnter: g.useCallback(() => {
            v.isOpenDelayedRef.current ? F() : Z();
          }, [v.isOpenDelayedRef, F, Z]),
          onTriggerLeave: g.useCallback(() => {
            D ? W() : (window.clearTimeout(z.current), (z.current = 0));
          }, [W, D]),
          onOpen: Z,
          onClose: W,
          disableHoverableContent: D,
          children: r,
        }),
      })
    );
  };
Bp.displayName = di;
var Hr = "TooltipTrigger",
  Lp = g.forwardRef((a, u) => {
    const { __scopeTooltip: r, ...o } = a,
      s = yi(Hr, r),
      d = es(Hr, r),
      m = Wu(r),
      h = g.useRef(null),
      v = $e(u, h, s.onTriggerChange),
      p = g.useRef(!1),
      S = g.useRef(!1),
      x = g.useCallback(() => (p.current = !1), []);
    return (
      g.useEffect(() => () => document.removeEventListener("pointerup", x), [x]),
      b.jsx(Ax, {
        asChild: !0,
        ...m,
        children: b.jsx(Zx.button, {
          "aria-describedby": s.open ? s.contentId : void 0,
          "data-state": s.stateAttribute,
          ...o,
          ref: v,
          onPointerMove: kt(a.onPointerMove, (N) => {
            N.pointerType !== "touch" &&
              !S.current &&
              !d.isPointerInTransitRef.current &&
              (s.onTriggerEnter(), (S.current = !0));
          }),
          onPointerLeave: kt(a.onPointerLeave, () => {
            (s.onTriggerLeave(), (S.current = !1));
          }),
          onPointerDown: kt(a.onPointerDown, () => {
            (s.open && s.onClose(),
              (p.current = !0),
              document.addEventListener("pointerup", x, { once: !0 }));
          }),
          onFocus: kt(a.onFocus, () => {
            p.current || s.onOpen();
          }),
          onBlur: kt(a.onBlur, s.onClose),
          onClick: kt(a.onClick, s.onClose),
        }),
      })
    );
  });
Lp.displayName = Hr;
var ns = "TooltipPortal",
  [rS, sS] = ku(ns, { forceMount: void 0 }),
  qp = (a) => {
    const { __scopeTooltip: u, forceMount: r, children: o, container: s } = a,
      d = yi(ns, u);
    return b.jsx(rS, {
      scope: u,
      forceMount: r,
      children: b.jsx($u, {
        present: r || d.open,
        children: b.jsx(jp, { asChild: !0, container: s, children: o }),
      }),
    });
  };
qp.displayName = ns;
var oa = "TooltipContent",
  Vp = g.forwardRef((a, u) => {
    const r = sS(oa, a.__scopeTooltip),
      { forceMount: o = r.forceMount, side: s = "top", ...d } = a,
      m = yi(oa, a.__scopeTooltip);
    return b.jsx($u, {
      present: o || m.open,
      children: m.disableHoverableContent
        ? b.jsx(Yp, { side: s, ...d, ref: u })
        : b.jsx(fS, { side: s, ...d, ref: u }),
    });
  }),
  fS = g.forwardRef((a, u) => {
    const r = yi(oa, a.__scopeTooltip),
      o = es(oa, a.__scopeTooltip),
      s = g.useRef(null),
      d = $e(u, s),
      [m, h] = g.useState(null),
      { trigger: v, onClose: p } = r,
      S = s.current,
      { onPointerInTransitChange: x } = o,
      N = g.useCallback(() => {
        (h(null), x(!1));
      }, [x]),
      z = g.useCallback(
        (D, U) => {
          const M = D.currentTarget,
            V = { x: D.clientX, y: D.clientY },
            Y = yS(V, M.getBoundingClientRect()),
            X = vS(V, Y),
            Z = gS(U.getBoundingClientRect()),
            W = xS([...X, ...Z]);
          (h(W), x(!0));
        },
        [x],
      );
    return (
      g.useEffect(() => () => N(), [N]),
      g.useEffect(() => {
        if (v && S) {
          const D = (M) => z(M, S),
            U = (M) => z(M, v);
          return (
            v.addEventListener("pointerleave", D),
            S.addEventListener("pointerleave", U),
            () => {
              (v.removeEventListener("pointerleave", D), S.removeEventListener("pointerleave", U));
            }
          );
        }
      }, [v, S, z, N]),
      g.useEffect(() => {
        if (m) {
          const D = (U) => {
            const M = U.target,
              V = { x: U.clientX, y: U.clientY },
              Y = v?.contains(M) || S?.contains(M),
              X = !bS(V, m);
            Y ? N() : X && (N(), p());
          };
          return (
            document.addEventListener("pointermove", D),
            () => document.removeEventListener("pointermove", D)
          );
        }
      }, [v, S, m, p, N]),
      b.jsx(Yp, { ...a, ref: d })
    );
  }),
  [dS, mS] = ku(di, { isInside: !1 }),
  hS = Vx("TooltipContent"),
  Yp = g.forwardRef((a, u) => {
    const {
        __scopeTooltip: r,
        children: o,
        "aria-label": s,
        onEscapeKeyDown: d,
        onPointerDownOutside: m,
        ...h
      } = a,
      v = yi(oa, r),
      p = Wu(r),
      { onClose: S } = v;
    return (
      g.useEffect(
        () => (document.addEventListener(Ur, S), () => document.removeEventListener(Ur, S)),
        [S],
      ),
      g.useEffect(() => {
        if (v.trigger) {
          const x = (N) => {
            N.target?.contains(v.trigger) && S();
          };
          return (
            window.addEventListener("scroll", x, { capture: !0 }),
            () => window.removeEventListener("scroll", x, { capture: !0 })
          );
        }
      }, [v.trigger, S]),
      b.jsx(cp, {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: d,
        onPointerDownOutside: m,
        onFocusOutside: (x) => x.preventDefault(),
        onDismiss: S,
        children: b.jsxs(Tx, {
          "data-state": v.stateAttribute,
          ...p,
          ...h,
          ref: u,
          style: {
            ...h.style,
            "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
            "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
            "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
            "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
            "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)",
          },
          children: [
            b.jsx(hS, { children: o }),
            b.jsx(dS, {
              scope: r,
              isInside: !0,
              children: b.jsx(iS, { id: v.contentId, role: "tooltip", children: s || o }),
            }),
          ],
        }),
      })
    );
  });
Vp.displayName = oa;
var Gp = "TooltipArrow",
  pS = g.forwardRef((a, u) => {
    const { __scopeTooltip: r, ...o } = a,
      s = Wu(r);
    return mS(Gp, r).isInside ? null : b.jsx(Cx, { ...s, ...o, ref: u });
  });
pS.displayName = Gp;
function yS(a, u) {
  const r = Math.abs(u.top - a.y),
    o = Math.abs(u.bottom - a.y),
    s = Math.abs(u.right - a.x),
    d = Math.abs(u.left - a.x);
  switch (Math.min(r, o, s, d)) {
    case d:
      return "left";
    case s:
      return "right";
    case r:
      return "top";
    case o:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function vS(a, u, r = 5) {
  const o = [];
  switch (u) {
    case "top":
      o.push({ x: a.x - r, y: a.y + r }, { x: a.x + r, y: a.y + r });
      break;
    case "bottom":
      o.push({ x: a.x - r, y: a.y - r }, { x: a.x + r, y: a.y - r });
      break;
    case "left":
      o.push({ x: a.x + r, y: a.y - r }, { x: a.x + r, y: a.y + r });
      break;
    case "right":
      o.push({ x: a.x - r, y: a.y - r }, { x: a.x - r, y: a.y + r });
      break;
  }
  return o;
}
function gS(a) {
  const { top: u, right: r, bottom: o, left: s } = a;
  return [
    { x: s, y: u },
    { x: r, y: u },
    { x: r, y: o },
    { x: s, y: o },
  ];
}
function bS(a, u) {
  const { x: r, y: o } = a;
  let s = !1;
  for (let d = 0, m = u.length - 1; d < u.length; m = d++) {
    const h = u[d],
      v = u[m],
      p = h.x,
      S = h.y,
      x = v.x,
      N = v.y;
    S > o != N > o && r < ((x - p) * (o - S)) / (N - S) + p && (s = !s);
  }
  return s;
}
function xS(a) {
  const u = a.slice();
  return (
    u.sort((r, o) => (r.x < o.x ? -1 : r.x > o.x ? 1 : r.y < o.y ? -1 : r.y > o.y ? 1 : 0)),
    SS(u)
  );
}
function SS(a) {
  if (a.length <= 1) return a.slice();
  const u = [];
  for (let o = 0; o < a.length; o++) {
    const s = a[o];
    for (; u.length >= 2; ) {
      const d = u[u.length - 1],
        m = u[u.length - 2];
      if ((d.x - m.x) * (s.y - m.y) >= (d.y - m.y) * (s.x - m.x)) u.pop();
      else break;
    }
    u.push(s);
  }
  u.pop();
  const r = [];
  for (let o = a.length - 1; o >= 0; o--) {
    const s = a[o];
    for (; r.length >= 2; ) {
      const d = r[r.length - 1],
        m = r[r.length - 2];
      if ((d.x - m.x) * (s.y - m.y) >= (d.y - m.y) * (s.x - m.x)) r.pop();
      else break;
    }
    r.push(s);
  }
  return (
    r.pop(),
    u.length === 1 && r.length === 1 && u[0].x === r[0].x && u[0].y === r[0].y ? u : u.concat(r)
  );
}
var ES = Hp,
  AS = Bp,
  TS = Lp,
  CS = qp,
  Xp = Vp;
const Qp = ES,
  Zp = AS,
  Kp = TS,
  ls = g.forwardRef(({ className: a, sideOffset: u = 4, ...r }, o) =>
    b.jsx(CS, {
      children: b.jsx(Xp, {
        ref: o,
        sideOffset: u,
        className: ne(
          "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          a,
        ),
        ...r,
      }),
    }),
  );
ls.displayName = Xp.displayName;
const Bh = (a) => {
    let u;
    const r = new Set(),
      o = (p, S) => {
        const x = typeof p == "function" ? p(u) : p;
        if (!Object.is(x, u)) {
          const N = u;
          ((u = (S ?? (typeof x != "object" || x === null)) ? x : Object.assign({}, u, x)),
            r.forEach((z) => z(u, N)));
        }
      },
      s = () => u,
      h = {
        setState: o,
        getState: s,
        getInitialState: () => v,
        subscribe: (p) => (r.add(p), () => r.delete(p)),
      },
      v = (u = a(o, s, h));
    return h;
  },
  NS = (a) => (a ? Bh(a) : Bh),
  OS = (a) => a;
function wS(a, u = OS) {
  const r = De.useSyncExternalStore(
    a.subscribe,
    De.useCallback(() => u(a.getState()), [a, u]),
    De.useCallback(() => u(a.getInitialState()), [a, u]),
  );
  return (De.useDebugValue(r), r);
}
const Lh = (a) => {
    const u = NS(a),
      r = (o) => wS(u, o);
    return (Object.assign(r, u), r);
  },
  _S = (a) => (a ? Lh(a) : Lh),
  RS = 50,
  bn = _S((a) => ({
    connected: !1,
    nodes: [],
    actions: [],
    events: [],
    packets: [],
    calls: [],
    selectedAction: null,
    selectedNode: null,
    setConnected: (u) => a({ connected: u }),
    setInitialState: (u, r, o) => a({ nodes: u, actions: r, events: o, connected: !0 }),
    addNode: (u) => a((r) => ({ nodes: [...r.nodes.filter((o) => o.id !== u.id), u] })),
    removeNode: (u) =>
      a((r) => ({
        nodes: r.nodes.filter((o) => o.id !== u),
        selectedNode: r.selectedNode === u ? null : r.selectedNode,
      })),
    updateNode: (u) => a((r) => ({ nodes: r.nodes.map((o) => (o.id === u.id ? u : o)) })),
    updateRegistry: (u, r) => a({ actions: u, events: r }),
    addPacket: (u) => a((r) => ({ packets: [...r.packets.slice(-99), u] })),
    clearPackets: () => a({ packets: [] }),
    addCall: (u) => a((r) => ({ calls: [u, ...r.calls.slice(0, RS - 1)] })),
    updateCall: (u, r) =>
      a((o) => ({ calls: o.calls.map((s) => (s.id === u ? { ...s, ...r } : s)) })),
    setSelectedAction: (u) => a({ selectedAction: u }),
    setSelectedNode: (u) => a({ selectedNode: u }),
  })),
  zS = [
    { id: "cluster", label: "Cluster", icon: $0 },
    { id: "actions", label: "Actions", icon: Rr, badge: () => bn.getState().actions.length },
    { id: "events", label: "Events", icon: _r, badge: () => bn.getState().events.length },
    { id: "packets", label: "Packets", icon: Fh },
  ];
function jS({ currentView: a, onViewChange: u }) {
  const { connected: r, nodes: o } = bn();
  return b.jsx(Qp, {
    delayDuration: 0,
    children: b.jsxs("div", {
      className: "flex h-screen w-16 flex-col items-center border-r bg-sidebar py-4",
      children: [
        b.jsx("div", {
          className:
            "mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground",
          children: b.jsx(K0, { className: "h-5 w-5" }),
        }),
        b.jsx(ap, { className: "my-2 w-8" }),
        b.jsxs(Zp, {
          children: [
            b.jsx(Kp, {
              asChild: !0,
              children: b.jsx("div", {
                className: ne("mb-4 h-2 w-2 rounded-full", r ? "bg-green-500" : "bg-red-500"),
              }),
            }),
            b.jsx(ls, {
              side: "right",
              children: r ? `Connected (${o.length} nodes)` : "Disconnected",
            }),
          ],
        }),
        b.jsx("nav", {
          className: "flex flex-1 flex-col items-center gap-2",
          children: zS.map((s) =>
            b.jsx(qh, { item: s, isActive: a === s.id, onClick: () => u(s.id) }, s.id),
          ),
        }),
        b.jsx("div", {
          className: "flex flex-col items-center gap-2",
          children: b.jsx(qh, {
            item: { id: "settings", label: "Settings", icon: eb },
            isActive: a === "settings",
            onClick: () => u("settings"),
          }),
        }),
      ],
    }),
  });
}
function qh({ item: a, isActive: u, onClick: r }) {
  const o = a.icon;
  return b.jsxs(Zp, {
    children: [
      b.jsx(Kp, {
        asChild: !0,
        children: b.jsxs(Xu, {
          variant: u ? "secondary" : "ghost",
          size: "icon",
          onClick: r,
          className: ne("relative h-10 w-10", u && "bg-sidebar-accent"),
          children: [
            b.jsx(o, { className: "h-5 w-5" }),
            a.badge &&
              b.jsx("span", {
                className:
                  "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground",
                children: a.badge(),
              }),
          ],
        }),
      }),
      b.jsx(ls, { side: "right", children: a.label }),
    ],
  });
}
const MS = ep(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-500 text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
function Le({ className: a, variant: u, ...r }) {
  return b.jsx("div", { className: ne(MS({ variant: u }), a), ...r });
}
const xn = g.forwardRef(({ className: a, ...u }, r) =>
  b.jsx("div", {
    ref: r,
    className: ne("rounded-xl border bg-card text-card-foreground shadow", a),
    ...u,
  }),
);
xn.displayName = "Card";
const ra = g.forwardRef(({ className: a, ...u }, r) =>
  b.jsx("div", { ref: r, className: ne("flex flex-col space-y-1.5 p-6", a), ...u }),
);
ra.displayName = "CardHeader";
const sa = g.forwardRef(({ className: a, ...u }, r) =>
  b.jsx("div", { ref: r, className: ne("font-semibold leading-none tracking-tight", a), ...u }),
);
sa.displayName = "CardTitle";
const Br = g.forwardRef(({ className: a, ...u }, r) =>
  b.jsx("div", { ref: r, className: ne("text-sm text-muted-foreground", a), ...u }),
);
Br.displayName = "CardDescription";
const Sn = g.forwardRef(({ className: a, ...u }, r) =>
  b.jsx("div", { ref: r, className: ne("p-6 pt-0", a), ...u }),
);
Sn.displayName = "CardContent";
const DS = g.forwardRef(({ className: a, ...u }, r) =>
  b.jsx("div", { ref: r, className: ne("flex items-center p-6 pt-0", a), ...u }),
);
DS.displayName = "CardFooter";
function US() {
  const { nodes: a, selectedNode: u, setSelectedNode: r } = bn();
  return b.jsxs("div", {
    className: "flex h-full flex-col gap-4 p-4",
    children: [
      b.jsxs("div", {
        className: "flex items-center justify-between",
        children: [
          b.jsx("h1", { className: "text-2xl font-bold", children: "Cluster Overview" }),
          b.jsxs(Le, { variant: "secondary", children: [a.length, " Nodes"] }),
        ],
      }),
      b.jsxs("div", {
        className: "grid grid-cols-3 gap-4",
        children: [
          b.jsx(Nr, {
            title: "Total Nodes",
            value: a.length,
            icon: bh,
            description: "Connected to cluster",
          }),
          b.jsx(Nr, {
            title: "Local Nodes",
            value: a.filter((o) => o.isLocal).length,
            icon: H0,
            description: "Running locally",
          }),
          b.jsx(Nr, {
            title: "Avg CPU",
            value: `${Math.round(a.reduce((o, s) => o + (s.cpu || 0), 0) / a.length || 0)}%`,
            icon: G0,
            description: "Average CPU usage",
          }),
        ],
      }),
      b.jsx("div", {
        className: "flex-1 overflow-auto",
        children: b.jsxs("div", {
          className: "grid gap-3",
          children: [
            a.map((o) =>
              b.jsx(
                xn,
                {
                  className: `cursor-pointer transition-colors hover:bg-accent ${u === o.id ? "border-primary" : ""}`,
                  onClick: () => r(o.id === u ? null : o.id),
                  children: b.jsxs(Sn, {
                    className: "flex items-center gap-4 p-4",
                    children: [
                      b.jsx("div", {
                        className: `h-3 w-3 rounded-full ${o.isAvailable ? "bg-green-500" : "bg-red-500"}`,
                      }),
                      b.jsxs("div", {
                        className: "flex-1",
                        children: [
                          b.jsxs("div", {
                            className: "flex items-center gap-2",
                            children: [
                              b.jsx("span", {
                                className: "font-mono text-sm font-medium",
                                children: o.id,
                              }),
                              o.isLocal &&
                                b.jsx(Le, {
                                  variant: "outline",
                                  className: "text-xs",
                                  children: "Local",
                                }),
                            ],
                          }),
                          b.jsx("div", {
                            className: "mt-1 flex flex-wrap gap-1",
                            children: o.services.map((s) =>
                              b.jsx(
                                Le,
                                { variant: "secondary", className: "text-xs", children: s },
                                s,
                              ),
                            ),
                          }),
                        ],
                      }),
                      o.cpu !== void 0 &&
                        b.jsxs("div", {
                          className: "text-right",
                          children: [
                            b.jsx("div", {
                              className: "text-sm text-muted-foreground",
                              children: "CPU",
                            }),
                            b.jsxs("div", {
                              className: "font-mono text-lg font-bold",
                              children: [Math.round(o.cpu), "%"],
                            }),
                          ],
                        }),
                    ],
                  }),
                },
                o.id,
              ),
            ),
            a.length === 0 &&
              b.jsxs("div", {
                className: "flex flex-col items-center justify-center py-12 text-muted-foreground",
                children: [
                  b.jsx(bh, { className: "mb-4 h-12 w-12 opacity-50" }),
                  b.jsx("p", { children: "No nodes connected" }),
                ],
              }),
          ],
        }),
      }),
    ],
  });
}
function Nr({ title: a, value: u, icon: r, description: o }) {
  return b.jsxs(xn, {
    children: [
      b.jsxs(ra, {
        className: "flex flex-row items-center justify-between space-y-0 pb-2",
        children: [
          b.jsx(sa, { className: "text-sm font-medium", children: a }),
          b.jsx(r, { className: "h-4 w-4 text-muted-foreground" }),
        ],
      }),
      b.jsxs(Sn, {
        children: [
          b.jsx("div", { className: "text-2xl font-bold", children: u }),
          b.jsx("p", { className: "text-xs text-muted-foreground", children: o }),
        ],
      }),
    ],
  });
}
const as = g.forwardRef(({ className: a, type: u, ...r }, o) =>
  b.jsx("input", {
    type: u,
    className: ne(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      a,
    ),
    ref: o,
    ...r,
  }),
);
as.displayName = "Input";
function Vh(a) {
  const u = HS(a),
    r = g.forwardRef((o, s) => {
      const { children: d, ...m } = o,
        h = g.Children.toArray(d),
        v = h.find(LS);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
function HS(a) {
  const u = g.forwardRef((r, o) => {
    const { children: s, ...d } = r;
    if (g.isValidElement(s)) {
      const m = VS(s),
        h = qS(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var BS = Symbol("radix.slottable");
function LS(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === BS
  );
}
function qS(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function VS(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
function YS(a) {
  const u = a + "CollectionProvider",
    [r, o] = mi(u),
    [s, d] = r(u, { collectionRef: { current: null }, itemMap: new Map() }),
    m = (U) => {
      const { scope: M, children: V } = U,
        Y = De.useRef(null),
        X = De.useRef(new Map()).current;
      return b.jsx(s, { scope: M, itemMap: X, collectionRef: Y, children: V });
    };
  m.displayName = u;
  const h = a + "CollectionSlot",
    v = Vh(h),
    p = De.forwardRef((U, M) => {
      const { scope: V, children: Y } = U,
        X = d(h, V),
        Z = $e(M, X.collectionRef);
      return b.jsx(v, { ref: Z, children: Y });
    });
  p.displayName = h;
  const S = a + "CollectionItemSlot",
    x = "data-radix-collection-item",
    N = Vh(S),
    z = De.forwardRef((U, M) => {
      const { scope: V, children: Y, ...X } = U,
        Z = De.useRef(null),
        W = $e(M, Z),
        F = d(S, V);
      return (
        De.useEffect(() => (F.itemMap.set(Z, { ref: Z, ...X }), () => void F.itemMap.delete(Z))),
        b.jsx(N, { [x]: "", ref: W, children: Y })
      );
    });
  z.displayName = S;
  function D(U) {
    const M = d(a + "CollectionConsumer", U);
    return De.useCallback(() => {
      const Y = M.collectionRef.current;
      if (!Y) return [];
      const X = Array.from(Y.querySelectorAll(`[${x}]`));
      return Array.from(M.itemMap.values()).sort(
        (F, Q) => X.indexOf(F.ref.current) - X.indexOf(Q.ref.current),
      );
    }, [M.collectionRef, M.itemMap]);
  }
  return [{ Provider: m, Slot: p, ItemSlot: z }, D, o];
}
function GS(a) {
  const u = XS(a),
    r = g.forwardRef((o, s) => {
      const { children: d, ...m } = o,
        h = g.Children.toArray(d),
        v = h.find(ZS);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
function XS(a) {
  const u = g.forwardRef((r, o) => {
    const { children: s, ...d } = r;
    if (g.isValidElement(s)) {
      const m = JS(s),
        h = KS(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var QS = Symbol("radix.slottable");
function ZS(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === QS
  );
}
function KS(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function JS(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
var $S = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  Jp = $S.reduce((a, u) => {
    const r = GS(`Primitive.${u}`),
      o = g.forwardRef((s, d) => {
        const { asChild: m, ...h } = s,
          v = m ? r : u;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          b.jsx(v, { ...h, ref: d })
        );
      });
    return ((o.displayName = `Primitive.${u}`), { ...a, [u]: o });
  }, {}),
  kS = g.createContext(void 0);
function $p(a) {
  const u = g.useContext(kS);
  return a || u || "ltr";
}
var Or = "rovingFocusGroup.onEntryFocus",
  WS = { bubbles: !1, cancelable: !0 },
  vi = "RovingFocusGroup",
  [Lr, kp, FS] = YS(vi),
  [PS, Wp] = mi(vi, [FS]),
  [IS, t2] = PS(vi),
  Fp = g.forwardRef((a, u) =>
    b.jsx(Lr.Provider, {
      scope: a.__scopeRovingFocusGroup,
      children: b.jsx(Lr.Slot, {
        scope: a.__scopeRovingFocusGroup,
        children: b.jsx(e2, { ...a, ref: u }),
      }),
    }),
  );
Fp.displayName = vi;
var e2 = g.forwardRef((a, u) => {
    const {
        __scopeRovingFocusGroup: r,
        orientation: o,
        loop: s = !1,
        dir: d,
        currentTabStopId: m,
        defaultCurrentTabStopId: h,
        onCurrentTabStopIdChange: v,
        onEntryFocus: p,
        preventScrollOnEntryFocus: S = !1,
        ...x
      } = a,
      N = g.useRef(null),
      z = $e(u, N),
      D = $p(d),
      [U, M] = ts({ prop: m, defaultProp: h ?? null, onChange: v, caller: vi }),
      [V, Y] = g.useState(!1),
      X = hi(p),
      Z = kp(r),
      W = g.useRef(!1),
      [F, Q] = g.useState(0);
    return (
      g.useEffect(() => {
        const et = N.current;
        if (et) return (et.addEventListener(Or, X), () => et.removeEventListener(Or, X));
      }, [X]),
      b.jsx(IS, {
        scope: r,
        orientation: o,
        dir: D,
        loop: s,
        currentTabStopId: U,
        onItemFocus: g.useCallback((et) => M(et), [M]),
        onItemShiftTab: g.useCallback(() => Y(!0), []),
        onFocusableItemAdd: g.useCallback(() => Q((et) => et + 1), []),
        onFocusableItemRemove: g.useCallback(() => Q((et) => et - 1), []),
        children: b.jsx(Jp.div, {
          tabIndex: V || F === 0 ? -1 : 0,
          "data-orientation": o,
          ...x,
          ref: z,
          style: { outline: "none", ...a.style },
          onMouseDown: kt(a.onMouseDown, () => {
            W.current = !0;
          }),
          onFocus: kt(a.onFocus, (et) => {
            const bt = !W.current;
            if (et.target === et.currentTarget && bt && !V) {
              const ht = new CustomEvent(Or, WS);
              if ((et.currentTarget.dispatchEvent(ht), !ht.defaultPrevented)) {
                const xt = Z().filter((_) => _.focusable),
                  I = xt.find((_) => _.active),
                  St = xt.find((_) => _.id === U),
                  Ct = [I, St, ...xt].filter(Boolean).map((_) => _.ref.current);
                ty(Ct, S);
              }
            }
            W.current = !1;
          }),
          onBlur: kt(a.onBlur, () => Y(!1)),
        }),
      })
    );
  }),
  Pp = "RovingFocusGroupItem",
  Ip = g.forwardRef((a, u) => {
    const {
        __scopeRovingFocusGroup: r,
        focusable: o = !0,
        active: s = !1,
        tabStopId: d,
        children: m,
        ...h
      } = a,
      v = Zr(),
      p = d || v,
      S = t2(Pp, r),
      x = S.currentTabStopId === p,
      N = kp(r),
      { onFocusableItemAdd: z, onFocusableItemRemove: D, currentTabStopId: U } = S;
    return (
      g.useEffect(() => {
        if (o) return (z(), () => D());
      }, [o, z, D]),
      b.jsx(Lr.ItemSlot, {
        scope: r,
        id: p,
        focusable: o,
        active: s,
        children: b.jsx(Jp.span, {
          tabIndex: x ? 0 : -1,
          "data-orientation": S.orientation,
          ...h,
          ref: u,
          onMouseDown: kt(a.onMouseDown, (M) => {
            o ? S.onItemFocus(p) : M.preventDefault();
          }),
          onFocus: kt(a.onFocus, () => S.onItemFocus(p)),
          onKeyDown: kt(a.onKeyDown, (M) => {
            if (M.key === "Tab" && M.shiftKey) {
              S.onItemShiftTab();
              return;
            }
            if (M.target !== M.currentTarget) return;
            const V = a2(M, S.orientation, S.dir);
            if (V !== void 0) {
              if (M.metaKey || M.ctrlKey || M.altKey || M.shiftKey) return;
              M.preventDefault();
              let X = N()
                .filter((Z) => Z.focusable)
                .map((Z) => Z.ref.current);
              if (V === "last") X.reverse();
              else if (V === "prev" || V === "next") {
                V === "prev" && X.reverse();
                const Z = X.indexOf(M.currentTarget);
                X = S.loop ? i2(X, Z + 1) : X.slice(Z + 1);
              }
              setTimeout(() => ty(X));
            }
          }),
          children: typeof m == "function" ? m({ isCurrentTabStop: x, hasTabStop: U != null }) : m,
        }),
      })
    );
  });
Ip.displayName = Pp;
var n2 = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last",
};
function l2(a, u) {
  return u !== "rtl" ? a : a === "ArrowLeft" ? "ArrowRight" : a === "ArrowRight" ? "ArrowLeft" : a;
}
function a2(a, u, r) {
  const o = l2(a.key, r);
  if (
    !(u === "vertical" && ["ArrowLeft", "ArrowRight"].includes(o)) &&
    !(u === "horizontal" && ["ArrowUp", "ArrowDown"].includes(o))
  )
    return n2[o];
}
function ty(a, u = !1) {
  const r = document.activeElement;
  for (const o of a)
    if (o === r || (o.focus({ preventScroll: u }), document.activeElement !== r)) return;
}
function i2(a, u) {
  return a.map((r, o) => a[(u + o) % a.length]);
}
var u2 = Fp,
  c2 = Ip;
function o2(a) {
  const u = r2(a),
    r = g.forwardRef((o, s) => {
      const { children: d, ...m } = o,
        h = g.Children.toArray(d),
        v = h.find(f2);
      if (v) {
        const p = v.props.children,
          S = h.map((x) =>
            x === v
              ? g.Children.count(p) > 1
                ? g.Children.only(null)
                : g.isValidElement(p)
                  ? p.props.children
                  : null
              : x,
          );
        return b.jsx(u, {
          ...m,
          ref: s,
          children: g.isValidElement(p) ? g.cloneElement(p, void 0, S) : null,
        });
      }
      return b.jsx(u, { ...m, ref: s, children: d });
    });
  return ((r.displayName = `${a}.Slot`), r);
}
function r2(a) {
  const u = g.forwardRef((r, o) => {
    const { children: s, ...d } = r;
    if (g.isValidElement(s)) {
      const m = m2(s),
        h = d2(d, s.props);
      return (s.type !== g.Fragment && (h.ref = o ? Ye(o, m) : m), g.cloneElement(s, h));
    }
    return g.Children.count(s) > 1 ? g.Children.only(null) : null;
  });
  return ((u.displayName = `${a}.SlotClone`), u);
}
var s2 = Symbol("radix.slottable");
function f2(a) {
  return (
    g.isValidElement(a) &&
    typeof a.type == "function" &&
    "__radixId" in a.type &&
    a.type.__radixId === s2
  );
}
function d2(a, u) {
  const r = { ...u };
  for (const o in u) {
    const s = a[o],
      d = u[o];
    /^on[A-Z]/.test(o)
      ? s && d
        ? (r[o] = (...h) => {
            const v = d(...h);
            return (s(...h), v);
          })
        : s && (r[o] = s)
      : o === "style"
        ? (r[o] = { ...s, ...d })
        : o === "className" && (r[o] = [s, d].filter(Boolean).join(" "));
  }
  return { ...a, ...r };
}
function m2(a) {
  let u = Object.getOwnPropertyDescriptor(a.props, "ref")?.get,
    r = u && "isReactWarning" in u && u.isReactWarning;
  return r
    ? a.ref
    : ((u = Object.getOwnPropertyDescriptor(a, "ref")?.get),
      (r = u && "isReactWarning" in u && u.isReactWarning),
      r ? a.props.ref : a.props.ref || a.ref);
}
var h2 = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  Fu = h2.reduce((a, u) => {
    const r = o2(`Primitive.${u}`),
      o = g.forwardRef((s, d) => {
        const { asChild: m, ...h } = s,
          v = m ? r : u;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          b.jsx(v, { ...h, ref: d })
        );
      });
    return ((o.displayName = `Primitive.${u}`), { ...a, [u]: o });
  }, {}),
  Pu = "Tabs",
  [p2] = mi(Pu, [Wp]),
  ey = Wp(),
  [y2, is] = p2(Pu),
  ny = g.forwardRef((a, u) => {
    const {
        __scopeTabs: r,
        value: o,
        onValueChange: s,
        defaultValue: d,
        orientation: m = "horizontal",
        dir: h,
        activationMode: v = "automatic",
        ...p
      } = a,
      S = $p(h),
      [x, N] = ts({ prop: o, onChange: s, defaultProp: d ?? "", caller: Pu });
    return b.jsx(y2, {
      scope: r,
      baseId: Zr(),
      value: x,
      onValueChange: N,
      orientation: m,
      dir: S,
      activationMode: v,
      children: b.jsx(Fu.div, { dir: S, "data-orientation": m, ...p, ref: u }),
    });
  });
ny.displayName = Pu;
var ly = "TabsList",
  ay = g.forwardRef((a, u) => {
    const { __scopeTabs: r, loop: o = !0, ...s } = a,
      d = is(ly, r),
      m = ey(r);
    return b.jsx(u2, {
      asChild: !0,
      ...m,
      orientation: d.orientation,
      dir: d.dir,
      loop: o,
      children: b.jsx(Fu.div, { role: "tablist", "aria-orientation": d.orientation, ...s, ref: u }),
    });
  });
ay.displayName = ly;
var iy = "TabsTrigger",
  uy = g.forwardRef((a, u) => {
    const { __scopeTabs: r, value: o, disabled: s = !1, ...d } = a,
      m = is(iy, r),
      h = ey(r),
      v = ry(m.baseId, o),
      p = sy(m.baseId, o),
      S = o === m.value;
    return b.jsx(c2, {
      asChild: !0,
      ...h,
      focusable: !s,
      active: S,
      children: b.jsx(Fu.button, {
        type: "button",
        role: "tab",
        "aria-selected": S,
        "aria-controls": p,
        "data-state": S ? "active" : "inactive",
        "data-disabled": s ? "" : void 0,
        disabled: s,
        id: v,
        ...d,
        ref: u,
        onMouseDown: kt(a.onMouseDown, (x) => {
          !s && x.button === 0 && x.ctrlKey === !1 ? m.onValueChange(o) : x.preventDefault();
        }),
        onKeyDown: kt(a.onKeyDown, (x) => {
          [" ", "Enter"].includes(x.key) && m.onValueChange(o);
        }),
        onFocus: kt(a.onFocus, () => {
          const x = m.activationMode !== "manual";
          !S && !s && x && m.onValueChange(o);
        }),
      }),
    });
  });
uy.displayName = iy;
var cy = "TabsContent",
  oy = g.forwardRef((a, u) => {
    const { __scopeTabs: r, value: o, forceMount: s, children: d, ...m } = a,
      h = is(cy, r),
      v = ry(h.baseId, o),
      p = sy(h.baseId, o),
      S = o === h.value,
      x = g.useRef(S);
    return (
      g.useEffect(() => {
        const N = requestAnimationFrame(() => (x.current = !1));
        return () => cancelAnimationFrame(N);
      }, []),
      b.jsx($u, {
        present: s || S,
        children: ({ present: N }) =>
          b.jsx(Fu.div, {
            "data-state": S ? "active" : "inactive",
            "data-orientation": h.orientation,
            role: "tabpanel",
            "aria-labelledby": v,
            hidden: !N,
            id: p,
            tabIndex: 0,
            ...m,
            ref: u,
            style: { ...a.style, animationDuration: x.current ? "0s" : void 0 },
            children: N && d,
          }),
      })
    );
  });
oy.displayName = cy;
function ry(a, u) {
  return `${a}-trigger-${u}`;
}
function sy(a, u) {
  return `${a}-content-${u}`;
}
var v2 = ny,
  fy = ay,
  dy = uy,
  my = oy;
const g2 = v2,
  hy = g.forwardRef(({ className: a, ...u }, r) =>
    b.jsx(fy, {
      ref: r,
      className: ne(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        a,
      ),
      ...u,
    }),
  );
hy.displayName = fy.displayName;
const qr = g.forwardRef(({ className: a, ...u }, r) =>
  b.jsx(dy, {
    ref: r,
    className: ne(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      a,
    ),
    ...u,
  }),
);
qr.displayName = dy.displayName;
const Vr = g.forwardRef(({ className: a, ...u }, r) =>
  b.jsx(my, {
    ref: r,
    className: ne(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      a,
    ),
    ...u,
  }),
);
Vr.displayName = my.displayName;
function py() {
  const a = g.useRef(null),
    u = g.useRef(void 0),
    r = bn,
    o = r.getState().setConnected,
    s = r.getState().setInitialState,
    d = r.getState().addNode,
    m = r.getState().removeNode,
    h = r.getState().updateNode,
    v = r.getState().updateRegistry,
    p = r.getState().addPacket,
    S = r.getState().addCall,
    x = r.getState().updateCall,
    N = g.useCallback(() => {
      const U = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws`,
        M = new WebSocket(U);
      return (
        (a.current = M),
        (M.onopen = () => {
          o(!0);
        }),
        (M.onclose = () => {
          (o(!1), (u.current = setTimeout(N, 3e3)));
        }),
        (M.onerror = () => {
          M.close();
        }),
        (M.onmessage = (V) => {
          try {
            const Y = JSON.parse(V.data);
            switch (Y.type) {
              case "initial":
                s(Y.nodes, Y.actions, Y.events);
                break;
              case "node:connected":
                d(Y.node);
                break;
              case "node:disconnected":
                m(Y.nodeId);
                break;
              case "node:updated":
                h(Y.node);
                break;
              case "registry:updated":
                v(Y.actions, Y.events);
                break;
              case "packet":
                p(Y.packet);
                break;
              case "call:result":
                x(Y.id, { status: "success", result: Y.result, finishedAt: Date.now() });
                break;
              case "call:error":
                x(Y.id, { status: "error", error: Y.error, finishedAt: Date.now() });
                break;
            }
          } catch {}
        }),
        M
      );
    }, []),
    z = g.useCallback((D, U) => {
      if (!a.current || a.current.readyState !== WebSocket.OPEN) return null;
      const M = crypto.randomUUID(),
        V = { id: M, action: D, params: U, status: "pending", startedAt: Date.now() };
      return (
        S(V),
        a.current.send(JSON.stringify({ type: "call", id: M, action: D, params: U })),
        M
      );
    }, []);
  return (
    g.useEffect(() => {
      const D = N();
      return () => {
        (u.current && clearTimeout(u.current), D.close());
      };
    }, [N]),
    { callAction: z }
  );
}
function b2() {
  const { actions: a, calls: u, selectedAction: r, setSelectedAction: o } = bn(),
    { callAction: s } = py(),
    [d, m] = g.useState(""),
    [h, v] = g.useState("{}"),
    p = a.filter((x) => x.name?.toLowerCase().includes(d.toLowerCase())),
    S = () => {
      if (r)
        try {
          const x = JSON.parse(h);
          s(r, x);
        } catch {
          alert("Invalid JSON params");
        }
    };
  return b.jsxs("div", {
    className: "flex h-full",
    children: [
      b.jsxs("div", {
        className: "flex w-80 flex-col border-r",
        children: [
          b.jsxs("div", {
            className: "border-b p-4",
            children: [
              b.jsx("h2", { className: "mb-3 text-lg font-semibold", children: "Actions" }),
              b.jsxs("div", {
                className: "relative",
                children: [
                  b.jsx(Ph, {
                    className:
                      "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  }),
                  b.jsx(as, {
                    placeholder: "Search actions...",
                    value: d,
                    onChange: (x) => m(x.target.value),
                    className: "pl-9",
                  }),
                ],
              }),
            ],
          }),
          b.jsxs("div", {
            className: "flex-1 overflow-auto p-2",
            children: [
              p.map((x) =>
                b.jsxs(
                  "button",
                  {
                    onClick: () => o(x.name),
                    className: `mb-1 w-full rounded-md p-3 text-left transition-colors hover:bg-accent ${r === x.name ? "bg-accent" : ""}`,
                    children: [
                      b.jsxs("div", {
                        className: "flex items-center justify-between",
                        children: [
                          b.jsx("span", { className: "font-mono text-sm", children: x.name }),
                          b.jsx(Le, {
                            variant: x.hasAvailable ? "success" : "secondary",
                            className: "text-xs",
                            children: x.count,
                          }),
                        ],
                      }),
                      b.jsx("div", {
                        className: "mt-1 flex gap-1",
                        children:
                          x.hasLocal &&
                          b.jsx(Le, {
                            variant: "outline",
                            className: "text-xs",
                            children: "Local",
                          }),
                      }),
                    ],
                  },
                  x.name,
                ),
              ),
              p.length === 0 &&
                b.jsxs("div", {
                  className: "flex flex-col items-center justify-center py-8 text-muted-foreground",
                  children: [
                    b.jsx(Rr, { className: "mb-2 h-8 w-8 opacity-50" }),
                    b.jsx("p", { className: "text-sm", children: "No actions found" }),
                  ],
                }),
            ],
          }),
        ],
      }),
      b.jsx("div", {
        className: "flex flex-1 flex-col",
        children: r
          ? b.jsxs(g2, {
              defaultValue: "execute",
              className: "flex h-full flex-col",
              children: [
                b.jsx("div", {
                  className: "border-b px-4",
                  children: b.jsxs(hy, {
                    className: "mt-2",
                    children: [
                      b.jsx(qr, { value: "execute", children: "Execute" }),
                      b.jsx(qr, { value: "history", children: "History" }),
                    ],
                  }),
                }),
                b.jsx(Vr, {
                  value: "execute",
                  className: "flex-1 p-4",
                  children: b.jsxs(xn, {
                    children: [
                      b.jsx(ra, { children: b.jsx(sa, { className: "font-mono", children: r }) }),
                      b.jsxs(Sn, {
                        className: "space-y-4",
                        children: [
                          b.jsxs("div", {
                            children: [
                              b.jsx("label", {
                                className: "mb-2 block text-sm font-medium",
                                children: "Parameters (JSON)",
                              }),
                              b.jsx("textarea", {
                                value: h,
                                onChange: (x) => v(x.target.value),
                                className:
                                  "h-32 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm",
                                placeholder: "{}",
                              }),
                            ],
                          }),
                          b.jsxs(Xu, {
                            onClick: S,
                            className: "w-full",
                            children: [b.jsx(W0, { className: "mr-2 h-4 w-4" }), "Execute Action"],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                b.jsx(Vr, {
                  value: "history",
                  className: "flex-1 overflow-auto p-4",
                  children: b.jsxs("div", {
                    className: "space-y-2",
                    children: [
                      u
                        .filter((x) => x.action === r)
                        .map((x) =>
                          b.jsx(
                            xn,
                            {
                              children: b.jsxs(Sn, {
                                className: "p-4",
                                children: [
                                  b.jsxs("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                      b.jsxs("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                          x.status === "pending" &&
                                            b.jsx(V0, { className: "h-4 w-4 text-yellow-500" }),
                                          x.status === "success" &&
                                            b.jsx(L0, { className: "h-4 w-4 text-green-500" }),
                                          x.status === "error" &&
                                            b.jsx(ib, { className: "h-4 w-4 text-red-500" }),
                                          b.jsx("span", {
                                            className: "text-sm",
                                            children: new Date(x.startedAt).toLocaleTimeString(),
                                          }),
                                        ],
                                      }),
                                      x.finishedAt &&
                                        b.jsxs("span", {
                                          className: "text-xs text-muted-foreground",
                                          children: [x.finishedAt - x.startedAt, "ms"],
                                        }),
                                    ],
                                  }),
                                  x.status === "success" &&
                                    x.result !== void 0 &&
                                    b.jsx("pre", {
                                      className: "mt-2 overflow-auto rounded bg-muted p-2 text-xs",
                                      children: JSON.stringify(x.result, null, 2),
                                    }),
                                  x.status === "error" &&
                                    x.error &&
                                    b.jsx("p", {
                                      className: "mt-2 text-sm text-red-500",
                                      children: x.error,
                                    }),
                                ],
                              }),
                            },
                            x.id,
                          ),
                        ),
                      u.filter((x) => x.action === r).length === 0 &&
                        b.jsx("div", {
                          className:
                            "flex flex-col items-center justify-center py-8 text-muted-foreground",
                          children: b.jsx("p", {
                            className: "text-sm",
                            children: "No call history",
                          }),
                        }),
                    ],
                  }),
                }),
              ],
            })
          : b.jsxs("div", {
              className: "flex flex-1 flex-col items-center justify-center text-muted-foreground",
              children: [
                b.jsx(Rr, { className: "mb-4 h-12 w-12 opacity-50" }),
                b.jsx("p", { children: "Select an action to execute" }),
              ],
            }),
      }),
    ],
  });
}
function x2() {
  const { events: a } = bn(),
    [u, r] = g.useState(""),
    s = a
      .filter(
        (d) =>
          d.name?.toLowerCase().includes(u.toLowerCase()) ||
          d.group?.toLowerCase().includes(u.toLowerCase()),
      )
      .reduce((d, m) => {
        const h = m.group || "default";
        return (d[h] || (d[h] = []), d[h].push(m), d);
      }, {});
  return b.jsxs("div", {
    className: "flex h-full flex-col p-4",
    children: [
      b.jsxs("div", {
        className: "mb-4 flex items-center justify-between",
        children: [
          b.jsx("h1", { className: "text-2xl font-bold", children: "Events" }),
          b.jsxs(Le, { variant: "secondary", children: [a.length, " Events"] }),
        ],
      }),
      b.jsxs("div", {
        className: "relative mb-4",
        children: [
          b.jsx(Ph, {
            className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
          }),
          b.jsx(as, {
            placeholder: "Search events...",
            value: u,
            onChange: (d) => r(d.target.value),
            className: "pl-9",
          }),
        ],
      }),
      b.jsxs("div", {
        className: "flex-1 space-y-4 overflow-auto",
        children: [
          Object.entries(s).map(([d, m]) =>
            b.jsxs(
              xn,
              {
                children: [
                  b.jsx(ra, {
                    className: "pb-3",
                    children: b.jsxs(sa, {
                      className: "flex items-center justify-between text-base",
                      children: [
                        b.jsx("span", { children: d }),
                        b.jsx(Le, { variant: "outline", children: m.length }),
                      ],
                    }),
                  }),
                  b.jsx(Sn, {
                    className: "grid gap-2",
                    children: m.map((h) =>
                      b.jsxs(
                        "div",
                        {
                          className: "flex items-center justify-between rounded-md border p-3",
                          children: [
                            b.jsxs("div", {
                              className: "flex items-center gap-3",
                              children: [
                                b.jsx(_r, { className: "h-4 w-4 text-muted-foreground" }),
                                b.jsx("span", { className: "font-mono text-sm", children: h.name }),
                              ],
                            }),
                            b.jsx("div", {
                              className: "flex items-center gap-2",
                              children: b.jsxs(Le, {
                                variant: h.hasAvailable ? "success" : "secondary",
                                className: "text-xs",
                                children: [h.count, " listeners"],
                              }),
                            }),
                          ],
                        },
                        h.name,
                      ),
                    ),
                  }),
                ],
              },
              d,
            ),
          ),
          Object.keys(s).length === 0 &&
            b.jsxs("div", {
              className: "flex flex-col items-center justify-center py-12 text-muted-foreground",
              children: [
                b.jsx(_r, { className: "mb-4 h-12 w-12 opacity-50" }),
                b.jsx("p", { children: "No events found" }),
              ],
            }),
        ],
      }),
    ],
  });
}
function S2() {
  const { packets: a, clearPackets: u } = bn();
  return b.jsxs("div", {
    className: "flex h-full flex-col p-4",
    children: [
      b.jsxs("div", {
        className: "mb-4 flex items-center justify-between",
        children: [
          b.jsx("h1", { className: "text-2xl font-bold", children: "Packet Monitor" }),
          b.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              b.jsxs(Le, { variant: "secondary", children: [a.length, " packets"] }),
              b.jsxs(Xu, {
                variant: "outline",
                size: "sm",
                onClick: u,
                disabled: a.length === 0,
                children: [b.jsx(lb, { className: "mr-2 h-4 w-4" }), "Clear"],
              }),
            ],
          }),
        ],
      }),
      b.jsx("div", {
        className: "flex-1 overflow-auto",
        children: b.jsxs("div", {
          className: "space-y-2",
          children: [
            a
              .slice()
              .reverse()
              .map((r) => b.jsx(E2, { packet: r }, r.id)),
            a.length === 0 &&
              b.jsxs("div", {
                className: "flex flex-col items-center justify-center py-12 text-muted-foreground",
                children: [
                  b.jsx(Fh, { className: "mb-4 h-12 w-12 opacity-50" }),
                  b.jsx("p", { children: "No packets captured" }),
                  b.jsx("p", {
                    className: "mt-1 text-sm",
                    children: "Packets will appear here when nodes communicate",
                  }),
                ],
              }),
          ],
        }),
      }),
    ],
  });
}
function E2({ packet: a }) {
  const u = a.direction === "out";
  return b.jsx(xn, {
    className: ne("border-l-4", u ? "border-l-blue-500" : "border-l-green-500"),
    children: b.jsx(Sn, {
      className: "p-3",
      children: b.jsxs("div", {
        className: "flex items-center gap-3",
        children: [
          u
            ? b.jsx(D0, { className: "h-4 w-4 text-blue-500" })
            : b.jsx(j0, { className: "h-4 w-4 text-green-500" }),
          b.jsxs("div", {
            className: "flex-1",
            children: [
              b.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  b.jsx(Le, {
                    variant: "outline",
                    className: "font-mono text-xs",
                    children: a.type,
                  }),
                  a.action && b.jsx("span", { className: "font-mono text-sm", children: a.action }),
                  a.event && b.jsx("span", { className: "font-mono text-sm", children: a.event }),
                ],
              }),
              b.jsxs("div", {
                className: "mt-1 text-xs text-muted-foreground",
                children: [
                  b.jsx("span", { className: "font-mono", children: a.sender }),
                  b.jsx("span", { className: "mx-2", children: "→" }),
                  b.jsx("span", { className: "font-mono", children: a.target || "broadcast" }),
                ],
              }),
            ],
          }),
          b.jsx("span", {
            className: "text-xs text-muted-foreground",
            children: new Date(a.timestamp).toLocaleTimeString(),
          }),
        ],
      }),
    }),
  });
}
function A2() {
  const { connected: a, nodes: u, actions: r, events: o } = bn();
  return b.jsxs("div", {
    className: "flex h-full flex-col p-4",
    children: [
      b.jsxs("div", {
        className: "mb-4",
        children: [
          b.jsx("h1", { className: "text-2xl font-bold", children: "Settings" }),
          b.jsx("p", {
            className: "text-muted-foreground",
            children: "Explorer configuration and status",
          }),
        ],
      }),
      b.jsxs("div", {
        className: "space-y-4",
        children: [
          b.jsxs(xn, {
            children: [
              b.jsxs(ra, {
                children: [
                  b.jsxs(sa, {
                    className: "flex items-center gap-2",
                    children: [b.jsx(Q0, { className: "h-5 w-5" }), "Connection Status"],
                  }),
                  b.jsx(Br, { children: "Current connection to the cluster" }),
                ],
              }),
              b.jsx(Sn, {
                children: b.jsxs("div", {
                  className: "grid gap-4",
                  children: [
                    b.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        b.jsx("span", { children: "Status" }),
                        b.jsx(Le, {
                          variant: a ? "success" : "destructive",
                          children: a ? "Connected" : "Disconnected",
                        }),
                      ],
                    }),
                    b.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        b.jsx("span", { children: "Nodes" }),
                        b.jsx("span", { className: "font-mono", children: u.length }),
                      ],
                    }),
                    b.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        b.jsx("span", { children: "Actions" }),
                        b.jsx("span", { className: "font-mono", children: r.length }),
                      ],
                    }),
                    b.jsxs("div", {
                      className: "flex items-center justify-between",
                      children: [
                        b.jsx("span", { children: "Events" }),
                        b.jsx("span", { className: "font-mono", children: o.length }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
          b.jsxs(xn, {
            children: [
              b.jsxs(ra, {
                children: [
                  b.jsx(sa, { children: "About" }),
                  b.jsx(Br, { children: "Weave Explorer" }),
                ],
              }),
              b.jsx(Sn, {
                children: b.jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children:
                    "Weave Explorer provides a visual interface for monitoring and interacting with your Weave microservices cluster.",
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function T2() {
  const [a, u] = g.useState("cluster");
  return (
    py(),
    b.jsx(Qp, {
      children: b.jsxs("div", {
        className: "flex h-screen bg-background text-foreground",
        children: [
          b.jsx(jS, { currentView: a, onViewChange: u }),
          b.jsxs("main", {
            className: "flex-1 overflow-hidden",
            children: [
              a === "cluster" && b.jsx(US, {}),
              a === "actions" && b.jsx(b2, {}),
              a === "events" && b.jsx(x2, {}),
              a === "packets" && b.jsx(S2, {}),
              a === "settings" && b.jsx(A2, {}),
            ],
          }),
        ],
      }),
    })
  );
}
$g.createRoot(document.getElementById("root")).render(
  b.jsx(g.StrictMode, { children: b.jsx(T2, {}) }),
);
