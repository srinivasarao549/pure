# import
_       = require './underscore'

# export
util = module.exports

util.arr_lift = ( arr ) -> 
    if _.isArray arr
        return arr
    else 
        return [arr]
