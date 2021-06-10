import {DiscreteEnv} from './discrete.js'
// Inspired by Frozen Lake Env : https://github.com/openai/gym/blob/master/gym/envs/toy_text/frozen_lake.py

export class GridWorldEnv extends DiscreteEnv{
  constructor(gridShape = [5, 5], isWallState, isTerminalState, rewardFn, startStateFn){
    const _isTerminalState = isTerminalState ?? _defaultIsTerminalState;
    const _isWallState = isWallState ?? _defaultIsWallState;
    const _rewardFn = rewardFn ?? _defaultRewardFn;
    const _initStartState = startStateFn ?? (()=>3);
    const _gridShape = gridShape;

    const nS = _gridShape[0]* _gridShape[1];
    const nA = 4;
    let P = Array(nS).fill(null);
    P = P.map((v, s)=>{
      // creating space for all the actions and filling them with the appropriate info
      return _stateProperties(s, nA, nS);
    });

    // calculate initial state distribution
    const _isd = Array(nS).fill(0)
    _isd[_initStartState()] = 1.0

    super(nS ,nA ,P ,_isd)

    /**
     *summery Check if the current state is along an edge
     */
    function _isEdge(i, a, actions) {

      const [UP, RIGHT, DOWN, LEFT] = actions;
      const width = _gridShape[0];
      const height = _gridShape[1];
      const xCoord = i % height;
      const yCoord = Math.floor(i / width);

      if (xCoord === 0 && a === LEFT) return 1;
      if (yCoord === 0 && a === UP) return 1;
      if (yCoord === height - 1 && a === DOWN) return 1;
      if (xCoord === width - 1 && a === RIGHT) return 1;

      return 0;
    }

    /**
     * standard textbook reward scheme
     */
    function _defaultRewardFn(idx, nS){
      if (_isTerminalState(idx,nS) )return 0;
      return -1;
    }

    function _defaultIsWallState(idx){
      return false;
    }

    /**
     * this function considers the first and the last state as its terminal state
     */
    function _defaultIsTerminalState(idx, nS){
      if (idx === 0 || idx === (nS -1)) return true;
      return false;
    }

    /**
     * this function calculates and returns several properties of our state.
     */
    function _stateProperties(s, nA, nS){

      const actions = [0, 1, 2, 3];
      const [UP, RIGHT, DOWN, LEFT] = actions;

      const properties = [];

      for(let dir=0; dir < nA; dir++){

          // next State index if the current state is not a terminal, wall or in an edge
          let nextStateIndex = (()=>{
            if (dir === UP)return s - _gridShape[1];
            if (dir === RIGHT)return s + 1;
            if (dir === DOWN)return s + _gridShape[0];
            if (dir === LEFT)return s - 1;
          })()
          nextStateIndex =  ( _isEdge(s, dir, actions) || _isWallState(nextStateIndex) || _isTerminalState(s, nS) )? s : nextStateIndex;
          properties.push(
            [
              {
                probability: 1.0,
                // if the given state, action pair yield a wall state or is on the edge or is a terminal state then don't change the state at all.
                nextState: {id: nextStateIndex},
                reward: +_rewardFn(s, nS),
                isDone: _isTerminalState(nextStateIndex, nS)
              }
            ]
          )
      }

      return properties;
    }


  }
}