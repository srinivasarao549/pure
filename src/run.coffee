# imports
_           = require './lib/underscore'
flywheel    = require './lib/flywheel'

render      = require './private/render'

# exports
pure = module.exports


# run :: Actor, HTMLCanvas -> Flywheel
pure.run = ( actor, canvas ) -> 
    ctx = canvas.getContext '2d'
    cb  = ( timedelta ) ->
        step(actor, ctx, timedelta)
    flywheel(cb).start()

# step :: Actor, CanvasRenderingContext2d, number -> Actor
step = ( actor, context, timedelta ) ->
    cb = ( a ) ->
        render.actor(a, context)
        a.update?(timedelta)
    walk_apply(actor, cb)

# walk :: Actor, function -> Actor 
walk_apply = ( actor, func ) ->
    func actor
    children = actor._meta.children
    if not _.isEmpty children
        _.each(children, ( c ) -> walk_apply(c, func))
    actor
