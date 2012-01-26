
# namespace
render = module.exports._ = {}

# private API
render.clear_context = ( context ) -> 
    can = context.canvas
    context.clearRect(0, 0, can.width, can.width)

render.actor = ( actor, context ) ->
    if actor.alpha <= 0 or not actor.color? then return    
    offset = actor._meta.offset

    context.save()
    set_alpha(context, actor, offset)
    set_rotate_translate(context, actor, offset)
    set_scale(context, actor, offset)
    
    context.fillStyle = actor.color
    if actor.shape
        draw_shape(actor, context)
    context.restore()

set_alpha = ( context, actor, offset ) ->
    alpha = actor.alpha * offset.alpha
    if alpha < 0 then alpha = 0
    context.globalAlpha = alpha

set_rotate_translate = ( context, actor, offset ) ->
    context.translate(offset.x, offset.y)
    context.rotate(offset.rotation)
    context.translate(actor.x, actor.y)
    context.rotate(actor.rotation)

set_scale = ( context, actor, offset ) ->
    scale = actor.scale * offset.scale
    context.scale(scale, scale)

draw_shape = ( actor, context ) ->
    if actor.shape == 'rect'
        context.fillRect(0, 0, actor.width, actor.height)

