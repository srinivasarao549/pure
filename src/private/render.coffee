# imports
_       = require '../lib/underscore'

# exports
render = module.exports

# actor :: Actor, CanvasRenderingContext2D -> Actor
render.actor = ( actor, context ) -> 
    context.globalAlpha = actor.alpha
    if actor.color? 
        context.global
        context.strokeRect(actor.x, actor.y, actor.width, actor.height)
    if actor.image?
        context.drawImage(actor.image, actor.x, actor.y)
