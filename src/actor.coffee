#imports
_    = require './lib/underscore'

# namespace
pure = module.exports
actor = pure._ = {}

# Constructors
Actor = ->
    _meta   : Meta()
    x       : 0
    y       : 0
    height  : 10
    width   : 10
    rotation: 0
    scale   : 1
    alpha   : 1
    color   : null
    shape   : 'rect'
    update  : null

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
    alpha   : 1
    scale   : 1
    add     : ['rotation', 'x', 'y']
    multiply: ['alpha', 'scale']

# public API
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

# private API
actor.set_offset = ( actor ) ->
    offset = actor._meta.offset
    parent = actor._meta.parent
    p_offset = parent?._meta.offset
    
    if not parent? 
        return
    else 
        _.each(offset.add, ( key ) ->
            offset[key] = parent[key] + p_offset[key]
        )
        
        _.each(offset.multiply, ( key ) ->
            offset[key] = parent[key] * p_offset[key]
        )
