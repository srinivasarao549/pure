# imports
flywheel    = require './lib/flywheel'
_           = require './lib/underscore'
animate     = require('./animate.coffee')._
render      = require('./render.coffee')._
actor_      = require('./actor.coffee')._

# namespaces
pure = module.exports

# main loop
pure.run = ( world, context ) ->
    func = ( time_delta ) -> step_world(world, context, time_delta)
    flywheel(func).start()

step_world = ( world, context, time_delta ) ->
    render.clear_context context
    func = ( actor ) -> step_actor(actor, context, time_delta)
    walk_apply(world, func)

step_actor = ( actor, context, time_delta ) ->
    if actor.update? then actor.update(time_delta)

    actor_.set_offset(actor)
    animate.actor(actor, time_delta)
    render.actor(actor, context)

walk_apply = ( actor, func ) ->
    func actor
    
    children = actor._meta.children
    if children.length 
        _.map( children, ( actor )-> walk_apply(actor, func))

