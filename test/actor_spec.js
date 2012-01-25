describe('pure.create', function(){
    
    it('must apply any changes passed in as a settings object', function(){
        
        var actor = pure.create({x: 3})

        expect(actor.x).to.be(3)
        expect(actor.x).to.not.be(pure.create().x)
    })
})

describe('pure.factory', function(){

    it('must return a function that creates fresh instance', function(){
        
        var Factory = pure.factory()
          , actor1  = Factory()
          , actor2  = Factory()

        expect(actor1).to.not.be(actor2)
    })

    it('must apply more recent settings *over* the older settings', function(){
    
        var Factory = pure.factory({ x: 1, y:  1})
          , actor   = Factory({ x: 2 })

        expect(actor.x).to.be(2)
        expect(actor.y).to.be(1)
    })
})


describe('add', function(){

    it('must add the second param as a the _meta.child of the first param, and the _meta.parent of the second param to the first param', function(){
    
        var actor1 = pure.create()
          , actor2 = pure.create()

        pure.add(actor1, actor2)

        expect(actor1._meta.children[0]).to.be(actor2)
        expect(actor2._meta.parent).to.be(actor1)
    })
})


describe('kill', function(){

    it('must set the _meta.dead flag on the param', function(){
        var actor = pure.create()

        pure.kill(actor)

        expect(actor._meta.dead).to.be(true)
    })
})
