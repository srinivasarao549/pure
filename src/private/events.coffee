# imports
_       = require '../lib/underscore'
bean    = require '../lib/bean'

# exports
events = module.exports

# constructor
Events = -> 
    mousedown   : null
    mouseup     : null
    mousepressed: null

# bind :: canvas -> Events
events.bind = ( canvas ) ->
    events = Events()
    bind_mouse(canvas, events)

# bind_mouse :: canvas, Events -> Events
bind_mouse = ( canvas, events ) ->
    bean.add(canvas, 'mousedown', ( e ) -> events.mousedown = handle_mouse(canvas, e) )
    bean.add(canvas, 'mouseup', ( e ) -> events.mouseup = handle_mouse(canvas, e) )
    events

handle_mouse = ( canvas, e ) -> 
    coords = 
            x: e.pageX ? e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
            y: e.pageY ? e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    relative_coords(canvas, coords.x, coords.y)

relative_coords = ( canvas, x, y ) ->
    x: x - canvas.offsetLeft
    y: y - canvas.offsetTop
