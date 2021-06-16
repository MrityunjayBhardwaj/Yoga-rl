export abstract class Env{
    platform: string = 'web'
    /**
     * @summary this function resets the state of the environment
     * @returns {any} // TODO: change the any type to stepObj.
     */
    public abstract reset(): any;

    /**
     * @param {number} action action performed by the agent must be between 0 and nA.
     * @summary run 1 timestep of the environment.
     * @returns {stepObj}
     */
    public abstract step(action: number): stepObj;

    /**
     * @summary Renders the environment
     */
    public abstract render(): void;
}

interface stepObj{
    nextState: object,
    reward: number,
    isDone: boolean,
    info: any// TODO: check how can we get rid of this any type maybe just use object type all the way?
}

/**
 * @typedef {object} stepObj
 * @property {object} nextState agent's observation of the environemnt after performing the given action
 * @property {number} reward amount of reward we get after performing the given action
 * @property {boolean} isDone indicate if we reach terminal state or not
 * @property {object} info contains extra informations ( if specified ).
 */
