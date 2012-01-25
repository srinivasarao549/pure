#imports
_    = require './lib/underscore'

# namespace
pure = module.exports

# Constructor
Animation = ->
    start   : 0
    end     : 0
    from    : null
    to      : null
    easing  : 'linear'
    time    : 0

pure.animate = ( actor, settings ) ->
    actor._meta.anim_q.push _.extend(Animation(), settings)
