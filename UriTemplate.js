var MYAPP = MYAPP || {};

MYAPP.namespace = function(ns_string) {
    var parts = ns_string.split('.'),
        parent = MYAPP,
        i;
    if(parts[0] === "MYAPP") {
        parts = parts.slice(1);
    }
    for(i = 0; i < parts.length; ++i) {
        if(typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
}

MYAPP.namespace("MYAPP.UriTemplate.Parser");
//MYAPP.namespace("MYAPP.UriTemplate.Expression");

MYAPP.UriTemplate.Parser = function() {
    var _template = "";
    var _expressions = [];

    var _init = function(tp) {
       _template = tp; 
       _prepare(_template);
    };

    var _dump = function() {
        var str = _template + "\n\t";
        str += _expressions.join("\n\t");
        return str;
    };
    
    var _prepare = function(tmpl) {
        // TODO:validate as URI
        var expr = tmpl.match(/{[^}]+}/g);
        if(!expr) return;
        for(var i = 0; i < expr.length; ++i) {
            _expressions.push(expr[i]);
        }
    };
    
    // create concrete URI
    var _evaluate = function(params) {
        var concreteUri = _template;
        for(var i = 0; i < _expressions.length; ++i) {
            var target = _expressions[i];
            // expand expression and create URI
            // TODO:encode URI is here?
            var value = encodeURI(_evaluate_expr(target, params));
            // replace expression string with result value
            concreteUri = concreteUri.replace(target, value);
        }
        return concreteUri;
    };
    
    // evaluate expression by parameters
    var _evaluate_expr = function(expr, params) {
        // operator
        var op = expr.charAt(1);
        // get valiable name with modifier
        var valiables = /{[+;?/.]?(.*)}/.exec(expr);
        if(valiables == null) {
            return "";
        }
        // accept multiple values
        valiables = valiables[1].split(",");
        // evaluate each valiables
        var keyval = _evaluate_valiables(valiables, params);
        // process operation
        return operation(op, keyval);
    };

    var _evaluate_valiables = function(valiables, params) {
        var keys = [];
        var values = [];
        for(var i = 0; i < valiables.length; ++i) {
            // get valiable name
            var name = /([^+*:^]+).*/.exec(valiables[i]);
            if(name == null) {
                return "";
            }
            name = name[1];
            // get modifier
            var matche = /[^+*:^]+([+*:^].*)?/.exec(valiables[i]);
            if(matche == null) {
                return "";
            }
            // TODO:check default value

            var mod = matche[1] == null ? "" : matche[1];
            var val = params[name];

            // TODO:handle array and hash params

            keys.push(name);
            values.push(modify(mod, val));
        }
        return {key : keys, value : values};
    }

    // process modifier
    var modify = function(mod, value) {
        var c = mod.charAt(0);
        switch(c) {
        case '+':
            // TODO:
            return value;
        case '*':
            // TODO:
            return value;
        case ':':
            var pos = mod.substring(1);
            var ret;
            if(pos.charAt(0) === "-") {
                ret = value.slice(pos);
            } else {
                ret = value.slice(0, pos);
            } 
            return ret;
        case '^':
            var pos = mod.substring(1);
            var ret;
            if(pos.charAt(0) === "-") {
                ret = value.slice(0, pos);
            } else {
                ret = value.slice(pos);
            }
            return ret;
        default:
            return value;
        }
    }

    // process operator
    var operation = function(op, keyval) {
        switch(op) {
        case '+':
            return keyval.value.join(",")
        case ';':
            return keyval.value.join(";")
        case '?':
            var query = [];
            for(var i = 0; i < keyval.key.length; ++i) {
                query.push(keyval.key[i] + "=" + keyval.value[i]);
            }
            return "?" + query.join("&")
        case '/':
            var query = [];
            for(var i = 0; i < keyval.key.length; ++i) {
                query.push(keyval.key[i] + "=" + keyval.value[i]);
            }
            return "/" + query.join("/")
        case '.':
            // TODO:Label format (I don't understand)
            return keyval.join(".")
        default:
            return keyval.value.join(",")
        }
    }
    
    return {
        init : _init,
        dump : _dump,
        evaluate : _evaluate
    };
};

