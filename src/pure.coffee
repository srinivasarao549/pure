# imports
_    = require './lib/underscore'

# namespace
pure = module.exports

# import modules
_.extend(pure, require './run.coffee')
_.extend(pure, require './actor.coffee')
_.extend(pure, require './animate.coffee')
_.extend(pure, require './render.coffee')
