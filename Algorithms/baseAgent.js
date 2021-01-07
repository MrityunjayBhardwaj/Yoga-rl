import  { saveAs } from 'file-saver/dist/FileSaver'
import { cloneDeep } from 'lodash';
import { DefaultDict } from '../Dependencies/Utils';

export default class baseAgent {
    _agentParams = null;

    /**
     * 
     * @param {baseArgs} config specification for our agent
     */
    constructor(config){
        this._env = config.env;
        this.callback = config.callback ?? (()=>{});
    }

    /**
     * @returns {object} the environment on which our agent is using.
     */
    get env(){
        return cloneDeep(this._env);
    }

    /**
     * @returns {object} the params of agent
     */
    getParams(){
        return cloneDeep(this._agentParams);
    }

    /**
     * train our agent
     */
    train(){
         throw NotImplementedError;
    }

    /**
     * action to select in a given state
     */
    actionSelection(state){
        throw NotImplementedError;
    }

    /**
     * let our agent play
     * @returns promise which resolves and give a reference to this object
     */
    run(nEpisodes = 10, maxIterationsPerEpisode = 100){
        return new Promise(async (resolve) => {
            for(let ep = 0; ep < nEpisodes; ep++){
                let iter = 0;
                const state = this._env.reset();
                while(iter < maxIterationsPerEpisode){
                    const action = this.actionSelection(state);
                    const  {nextState, isDone}  = this._env.step(action);
                    if (isDone)break;
                    state = nextState;
                    // await this._env.render();
                    iter++;
                }
                await this.callback();
            }
            resolve(this);
        })
    }

    /**
     * this method modify our input object by changing all the values in our object that is an instance of class DefaultDict to multi-dim array
     * that we can save properly.
     */
    _preprocessBeforeSaving(obj){
        return new Promise(async resolve =>{
            console.log('inside sv')
            for(const cMemberName in obj){
                const cMember = obj[cMemberName];
                if(cMember instanceof DefaultDict){
                    obj[cMemberName] = {defaultDict: cMember.items(), defaultValue: cMember.get()};
                }
            }
            resolve(obj);
        })
    }

    /**
     * save a json file containing the parameters of our qValues.
     * @returns promise which resolves to 'sucess' if it sucessfully saves our params.
     */
    save(){
        return new Promise( async resolve =>{
            console.log('inside save')
            const modifiedAgentParams = await this._preprocessBeforeSaving(this.getParams());
            const agentParams = JSON.stringify(modifiedAgentParams);
            const agentJSONBlob = new Blob([agentParams], {type: "application/json"});
            await saveAs(agentJSONBlob, 'agentParams.json')
            console.log('agent\'s params are saved!', agentJSONBlob, agentParams)
            resolve('sucess');
        })
    }

    /**
     * this method convert back all the values that should be an instence of DefaultDict into a DefaultDict object.
     */
    _preprocessBeforeAssigning(obj){
        return new Promise(async resolve =>{
            for(const cMemberName in obj){
                const cMember = obj[cMemberName];
                if (cMember.defaultDict){
                    // convert the items multi-dim array back to defaultDict obj
                    const ddObject = new DefaultDict(cMember.defaultValue);
                    cMember.defaultDict.map((entry)=>{
                        ddObject.set(entry[0], entry[1])
                    })
                    obj[cMemberName] = ddObject;
                }
            }
            resolve(obj);
        })
    }

    /**
     * parse and load the parameter for our agent.
     * @param {JSON} path
     * @returns promise which resolves to true if we are able to sucessful load our params from specified file path.
     */
    load(path){
        return new Promise(async resolve =>{
            const response = await fetch(path);
            if(response.status !== 200)resolve(false)
            const loadedObj = await response.json();
            const modifiedAgentParams = await this._preprocessBeforeAssigning(loadedObj);
            this._agentParams = modifiedAgentParams;
            resolve(true)
        })
    }

}

/**
 * @typedef baseArgs
 * @property {object} env environment on which our agent will get trained on.
 * @callback callback a callback function which will get invoked after the end of each episode.
 */