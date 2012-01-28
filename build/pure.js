var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var res = mod._cached ? mod._cached : mod();
    return res;
}

require.paths = [];
require.modules = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        var y = cwd || '.';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = x + '/package.json';
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = Object_keys(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

require.define = function (filename, fn) {
    var dirname = require._core[filename]
        ? ''
        : require.modules.path().dirname(filename)
    ;
    
    var require_ = function (file) {
        return require(file, dirname)
    };
    require_.resolve = function (name) {
        return require.resolve(name, dirname);
    };
    require_.modules = require.modules;
    require_.define = require.define;
    var module_ = { exports : {} };
    
    require.modules[filename] = function () {
        require.modules[filename]._cached = module_.exports;
        fn.call(
            module_.exports,
            require_,
            module_,
            module_.exports,
            dirname,
            filename
        );
        require.modules[filename]._cached = module_.exports;
        return module_.exports;
    };
};

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

if (typeof process === 'undefined') process = {};

if (!process.nextTick) process.nextTick = function (fn) {
    setTimeout(fn, 0);
};

if (!process.title) process.title = 'browser';

if (!process.binding) process.binding = function (name) {
    if (name === 'evals') return require('vm')
    else throw new Error('No such module')
};

if (!process.cwd) process.cwd = function () { return '.' };

require.define("path", function (require, module, exports, __dirname, __filename) {
    function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("/lib/underscore.js", function (require, module, exports, __dirname, __filename) {
    // Underscore.js 1.2.4
// (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
// Underscore is freely distributable under the MIT license.
// Portions of Underscore are inspired or borrowed from Prototype,
// Oliver Steele's Functional, and John Resig's Micro-Templating.
// For all details and documentation:
// http://documentcloud.github.com/underscore
(function(){function r(a,c,d){if(a===c)return a!==0||1/a==1/c;if(a==null||c==null)return a===c;if(a._chain)a=a._wrapped;if(c._chain)c=c._wrapped;if(a.isEqual&&b.isFunction(a.isEqual))return a.isEqual(c);if(c.isEqual&&b.isFunction(c.isEqual))return c.isEqual(a);var e=l.call(a);if(e!=l.call(c))return false;switch(e){case "[object String]":return a==String(c);case "[object Number]":return a!=+a?c!=+c:a==0?1/a==1/c:a==+c;case "[object Date]":case "[object Boolean]":return+a==+c;case "[object RegExp]":return a.source==
c.source&&a.global==c.global&&a.multiline==c.multiline&&a.ignoreCase==c.ignoreCase}if(typeof a!="object"||typeof c!="object")return false;for(var f=d.length;f--;)if(d[f]==a)return true;d.push(a);var f=0,g=true;if(e=="[object Array]"){if(f=a.length,g=f==c.length)for(;f--;)if(!(g=f in a==f in c&&r(a[f],c[f],d)))break}else{if("constructor"in a!="constructor"in c||a.constructor!=c.constructor)return false;for(var h in a)if(m.call(a,h)&&(f++,!(g=m.call(c,h)&&r(a[h],c[h],d))))break;if(g){for(h in c)if(m.call(c,
h)&&!f--)break;g=!f}}d.pop();return g}var s=this,G=s._,o={},k=Array.prototype,p=Object.prototype,i=k.slice,H=k.unshift,l=p.toString,m=p.hasOwnProperty,w=k.forEach,x=k.map,y=k.reduce,z=k.reduceRight,A=k.filter,B=k.every,C=k.some,q=k.indexOf,D=k.lastIndexOf,p=Array.isArray,I=Object.keys,t=Function.prototype.bind,b=function(a){return new n(a)};if(typeof exports!=="undefined"){if(typeof module!=="undefined"&&module.exports)exports=module.exports=b;exports._=b}else typeof define==="function"&&define.amd?
define("underscore",function(){return b}):s._=b;b.VERSION="1.2.4";var j=b.each=b.forEach=function(a,c,b){if(a!=null)if(w&&a.forEach===w)a.forEach(c,b);else if(a.length===+a.length)for(var e=0,f=a.length;e<f;e++){if(e in a&&c.call(b,a[e],e,a)===o)break}else for(e in a)if(m.call(a,e)&&c.call(b,a[e],e,a)===o)break};b.map=function(a,c,b){var e=[];if(a==null)return e;if(x&&a.map===x)return a.map(c,b);j(a,function(a,g,h){e[e.length]=c.call(b,a,g,h)});if(a.length===+a.length)e.length=a.length;return e};
b.reduce=b.foldl=b.inject=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(y&&a.reduce===y)return e&&(c=b.bind(c,e)),f?a.reduce(c,d):a.reduce(c);j(a,function(a,b,i){f?d=c.call(e,d,a,b,i):(d=a,f=true)});if(!f)throw new TypeError("Reduce of empty array with no initial value");return d};b.reduceRight=b.foldr=function(a,c,d,e){var f=arguments.length>2;a==null&&(a=[]);if(z&&a.reduceRight===z)return e&&(c=b.bind(c,e)),f?a.reduceRight(c,d):a.reduceRight(c);var g=b.toArray(a).reverse();e&&!f&&
(c=b.bind(c,e));return f?b.reduce(g,c,d,e):b.reduce(g,c)};b.find=b.detect=function(a,c,b){var e;E(a,function(a,g,h){if(c.call(b,a,g,h))return e=a,true});return e};b.filter=b.select=function(a,c,b){var e=[];if(a==null)return e;if(A&&a.filter===A)return a.filter(c,b);j(a,function(a,g,h){c.call(b,a,g,h)&&(e[e.length]=a)});return e};b.reject=function(a,c,b){var e=[];if(a==null)return e;j(a,function(a,g,h){c.call(b,a,g,h)||(e[e.length]=a)});return e};b.every=b.all=function(a,c,b){var e=true;if(a==null)return e;
if(B&&a.every===B)return a.every(c,b);j(a,function(a,g,h){if(!(e=e&&c.call(b,a,g,h)))return o});return e};var E=b.some=b.any=function(a,c,d){c||(c=b.identity);var e=false;if(a==null)return e;if(C&&a.some===C)return a.some(c,d);j(a,function(a,b,h){if(e||(e=c.call(d,a,b,h)))return o});return!!e};b.include=b.contains=function(a,c){var b=false;if(a==null)return b;return q&&a.indexOf===q?a.indexOf(c)!=-1:b=E(a,function(a){return a===c})};b.invoke=function(a,c){var d=i.call(arguments,2);return b.map(a,
function(a){return(b.isFunction(c)?c||a:a[c]).apply(a,d)})};b.pluck=function(a,c){return b.map(a,function(a){return a[c]})};b.max=function(a,c,d){if(!c&&b.isArray(a))return Math.max.apply(Math,a);if(!c&&b.isEmpty(a))return-Infinity;var e={computed:-Infinity};j(a,function(a,b,h){b=c?c.call(d,a,b,h):a;b>=e.computed&&(e={value:a,computed:b})});return e.value};b.min=function(a,c,d){if(!c&&b.isArray(a))return Math.min.apply(Math,a);if(!c&&b.isEmpty(a))return Infinity;var e={computed:Infinity};j(a,function(a,
b,h){b=c?c.call(d,a,b,h):a;b<e.computed&&(e={value:a,computed:b})});return e.value};b.shuffle=function(a){var c=[],b;j(a,function(a,f){f==0?c[0]=a:(b=Math.floor(Math.random()*(f+1)),c[f]=c[b],c[b]=a)});return c};b.sortBy=function(a,c,d){return b.pluck(b.map(a,function(a,b,g){return{value:a,criteria:c.call(d,a,b,g)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c<d?-1:c>d?1:0}),"value")};b.groupBy=function(a,c){var d={},e=b.isFunction(c)?c:function(a){return a[c]};j(a,function(a,b){var c=
e(a,b);(d[c]||(d[c]=[])).push(a)});return d};b.sortedIndex=function(a,c,d){d||(d=b.identity);for(var e=0,f=a.length;e<f;){var g=e+f>>1;d(a[g])<d(c)?e=g+1:f=g}return e};b.toArray=function(a){return!a?[]:a.toArray?a.toArray():b.isArray(a)?i.call(a):b.isArguments(a)?i.call(a):b.values(a)};b.size=function(a){return b.toArray(a).length};b.first=b.head=function(a,b,d){return b!=null&&!d?i.call(a,0,b):a[0]};b.initial=function(a,b,d){return i.call(a,0,a.length-(b==null||d?1:b))};b.last=function(a,b,d){return b!=
null&&!d?i.call(a,Math.max(a.length-b,0)):a[a.length-1]};b.rest=b.tail=function(a,b,d){return i.call(a,b==null||d?1:b)};b.compact=function(a){return b.filter(a,function(a){return!!a})};b.flatten=function(a,c){return b.reduce(a,function(a,e){if(b.isArray(e))return a.concat(c?e:b.flatten(e));a[a.length]=e;return a},[])};b.without=function(a){return b.difference(a,i.call(arguments,1))};b.uniq=b.unique=function(a,c,d){var d=d?b.map(a,d):a,e=[];b.reduce(d,function(d,g,h){if(0==h||(c===true?b.last(d)!=
g:!b.include(d,g)))d[d.length]=g,e[e.length]=a[h];return d},[]);return e};b.union=function(){return b.uniq(b.flatten(arguments,true))};b.intersection=b.intersect=function(a){var c=i.call(arguments,1);return b.filter(b.uniq(a),function(a){return b.every(c,function(c){return b.indexOf(c,a)>=0})})};b.difference=function(a){var c=b.flatten(i.call(arguments,1));return b.filter(a,function(a){return!b.include(c,a)})};b.zip=function(){for(var a=i.call(arguments),c=b.max(b.pluck(a,"length")),d=Array(c),e=
0;e<c;e++)d[e]=b.pluck(a,""+e);return d};b.indexOf=function(a,c,d){if(a==null)return-1;var e;if(d)return d=b.sortedIndex(a,c),a[d]===c?d:-1;if(q&&a.indexOf===q)return a.indexOf(c);for(d=0,e=a.length;d<e;d++)if(d in a&&a[d]===c)return d;return-1};b.lastIndexOf=function(a,b){if(a==null)return-1;if(D&&a.lastIndexOf===D)return a.lastIndexOf(b);for(var d=a.length;d--;)if(d in a&&a[d]===b)return d;return-1};b.range=function(a,b,d){arguments.length<=1&&(b=a||0,a=0);for(var d=arguments[2]||1,e=Math.max(Math.ceil((b-
a)/d),0),f=0,g=Array(e);f<e;)g[f++]=a,a+=d;return g};var F=function(){};b.bind=function(a,c){var d,e;if(a.bind===t&&t)return t.apply(a,i.call(arguments,1));if(!b.isFunction(a))throw new TypeError;e=i.call(arguments,2);return d=function(){if(!(this instanceof d))return a.apply(c,e.concat(i.call(arguments)));F.prototype=a.prototype;var b=new F,g=a.apply(b,e.concat(i.call(arguments)));return Object(g)===g?g:b}};b.bindAll=function(a){var c=i.call(arguments,1);c.length==0&&(c=b.functions(a));j(c,function(c){a[c]=
b.bind(a[c],a)});return a};b.memoize=function(a,c){var d={};c||(c=b.identity);return function(){var b=c.apply(this,arguments);return m.call(d,b)?d[b]:d[b]=a.apply(this,arguments)}};b.delay=function(a,b){var d=i.call(arguments,2);return setTimeout(function(){return a.apply(a,d)},b)};b.defer=function(a){return b.delay.apply(b,[a,1].concat(i.call(arguments,1)))};b.throttle=function(a,c){var d,e,f,g,h,i=b.debounce(function(){h=g=false},c);return function(){d=this;e=arguments;var b;f||(f=setTimeout(function(){f=
null;h&&a.apply(d,e);i()},c));g?h=true:a.apply(d,e);i();g=true}};b.debounce=function(a,b){var d;return function(){var e=this,f=arguments;clearTimeout(d);d=setTimeout(function(){d=null;a.apply(e,f)},b)}};b.once=function(a){var b=false,d;return function(){if(b)return d;b=true;return d=a.apply(this,arguments)}};b.wrap=function(a,b){return function(){var d=[a].concat(i.call(arguments,0));return b.apply(this,d)}};b.compose=function(){var a=arguments;return function(){for(var b=arguments,d=a.length-1;d>=
0;d--)b=[a[d].apply(this,b)];return b[0]}};b.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}};b.keys=I||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[],d;for(d in a)m.call(a,d)&&(b[b.length]=d);return b};b.values=function(a){return b.map(a,b.identity)};b.functions=b.methods=function(a){var c=[],d;for(d in a)b.isFunction(a[d])&&c.push(d);return c.sort()};b.extend=function(a){j(i.call(arguments,1),function(b){for(var d in b)b[d]!==
void 0&&(a[d]=b[d])});return a};b.defaults=function(a){j(i.call(arguments,1),function(b){for(var d in b)a[d]==null&&(a[d]=b[d])});return a};b.clone=function(a){return!b.isObject(a)?a:b.isArray(a)?a.slice():b.extend({},a)};b.tap=function(a,b){b(a);return a};b.isEqual=function(a,b){return r(a,b,[])};b.isEmpty=function(a){if(b.isArray(a)||b.isString(a))return a.length===0;for(var c in a)if(m.call(a,c))return false;return true};b.isElement=function(a){return!!(a&&a.nodeType==1)};b.isArray=p||function(a){return l.call(a)==
"[object Array]"};b.isObject=function(a){return a===Object(a)};b.isArguments=function(a){return l.call(a)=="[object Arguments]"};if(!b.isArguments(arguments))b.isArguments=function(a){return!(!a||!m.call(a,"callee"))};b.isFunction=function(a){return l.call(a)=="[object Function]"};b.isString=function(a){return l.call(a)=="[object String]"};b.isNumber=function(a){return l.call(a)=="[object Number]"};b.isNaN=function(a){return a!==a};b.isBoolean=function(a){return a===true||a===false||l.call(a)=="[object Boolean]"};
b.isDate=function(a){return l.call(a)=="[object Date]"};b.isRegExp=function(a){return l.call(a)=="[object RegExp]"};b.isNull=function(a){return a===null};b.isUndefined=function(a){return a===void 0};b.noConflict=function(){s._=G;return this};b.identity=function(a){return a};b.times=function(a,b,d){for(var e=0;e<a;e++)b.call(d,e)};b.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")};
b.mixin=function(a){j(b.functions(a),function(c){J(c,b[c]=a[c])})};var K=0;b.uniqueId=function(a){var b=K++;return a?a+b:b};b.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var u=/.^/;b.template=function(a,c){var d=b.templateSettings,d="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(d.escape||u,function(a,b){return"',_.escape("+b.replace(/\\'/g,"'")+"),'"}).replace(d.interpolate||
u,function(a,b){return"',"+b.replace(/\\'/g,"'")+",'"}).replace(d.evaluate||u,function(a,b){return"');"+b.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ").replace(/\\\\/g,"\\")+";__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');",e=new Function("obj","_",d);return c?e(c,b):function(a){return e.call(this,a,b)}};b.chain=function(a){return b(a).chain()};var n=function(a){this._wrapped=a};b.prototype=n.prototype;var v=function(a,c){return c?b(a).chain():
a},J=function(a,c){n.prototype[a]=function(){var a=i.call(arguments);H.call(a,this._wrapped);return v(c.apply(b,a),this._chain)}};b.mixin(b);j("pop,push,reverse,shift,sort,splice,unshift".split(","),function(a){var b=k[a];n.prototype[a]=function(){var d=this._wrapped;b.apply(d,arguments);var e=d.length;(a=="shift"||a=="splice")&&e===0&&delete d[0];return v(d,this._chain)}});j(["concat","join","slice"],function(a){var b=k[a];n.prototype[a]=function(){return v(b.apply(this._wrapped,arguments),this._chain)}});
n.prototype.chain=function(){this._chain=true;return this};n.prototype.value=function(){return this._wrapped}}).call(this);

});

