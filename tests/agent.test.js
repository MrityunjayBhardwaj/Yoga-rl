import * as modelBasedAgentRegister from '../Algorithms/modelBasedAgentRegister';
import * as modelFreeAgentRegister from '../Algorithms/modelFreeAgentRegister';
import * as envRegister from '../Environments/envRegister';

/**
 * TODO:
 * check if all the agents are trainable.
 * check if all the agents are runnable.
 * check if we can save our trained agent.
 * check if we can load our trained agent from JSON file.
 */

const env4ModelBasedAgents = new envRegister.GridWorldEnv();
const env4ModelFreeAgents = new envRegister.BlackJackEnv();

function createListOfAgents(){
    const list = [];
    for(let agentName in modelBasedAgentRegister){
        const cAgent = new modelBasedAgentRegister[agentName]({env: env4ModelBasedAgents});
        list.push(cAgent);
    }
    for(let agentName in modelFreeAgentRegister){
        const cAgent = new modelFreeAgentRegister[agentName]({env: env4ModelFreeAgents});
        list.push(cAgent);
    }
    return list;
}

let agentList = createListOfAgents();

test('Check if all the Agents are trainable', async ()=>{
    const nEpisodes = 10;
    for(let cAgent of agentList){
        await cAgent.train(nEpisodes);
    }
})

test('Check if all the Agents are runnable', async ()=>{
    const nEpisodes = 10;
    for(let cAgent of agentList){
        await cAgent.run(nEpisodes);
    }
})

test('Check if we can save all the agent\'s params in JSON file', async ()=>{
    const nEpisodes = 10;
    for(let cAgent of agentList){
        // await cAgent.train(nEpisodes);
        // cAgent.save()
    }
})

test('Check if we can load all the agent\'s params from JSON file', async ()=>{
    const nEpisodes = 10;
    for(let cAgent of agentList){
        // cAgent.load('');
        // cAgent.run(nEpisodes);
    }
})