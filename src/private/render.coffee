# imports
_       = require '../lib/underscore'

# exports
render = module.exports

render.clear = ( context ) ->
    c = context.canvas
    context.clearRect(0, 0, c.width, c.height)

# actor :: Actor, CanvasRenderingContext2D -> Actor
render.actor = ( actor, context ) -> 
    t_pos = 
        x: actor._meta.true_x
        y: actor._meta.true_y
    context.globalAlpha = actor.alpha
    context.lineWidth = actor.lineWidth
    if actor.strokeStyle? 
        context.strokeStyle = actor.strokeStyle
        context.strokeRect(t_pos.x, t_pos.y, actor.width, actor.height)
    if actor.fillStyle?
        context.fillStyle = actor.fillStyle
        context.fillRect(t_pos.x, t_pos.y, actor.width, actor.height)
    if actor.image?
        context.drawImage(actor.image, t_pos.x, t_pos.y)
