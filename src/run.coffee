# imports
flywheel    = require './lib/flywheel'
_           = require './lib/underscore'
render_     = require('./render.coffee')._render
actor_      = require('./actor.coffee')._actor

# namespaces
pure = module.exports

# main loop

# run :: Actor, HTMLCanvasContext -> Flywheel
pure.run = ( world, context ) ->
    func = ( time_delta ) -> step_world(world, context, time_delta)
    flywheel(func).start()

# helpers

# step_world :: Actor, HTMLCanvasContext, number -> Actor
step_world = ( world, context, time_delta ) ->
    render_.clear_context context
    func = ( actor ) -> step_actor(actor, context, time_delta)
    actor_.walk_apply(world, func)
    world

# step_actor :: Actor, HTMLCanvasContext, number -> Actor
step_actor = ( actor, context, time_delta ) ->
    actor_.calc_offset(actor)
    render_.actor(actor, context)
    actor
