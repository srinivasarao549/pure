describe('render private API', function(){

describe('render_.actor', function(){
    var context = null
      , render_  = pure._render

    beforeEach(function(){
        var canvas = document.createElement('canvas')
        canvas.width = 100
        canvas.height = 100

        context = canvas.getContext('2d')
    })

    it('must *not* render if actor.draw is null', function(){
        var actor   = pure.create({draw: null, alpha: 0, color: null})
        
        render_.actor(actor, context)
        var results = context.getImageData(0, 0, 100, 100).data
        expect(_.filter(results, function(pix){ return pix }).length).to.be(0)
    })
    
    it('must *not* render if actor.color is null', function(){
        var actor   = pure.create({draw: 'rect', alpha: 0, color: null})

        render_.actor(actor, context)
        var results = context.getImageData(0, 0, 100, 100).data
        expect(_.filter(results, function(pix){ return pix }).length).to.be(0)
    })

    it('must *not* render if actor.alpha is 0 or below', function(){
        var actor   = pure.create({draw: 'rect', alpha: 0, color: '#fff'})
        
        render_.actor(actor, context)
        var results = context.getImageData(0, 0, 100, 100).data
        expect(_.filter(results, function(pix){ return pix }).length).to.be(0)

        actor.alpha = -0.1
        var results = context.getImageData(0, 0, 100, 100).data
        expect(_.filter(results, function(pix){ return pix }).length).to.be(0)

    })

    it('must render if actor.alpha is > 0 and actor.color and actor.draw are valid', function(){
        var actor   = pure.create({draw: 'rect', alpha: 1, color: '#fff'})

        render_.actor(actor, context)
        var results = context.getImageData(0, 0, 100, 100).data
        expect(_.filter(results, function(pix){ return pix }).length).to.be(400)
    })

    it('must render w/ alpha', function(){
        var actor   = pure.create({draw: 'rect', alpha: 0.5, color: '#fff'})
        
        render_.actor(actor, context)
        expect(context.globalAlpha).to.be(0.5)
    })
})

describe('render_.clear_context', function(){
    
    var render_ = pure._render

    it('must clear context', function(){
        var canvas = document.createElement('canvas')
          , context = canvas.getContext('2d')
          , results 

        canvas.width = 100
        canvas.height = 100
        
        context.fillStyle = '#fff'
        context.fillRect(0, 0, 10, 10)
        results = context.getImageData(0, 0, 100, 100).data
        expect(_.filter(results, function(pix){ return pix }).length).to.be(400)

        render_.clear_context(context)
        results = context.getImageData(0, 0, 100, 100).data
        expect(_.filter(results, function(pix){ return pix }).length).to.be(0)

    })

})

})

