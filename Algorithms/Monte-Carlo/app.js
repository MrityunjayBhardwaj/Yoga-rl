import { policyFnFactory } from "../../Dependencies/Utils";
import { MonteCarlo } from './monteCarlo'
import { BlackJackEnv } from '../../Environments/blackJack'

// environment to test our models on.
const env = new BlackJackEnv();

// testing Sarsa
const policy = policyFnFactory("random", env);
const model = new MonteCarlo(env, {discountFactor: 1.0});
model.run(1000, policy);

console.log('qValues: ', model.getQValues().items())