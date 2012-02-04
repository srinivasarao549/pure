# imports
_       = require './lib/underscore'
util    = require './lib/util'

# exports
pure    = module.exports


# constructors
Actor = ->
    x           : 0         # position/draw
    y           : 0
    width       : 100
    height      : 100
    alpha       : 1
    lineWidth   : 1
    strokeStyle : null
    fillStyle   : null
    image       : null
    sprite      : null
    mousedown   : null      # event handlers
    update      : null
    _meta       : Meta()    # internal data

Meta = -> 
    parent  : null
    children: []
    anim_q  : []
    paused  : false
    active  : true
    true_x  : 0
    true_y  : 0


# create :: object, Actor || [Actor] -> Actor
pure.create = create = ( settings, children ) ->
    a = _.extend(Actor(), settings)
    if children? then add(a, children)
    a

# factory :: object -> ( object, Actor || [Actor] -> Actor )
pure.factory = ( o_settings ) -> 
    ( n_settings, children ) -> 
        a = create(o_settings, children)
        _.extend(a, n_settings)

# add :: Actor, Actor || [Actor] -> Actor
pure.add = add = ( parent, children ) ->
    children = util.arr_lift(children)
    _.each(children, (child) -> 
        parent._meta.children.push child
        child._meta.parent = parent
    )
    parent
