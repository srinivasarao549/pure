# namespace
render = module.exports._render = {}

# private API

# clear_context :: HTMLCanvasContext -> HTMLCanvasContext
render.clear_context = ( context ) -> 
    can = context.canvas
    context.clearRect(0, 0, can.width, can.width)
    context

# actor :: Actor, HTMLCanvasContext -> Actor
render.actor = ( actor, context ) ->
    if actor.draw? and actor.color? and actor.alpha > 0
        offset = actor._meta.offset
        context.globalAlpha = actor.alpha * offset.alpha
        draw[actor.draw](actor, offset, context)
    actor
 
# helper
draw = 
    rect: ( actor, offset, context ) ->
        context.fillStyle = actor.color
        context.fillRect(actor.x + offset.x, actor.y + offset.y, actor.width, actor.height)
