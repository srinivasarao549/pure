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
    level = world.levels[world.current]
    level._funcs.step(level, context, timedelta)

funcs.render = ( world, context ) ->
    level = world.levels[world.current]
    level._funcs.render(level, context)

funcs.add = ( world, level ) ->
    world.levels.push level