require.define("/lib/flywheel.js", function (require, module, exports, __dirname, __filename) {
    void function(root){
    
    // shim for cross-browser requestAnimationFrame, 
    // with setTimeout for a backup for older browsers
    var request_animation_frame = function () {
        return  window.requestAnimationFrame       
            ||  window.webkitRequestAnimationFrame 
            ||  window.mozRequestAnimationFrame
            ||  window.oRequestAnimationFrame
            ||  window.msRequestAnimationFrame
            ||  function (callback) {
                setTimeout(function () {
                    callback(+new Date())
                }, 1000 / 60)
            } 
    }()
    

    //// controller : Object
    // 
    // gets returned from flywheel to let the
    // user manipulate the looping
    var controller = {
        
        // --- Attributes --- // 
        callback:           undefined,
        element:            undefined,
        framerate_cap:      33,
        default_framerate:  16,
        
        _last_timestamp:    undefined,
        _running:           false,
        

        // --- Methods --- //
        start: function(){
            this._running = true
            this._next_frame(undefined, this.default_framerate) 
            return this
        },

        stop: function(){
            this._running = false
            return this
        },
        
        toggle: function(){
            this._running ? this.stop()
            : /*otherwise*/ this.start()
            return this
        },

        step: function(time_delta){
            this._next_frame(undefined, time_delta || this.default_framerate)
            return this
        },

        //// (timestamp : Number || undefined [, time_delta : Number]) -> undefined
        //
        // This is the function that is looped over. `time_delta` lets methods
        // such as `step` pass a time_delta directly in.
        _next_frame: function(timestamp, time_delta){
            
            // set up next frame
            if ( this._running ) 
                request_animation_frame(this._next_frame.bind(this), this.element)
            
            // calculate time_delta from timestamp if a time_delta was not passed in
            if ( typeof time_delta === "undefined" ) {
                time_delta = timestamp - this._last_timestamp
                if ( time_delta > this.framerate_cap ) time_delta = this.framerate_cap
                this._last_timestamp = timestamp
            }  
            
            // if time_delta is 0 or NaN (etc), we may not want to call callback
            if ( time_delta ) this.callback(time_delta)
            
        }
    }


    //// (callback : Function[, element : HTMLElement ]) -> controller : Object
    //
    //  Public API for flywheel.  Just a wrapper around
    //  an instance of the controller object, really.
    function flywheel(callback, element){
        
        var ret_controller = Object.create(controller)
        
        ret_controller.callback = callback
        ret_controller.element  = element
        
        return ret_controller 
    }

    //// export using commonjs or into the global scope
    if ( typeof module !== "undefined" && module["exports"] )
        module["exports"] = flywheel
    else
        root["flywheel"] = flywheel

}(this)

});

