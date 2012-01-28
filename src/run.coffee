# imports
flywheel    = require './lib/flywheel'
_           = require './lib/underscore'
render_     = require('./render.coffee')._render
actor_      = require('./actor.coffee')._actor

# namespaces
pure = module.exports


# main loop

# run :: Actor, CanvasRenderingContext2D -> Flywheel
pure.run = ( world, context ) ->
    func = ( time_delta ) -> step_world(world, context, time_delta)
    flywheel(func).start()


# helpers

# step_world :: Actor, CanvasRenderingContext2D, number -> Actor
step_world = ( world, context, time_delta ) ->
    render_.clear_context context
    func = ( actor ) -> step_actor(actor, context, time_delta)
    actor_.walk_apply(world, func)
    world

# step_actor :: Actor, CanvasRenderingContext2D, number -> Actor
step_actor = ( actor, context, time_delta ) ->
    if actor._meta.dead
        actor_.remove(actor)
        return
    actor.update?(time_delta)
    actor_.calc_offset(actor)
    render_.actor(actor, context)
    actor
