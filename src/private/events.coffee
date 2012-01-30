# imports
_       = require '../lib/underscore'
bean    = require '../lib/bean'

# exports
events = module.exports

# constructor
Events = -> 
    


# bind :: canvas -> Events
events.bind = ( canvas ) ->


coord_on_el = ( canvas, e ) ->
    page_x  =  e.pageX ? e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
    page_y  = e.pageY ? e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    e.x     = page_x - canvas.offsetLeft
    e.y     = page_y - canvas.offsetTop
    e
