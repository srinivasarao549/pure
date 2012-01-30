# imports
_           = require './lib/underscore'
flywheel    = require './lib/flywheel'

render      = require './private/render'
events_     = require './private/events'

# exports
pure = module.exports


# run :: Actor, HTMLCanvas -> Flywheel
pure.run = ( actor, canvas ) -> 
    # setup 
    ctx     = canvas.getContext '2d'
    events  = events_.bind canvas
    # callback for each step
    cb      = ( timedelta ) ->
        step(actor, events, ctx, timedelta)
    flywheel(cb).start()

# step :: Actor, Events, CanvasRenderingContext2d, number -> Actor
step = ( actor, events, context, timedelta) ->
    render.clear context
    walk_apply(actor, ( a ) -> step_actor(a, context, timedelta))


# walk :: Actor, function -> Actor 
walk_apply = ( actor, func ) ->
    func actor
    children = actor._meta.children
    if not _.isEmpty children
        _.each(children, ( c ) -> walk_apply(c, func))
    actor

# step_actor :: Actor, CanvasRenderingContext2d, number -> Actor
step_actor = ( actor, context, timedelta ) ->
    update_abs_coords a                  
    a.update?(timedelta) 
    render.actor(a, context) 

# true_pos :: Actor -> Actor
update_abs_coords = ( a ) ->
    p = a._meta.parent
    a._meta.true_x = a.x
    a._meta.true_y = a.y
    if p?
        a._meta.true_x += p._meta.true_x
        a._meta.true_y += p._meta.true_y
