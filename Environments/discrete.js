import {Env} from './core.js'
import {sampleFromDistribution} from '../Dependencies/Utils'
export class DiscreteEnv extends Env{
    /**
     * 
     * @param {number} nS number of state
     * @param {number} nA number of actions
     * @param {array} P array of arrays where P[s][a] = [{probability, nextState, reward, isDone}, ...]
     * @param {array} initStateDist probability distribution of states used for initialization
     */
    constructor(nS,nA,P, initStateDist){
        super()
        this.P = P;
        this.initStateDist = initStateDist;
        this.lastAction = null;
        this.nS = nS;
        this.nA = nA;
    }
    reset(){
        // sampling random state
        this.s = sampleFromDistribution(this.initStateDist);
        this.lastAction = null;
        return {id: this.s};
    }
    step(action){
        let transitionStates = this.P[this.s][action];
        if (!transitionStates.length)throw new Error("P[s][a] must be an array of atleast length 1 but given", transtionStates);
        const transitionProbs = transitionStates.map((a)=>a.probability);
        const sampleAction = sampleFromDistribution(transitionProbs);
        let {nextState, reward, isDone, probability} = transitionStates[sampleAction];

        this.s = nextState.id;
        this.lastAction = sampleAction;

        return {nextState, reward, isDone, probability};
    }
}