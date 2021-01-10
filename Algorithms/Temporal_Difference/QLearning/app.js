import { policyFnFactory } from "../../../Dependencies/Utils";
import { BlackJackEnv } from "../../../Environments/blackJack";
import { QLearningAgent } from './qLearning';

// environment to test on.
const env = new BlackJackEnv();
// Testing QLearning
const behaviorPolicy = policyFnFactory("epsilonGreedy", env, {epsilon: 0.1} );
const model = new QLearningAgent( {env, behaviorPolicy, discountFactor: 1.0, learningRate: 0.5});

async function main(){
    // await model.train(10000);
    // await model.save();
    const isSucessful = await model.load('./agentParams.json');
    console.log('params: ', isSucessful, model.getParams());
    await model.run();
    window.q = model.getParams()
}
main();