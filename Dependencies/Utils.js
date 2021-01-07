import { cloneDeep, zip, unzip, range, sortBy, sum } from 'lodash'

/**
 * given an array of numbers, this function returns the index of array member of greatest value.
 * @param {number[]} arr 
 * @returns {number} index
 */
function argMax(arr){
  if(!Array.isArray(arr))throw new Error('input must be of type array but given '+arr);
  const maxVal = Math.max(...arr);
  if (maxVal === NaN)throw new Error('the entries in the given input array must be of type Number only.');
  return arr.indexOf(maxVal)
}

/**
 * given the index of a tensor, this function coverts that index number to tensor's coordinates
 * @param {number} index index
 * @param {number[]} shape shape of the tensor
 * @example 
 * const tensor = 
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

    const coords = index2Coords(index, tensorShape, tensorSize );
    console.log(coords); // > [0, 1, 2]
    @returns {number[]}  coords
 */
function index2Coords(index, shape){

    const size =shape.reduce((accumulator,currentValue)=> accumulator*currentValue, 1);
    const coords = [];

    let oldFac = size;
    for(let i=0;i<shape.length -1;i++){
        const cFac = (oldFac/shape[i]);
        const cCoords = Math.floor(  (index % oldFac)/cFac );
        coords.push(cCoords);
        oldFac = cFac;
    }
    
    coords.push(index%shape[shape.length-1]);
    
    return coords;
}

/**
 * given an array of distribution, this function returns the random index by sampling from the given distribution.
 * @param {number[]} distribution 
 * @example 
 * const dist = [0.1, 0.3, 0.5]
 * let sampledIndex = sampleFromDistribution(dist);
 * console.log('result: '+ sampledIndex);// > result: 2
 * sampledIndex = sampleFromDistribution(dist);
 * console.log('result: '+ sampledIndex);// > result: 1
 * sampledIndex = sampleFromDistribution(dist);
 * console.log('result: '+ sampledIndex);// > result: 2
 * sampledIndex = sampleFromDistribution(dist);
 * console.log('result: '+ sampledIndex);// > result: 2
 * sampledIndex = sampleFromDistribution(dist);
 * console.log('result: '+ sampledIndex);// > result: 0
 * 
 * @returns {number}
 */
function sampleFromDistribution(distribution){
  if (Math.max(distribution) === NaN)throw new Error('distribution must be an array whose entries must only be of type \'Number\'. ');

  const sumOfDist = sum(distribution);


  // normalize the distribution
  if (sumOfDist !== 1)
    distribution = distribution.map((val)=>{ return val/sumOfDist });

  const randNum = Math.random();
  const zipDistAndIndexes = zip(distribution, range(distribution.length));
  const sortedDistAndIndexes = sortBy(zipDistAndIndexes, [0]);
  const [sortedDist, sortedIndexes ] = unzip(sortedDistAndIndexes);
  const cumDist = sortedDist.map((prob,i)=>sum(sortedDist.slice(0, i+1)));
  const indexOfNearestCumProbFromRandNum = ( cumDist.map((prob)=>{return 1*((prob-randNum) > 0)}) ).indexOf(1);
  const sampledIndexFromDist = sortedIndexes[indexOfNearestCumProbFromRandNum];
  
  return sampledIndexFromDist;

}

/**
 * DefaultDict class inspired by numpy default_dict
 */
class DefaultDict{

  /**
   * 
   * @param {Object} defaultGetValue specify which value to return if the dictonary is queried with an unknown key.
   */
  constructor(defaultGetValue = -1){

    let Key = [];
    let Value = [];

    /**
     * 
     * @param {Object} key 
     * @summary checks if the given key exist in our dict
     * @returns {boolean}
     */
    this.has = (key)=>{
      const stringifyKey = JSON.stringify(key);
      if(Key.indexOf(stringifyKey) !== -1)return true;

      return false;
    }

    /**
     * 
     * @param {Object} key 
     * @param {Object} value 
     * @summary if the new key is provided then it will create a new entry in the dictonary with this 
     * new key-value pair. otherwise, update the existing value.
     */
    this.set = (key, value)=>{

      if(typeof key === "function")throw new Error('DefaultDict does not support key of type \'function\' ')

      const stringifyKey = JSON.stringify(key);

      const idx = Key.indexOf(stringifyKey);

      if (idx !== -1){
        Value[idx] = value;
      }else{
        Key.push(stringifyKey);
        Value.push(value);
      }

      return this;
    };

    /**
     * 
     * @param {Object} key 
     * @returns {Object} returns a copy of the value associated with the given key
     */
    this.get = (key)=>{
      
      const stringifyKey = JSON.stringify(key);
      const idx = Key.indexOf(stringifyKey);

      return cloneDeep((idx !== -1)? Value[idx] : defaultGetValue);
    }

    /**
     * @summary delete all the key value pairs in the dictonary.
     */
    this.clear = ()=>{
      Key = [];
      Value = [];

      return this;
    }

    /**
     * 
     * @param {Object} key 
     * @summary delete the specified key-value pairs from the dict. and shows a warning if the key doesn't exist
     * in the first place.
     */
    this.delete = (key)=>{
      const stringifyKey = JSON.stringify(key);
      const idx = Key.indexOf(stringifyKey);

      if(idx !== -1){
        Key.splice(idx,1);
        Value.splice(idx,1);
      }else{
         console.warn('the specified key doesn\'t exist hence, not removed')
      }

    }

    /**
     * @returns size of the dictonary
     */
    this.size = ()=>{
      return Key.length;
    }

    /**
     * @returns entire dictonary as a 2d-array.
     */
    this.items = ()=>{
      return zip(Key.map(
        k => 
        JSON.parse(k)
        ), Value);
    }

  }
}


/**
 * 
 * this function contains a collection of different policyFns which you can use to specify the behaviour policy of your agent. 
 * the full list of available poliyFns are:
 * ["epsilonGreedy", "UCB"]
 * @param {string} policyFnName name of the policyFn to use
 * @param {Object} env 
 * @param {Object} params parameter for that particular policyFn
 * @returns {Function}
 */
function policyFnFactory(policyFnName, env, params){
  const nActions = env.nA;

  const policyFnNames = ['random', 'greedy', 'epsilonGreedy', 'UCB', ];
  const policyFns = [

    /* random Policy */
    function(state, qValues){
        return Array(env.nA).fill(1/env.nA);
    },

    /* greedy policy */
    function(state, qValues){
      const policy = Array(env.nA).fill(0);
      const greedyAction = argMax(qValues.get(state));
      policy[greedyAction] = 1.0

      return policy;
    },

    /* Epsilon Greedy */
    function(state, qValues){
      const epsilon = params.epsilon ?? 0.1;
      const policy = Array(nActions).fill(epsilon/nActions);

      const greedyAction = argMax(qValues.get(state));
      policy[greedyAction] += (1.0 - epsilon);

      return policy;
    },
    /* UCB */

  ];
  const policyFnIndex = policyFnNames.indexOf(policyFnName);

  if(policyFnIndex === -1)throw new Error('invalid policyName specified. currently, policyFnFactor support only these functions: ["epsilonGreedy", "UCB"] but given '+ policyFnName)
  return policyFns[policyFnIndex];
}

export { argMax, index2Coords, sampleFromDistribution, DefaultDict, policyFnFactory };