require.define("/world.coffee", function (require, module, exports, __dirname, __filename) {
    (function() {
  var World_, World_Meta, funcs, pure, _;

  _ = require('./lib/underscore');

  pure = module.exports;

  pure.World = function(settings) {
    return _.extend(World_(), settings);
  };

  World_ = function() {
    return {
      levels: [],
      names: {},
      current: 0,
      _meta: World_Meta(),
      _funcs: funcs
    };
  };

  World_Meta = function() {
    return {
      type: 'World'
    };
  };

  funcs = {};

  funcs.step = function(world, context, timedelta) {
    return console.log('yes');
  };

  funcs.add = function(world, level) {
    return world.levels.push(level);
  };

}).call(this);

});

require.define("/level.coffee", function (require, module, exports, __dirname, __filename) {
    (function() {
  var Level_, Level_Meta, funcs, pure, _;

  _ = require('./lib/underscore');

  pure = module.exports;

  pure.Level = function(settings) {
    return _.extend(Level_(), settings);
  };

  Level_ = function() {
    return {
      actors: [],
      curr_id: 0,
      _meta: Level_Meta(),
      _funcs: funcs
    };
  };

  Level_Meta = function() {
    return {
      type: 'Level'
    };
  };

  funcs = {};

  funcs.step = function(level, context, timedelta) {
    return _.each(level.actors, function(actor) {
      return actor._funcs.step(actor, context, timedelta);
    });
  };

  funcs.add = function(level, actor) {
    return level.actors.push(actor);
  };

}).call(this);

});

