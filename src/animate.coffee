# imports
_    = require './lib/underscore'

# namespaces
pure = module.exports 
private = pure._animation

# constructor
Animation = ->
    for     : 0
    by      : null
    easing  : 'linear'
    time    : 0


# public API

# animate :: Actor, {} -> Actor
pure.animate = animate = ( actor, settings ) ->
    if _.isArray settings 
        return _.map(settings, ( settings ) -> animate(actor, settings))
    if _.isArray actor
        return _.map(actor, ( actor ) -> animate(actor, settings))
    actor._meta.anim_q.push _.extend(Animation(), settings)
    actor
