# imports
_    = require './lib/underscore'

# namespace
pure = module.exports

_.extend(pure, require './run.coffee')
_.extend(pure, require './actor.coffee')
_.extend(pure, require './animate.coffee')

# delete all non-public API
delete pure._
