/*

Ratings and how they work:

-1: Detrimental
	  An ability that severely harms the user.
	ex. Defeatist, Slow Start

 0: Useless
	  An ability with no overall benefit in a singles battle.
	ex. Color Change, Plus

 1: Ineffective
	  An ability that has minimal effect or is only useful in niche situations.
	ex. Light Metal, Suction Cups

 2: Useful
	  An ability that can be generally useful.
	ex. Flame Body, Overcoat

 3: Effective
	  An ability with a strong effect on the user or foe.
	ex. Chlorophyll, Sturdy

 4: Very useful
	  One of the more popular abilities. It requires minimal support to be effective.
	ex. Adaptability, Magic Bounce

 5: Essential
	  The sort of ability that defines metagames.
	ex. Imposter, Shadow Tag

*/

export const Abilities: import('../sim/dex-abilities').AbilityDataTable = {
	noability: {
		isNonstandard: "Past",
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "No Ability",
		rating: 0.1,
		num: 0,
	},
	adaptability: {
		onModifySTAB(stab, source, target, move) {
			if (move.forceSTAB || source.hasType(move.type)) {
				if (stab === 2) {
					return 2.25;
				}
				return 2;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Adaptability",
		rating: 4,
		num: 91,
	},
	aerilate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Flying';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Aerilate",
		rating: 4,
		num: 184,
	},
	aftermath: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp && this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 4, source, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Aftermath",
		rating: 2,
		num: 106,
	},
	airlock: {
		onSwitchIn(pokemon) {
			// Air Lock does not activate when Skill Swapped or when Neutralizing Gas leaves the field
			this.add('-ability', pokemon, 'Air Lock');
			((this.effect as any).onStart as (p: Pokemon) => void).call(this, pokemon);
		},
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			pokemon.abilityState.ending = false; // Clear the ending flag
			this.eachEvent('WeatherChange', this.effect);
		},
		onEnd(pokemon) {
			pokemon.abilityState.ending = true;
			this.eachEvent('WeatherChange', this.effect);
		},
		suppressWeather: true,
		
flags: {},
		name: "Air Lock",
		rating: 1.5,
		num: 76,
	},
	analytic: {
		onBasePowerPriority: 21,
		onBasePower(basePower, pokemon) {
			let boosted = true;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (this.queue.willMove(target)) {
					boosted = false;
					break;
				}
			}
			if (boosted) {
				this.debug('Analytic boost');
				return this.chainModify([5325, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Analytic",
		rating: 2.5,
		num: 148,
	},
	angerpoint: {
		onHit(target, source, move) {
			if (!target.hp) return;
			if (move?.effectType === 'Move' && target.getMoveHitData(move).crit) {
				this.boost({ atk: 12 }, target, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Anger Point",
		rating: 1,
		num: 83,
	},
	angershell: {
		onDamage(damage, target, source, effect) {
			if (
				effect.effectType === "Move" &&
				!effect.multihit &&
				!(effect.hasSheerForce && source.hasAbility('sheerforce'))
			) {
				this.effectState.checkedAngerShell = false;
			} else {
				this.effectState.checkedAngerShell = true;
			}
		},
		onTryEatItem(item) {
			const healingItems = [
				'aguavberry', 'enigmaberry', 'figyberry', 'iapapaberry', 'magoberry', 'sitrusberry', 'wikiberry', 'oranberry', 'berryjuice',
			];
			if (healingItems.includes(item.id)) {
				return this.effectState.checkedAngerShell;
			}
			return true;
		},
		onAfterMoveSecondary(target, source, move) {
			this.effectState.checkedAngerShell = true;
			if (!source || source === target || !target.hp || !move.totalDamage) return;
			const lastAttackedBy = target.getLastAttackedBy();
			if (!lastAttackedBy) return;
			const damage = move.multihit ? move.totalDamage : lastAttackedBy.damage;
			if (target.hp <= target.maxhp / 2 && target.hp + damage > target.maxhp / 2) {
				this.boost({ atk: 1, spa: 1, spe: 1, def: -1, spd: -1 }, target, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Anger Shell",
		rating: 3,
		num: 271,
	},
	anticipation: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					if (move.category === 'Status') continue;
					const moveType = move.id === 'hiddenpower' ? target.hpType : move.type;
					if (
						this.dex.getImmunity(moveType, pokemon) && this.dex.getEffectiveness(moveType, pokemon) > 0 ||
						move.ohko
					) {
						this.add('-ability', pokemon, 'Anticipation');
						return;
					}
				}
			}
		},
		
flags: {},
		name: "Anticipation",
		rating: 0.5,
		num: 107,
	},
	arenatrap: {
		onFoeTrapPokemon(pokemon) {
			if (!pokemon.isAdjacent(this.effectState.target)) return;
			if (pokemon.isGrounded()) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (pokemon.isGrounded(!pokemon.knownType)) { // Negate immunity if the type is unknown
				pokemon.maybeTrapped = true;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Arena Trap",
		rating: 5,
		num: 71,
	},
	armortail: {
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const armorTailHolder = this.effectState.target;
			if ((source.isAlly(armorTailHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', armorTailHolder, 'ability: Armor Tail', move, `[of] ${target}`);
				return false;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Armor Tail",
		rating: 2.5,
		num: 296,
	},
	aromaveil: {
		onAllyTryAddVolatile(status, target, source, effect) {
			if (['attract', 'disable', 'encore', 'healblock', 'taunt', 'torment'].includes(status.id)) {
				if (effect.effectType === 'Move') {
					const effectHolder = this.effectState.target;
					this.add('-block', target, 'ability: Aroma Veil', `[of] ${effectHolder}`);
				}
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Aroma Veil",
		rating: 2,
		num: 165,
	},
	asoneglastrier: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'As One');
			this.add('-ability', pokemon, 'Unnerve');
			this.effectState.unnerved = true;
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ atk: length }, source, source, this.dex.abilities.get('chillingneigh'));
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "As One (Glastrier)",
		rating: 3.5,
		num: 266,
	},
	asonespectrier: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'As One');
			this.add('-ability', pokemon, 'Unnerve');
			this.effectState.unnerved = true;
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ spa: length }, source, source, this.dex.abilities.get('grimneigh'));
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "As One (Spectrier)",
		rating: 3.5,
		num: 267,
	},
	aurabreak: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.add('-ability', pokemon, 'Aura Break');
		},
		onAnyTryPrimaryHit(target, source, move) {
			if (target === source || move.category === 'Status') return;
			move.hasAuraBreak = true;
		},
		
flags: { breakable: 1 },
		name: "Aura Break",
		rating: 1,
		num: 188,
	},
	baddreams: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			for (const target of pokemon.foes()) {
				if (target.status === 'slp' || target.hasAbility('comatose')) {
					this.damage(target.baseMaxhp / 8, target, pokemon);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Bad Dreams",
		rating: 1.5,
		num: 123,
	},
	ballfetch: {
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Ball Fetch",
		rating: 0,
		num: 237,
	},
	battery: {
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (attacker !== this.effectState.target && move.category === 'Special') {
				this.debug('Battery boost');
				return this.chainModify([5325, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Battery",
		rating: 0,
		num: 217,
	},
	battlearmor: {
		onCriticalHit: false,
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Battle Armor",
		rating: 1,
		num: 4,
	},
	battlebond: {
		onSourceAfterFaint(length, target, source, effect) {
			if (source.bondTriggered) return;
			if (effect?.effectType !== 'Move') return;
			if (source.species.id === 'greninjabond' && source.hp && !source.transformed && source.side.foePokemonLeft()) {
				this.boost({ atk: 1, spa: 1, spe: 1 }, source, source, this.effect);
				this.add('-activate', source, 'ability: Battle Bond');
				source.bondTriggered = true;
			}
		},
		onModifyMovePriority: -1,
		onModifyMove(move, attacker) {
			if (move.id === 'watershuriken' && attacker.species.name === 'Greninja-Ash' &&
				!attacker.transformed) {
				move.multihit = 3;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Battle Bond",
		rating: 3.5,
		num: 210,
	},
	beadsofruin: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Beads of Ruin');
		},
		onAnyModifySpD(spd, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Beads of Ruin')) return;
			if (!move.ruinedSpD?.hasAbility('Beads of Ruin')) move.ruinedSpD = abilityHolder;
			if (move.ruinedSpD !== abilityHolder) return;
			this.debug('Beads of Ruin SpD drop');
			return this.chainModify(0.75);
		},
		
flags: {},
		name: "Beads of Ruin",
		rating: 4.5,
		num: 284,
	},
	beastboost: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				const bestStat = source.getBestStat(true, true);
				this.boost({ [bestStat]: length }, source);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Beast Boost",
		rating: 3.5,
		num: 224,
	},
	berserk: {
		onDamage(damage, target, source, effect) {
			if (
				effect.effectType === "Move" &&
				!effect.multihit &&
				!(effect.hasSheerForce && source.hasAbility('sheerforce'))
			) {
				this.effectState.checkedBerserk = false;
			} else {
				this.effectState.checkedBerserk = true;
			}
		},
		onTryEatItem(item) {
			const healingItems = [
				'aguavberry', 'enigmaberry', 'figyberry', 'iapapaberry', 'magoberry', 'sitrusberry', 'wikiberry', 'oranberry', 'berryjuice',
			];
			if (healingItems.includes(item.id)) {
				return this.effectState.checkedBerserk;
			}
			return true;
		},
		onAfterMoveSecondary(target, source, move) {
			this.effectState.checkedBerserk = true;
			if (!source || source === target || !target.hp || !move.totalDamage) return;
			const lastAttackedBy = target.getLastAttackedBy();
			if (!lastAttackedBy) return;
			const damage = move.multihit && !move.smartTarget ? move.totalDamage : lastAttackedBy.damage;
			if (target.hp <= target.maxhp / 2 && target.hp + damage > target.maxhp / 2) {
				this.boost({ spa: 1 }, target, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Berserk",
		rating: 2,
		num: 201,
	},
	bigpecks: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.def && boost.def < 0) {
				delete boost.def;
				if (!(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
					this.add("-fail", target, "unboost", "Defense", "[from] ability: Big Pecks", `[of] ${target}`);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Big Pecks",
		rating: 0.5,
		num: 145,
	},
	blaze: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Blaze boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Blaze boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Blaze",
		rating: 2,
		num: 66,
	},
	bulletproof: {
		onTryHit(pokemon, target, move) {
			if (move.flags['bullet']) {
				this.add('-immune', pokemon, '[from] ability: Bulletproof');
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Bulletproof",
		rating: 3,
		num: 171,
	},
	cheekpouch: {
		onEatItem(item, pokemon) {
			this.heal(pokemon.baseMaxhp / 3);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Cheek Pouch",
		rating: 2,
		num: 167,
	},
	chillingneigh: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ atk: length }, source);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Chilling Neigh",
		rating: 3,
		num: 264,
	},
	chlorophyll: {
		onModifySpe(spe, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Chlorophyll",
		rating: 3,
		num: 34,
	},
	clearbody: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: Clear Body", `[of] ${target}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Clear Body",
		rating: 2,
		num: 29,
	},
	cloudnine: {
		onSwitchIn(pokemon) {
			// Cloud Nine does not activate when Skill Swapped or when Neutralizing Gas leaves the field
			this.add('-ability', pokemon, 'Cloud Nine');
			((this.effect as any).onStart as (p: Pokemon) => void).call(this, pokemon);
		},
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			pokemon.abilityState.ending = false; // Clear the ending flag
			this.eachEvent('WeatherChange', this.effect);
		},
		onEnd(pokemon) {
			pokemon.abilityState.ending = true;
			this.eachEvent('WeatherChange', this.effect);
		},
		suppressWeather: true,
		
flags: {},
		name: "Cloud Nine",
		rating: 1.5,
		num: 13,
	},
	colorchange: {
		onAfterMoveSecondary(target, source, move) {
			if (!target.hp) return;
			const type = move.type;
			if (
				target.isActive && move.effectType === 'Move' && move.category !== 'Status' &&
				type !== '???' && !target.hasType(type)
			) {
				if (!target.setType(type)) return false;
				this.add('-start', target, 'typechange', type, '[from] ability: Color Change');

				if (target.side.active.length === 2 && target.position === 1) {
					// Curse Glitch
					const action = this.queue.willMove(target);
					if (action && action.move.id === 'curse') {
						action.targetLoc = -1;
					}
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Color Change",
		rating: 0,
		num: 16,
	},
	comatose: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.add('-ability', pokemon, 'Comatose');
		},
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Comatose');
			}
			return false;
		},
		// Permanent sleep "status" implemented in the relevant sleep-checking effects
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Comatose",
		rating: 4,
		num: 213,
	},
	commander: {
		onAnySwitchInPriority: -2,
		onAnySwitchIn() {
			((this.effect as any).onUpdate as (p: Pokemon) => void).call(this, this.effectState.target);
		},
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			((this.effect as any).onUpdate as (p: Pokemon) => void).call(this, pokemon);
		},
		onUpdate(pokemon) {
			if (this.gameType !== 'doubles') return;
			// don't run between when a Pokemon switches in and the resulting onSwitchIn event
			if (this.queue.peek()?.choice === 'runSwitch') return;

			const ally = pokemon.allies()[0];
			if (pokemon.switchFlag || ally?.switchFlag) return;
			if (!ally || pokemon.baseSpecies.baseSpecies !== 'Tatsugiri' || ally.baseSpecies.baseSpecies !== 'Dondozo') {
				// Handle any edge cases
				if (pokemon.getVolatile('commanding')) pokemon.removeVolatile('commanding');
				return;
			}

			if (!pokemon.getVolatile('commanding')) {
				// If Dondozo already was commanded this fails
				if (ally.getVolatile('commanded')) return;
				// Cancel all actions this turn for pokemon if applicable
				this.queue.cancelAction(pokemon);
				// Add volatiles to both pokemon
				this.add('-activate', pokemon, 'ability: Commander', `[of] ${ally}`);
				pokemon.addVolatile('commanding');
				ally.addVolatile('commanded', pokemon);
				// Continued in conditions.ts in the volatiles
			} else {
				if (!ally.fainted) return;
				pokemon.removeVolatile('commanding');
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Commander",
		rating: 0,
		num: 279,
	},
	competitive: {
		onAfterEachBoost(boost, target, source, effect) {
			if (!source || target.isAlly(source)) {
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({ spa: 2 }, target, target, null, false, true);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Competitive",
		rating: 2.5,
		num: 172,
	},
	compoundeyes: {
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			this.debug('compoundeyes - enhancing accuracy');
			return this.chainModify([5325, 4096]);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Compound Eyes",
		rating: 3,
		num: 14,
	},
	contrary: {
		onChangeBoost(boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			let i: BoostID;
			for (i in boost) {
				boost[i]! *= -1;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Contrary",
		rating: 4.5,
		num: 126,
	},
	corrosion: {
		// Implemented in sim/pokemon.js:Pokemon#setStatus
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Corrosion",
		rating: 2.5,
		num: 212,
	},
	costar: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			const ally = pokemon.allies()[0];
			if (!ally) return;

			let i: BoostID;
			for (i in ally.boosts) {
				pokemon.boosts[i] = ally.boosts[i];
			}
			const volatilesToCopy = ['dragoncheer', 'focusenergy', 'gmaxchistrike', 'laserfocus'];
			// we need to be sure to remove all the overlapping crit volatiles before trying to add any
			for (const volatile of volatilesToCopy) pokemon.removeVolatile(volatile);
			for (const volatile of volatilesToCopy) {
				if (ally.volatiles[volatile]) {
					pokemon.addVolatile(volatile);
					if (volatile === 'gmaxchistrike') pokemon.volatiles[volatile].layers = ally.volatiles[volatile].layers;
					if (volatile === 'dragoncheer') pokemon.volatiles[volatile].hasDragonType = ally.volatiles[volatile].hasDragonType;
				}
			}
			this.add('-copyboost', pokemon, ally, '[from] ability: Costar');
		},
		
flags: {},
		name: "Costar",
		rating: 0,
		num: 294,
	},
	cottondown: {
		onDamagingHit(damage, target, source, move) {
			let activated = false;
			for (const pokemon of this.getAllActive()) {
				if (pokemon === target || pokemon.fainted) continue;
				if (!activated) {
					this.add('-ability', target, 'Cotton Down');
					activated = true;
				}
				this.boost({ spe: -1 }, pokemon, target, null, true);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Cotton Down",
		rating: 2,
		num: 238,
	},
	cudchew: {
		onEatItem(item, pokemon) {
			if (item.isBerry && pokemon.addVolatile('cudchew')) {
				pokemon.volatiles['cudchew'].berry = item;
			}
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['cudchew'];
		},
		condition: {
			noCopy: true,
			duration: 2,
			onRestart() {
				this.effectState.duration = 2;
			},
			onResidualOrder: 28,
			onResidualSubOrder: 2,
			onEnd(pokemon) {
				if (pokemon.hp) {
					const item = this.effectState.berry;
					this.add('-activate', pokemon, 'ability: Cud Chew');
					this.add('-enditem', pokemon, item.name, '[eat]');
					if (this.singleEvent('Eat', item, null, pokemon, null, null)) {
						this.runEvent('EatItem', pokemon, null, null, item);
					}
					if (item.onEat) pokemon.ateBerry = true;
				}
			},
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Cud Chew",
		rating: 2,
		num: 291,
	},
	curiousmedicine: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			for (const ally of pokemon.adjacentAllies()) {
				ally.clearBoosts();
				this.add('-clearboost', ally, '[from] ability: Curious Medicine', `[of] ${pokemon}`);
			}
		},
		
flags: {},
		name: "Curious Medicine",
		rating: 0,
		num: 261,
	},
	cursedbody: {
		onDamagingHit(damage, target, source, move) {
			if (source.volatiles['disable']) return;
			if (!move.isMax && !move.flags['futuremove'] && move.id !== 'struggle') {
				if (this.randomChance(3, 10)) {
					source.addVolatile('disable', this.effectState.target);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Cursed Body",
		rating: 2,
		num: 130,
	},
	cutecharm: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.addVolatile('attract', this.effectState.target);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Cute Charm",
		rating: 0.5,
		num: 56,
	},
	damp: {
		onAnyTryMove(target, source, effect) {
			if (['explosion', 'mindblown', 'mistyexplosion', 'selfdestruct'].includes(effect.id)) {
				this.attrLastMove('[still]');
				this.add('cant', this.effectState.target, 'ability: Damp', effect, `[of] ${target}`);
				return false;
			}
		},
		onAnyDamage(damage, target, source, effect) {
			if (effect && effect.name === 'Aftermath') {
				return false;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Damp",
		rating: 0.5,
		num: 6,
	},
	dancer: {
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Dancer",
		// implemented in runMove in scripts.js
		rating: 1.5,
		num: 216,
	},
	darkaura: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Dark Aura');
		},
		onAnyBasePowerPriority: 20,
		onAnyBasePower(basePower, source, target, move) {
			if (target === source || move.category === 'Status' || move.type !== 'Dark') return;
			if (!move.auraBooster?.hasAbility('Dark Aura')) move.auraBooster = this.effectState.target;
			if (move.auraBooster !== this.effectState.target) return;
			return this.chainModify([move.hasAuraBreak ? 3072 : 5448, 4096]);
		},
		
flags: {},
		name: "Dark Aura",
		rating: 3,
		num: 186,
	},
	dauntlessshield: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.shieldBoost) return;
			pokemon.shieldBoost = true;
			this.boost({ def: 1 }, pokemon);
		},
		
flags: {},
		name: "Dauntless Shield",
		rating: 3.5,
		num: 235,
	},
	dazzling: {
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const dazzlingHolder = this.effectState.target;
			if ((source.isAlly(dazzlingHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', dazzlingHolder, 'ability: Dazzling', move, `[of] ${target}`);
				return false;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Dazzling",
		rating: 2.5,
		num: 219,
	},
	defeatist: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				return this.chainModify(0.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				return this.chainModify(0.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Defeatist",
		rating: -1,
		num: 129,
	},
	defiant: {
		onAfterEachBoost(boost, target, source, effect) {
			if (!source || target.isAlly(source)) {
				return;
			}
			let statsLowered = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					statsLowered = true;
				}
			}
			if (statsLowered) {
				this.boost({ atk: 2 }, target, target, null, false, true);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Defiant",
		rating: 3,
		num: 128,
	},
	deltastream: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.field.setWeather('deltastream');
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'deltastream' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('deltastream')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		
flags: {},
		name: "Delta Stream",
		rating: 4,
		num: 191,
	},
	desolateland: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.field.setWeather('desolateland');
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'desolateland' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('desolateland')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
flags: {},
		name: "Desolate Land",
		rating: 4.5,
		num: 190,
	},
	disguise: {
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && ['mimikyu', 'mimikyutotem'].includes(target.species.id)) {
				this.add('-activate', target, 'ability: Disguise');
				this.effectState.busted = true;
				return 0;
			}
		},
		onCriticalHit(target, source, move) {
			if (!target) return;
			if (!['mimikyu', 'mimikyutotem'].includes(target.species.id)) {
				return;
			}
			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || move.category === 'Status') return;
			if (!['mimikyu', 'mimikyutotem'].includes(target.species.id)) {
				return;
			}

			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return 0;
		},
		onUpdate(pokemon) {
			if (['mimikyu', 'mimikyutotem'].includes(pokemon.species.id) && this.effectState.busted) {
				const speciesid = pokemon.species.id === 'mimikyutotem' ? 'Mimikyu-Busted-Totem' : 'Mimikyu-Busted';
				pokemon.formeChange(speciesid, this.effect, true);
				this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon, this.dex.species.get(speciesid));
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {
			failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1,
			breakable: 1, notransform: 1,
		},
		name: "Disguise",
		rating: 3.5,
		num: 209,
	},
	download: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			let totaldef = 0;
			let totalspd = 0;
			for (const target of pokemon.foes()) {
				totaldef += target.getStat('def', false, true);
				totalspd += target.getStat('spd', false, true);
			}
			if (totaldef && totaldef >= totalspd) {
				this.boost({ spa: 1 });
			} else if (totalspd) {
				this.boost({ atk: 1 });
			}
		},
		
flags: {},
		name: "Download",
		rating: 3.5,
		num: 88,
	},
	dragonsmaw: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Dragon') {
				this.debug('Dragon\'s Maw boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Dragon') {
				this.debug('Dragon\'s Maw boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Dragon's Maw",
		rating: 3.5,
		num: 263,
	},
	drizzle: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (source.species.id === 'kyogre' && source.item === 'blueorb') return;
			this.field.setWeather('raindance');
		},
		
flags: {},
		name: "Drizzle",
		rating: 4,
		num: 2,
	},
	drought: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (source.species.id === 'groudon' && source.item === 'redorb') return;
			this.field.setWeather('sunnyday');
		},
		
flags: {},
		name: "Drought",
		rating: 4,
		num: 70,
	},
	dryskin: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Water') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Dry Skin');
				}
				return null;
			}
		},
		onSourceBasePowerPriority: 17,
		onSourceBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Fire') {
				return this.chainModify(1.25);
			}
		},
		onWeather(target, source, effect) {
			if (target.hasItem('utilityumbrella')) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.baseMaxhp / 8);
			} else if (effect.id === 'sunnyday' || effect.id === 'desolateland') {
				this.damage(target.baseMaxhp / 8, target, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Dry Skin",
		rating: 3,
		num: 87,
	},
	earlybird: {
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Early Bird",
		// Implemented in statuses.js
		rating: 1.5,
		num: 48,
	},
	eartheater: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Ground') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Earth Eater');
				}
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Earth Eater",
		rating: 3.5,
		num: 297,
	},
	effectspore: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target) && !source.status && source.runStatusImmunity('powder')) {
				const r = this.random(100);
				if (r < 11) {
					source.setStatus('slp', target);
				} else if (r < 21) {
					source.setStatus('par', target);
				} else if (r < 30) {
					source.setStatus('psn', target);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Effect Spore",
		rating: 2,
		num: 27,
	},
	electricsurge: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.field.setTerrain('electricterrain');
		},
		
