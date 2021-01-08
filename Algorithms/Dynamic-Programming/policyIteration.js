import {argMax} from '../../Dependencies/Utils'
import baseAgent from '../baseAgent';

function greedyActionSelection(values){
    let maxVal = Math.max(...values);
    const maxValIndexArray = []
    values.map((val,i)=>{
    if(val === maxVal )maxValIndexArray.push(i)
    })

    return maxValIndexArray;
}

export class PolicyIterationAgent extends baseAgent{

    /**
     * 
     * @param {policyIterationArgs} config configuration for our agent.
     */
    constructor(config){
        super(config);
        this._agentParams = {
            policy: (Array(this._env.nS).fill(0))
                    .map(()=>Array(this._env.nA)
                    .fill(1/this._env.nA)),
            valueFns: (Array(this._env.nS).fill(0))
        };
        this._discountFactor = config.discountFactor;
    }

    /**
     * calculate and returns the action to select in a given state
     * @override
     * @param {Object} state current object
     * @returns {Number} action index.
     */
    actionSelection(state){
        return argMax(this.getParams().policy[state.id]);
    }

    _calcExpectedStateValue(state, valueFn){
        const policy = this._agentParams.policy[state];
        let expectedValue = 0;

        for(let action=0; action<policy.length; action+=1){
            const actionProb = policy[action];
            let {probability, nextState, reward, _} = this._env.P[state][action]
            expectedValue += actionProb * probability * 
                        (reward + this._discountFactor * valueFn[nextState]);

        }
        return expectedValue;
    }

    _policyEvalPerStep(valueFn){
        const nStates = this._env.nS;
        let maxValueEstimateDiff = 0;

        // take full backup of each state.
        for(let state = 0; state<nStates; state+=1){
            const cStateExpectedValue = this._calcExpectedStateValue(state, valueFn);
            const cValueEstimateDiff =  Math.abs(cStateExpectedValue - valueFn[state]);

            maxValueEstimateDiff = Math.max(maxValueEstimateDiff, cValueEstimateDiff);
            valueFn[state] = cStateExpectedValue;
        }
        return {maxValueEstimateDiff, valueFn};
    }

    _policyEvaluation(steps, threshold = 0.00001){
        return new Promise(async resolve =>{
            let valueFn = new Array(this._env.nS).fill(0);
            for(let iter = 0; iter<steps; iter+=1){
                const {maxValueEstimateDiff, valueFn: newValueFn} = this._policyEvalPerStep(valueFn);
                valueFn = newValueFn;
                if(maxValueEstimateDiff < threshold)break;
            }
            this._agentParams.valueFns = valueFn;
            resolve(valueFn);
        })
    }

    _oneStepLookAhead(stateID, valueFn){

        const nActions = this._env.nA;
        const cAction = new Array(nActions).fill(0);
        for(let action = 0; action<nActions; action+=1){
            const {nextState, reward, probability: transitionProb, _} = this._env.P[stateID][action];
            cAction[action] += transitionProb * 
                               (reward + this._discountFactor * valueFn[nextState]);
        }
        return cAction;
    }
    _policyImprovement(valueFn){
        return new Promise( resolve => {
            let isPolicyStable = true;
            for(let stateID = 0; stateID < this._env.nS; stateID+=1){
                const actionValues = this._oneStepLookAhead(stateID, valueFn);
                const bestAction = argMax(actionValues);
                const cState = {id: stateID};
                const currentAction = this.actionSelection(cState);
                if (currentAction !== bestAction)isPolicyStable = false;
                // greedily update the policy
                let targetPolicy = Array(this._env.nA).fill(0);
                targetPolicy[bestAction] = 1.0;
                this._agentParams.policy[stateID] = targetPolicy;
            }
            resolve(isPolicyStable);
        })
    }

    /**
     * train our agent.
     * @override
     * @param {number} nEpisodes number of episodes should our agent be trained for.
     * @returns {Object} return the reference to this.
     */
    train(nEpisodes){
        return new Promise(async (resolve) => {
            let iter = 0;
            const policyEvalSteps = 100 || nEpisodes;
            while(iter < nEpisodes){
                const valueFn = await this._policyEvaluation(policyEvalSteps);
                const isPolicyStable = await this._policyImprovement(valueFn);
                const terminateLoop =(this.callback)? await this.callback() : false;
                if (isPolicyStable || terminateLoop)break;
                iter += 1;
            }
            resolve(this);
            }
        )
    }


}

/**
 * @typedef {Object} policyIterationArgs
 * @property {Object} env environment on which our agent will get trained on.
 * @callback callback a callback function which will get invoked after the end of each episode.
 * @property {number} discountFactor
 */