# imports
_       = require '../lib/underscore'
bean    = require '../lib/bean'

# exports
events = module.exports

# constructor
Events = -> 
    touchstart  : null
    touchend    : null
    touchmove   : null
    touchcancel : null
    touchleave  : null

# bind :: canvas -> ( -> Events ) 
events.bind = ( canvas ) ->
    ev = Events()
    bean.add(canvas, 'touchstart mousedown', ( e ) -> ev.touchstart = coord_on_el(canvas, e))
    bean.add(canvas, 'touchmove', ( e ) -> ev.touchmove = coord_on_el(canvas, e))
    bean.add(canvas, 'touchend mouseup', ( e ) -> ev.touchen = coord_on_el(canvas, e))
    () -> 
        e = ev
        ev = Events()
        e
    

coord_on_el = ( canvas, e ) ->
    page_x  =  e.pageX ? e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
    page_y  = e.pageY ? e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    e.x     = page_x - canvas.offsetLeft
    e.y     = page_y - canvas.offsetTop
    e