flags: {},
		name: "Electric Surge",
		rating: 4,
		num: 226,
	},
	electromorphosis: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			target.addVolatile('charge');
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Electromorphosis",
		rating: 3,
		num: 280,
	},
	embodyaspectcornerstone: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.baseSpecies.name === 'Ogerpon-Cornerstone-Tera' && pokemon.terastallized &&
				this.effectState.embodied !== pokemon.previouslySwitchedIn) {
				this.effectState.embodied = pokemon.previouslySwitchedIn;
				this.boost({ def: 1 }, pokemon);
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Cornerstone)",
		rating: 3.5,
		num: 304,
	},
	embodyaspecthearthflame: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.baseSpecies.name === 'Ogerpon-Hearthflame-Tera' && pokemon.terastallized &&
				this.effectState.embodied !== pokemon.previouslySwitchedIn) {
				this.effectState.embodied = pokemon.previouslySwitchedIn;
				this.boost({ atk: 1 }, pokemon);
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Hearthflame)",
		rating: 3.5,
		num: 303,
	},
	embodyaspectteal: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.baseSpecies.name === 'Ogerpon-Teal-Tera' && pokemon.terastallized &&
				this.effectState.embodied !== pokemon.previouslySwitchedIn) {
				this.effectState.embodied = pokemon.previouslySwitchedIn;
				this.boost({ spe: 1 }, pokemon);
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Teal)",
		rating: 3.5,
		num: 301,
	},
	embodyaspectwellspring: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.baseSpecies.name === 'Ogerpon-Wellspring-Tera' && pokemon.terastallized &&
				this.effectState.embodied !== pokemon.previouslySwitchedIn) {
				this.effectState.embodied = pokemon.previouslySwitchedIn;
				this.boost({ spd: 1 }, pokemon);
			}
		},
	
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Embody Aspect (Wellspring)",
		rating: 3.5,
		num: 302,
	},
	emergencyexit: {
		onEmergencyExit(target) {
			if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) return;
			for (const side of this.sides) {
				for (const active of side.active) {
					active.switchFlag = false;
				}
			}
			target.switchFlag = true;
			this.add('-activate', target, 'ability: Emergency Exit');
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Emergency Exit",
		rating: 1,
		num: 194,
	},
	fairyaura: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Fairy Aura');
		},
		onAnyBasePowerPriority: 20,
		onAnyBasePower(basePower, source, target, move) {
			if (target === source || move.category === 'Status' || move.type !== 'Fairy') return;
			if (!move.auraBooster?.hasAbility('Fairy Aura')) move.auraBooster = this.effectState.target;
			if (move.auraBooster !== this.effectState.target) return;
			return this.chainModify([move.hasAuraBreak ? 3072 : 5448, 4096]);
		},
		
flags: {},
		name: "Fairy Aura",
		rating: 3,
		num: 187,
	},
	filter: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Filter neutralize');
				return this.chainModify(0.75);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Filter",
		rating: 3,
		num: 111,
	},
	flamebody: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.trySetStatus('brn', target);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Flame Body",
		rating: 2,
		num: 49,
	},
	flareboost: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (attacker.status === 'brn' && move.category === 'Special') {
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Flare Boost",
		rating: 2,
		num: 138,
	},
	flashfire: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Fire') {
				move.accuracy = true;
				if (!target.addVolatile('flashfire')) {
					this.add('-immune', target, '[from] ability: Flash Fire');
				}
				return null;
			}
		},
		onEnd(pokemon) {
			pokemon.removeVolatile('flashfire');
		},
		condition: {
			noCopy: true, // doesn't get copied by Baton Pass
			onStart(target) {
				this.add('-start', target, 'ability: Flash Fire');
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, attacker, defender, move) {
				if (move.type === 'Fire' && attacker.hasAbility('flashfire')) {
					this.debug('Flash Fire boost');
					return this.chainModify(1.5);
				}
			},
			onModifySpAPriority: 5,
			onModifySpA(atk, attacker, defender, move) {
				if (move.type === 'Fire' && attacker.hasAbility('flashfire')) {
					this.debug('Flash Fire boost');
					return this.chainModify(1.5);
				}
			},
			onEnd(target) {
				this.add('-end', target, 'ability: Flash Fire', '[silent]');
			},
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Flash Fire",
		rating: 3.5,
		num: 18,
	},
	flowergift: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (!pokemon.isActive || pokemon.baseSpecies.baseSpecies !== 'Cherrim' || pokemon.transformed) return;
			if (!pokemon.hp) return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				if (pokemon.species.id !== 'cherrimsunshine') {
					pokemon.formeChange('Cherrim-Sunshine', this.effect, false, '0', '[msg]');
				}
			} else {
				if (pokemon.species.id === 'cherrimsunshine') {
					pokemon.formeChange('Cherrim', this.effect, false, '0', '[msg]');
				}
			}
		},
		onAllyModifyAtkPriority: 3,
		onAllyModifyAtk(atk, pokemon) {
			if (this.effectState.target.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onAllyModifySpDPriority: 4,
		onAllyModifySpD(spd, pokemon) {
			if (this.effectState.target.baseSpecies.baseSpecies !== 'Cherrim') return;
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, breakable: 1 },
		name: "Flower Gift",
		rating: 1,
		num: 122,
	},
	flowerveil: {
		onAllyTryBoost(boost, target, source, effect) {
			if ((source && target === source) || !target.hasType('Grass')) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries) {
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Flower Veil', `[of] ${effectHolder}`);
			}
		},
		onAllySetStatus(status, target, source, effect) {
			if (target.hasType('Grass') && source && target !== source && effect && effect.id !== 'yawn') {
				this.debug('interrupting setStatus with Flower Veil');
				if (effect.name === 'Synchronize' || (effect.effectType === 'Move' && !effect.secondaries)) {
					const effectHolder = this.effectState.target;
					this.add('-block', target, 'ability: Flower Veil', `[of] ${effectHolder}`);
				}
				return null;
			}
		},
		onAllyTryAddVolatile(status, target) {
			if (target.hasType('Grass') && status.id === 'yawn') {
				this.debug('Flower Veil blocking yawn');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Flower Veil', `[of] ${effectHolder}`);
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Flower Veil",
		rating: 0,
		num: 166,
	},
	fluffy: {
		onSourceModifyDamage(damage, source, target, move) {
			let mod = 1;
			if (move.type === 'Fire') mod *= 2;
			if (move.flags['contact']) mod /= 2;
			return this.chainModify(mod);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Fluffy",
		rating: 3.5,
		num: 218,
	},
	forecast: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Castform' || pokemon.transformed) return;
			let forme = null;
			switch (pokemon.effectiveWeather()) {
			case 'sunnyday':
			case 'desolateland':
				if (pokemon.species.id !== 'castformsunny') forme = 'Castform-Sunny';
				break;
			case 'raindance':
			case 'primordialsea':
				if (pokemon.species.id !== 'castformrainy') forme = 'Castform-Rainy';
				break;
			case 'hail':
			case 'snowscape':
				if (pokemon.species.id !== 'castformsnowy') forme = 'Castform-Snowy';
				break;
			default:
				if (pokemon.species.id !== 'castform') forme = 'Castform';
				break;
			}
			if (pokemon.isActive && forme) {
				pokemon.formeChange(forme, this.effect, false, '0', '[msg]');
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Forecast",
		rating: 2,
		num: 59,
	},
	forewarn: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			let warnMoves: (Move | Pokemon)[][] = [];
			let warnBp = 1;
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					let bp = move.basePower;
					if (move.ohko) bp = 150;
					if (move.id === 'counter' || move.id === 'metalburst' || move.id === 'mirrorcoat') bp = 120;
					if (bp === 1) bp = 80;
					if (!bp && move.category !== 'Status') bp = 80;
					if (bp > warnBp) {
						warnMoves = [[move, target]];
						warnBp = bp;
					} else if (bp === warnBp) {
						warnMoves.push([move, target]);
					}
				}
			}
			if (!warnMoves.length) return;
			const [warnMoveName, warnTarget] = this.sample(warnMoves);
			this.add('-activate', pokemon, 'ability: Forewarn', warnMoveName, `[of] ${warnTarget}`);
		},
		
flags: {},
		name: "Forewarn",
		rating: 0.5,
		num: 108,
	},
	friendguard: {
		onAnyModifyDamage(damage, source, target, move) {
			if (target !== this.effectState.target && target.isAlly(this.effectState.target)) {
				this.debug('Friend Guard weaken');
				return this.chainModify(0.75);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Friend Guard",
		rating: 0,
		num: 132,
	},
	frisk: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			for (const target of pokemon.foes()) {
				if (target.item) {
					this.add('-item', target, target.getItem().name, '[from] ability: Frisk', `[of] ${pokemon}`);
				}
			}
		},
		
flags: {},
		name: "Frisk",
		rating: 1.5,
		num: 119,
	},
	fullmetalbody: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: Full Metal Body", `[of] ${target}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Full Metal Body",
		rating: 2,
		num: 230,
	},
	furcoat: {
		onModifyDefPriority: 6,
		onModifyDef(def) {
			return this.chainModify(2);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Fur Coat",
		rating: 4,
		num: 169,
	},
	galewings: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.type === 'Flying' && pokemon.hp === pokemon.maxhp) return priority + 1;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Gale Wings",
		rating: 1.5,
		num: 177,
	},
	galvanize: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Electric';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Galvanize",
		rating: 4,
		num: 206,
	},
	gluttony: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			pokemon.abilityState.gluttony = true;
		},
		onDamage(item, pokemon) {
			pokemon.abilityState.gluttony = true;
		},
		
flags: {},
		name: "Gluttony",
		rating: 1.5,
		num: 82,
	},
	goodasgold: {
		onTryHit(target, source, move) {
			if (move.category === 'Status' && target !== source) {
				this.add('-immune', target, '[from] ability: Good as Gold');
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Good as Gold",
		rating: 5,
		num: 283,
	},
	gooey: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.add('-ability', target, 'Gooey');
				this.boost({ spe: -1 }, source, target, null, true);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Gooey",
		rating: 2,
		num: 183,
	},
	gorillatactics: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			pokemon.abilityState.choiceLock = "";
		},
		onBeforeMove(pokemon, target, move) {
			if (move.isZOrMaxPowered || move.id === 'struggle') return;
			if (pokemon.abilityState.choiceLock && pokemon.abilityState.choiceLock !== move.id) {
				// Fails unless ability is being ignored (these events will not run), no PP lost.
				this.addMove('move', pokemon, move.name);
				this.attrLastMove('[still]');
				this.debug("Disabled by Gorilla Tactics");
				this.add('-fail', pokemon);
				return false;
			}
		},
		onModifyMove(move, pokemon) {
			if (pokemon.abilityState.choiceLock || move.isZOrMaxPowered || move.id === 'struggle') return;
			pokemon.abilityState.choiceLock = move.id;
		},
		onModifyAtkPriority: 1,
		onModifyAtk(atk, pokemon) {
			if (pokemon.volatiles['dynamax']) return;
			// PLACEHOLDER
			this.debug('Gorilla Tactics Atk Boost');
			return this.chainModify(1.5);
		},
		onDisableMove(pokemon) {
			if (!pokemon.abilityState.choiceLock) return;
			if (pokemon.volatiles['dynamax']) return;
			for (const moveSlot of pokemon.moveSlots) {
				if (moveSlot.id !== pokemon.abilityState.choiceLock) {
					pokemon.disableMove(moveSlot.id, false, this.effectState.sourceEffect);
				}
			}
		},
		onEnd(pokemon) {
			pokemon.abilityState.choiceLock = "";
		},
		
flags: {},
		name: "Gorilla Tactics",
		rating: 4.5,
		num: 255,
	},
	grasspelt: {
		onModifyDefPriority: 6,
		onModifyDef(pokemon) {
			if (this.field.isTerrain('grassyterrain')) return this.chainModify(1.5);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Grass Pelt",
		rating: 0.5,
		num: 179,
	},
	grassysurge: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.field.setTerrain('grassyterrain');
		},
		
flags: {},
		name: "Grassy Surge",
		rating: 4,
		num: 229,
	},
	grimneigh: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ spa: length }, source);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Grim Neigh",
		rating: 3,
		num: 265,
	},
	guarddog: {
		onDragOutPriority: 1,
		onDragOut(pokemon) {
			this.add('-activate', pokemon, 'ability: Guard Dog');
			return null;
		},
		onTryBoostPriority: 2,
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.boost({ atk: 1 }, target, target, null, false, true);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Guard Dog",
		rating: 2,
		num: 275,
	},
	gulpmissile: {
		onDamagingHit(damage, target, source, move) {
			if (!source.hp || !source.isActive || target.isSemiInvulnerable()) return;
			if (['cramorantgulping', 'cramorantgorging'].includes(target.species.id)) {
				this.damage(source.baseMaxhp / 4, source, target);
				if (target.species.id === 'cramorantgulping') {
					this.boost({ def: -1 }, source, target, null, true);
				} else {
					source.trySetStatus('par', target, move);
				}
				target.formeChange('cramorant', move);
			}
		},
		// The Dive part of this mechanic is implemented in Dive's `onTryMove` in moves.ts
		onSourceTryPrimaryHit(target, source, effect) {
			if (effect?.id === 'surf' && source.hasAbility('gulpmissile') && source.species.name === 'Cramorant') {
				const forme = source.hp <= source.maxhp / 2 ? 'cramorantgorging' : 'cramorantgulping';
				source.formeChange(forme, effect);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { cantsuppress: 1, notransform: 1 },
		name: "Gulp Missile",
		rating: 2.5,
		num: 241,
	},
	guts: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Guts",
		rating: 3.5,
		num: 62,
	},
	hadronengine: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (!this.field.setTerrain('electricterrain') && this.field.isTerrain('electricterrain')) {
				this.add('-activate', pokemon, 'ability: Hadron Engine');
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (this.field.isTerrain('electricterrain')) {
				this.debug('Hadron Engine boost');
				return this.chainModify([5461, 4096]);
			}
		},
		
flags: {},
		name: "Hadron Engine",
		rating: 4.5,
		num: 289,
	},
	harvest: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (this.field.isWeather(['sunnyday', 'desolateland']) || this.randomChance(1, 2)) {
				if (pokemon.hp && !pokemon.item && this.dex.items.get(pokemon.lastItem).isBerry) {
					pokemon.setItem(pokemon.lastItem);
					pokemon.lastItem = '';
					this.add('-item', pokemon, pokemon.getItem(), '[from] ability: Harvest');
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Harvest",
		rating: 2.5,
		num: 139,
	},
	healer: {
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			for (const allyActive of pokemon.adjacentAllies()) {
				if (allyActive.status && this.randomChance(3, 10)) {
					this.add('-activate', pokemon, 'ability: Healer');
					allyActive.cureStatus();
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Healer",
		rating: 0,
		num: 131,
	},
	heatproof: {
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Heatproof Atk weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Heatproof SpA weaken');
				return this.chainModify(0.5);
			}
		},
		onDamage(damage, target, source, effect) {
			if (effect && effect.id === 'brn') {
				return damage / 2;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Heatproof",
		rating: 2,
		num: 85,
	},
	heavymetal: {
		onModifyWeightPriority: 1,
		onModifyWeight(weighthg) {
			return weighthg * 2;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Heavy Metal",
		rating: 0,
		num: 134,
	},
	honeygather: {
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Honey Gather",
		rating: 0,
		num: 118,
	},
	hospitality: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			for (const ally of pokemon.adjacentAllies()) {
				this.heal(ally.baseMaxhp / 4, ally, pokemon);
			}
		},
		
flags: {},
		name: "Hospitality",
		rating: 0,
		num: 299,
	},
	hugepower: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.chainModify(2);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Huge Power",
		rating: 5,
		num: 37,
	},
	hungerswitch: {
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.species.baseSpecies !== 'Morpeko' || pokemon.terastallized) return;
			const targetForme = pokemon.species.name === 'Morpeko' ? 'Morpeko-Hangry' : 'Morpeko';
			pokemon.formeChange(targetForme);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Hunger Switch",
		rating: 1,
		num: 258,
	},
	hustle: {
		// This should be applied directly to the stat as opposed to chaining with the others
		onModifyAtkPriority: 5,
		onModifyAtk(atk) {
			return this.modify(atk, 1.5);
		},
		onSourceModifyAccuracyPriority: -1,
		onSourceModifyAccuracy(accuracy, target, source, move) {
			if (move.category === 'Physical' && typeof accuracy === 'number') {
				return this.chainModify([3277, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Hustle",
		rating: 3.5,
		num: 55,
	},
	hydration: {
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if (pokemon.status && ['raindance', 'primordialsea'].includes(pokemon.effectiveWeather())) {
				this.debug('hydration');
				this.add('-activate', pokemon, 'ability: Hydration');
				pokemon.cureStatus();
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Hydration",
		rating: 1.5,
		num: 93,
	},
	hypercutter: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.atk && boost.atk < 0) {
				delete boost.atk;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "Attack", "[from] ability: Hyper Cutter", `[of] ${target}`);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Hyper Cutter",
		rating: 1.5,
		num: 52,
	},
	icebody: {
		onWeather(target, source, effect) {
			if (effect.id === 'hail' || effect.id === 'snowscape') {
				this.heal(target.baseMaxhp / 16);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Ice Body",
		rating: 1,
		num: 115,
	},
	iceface: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.field.isWeather(['hail', 'snowscape']) && pokemon.species.id === 'eiscuenoice') {
				this.add('-activate', pokemon, 'ability: Ice Face');
				this.effectState.busted = false;
				pokemon.formeChange('Eiscue', this.effect, true);
			}
		},
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && effect.category === 'Physical' && target.species.id === 'eiscue') {
				this.add('-activate', target, 'ability: Ice Face');
				this.effectState.busted = true;
				return 0;
			}
		},
		onCriticalHit(target, type, move) {
			if (!target) return;
			if (move.category !== 'Physical' || target.species.id !== 'eiscue') return;
			if (target.volatiles['substitute'] && !(move.flags['bypasssub'] || move.infiltrates)) return;
			if (!target.runImmunity(move)) return;
			return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target) return;
			if (move.category !== 'Physical' || target.species.id !== 'eiscue') return;

			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return 0;
		},
		onUpdate(pokemon) {
			if (pokemon.species.id === 'eiscue' && this.effectState.busted) {
				pokemon.formeChange('Eiscue-Noice', this.effect, true);
			}
		},
		onWeatherChange(pokemon, source, sourceEffect) {
			// snow/hail resuming because Cloud Nine/Air Lock ended does not trigger Ice Face
			if ((sourceEffect as Ability)?.suppressWeather) return;
			if (!pokemon.hp) return;
			if (this.field.isWeather(['hail', 'snowscape']) && pokemon.species.id === 'eiscuenoice') {
				this.add('-activate', pokemon, 'ability: Ice Face');
				this.effectState.busted = false;
				pokemon.formeChange('Eiscue', this.effect, true);
			}
		},
		
flags: {
			failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1,
			breakable: 1, notransform: 1,
		},
		name: "Ice Face",
		rating: 3,
		num: 248,
	},
	icescales: {
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category === 'Special') {
				return this.chainModify(0.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Ice Scales",
		rating: 4,
		num: 246,
	},
	illuminate: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Illuminate", `[of] ${target}`);
				}
			}
		},
		onModifyMove(move) {
			move.ignoreEvasion = true;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Illuminate",
		rating: 0.5,
		num: 35,
	},
	illusion: {
		onBeforeSwitchIn(pokemon) {
			pokemon.illusion = null;
			// yes, you can Illusion an active pokemon but only if it's to your right
			for (let i = pokemon.side.pokemon.length - 1; i > pokemon.position; i--) {
				const possibleTarget = pokemon.side.pokemon[i];
				if (!possibleTarget.fainted) {
					// If Ogerpon is in the last slot while the Illusion Pokemon is Terastallized
					// Illusion will not disguise as anything
					if (!pokemon.terastallized || !['Ogerpon', 'Terapagos'].includes(possibleTarget.species.baseSpecies)) {
						pokemon.illusion = possibleTarget;
					}
					break;
				}
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (target.illusion) {
				this.singleEvent('End', this.dex.abilities.get('Illusion'), target.abilityState, target, source, move);
			}
		},
		onEnd(pokemon) {
			if (pokemon.illusion) {
				this.debug('illusion cleared');
				pokemon.illusion = null;
				const details = pokemon.getUpdatedDetails();
				this.add('replace', pokemon, details);
				this.add('-end', pokemon, 'Illusion');
				if (this.ruleTable.has('illusionlevelmod')) {
					this.hint("Illusion Level Mod is active, so this Pok\u00e9mon's true level was hidden.", true);
				}
			}
		},
		onFaint(pokemon) {
			pokemon.illusion = null;
		},
		onStart(pokemon) {
  let cur;
  if (pokemon.illusion) {
    // Show the typing of the disguise instead of the true typing
    cur = pokemon.illusion.getTypes(true).join('/');
  } else {
    cur = pokemon.getTypes(true).join('/');
  }
  this.add('-start', pokemon, 'typechange', cur);
},

flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Illusion",
		rating: 4.5,
		num: 149,
	},
	immunity: {
		onUpdate(pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox') {
				this.add('-activate', pokemon, 'ability: Immunity');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'psn' && status.id !== 'tox') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Immunity');
			}
			return false;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Immunity",
		rating: 2,
		num: 17,
	},
	imposter: {
		onSwitchIn(pokemon) {
			// Imposter does not activate when Skill Swapped or when Neutralizing Gas leaves the field
			// Imposter copies across in doubles/triples
			// (also copies across in multibattle and diagonally in free-for-all,
			// but side.foe already takes care of those)
			const target = pokemon.side.foe.active[pokemon.side.foe.active.length - 1 - pokemon.position];
			if (target) {
				pokemon.transformInto(target, this.dex.abilities.get('imposter'));
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Imposter",
		rating: 5,
		num: 150,
	},
	infiltrator: {
		onModifyMove(move) {
			move.infiltrates = true;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Infiltrator",
		rating: 2.5,
		num: 151,
	},
	innardsout: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (!target.hp) {
				this.damage(target.getUndynamaxedHP(damage), source, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Innards Out",
		rating: 4,
		num: 215,
	},
	innerfocus: {
		onTryAddVolatile(status, pokemon) {
			if (status.id === 'flinch') return null;
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Inner Focus', `[of] ${target}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Inner Focus",
		rating: 1,
		num: 39,
	},
	insomnia: {
		onUpdate(pokemon) {
			if (pokemon.status === 'slp') {
				this.add('-activate', pokemon, 'ability: Insomnia');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'slp') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Insomnia');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Insomnia');
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Insomnia",
		rating: 1.5,
		num: 15,
	},
	intimidate: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			let activated = false;
			for (const target of pokemon.adjacentFoes()) {
				if (!activated) {
					this.add('-ability', pokemon, 'Intimidate', 'boost');
					activated = true;
				}
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({ atk: -1 }, target, pokemon, null, true);
				}
			}
		},
		
flags: {},
		name: "Intimidate",
		rating: 3.5,
		num: 22,
	},
	intrepidsword: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.swordBoost) return;
			pokemon.swordBoost = true;
			this.boost({ atk: 1 }, pokemon);
		},
		
