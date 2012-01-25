#imports
_    = require './lib/underscore'

# namespace
pure = module.exports

# Constructors
Actor = ->
    _meta   : Meta()
    x       : 0
    y       : 0
    height  : 10
    width   : 10
    rotation: 0
    alpha   : 0
    color   : '#000'
    shape   : 'rect'

Meta = ->
    offset   : Offset()
    parent   : null
    children : []
    anim_q   : []
    paused   : false
    dead     : false
    time     : 0

Offset = ->
    x       : 0
    y       : 0
    rotation: 0

# World Manip
pure.create = ( settings ) ->
    _.extend(Actor(), settings)

pure.factory = ( orig_settings ) ->
    ( settings ) -> 
        actor = Actor()
        _.extend(actor, orig_settings)
        _.extend(actor, settings)

pure.add = add = ( parent, child ) ->
    if _.isArray(child)
        return _.map(child, (child) -> add(parent, child))
    parent._meta.children.push child
    child._meta.parent = parent
    parent

pure.kill = ( actor ) ->
    actor._meta.dead = true
    actor
