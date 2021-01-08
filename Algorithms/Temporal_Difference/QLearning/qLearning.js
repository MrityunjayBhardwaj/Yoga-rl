import { fill } from 'lodash'
import { sampleFromDistribution, argMax, DefaultDict, policyFnFactory } from '../../../Dependencies/Utils';
import baseAgent from '../../baseAgent';

function greedyPolicyFn(state, qValues){

    const cStateQValues = qValues.get(state);
    const nActions = cStateQValues.length;
    const policy = fill(Array(nActions), 0);
    const greedyAction = argMax(cStateQValues)
    policy[greedyAction] = 1.0;
    return policy;
};

export class QLearningAgent extends baseAgent{
    /**
     * 
     * @param {qLearningArgs} config configuration for our agent.
     */
    constructor(config){
        super(config)
        this._env = config.env;
        this._agentParams = {
            qValues: new DefaultDict(fill(Array(this._env.nA),0)),
        }
        this._discountFactor = config.discountFactor ?? 1.0;
        this._learningRate = config.learningRate ?? 0.5;
        this._targetPolicy = config.targetPolicy ?? greedyPolicyFn;
        this._behaviorPolicy =  config.behaviorPolicy?? policyFnFactory('random', config.env);

        this.callback = config.callback || (()=>{});
    }


    /**
     * calculate and returns the action to select in a given state
     * @override
     * @param {Object} state current object
     * @returns {Number} action index.
     */
    actionSelection(state){
        const actionProbs = this._behaviorPolicy(state, this.getParams().qValues);
        return sampleFromDistribution(actionProbs);
    }

    _tdUpdate(args){
        const {state, action, targetNextAction, reward, nextState} = args;
        const cActionValues = this._agentParams.qValues;
        const tdTarget = reward + this._discountFactor * cActionValues.get(nextState)[targetNextAction];
        const tdDelta = tdTarget - cActionValues.get(state)[action];
        let newActionValues = cActionValues.get(state);
        newActionValues[action] += this._learningRate * tdDelta;
        if(state === undefined){
            window.q = this.getParams().qValues;
            throw new Error('the state must not be undefined')
        }
        cActionValues.set(state, newActionValues);
    }

    /**
     * train our agent
     * @override
     * @param {number} nEpisodes how many episode should we allow our agent to run
     * @returns {object} a promise which gives us the updated qValues
     */
    train(nEpisodes){
        return (new Promise(async (resolve)=>{
            for(let cEpisode = 0; cEpisode < nEpisodes; cEpisode++){
                let state = this._env.reset();
                while(true){
                    const action = this.actionSelection(state)
                    const { nextState, isDone, reward} = this._env.step(action);
                    const targetNextAction = sampleFromDistribution(this._targetPolicy(nextState, this.getParams().qValues));
                    this._tdUpdate({state, action, targetNextAction, reward, nextState});
                    if (isDone)break;
                    state = nextState;
                }
                const stopTheLoop = await this.callback() || false;
                if(stopTheLoop)break;
            }
            resolve(this.getParams().qValues)
        }))
    }
}

/**
 * @typedef {Object} qLearningArgs
 * @property {Object} env environment on which our agent will get trained on.
 * @property {Function} callback a callback function which will get invoked after the end of each episode.
 * @property {number} discountFactor
 * @property {number} learningRate
 * @property {policyFn} behaviorPolicy behavior policy our agent should use
 * @property {policyFn} targetPolicy which target policy should our agent should follow, if none specified then fallback to the greedy policy.
 */

 /**
  * @callback policyFn given the state and current qValues this function calculates and return the policy to follow.
  * @param {Object} state state of the environment
  * @param {DefaultDict} qValues qValues of our agent
  * @returns {Number[]} policy
  */