require.define("/actor.coffee", function (require, module, exports, __dirname, __filename) {
    (function() {
  var Actor_, Actor_Meta, funcs, pure, _;

  _ = require('./lib/underscore');

  pure = module.exports;

  pure.Actor = function(settings) {
    return _.extend(Actor_(), settings);
  };

  Actor_ = function() {
    return {
      x: 0,
      y: 0,
      alpha: 0,
      shape: 0,
      _meta: Actor_Meta(),
      _funcs: funcs
    };
  };

  Actor_Meta = function() {
    return {
      type: 'Actor',
      id: 0,
      dead: false
    };
  };

  funcs = {};

  funcs.step = function(actor, context, timedelta) {
    return console.log(actor._meta.id);
  };

}).call(this);

});

require.define("/pure.coffee", function (require, module, exports, __dirname, __filename) {
    (function() {
  var flywheel, pure, _;

  _ = require('./lib/underscore');

  flywheel = require('./lib/flywheel');

  pure = module.exports;

  _.extend(pure, require('./world.coffee'));

  _.extend(pure, require('./level.coffee'));

  _.extend(pure, require('./actor.coffee'));

  pure.factory = function(constructor, old_settings) {
    return function(new_settings) {
      var ret;
      ret = _.extend(constructor(), old_settings);
      return _.extend(ret, new_settings);
    };
  };

  pure.run = function(pure_obj, context) {
    var cb;
    cb = function(time_delta) {
      return pure_obj._funcs.step(pure_obj, context, time_delta);
    };
    return flywheel(cb).start();
  };

  pure.add = function(a, b) {
    return a._funcs.add(a, b);
  };

}).call(this);

});
require("/pure.coffee");
