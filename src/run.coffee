# imports
flywheel    = require './lib/flywheel'
_           = require './lib/underscore'

# namespaces
pure = module.exports
step = {}
render = {}
animate = {}
easing = {}

# main loop
pure.run = ( world, context ) ->
    func = ( time_delta ) ->
        step.process(world, context, time_delta)
    flywheel(func).start()


step.process = ( world, context, time_delta ) ->
    render.clear(context)
    func = ( actor ) -> step.actor(actor, context, time_delta)
    step.walk_apply(world, func)

step.walk_apply = ( actor, func ) ->
    func actor
    
    children = actor._meta.children
    if children.length 
        _.map( children, ( actor )->
            step.walk_apply(actor, func))

step.actor = ( actor, context, time_delta ) ->
    meta = actor._meta
    parent = meta?.parent
    p_offset = parent?._meta.offset

    if parent
        meta.offset.x = parent.x + p_offset.x ? parent.x
        meta.offset.y = parent.y + p_offset.y ? parent.y
        meta.offset.rotation = parent.rotation + p_offset.rotation ? parent.rotation

        if meta.dead then _.remove(parent._meta.children, actor)
    
    # Animate
    if meta.anim_q.length
        animate.actor(actor, time_delta)

    # render
    render.actor(actor, context)


## Drawing
render.clear = ( context ) -> 
    can = context.canvas
    context.clearRect(0, 0, can.width, can.width)

render.actor = ( actor, context ) ->
    offset = actor._meta.offset

    context.save()
    context.globalAlpha = actor.alpha
    context.fillStyle = actor.color
    context.translate(actor.x + offset.x, actor.y + offset.y)
    context.rotate(actor.rotation + offset.rotation)
    if actor.shape
        render.shape(actor, context)
    if actor.image
        render.image(actor, context)
    context.restore()

render.shape = ( actor, context ) ->
    if actor.shape == 'rect'
        context.fillRect(0, 0, actor.width, actor.height)
    if actor.shape == 'circle'
        context.fillArc()

render.iamge = ( actor, context ) ->
# Animation processing

animate.actor = ( actor, time_delta ) ->
    anim_q = actor._meta.anim_q
    anim = anim_q[0]
    
    anim.time += time_delta
    progress = anim.time / (anim.end - anim.start)
    
    if progress < 0 then return
    else if progress > 1
        actor._meta.anim_q = _.tail anim_q
        _.each(anim.from, (val, key) ->
            actor[key] = anim.to[key]
        )
        return
    
    _.each(anim.from, (val, key)->
        actor[key] = easing[anim.easing]( progress, anim.from[key], anim.to[key])
    )


easing.linear = ( progress, from, to) ->
    return from + (( to - from ) * progress) 
