"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var url_1 = require("url");
var utils = __importStar(require("./support/utils"));
var methods = [
    'delete',
    'get',
    'head',
    'options',
    'patch',
    'post',
    'put'
];
/** @type {Object.<string, Route>} */
var routes = {};
var buildInitialParams = function (path) {
    return utils.matchAll(/:(\w*)/g, path).reduce(function (params, current) {
        params[current[1]] = undefined;
        return params;
    }, {});
};
/**
 *
 * @param {string} method
 * @param {string} path
 * @param {Function.<IncomingMessage, ServerResponse>} handler
 */
var addRoute = function (method, path, handler) {
    method = method.toUpperCase();
    var route = {
        handler: handler,
        // params: utils.matchAll(/:(\w*)/g, path).map(param => ({ [param[1]]: undefined })),
        params: buildInitialParams(path),
        path: new RegExp("^" + path.replace(/\//g, '\\/').replace(/:([A-Za-z0-9_-]+)/g, '([A-Za-z0-9_-]+)') + "$"),
        method: method,
        query: {}
    };
    if (Array.isArray(routes[method]) === false) {
        routes[method] = [];
    }
    routes[method].push(route);
    return router;
};
/**
 * Check if a route exist
 *
 * @param {string} path Route path to verify
 * @param {string} method Route method
 *
 * @returns {Array<Route>} The routes that match the criteria
 */
var checkRoute = function (path, method) {
    var parsedUrl = new url_1.URL(path, 'rel:///');
    // If the method don't exist in the router return empty routes
    if (!routes[method]) {
        return [];
    }
    return routes[method].reduce(function (routes, route) {
        var match = parsedUrl.pathname.match(route.path) || [];
        if (match.length > 0) {
            match = match.slice(1);
            routes.push(__assign(__assign({}, route), { params: Object.keys(route.params).reduce(function (params, key, index) {
                    var _a;
                    return _a = {}, _a[key] = match[index], _a;
                }, {}), query: parsedUrl.search ? utils.fromEntries(parsedUrl.searchParams) : {} }));
        }
        return routes;
    }, []);
};
/**
 * Return the defined routes
 *
 * @returns Array<Route>
 */
var getRoutes = function () {
    return routes;
};
var group = function (name, routes) {
    routes.forEach(function (route) {
        addRoute(route.method, "/" + name + "/" + route.path, route.handler);
    });
};
/**
 * Set the routes to a complete new ones
 *
 * @param {Array<Route>} newRoutes
 * @returns {void}
 */
var setRoutes = function (newRoutes) {
    routes = newRoutes;
    return router;
};
/**
 * Verify if a route exist
 *
 * @deprecated since version 2.0.0
 * @param {string} path Route path to verify
 * @param {string} method Route method
 *
 * @returns {Array<Route>} The routes that match the criteria
 */
var verifyRoute = function (path, method) {
    console.log(utils.deprecated('verifyRoute', 'checkRoute'));
    return checkRoute(path, method);
};
var proxyTarget = {
    addRoute: addRoute,
    checkRoute: checkRoute,
    getRoutes: getRoutes,
    group: group,
    setRoutes: setRoutes,
    verifyRoute: verifyRoute
};
var router = new Proxy(proxyTarget, {
    get: function (target, property) {
        if (Reflect.has(target, property)) {
            return Reflect.get(target, property);
        }
        else if (methods.includes(property)) {
            return function (path, handler) {
                return addRoute(property, path, handler);
            };
        }
    }
});
exports.router = router;
