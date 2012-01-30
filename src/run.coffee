# imports
_           = require './lib/underscore'
flywheel    = require './lib/flywheel'

render      = require './private/render'

# exports
pure = module.exports


# run :: Actor, HTMLCanvas -> Flywheel
pure.run = ( actor, canvas ) -> 
    ctx = canvas.getContext '2d'
    cb  = ( time_delta ) -> 
        step


# step :: Actor, CanvasRenderingContext2d, number -> Actor
step = ( actor, canvas ) ->


# walk :: Actor, function -> Actor 
walk_apply = ( actor, func ) ->
    
