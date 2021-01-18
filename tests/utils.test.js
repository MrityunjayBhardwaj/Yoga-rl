import * as utils from '../Dependencies/Utils'
import { sum, min, max } from 'lodash';
import { Env } from '../Environments/core';

test('testing argMax with Array of numbers of variable length', ()=>{

    const randomMaxLength = 100;
    const randomRange = {min: -1000, max: 1000};
    const arrLength = Math.random()*randomMaxLength;


    const randomNumbersArray = [];
    for(let i=0;i<arrLength;i++){
        const minMaxDist = randomRange.max - randomRange.min;
        const randomNumber = randomRange.min + Math.random()*minMaxDist;
        randomNumbersArray.push(randomNumber);
    }

    expect(()=>utils.argMax(randomNumbersArray)).not.toThrow(Error);
});

test('argMax should return the index of the largest value from array of numbers', ()=>{
    expect(utils.argMax([1, 3, 2])).toBe(1)
});

test('throw error if we didn\'t pass an array to argMax', ()=>{
    expect(()=>utils.argMax("a random string")).toThrow(Error);
});

test('index2Coords should return a array specifying the index of an element in a tensor(multi-dim array)', ()=>{

    const tensor = 
    [
      [
        [0.3,0.5,0.2],
        [0.1,0.1,0.8]
      ],
      [
        [0.9,0.05,0.05],
        [0.2,0.7,0.1]
      ]
    ];

    const index = 5; // lets say, we need to find the coords of '0.8' whose index is 5
    const tensorShape = [2, 2, 3];
    const tensorSize = 2*2*3;

    const coords = utils.index2Coords(index, tensorShape, tensorSize );
    expect(coords).toMatchObject([0, 1, 2]);
});


test('Check if sampleFromDistribution function samples index according to the input distribution(array)', ()=>{
    const dist = [0.4, 0.25, 0.35];

    const noOfTrials = 10000;
    const relativeFreq = [0, 0, 0];
    for(let i=0;i<noOfTrials;i++){
        const sampledIndex = utils.sampleFromDistribution(dist);
        relativeFreq[sampledIndex]++;
    }

    const normalizedRelFreq = relativeFreq.map(a => a/sum(relativeFreq))

    // check if relative frequency is closer to our distribution.

    const distAndRelFreqDiff  = dist.map((prob,index)=>{
        return Math.abs(normalizedRelFreq[index] - prob)
    })

    
    const totalDiff = sum(distAndRelFreqDiff);
    expect(totalDiff).toBeLessThan(0.1);
});

test('Check if sampleFromDistribution also works with unnormalized distributions and returns sample indexes(numbers)', ()=>{
    const unnormalizedDist = [100, 40, 120];

    function sampleFromUnnormalizedDist(){
        const noOfTrials = 1000;
        const samples = [];
        for(let i=0;i<noOfTrials;i++){
            const sampledIndex = utils.sampleFromDistribution(unnormalizedDist)
            samples.push(sampledIndex);
        }
        return samples;
    }

    const sampledIndexes = sampleFromUnnormalizedDist();

    // make sure the samples are of indexes.
    expect(max(sampledIndexes)).toBeLessThan(unnormalizedDist.length);
    expect(min(sampledIndexes)).toBe(0);
});

test('Check if DefaultDict supports key and value pairs of all types except a key of type function', ()=>{
   
    const dummyDefaultDict = new utils.DefaultDict();

    dummyDefaultDict.set(
        {a: 2, b: 7}, 
        2);
    dummyDefaultDict.set(
        3, 
        {x: 10, y: 100});
    dummyDefaultDict.set(
        [1, "random string", {v: 15, w: 25}], 
        "some random string...");

    // check if defaultDict throws an error when we use a function as a key.
    expect(
        ()=>{
            dummyDefaultDict.set(
                (a,b)=>{console.log(a,b)}, 
                {x: 10, y: 100});
        }
    ).toThrow(Error)

    // check if dummyDefaultDict has 3 key-value pairs.
    expect(dummyDefaultDict.size()).toBe(3)
});

test('Check if DefaultDict returns a specified default value when query with unknown key otherwise return a prespecified value', ()=>{
    const randomDefaultValue = {someRandomDefaultProperty: "random String.."};
    const dummyDefaultDict = new utils.DefaultDict(randomDefaultValue);

    dummyDefaultDict.set(
        {a: 2, b: 7}, 
        [1, 5]);
    
    expect(dummyDefaultDict.get({a: 2, b: 7})).toMatchObject([1, 5]);
    expect(dummyDefaultDict.get("random string which was not a prespecified key")).toMatchObject(randomDefaultValue);
});

