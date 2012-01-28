# imports
_           = require './lib/underscore'
flywheel    = require './lib/flywheel'


# exports
pure    = module.exports

_.extend(pure, require './world.coffee')
_.extend(pure, require './level.coffee')
_.extend(pure, require './actor.coffee')


# factory :: function, {} -> function
pure.factory = ( constructor, old_settings ) ->
    ( new_settings ) ->
        ret = _.extend(constructor(), old_settings)
        _.extend(ret, new_settings)


pure.run = ( pure_obj, canvas ) ->
    context = canvas.getContext('2d')
    cb      = ( time_delta ) ->
        pure_obj._funcs.step(pure_obj, context, time_delta)
        context.clearRect(0, 0, canvas.width, canvas.heigh:)
        pure_obj._funcs.render(pure_obj, context)
    flywheel(cb).start()

pure.add = ( a, b ) -> 
    a._funcs.add(a, b)
