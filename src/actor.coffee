# imports
_       = require './lib/underscore'

# exports
pure    = module.exports

pure.Actor = ( settings ) ->
    _.extend(Actor_(), settings)

# constructors
Actor_ = ->
    x       : 0         # position/draw
    y       : 0
    width   : 100
    height  : 100
    alpha   : 0 
    touch   : null      # event handlers
    drag    : null
    keydown : null
    keyup   : null
    keypress: null
    update  : null
    _meta   : Actor_Meta()  # internal data
    _funcs  : funcs

Actor_Meta = ->
    type    : 'Actor'
    id      : 0
    dead    : false

# typeclass
funcs = {}

funcs.step = ( actor, context, timedelta ) -> 
    actor.update?(timedelta)

funcs.render = ( actor, context ) ->
    context.fillRect(actor.x, actor.y, actor.width, actor.height)
