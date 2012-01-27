describe('animate public API', function(){

describe('pure.animate', function(){

    it('must push new animation to _meta.anim_q', function(){
        var actor = pure.create()
        
        expect(actor._meta.anim_q.length).to.be(0)

        pure.animate(actor)

        expect(actor._meta.anim_q.length).to.be(1)
    
    })

    it('must push new animation to multiple actors', function(){
        var actors = [pure.create(), pure.create(), pure.create()]

        actors.forEach(function(actor){
            expect(actor._meta.anim_q.length).to.be(0)
        })
        
        pure.animate(actors)

        actors.forEach(function(actor){
            expect(actor._meta.anim_q.length).to.be(1)
        })
    })

    it('must push multiple animations to muliple actors', function(){
        var actors = [pure.create(), pure.create(), pure.create()]
        
        actors.forEach(function(actor){
            expect(actor._meta.anim_q.length).to.be(0)
        })
        
        pure.animate(actors, [{}, {}, {}])

        actors.forEach(function(actor){
            expect(actor._meta.anim_q.length).to.be(3)
        })

    })

    it('must apply the settings object', function(){
        var actor = pure.create()
          , by    = {}
        pure.animate(actor, { by: by })

        expect(actor._meta.anim_q[0].by).to.be(by)
    })
    
})

})

/*
describe('private API', function(){
    
it('must progress an animation by easing', function(){
    var actor = pure.create()
    
    pure.animate(actor, { by: { x: 100 }, for: 1000 })

    pure._animate.step(actor, 100)

    expect(actor.x).to.be(10)
})

it('must implement the full by amount even if there\'s time overrun', function(){
    var actor = pure.create()

    pure.animate(actor, { by: { x: 100 }, for: 1000 })

    pure._animate.step(actor, 10000)

    expect(actor.x).to.be(100)
})

})

*/
