# imports
_           = require './lib/underscore'
flywheel    = require './lib/flywheel'

render      = require './private/render'
events_     = require './private/events'

# exports
pure = module.exports


# run :: Actor, HTMLCanvas -> Flywheel
pure.run = ( actor, canvas ) -> 
    ctx     = canvas.getContext '2d'
    events  = events_.bind canvas
    flywheel( ( timedelta ) -> 
        step(actor, ctx, timedelta, events) 
    ).start()



# STEP ALL 
# step :: Actor, Events, CanvasRenderingContext2d, number -> Actor
step = ( actor, context, timedelta, events) ->
    events = events()
    render.clear context
    walk_apply(actor, ( a ) -> step_actor(a, context, timedelta, events))


# walk :: Actor, function -> Actor 
walk_apply = ( actor, func ) ->
    func actor
    children = actor._meta.children
    if not _.isEmpty children
        _.each(children, ( c ) -> walk_apply(c, func))
    actor


# SINGLE ACTOR STEPS
# step_actor :: Actor, CanvasRenderingContext2d, number -> Actor
step_actor = ( a, context, timedelta, events ) ->
    update_abs_coords a
    a.update? timedelta 
    render.actor(a, context) 

#  update_abs_coords :: Actor -> Actor
update_abs_coords = ( a ) ->
    p = a._meta.parent
    a._meta.true_x = a.x
    a._meta.true_y = a.y
    if p?
        a._meta.true_x += p._meta.true_x
        a._meta.true_y += p._meta.true_y
