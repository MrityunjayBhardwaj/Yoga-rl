import { zip, unzip, range, sortBy, sum } from 'lodash'

const NotImplementedError = Error("this method is not yet Implemented");

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
function sampleFromDistribution(distribution: Array<number>): number{

  const sumOfDist = sum(distribution);

  // normalize the distribution
  if (sumOfDist !== 1)
    distribution = distribution.map((val)=>{ return val/sumOfDist });

  const randNum = Math.random();
  const zipDistAndIndexes = zip(distribution, range(distribution.length));
  const sortedDistAndIndexes = sortBy(zipDistAndIndexes, [0]);
  const [sortedDist, sortedIndexes ] = unzip(sortedDistAndIndexes);
  const cumDist = sortedDist.map((_, i)=>sum(sortedDist.slice(0, i+1)));
  const indexOfNearestCumProbFromRandNum = ( cumDist.map((prob: number)=>{return  ((prob - randNum) > 0)? 1 : 0  } ) ).indexOf(1);
  const sampledIndexFromDist: number = sortedIndexes[indexOfNearestCumProbFromRandNum] || -1;
  
  return sampledIndexFromDist;

}

export {NotImplementedError, sampleFromDistribution}