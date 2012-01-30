# imports
_           = require './lib/underscore'
flywheel    = require './lib/flywheel'

# exports
pure = module.exports


# run :: Actor, HTMLCanvas -> Flywheel
pure.run = ( actor, canvas ) -> 
    ctx     = canvas.getContext '2d'

