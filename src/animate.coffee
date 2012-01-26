# imports
_    = require './lib/underscore'

# namespaces
pure = module.exports 
animate = pure._ = {}

# constructor
Animation = ->
    _from   : null
    for     : 0
    by      : null
    easing  : 'linear'
    time    : 0


# public API
pure.animate = ( actor, settings ) ->
    if _.isArray settings 
        return _.map(settings, ( settings ) -> pure.animate(actor, settings))
    if _.isArray actor
        return _.map(actor, ( actor ) -> pure.animate(actor, settings))
    get_q(actor).push _.extend(Animation(), settings)


# private API
easing = 
    linear: ( from, by_, progress ) ->
        from + (progress * by_ )


animate.actor = ( actor, time_delta ) ->
    q = get_q actor
    if _.isEmpty q then return
    else step_anim(actor, time_delta, q[0])
    

step_anim = ( actor, time_delta, anim ) -> 
    anim.time += time_delta
    progress = anim.time / anim.for
    if not anim.from? 
        setup_from(actor, anim)
    
    if progress > 1
        next_anim actor
    else 
        set_anim(actor, anim, progress)


setup_from = ( actor, anim ) -> 
    anim.from = {}
    _.each(anim.by, (val, key) -> 
        anim.from[key] = actor[key]
    )

set_anim = (actor, anim, progress ) ->
    _.each( anim.by, (val, key) -> 
        actor[key] = easing[anim.easing](anim.from[key], anim.by[key], progress)
    )

next_anim = ( actor ) ->
    q = get_q actor
    anim = q[0]
    _.each(anim.by, (val, key) ->
        actor[key] = anim.from[key] + val 
    )
    set_q(actor, _.tail q)

get_q = ( actor ) ->
    actor._meta.anim_q

set_q = ( actor, q ) ->
    actor._meta.anim_q = q
