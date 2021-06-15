import {Env} from './core.js'
import {sampleFromDistribution} from '../utils'

interface probObj {
    probability: number;
    nextState: {id: number};
    reward: number;
    isDone: boolean;
}

export abstract class DiscreteEnv extends Env{
    P: Array<Array<Array<probObj>>>;
    nS: number;
    nA: number;
    initStateDist: Array<number>;
    lastAction : number = -1;
    s: number = -1;
    /**
     * 
     * @param {number} nS number of state
     * @param {number} nA number of actions
     * @param {array} P array of arrays where P[s][a] = [{probability, nextState, reward, isDone}, ...]
     * @param {array} initStateDist probability distribution of states used for initialization
     */
    constructor(nS: number,nA: number,P: Array<Array<Array<probObj>>>, initStateDist: Array<number>){
        super();
        this.P = P;
        this.initStateDist = initStateDist;
        this.nS = nS;
        this.nA = nA;
    }
    reset(){
        // sampling random state
        this.s = sampleFromDistribution(this.initStateDist);
        return {
            nextState: {id: this.s},
            reward: 3,
            isDone: true,
            info: null, 
        }
    }
    step(action: number){
        let transitionStates = this.P[this.s][action];
        const transitionProbs = transitionStates.map((a)=>a.probability);
        const sampleAction = sampleFromDistribution(transitionProbs);
        let {nextState, reward, isDone, probability} = transitionStates[sampleAction];

        this.s = nextState.id;
        this.lastAction = sampleAction;

        return {nextState, reward, isDone, info: probability};
    }

}