test('DefaultDict\'s items method should return an array of all the key value pairs that we have prespecified.', ()=>{
    const dummyDefaultDict = new utils.DefaultDict();

    dummyDefaultDict.set(
        {a: 2, b: 7}, 
        2);
    dummyDefaultDict.set(
        3, 
        {x: 10, y: 100});
    dummyDefaultDict.set(
        [1, "random string", {v: 15, w: 25}], 
        "some random string...");
    
    const items = dummyDefaultDict.items();

    expect(items).toMatchObject([
        [{a: 2, b: 7}, 2],
        [3, {x: 10, y: 100}],
        [[1, "random string", {v: 15, w: 25}], "some random string..."]
    ])
});

test('Check if DefaultDict removes a specified key value pair through delete method', ()=>{
    const dummyDefaultDict = new utils.DefaultDict();

    dummyDefaultDict.set(
        {a: 2, b: 7}, 
        2);
    dummyDefaultDict.set(
        3, 
        {x: 10, y: 100});
    dummyDefaultDict.set(
        [1, "random string", {v: 15, w: 25}], 
        "some random string...");

    dummyDefaultDict.delete({a: 2, b: 7})

    expect(dummyDefaultDict.size()).toBe(2);
});

test('Check if DefaultDict\'s clear method removes all the key value pairs', ()=>{
    const dummyDefaultDict = new utils.DefaultDict();

    dummyDefaultDict.set(
        {a: 2, b: 7}, 
        2);
    dummyDefaultDict.set(
        3, 
        {x: 10, y: 100});
    dummyDefaultDict.set(
        [1, "random string", {v: 15, w: 25}], 
        "some random string...");

    dummyDefaultDict.clear();

    const items = dummyDefaultDict.items();
    expect(items).toMatchObject([]);
})

// env: [0, 100, 0,0,0,0,0 -100, 0]
test('Check if all policyFns in policyFnFactory returns a policy(array) for the specified state and qValues of our environment and agent', ()=>{

    // create dummy environment 
    class dummyEnv extends Env{
        _cState = 0;
        nA = 2; // -- or ++
        nS = 9;
        _rewardDist = [-1, +100,-1,-1,-1,-1,-1, -100,-1];
        _terminalStateID = 0;
        constructor(){
            super();
        }
        reset(){
            this._cState = 4; 
            return {id: this._cState};
        }
        step(action){

            if(action === 0){
                if (this._cState > 0)
                    this._cState--;
            }
            else{
                if (this._cState < 8)
                this._cState++;
            }

            const cReward = _rewardDist[this._cState];
            const isDone = this._cState === 0;

            return {nextState: {id: this._cState}, reward: cReward, isDone};

        }
    }

    const dummyQValues = new utils.DefaultDict([0,0]);
    const dummyEnvObj = new dummyEnv();

    // assumed it was calculated by some rl agent.
    dummyQValues.set({id: 0}, [0, 0]);
    dummyQValues.set({id: 1}, [104, 8]);
    dummyQValues.set({id: 2}, [110, 2]);
    dummyQValues.set({id: 3}, [100, 3]);
    dummyQValues.set({id: 4}, [97, 2]);
    dummyQValues.set({id: 5}, [99, 4]);
    dummyQValues.set({id: 6}, [100, 7]);
    dummyQValues.set({id: 7}, [120, 2]);
    dummyQValues.set({id: 8}, [95, 14]);

    // select some random state index
    const randomStateID = 3;
    const selectedRandomStateQValues = dummyQValues.get({id: randomStateID});

    // instantiate all the policyFns from our policyFnFactory.
    const randomPolicyFn = utils.policyFnFactory('random', dummyEnvObj);
    const greedyPolicyFn = utils.policyFnFactory('greedy', dummyEnvObj);
    const epsilonGreedyPolicyFn = utils.policyFnFactory('epsilonGreedy', dummyEnvObj, {epsilon: 0.3});

    // query all of the policyFn
    const randomPolicy = randomPolicyFn(randomStateID, dummyQValues);
    const greedyPolicy = greedyPolicyFn(randomStateID, dummyQValues);
    const epsilonGreedyPolicy = epsilonGreedyPolicyFn(randomStateID, dummyQValues);

    // check them:-
    expect(randomPolicy).toMatchObject([0.5, 0.5]);
    expect(greedyPolicy).toMatchObject([1.0, 0.0]);
    expect(epsilonGreedyPolicy).toMatchObject([0.3/2 + 0.7, 0.3/2]);

})