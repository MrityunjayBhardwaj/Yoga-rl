import * as envRegister from '../Environments/envRegister';

function createListOfEnvs(){
    const list = [];
    for(let envName in envRegister){
        const cEnv = new envRegister[envName];
        list.push(cEnv);
    }
    return list;
}

let envList = createListOfEnvs();

test('Check if all the envs have implemented a reset and a step method.', ()=>{
    function takeRandomStepInAllEnvs(){
        for(let cEnv of envList){
            cEnv.reset();
            const nActions = cEnv.nA;
            const randomAction = Math.floor(Math.random()*nActions);
            cEnv.step(randomAction);
        }
    }

    expect(takeRandomStepInAllEnvs).not.toThrow(Error)
})

test('Check if all the envs\'s step method returns a step Object.', ()=>{
    for(let cEnv of envList){
        const nActions = cEnv.nA;
        const randomAction = Math.floor(Math.random()*nActions);
        const defaultStepStruct = {
            nextState: expect.any(Object), 
            reward: expect.any(Number), 
            isDone: expect.any(Boolean)
        }
        const cStep = cEnv.step(randomAction);
        expect(cStep).toMatchObject(defaultStepStruct);
    }
})


test('Perform random rollouts in all Envs for 100 episodes.', ()=>{
    const nEpisodes = 100;
    const maxStepPerEpisode = 100;
    let episodeCount = 0;
    for(let cEnv of envList){
        while(episodeCount < nEpisodes){
            cEnv.reset();
            let step = 0;
            while(step < maxStepPerEpisode){
                const nActions = cEnv.nA;
                const randomAction = Math.floor(Math.random()*nActions);
                const {isDone} = cEnv.step(randomAction);
                if(isDone)break;
                step++;
            }
            episodeCount++;
        }
    }
    expect(episodeCount).toBe(nEpisodes)
})