# imports
_       = require './lib/underscore'

# exports
pure    = module.exports

# constructors
Actor = ->
    x       : 0         # position/draw
    y       : 0
    width   : 100
    height  : 100
    alpha   : 1
    color   : '#000'
    image   : null
    touch   : null      # event handlers
    drag    : null
    keydown : null
    keyup   : null
    keypress: null
    update  : null
    _meta   : Meta()

Meta = -> 
    children: []
    paused  : false
    active  : true

# public

# create :: object -> Actor
pure.create = ( settings ) ->
    _.extend(Actor(), settings)

# factory :: object -> ( object -> Actor )
pure.factory = ( o_settings ) ->
    ( n_settings ) ->
        a = _.extend(Actor(), o_settings)
        _.extend(a, n_settings)

# add :: Actor, Actor || [Actor] -> Actor
pure.add = add = ( parent, child ) ->
    if _.isArray child 
        return _.each(child, (c) -> add(parent, c))
    parent._meta.children.push child
