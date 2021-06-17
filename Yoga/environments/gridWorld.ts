import {DiscreteEnv} from '../core/discrete'
import { NotImplementedError } from '../utils';
// Inspired by Frozen Lake Env : https://github.com/openai/gym/blob/master/gym/envs/toytext/frozenlake.py

export class GridWorldEnv extends DiscreteEnv{
  constructor(
    gridShape: Array<number> = [5, 5], 
    isWallState: (idx: number) => boolean, 
    isTerminalState: (idx: number, nS: number) => boolean,
    rewardFn:(idx: number, nS: number) => number, 
    initStartState: () => number = ()=> 3){

    isTerminalState = isTerminalState ?? defaultIsTerminalState;
    isWallState = isWallState ?? defaultIsWallState;
    rewardFn = rewardFn ?? defaultRewardFn;

    const nS = gridShape[0]* gridShape[1];
    const nA = 4;
    let P = Array(nS).fill(null);
    P = P.map((v, s)=>{
      // creating space for all the actions and filling them with the appropriate info
      return stateProperties(s, nA, nS);
    });

    // calculate initial state distribution
    const isd = Array(nS).fill(0)
    isd[initStartState()] = 1.0

    super(nS ,nA ,P ,isd)

    /**
     * Check if the current state is along an edge
     */
    function isEdge(i: number, a: number, actions: Array<number>): number {

      const [UP, RIGHT, DOWN, LEFT] = actions;
      const width = gridShape[0];
      const height = gridShape[1];
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
    function defaultRewardFn(idx: number, nS: number): number{
      if (isTerminalState(idx,nS) )return 0;
      return -1;
    }

    function defaultIsWallState(idx: number): boolean{
      return false;
    }

    /**
     * this function considers the first and the last state as its terminal state
     */
    function defaultIsTerminalState(idx: number, nS: number): boolean{
      if (idx === 0 || idx === (nS -1)) return true;
      return false;
    }

    /**
     * this function calculates and returns several properties of our state.
     */
    function stateProperties(s: number, nA: number, nS: number){

      const actions = [0, 1, 2, 3];
      const [UP, RIGHT, DOWN, LEFT] = actions;

      const properties = [];

      for(let dir=0; dir < nA; dir++){

          // next State index if the current state is not a terminal, wall or in an edge
          let nextStateIndex = (()=>{
            if (dir === UP)return s - gridShape[1];
            if (dir === RIGHT)return s + 1;
            if (dir === DOWN)return s + gridShape[0];
            if (dir === LEFT)return s - 1;
            return -1;
          })()
          nextStateIndex =  ( isEdge(s, dir, actions) || isWallState(nextStateIndex) || isTerminalState(s, nS) )? s : nextStateIndex;
          properties.push(
            [
              {
                probability: 1.0,
                // if the given state, action pair yield a wall state or is on the edge or is a terminal state then don't change the state at all.
                nextState: {id: nextStateIndex},
                reward: +rewardFn(s, nS),
                isDone: isTerminalState(nextStateIndex, nS)
              }
            ]
          )
      }

      return properties;
    }

  }

  render(){
    throw NotImplementedError
  }

}