flags: {},
		name: "Intrepid Sword",
		rating: 4,
		num: 234,
	},
	ironbarbs: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 8, source, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Iron Barbs",
		rating: 2.5,
		num: 160,
	},
	ironfist: {
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['punch']) {
				this.debug('Iron Fist boost');
				return this.chainModify([4915, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Iron Fist",
		rating: 3,
		num: 89,
	},
	justified: {
		onDamagingHit(damage, target, source, move) {
			if (move.type === 'Dark') {
				this.boost({ atk: 1 });
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Justified",
		rating: 2.5,
		num: 154,
	},
	keeneye: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Keen Eye", `[of] ${target}`);
				}
			}
		},
		onModifyMove(move) {
			move.ignoreEvasion = true;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Keen Eye",
		rating: 0.5,
		num: 51,
	},
	klutz: {
		// Klutz isn't technically active immediately in-game, but it activates early enough to beat all items
		// we should keep an eye out in future gens for items that activate on switch-in before Unnerve
		onSwitchInPriority: 1,
		// Item suppression implemented in Pokemon.ignoringItem() within sim/pokemon.js
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.singleEvent('End', pokemon.getItem(), pokemon.itemState, pokemon);
		},
		
flags: {},
		name: "Klutz",
		rating: -1,
		num: 103,
	},
	leafguard: {
		onSetStatus(status, target, source, effect) {
			if (['sunnyday', 'desolateland'].includes(target.effectiveWeather())) {
				if ((effect as Move)?.status) {
					this.add('-immune', target, '[from] ability: Leaf Guard');
				}
				return false;
			}
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn' && ['sunnyday', 'desolateland'].includes(target.effectiveWeather())) {
				this.add('-immune', target, '[from] ability: Leaf Guard');
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Leaf Guard",
		rating: 0.5,
		num: 102,
	},
	levitate: {
		// airborneness implemented in sim/pokemon.js:Pokemon#isGrounded
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Levitate",
		rating: 3.5,
		num: 26,
	},
	libero: {
		onPrepareHit(source, target, move) {
			if (this.effectState.libero === source.previouslySwitchedIn) return;
			if (move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch' || move.callsMove) return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.effectState.libero = source.previouslySwitchedIn;
				this.add('-start', source, 'typechange', type, '[from] ability: Libero');
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Libero",
		rating: 4,
		num: 236,
	},
	lightmetal: {
		onModifyWeight(weighthg) {
			return this.trunc(weighthg / 2);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Light Metal",
		rating: 1,
		num: 135,
	},
	lightningrod: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Electric') {
				if (!this.boost({ spa: 1 })) {
					this.add('-immune', target, '[from] ability: Lightning Rod');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			if (move.type !== 'Electric' || move.flags['pledgecombo']) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Lightning Rod');
				}
				return this.effectState.target;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Lightning Rod",
		rating: 3,
		num: 31,
	},
	limber: {
		onUpdate(pokemon) {
			if (pokemon.status === 'par') {
				this.add('-activate', pokemon, 'ability: Limber');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'par') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Limber');
			}
			return false;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Limber",
		rating: 2,
		num: 7,
	},
	lingeringaroma: {
		onDamagingHit(damage, target, source, move) {
			const sourceAbility = source.getAbility();
			if (sourceAbility.flags['cantsuppress'] || sourceAbility.id === 'lingeringaroma') {
				return;
			}
			if (this.checkMoveMakesContact(move, source, target, !source.isAlly(target))) {
				const oldAbility = source.setAbility('lingeringaroma', target);
				if (oldAbility) {
					this.add('-activate', target, 'ability: Lingering Aroma', this.dex.abilities.get(oldAbility).name, `[of] ${source}`);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Lingering Aroma",
		rating: 2,
		num: 268,
	},
	liquidooze: {
		onSourceTryHeal(damage, target, source, effect) {
			this.debug(`Heal is occurring: ${target} <- ${source} :: ${effect.id}`);
			const canOoze = ['drain', 'leechseed', 'strengthsap'];
			if (canOoze.includes(effect.id)) {
				this.damage(damage);
				return 0;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Liquid Ooze",
		rating: 2.5,
		num: 64,
	},
	liquidvoice: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			if (move.flags['sound'] && !pokemon.volatiles['dynamax']) { // hardcode
				move.type = 'Water';
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Liquid Voice",
		rating: 1.5,
		num: 204,
	},
	longreach: {
		onModifyMove(move) {
			delete move.flags['contact'];
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Long Reach",
		rating: 1,
		num: 203,
	},
	magicbounce: {
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target === source || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, { target: source });
			return null;
		},
		onAllyTryHitSide(target, source, move) {
			if (target.isAlly(source) || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, this.effectState.target, { target: source });
			move.hasBounced = true; // only bounce once in free-for-all battles
			return null;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Magic Bounce",
		rating: 4,
		num: 156,
	},
	magicguard: {
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				if (effect.effectType === 'Ability') this.add('-activate', source, 'ability: ' + effect.name);
				return false;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Magic Guard",
		rating: 4,
		num: 98,
	},
	magician: {
		onAfterMoveSecondarySelf(source, target, move) {
			if (!move || source.switchFlag === true || !move.hitTargets || source.item || source.volatiles['gem'] ||
				move.id === 'fling' || move.category === 'Status') return;
			const hitTargets = move.hitTargets;
			this.speedSort(hitTargets);
			for (const pokemon of hitTargets) {
				if (pokemon !== source) {
					const yourItem = pokemon.takeItem(source);
					if (!yourItem) continue;
					if (!source.setItem(yourItem)) {
						pokemon.item = yourItem.id; // bypass setItem so we don't break choicelock or anything
						continue;
					}
					this.add('-item', source, yourItem, '[from] ability: Magician', `[of] ${pokemon}`);
					return;
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Magician",
		rating: 1,
		num: 170,
	},
	magmaarmor: {
		onUpdate(pokemon) {
			if (pokemon.status === 'frz') {
				this.add('-activate', pokemon, 'ability: Magma Armor');
				pokemon.cureStatus();
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'frz') return false;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Magma Armor",
		rating: 0.5,
		num: 40,
	},
	magnetpull: {
		onFoeTrapPokemon(pokemon) {
			if (pokemon.hasType('Steel') && pokemon.isAdjacent(this.effectState.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (!pokemon.knownType || pokemon.hasType('Steel')) {
				pokemon.maybeTrapped = true;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Magnet Pull",
		rating: 4,
		num: 42,
	},
	marvelscale: {
		onModifyDefPriority: 6,
		onModifyDef(def, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Marvel Scale",
		rating: 2.5,
		num: 63,
	},
	megalauncher: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['pulse']) {
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Mega Launcher",
		rating: 3,
		num: 178,
	},
	merciless: {
		onModifyCritRatio(critRatio, source, target) {
			if (target && ['psn', 'tox'].includes(target.status)) return 5;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Merciless",
		rating: 1.5,
		num: 196,
	},
	mimicry: {
		onSwitchInPriority: -1,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.singleEvent('TerrainChange', this.effect, this.effectState, pokemon);
		},
		onTerrainChange(pokemon) {
			let types;
			switch (this.field.terrain) {
			case 'electricterrain':
				types = ['Electric'];
				break;
			case 'grassyterrain':
				types = ['Grass'];
				break;
			case 'mistyterrain':
				types = ['Fairy'];
				break;
			case 'psychicterrain':
				types = ['Psychic'];
				break;
			default:
				types = pokemon.baseSpecies.types;
			}
			const oldTypes = pokemon.getTypes();
			if (oldTypes.join() === types.join() || !pokemon.setType(types)) return;
			if (this.field.terrain || pokemon.transformed) {
				this.add('-start', pokemon, 'typechange', types.join('/'), '[from] ability: Mimicry');
				if (!this.field.terrain) this.hint("Transform Mimicry changes you to your original un-transformed types.");
			} else {
				this.add('-activate', pokemon, 'ability: Mimicry');
				this.add('-end', pokemon, 'typechange', '[silent]');
			}
		},
		
flags: {},
		name: "Mimicry",
		rating: 0,
		num: 250,
	},
	mindseye: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add("-fail", target, "unboost", "accuracy", "[from] ability: Mind's Eye", `[of] ${target}`);
				}
			}
		},
		onModifyMovePriority: -5,
		onModifyMove(move) {
			move.ignoreEvasion = true;
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Mind's Eye",
		rating: 0,
		num: 300,
	},
	minus: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			for (const allyActive of pokemon.allies()) {
				if (allyActive.hasAbility(['minus', 'plus'])) {
					return this.chainModify(1.5);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Minus",
		rating: 0,
		num: 58,
	},
	mirrorarmor: {
		onTryBoost(boost, target, source, effect) {
			// Don't bounce self stat changes, or boosts that have already bounced
			if (!source || target === source || !boost || effect.name === 'Mirror Armor') return;
			let b: BoostID;
			for (b in boost) {
				if (boost[b]! < 0) {
					if (target.boosts[b] === -6) continue;
					const negativeBoost: SparseBoostsTable = {};
					negativeBoost[b] = boost[b];
					delete boost[b];
					if (source.hp) {
						this.add('-ability', target, 'Mirror Armor');
						this.boost(negativeBoost, source, target, null, true);
					}
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Mirror Armor",
		rating: 2,
		num: 240,
	},
	mistysurge: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.field.setTerrain('mistyterrain');
		},
		
flags: {},
		name: "Misty Surge",
		rating: 3.5,
		num: 228,
	},
	moldbreaker: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.add('-ability', pokemon, 'Mold Breaker');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		
flags: {},
		name: "Mold Breaker",
		rating: 3,
		num: 104,
	},
	moody: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			let stats: BoostID[] = [];
			const boost: SparseBoostsTable = {};
			let statPlus: BoostID;
			for (statPlus in pokemon.boosts) {
				if (statPlus === 'accuracy' || statPlus === 'evasion') continue;
				if (pokemon.boosts[statPlus] < 6) {
					stats.push(statPlus);
				}
			}
			let randomStat: BoostID | undefined = stats.length ? this.sample(stats) : undefined;
			if (randomStat) boost[randomStat] = 2;

			stats = [];
			let statMinus: BoostID;
			for (statMinus in pokemon.boosts) {
				if (statMinus === 'accuracy' || statMinus === 'evasion') continue;
				if (pokemon.boosts[statMinus] > -6 && statMinus !== randomStat) {
					stats.push(statMinus);
				}
			}
			randomStat = stats.length ? this.sample(stats) : undefined;
			if (randomStat) boost[randomStat] = -1;

			this.boost(boost, pokemon, pokemon);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Moody",
		rating: 5,
		num: 141,
	},
	motordrive: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Electric') {
				if (!this.boost({ spe: 1 })) {
					this.add('-immune', target, '[from] ability: Motor Drive');
				}
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Motor Drive",
		rating: 3,
		num: 78,
	},
	moxie: {
		onSourceAfterFaint(length, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({ atk: length }, source);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Moxie",
		rating: 3,
		num: 153,
	},
	multiscale: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug('Multiscale weaken');
				return this.chainModify(0.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Multiscale",
		rating: 3.5,
		num: 136,
	},
	multitype: {
		// Multitype's type-changing itself is implemented in statuses.js
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Multitype",
		rating: 4,
		num: 121,
	},
	mummy: {
		onDamagingHit(damage, target, source, move) {
			const sourceAbility = source.getAbility();
			if (sourceAbility.flags['cantsuppress'] || sourceAbility.id === 'mummy') {
				return;
			}
			if (this.checkMoveMakesContact(move, source, target, !source.isAlly(target))) {
				const oldAbility = source.setAbility('mummy', target);
				if (oldAbility) {
					this.add('-activate', target, 'ability: Mummy', this.dex.abilities.get(oldAbility).name, `[of] ${source}`);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Mummy",
		rating: 2,
		num: 152,
	},
	myceliummight: {
		onFractionalPriorityPriority: -1,
		onFractionalPriority(priority, pokemon, target, move) {
			if (move.category === 'Status') {
				return -0.1;
			}
		},
		onModifyMove(move) {
			if (move.category === 'Status') {
				move.ignoreAbility = true;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Mycelium Might",
		rating: 2,
		num: 298,
	},
	naturalcure: {
		onCheckShow(pokemon) {
			// This is complicated
			// For the most part, in-game, it's obvious whether or not Natural Cure activated,
			// since you can see how many of your opponent's pokemon are statused.
			// The only ambiguous situation happens in Doubles/Triples, where multiple pokemon
			// that could have Natural Cure switch out, but only some of them get cured.
			if (pokemon.side.active.length === 1) return;
			if (pokemon.showCure === true || pokemon.showCure === false) return;

			const cureList = [];
			let noCureCount = 0;
			for (const curPoke of pokemon.side.active) {
				// pokemon not statused
				if (!curPoke?.status) {
					// this.add('-message', "" + curPoke + " skipped: not statused or doesn't exist");
					continue;
				}
				if (curPoke.showCure) {
					// this.add('-message', "" + curPoke + " skipped: Natural Cure already known");
					continue;
				}
				const species = curPoke.species;
				// pokemon can't get Natural Cure
				if (!Object.values(species.abilities).includes('Natural Cure')) {
					// this.add('-message', "" + curPoke + " skipped: no Natural Cure");
					continue;
				}
				// pokemon's ability is known to be Natural Cure
				if (!species.abilities['1'] && !species.abilities['H']) {
					// this.add('-message', "" + curPoke + " skipped: only one ability");
					continue;
				}
				// pokemon isn't switching this turn
				if (curPoke !== pokemon && !this.queue.willSwitch(curPoke)) {
					// this.add('-message', "" + curPoke + " skipped: not switching");
					continue;
				}

				if (curPoke.hasAbility('naturalcure')) {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (and is)");
					cureList.push(curPoke);
				} else {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (but isn't)");
					noCureCount++;
				}
			}

			if (!cureList.length || !noCureCount) {
				// It's possible to know what pokemon were cured
				for (const pkmn of cureList) {
					pkmn.showCure = true;
				}
			} else {
				// It's not possible to know what pokemon were cured

				// Unlike a -hint, this is real information that battlers need, so we use a -message
				this.add('-message', `(${cureList.length} of ${pokemon.side.name}'s pokemon ${cureList.length === 1 ? "was" : "were"} cured by Natural Cure.)`);

				for (const pkmn of cureList) {
					pkmn.showCure = false;
				}
			}
		},
		onSwitchOut(pokemon) {
			if (!pokemon.status) return;

			// if pokemon.showCure is undefined, it was skipped because its ability
			// is known
			if (pokemon.showCure === undefined) pokemon.showCure = true;

			if (pokemon.showCure) this.add('-curestatus', pokemon, pokemon.status, '[from] ability: Natural Cure');
			pokemon.clearStatus();

			// only reset .showCure if it's false
			// (once you know a Pokemon has Natural Cure, its cures are always known)
			if (!pokemon.showCure) pokemon.showCure = undefined;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Natural Cure",
		rating: 2.5,
		num: 30,
	},
	neuroforce: {
		onModifyDamage(damage, source, target, move) {
			if (move && target.getMoveHitData(move).typeMod > 0) {
				return this.chainModify([5120, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Neuroforce",
		rating: 2.5,
		num: 233,
	},
	neutralizinggas: {
		// Ability suppression implemented in sim/pokemon.ts:Pokemon#ignoringAbility
		onSwitchInPriority: 2,
		onSwitchIn(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
			const base = pokemon.species.types.join('/'); // species types 
			this.add('-start', pokemon, 'typechange', cur);
			this.add('-ability', pokemon, 'Neutralizing Gas');
			pokemon.abilityState.ending = false;
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			for (const target of this.getAllActive()) {
				if (target.hasItem('Ability Shield')) {
					this.add('-block', target, 'item: Ability Shield');
					continue;
				}
				// Can't suppress a Tatsugiri inside of Dondozo already
				if (target.volatiles['commanding']) {
					continue;
				}
				if (target.illusion) {
					this.singleEvent('End', this.dex.abilities.get('Illusion'), target.abilityState, target, pokemon, 'neutralizinggas');
				}
				if (target.volatiles['slowstart']) {
					delete target.volatiles['slowstart'];
					this.add('-end', target, 'Slow Start', '[silent]');
				}
				if (strongWeathers.includes(target.getAbility().id)) {
					this.singleEvent('End', this.dex.abilities.get(target.getAbility().id), target.abilityState, target, pokemon, 'neutralizinggas');
				}
			}
		},
		onEnd(source) {
			if (source.transformed) return;
			for (const pokemon of this.getAllActive()) {
				if (pokemon !== source && pokemon.hasAbility('Neutralizing Gas')) {
					return;
				}
			}
			this.add('-end', source, 'ability: Neutralizing Gas');

			// FIXME this happens before the pokemon switches out, should be the opposite order.
			// Not an easy fix since we cant use a supported event. Would need some kind of special event that
			// gathers events to run after the switch and then runs them when the ability is no longer accessible.
			// (If you're tackling this, do note extreme weathers have the same issue)

			// Mark this pokemon's ability as ending so Pokemon#ignoringAbility skips it
			if (source.abilityState.ending) return;
			source.abilityState.ending = true;
			const sortedActive = this.getAllActive();
			this.speedSort(sortedActive);
			for (const pokemon of sortedActive) {
				if (pokemon !== source) {
					if (pokemon.getAbility().flags['cantsuppress']) continue; // does not interact with e.g Ice Face, Zen Mode
					if (pokemon.hasItem('abilityshield')) continue; // don't restart abilities that weren't suppressed

					// Will be suppressed by Pokemon#ignoringAbility if needed
					this.singleEvent('Start', pokemon.getAbility(), pokemon.abilityState, pokemon);
					if (pokemon.ability === "gluttony") {
						pokemon.abilityState.gluttony = false;
					}
				}
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Neutralizing Gas",
		rating: 3.5,
		num: 256,
	},
	noguard: {
		onAnyInvulnerabilityPriority: 1,
		onAnyInvulnerability(target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) return 0;
		},
		onAnyAccuracy(accuracy, target, source, move) {
			if (move && (source === this.effectState.target || target === this.effectState.target)) {
				return true;
			}
			return accuracy;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "No Guard",
		rating: 4,
		num: 99,
	},
	normalize: {
		onModifyTypePriority: 1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'hiddenpower', 'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'struggle', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (!(move.isZ && move.category !== 'Status') &&
				// TODO: Figure out actual interaction
				(!noModifyType.includes(move.id) || this.activeMove?.isMax) && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Normal';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Normalize",
		rating: 0,
		num: 96,
	},
	oblivious: {
		onUpdate(pokemon) {
			if (pokemon.volatiles['attract']) {
				this.add('-activate', pokemon, 'ability: Oblivious');
				pokemon.removeVolatile('attract');
				this.add('-end', pokemon, 'move: Attract', '[from] ability: Oblivious');
			}
			if (pokemon.volatiles['taunt']) {
				this.add('-activate', pokemon, 'ability: Oblivious');
				pokemon.removeVolatile('taunt');
				// Taunt's volatile already sends the -end message when removed
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'attract') return false;
		},
		onTryHit(pokemon, target, move) {
			if (move.id === 'attract' || move.id === 'captivate' || move.id === 'taunt') {
				this.add('-immune', pokemon, '[from] ability: Oblivious');
				return null;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Oblivious', `[of] ${target}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Oblivious",
		rating: 1.5,
		num: 12,
	},
	opportunist: {
		onFoeAfterBoost(boost, target, source, effect) {
			if (effect?.name === 'Opportunist' || effect?.name === 'Mirror Herb') return;
			if (!this.effectState.boosts) this.effectState.boosts = {} as SparseBoostsTable;
			const boostPlus = this.effectState.boosts;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! > 0) {
					boostPlus[i] = (boostPlus[i] || 0) + boost[i]!;
				}
			}
		},
		onAnySwitchInPriority: -3,
		onAnySwitchIn() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onAnyAfterMega() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onAnyAfterTerastallization() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onAnyAfterMove() {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (!this.effectState.boosts) return;
			this.boost(this.effectState.boosts, this.effectState.target);
			delete this.effectState.boosts;
		},
		onEnd() {
			delete this.effectState.boosts;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Opportunist",
		rating: 3,
		num: 290,
	},
	orichalcumpulse: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.field.setWeather('sunnyday')) {
				this.add('-activate', pokemon, 'Orichalcum Pulse', '[source]');
			} else if (this.field.isWeather('sunnyday')) {
				this.add('-activate', pokemon, 'ability: Orichalcum Pulse');
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				this.debug('Orichalcum boost');
				return this.chainModify([5461, 4096]);
			}
		},
		
flags: {},
		name: "Orichalcum Pulse",
		rating: 4.5,
		num: 288,
	},
	overcoat: {
		onImmunity(type, pokemon) {
			if (type === 'sandstorm' || type === 'hail' || type === 'powder') return false;
		},
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (move.flags['powder'] && target !== source && this.dex.getImmunity('powder', target)) {
				this.add('-immune', target, '[from] ability: Overcoat');
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Overcoat",
		rating: 2,
		num: 142,
	},
	overgrow: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Grass' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Overgrow boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Grass' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Overgrow boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Overgrow",
		rating: 2,
		num: 65,
	},
	owntempo: {
		onUpdate(pokemon) {
			if (pokemon.volatiles['confusion']) {
				this.add('-activate', pokemon, 'ability: Own Tempo');
				pokemon.removeVolatile('confusion');
			}
		},
		onTryAddVolatile(status, pokemon) {
			if (status.id === 'confusion') return null;
		},
		onHit(target, source, move) {
			if (move?.volatileStatus === 'confusion') {
				this.add('-immune', target, 'confusion', '[from] ability: Own Tempo');
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Own Tempo', `[of] ${target}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Own Tempo",
		rating: 1.5,
		num: 20,
	},
	parentalbond: {
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || move.multihit || move.flags['noparentalbond'] || move.flags['charge'] ||
				move.flags['futuremove'] || move.spreadHit || move.isZ || move.isMax) return;
			move.multihit = 2;
			move.multihitType = 'parentalbond';
		},
		// Damage modifier implemented in BattleActions#modifyDamage()
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (move.multihitType === 'parentalbond' && move.id === 'secretpower' && move.hit < 2) {
				// hack to prevent accidentally suppressing King's Rock/Razor Fang
				return secondaries.filter(effect => effect.volatileStatus === 'flinch');
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Parental Bond",
		rating: 4.5,
		num: 185,
	},
	pastelveil: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			for (const ally of pokemon.alliesAndSelf()) {
				if (['psn', 'tox'].includes(ally.status)) {
					this.add('-activate', pokemon, 'ability: Pastel Veil');
					ally.cureStatus();
				}
			}
		},
		onUpdate(pokemon) {
			if (['psn', 'tox'].includes(pokemon.status)) {
				this.add('-activate', pokemon, 'ability: Pastel Veil');
				pokemon.cureStatus();
			}
		},
		onAnySwitchIn() {
			((this.effect as any).onStart as (p: Pokemon) => void).call(this, this.effectState.target);
		},
		onSetStatus(status, target, source, effect) {
			if (!['psn', 'tox'].includes(status.id)) return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Pastel Veil');
			}
			return false;
		},
		onAllySetStatus(status, target, source, effect) {
			if (!['psn', 'tox'].includes(status.id)) return;
			if ((effect as Move)?.status) {
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Pastel Veil', `[of] ${effectHolder}`);
			}
			return false;
		},
		
flags: { breakable: 1 },
		name: "Pastel Veil",
		rating: 2,
		num: 257,
	},
	perishbody: {
		onDamagingHit(damage, target, source, move) {
			if (!this.checkMoveMakesContact(move, source, target) || source.volatiles['perishsong']) return;
			this.add('-ability', target, 'Perish Body');
			source.addVolatile('perishsong');
			target.addVolatile('perishsong');
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Perish Body",
		rating: 1,
		num: 253,
	},
	pickpocket: {
		onAfterMoveSecondary(target, source, move) {
			if (source && source !== target && move?.flags['contact']) {
				if (target.item || target.switchFlag || target.forceSwitchFlag || source.switchFlag === true) {
					return;
				}
				const yourItem = source.takeItem(target);
				if (!yourItem) {
					return;
				}
				if (!target.setItem(yourItem)) {
					source.item = yourItem.id;
					return;
				}
				this.add('-enditem', source, yourItem, '[silent]', '[from] ability: Pickpocket', `[of] ${source}`);
				this.add('-item', target, yourItem, '[from] ability: Pickpocket', `[of] ${source}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Pickpocket",
		rating: 1,
		num: 124,
	},
	pickup: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (pokemon.item) return;
			const pickupTargets = this.getAllActive().filter(target => (
				target.lastItem && target.usedItemThisTurn && pokemon.isAdjacent(target)
			));
			if (!pickupTargets.length) return;
			const randomTarget = this.sample(pickupTargets);
			const item = randomTarget.lastItem;
			randomTarget.lastItem = '';
			this.add('-item', pokemon, this.dex.items.get(item), '[from] ability: Pickup');
			pokemon.setItem(item);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Pickup",
		rating: 0.5,
		num: 53,
	},
	pixilate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Fairy';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Pixilate",
		rating: 4,
		num: 182,
	},
	plus: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			for (const allyActive of pokemon.allies()) {
				if (allyActive.hasAbility(['minus', 'plus'])) {
					return this.chainModify(1.5);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Plus",
		rating: 0,
		num: 57,
	},
	poisonheal: {
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect.id === 'psn' || effect.id === 'tox') {
				this.heal(target.baseMaxhp / 8);
				return false;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Poison Heal",
		rating: 4,
		num: 90,
	},
	poisonpoint: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.trySetStatus('psn', target);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Poison Point",
		rating: 1.5,
		num: 38,
	},
	poisonpuppeteer: {
		onAnyAfterSetStatus(status, target, source, effect) {
			if (source.baseSpecies.name !== "Pecharunt") return;
			if (source !== this.effectState.target || target === source || effect.effectType !== 'Move') return;
			if (status.id === 'psn' || status.id === 'tox') {
				target.addVolatile('confusion');
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Poison Puppeteer",
		rating: 3,
		num: 310,
	},
	poisontouch: {
		onSourceDamagingHit(damage, target, source, move) {
			// Despite not being a secondary, Shield Dust / Covert Cloak block Poison Touch's effect
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;
			if (this.checkMoveMakesContact(move, target, source)) {
				if (this.randomChance(3, 10)) {
					target.trySetStatus('psn', source);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Poison Touch",
		rating: 2,
		num: 143,
	},
	powerconstruct: {
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Zygarde' || pokemon.transformed || !pokemon.hp) return;
			if (pokemon.species.id === 'zygardecomplete' || pokemon.hp > pokemon.maxhp / 2) return;
			this.add('-activate', pokemon, 'ability: Power Construct');
			pokemon.formeChange('Zygarde-Complete', this.effect, true);
			pokemon.formeRegression = true;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Power Construct",
		rating: 5,
		num: 211,
	},
	powerofalchemy: {
		onAllyFaint(target) {
			if (!this.effectState.target.hp) return;
			const ability = target.getAbility();
			if (ability.flags['noreceiver'] || ability.id === 'noability') return;
			if (this.effectState.target.setAbility(ability)) {
				this.add('-ability', this.effectState.target, ability, '[from] ability: Power of Alchemy', `[of] ${target}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Power of Alchemy",
		rating: 0,
		num: 223,
	},
	powerspot: {
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (attacker !== this.effectState.target) {
				this.debug('Power Spot boost');
				return this.chainModify([5325, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Power Spot",
		rating: 0,
		num: 249,
	},
	prankster: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.category === 'Status') {
				move.pranksterBoosted = true;
				return priority + 1;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Prankster",
		rating: 4,
		num: 158,
	},
	pressure: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.add('-ability', pokemon, 'Pressure');
		},
		onDeductPP(target, source) {
			if (target.isAlly(source)) return;
			return 1;
		},
		
flags: {},
		name: "Pressure",
		rating: 2.5,
		num: 46,
	},
	primordialsea: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.field.setWeather('primordialsea');
		},
		onAnySetWeather(target, source, weather) {
			const strongWeathers = ['desolateland', 'primordialsea', 'deltastream'];
			if (this.field.getWeather().id === 'primordialsea' && !strongWeathers.includes(weather.id)) return false;
		},
		onEnd(pokemon) {
			if (this.field.weatherState.source !== pokemon) return;
			for (const target of this.getAllActive()) {
				if (target === pokemon) continue;
				if (target.hasAbility('primordialsea')) {
					this.field.weatherState.source = target;
					return;
				}
			}
			this.field.clearWeather();
		},
		
flags: {},
		name: "Primordial Sea",
		rating: 4.5,
		num: 189,
	},
	prismarmor: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Prism Armor neutralize');
				return this.chainModify(0.75);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Prism Armor",
		rating: 3,
		num: 232,
	},
	propellertail: {
		onModifyMovePriority: 1,
		onModifyMove(move) {
			// most of the implementation is in Battle#getTarget
			move.tracksTarget = move.target !== 'scripted';
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Propeller Tail",
		rating: 0,
		num: 239,
	},
	protean: {
		onPrepareHit(source, target, move) {
			if (this.effectState.protean === source.previouslySwitchedIn) return;
			if (move.hasBounced || move.flags['futuremove'] || move.sourceEffect === 'snatch' || move.callsMove) return;
			const type = move.type;
			if (type && type !== '???' && source.getTypes().join() !== type) {
				if (!source.setType(type)) return;
				this.effectState.protean = source.previouslySwitchedIn;
				this.add('-start', source, 'typechange', type, '[from] ability: Protean');
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Protean",
		rating: 4,
		num: 168,
	},
	protosynthesis: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.singleEvent('WeatherChange', this.effect, this.effectState, pokemon);
		},
		onWeatherChange(pokemon) {
			// Protosynthesis is not affected by Utility Umbrella
			if (this.field.isWeather('sunnyday')) {
				pokemon.addVolatile('protosynthesis');
			} else if (!pokemon.volatiles['protosynthesis']?.fromBooster && !this.field.isWeather('sunnyday')) {
				pokemon.removeVolatile('protosynthesis');
			}
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['protosynthesis'];
			this.add('-end', pokemon, 'Protosynthesis', '[silent]');
		},
		condition: {
			noCopy: true,
			onStart(pokemon, source, effect) {
				if (effect?.name === 'Booster Energy') {
					this.effectState.fromBooster = true;
					this.add('-activate', pokemon, 'ability: Protosynthesis', '[fromitem]');
				} else {
					this.add('-activate', pokemon, 'ability: Protosynthesis');
				}
				this.effectState.bestStat = pokemon.getBestStat(false, true);
				this.add('-start', pokemon, 'protosynthesis' + this.effectState.bestStat);
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				if (this.effectState.bestStat !== 'atk' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis atk boost');
				return this.chainModify([5325, 4096]);
			},
			onModifyDefPriority: 6,
			onModifyDef(def, pokemon) {
				if (this.effectState.bestStat !== 'def' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis def boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				if (this.effectState.bestStat !== 'spa' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spa boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpDPriority: 6,
			onModifySpD(spd, pokemon) {
				if (this.effectState.bestStat !== 'spd' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spd boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpe(spe, pokemon) {
				if (this.effectState.bestStat !== 'spe' || pokemon.ignoringAbility()) return;
				this.debug('Protosynthesis spe boost');
				return this.chainModify(1.5);
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Protosynthesis');
			},
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Protosynthesis",
		rating: 3,
		num: 281,
	},
	psychicsurge: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.field.setTerrain('psychicterrain');
		},
		
flags: {},
		name: "Psychic Surge",
		rating: 4,
		num: 227,
	},
	punkrock: {
		onBasePowerPriority: 7,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['sound']) {
				this.debug('Punk Rock boost');
				return this.chainModify([5325, 4096]);
			}
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.flags['sound']) {
				this.debug('Punk Rock weaken');
				return this.chainModify(0.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Punk Rock",
		rating: 3.5,
		num: 244,
	},
	purepower: {
		onModifySpAPriority: 5,
		onModifySpA(spa) {
			return this.chainModify(2);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Pure Power",
		rating: 5,
		num: 74,
	},
	purifyingsalt: {
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Purifying Salt');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Purifying Salt');
				return null;
			}
		},
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Purifying Salt weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(spa, attacker, defender, move) {
			if (move.type === 'Ghost') {
				this.debug('Purifying Salt weaken');
				return this.chainModify(0.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Purifying Salt",
		rating: 4,
		num: 272,
	},
	quarkdrive: {
		onSwitchInPriority: -2,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.singleEvent('TerrainChange', this.effect, this.effectState, pokemon);
		},
		onTerrainChange(pokemon) {
			if (this.field.isTerrain('electricterrain')) {
				pokemon.addVolatile('quarkdrive');
			} else if (!pokemon.volatiles['quarkdrive']?.fromBooster) {
				pokemon.removeVolatile('quarkdrive');
			}
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['quarkdrive'];
			this.add('-end', pokemon, 'Quark Drive', '[silent]');
		},
		condition: {
			noCopy: true,
			onStart(pokemon, source, effect) {
				if (effect?.name === 'Booster Energy') {
					this.effectState.fromBooster = true;
					this.add('-activate', pokemon, 'ability: Quark Drive', '[fromitem]');
				} else {
					this.add('-activate', pokemon, 'ability: Quark Drive');
				}
				this.effectState.bestStat = pokemon.getBestStat(false, true);
				this.add('-start', pokemon, 'quarkdrive' + this.effectState.bestStat);
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				if (this.effectState.bestStat !== 'atk' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive atk boost');
				return this.chainModify([5325, 4096]);
			},
			onModifyDefPriority: 6,
			onModifyDef(def, pokemon) {
				if (this.effectState.bestStat !== 'def' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive def boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				if (this.effectState.bestStat !== 'spa' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive spa boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpDPriority: 6,
			onModifySpD(spd, pokemon) {
				if (this.effectState.bestStat !== 'spd' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive spd boost');
				return this.chainModify([5325, 4096]);
			},
			onModifySpe(spe, pokemon) {
				if (this.effectState.bestStat !== 'spe' || pokemon.ignoringAbility()) return;
				this.debug('Quark Drive spe boost');
				return this.chainModify(1.5);
			},
			onEnd(pokemon) {
				this.add('-end', pokemon, 'Quark Drive');
			},
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, notransform: 1 },
		name: "Quark Drive",
		rating: 3,
		num: 282,
	},
	queenlymajesty: {
		onFoeTryMove(target, source, move) {
			const targetAllExceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !targetAllExceptions.includes(move.id))) {
				return;
			}

			const dazzlingHolder = this.effectState.target;
			if ((source.isAlly(dazzlingHolder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', dazzlingHolder, 'ability: Queenly Majesty', move, `[of] ${target}`);
				return false;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Queenly Majesty",
		rating: 2.5,
		num: 214,
	},
	quickdraw: {
		onFractionalPriorityPriority: -1,
		onFractionalPriority(priority, pokemon, target, move) {
			if (move.category !== "Status" && this.randomChance(3, 10)) {
				this.add('-activate', pokemon, 'ability: Quick Draw');
				return 0.1;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Quick Draw",
		rating: 2.5,
		num: 259,
	},
	quickfeet: {
		onModifySpe(spe, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Quick Feet",
		rating: 2.5,
		num: 95,
	},
	raindish: {
		onWeather(target, source, effect) {
			if (target.hasItem('utilityumbrella')) return;
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.baseMaxhp / 16);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Rain Dish",
		rating: 1.5,
		num: 44,
	},
	rattled: {
		onDamagingHit(damage, target, source, move) {
			if (['Dark', 'Bug', 'Ghost'].includes(move.type)) {
				this.boost({ spe: 1 });
			}
		},
		onAfterBoost(boost, target, source, effect) {
			if (effect?.name === 'Intimidate' && boost.atk) {
				this.boost({ spe: 1 });
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Rattled",
		rating: 1,
		num: 155,
	},
	receiver: {
		onAllyFaint(target) {
			if (!this.effectState.target.hp) return;
			const ability = target.getAbility();
			if (ability.flags['noreceiver'] || ability.id === 'noability') return;
			if (this.effectState.target.setAbility(ability)) {
				this.add('-ability', this.effectState.target, ability, '[from] ability: Receiver', `[of] ${target}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Receiver",
		rating: 0,
		num: 222,
	},
	reckless: {
		onBasePowerPriority: 23,
		onBasePower(basePower, attacker, defender, move) {
			if (move.recoil || move.hasCrashDamage) {
				this.debug('Reckless boost');
				return this.chainModify([4915, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Reckless",
		rating: 3,
		num: 120,
	},
	refrigerate: {
		onModifyTypePriority: -1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'judgment', 'multiattack', 'naturalgift', 'revelationdance', 'technoblast', 'terrainpulse', 'weatherball',
			];
			if (move.type === 'Normal' && (!noModifyType.includes(move.id) || this.activeMove?.isMax) &&
				!(move.isZ && move.category !== 'Status') && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Ice';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Refrigerate",
		rating: 4,
		num: 174,
	},
	regenerator: {
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Regenerator",
		rating: 4.5,
		num: 144,
	},
	ripen: {
		onTryHeal(damage, target, source, effect) {
			if (!effect) return;
			if (effect.name === 'Berry Juice' || effect.name === 'Leftovers') {
				this.add('-activate', target, 'ability: Ripen');
			}
			if ((effect as Item).isBerry) return this.chainModify(2);
		},
		onChangeBoost(boost, target, source, effect) {
			if (effect && (effect as Item).isBerry) {
				let b: BoostID;
				for (b in boost) {
					boost[b]! *= 2;
				}
			}
		},
		onSourceModifyDamagePriority: -1,
		onSourceModifyDamage(damage, source, target, move) {
			if (target.abilityState.berryWeaken) {
				target.abilityState.berryWeaken = false;
				return this.chainModify(0.5);
			}
		},
		onTryEatItemPriority: -1,
		onTryEatItem(item, pokemon) {
			this.add('-activate', pokemon, 'ability: Ripen');
		},
		onEatItem(item, pokemon) {
			const weakenBerries = [
				'Babiri Berry', 'Charti Berry', 'Chilan Berry', 'Chople Berry', 'Coba Berry', 'Colbur Berry', 'Haban Berry', 'Kasib Berry', 'Kebia Berry', 'Occa Berry', 'Passho Berry', 'Payapa Berry', 'Rindo Berry', 'Roseli Berry', 'Shuca Berry', 'Tanga Berry', 'Wacan Berry', 'Yache Berry',
			];
			// Record if the pokemon ate a berry to resist the attack
			pokemon.abilityState.berryWeaken = weakenBerries.includes(item.name);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Ripen",
		rating: 2,
		num: 247,
	},
	rivalry: {
		onBasePowerPriority: 24,
		onBasePower(basePower, attacker, defender, move) {
			if (attacker.gender && defender.gender) {
				if (attacker.gender === defender.gender) {
					this.debug('Rivalry boost');
					return this.chainModify(1.25);
				} else {
					this.debug('Rivalry weaken');
					return this.chainModify(0.75);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Rivalry",
		rating: 0,
		num: 79,
	},
	rkssystem: {
		// RKS System's type-changing itself is implemented in statuses.js
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "RKS System",
		rating: 4,
		num: 225,
	},
	rockhead: {
		onDamage(damage, target, source, effect) {
			if (effect.id === 'recoil') {
				if (!this.activeMove) throw new Error("Battle.activeMove is null");
				if (this.activeMove.id !== 'struggle') return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Rock Head",
		rating: 3,
		num: 69,
	},
	rockypayload: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Rock') {
				this.debug('Rocky Payload boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Rock') {
				this.debug('Rocky Payload boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Rocky Payload",
		rating: 3.5,
		num: 276,
	},
	roughskin: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.damage(source.baseMaxhp / 8, source, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Rough Skin",
		rating: 2.5,
		num: 24,
	},
	runaway: {
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Run Away",
		rating: 0,
		num: 50,
	},
	sandforce: {
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (this.field.isWeather('sandstorm')) {
				if (move.type === 'Rock' || move.type === 'Ground' || move.type === 'Steel') {
					this.debug('Sand Force boost');
					return this.chainModify([5325, 4096]);
				}
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm') return false;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Sand Force",
		rating: 2,
		num: 159,
	},
	sandrush: {
		onModifySpe(spe, pokemon) {
			if (this.field.isWeather('sandstorm')) {
				return this.chainModify(2);
			}
		},
		onImmunity(type, pokemon) {
			if (type === 'sandstorm') return false;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Sand Rush",
		rating: 3,
		num: 146,
	},
	sandspit: {
		onDamagingHit(damage, target, source, move) {
			this.field.setWeather('sandstorm');
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Sand Spit",
		rating: 1,
		num: 245,
	},
	sandstream: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.field.setWeather('sandstorm');
		},
		
flags: {},
		name: "Sand Stream",
		rating: 4,
		num: 45,
	},
	sandveil: {
		onImmunity(type, pokemon) {
			if (type === 'sandstorm') return false;
		},
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			if (this.field.isWeather('sandstorm')) {
				this.debug('Sand Veil - decreasing accuracy');
				return this.chainModify([3277, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Sand Veil",
		rating: 1.5,
		num: 8,
	},
	sapsipper: {
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Grass') {
				if (!this.boost({ atk: 1 })) {
					this.add('-immune', target, '[from] ability: Sap Sipper');
				}
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (source === this.effectState.target || !target.isAlly(source)) return;
			if (move.type === 'Grass') {
				this.boost({ atk: 1 }, this.effectState.target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Sap Sipper",
		rating: 3,
		num: 157,
	},
	schooling: {
		onSwitchInPriority: -1,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.baseSpecies.baseSpecies !== 'Wishiwashi' || pokemon.level < 20 || pokemon.transformed) return;
			if (pokemon.hp > pokemon.maxhp / 4) {
				if (pokemon.species.id === 'wishiwashi') {
					pokemon.formeChange('Wishiwashi-School');
				}
			} else {
				if (pokemon.species.id === 'wishiwashischool') {
					pokemon.formeChange('Wishiwashi');
				}
			}
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (
				pokemon.baseSpecies.baseSpecies !== 'Wishiwashi' || pokemon.level < 20 ||
				pokemon.transformed || !pokemon.hp
			) return;
			if (pokemon.hp > pokemon.maxhp / 4) {
				if (pokemon.species.id === 'wishiwashi') {
					pokemon.formeChange('Wishiwashi-School');
				}
			} else {
				if (pokemon.species.id === 'wishiwashischool') {
					pokemon.formeChange('Wishiwashi');
				}
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Schooling",
		rating: 3,
		num: 208,
	},
	scrappy: {
		onModifyMovePriority: -5,
		onModifyMove(move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
		},
		onTryBoost(boost, target, source, effect) {
			if (effect.name === 'Intimidate' && boost.atk) {
				delete boost.atk;
				this.add('-fail', target, 'unboost', 'Attack', '[from] ability: Scrappy', `[of] ${target}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Scrappy",
		rating: 3,
		num: 113,
	},
	screencleaner: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			let activated = false;
			for (const sideCondition of ['reflect', 'lightscreen', 'auroraveil']) {
				for (const side of [pokemon.side, ...pokemon.side.foeSidesWithConditions()]) {
					if (side.getSideCondition(sideCondition)) {
						if (!activated) {
							this.add('-activate', pokemon, 'ability: Screen Cleaner');
							activated = true;
						}
						side.removeSideCondition(sideCondition);
					}
				}
			}
		},
		
flags: {},
		name: "Screen Cleaner",
		rating: 2,
		num: 251,
	},
	seedsower: {
		onDamagingHit(damage, target, source, move) {
			this.field.setTerrain('grassyterrain');
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Seed Sower",
		rating: 2.5,
		num: 269,
	},
	serenegrace: {
		onModifyMovePriority: -2,
		onModifyMove(move) {
			if (move.secondaries) {
				this.debug('doubling secondary chance');
				for (const secondary of move.secondaries) {
					if (secondary.chance) secondary.chance *= 2;
				}
			}
			if (move.self?.chance) move.self.chance *= 2;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Serene Grace",
		rating: 3.5,
		num: 32,
	},
	shadowshield: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.debug('Shadow Shield weaken');
				return this.chainModify(0.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Shadow Shield",
		rating: 3.5,
		num: 231,
	},
	shadowtag: {
		onFoeTrapPokemon(pokemon) {
			if (!pokemon.hasAbility('shadowtag') && pokemon.isAdjacent(this.effectState.target)) {
				pokemon.tryTrap(true);
			}
		},
		onFoeMaybeTrapPokemon(pokemon, source) {
			if (!source) source = this.effectState.target;
			if (!source || !pokemon.isAdjacent(source)) return;
			if (!pokemon.hasAbility('shadowtag')) {
				pokemon.maybeTrapped = true;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Shadow Tag",
		rating: 5,
		num: 23,
	},
	sharpness: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['slicing']) {
				this.debug('Sharpness boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Sharpness",
		rating: 3.5,
		num: 292,
	},
	shedskin: {
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if (pokemon.hp && pokemon.status && this.randomChance(33, 100)) {
				this.debug('shed skin');
				this.add('-activate', pokemon, 'ability: Shed Skin');
				pokemon.cureStatus();
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Shed Skin",
		rating: 3,
		num: 61,
	},
	sheerforce: {
		onModifyMove(move, pokemon) {
			if (move.secondaries) {
				delete move.secondaries;
				// Technically not a secondary effect, but it is negated
				delete move.self;
				if (move.id === 'clangoroussoulblaze') delete move.selfBoost;
				// Actual negation of `AfterMoveSecondary` effects implemented in scripts.js
				move.hasSheerForce = true;
			}
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, pokemon, target, move) {
			if (move.hasSheerForce) return this.chainModify([5325, 4096]);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Sheer Force",
		rating: 3.5,
		num: 125,
	},
	shellarmor: {
		onCriticalHit: false,
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Shell Armor",
		rating: 1,
		num: 75,
	},
	shielddust: {
		onModifySecondaries(secondaries) {
			this.debug('Shield Dust prevent secondary');
			return secondaries.filter(effect => !!effect.self);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Shield Dust",
		rating: 2,
		num: 19,
	},
	shieldsdown: {
		onSwitchInPriority: -1,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.baseSpecies.baseSpecies !== 'Minior' || pokemon.transformed) return;
			if (pokemon.hp > pokemon.maxhp / 2) {
				if (pokemon.species.forme !== 'Meteor') {
					pokemon.formeChange('Minior-Meteor');
				}
			} else {
				if (pokemon.species.forme === 'Meteor') {
					pokemon.formeChange(pokemon.set.species);
				}
			}
		},
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Minior' || pokemon.transformed || !pokemon.hp) return;
			if (pokemon.hp > pokemon.maxhp / 2) {
				if (pokemon.species.forme !== 'Meteor') {
					pokemon.formeChange('Minior-Meteor');
				}
			} else {
				if (pokemon.species.forme === 'Meteor') {
					pokemon.formeChange(pokemon.set.species);
				}
			}
		},
		onSetStatus(status, target, source, effect) {
			if (target.species.id !== 'miniormeteor' || target.transformed) return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Shields Down');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (target.species.id !== 'miniormeteor' || target.transformed) return;
			if (status.id !== 'yawn') return;
			this.add('-immune', target, '[from] ability: Shields Down');
			return null;
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Shields Down",
		rating: 3,
		num: 197,
	},
	simple: {
		onChangeBoost(boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			let i: BoostID;
			for (i in boost) {
				boost[i]! *= 2;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Simple",
		rating: 4,
		num: 86,
	},
	skilllink: {
		onModifyMove(move) {
			if (move.multihit && Array.isArray(move.multihit) && move.multihit.length) {
				move.multihit = move.multihit[1];
			}
			if (move.multiaccuracy) {
				delete move.multiaccuracy;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Skill Link",
		rating: 3,
		num: 92,
	},
	slowstart: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			pokemon.addVolatile('slowstart');
		},
		onEnd(pokemon) {
			delete pokemon.volatiles['slowstart'];
			this.add('-end', pokemon, 'Slow Start', '[silent]');
		},
		condition: {
			duration: 5,
			onResidualOrder: 28,
			onResidualSubOrder: 2,
			onStart(target) {
				this.add('-start', target, 'ability: Slow Start');
			},
			onResidual(pokemon) {
				if (!pokemon.activeTurns) {
					this.effectState.duration! += 1;
				}
			},
			onModifyAtkPriority: 5,
			onModifyAtk(atk, pokemon) {
				return this.chainModify(0.5);
			},
			onModifySpe(spe, pokemon) {
				return this.chainModify(0.5);
			},
			onEnd(target) {
				this.add('-end', target, 'Slow Start');
			},
		},
		
flags: {},
		name: "Slow Start",
		rating: -1,
		num: 112,
	},
	slushrush: {
		onModifySpe(spe, pokemon) {
			if (this.field.isWeather(['hail', 'snowscape'])) {
				return this.chainModify(2);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Slush Rush",
		rating: 3,
		num: 202,
	},
	sniper: {
		onModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).crit) {
				this.debug('Sniper boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Sniper",
		rating: 2,
		num: 97,
	},
	snowcloak: {
		onImmunity(type, pokemon) {
			if (type === 'hail') return false;
		},
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy) {
			if (typeof accuracy !== 'number') return;
			if (this.field.isWeather(['hail', 'snowscape'])) {
				this.debug('Snow Cloak - decreasing accuracy');
				return this.chainModify([3277, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Snow Cloak",
		rating: 1.5,
		num: 81,
	},
	snowwarning: {
		onStart(source) {
			const pokemon = source;
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.field.setWeather('snowscape');
		},
		
flags: {},
		name: "Snow Warning",
		rating: 4,
		num: 117,
	},
	solarpower: {
		onModifySpAPriority: 5,
		onModifySpA(spa, pokemon) {
			if (['sunnyday', 'desolateland'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(1.5);
			}
		},
		onWeather(target, source, effect) {
			if (target.hasItem('utilityumbrella')) return;
			if (effect.id === 'sunnyday' || effect.id === 'desolateland') {
				this.damage(target.baseMaxhp / 8, target, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Solar Power",
		rating: 2,
		num: 94,
	},
	solidrock: {
		onSourceModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod > 0) {
				this.debug('Solid Rock neutralize');
				return this.chainModify(0.75);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Solid Rock",
		rating: 3,
		num: 116,
	},
	soulheart: {
		onAnyFaintPriority: 1,
		onAnyFaint() {
			this.boost({ spa: 1 }, this.effectState.target);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Soul-Heart",
		rating: 3.5,
		num: 220,
	},
	soundproof: {
		onTryHit(target, source, move) {
			if (target !== source && move.flags['sound']) {
				this.add('-immune', target, '[from] ability: Soundproof');
				return null;
			}
		},
		onAllyTryHitSide(target, source, move) {
			if (move.flags['sound']) {
				this.add('-immune', this.effectState.target, '[from] ability: Soundproof');
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Soundproof",
		rating: 2,
		num: 43,
	},
	speedboost: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (pokemon.activeTurns) {
				this.boost({ spe: 1 });
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Speed Boost",
		rating: 4.5,
		num: 3,
	},
	stakeout: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender) {
			if (!defender.activeTurns) {
				this.debug('Stakeout boost');
				return this.chainModify(2);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender) {
			if (!defender.activeTurns) {
				this.debug('Stakeout boost');
				return this.chainModify(2);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Stakeout",
		rating: 4.5,
		num: 198,
	},
	stall: {
		onFractionalPriority: -0.1,
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Stall",
		rating: -1,
		num: 100,
	},
	stalwart: {
		onModifyMovePriority: 1,
		onModifyMove(move) {
			// most of the implementation is in Battle#getTarget
			move.tracksTarget = move.target !== 'scripted';
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Stalwart",
		rating: 0,
		num: 242,
	},
	stamina: {
		onDamagingHit(damage, target, source, effect) {
			this.boost({ def: 1 });
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Stamina",
		rating: 4,
		num: 192,
	},
	stancechange: {
		onModifyMovePriority: 1,
		onModifyMove(move, attacker, defender) {
			if (attacker.species.baseSpecies !== 'Aegislash' || attacker.transformed) return;
			if (move.category === 'Status' && move.id !== 'kingsshield') return;
			const targetForme = (move.id === 'kingsshield' ? 'Aegislash' : 'Aegislash-Blade');
			if (attacker.species.name !== targetForme) attacker.formeChange(targetForme);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Stance Change",
		rating: 4,
		num: 176,
	},
	static: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.trySetStatus('par', target);
				}
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Static",
		rating: 2,
		num: 9,
	},
	steadfast: {
		onFlinch(pokemon) {
			this.boost({ spe: 1 });
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Steadfast",
		rating: 1,
		num: 80,
	},
	steamengine: {
		onDamagingHit(damage, target, source, move) {
			if (['Water', 'Fire'].includes(move.type)) {
				this.boost({ spe: 6 });
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Steam Engine",
		rating: 2,
		num: 243,
	},
	steelworker: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Steel') {
				this.debug('Steelworker boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Steel') {
				this.debug('Steelworker boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Steelworker",
		rating: 3.5,
		num: 200,
	},
	steelyspirit: {
		onAllyBasePowerPriority: 22,
		onAllyBasePower(basePower, attacker, defender, move) {
			if (move.type === 'Steel') {
				this.debug('Steely Spirit boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Steely Spirit",
		rating: 3.5,
		num: 252,
	},
	stench: {
		onModifyMovePriority: -1,
		onModifyMove(move) {
			if (move.category !== "Status") {
				this.debug('Adding Stench flinch');
				if (!move.secondaries) move.secondaries = [];
				for (const secondary of move.secondaries) {
					if (secondary.volatileStatus === 'flinch') return;
				}
				move.secondaries.push({
					chance: 10,
					volatileStatus: 'flinch',
				});
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Stench",
		rating: 0.5,
		num: 1,
	},
	stickyhold: {
		onTakeItem(item, pokemon, source) {
			if (!this.activeMove) throw new Error("Battle.activeMove is null");
			if (!pokemon.hp || pokemon.item === 'stickybarb') return;
			if ((source && source !== pokemon) || this.activeMove.id === 'knockoff') {
				this.add('-activate', pokemon, 'ability: Sticky Hold');
				return false;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Sticky Hold",
		rating: 1.5,
		num: 60,
	},
	stormdrain: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Water') {
				if (!this.boost({ spa: 1 })) {
					this.add('-immune', target, '[from] ability: Storm Drain');
				}
				return null;
			}
		},
		onAnyRedirectTarget(target, source, source2, move) {
			if (move.type !== 'Water' || move.flags['pledgecombo']) return;
			const redirectTarget = ['randomNormal', 'adjacentFoe'].includes(move.target) ? 'normal' : move.target;
			if (this.validTarget(this.effectState.target, source, redirectTarget)) {
				if (move.smartTarget) move.smartTarget = false;
				if (this.effectState.target !== target) {
					this.add('-activate', this.effectState.target, 'ability: Storm Drain');
				}
				return this.effectState.target;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Storm Drain",
		rating: 3,
		num: 114,
	},
	strongjaw: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['bite']) {
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Strong Jaw",
		rating: 3.5,
		num: 173,
	},
	sturdy: {
		onTryHit(pokemon, target, move) {
			if (move.ohko) {
				this.add('-immune', pokemon, '[from] ability: Sturdy');
				return null;
			}
		},
		onDamagePriority: -30,
		onDamage(damage, target, source, effect) {
			if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
				this.add('-ability', target, 'Sturdy');
				return target.hp - 1;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Sturdy",
		rating: 3,
		num: 5,
	},
	suctioncups: {
		onDragOutPriority: 1,
		onDragOut(pokemon) {
			this.add('-activate', pokemon, 'ability: Suction Cups');
			return null;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Suction Cups",
		rating: 1,
		num: 21,
	},
	superluck: {
		onModifyCritRatio(critRatio) {
			return critRatio + 1;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Super Luck",
		rating: 1.5,
		num: 105,
	},
	supersweetsyrup: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.syrupTriggered) return;
			pokemon.syrupTriggered = true;
			this.add('-ability', pokemon, 'Supersweet Syrup');
			for (const target of pokemon.adjacentFoes()) {
				if (target.volatiles['substitute']) {
					this.add('-immune', target);
				} else {
					this.boost({ evasion: -1 }, target, pokemon, null, true);
				}
			}
		},
		
flags: {},
		name: "Supersweet Syrup",
		rating: 1.5,
		num: 306,
	},
	supremeoverlord: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.side.totalFainted) {
				this.add('-activate', pokemon, 'ability: Supreme Overlord');
				const fallen = Math.min(pokemon.side.totalFainted, 5);
				this.add('-start', pokemon, `fallen${fallen}`, '[silent]');
				this.effectState.fallen = fallen;
			}
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, `fallen${this.effectState.fallen}`, '[silent]');
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (this.effectState.fallen) {
				const powMod = [4096, 4506, 4915, 5325, 5734, 6144];
				this.debug(`Supreme Overlord boost: ${powMod[this.effectState.fallen]}/4096`);
				return this.chainModify([powMod[this.effectState.fallen], 4096]);
			}
		},
		
flags: {},
		name: "Supreme Overlord",
		rating: 4,
		num: 293,
	},
	surgesurfer: {
		onModifySpe(spe) {
			if (this.field.isTerrain('electricterrain')) {
				return this.chainModify(2);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Surge Surfer",
		rating: 3,
		num: 207,
	},
	swarm: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Bug' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Swarm boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Bug' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Swarm boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Swarm",
		rating: 2,
		num: 68,
	},
	sweetveil: {
		onAllySetStatus(status, target, source, effect) {
			if (status.id === 'slp') {
				this.debug('Sweet Veil interrupts sleep');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Sweet Veil', `[of] ${effectHolder}`);
				return null;
			}
		},
		onAllyTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.debug('Sweet Veil blocking yawn');
				const effectHolder = this.effectState.target;
				this.add('-block', target, 'ability: Sweet Veil', `[of] ${effectHolder}`);
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Sweet Veil",
		rating: 2,
		num: 175,
	},
	swiftswim: {
		onModifySpe(spe, pokemon) {
			if (['raindance', 'primordialsea'].includes(pokemon.effectiveWeather())) {
				return this.chainModify(2);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Swift Swim",
		rating: 3,
		num: 33,
	},
	symbiosis: {
		onAllyAfterUseItem(item, pokemon) {
			if (pokemon.switchFlag) return;
			const source = this.effectState.target;
			const myItem = source.takeItem();
			if (!myItem) return;
			if (
				!this.singleEvent('TakeItem', myItem, source.itemState, pokemon, source, this.effect, myItem) ||
				!pokemon.setItem(myItem)
			) {
				source.item = myItem.id;
				return;
			}
			this.add('-activate', source, 'ability: Symbiosis', myItem, `[of] ${pokemon}`);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Symbiosis",
		rating: 0,
		num: 180,
	},
	synchronize: {
		onAfterSetStatus(status, target, source, effect) {
			if (!source || source === target) return;
			if (effect && effect.id === 'toxicspikes') return;
			if (status.id === 'slp' || status.id === 'frz') return;
			this.add('-activate', target, 'ability: Synchronize');
			// Hack to make status-prevention abilities think Synchronize is a status move
			// and show messages when activating against it.
			source.trySetStatus(status, target, { status: status.id, id: 'synchronize' } as Effect);
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Synchronize",
		rating: 2,
		num: 28,
	},
	swordofruin: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Sword of Ruin');
		},
		onAnyModifyDef(def, target, source, move) {
			const abilityHolder = this.effectState.target;
			if (target.hasAbility('Sword of Ruin')) return;
			if (!move.ruinedDef?.hasAbility('Sword of Ruin')) move.ruinedDef = abilityHolder;
			if (move.ruinedDef !== abilityHolder) return;
			this.debug('Sword of Ruin Def drop');
			return this.chainModify(0.75);
		},
		
flags: {},
		name: "Sword of Ruin",
		rating: 4.5,
		num: 285,
	},
	tabletsofruin: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Tablets of Ruin');
		},
		onAnyModifyAtk(atk, source, target, move) {
			const abilityHolder = this.effectState.target;
			if (source.hasAbility('Tablets of Ruin')) return;
			if (!move.ruinedAtk) move.ruinedAtk = abilityHolder;
			if (move.ruinedAtk !== abilityHolder) return;
			this.debug('Tablets of Ruin Atk drop');
			return this.chainModify(0.75);
		},
		
flags: {},
		name: "Tablets of Ruin",
		rating: 4.5,
		num: 284,
	},
	tangledfeet: {
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy, target) {
			if (typeof accuracy !== 'number') return;
			if (target?.volatiles['confusion']) {
				this.debug('Tangled Feet - decreasing accuracy');
				return this.chainModify(0.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Tangled Feet",
		rating: 1,
		num: 77,
	},
	tanglinghair: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target, true)) {
				this.add('-ability', target, 'Tangling Hair');
				this.boost({ spe: -1 }, source, target, null, true);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Tangling Hair",
		rating: 2,
		num: 221,
	},
	technician: {
		onBasePowerPriority: 30,
		onBasePower(basePower, attacker, defender, move) {
			const basePowerAfterMultiplier = this.modify(basePower, this.event.modifier);
			this.debug(`Base Power: ${basePowerAfterMultiplier}`);
			if (basePowerAfterMultiplier <= 60) {
				this.debug('Technician boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Technician",
		rating: 3.5,
		num: 101,
	},
	telepathy: {
		onTryHit(target, source, move) {
			if (target !== source && target.isAlly(source) && move.category !== 'Status') {
				this.add('-activate', target, 'ability: Telepathy');
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Telepathy",
		rating: 0,
		num: 140,
	},
	teraformzero: {
		onAfterTerastallization(pokemon) {
			if (pokemon.baseSpecies.name !== 'Terapagos-Stellar') return;
			if (this.field.weather || this.field.terrain) {
				this.add('-ability', pokemon, 'Teraform Zero');
				this.field.clearWeather();
				this.field.clearTerrain();
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1 },
		name: "Teraform Zero",
		rating: 3,
		num: 309,
	},
	terashell: {
		// effectiveness implemented in sim/pokemon.ts:Pokemon#runEffectiveness
		// needs two checks to reset between regular moves and future attacks
		onAnyBeforeMove() {
			delete this.effectState.resisted;
		},
		onAnyAfterMove() {
			delete this.effectState.resisted;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, breakable: 1 },
		name: "Tera Shell",
		rating: 3.5,
		num: 308,
	},
	terashift: {
		onSwitchInPriority: 2,
		onSwitchIn(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Terapagos') return;
			if (pokemon.species.forme !== 'Terastal') {
				this.add('-activate', pokemon, 'ability: Tera Shift');
				pokemon.formeChange('Terapagos-Terastal', this.effect, true);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1, notransform: 1 },
		name: "Tera Shift",
		rating: 3,
		num: 307,
	},
	teravolt: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.add('-ability', pokemon, 'Teravolt');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		
flags: {},
		name: "Teravolt",
		rating: 3,
		num: 164,
	},
	thermalexchange: {
		onDamagingHit(damage, target, source, move) {
			if (move.type === 'Fire') {
				this.boost({ atk: 1 });
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Thermal Exchange');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Thermal Exchange');
			}
			return false;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Thermal Exchange",
		rating: 2.5,
		num: 270,
	},
	thickfat: {
		onSourceModifyAtkPriority: 6,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Ice' || move.type === 'Fire') {
				this.debug('Thick Fat weaken');
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Ice' || move.type === 'Fire') {
				this.debug('Thick Fat weaken');
				return this.chainModify(0.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Thick Fat",
		rating: 3.5,
		num: 47,
	},
	tintedlens: {
		onModifyDamage(damage, source, target, move) {
			if (target.getMoveHitData(move).typeMod < 0) {
				this.debug('Tinted Lens boost');
				return this.chainModify(2);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Tinted Lens",
		rating: 4,
		num: 110,
	},
	torrent: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Water' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Torrent boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Water' && attacker.hp <= attacker.maxhp / 3) {
				this.debug('Torrent boost');
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Torrent",
		rating: 2,
		num: 67,
	},
	toughclaws: {
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (move.flags['contact']) {
				return this.chainModify([5325, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Tough Claws",
		rating: 3.5,
		num: 181,
	},
	toxicboost: {
		onBasePowerPriority: 19,
		onBasePower(basePower, attacker, defender, move) {
			if ((attacker.status === 'psn' || attacker.status === 'tox') && move.category === 'Physical') {
				return this.chainModify(1.5);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Toxic Boost",
		rating: 3,
		num: 137,
	},
	toxicchain: {
		onSourceDamagingHit(damage, target, source, move) {
			// Despite not being a secondary, Shield Dust / Covert Cloak block Toxic Chain's effect
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;

			if (this.randomChance(3, 10)) {
				target.trySetStatus('tox', source);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Toxic Chain",
		rating: 4.5,
		num: 305,
	},
	toxicdebris: {
		onDamagingHit(damage, target, source, move) {
			const side = source.isAlly(target) ? source.side.foe : source.side;
			const toxicSpikes = side.sideConditions['toxicspikes'];
			if (move.category === 'Physical' && (!toxicSpikes || toxicSpikes.layers < 2)) {
				this.add('-activate', target, 'ability: Toxic Debris');
				side.addSideCondition('toxicspikes', target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Toxic Debris",
		rating: 3.5,
		num: 295,
	},
	trace: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.effectState.seek = true;
			// n.b. only affects Hackmons
			// interaction with No Ability is complicated: https://www.smogon.com/forums/threads/pokemon-sun-moon-battle-mechanics-research.3586701/page-76#post-7790209
			if (pokemon.adjacentFoes().some(foeActive => foeActive.ability === 'noability')) {
				this.effectState.seek = false;
			}
			// interaction with Ability Shield is similar to No Ability
			if (pokemon.hasItem('Ability Shield')) {
				this.add('-block', pokemon, 'item: Ability Shield');
				this.effectState.seek = false;
			}
			if (this.effectState.seek) {
				this.singleEvent('Update', this.effect, this.effectState, pokemon);
			}
		},
		onUpdate(pokemon) {
			if (!this.effectState.seek) return;

			const possibleTargets = pokemon.adjacentFoes().filter(
				target => !target.getAbility().flags['notrace'] && target.ability !== 'noability'
			);
			if (!possibleTargets.length) return;

			const target = this.sample(possibleTargets);
			const ability = target.getAbility();
			if (pokemon.setAbility(ability)) {
				this.add('-ability', pokemon, ability, '[from] ability: Trace', `[of] ${target}`);
			}
		},
		
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1 },
		name: "Trace",
		rating: 2.5,
		num: 36,
	},
	transistor: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Electric') {
				this.debug('Transistor boost');
				return this.chainModify([5325, 4096]);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Electric') {
				this.debug('Transistor boost');
				return this.chainModify([5325, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Transistor",
		rating: 3.5,
		num: 262,
	},
	triage: {
		onModifyPriority(priority, pokemon, target, move) {
			if (move?.flags['heal']) return priority + 3;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Triage",
		rating: 3.5,
		num: 205,
	},
	truant: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			pokemon.removeVolatile('truant');
			if (pokemon.activeTurns && (pokemon.moveThisTurnResult !== undefined || !this.queue.willMove(pokemon))) {
				pokemon.addVolatile('truant');
			}
		},
		onBeforeMovePriority: 9,
		onBeforeMove(pokemon) {
			if (pokemon.removeVolatile('truant')) {
				this.add('cant', pokemon, 'ability: Truant');
				return false;
			}
			pokemon.addVolatile('truant');
		},
		condition: {},
		
flags: {},
		name: "Truant",
		rating: -1,
		num: 54,
	},
	turboblaze: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			this.add('-ability', pokemon, 'Turboblaze');
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		
flags: {},
		name: "Turboblaze",
		rating: 3,
		num: 163,
	},
	unaware: {
		onAnyModifyBoost(boosts, pokemon) {
			const unawareUser = this.effectState.target;
			if (unawareUser === pokemon) return;
			if (unawareUser === this.activePokemon && pokemon === this.activeTarget) {
				boosts['def'] = 0;
				boosts['spd'] = 0;
				boosts['evasion'] = 0;
			}
			if (pokemon === this.activePokemon && unawareUser === this.activeTarget) {
				boosts['atk'] = 0;
				boosts['def'] = 0;
				boosts['spa'] = 0;
				boosts['accuracy'] = 0;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Unaware",
		rating: 4,
		num: 109,
	},
	unburden: {
		onAfterUseItem(item, pokemon) {
			if (pokemon !== this.effectState.target) return;
			pokemon.addVolatile('unburden');
		},
		onTakeItem(item, pokemon) {
			pokemon.addVolatile('unburden');
		},
		onEnd(pokemon) {
			pokemon.removeVolatile('unburden');
		},
		condition: {
			onModifySpe(spe, pokemon) {
				if (!pokemon.item && !pokemon.ignoringAbility()) {
					return this.chainModify(2);
				}
			},
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Unburden",
		rating: 3.5,
		num: 84,
	},
	unnerve: {
		onSwitchInPriority: 1,
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.effectState.unnerved) return;
			this.add('-ability', pokemon, 'Unnerve');
			this.effectState.unnerved = true;
		},
		onEnd() {
			this.effectState.unnerved = false;
		},
		onFoeTryEatItem() {
			return !this.effectState.unnerved;
		},
		
flags: {},
		name: "Unnerve",
		rating: 1,
		num: 127,
	},
	unseenfist: {
		onModifyMove(move) {
			if (move.flags['contact']) delete move.flags['protect'];
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Unseen Fist",
		rating: 2,
		num: 260,
	},
	vesselofruin: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Vessel of Ruin');
		},
		onAnyModifySpA(spa, source, target, move) {
			const abilityHolder = this.effectState.target;
			if (source.hasAbility('Vessel of Ruin')) return;
			if (!move.ruinedSpA) move.ruinedSpA = abilityHolder;
			if (move.ruinedSpA !== abilityHolder) return;
			this.debug('Vessel of Ruin SpA drop');
			return this.chainModify(0.75);
		},
		
flags: {},
		name: "Vessel of Ruin",
		rating: 4.5,
		num: 284,
	},
	victorystar: {
		onAnyModifyAccuracyPriority: -1,
		onAnyModifyAccuracy(accuracy, target, source) {
			if (source.isAlly(this.effectState.target) && typeof accuracy === 'number') {
				return this.chainModify([4506, 4096]);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Victory Star",
		rating: 2,
		num: 162,
	},
	vitalspirit: {
		onUpdate(pokemon) {
			if (pokemon.status === 'slp') {
				this.add('-activate', pokemon, 'ability: Vital Spirit');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'slp') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Vital Spirit');
			}
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Vital Spirit');
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Vital Spirit",
		rating: 1.5,
		num: 72,
	},
	voltabsorb: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Electric') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Volt Absorb');
				}
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Volt Absorb",
		rating: 3.5,
		num: 10,
	},
	wanderingspirit: {
		onDamagingHit(damage, target, source, move) {
			if (source.getAbility().flags['failskillswap'] || target.volatiles['dynamax']) return;

			if (this.checkMoveMakesContact(move, source, target)) {
				const targetCanBeSet = this.runEvent('SetAbility', target, source, this.effect, source.ability);
				if (!targetCanBeSet) return targetCanBeSet;
				const sourceAbility = source.setAbility('wanderingspirit', target);
				if (!sourceAbility) return;
				if (target.isAlly(source)) {
					this.add('-activate', target, 'Skill Swap', '', '', `[of] ${source}`);
				} else {
					this.add('-activate', target, 'ability: Wandering Spirit', this.dex.abilities.get(sourceAbility).name, 'Wandering Spirit', `[of] ${source}`);
				}
				target.setAbility(sourceAbility);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Wandering Spirit",
		rating: 2.5,
		num: 254,
	},
	waterabsorb: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Water') {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add('-immune', target, '[from] ability: Water Absorb');
				}
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Water Absorb",
		rating: 3.5,
		num: 11,
	},
	waterbubble: {
		onSourceModifyAtkPriority: 5,
		onSourceModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpAPriority: 5,
		onSourceModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				return this.chainModify(0.5);
			}
		},
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Water') {
				return this.chainModify(2);
			}
		},
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Water') {
				return this.chainModify(2);
			}
		},
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Water Bubble');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Water Bubble');
			}
			return false;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Water Bubble",
		rating: 4.5,
		num: 199,
	},
	watercompaction: {
		onDamagingHit(damage, target, source, move) {
			if (move.type === 'Water') {
				this.boost({ def: 2 });
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Water Compaction",
		rating: 1.5,
		num: 195,
	},
	waterveil: {
		onUpdate(pokemon) {
			if (pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Water Veil');
				pokemon.cureStatus();
			}
		},
		onSetStatus(status, target, source, effect) {
			if (status.id !== 'brn') return;
			if ((effect as Move)?.status) {
				this.add('-immune', target, '[from] ability: Water Veil');
			}
			return false;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Water Veil",
		rating: 2,
		num: 41,
	},
	weakarmor: {
		onDamagingHit(damage, target, source, move) {
			if (move.category === 'Physical') {
				this.boost({ def: -1, spe: 2 }, target, target);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Weak Armor",
		rating: 1,
		num: 133,
	},
	wellbakedbody: {
		onTryHit(target, source, move) {
			if (target !== source && move.type === 'Fire') {
				if (!this.boost({ def: 2 })) {
					this.add('-immune', target, '[from] ability: Well-Baked Body');
				}
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Well-Baked Body",
		rating: 3.5,
		num: 273,
	},
	whitesmoke: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (showMsg && !(effect as ActiveMove).secondaries && effect.id !== 'octolock') {
				this.add("-fail", target, "unboost", "[from] ability: White Smoke", `[of] ${target}`);
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "White Smoke",
		rating: 2,
		num: 73,
	},
	wimpout: {
		onEmergencyExit(target) {
			if (!this.canSwitch(target.side) || target.forceSwitchFlag || target.switchFlag) return;
			for (const side of this.sides) {
				for (const active of side.active) {
					active.switchFlag = false;
				}
			}
			target.switchFlag = true;
			this.add('-activate', target, 'ability: Wimp Out');
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Wimp Out",
		rating: 1,
		num: 193,
	},
	windpower: {
		onDamagingHitOrder: 1,
		onDamagingHit(damage, target, source, move) {
			if (move.flags['wind']) {
				target.addVolatile('charge');
			}
		},
		onSideConditionStart(side, source, sideCondition) {
			const pokemon = this.effectState.target;
			if (sideCondition.id === 'tailwind') {
				pokemon.addVolatile('charge');
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Wind Power",
		rating: 1,
		num: 277,
	},
	windrider: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
			if (pokemon.side.sideConditions['tailwind']) {
				this.boost({ atk: 1 }, pokemon, pokemon);
			}
		},
		onTryHit(target, source, move) {
			if (target !== source && move.flags['wind']) {
				if (!this.boost({ atk: 1 }, target, target)) {
					this.add('-immune', target, '[from] ability: Wind Rider');
				}
				return null;
			}
		},
		onSideConditionStart(side, source, sideCondition) {
			const pokemon = this.effectState.target;
			if (sideCondition.id === 'tailwind') {
				this.boost({ atk: 1 }, pokemon, pokemon);
			}
		},
		
flags: { breakable: 1 },
		name: "Wind Rider",
		rating: 3.5,
		// We do not want Brambleghast to get Infiltrator in Randbats
		num: 274,
	},
	wonderguard: {
		onTryHit(target, source, move) {
			if (target === source || move.category === 'Status' || move.type === '???' || move.id === 'struggle') return;
			if (move.id === 'skydrop' && !source.volatiles['skydrop']) return;
			this.debug('Wonder Guard immunity: ' + move.id);
			if (target.runEffectiveness(move) <= 0 || !target.runImmunity(move)) {
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add('-immune', target, '[from] ability: Wonder Guard');
				}
				return null;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, failskillswap: 1, breakable: 1 },
		name: "Wonder Guard",
		rating: 5,
		num: 25,
	},
	wonderskin: {
		onModifyAccuracyPriority: 10,
		onModifyAccuracy(accuracy, target, source, move) {
			if (move.category === 'Status' && typeof accuracy === 'number') {
				this.debug('Wonder Skin - setting accuracy to 50');
				return 50;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Wonder Skin",
		rating: 2,
		num: 147,
	},
	zenmode: {
		onResidualOrder: 29,
		onResidual(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Darmanitan' || pokemon.transformed) {
				return;
			}
			if (pokemon.hp <= pokemon.maxhp / 2 && !['Zen', 'Galar-Zen'].includes(pokemon.species.forme)) {
				pokemon.addVolatile('zenmode');
			} else if (pokemon.hp > pokemon.maxhp / 2 && ['Zen', 'Galar-Zen'].includes(pokemon.species.forme)) {
				pokemon.addVolatile('zenmode'); // in case of base Darmanitan-Zen
				pokemon.removeVolatile('zenmode');
			}
		},
		onEnd(pokemon) {
			if (!pokemon.volatiles['zenmode'] || !pokemon.hp) return;
			pokemon.transformed = false;
			delete pokemon.volatiles['zenmode'];
			if (pokemon.species.baseSpecies === 'Darmanitan' && pokemon.species.battleOnly) {
				pokemon.formeChange(pokemon.species.battleOnly as string, this.effect, false, '0', '[silent]');
			}
		},
		condition: {
			onStart(pokemon) {
				if (!pokemon.species.name.includes('Galar')) {
					if (pokemon.species.id !== 'darmanitanzen') pokemon.formeChange('Darmanitan-Zen');
				} else {
					if (pokemon.species.id !== 'darmanitangalarzen') pokemon.formeChange('Darmanitan-Galar-Zen');
				}
			},
			onEnd(pokemon) {
				if (['Zen', 'Galar-Zen'].includes(pokemon.species.forme)) {
					pokemon.formeChange(pokemon.species.battleOnly as string);
				}
			},
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		name: "Zen Mode",
		rating: 0,
		num: 161,
	},
	zerotohero: {
		onSwitchOut(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Palafin') return;
			if (pokemon.species.forme !== 'Hero') {
				pokemon.formeChange('Palafin-Hero', this.effect, true);
			}
		},
		onSwitchIn(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Palafin') return;
			if (!this.effectState.heroMessageDisplayed && pokemon.species.forme === 'Hero') {
				this.add('-activate', pokemon, 'ability: Zero to Hero');
				this.effectState.heroMessageDisplayed = true;
			}
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1, notransform: 1 },
		name: "Zero to Hero",
		rating: 5,
		num: 278,
	},

	// CAP
	mountaineer: {
		onDamage(damage, target, source, effect) {
			if (effect && effect.id === 'stealthrock') {
				return false;
			}
		},
		onTryHit(target, source, move) {
			if (move.type === 'Rock' && !target.activeTurns) {
				this.add('-immune', target, '[from] ability: Mountaineer');
				return null;
			}
		},
		isNonstandard: "CAP",
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Mountaineer",
		rating: 3,
		num: -1,
	},
	rebound: {
		isNonstandard: "CAP",
		onTryHitPriority: 1,
		onTryHit(target, source, move) {
			if (this.effectState.target.activeTurns) return;

			if (target === source || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, target, { target: source });
			return null;
		},
		onAllyTryHitSide(target, source, move) {
			if (this.effectState.target.activeTurns) return;

			if (target.isAlly(source) || move.hasBounced || !move.flags['reflectable'] || target.isSemiInvulnerable()) {
				return;
			}
			const newMove = this.dex.getActiveMove(move.id);
			newMove.hasBounced = true;
			newMove.pranksterBoosted = false;
			this.actions.useMove(newMove, this.effectState.target, { target: source });
			move.hasBounced = true; // only bounce once in free-for-all battles
			return null;
		},
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: { breakable: 1 },
		name: "Rebound",
		rating: 3,
		num: -2,
	},
	persistent: {
		isNonstandard: "CAP",
		// implemented in the corresponding move
		onStart(pokemon) { 
const cur = pokemon.getTypes(true).join('/'); // runtime types 
const base = pokemon.species.types.join('/'); // species types 
this.add('-start', pokemon, 'typechange', cur);
},
flags: {},
		name: "Persistent",
		rating: 3,
		num: -3,
	},
	typesponge: {
  name: "Type Sponge",
  shortDesc:
    "When hit, add the move's type (max 5; reverts on switch). STAB is 2 (2.25 if already 2). When hit by a damaging move: +1 Def if Physical, +1 SpD if Special (max once/turn).",
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/'); // runtime types 
	const base = pokemon.species.types.join('/'); // species types 
	this.add('-start', pokemon, 'typechange', cur);
    (this.effectState as any).lastBoostTurn = -1;
  },

  // STAB: keep your 2 -> 2.25 behavior
  onModifySTAB(stab, source, target, move) {
    if (move.forceSTAB || source.hasType(move.type)) {
      if (stab === 2) return 2.25;
      return 2;
    }
  },

  // ===== Damaging hits: add type + gated defensive boost =====
  onDamagingHit(damage, target, source, move) {
    // 1) Type absorb from this hit
    const t = this.dex.types.get(move.type)?.name;
    if (t && t !== '???' && t !== 'Stellar') {
      if (!target.terastallized && !target.hasAbility('multitype') && !target.hasAbility('rkssystem')) {
        const cur = target.getTypes();
        if (!cur.includes(t) && cur.length < 5) {
          if (!(target as any)._typeSpongeOrig) (target as any)._typeSpongeOrig = cur.slice();
          const next = cur.concat(t);
          if (target.setType(next)) {
            this.add('-start', target, 'typechange', next.join('/'), '[from] ability: Type Sponge');
          }
        }
      }
    }

    // 2) Defensive boost: once per turn, only for damaging moves
    if ((this.effectState as any).lastBoostTurn === this.turn) return;
    if (!move || move.category === 'Status') return;

    if (move.category === 'Physical') {
      this.boost({def: 1}, target, target, this.effect);
    } else if (move.category === 'Special') {
      this.boost({spd: 1}, target, target, this.effect);
    }
    (this.effectState as any).lastBoostTurn = this.turn;
  },

  // ===== Status hits: add type ONLY (no defenses) =====
  onHit(target, source, move) {
    if (!move || move.category !== 'Status') return;

    const t = this.dex.types.get(move.type)?.name;
    if (!t || t === '???' || t === 'Stellar') return;

    if (target.terastallized) return;
    if (target.hasAbility('multitype') || target.hasAbility('rkssystem')) return;

    const cur = target.getTypes();
    if (cur.includes(t) || cur.length >= 5) return;

    if (!(target as any)._typeSpongeOrig) {
      (target as any)._typeSpongeOrig = cur.slice();
    }

    const next = cur.concat(t);
    if (target.setType(next)) {
      this.add('-start', target, 'typechange', next.join('/'), '[from] ability: Type Sponge');
    }
  },

  onSwitchOut(pokemon) {
    const orig: string[] | undefined = (pokemon as any)._typeSpongeOrig;
    if (!orig) return;
    if (pokemon.terastallized) return; // respect Tera lock
    pokemon.setType(orig);
    this.add('-end', pokemon, 'typechange', '[from] ability: Type Sponge');
    delete (pokemon as any)._typeSpongeOrig;
  },
},

unpredictable: {
  name: "Unpredictable",
  shortDesc: "On item loss: +2 Atk/SpA. While frenzied, each time it acts the chosen move is replaced by a random usable one.",
  rating: 3,
  onStart(pokemon) { 
	const cur = pokemon.getTypes(true).join('/'); // runtime types 
	const base = pokemon.species.types.join('/'); // species types 
	this.add('-start', pokemon, 'typechange', cur);
		},

  // ————— trigger frenzy on item loss/consumption —————
  onAfterUseItem(item, pokemon) {
    if (pokemon.fainted) return;
    this.add('-message', `Losing its item has launched ${pokemon.name} into a frenzy!`);
    this.boost({atk: 2, spa: 2}, pokemon, pokemon, this.effect);
    (pokemon as any).m ??= {};
    (pokemon as any).m.unpredictableFrenzy = true;
    (pokemon as any).m.unpredictableResolving = false;
  },
  onTakeItem(item, pokemon) {
    if (pokemon.fainted) return;
    this.add('-message', `Losing its item has launched ${pokemon.name} into a frenzy!`);
    this.boost({atk: 2, spa: 2}, pokemon, pokemon, this.effect);
    (pokemon as any).m ??= {};
    (pokemon as any).m.unpredictableFrenzy = true;
    (pokemon as any).m.unpredictableResolving = false;
  },

  // optional: clear on switch out; delete this block if you want it to persist
  onSwitchOut(pokemon) {
    if ((pokemon as any).m) (pokemon as any).m.unpredictableFrenzy = false;
  },

  // ————— enforce random cast at execution time (server-side) —————
  onBeforeMove(pokemon, target, move) {
    const m = (pokemon as any).m;
    if (!m?.unpredictableFrenzy) return;         // not active
    if (m.unpredictableResolving) return;         // prevent recursion

    // Build usable pool (respects Taunt/Disable/Encore/Imprison/Choice/PP)
    const usable = pokemon.getMoves().filter(ms =>
      !ms.disabled && (ms.pp ?? 0) > 0 && this.dex.moves.get(ms.id).id !== 'struggle'
    );
    if (!usable.length) return;                   // let Struggle happen

    const pick = this.sample(usable);
    const picked = this.dex.moves.get(pick.id);
    if (picked.id === move.id) return;            // RNG matched selection → do nothing

    // Announce (optional)
    this.add('-ability', pokemon, 'Unpredictable');
    this.add('-message', `${pokemon.name} is in a frenzy and used ${picked.name}!`);

    // Fire the replacement move now; cancel the original
m.unpredictableResolving = true;

const activeMove = this.dex.getActiveMove(picked);

// ✅ Let the engine pick the legal target; no target arg needed
this.actions.useMove(activeMove, pokemon);

m.unpredictableResolving = false;

return false; // cancels the originally queued move

  },
},
boilingpoint: {
  name: "Boiling Point",
  shortDesc:
    "On switch-in, randomly sets Fire→Boost/Water→Drop or Water→Boost/Fire→Drop. " +
    "When hit by the boost type: +1 all stats; by the other: -1 all (once/turn).",
  rating: 3,

  // Pick orientation on entry (also re-pick each time it re-enters)
  onStart(pokemon) {
	const cur = pokemon.getTypes(true).join('/'); // runtime types 
	const base = pokemon.species.types.join('/'); // species types 
	this.add('-start', pokemon, 'typechange', cur);
    const fireBoost = this.randomChance(1, 2);
    this.effectState.boostType = (fireBoost ? 'Fire' : 'Water');
    this.effectState.dropType  = (fireBoost ? 'Water' : 'Fire');
    this.effectState.lastTurn  = -1 as number;

    // Announce mapping (optional)
    const boost = this.effectState.boostType;
    const drop  = this.effectState.dropType;
    this.add('-ability', pokemon, 'Steamflip');
    this.add('-message', `${pokemon.name}'s Steamflip: ${boost} empowers, ${drop} weakens!`);
  },
  onSwitchIn(pokemon) {
    // Re-randomize each time it comes back in
    const fireBoost = this.randomChance(1, 2);
    this.effectState.boostType = (fireBoost ? 'Fire' : 'Water');
    this.effectState.dropType  = (fireBoost ? 'Water' : 'Fire');
    this.effectState.lastTurn  = -1 as number;

    const boost = this.effectState.boostType;
    const drop  = this.effectState.dropType;
    this.add('-ability', pokemon, 'Steamflip');
    this.add('-message', `${pokemon.name}'s Steamflip: ${boost} empowers, ${drop} weakens!`);
  },

  // Apply effects when struck
  onDamagingHit(damage, target, source, move) {
    if (!damage) return; // only if it actually dealt damage
    if (!move || move.category === 'Status') return;
    if (this.effectState.lastTurn === this.turn) return; // once per turn

    if (move.type === this.effectState.boostType) {
      this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, target, target, this.effect);
      this.add('-message', `${target.name} is empowered by ${move.type}!`);
      this.effectState.lastTurn = this.turn;
    } else if (move.type === this.effectState.dropType) {
      this.boost({atk: -1, def: -1, spa: -1, spd: -1, spe: -1}, target, target, this.effect);
      this.add('-message', `${target.name} is weakened by ${move.type}...`);
      this.effectState.lastTurn = this.turn;
    }
  },
},

stronger: {
  name: "Stronger",
  shortDesc:
    "When hit super effectively: +1 all. When hit for resisted damage: -1 all. Neutral hits: 15% chance to +1 all (once/turn).",
  rating: 3,

  onStart(pokemon) {
	const cur = pokemon.getTypes(true).join('/'); // runtime types 
	const base = pokemon.species.types.join('/'); // species types 
	this.add('-start', pokemon, 'typechange', cur);
    (this.effectState as any).lastTurn = -1;
  },

  onDamagingHit(damage, target, source, move) {
    if (!damage) return;                         // only if it actually dealt damage
    if (!move || move.category === 'Status') return;
    if ((this.effectState as any).lastTurn === this.turn) return; // once per turn

    // Compute effectiveness vs the target's current types (handles dual types)
    const types = target.getTypes ? target.getTypes() : (target as any).types;
    let typeMod = 0;
    for (const t of types) {
      // Dex.getEffectiveness returns -1 (resist), 0 (neutral), 1 (super), etc.
      typeMod += this.dex.getEffectiveness(move.type, t);
    }

    if (typeMod > 0) {
      // Super-effective → omni-boost
      this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, target, target, this.effect);
      this.add('-message', `${target.name} grew stronger from the super-effective hit!`);
      (this.effectState as any).lastTurn = this.turn;
    } else if (typeMod < 0) {
      // Resisted → omni-drop
      this.boost({atk: -1, def: -1, spa: -1, spd: -1, spe: -1}, target, target, this.effect);
      this.add('-message', `${target.name} faltered from the resisted hit...`);
      (this.effectState as any).lastTurn = this.turn;
    } else {
      // Neutral → 15% chance to omni-boost
      if (this.randomChance(3, 20)) {
        this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, target, target, this.effect);
        this.add('-message', `${target.name} powered up from the blow!`);
        (this.effectState as any).lastTurn = this.turn;
      }
    }
  },
},
ghostlyaura: {
		onStart(pokemon) {
			const cur = pokemon.getTypes(true).join('/'); // runtime types 
			const base = pokemon.species.types.join('/'); // species types 
			this.add('-start', pokemon, 'typechange', cur);
			if (this.suppressingAbility(pokemon)) return;
			this.add('-ability', pokemon, 'Ghostly Aura');
		},
		onAnyBasePowerPriority: 20,
		onAnyBasePower(basePower, source, target, move) {
		  if (target === source || move.category === 'Status') return;

		  const isBoosted = (move.type === 'Ghost' || move.type === 'Dark');
		  const isWeakened = (move.type === 'Fighting' || move.type === 'Fairy');
		  if (!isBoosted && !isWeakened) return;

		  // Ensure only one Ghostly Aura applies (no stacking with multiple holders)
		  if (!move.auraBooster?.hasAbility('Ghostly Aura')) {
		    move.auraBooster = this.effectState.target;
		  }
		  if (move.auraBooster !== this.effectState.target) return;

		  // Standard Aura numbers: 5448/4096 ≈ 1.33x, 3072/4096 = 0.75x
		  const mult = isBoosted
		    ? (move.hasAuraBreak ? 3072 : 5448)  // Ghost/Dark: boost, Aura Break flips to weaken
		    : (move.hasAuraBreak ? 5448 : 3072); // Fighting/Fairy: weaken, Aura Break flips to boost

		  return this.chainModify([mult, 4096]);
},
		
flags: {},
		name: "Ghostly Aura",
		rating: 3,
	},
	endurance: {
		onDamagingHit(damage, target, source, effect) {
			this.boost({ spd: 1 });
		},
		onStart(pokemon) { 
		const cur = pokemon.getTypes(true).join('/'); // runtime types 
		const base = pokemon.species.types.join('/'); // species types 
		this.add('-start', pokemon, 'typechange', cur);
	},
		flags: {},
		name: "Endurance",
		rating: 4,
		num: 192,
	},

	bipolar: {
  onDamagingHit(damage, target, source, move) {
    if (!move || move.category === 'Status') return;
    if (this.effectState.lastTurn === this.turn) return; // once per turn

    const pool: BoostID[] = ['atk','def','spa','spd','spe'];

    const upChoices = pool.filter(s => target.boosts[s] < 6);
    const statUp = this.sample(upChoices.length ? upChoices : pool);

    const downChoices = pool.filter(s => s !== statUp && target.boosts[s] > -6);
    const statDown = this.sample(downChoices.length ? downChoices : pool.filter(s => s !== statUp));

    this.boost({[statUp]: 2}, target, target);
    this.boost({[statDown]: -1}, target, target);

    this.effectState.lastTurn = this.turn;
  },
  onStart(pokemon) { 
		const cur = pokemon.getTypes(true).join('/'); // runtime types 
		const base = pokemon.species.types.join('/'); // species types 
		this.add('-start', pokemon, 'typechange', cur);},
  name: "Bipolar",
  shortDesc: "When hit by a damaging move: +2 to a random stat and -1 to a different one (once/turn).",
  rating: 3,
},
wondershield: {
  name: "Wonder Shield",
  shortDesc: "When hit by a move, gains permanent immunity to that move's type. Announces immunities each turn.",
  rating: 3.5,

  // Cosmetic: show current runtime types on entry
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/'); // runtime types
    const base = pokemon.species.types.join('/'); // species types
    this.add('-start', pokemon, 'typechange', cur);
  },

  // NEW: Per-hit immunity check (fires before each primary hit of multi-hit moves)
  onTryPrimaryHit(target, source, move) {
    const t = move?.type as string | undefined;
    const set = target?.m?.wsImmunities as Set<string> | undefined;
    if (t && set && set.has(t)) {
      this.add('-immune', target, '[from] ability: Wonder Shield');
      return null; // cancel this hit
    }
  },

  // (Optional) keep the broader onTryHit for single-hit moves & other edge timings
  onTryHit(target, source, move) {
    const t = move?.type as string | undefined;
    const set = target?.m?.wsImmunities as Set<string> | undefined;
    if (t && set && set.has(t)) {
      this.add('-immune', target, '[from] ability: Wonder Shield');
      return null;
    }
  },

  // Learn a new immunity as soon as a damaging hit connects
  onDamagingHit(damage, target, source, move) {
    if (!move || move.category === 'Status') return;
    const t = move.type as string | undefined;
    if (!t || t === '???' || t === 'Stellar') return;

    // init storage that persists through switching
    (target as any).m = target.m || {};
    const set = (target.m.wsImmunities ||= new Set<string>());

    if (!set.has(t)) {
      set.add(t);
      this.add('-ability', target, 'Wonder Shield');
      this.add('-message', `${target.name} became immune to ${t}-type moves!`);
      // From this point on, subsequent hits of a multi-hit move will be blocked
      // by onTryPrimaryHit above.
    }
  },

  // Start of each turn: announce current immunities (once per turn)
  onUpdate(pokemon) {
    const set = pokemon?.m?.wsImmunities as Set<string> | undefined;
    if (!set || set.size === 0) return;
    if (pokemon.m.wsLastAnnounceTurn === this.turn) return;
    pokemon.m.wsLastAnnounceTurn = this.turn;
    const list = Array.from(set).join('/');
    this.add('-message', `${pokemon.name} immunities: ${list}`);
  },
},

mirageview: {
  name: "Mirageview",
  shortDesc:
    "On 1st switch-in: first damaging hit is negated and Illusion breaks. On later switch-ins: first damaging hit is 0.75× and Illusion breaks.",
  rating: 4,

  // Arm the correct mode each time this Pokémon enters
  onBeforeSwitchIn(pokemon) {
    // Pick a disguise from later, healthy teammates (respecting your Tera exceptions)
    const pool = pokemon.side.pokemon.filter((p, idx) =>
      idx > pokemon.position &&
      !p.fainted &&
      (!pokemon.terastallized || !['Ogerpon','Terapagos'].includes(p.species.baseSpecies))
    );
    pokemon.illusion = pool.length ? this.sample(pool) : null;

    // Per-battle flag: have we already spent the full immunity?
    const usedImmune = (pokemon as any)._mirageImmuneUsed === true;

    // Fresh volatile to track this stint on the field
    pokemon.addVolatile('mirageviewstate');
    const st = pokemon.volatiles['mirageviewstate'] as any;
    if (st) {
      st.armed = true;                     // first damaging hit this stint
      st.mode = usedImmune ? 'reduced' : 'immune'; // decide which benefit we get
    }
  },

  onStart(pokemon) {
    const cur = pokemon.illusion
      ? pokemon.illusion.getTypes(true).join('/')
      : pokemon.getTypes(true).join('/');
    this.add('-start', pokemon, 'typechange', cur);
  },

  // If mode=immune and armed: negate the very first damaging hit, break Illusion immediately
  onTryHit(target, source, move) {
    if (!move || move.category === 'Status') return;
    const st = target.volatiles['mirageviewstate'] as any;
    if (!st || !st.armed || st.mode !== 'immune') return;

    st.armed = false;                           // consume for this stint
    (target as any)._mirageImmuneUsed = true;   // mark immunity used for the battle
    this.add('-immune', target, '[from] ability: Mirageview');

    if (target.illusion) {
      const realName = target.species.name;
      target.illusion = null;
      this.add('-end', target, 'Illusion');
      this.add('-formechange', target, realName, '[from] ability: Mirageview');
    }
    return null; // negate this hit
  },

  // If mode=reduced and armed: 0.75x the first damaging hit this stint
  onSourceModifyDamage(damage, source, target, move) {
    if (!move || move.category === 'Status') return;
    const st = target.volatiles['mirageviewstate'] as any;
    if (st && st.armed && st.mode === 'reduced' && target.illusion) {
      // Only reduce the specific “breaking” hit (illusion must still be up)
      return this.chainModify([3072, 4096]); // 0.75x
    }
  },

  // When a damaging hit actually connects, if we were in reduced mode and armed, break Illusion now
  onDamagingHit(_dmg, target, _source, move) {
    if (!move || move.category === 'Status') return;
    const st = target.volatiles['mirageviewstate'] as any;
    if (!target.illusion) return;

    // If we were in reduced mode, this first connecting hit is the one we reduced
    if (st && st.mode === 'reduced' && st.armed) {
      st.armed = false; // prevent multi-hit from getting reduced again
    }

    // Break Illusion on the first connecting damaging hit (immune case already broke in onTryHit)
    const realName = target.species.name;
    target.illusion = null;
    this.add('-end', target, 'Illusion');
    this.add('-formechange', target, realName, '[from] ability: Mirageview');
  },

  // Volatile container defaults
  condition: {
    onStart() {
      if (this.effectState.armed === undefined) this.effectState.armed = true;
      if (this.effectState.mode === undefined) this.effectState.mode = 'immune';
    },
  },
},




resourceful: {
  name: "Resourceful",
  shortDesc: "Whenever this Pokémon loses its item, it equips a random item from a curated list.",
	onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);},
  onAfterUseItem(item, pokemon) {
    if (pokemon.fainted || pokemon.item) return;
    const curatedIds = [
      'airballoon','assaultvest','blunderpolicy','choicescarf','choiceband','choicespecs',
      'covertcloak','expertbelt','focussash','heavydutyboots','kingsrock','leftovers','lifeorb',
      'lightclay','quickclaw','redcard','rockyhelmet','safetygoggles','scopelens','shellbell',
      'sitrusberry','weaknesspolicy','widelens','wiseglasses','muscleband',
      'charcoal','mysticwater','magnet','miracleseed','hardstone','sharpbeak','spelltag',
      'twistedspoon','metalcoat','dragonfang','nevermeltice','softsand','silverpowder',
      'poisonbarb','blackglasses','pixieplate',

      // Brushes (all 18 types)
      'normalbrush','firebrush','waterbrush','electricbrush','grassbrush','icebrush',
      'fightingbrush','poisonbrush','groundbrush','flyingbrush','psychicbrush','bugbrush',
      'rockbrush','ghostbrush','dragonbrush','darkbrush','steelbrush','fairybrush',

      // Custom items
      'heavyarmor','typedice','cookies','bulletproofvest','elegantcloth','armoredshell',
      'fuzzymushroom','adrenalineshot','speedbelt','typedrugs','typebulb',
    ];
    const id = this.sample(curatedIds);
    const newItem = this.dex.items.get(id);
    if (pokemon.setItem(newItem)) {
      this.add('-item', pokemon, newItem, '[from] ability: Resourceful');
    }
  },

  onTakeItem(item, pokemon, source) {
    this.add('-ability', pokemon, 'Resourceful');
    this.effectState.pendingRefill = true;
  },
  onAfterMoveSecondarySelf(pokemon, target, move) {
    if (!this.effectState.pendingRefill) return;
    this.effectState.pendingRefill = false;
    if (pokemon.fainted || pokemon.item) return;
    const curatedIds = [
      'airballoon','assaultvest','blunderpolicy','choicescarf','choiceband','choicespecs',
      'covertcloak','expertbelt','focussash','heavydutyboots','kingsrock','leftovers','lifeorb',
      'lightclay','quickclaw','redcard','rockyhelmet','safetygoggles','scopelens','shellbell',
      'sitrusberry','weaknesspolicy','widelens','wiseglasses','muscleband',
      'charcoal','mysticwater','magnet','miracleseed','hardstone','sharpbeak','spelltag',
      'twistedspoon','metalcoat','dragonfang','nevermeltice','softsand','silverpowder',
      'poisonbarb','blackglasses','pixieplate',
      'normalbrush','firebrush','waterbrush','electricbrush','grassbrush','icebrush',
      'fightingbrush','poisonbrush','groundbrush','flyingbrush','psychicbrush','bugbrush',
      'rockbrush','ghostbrush','dragonbrush','darkbrush','steelbrush','fairybrush',
      'heavyarmor','typedice','cookies','bulletproofvest','elegantcloth','armoredshell',
      'fuzzymushroom','adrenalineshot','speedbelt','typedrugs','typebulb',
    ];
    const id = this.sample(curatedIds);
    const newItem = this.dex.items.get(id);
    if (pokemon.setItem(newItem)) {
      this.add('-item', pokemon, newItem, '[from] ability: Resourceful');
    }
  },

  onUpdate(pokemon) {
    if (pokemon.item) return;
    if (this.effectState.checkedTurn === this.turn) return;
    this.effectState.checkedTurn = this.turn;
    const curatedIds = [
      'airballoon','assaultvest','blunderpolicy','choicescarf','choiceband','choicespecs',
      'covertcloak','expertbelt','focussash','heavydutyboots','kingsrock','leftovers','lifeorb',
      'lightclay','quickclaw','redcard','rockyhelmet','safetygoggles','scopelens','shellbell',
      'sitrusberry','weaknesspolicy','widelens','wiseglasses','muscleband',
      'charcoal','mysticwater','magnet','miracleseed','hardstone','sharpbeak','spelltag',
      'twistedspoon','metalcoat','dragonfang','nevermeltice','softsand','silverpowder',
      'poisonbarb','blackglasses','pixieplate',
      'normalbrush','firebrush','waterbrush','electricbrush','grassbrush','icebrush',
      'fightingbrush','poisonbrush','groundbrush','flyingbrush','psychicbrush','bugbrush',
      'rockbrush','ghostbrush','dragonbrush','darkbrush','steelbrush','fairybrush',
      'heavyarmor','typedice','cookies','bulletproofvest','elegantcloth','armoredshell',
      'fuzzymushroom','adrenalineshot','speedbelt','typedrugs','typebulb',
    ];
    const id = this.sample(curatedIds);
    const newItem = this.dex.items.get(id);
    if (pokemon.setItem(newItem)) {
      this.add('-item', pokemon, newItem, '[from] ability: Resourceful');
    }
  },

  rating: 3,
},
blastfurnace: {
  name: "Blast Furnace",
  shortDesc: "When hit by Fire: +3 random stat. After 5 hits: deal fixed 500 to foes, faint, then set Burning Field on both sides.",

  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
    (pokemon as any).m ||= {};
    pokemon.m.bfHits = 0;
    pokemon.m.bfExploding = false;
  },

  onDamagingHit(damage, target, source, move) {
    if (!move || move.category === 'Status') return;
    if (move.type !== 'Fire') return;

    // +3 to a random non-capped stat (fallback to any if all capped)
    const pool: BoostID[] = ['atk','def','spa','spd','spe'];
    const upChoices = pool.filter(s => target.boosts[s] < 6);
    const statUp = this.sample(upChoices.length ? upChoices : pool);
    this.boost({[statUp]: 3}, target, target);

    // Count Fire hits
    target.m.bfHits = (target.m.bfHits || 0) + 1;

    // Trigger at 3 Fire hits
    if (target.m.bfHits >= 3 && !target.m.bfExploding) {
      target.m.bfExploding = true;
      this.add('-activate', target, 'ability: Blast Furnace');

      // Fixed 500 direct damage to each opposing active (ignores abilities/screens/typing)
      const foes = target.side.foe.active;
      for (const foe of foes) {
        if (!foe || foe.fainted) continue;
        this.damage(500, foe, target); // direct HP loss, not a calculated move
      }

      // Apply Burning Field to BOTH sides
      const sides = [target.side, target.side.foe];
      for (const side of sides) {
        if (!side.getSideCondition('burningfield')) {
          side.addSideCondition('burningfield');
        }
      }

      // Faint the user after the blast
      if (!target.fainted) {
        this.add('-message', target.name + "'s Blast Furnace detonated!");
        target.faint();
      }

      // Reset for potential future cycles
      target.m.bfHits = 0;
      target.m.bfExploding = false;
    }
  },

  // If you prefer to reset on switch, uncomment:
  // onSwitchOut(pokemon) { if (pokemon?.m) pokemon.m.bfHits = 0; },

  rating: 4,
},
staticcollapse: {
  name: "Static Collapse",
  shortDesc: "On switch-in, randomly sets Electric→Boost/Ground→Drop or vice versa. When hit by the boost type: +1 all; by the other: -1 all (once/turn).",
  rating: 3,
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Electric' : 'Ground';
    this.effectState.dropType  = pick ? 'Ground'   : 'Electric';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Static Collapse');
    this.add('-message', `${pokemon.name}'s Static Collapse: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onSwitchIn(pokemon) {
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Electric' : 'Ground';
    this.effectState.dropType  = pick ? 'Ground'   : 'Electric';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Static Collapse');
    this.add('-message', `${pokemon.name}'s Static Collapse: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onDamagingHit(damage, target, source, move) {
    if (!damage || !move || move.category === 'Status') return;
    if (this.effectState.lastTurn === this.turn) return;
    if (move.type === this.effectState.boostType) {
      this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, target, target, this.effect);
      this.add('-message', `${target.name} is empowered by ${move.type}!`);
      this.effectState.lastTurn = this.turn;
    } else if (move.type === this.effectState.dropType) {
      this.boost({atk: -1, def: -1, spa: -1, spd: -1, spe: -1}, target, target, this.effect);
      this.add('-message', `${target.name} is weakened by ${move.type}...`);
      this.effectState.lastTurn = this.turn;
    }
  },
},

thawbloom: {
  name: "Thaw Bloom",
  shortDesc: "On switch-in, randomly sets Grass→Boost/Ice→Drop or vice versa. When hit by the boost type: +1 all; by the other: -1 all (once/turn).",
  rating: 3,
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Grass' : 'Ice';
    this.effectState.dropType  = pick ? 'Ice'   : 'Grass';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Thaw Bloom');
    this.add('-message', `${pokemon.name}'s Thaw Bloom: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onSwitchIn(pokemon) {
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Grass' : 'Ice';
    this.effectState.dropType  = pick ? 'Ice'   : 'Grass';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Thaw Bloom');
    this.add('-message', `${pokemon.name}'s Thaw Bloom: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onDamagingHit(damage, target, source, move) {
    if (!damage || !move || move.category === 'Status') return;
    if (this.effectState.lastTurn === this.turn) return;
    if (move.type === this.effectState.boostType) {
      this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, target, target, this.effect);
      this.add('-message', `${target.name} is empowered by ${move.type}!`);
      this.effectState.lastTurn = this.turn;
    } else if (move.type === this.effectState.dropType) {
      this.boost({atk: -1, def: -1, spa: -1, spd: -1, spe: -1}, target, target, this.effect);
      this.add('-message', `${target.name} is weakened by ${move.type}...`);
      this.effectState.lastTurn = this.turn;
    }
  },
},

mythicbalance: {
  name: "Mythic Balance",
  shortDesc: "On switch-in, randomly sets Dragon→Boost/Fairy→Drop or vice versa. When hit by the boost type: +1 all; by the other: -1 all (once/turn).",
  rating: 3,
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Dragon' : 'Fairy';
    this.effectState.dropType  = pick ? 'Fairy'  : 'Dragon';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Mythic Balance');
    this.add('-message', `${pokemon.name}'s Mythic Balance: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onSwitchIn(pokemon) {
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Dragon' : 'Fairy';
    this.effectState.dropType  = pick ? 'Fairy'  : 'Dragon';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Mythic Balance');
    this.add('-message', `${pokemon.name}'s Mythic Balance: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onDamagingHit(damage, target, source, move) {
    if (!damage || !move || move.category === 'Status') return;
    if (this.effectState.lastTurn === this.turn) return;
    if (move.type === this.effectState.boostType) {
      this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, target, target, this.effect);
      this.add('-message', `${target.name} is empowered by ${move.type}!`);
      this.effectState.lastTurn = this.turn;
    } else if (move.type === this.effectState.dropType) {
      this.boost({atk: -1, def: -1, spa: -1, spd: -1, spe: -1}, target, target, this.effect);
      this.add('-message', `${target.name} is weakened by ${move.type}...`);
      this.effectState.lastTurn = this.turn;
    }
  },
},

zenfury: {
  name: "Zen Fury",
  shortDesc: "On switch-in, randomly sets Fighting→Boost/Psychic→Drop or vice versa. When hit by the boost type: +1 all; by the other: -1 all (once/turn).",
  rating: 3,
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Fighting' : 'Psychic';
    this.effectState.dropType  = pick ? 'Psychic'  : 'Fighting';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Zen Fury');
    this.add('-message', `${pokemon.name}'s Zen Fury: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onSwitchIn(pokemon) {
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Fighting' : 'Psychic';
    this.effectState.dropType  = pick ? 'Psychic'  : 'Fighting';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Zen Fury');
    this.add('-message', `${pokemon.name}'s Zen Fury: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onDamagingHit(damage, target, source, move) {
    if (!damage || !move || move.category === 'Status') return;
    if (this.effectState.lastTurn === this.turn) return;
    if (move.type === this.effectState.boostType) {
      this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, target, target, this.effect);
      this.add('-message', `${target.name} is empowered by ${move.type}!`);
      this.effectState.lastTurn = this.turn;
    } else if (move.type === this.effectState.dropType) {
      this.boost({atk: -1, def: -1, spa: -1, spd: -1, spe: -1}, target, target, this.effect);
      this.add('-message', `${target.name} is weakened by ${move.type}...`);
      this.effectState.lastTurn = this.turn;
    }
  },
},

twilightharmony: {
  name: "Twilight Harmony",
  shortDesc: "On switch-in, randomly sets Dark→Boost/Fairy→Drop or vice versa. When hit by the boost type: +1 all; by the other: -1 all (once/turn).",
  rating: 3,
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Dark' : 'Fairy';
    this.effectState.dropType  = pick ? 'Fairy' : 'Dark';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Twilight Harmony');
    this.add('-message', `${pokemon.name}'s Twilight Harmony: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onSwitchIn(pokemon) {
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Dark' : 'Fairy';
    this.effectState.dropType  = pick ? 'Fairy' : 'Dark';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Twilight Harmony');
    this.add('-message', `${pokemon.name}'s Twilight Harmony: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onDamagingHit(damage, target, source, move) {
    if (!damage || !move || move.category === 'Status') return;
    if (this.effectState.lastTurn === this.turn) return;
    if (move.type === this.effectState.boostType) {
      this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, target, target, this.effect);
      this.add('-message', `${target.name} is empowered by ${move.type}!`);
      this.effectState.lastTurn = this.turn;
    } else if (move.type === this.effectState.dropType) {
      this.boost({atk: -1, def: -1, spa: -1, spd: -1, spe: -1}, target, target, this.effect);
      this.add('-message', `${target.name} is weakened by ${move.type}...`);
      this.effectState.lastTurn = this.turn;
    }
  },
},

corrosioncore: {
  name: "Corrosion Core",
  shortDesc: "On switch-in, randomly sets Steel→Boost/Poison→Drop or vice versa. When hit by the boost type: +1 all; by the other: -1 all (once/turn).",
  rating: 3,
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Steel' : 'Poison';
    this.effectState.dropType  = pick ? 'Poison' : 'Steel';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Corrosion Core');
    this.add('-message', `${pokemon.name}'s Corrosion Core: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onSwitchIn(pokemon) {
    const pick = this.randomChance(1, 2);
    this.effectState.boostType = pick ? 'Steel' : 'Poison';
    this.effectState.dropType  = pick ? 'Poison' : 'Steel';
    this.effectState.lastTurn  = -1 as number;
    this.add('-ability', pokemon, 'Corrosion Core');
    this.add('-message', `${pokemon.name}'s Corrosion Core: ${this.effectState.boostType} empowers, ${this.effectState.dropType} weakens!`);
  },
  onDamagingHit(damage, target, source, move) {
    if (!damage || !move || move.category === 'Status') return;
    if (this.effectState.lastTurn === this.turn) return;
    if (move.type === this.effectState.boostType) {
      this.boost({atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, target, target, this.effect);
      this.add('-message', `${target.name} is empowered by ${move.type}!`);
      this.effectState.lastTurn = this.turn;
    } else if (move.type === this.effectState.dropType) {
      this.boost({atk: -1, def: -1, spa: -1, spd: -1, spe: -1}, target, target, this.effect);
      this.add('-message', `${target.name} is weakened by ${move.type}...`);
      this.effectState.lastTurn = this.turn;
    }
  },
},

pinata: {
  name: "Pinata",
  shortDesc:
    "When this Pokémon faints, it scatters a random assortment of hazards (Stealth Rock, Spikes, Toxic Spikes, Sticky Web) onto the opposing side.",
  rating: 3,
  onStart(pokemon) {
	const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
  },

  onFaint(pokemon) {
    const foeSide = pokemon.side.foe;
    const hazards = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb'];

    for (const h of hazards) {
      let max = 1;
      if (h === 'spikes') max = 3;
      if (h === 'toxicspikes') max = 2;

      // Pick random number of layers (0..max)
      const layers = this.random(max + 1);

      for (let i = 0; i < layers; i++) {
        foeSide.addSideCondition(h, pokemon);
      }
    }

    this.add('-message', `${pokemon.name}'s Piñata scattered hazards everywhere!`);
  },
},
berrymaster: {
  name: "Berry Master",
  shortDesc: "Ripen + Gluttony + Cud Chew + Cheek Pouch.",

  // --- Gluttony flag (used by item/berry checks in PS) ---
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
    pokemon.abilityState.gluttony = true;
  },
  onDamage(_damage, pokemon) {
    // preserve your gluttony flag refresh
    pokemon.abilityState.gluttony = true;
  },

  // --- Cheek Pouch heal + Cud Chew bookkeeping + Ripen weaken tracking ---
  onEatItem(item, pokemon) {
  if (!item.isBerry) return;

  // Cheek Pouch: heal 1/3 max HP
  this.heal(pokemon.baseMaxhp / 3);

  // Ripen: remember if it was a resist berry
  const weakenBerries = [
    'Babiri Berry','Charti Berry','Chilan Berry','Chople Berry','Coba Berry','Colbur Berry',
    'Haban Berry','Kasib Berry','Kebia Berry','Occa Berry','Passho Berry','Payapa Berry',
    'Rindo Berry','Roseli Berry','Shuca Berry','Tanga Berry','Wacan Berry','Yache Berry',
  ];
  pokemon.abilityState.berryWeaken = weakenBerries.includes(item.name);

  // Cud Chew: if this eat is a REPLAY, don't schedule another; otherwise arm 2-turn timer
  const m = (pokemon as any).m ?? ((pokemon as any).m = {});
  if (!m.bmCudReplay) {
    m.bmCud = { berry: item, dur: 2 };
  }
},

  // --- Ripen: double heals from berries; announce like your version ---
  onTryHeal(damage, target, _source, effect) {
    if (!effect) return;
    if (effect.name === 'Berry Juice' || effect.name === 'Leftovers') {
      this.add('-activate', target, 'ability: Ripen');
    }
    if ((effect as Item).isBerry) return this.chainModify(2);
  },

  // --- Ripen: double stat boosts from berries ---
  onChangeBoost(boost, _target, _source, effect) {
    if (effect && (effect as Item).isBerry) {
      let b: BoostID;
      for (b in boost) boost[b]! *= 2;
    }
  },

  // --- Ripen: if a resist berry weakened this hit, halve again (→ 1/4 total) ---
  onSourceModifyDamagePriority: -1,
  onSourceModifyDamage(damage, source, target, move) {
    if (target.abilityState.berryWeaken) {
      target.abilityState.berryWeaken = false;
      return this.chainModify(0.5);
    }
  },

  // --- Ripen's announce when a berry is about to be eaten (kept from your code) ---
  onTryEatItemPriority: -1,
  onTryEatItem(item, pokemon) {
    this.add('-activate', pokemon, 'ability: Ripen');
  },

  // --- Cud Chew: re-eat the same berry when the 2-turn volatile ends ---
  // (implemented with simple per-mon state to avoid separate Condition object)
  onResidualOrder: 28,
onResidualSubOrder: 2,
onResidual(pokemon) {
  const m = (pokemon as any).m;
  const state = m?.bmCud;
  if (!state) return;

  state.dur--;
  if (state.dur > 0) return;

  // consume the pending replay
  delete m.bmCud;
  if (!pokemon.hp) return;

  const item: Item | undefined = state.berry;
  if (!item) return;

  // Mark this eat as a replay so onEatItem won't re-arm another Cud Chew
  m.bmCudReplay = true;

  this.add('-activate', pokemon, 'ability: Cud Chew');
  this.add('-enditem', pokemon, item.name, '[eat]');

  if (this.singleEvent('Eat', item, null, pokemon, null, null)) {
    this.runEvent('EatItem', pokemon, null, null, item);
  }
  if (item.onEat) pokemon.ateBerry = true;

  // Clear the replay flag so future (new) berries can schedule again
  delete m.bmCudReplay;
},
},

wonderwheel: {
  name: "Wonder Wheel",
  shortDesc: "Each turn picks one of the user's weaknesses. If it has only one weakness, that type does 1/2 damage; otherwise, the chosen type is immune.",
  flags: {breakable: 1},

  // Roll on switch-in and announce
  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
    const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);

    const TYPES: string[] = [
      'Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground',
      'Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy',
    ];

    // Pick only true weaknesses and exclude anything already immune this turn
    const weakTo = TYPES.filter(t => {
      // Exclude existing immunities:
      // - Type-chart immunities (e.g., Fighting->Ghost, Normal->Ghost, etc.)
      // - Ground when not grounded (Flying, Levitate, Magnet Rise, Air Balloon, etc.)
      if (!this.dex.getImmunity(t as any, pokemon)) return false;      // already immune
      if (t === 'Ground' && !pokemon.isGrounded()) return false;       // airborne/levitating
      return this.dex.getEffectiveness(t as any, pokemon) > 0;         // keep only weaknesses
    });

    const m = ((pokemon as any).m ??= {});

    if (weakTo.length) {
      const chosen = this.sample(weakTo) as string;
      m.wonderWheelType = chosen;
      m.wonderWheelHalf = (weakTo.length === 1); // exactly one weakness => halve instead of immune

      if (m.wonderWheelHalf) {
        this.add('-message', `${pokemon.name} is shrouded in a wondrous veil and ${chosen}-type moves deal half damage this turn!`);
      } else {
        this.add('-message', `${pokemon.name} is shrouded in a wondrous veil and is immune to ${chosen}-type moves this turn!`);
      }
    } else {
      m.wonderWheelType = undefined;
      m.wonderWheelHalf = false;
      this.add('-message', `${pokemon.name} is shrouded in a wondrous veil!`);
    }
  },

  // Re-roll at the end of every turn
  onResidualOrder: 27,
  onResidual(pokemon) {
    if (!pokemon.hp) return;

    const TYPES: string[] = [
      'Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground',
      'Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy',
    ];

    const weakTo = TYPES.filter(t => {
      if (!this.dex.getImmunity(t as any, pokemon)) return false;      // already immune
      if (t === 'Ground' && !pokemon.isGrounded()) return false;       // airborne/levitating
      return this.dex.getEffectiveness(t as any, pokemon) > 0;         // keep only weaknesses
    });

    const m = ((pokemon as any).m ??= {});

    if (!weakTo.length) {
      m.wonderWheelType = undefined;
      m.wonderWheelHalf = false;
      return;
    }

    const chosen = this.sample(weakTo) as string;
    m.wonderWheelType = chosen;
    m.wonderWheelHalf = (weakTo.length === 1);

    if (m.wonderWheelHalf) {
      this.add('-message', `${pokemon.name}'s Wonder Wheel shifts — ${chosen}-type moves deal half damage this turn!`);
    } else {
      this.add('-message', `${pokemon.name}'s Wonder Wheel shifts — ${chosen}-type moves are negated this turn!`);
    }
  },

  // Immunity when multiple weaknesses (chosen type) and not the half case
  onTryHit(target, _source, move) {
    if (!move || !move.type) return;
    const m = (target as any).m || {};
    const chosen = m.wonderWheelType as string | undefined;
    const half = !!m.wonderWheelHalf;
    if (!chosen || move.type !== chosen) return;
    if (half) return; // half-damage case handled below
    this.add('-immune', target, '[from] ability: Wonder Wheel');
    return null;
  },

  // Half damage when there is exactly one weakness
  onSourceModifyDamage(damage, _source, target, move) {
    const m = (target as any).m || {};
    const chosen = m.wonderWheelType as string | undefined;
    if (!m.wonderWheelHalf || !chosen) return;
    if (!move || move.category === 'Status' || move.type !== chosen) return;
    return this.chainModify(0.5);
  },
},



kpopsinger: {
  name: "Kpop Singer",
  shortDesc: "Each end of turn: user +1 to three random stats; opposing actives +1 to one random stat.",
  rating: 5,

  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
  },

  onBasePowerPriority: 7,
  onBasePower(basePower, attacker, defender, move) {
    if (move.flags['sound']) {
      this.debug('Punk Rock boost');
      return this.chainModify([5325, 4096]);
    }
  },
  onSourceModifyDamage(damage, source, target, move) {
    if (move.flags['sound']) {
      this.debug('Punk Rock weaken');
      return this.chainModify(0.5);
    }
  },

  // End-of-turn pulse
  onResidualOrder: 27,
  onResidual(pokemon) {
    if (!pokemon.hp) return;

    const pool: BoostID[] = ['atk','def','spa','spd','spe'];

    // Iterate over all currently active Pokémon (both sides)
    for (const side of this.sides) {
      for (const mon of side.active) {
        if (!mon || !mon.hp) continue;

        const boosts: Partial<BoostsTable> = {};

        // User's side gets 3 random +1s; everyone else gets 1 random +1
        
        const draws = (mon.side === pokemon.side) ? 3 : 1;

        for (let i = 0; i < draws; i++) {
          const stat = this.sample(pool);
          boosts[stat] = (boosts[stat] || 0) + 1;
        }

        this.boost(boosts, mon, pokemon, this.effect);
        this.add('-message', `${mon.name} was hyped up by Kpop Singer!`);
      }
    }
  },
},

hazyaura: {
  name: "Hazy Aura",
  shortDesc: "On switch-in, clears stat boosts of adjacent foes.",
  rating: 3,

  onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/'); // runtime types
    const base = pokemon.species.types.join('/'); // species types
    this.add('-start', pokemon, 'typechange', cur);

    for (const foe of pokemon.adjacentFoes()) {
      foe.clearBoosts();
      this.add('-clearboost', foe, '[from] ability: Hazy Aura', `[of] ${pokemon}`);
    }
  },
},

farmer: {
	name: "Farmer",
	rating: 5,
	onStart(pokemon) {
    const cur = pokemon.getTypes(true).join('/'); // runtime types
    const base = pokemon.species.types.join('/'); // species types
    this.add('-start', pokemon, 'typechange', cur);
	this.field.setWeather('sunnyday');
	},
	onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (this.field.isWeather(['sunnyday', 'desolateland']) || this.randomChance(1, 2)) {
				if (pokemon.hp && !pokemon.item && this.dex.items.get(pokemon.lastItem).isBerry) {
					pokemon.setItem(pokemon.lastItem);
					pokemon.lastItem = '';
					this.add('-item', pokemon, pokemon.getItem(), '[from] ability: Harvest');
				}
			}
		},
},
poisonmaster: {
	name: "Poison Master",
	shortDesc: "Contact moves used or received have a 30% chance to poison. Always crit poisoned targets",
	rating: 4,
	onStart(pokemon) { 
		const cur = pokemon.getTypes(true).join('/'); // runtime types 
		const base = pokemon.species.types.join('/'); // species types 
		this.add('-start', pokemon, 'typechange', cur);
		},
	onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.trySetStatus('psn', target);
				}
			}
		},
	onSourceDamagingHit(damage, target, source, move) {
			// Despite not being a secondary, Shield Dust / Covert Cloak block Poison Touch's effect
			if (target.hasAbility('shielddust') || target.hasItem('covertcloak')) return;
			if (this.checkMoveMakesContact(move, target, source)) {
				if (this.randomChance(3, 10)) {
					target.trySetStatus('psn', source);
				}
			}
		},
	onModifyCritRatio(critRatio, source, target) {
			if (target && ['psn', 'tox'].includes(target.status)) return 5;
		},

},
hypnoticeyes: {
  name: "Hypnotic Eyes",
  shortDesc: "End of each turn: 5→10→20→40→80→100% to sleep the opposing active. Resets on success.",
  onStart(pokemon) {
    // ── your snippet ──
    const cur = pokemon.getTypes(true).join('/'); // runtime types
    const base = pokemon.species.types.join('/'); // species types (kept for future use)
    this.add('-start', pokemon, 'typechange', cur);
    // ── ability init ──
    this.effectState.steps = 0;
  },
  
  onResidual(pokemon) {
    const foe = pokemon.side.foe.active[0];
    if (!foe || foe.fainted) { this.effectState.steps = 0; return; }
    if (foe.status === 'slp') { this.effectState.steps = 0; return; }

    const ladder = [5, 10, 20, 40, 80, 100];
    const idx = Math.min(this.effectState.steps ?? 0, ladder.length - 1);
    const chance = ladder[idx];

    if (this.randomChance(chance, 100)) {
      if (foe.trySetStatus('slp', pokemon)) this.effectState.steps = 0;
    } else {
      this.effectState.steps = idx + 1;
    }
  },
},

// 2) Rainbow — all 18 types at once
rainbow: {
  name: "Rainbow",
  shortDesc: "This Pokémon is all 18 types at once.",
  onStart(pokemon) {
    const allTypes = [
      'Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
      'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy',
    ];
    pokemon.setType(allTypes);
    this.add('-start', pokemon, 'typechange', allTypes.join('/'), '[from] ability: Rainbow');
  },
},


// 4) Normalize (random type each time it attacks)
normalizeplus: {
  name: "Normalize Plus",
  shortDesc: "Damaging moves change to a random type on use (announced).",
  onStart(pokemon) { 
		const cur = pokemon.getTypes(true).join('/'); // runtime types 
		const base = pokemon.species.types.join('/'); // species types 
		this.add('-start', pokemon, 'typechange', cur);
		},
  onModifyType(move, pokemon) {
    if (move.category === 'Status' || !move.type) return;

    const pool = [
      'Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
      'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy',
    ];
    const newType = this.sample(pool);

    move.type = newType;
    this.add('-message', `${pokemon.name}'s Normalize+ changed ${move.name} to ${newType}-type!`);
  },
},


// 5) Guard Stance — each turn, become weak to up to 4 random types (announced)
guardstance: {
  name: "Guard Stance",
  shortDesc:
    "End of each turn: roll 1–4 weaknesses and 4–8 resists; others neutral next turn. Ignores innate immunities.",
  onStart(pokemon) {
	const cur = pokemon.getTypes(true).join('/'); // runtime types
    const base = pokemon.species.types.join('/'); // species types
    this.add('-start', pokemon, 'typechange', cur);
    this.effectState.ready = false;
  },

  onResidualOrder: 28,
  onResidualSubOrder: 2,
  onResidual(pokemon) {
    if (pokemon.fainted) return;

    // local unique sampler (no helpers)
    const drawMany = (choices: string[], count: number): string[] => {
      const bag = choices.slice();
      const take = Math.min(count, bag.length);
      const out: string[] = [];
      for (let i = 0; i < take; i++) {
        const idx = (this as any).random(bag.length);
        out.push(bag.splice(idx, 1)[0]);
      }
      return out;
    };

    const pool = this.dex.types.names().filter(t => t !== 'Stellar' && t !== '???');

    const weakCount = (this as any).random(2, 5);
    const weakList = drawMany(pool, weakCount);

    const remaining = pool.filter(t => !weakList.includes(t));
    const resistCount = (this as any).random(3, 7);
    const resistList = drawMany(remaining, resistCount);

    this.effectState.weak = new Set(weakList);
    this.effectState.resist = new Set(resistList);
    this.effectState.ready = true;

    this.add('-message',
      `${pokemon.name} shifts its guard! Weak to: ${weakList.join(', ') || '—'}. ` +
      `Resists: ${resistList.join(', ') || '—'}. Others are neutral.`);
  },

  // Make everything neutral after the first roll; apply our sets
  onEffectiveness(typeMod, target, type, move) {
  if (!this.effectState.ready || !move || move.effectType !== 'Move') return;
  // Tell the engine what the matchup *is* this turn so the UI shows messages.
  if (this.effectState.weak?.has(move.type))  return  1;  // super effective (×2)
  if (this.effectState.resist?.has(move.type)) return -1; // resisted (×0.5)
  return 0; // neutral
},

// Remove this entirely if you had it before:
// onSourceModifyDamage(...) { ... }

onNegateImmunity(pokemon, type) {
  if (!this.effectState.ready) return;
  // Ignore innate type immunities (Normal→Ghost, Ground→Flying, etc.)
  if (type) return true;
},
},



// 6) Berry Forager — generates and immediately eats a random Berry each turn
berryforager: {
  name: "Berry Forager",
  shortDesc: "End of each turn: generates a random curated Berry and eats it immediately.",
  onResidual(pokemon) {
    if (pokemon.fainted) return;

    // Curated list (stat boosters, custap, sitrus, lum)
    const curated = [
      'Liechi Berry','Ganlon Berry','Salac Berry','Petaya Berry','Apicot Berry',
      'Lansat Berry','Starf Berry','Micle Berry','Custap Berry',
      'Sitrus Berry','Lum Berry',
    ];

    // If the holder has a major status, force Lum Berry
    const forcedLum = !!pokemon.status;
    const pickName = forcedLum ? 'Lum Berry' : (this as any).sample(curated);
    const item = this.dex.items.get(pickName);
    if (!item?.isBerry) return;

    // Temporarily replace held item
    const original = pokemon.getItem();
    if (original?.id) pokemon.takeItem();
    pokemon.setItem(item);

    const consumed = pokemon.eatItem(true);
    if (consumed) {
      this.add('-message', `${pokemon.name} foraged and ate a ${item.name}!`);

      // If Custap was eaten, prime next action priority
      if (item.id === 'custapberry') {
  			pokemon.addVolatile('bfp' as ID);
  			this.add('-message', `${pokemon.name}'s Custap primed its next action!`);
		}
    } else {
      // If the berry couldn't be used now, discard it to avoid overriding held item
      if (pokemon.item) pokemon.takeItem();
    }

    // Restore original item (if any)
    if (original?.id) pokemon.setItem(original);
  },

  // Fallback not needed since you said ultimateberrypriority exists, but harmless if left:
  onModifyPriority(priority, source, target, move) {
    if (this.effectState?.custapPrimed && move) {
      this.effectState.custapPrimed = false;
      return priority + 1;
    }
  },
  onSwitchOut(pokemon) {
    if (this.effectState) this.effectState.custapPrimed = false;
  },
},


// 7) Slapback — first time it is damaged, reflect half that damage back (even if KO’d)
slapback: {
  name: "Slapback",
  shortDesc: "The first time it takes damage, deals 1/2 of that damage back to the attacker.",
  onStart(pokemon) { 
		const cur = pokemon.getTypes(true).join('/'); // runtime types 
		const base = pokemon.species.types.join('/'); // species types 
		this.add('-start', pokemon, 'typechange', cur);
		},
  onDamagingHit(damage, target, source, move) {
    if (this.effectState.used || !source || !damage) return;
    this.effectState.used = true;
    const ret = Math.max(1, Math.floor(damage / 2));
    this.damage(ret, source, target, this.dex.abilities.get('Slapback'));
  },
},

// 8) Weatherman — summons a random weather on switch-in
weatherman: {
  name: "Weatherman",
  shortDesc: "On switch-in, sets a random weather: Sun, Rain, Sandstorm, or Snow.",
  onStart(pokemon) {
    const choice = this.sample(['sunnyday','raindance','sandstorm','snow']);
    this.field.setWeather(choice);
    this.add('-ability', pokemon, 'Weatherman', '[weather] ' + this.field.weather);
	const cur = pokemon.getTypes(true).join('/'); // runtime types 
		const base = pokemon.species.types.join('/'); // species types 
		this.add('-start', pokemon, 'typechange', cur);
  },
},

// 9) Torrential Blizzard — Snow on entry; takes half damage from Ice’s weakness types
torrentialblizzard: {
  name: "Torrential Blizzard",
  shortDesc: "On switch-in: Snowscape. While Snowscape is active: chip damage to non-Ice; Fire/Fighting/Rock/Steel moves deal 0.5×.",
  onStart(pokemon) {
    // Set Snowscape (Gen 9 "snow")
    if (!this.field.isWeather('snowscape')) {
      this.field.setWeather('snowscape', pokemon, this.effect);
    }
    // Add our custom overlay condition
    if (!this.field.pseudoWeather['torrentialblizzardfield']) {
      this.field.addPseudoWeather('torrentialblizzardfield', pokemon, this.effect);
    }
	this.add('-message', `The Blizzard is extremely strong!`);

    // Optional type-change debug you had before
    const cur = pokemon.getTypes(true).join('/');
	const base = pokemon.species.types.join('/');
    this.add('-start', pokemon, 'typechange', cur);
  },
},



// 10) Sandy Hurricane — sets Sandstorm on entry (heavy sand flavor)
sandyhurricane: {
  name: "Sandy Hurricane",
  shortDesc: "On switch-in: Sandstorm.",
  onStart(pokemon) { if (!this.field.isWeather('sandstorm')) this.field.setWeather('sandstorm');
	const cur = pokemon.getTypes(true).join('/'); // runtime types 
		const base = pokemon.species.types.join('/'); // species types 
		this.add('-start', pokemon, 'typechange', cur);
   },
},

// 11) Momentum Burst — +1 random stat every time it enters the field
momentumburst: {
  name: "Momentum Burst",
  shortDesc: "On switch-in: +1 to a random stat.",
  onStart(pokemon) {
	const cur = pokemon.getTypes(true).join('/'); // runtime types 
		const base = pokemon.species.types.join('/'); // species types 
		this.add('-start', pokemon, 'typechange', cur);
    const stat = this.sample(['atk','def','spa','spd','spe']);
    const boost: Partial<StatsTable> = {}; (boost as any)[stat] = 1;
    this.boost(boost, pokemon);
  },
},

// 12) Anti-switcher — while holder is active, foes take 1/3 max HP when they switch out
antiswitcher: {
  name: "Anti-switcher",
  shortDesc: "Opposing Pokémon take 1/3 max HP when they switch out while this is active.",
  onStart(pokemon) {
	const cur = pokemon.getTypes(true).join('/'); // runtime types
    const base = pokemon.species.types.join('/'); // species types
    this.add('-start', pokemon, 'typechange', cur);
	this.add('-ability', pokemon, 'Anti-switcher');
    this.add('-message', `${pokemon.name}'s Anti-switcher will punish swaps!`);
    pokemon.side.foe.addSideCondition('antiswitchertrap', pokemon);
  },
  onEnd(pokemon) {
    pokemon.side.foe.removeSideCondition('antiswitchertrap');
  },
},






};
