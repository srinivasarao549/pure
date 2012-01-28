# imports
_       = require './lib/underscore'

# exports
pure    = module.exports


pure.World = ( settings ) -> 
    _.extend(World_(), settings)


# constructor
World_ = ->
    levels  : []
    names   : {}
    current : 0
    _meta   : World_Meta()
    _funcs  : funcs

World_Meta = ->
    type    : 'World'

# type-specific functions
funcs = {}

funcs.step = ( world, context, timedelta ) ->
    console.log 'yes'

funcs.add = ( world, level ) ->
    world.levels.push level
