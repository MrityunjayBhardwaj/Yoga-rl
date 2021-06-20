import * as seedrandom from "seedrandom";

interface space{
	sample():number | Array<number>;
	random: seedrandom.prng;
	seed(newSeedValue: number): number;
	
}
abstract class Space implements space{
	protected abstract shape: Array<number>;
	public abstract sample(): number | Array<number>;
	private seedValue: number = 0;
	public random: seedrandom.prng = seedrandom(''+this.seedValue);
	public seed(newSeedValue: number){
		this.seedValue = newSeedValue;
		this.random = seedrandom(''+this.seedValue);
		return this.seedValue;
	};
}

export {space, Space}