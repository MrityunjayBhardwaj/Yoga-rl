import { sum, sortBy } from 'lodash';
import { Env } from '../core/core';
import {NotImplementedError} from '../utils'

function cmp(a: number, b: number): number{
    return (( a > b)? 1 : 0 )  - ((a < b)? 1 : 0)
}

// 1 = Ace, 2-10 = Number cards, Jack/Queen/King = 10
const deck = new Array(10).fill(0).map((_,i)=>i+1)
deck.push(...[10,10,10]);

/**
 * drawing a card randomly
 * @param {boolean} drawHand 
 * @return {Array}
 */
function drawCard(drawHand:boolean = false){
    const rndIndex = Math.floor(Math.random()*(deck.length));
    return deck[rndIndex];
}

/**
 * drawing a 2 cards randomly  
 * @param {boolean} drawHand 
 * @return {Array}
 */
function drawHand(){
    return [drawCard(), drawCard()];
}

/**
 * do i have an Ace ? if yes, can i use it without exceeding the sum > 21
* @param {Array} hand 
 * @return {boolean} 
 */
function usableAce(hand: Array<number>): boolean{
    // console.log(hand);
    return (hand.indexOf(1) !== -1) && ((sum(hand) + 10) <= 21)
}

/**
 * return the current hand total and if we have a usable then add 10
 * @param {Array} hand 
 * @return {number}
 */
function sumHand(hand: Array<number>){
    return sum(hand) + (usableAce(hand)? 1 : 0)*10;
}

/**
 * check if our hand is busted or not
 * @param {Array} hand 
 * @returns {boolean}
 */
function isBust(hand: Array<number>): boolean{
    return sumHand(hand) > 21
}

/**
 * what is the current score of our hand ( 0 if busted)
 * @param {Array} hand 
 * @return {number}
 */
function score(hand: Array<number>): number{
    return (isBust(hand))? 0 : sumHand(hand);
}

/**
 * return true if our first 2 card is an ace and a 10 card 
 * @param {Array} hand 
 * @return {boolean}
 */
function isNatural(hand: Array<number>){
    return sortBy(hand) === [1, 10];
}

export class BlackJackEnv extends Env {
    player: Array<number>;
    dealer: Array<number>;
    nA: number;
    nautral: boolean;

    constructor (nautral = false) {
        super();
        this.player = [];
        this.dealer = [];
        this.nA = 2;
        this.nautral = nautral;

        this.reset();
    }

    reset(){
        this.dealer = drawHand();
        this.player = drawHand();

        while(sumHand(this.player) < 12)
            this.player.push(drawCard());

        return {nextState: this._getObs(), reward: 0, isDone: false, info: {dealer: this.dealer, player: this.player} }
    }

    /**
     * 
     * @param action Hit = 0 or Stand = 1
     * @returns 
     */
    step(action: 1 | 0){
        let isDone = false;
        let reward = 0;

        if (action){
            this.player.push(drawCard());

            if (isBust(this.player)){
                isDone = true;
                reward = -1;
            }
            else{
                isDone = false;
                reward = 0;
            }
        }
        else{
            isDone = true;
            while(sumHand(this.dealer) < 17){
                this.dealer.push(drawCard());
            }
            reward = cmp(score(this.player), score(this.dealer));
            if(this.nautral && isNatural(this.player) && reward === 1)
                reward = 1.5;

        }
            return {nextState: this._getObs(), reward, isDone, info: {dealer: this.dealer, player: this.player} }

    }
    
    _getObs(){
        return { playerScore: sumHand(this.player), dealerScore: this.dealer[0], usableAce: usableAce(this.player) }
    }

    render(){
        throw NotImplementedError

    }


}