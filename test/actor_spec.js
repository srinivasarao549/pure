describe('actor public API', function(){


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


describe('pure.add', function(){

    it('must add the second param as a the _meta.child of the first param, and the _meta.parent of the second param to the first param', function(){
    
        var actor1 = pure.create()
          , actor2 = pure.create()

        pure.add(actor1, actor2)

        expect(actor1._meta.children[0]).to.be(actor2)
        expect(actor2._meta.parent).to.be(actor1)
    })
})


describe('pure.kill', function(){

    it('must set the _meta.dead flag on the param', function(){
        var actor = pure.create()

        pure.kill(actor)

        expect(actor._meta.dead).to.be(true)
    })
})

})  // end public API

describe('actor private API', function(){

    
describe('actor_.walk_apply', function(){
    
    var actor_ = pure._actor

    it('must do a depth-first walk a tree of actors, and apply a function to each *before* calling the child', function(){
        var order = []
          , actor1 = pure.create({ num: 1 })
          , actor2 = pure.create({ num: 2 })
          , actor3 = pure.create({ num: 3 })
          , actor4 = pure.create({ num: 4 })
          , actor5 = pure.create({ num: 5 })
          , actor6 = pure.create({ num: 6 })

        pure.add(actor1, actor2)

        pure.add(actor2, actor3)
        pure.add(actor2, actor4)
    
        pure.add(actor4, actor5)
    
        pure.add(actor1, actor6)

        actor_.walk_apply(actor1, function(actor){
            order.push(actor.num)
        })

        expect(order).to.eql(order.slice().sort())
    })

})

})
