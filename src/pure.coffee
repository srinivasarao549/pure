# imports
flywheel    = require "./lib/flywheel"
_           = require "./lib/underscore"

# namespace
pure = {}


# Constructors
Object = ->
    _meta: Meta()

Meta = ->
    parent   : null
    children : []
    anim_q   : []
    paused   : false
    dead     : false


# Game Loop
pure.run = ( world, canvas ) ->
    cb = ( time_delta ) ->
        inner_loop(world, canvas, time_delta)

    flywheel(cb).start()

inner_loop = ( world, canvas, time_delta ) ->
    #todo

# World Manip
pure.create = ->
    Object()

pure.add = ( parent, child ) ->
    parent._meta?.children.push child
    child._meta?.parent = parent
    parent

pure.remove  = ( object ) ->
    object._meta?.dead = true
    object


## Export 
module.exports = pure
