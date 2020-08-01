function argMax(arr){
  return arr.indexOf(Math.max(...arr))
}

class HashMap{
  constructor(defaultGetValue = -1){

    const Key = [];
    const Value = [];

    this.has = (key)=>{
      const stringifyKey = JSON.stringify(key);
      if(Key.indexOf(stringifyKey) !== -1)return true;

      return false;
    }

    this.set = (key, value)=>{

      const stringifyKey = JSON.stringify(key);

      const idx = Key.indexOf(stringifyKey);

      if (idx !== -1){
        Value[idx] = value;
        return this;
      }

      Key.push(stringifyKey);
      Value.push(value);

      return this;
    };

    this.get = (key)=>{
      
      const stringifyKey = JSON.stringify(key);
      const idx = Key.indexOf(stringifyKey);

      return (idx !== -1)? Value[idx] : defaultGetValue;
    }

    this.clear = ()=>{
      Key = [];
      Value = [];

      return this;
    }

    this.delete = (key)=>{
      const stringifyKey = JSON.stringify(key);
      const idx = Key.indexOf(stringifyKey);

      if(idx !== -1){
        Key.splice(idx,1);
        Value.splice(idx,1);
        return true;
      }

      return false;
    }

    this.size = ()=>{
      return Key.length;
    }

    this.items = ()=>{
      return _.zip(Key.map(k => JSON.parse(k)), Value);
    }
  }
}



class MC {

  constructor(env, callback) {
      this._model = {
        stateValue : [],
        stateActionValue: [], 
        weightsCumSum : 0,
        policy: new Array(100),
        env: env,
        params : {
          epsilon: 0.5
        }
    }
    this._nA = this._model.env.nA;

    // initializinng Q values
    this._model.qValue = new HashMap();

    // initializing cummulative weights
    this._model.weightsCumSum =  new HashMap();

    // initializing target Policy Fn
    this._model.policyFn = (state) =>{
      const A = _.fill(new Array(this._nA), 0);
      if (!this._model.qValue.has(state)){
        A[0] = 1;
        return defaultActionValue;
      }
      const greedyAction = argMax(this._model.qValue.get(state))
      A[greedyAction] = 1;
      return A;
    };


    this.callback = callback || (()=>{});
  }

  /**
   * @summary returns the qValue of our model
   * @returns {HashMap}
   */
  getQValue(){
    return this._model.qValue;
  }

  /**
   * @summary returns the target Policy function using our qValue estimates
   * @returns {function}
   */
  getPolicy(){ // targetPolicy
    return this._model.policyFn;
  }

  /**
   * 
   * @param {number} maxEpisode how many episode should we allow our agent to run
   * @param {function} behaviorPolicy our proposed policy from which we will choose our action
   * @param {number} discountFactor weights associated with each of our returns
   * 
   * @returns {object} the model itself ( for function chaining)
   */
  async train (maxEpisode, behaviorPolicy, discountFactor= 1.0){

      let cEpisode = 0;

      // NOTE: using interval for visualization purpose
      while(true){

        // deal();

        if (cEpisode % maxEpisode/10 === 0)
          console.log(`${cEpisode}) `);
    
        // * Generating the episodes
        const nSteps = 100;

        //storing our state, action, reward pairs for this episode
        const episodePairs = [];
        let forViz = null;
        let state = this._model.env.reset();

        // actual episode loop
        for(let t=0; t< nSteps; t+=1){

          // choose a random action
          const action = Math.floor(Math.random()*this._nA);

        //  if (action){
        //     hit();
        //  }else{
        //     stand();
        //  }

          // store all the pairs 
          const { observation: nextState, reward, isDone, cardUsed } = this._model.env.step(action);

          episodePairs.push({state, action, reward});

          // stop this episode if it reaches the terminal state
          if (isDone){

            forViz = cardUsed;
            break;
          }

          state = nextState;

        }

        // * backtrack the episode for estimating our Q values

        // initializing
        let returnsSum = 0;
        let returnsWeights = 1;

        // actual backtracking loop
        for(let i=episodePairs.length-1;i >= 0; i -=1){

          // fetching our state action and reward pairs from the current time step
          const {state, action, reward} = episodePairs[i];

          // caculating our sum of returns
          returnsSum = discountFactor * returnsSum + reward;

          // calculating our cummulative sum of weights ( importance ratio)
          const c = this._model.weightsCumSum;
          let cWeightsCumSum = (c.has(state))? c.get(state) : _.fill(Array(this._nA), 0);
          cWeightsCumSum[action] += returnsWeights;
          c.set(state, cWeightsCumSum)

          // calculating and storing our Q values
          const q = this._model.qValue;
          let newActionVal = (q.has(state))? q.get(state) : _.fill(Array(this._nA), 0);
          newActionVal[action] += (returnsWeights / c.get(state)[action]) * (returnsSum - newActionVal[action]);
          q.set(state, newActionVal)

          // if its not an optimal policy then simply break the loop
          if (action != argMax(this._model.policyFn(state)))
            break;

          // updating our  importance sampling ratio
          returnsWeights = returnsWeights * 1/behaviorPolicy(state)[action];
        }
    
        if(cEpisode % 10 === 0)
          console.log(`${cEpisode}) returnSum: ${returnsWeights}`);

          console.log('before callback');

        await this.callback(episodePairs, forViz);

        console.log('executed the callback function');

        if(cEpisode >= maxEpisode){
          console.log('exiting');  
          break;
        }

        cEpisode +=1;


      }

    return this;
  }

}
