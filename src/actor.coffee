#imports
_    = require './lib/underscore'

# namespace
pure = module.exports
private = pure._actor = {}

# Constructors
Actor = ->
    draw    : null      # draw 
    alpha   : 1         
    color   : '#000'
    x       : 0         # position
    y       : 0
    height  : 10
    width   : 10
    update  : null      # events
    click   : null
    collide : null
    _meta   : Meta()    # metadata

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
    alpha   : 1
    add     : ['x', 'y']
    multiply: ['alpha']

# public API

# create :: {} -> Actor
pure.create = ( settings ) ->
    _.extend(Actor(), settings)

# factory :: {} -> ( {} -> Actor )
pure.factory = ( orig_settings ) ->
    ( settings ) -> 
        actor = Actor()
        _.extend(actor, orig_settings)
        _.extend(actor, settings)

# add :: Actor, Actor -> Actor
pure.add = add = ( parent, child ) ->
    if _.isArray(child)
        return _.map(child, (child) -> add(parent, child))
    parent._meta.children.push child
    child._meta.parent = parent
    parent

# kill :: Actor -> Actor
pure.kill = ( actor ) ->
    actor._meta.dead = true
    actor


# private API

# walk_apply :: Actor, function -> Actor
private.walk_apply = walk_apply = ( actor, func ) ->
    func actor
    
    children = actor._meta.children
    if children.length 
        _.map( children, ( actor )-> walk_apply(actor, func))

    actor

# calc_offset :: Actor -> Actor
private.calc_offset = ( actor ) ->
    offset = actor._meta.offset
    parent = actor._meta.parent

    if parent?
        parent_o = parent?._meta.offset
        _.each(offset.multiply, (key) ->
            offset[key] = parent[key] * parent_o[key]
        )
        _.each(offset.add, (key) ->
            offset[key] = parent[key] + parent_o[key]
        )
    actor
