# imports
_       = require './lib/underscore'

# exports
pure    = module.exports

pure.Actor = ( settings ) ->
    _.extend(Actor_(), settings)

# constructors
Actor_ = ->
    x       : 0
    y       : 0
    alpha   : 0
    shape   : 0
    _meta   : Actor_Meta()
    _funcs  : funcs

Actor_Meta = ->
    type    : 'Actor'
    id      : 0
    dead    : false

# typeclass
funcs = {}

funcs.step = ( actor, context, timedelta ) -> 
    console.log actor._meta.id
