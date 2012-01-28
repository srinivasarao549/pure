# imports
_       = require './lib/underscore'

# exports
pure    = module.exports

pure.Level = ( settings ) -> 
    _.extend(Level_(), settings)

# constructor
Level_ = ->
    actors  : []
    watchers: []
    curr_id : 0
    _meta   : Level_Meta()
    _funcs  : funcs

Level_Meta = ->
    type    : 'Level'


# typeclass
funcs = {}

funcs.step = ( level, context, timedelta ) ->
    level.actors.sort (a, b) ->
        a.z - b.z
    _.each(level.actors, ( actor ) ->
        actor._funcs.step(actor, context, timedelta)
    )

funcs.render = ( level, context ) ->
    _.each(level.actors, ( actor ) ->
        actor._funcs.render(actor, context)
    )

funcs.add = ( level, actor ) -> 
    level.actors.push actor
