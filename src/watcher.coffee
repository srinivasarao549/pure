# imports
_       = require './lib/underscore'

# exports
pure = module.exports

# constructor
Watcher_ = ->
    watch_id    : []        # watched list
    watch_type  : []
    update      : null      # events
