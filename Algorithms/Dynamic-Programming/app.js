import { GridWorldEnv } from '../../Environments/gridWorld'
import { PolicyIterationAgent } from "./policyIteration"

const gridSize = 4;

async function main(){
    console.log("hello")
    let env = new GridWorldEnv([gridSize, gridSize]);
    let agent = new PolicyIterationAgent(
        {
            env: env,
            discountFactor: 1.0,
            theta: 0.00001
        }
    );
    // train => save
    // await agent.train(100);
    // await agent.save();
    console.log('it works')

    // load params => run agent
    await agent.load('./modelParams.json');
    await agent.run(10);
}
main();