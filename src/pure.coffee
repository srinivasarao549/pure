# imports
_    = require './lib/underscore'

# namespace
pure = module.exports

_.extend(pure, require './run.coffee')
_.extend(pure, require './actor.coffee')
_.extend(pure, require './animation.coffee')
