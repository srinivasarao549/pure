
# namespace
render = module.exports._ = {}

# private API
render.clear_context = ( context ) -> 
    can = context.canvas
    context.clearRect(0, 0, can.width, can.width)

# todo - make rotate anchor around parent
render.actor = ( actor, context ) ->
    if actor.alpha <= 0 or not actor.color? then return    
    offset = actor._meta.offset

    context.save()
    context.globalAlpha = actor.alpha
    context.fillStyle = actor.color
    context.translate(offset.x, offset.y)
    context.rotate(offset.rotation)
    context.translate(actor.x, actor.y)
    context.rotate(actor.rotation)
    if actor.shape
        draw_shape(actor, context)
    context.restore()

draw_shape = ( actor, context ) ->
    if actor.shape == 'rect'
        context.fillRect(0, 0, actor.width, actor.height)

