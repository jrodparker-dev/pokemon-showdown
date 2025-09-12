export const Conditions: import('../sim/dex-conditions').ConditionDataTable = {
	brn: {
		name: 'brn',
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.id === 'flameorb') {
				this.add('-status', target, 'brn', '[from] item: Flame Orb');
			} else if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'brn', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'brn');
			}
		},
		// Damage reduction is handled directly in the sim/battle.js damage function
		onResidualOrder: 10,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 16);
		},
	},
	par: {
		name: 'par',
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'par', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'par');
			}
		},
		onModifySpePriority: -101,
		onModifySpe(spe, pokemon) {
			// Paralysis occurs after all other Speed modifiers, so evaluate all modifiers up to this point first
			spe = this.finalModify(spe);
			if (!pokemon.hasAbility('quickfeet')) {
				spe = Math.floor(spe * 50 / 100);
			}
			return spe;
		},
		onBeforeMovePriority: 1,
		onBeforeMove(pokemon) {
			if (this.randomChance(1, 4)) {
				this.add('cant', pokemon, 'par');
				return false;
			}
		},
	},
	slp: {
		name: 'slp',
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'slp', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else if (sourceEffect && sourceEffect.effectType === 'Move') {
				this.add('-status', target, 'slp', `[from] move: ${sourceEffect.name}`);
			} else {
				this.add('-status', target, 'slp');
			}
			// 1-3 turns
			this.effectState.startTime = this.random(2, 5);
			this.effectState.time = this.effectState.startTime;

			if (target.removeVolatile('nightmare')) {
				this.add('-end', target, 'Nightmare', '[silent]');
			}
		},
		onBeforeMovePriority: 10,
		onBeforeMove(pokemon, target, move) {
			if (pokemon.hasAbility('earlybird')) {
				pokemon.statusState.time--;
			}
			pokemon.statusState.time--;
			if (pokemon.statusState.time <= 0) {
				pokemon.cureStatus();
				return;
			}
			this.add('cant', pokemon, 'slp');
			if (move.sleepUsable) {
				return;
			}
			return false;
		},
	},
	frz: {
		name: 'frz',
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'frz', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'frz');
			}
			if (target.species.name === 'Shaymin-Sky' && target.baseSpecies.baseSpecies === 'Shaymin') {
				target.formeChange('Shaymin', this.effect, true);
			}
		},
		onBeforeMovePriority: 10,
		onBeforeMove(pokemon, target, move) {
			if (move.flags['defrost']) return;
			if (this.randomChance(1, 5)) {
				pokemon.cureStatus();
				return;
			}
			this.add('cant', pokemon, 'frz');
			return false;
		},
		onModifyMove(move, pokemon) {
			if (move.flags['defrost']) {
				this.add('-curestatus', pokemon, 'frz', `[from] move: ${move}`);
				pokemon.clearStatus();
			}
		},
		onAfterMoveSecondary(target, source, move) {
			if (move.thawsTarget) {
				target.cureStatus();
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (move.type === 'Fire' && move.category !== 'Status' && move.id !== 'polarflare') {
				target.cureStatus();
			}
		},
	},
	psn: {
		name: 'psn',
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'psn', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'psn');
			}
		},
		onResidualOrder: 9,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 8);
		},
	},
	tox: {
		name: 'tox',
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			this.effectState.stage = 0;
			if (sourceEffect && sourceEffect.id === 'toxicorb') {
				this.add('-status', target, 'tox', '[from] item: Toxic Orb');
			} else if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'tox', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'tox');
			}
		},
		onSwitchIn() {
			this.effectState.stage = 0;
		},
		onResidualOrder: 9,
		onResidual(pokemon) {
			if (this.effectState.stage < 15) {
				this.effectState.stage++;
			}
			this.damage(this.clampIntRange(pokemon.baseMaxhp / 16, 1) * this.effectState.stage);
		},
	},
	confusion: {
		name: 'confusion',
		// this is a volatile status
		onStart(target, source, sourceEffect) {
			if (sourceEffect?.id === 'lockedmove') {
				this.add('-start', target, 'confusion', '[fatigue]');
			} else if (sourceEffect?.effectType === 'Ability') {
				this.add('-start', target, 'confusion', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-start', target, 'confusion');
			}
			const min = sourceEffect?.id === 'axekick' ? 3 : 2;
			this.effectState.time = this.random(min, 6);
		},
		onEnd(target) {
			this.add('-end', target, 'confusion');
		},
		onBeforeMovePriority: 3,
		onBeforeMove(pokemon) {
			pokemon.volatiles['confusion'].time--;
			if (!pokemon.volatiles['confusion'].time) {
				pokemon.removeVolatile('confusion');
				return;
			}
			this.add('-activate', pokemon, 'confusion');
			if (!this.randomChance(33, 100)) {
				return;
			}
			this.activeTarget = pokemon;
			const damage = this.actions.getConfusionDamage(pokemon, 40);
			if (typeof damage !== 'number') throw new Error("Confusion damage not dealt");
			const activeMove = { id: this.toID('confused'), effectType: 'Move', type: '???' };
			this.damage(damage, pokemon, pokemon, activeMove as ActiveMove);
			return false;
		},
	},
	flinch: {
		name: 'flinch',
		duration: 1,
		onBeforeMovePriority: 8,
		onBeforeMove(pokemon) {
			this.add('cant', pokemon, 'flinch');
			this.runEvent('Flinch', pokemon);
			return false;
		},
	},
	trapped: {
		name: 'trapped',
		noCopy: true,
		onTrapPokemon(pokemon) {
			pokemon.tryTrap();
		},
		onStart(target) {
			this.add('-activate', target, 'trapped');
		},
	},
	trapper: {
		name: 'trapper',
		noCopy: true,
	},
	partiallytrapped: {
		name: 'partiallytrapped',
		duration: 5,
		durationCallback(target, source) {
			if (source?.hasItem('gripclaw')) return 8;
			return this.random(5, 7);
		},
		onStart(pokemon, source) {
			this.add('-activate', pokemon, 'move: ' + this.effectState.sourceEffect, `[of] ${source}`);
			this.effectState.boundDivisor = source.hasItem('bindingband') ? 6 : 8;
		},
		onResidualOrder: 13,
		onResidual(pokemon) {
			const source = this.effectState.source;
			// G-Max Centiferno and G-Max Sandblast continue even after the user leaves the field
			const gmaxEffect = ['gmaxcentiferno', 'gmaxsandblast'].includes(this.effectState.sourceEffect.id);
			if (source && (!source.isActive || source.hp <= 0 || !source.activeTurns) && !gmaxEffect) {
				delete pokemon.volatiles['partiallytrapped'];
				this.add('-end', pokemon, this.effectState.sourceEffect, '[partiallytrapped]', '[silent]');
				return;
			}
			this.damage(pokemon.baseMaxhp / this.effectState.boundDivisor);
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, this.effectState.sourceEffect, '[partiallytrapped]');
		},
		onTrapPokemon(pokemon) {
			const gmaxEffect = ['gmaxcentiferno', 'gmaxsandblast'].includes(this.effectState.sourceEffect.id);
			if (this.effectState.source?.isActive || gmaxEffect) pokemon.tryTrap();
		},
	},
	lockedmove: {
		// Outrage, Thrash, Petal Dance...
		name: 'lockedmove',
		duration: 2,
		onResidual(target) {
			if (target.status === 'slp') {
				// don't lock, and bypass confusion for calming
				delete target.volatiles['lockedmove'];
			}
			this.effectState.trueDuration--;
		},
		onStart(target, source, effect) {
			this.effectState.trueDuration = this.random(2, 4);
			this.effectState.move = effect.id;
		},
		onRestart() {
			if (this.effectState.trueDuration >= 2) {
				this.effectState.duration = 2;
			}
		},
		onAfterMove(pokemon) {
			if (this.effectState.duration === 1) {
				pokemon.removeVolatile('lockedmove');
			}
		},
		onEnd(target) {
			if (this.effectState.trueDuration > 1) return;
			target.addVolatile('confusion');
		},
		onLockMove(pokemon) {
			if (pokemon.volatiles['dynamax']) return;
			return this.effectState.move;
		},
	},
	twoturnmove: {
		// Skull Bash, SolarBeam, Sky Drop...
		name: 'twoturnmove',
		duration: 2,
		onStart(attacker, defender, effect) {
			// ("attacker" is the Pokemon using the two turn move and the Pokemon this condition is being applied to)
			this.effectState.move = effect.id;
			attacker.addVolatile(effect.id);
			// lastMoveTargetLoc is the location of the originally targeted slot before any redirection
			// note that this is not updated for moves called by other moves
			// i.e. if Dig is called by Metronome, lastMoveTargetLoc will still be the user's location
			let moveTargetLoc: number = attacker.lastMoveTargetLoc!;
			if (effect.sourceEffect && this.dex.moves.get(effect.id).target !== 'self') {
				// this move was called by another move such as Metronome
				// and needs a random target to be determined this turn
				// it will already have one by now if there is any valid target
				// but if there isn't one we need to choose a random slot now
				if (defender.fainted) {
					defender = this.sample(attacker.foes(true));
				}
				moveTargetLoc = attacker.getLocOf(defender);
			}
			attacker.volatiles[effect.id].targetLoc = moveTargetLoc;
			this.attrLastMove('[still]');
			// Run side-effects normally associated with hitting (e.g., Protean, Libero)
			this.runEvent('PrepareHit', attacker, defender, effect);
		},
		onEnd(target) {
			target.removeVolatile(this.effectState.move);
		},
		onLockMove() {
			return this.effectState.move;
		},
		onMoveAborted(pokemon) {
			pokemon.removeVolatile('twoturnmove');
		},
	},
	choicelock: {
		name: 'choicelock',
		noCopy: true,
		onStart(pokemon) {
			if (!this.activeMove) throw new Error("Battle.activeMove is null");
			if (!this.activeMove.id || this.activeMove.hasBounced || this.activeMove.sourceEffect === 'snatch') return false;
			this.effectState.move = this.activeMove.id;
		},
		onBeforeMove(pokemon, target, move) {
			if (!pokemon.getItem().isChoice) {
				pokemon.removeVolatile('choicelock');
				return;
			}
			if (
				!pokemon.ignoringItem() && !pokemon.volatiles['dynamax'] &&
				move.id !== this.effectState.move && move.id !== 'struggle'
			) {
				// Fails unless the Choice item is being ignored, and no PP is lost
				this.addMove('move', pokemon, move.name);
				this.attrLastMove('[still]');
				this.debug("Disabled by Choice item lock");
				this.add('-fail', pokemon);
				return false;
			}
		},
		onDisableMove(pokemon) {
			if (!pokemon.getItem().isChoice || !pokemon.hasMove(this.effectState.move)) {
				pokemon.removeVolatile('choicelock');
				return;
			}
			if (pokemon.ignoringItem() || pokemon.volatiles['dynamax']) {
				return;
			}
			for (const moveSlot of pokemon.moveSlots) {
				if (moveSlot.id !== this.effectState.move) {
					pokemon.disableMove(moveSlot.id, false, this.effectState.sourceEffect);
				}
			}
		},
	},
	mustrecharge: {
		name: 'mustrecharge',
		duration: 2,
		onBeforeMovePriority: 11,
		onBeforeMove(pokemon) {
			this.add('cant', pokemon, 'recharge');
			pokemon.removeVolatile('mustrecharge');
			pokemon.removeVolatile('truant');
			return null;
		},
		onStart(pokemon) {
			this.add('-mustrecharge', pokemon);
		},
		onLockMove: 'recharge',
	},
	futuremove: {
		// this is a slot condition
		name: 'futuremove',
		onStart(target) {
			this.effectState.targetSlot = target.getSlot();
			this.effectState.endingTurn = (this.turn - 1) + 2;
			if (this.effectState.endingTurn >= 254) {
				this.hint(`In Gen 8+, Future attacks will never resolve when used on the 255th turn or later.`);
			}
		},
		onResidualOrder: 3,
		onResidual(target: Pokemon) {
			if (this.getOverflowedTurnCount() < this.effectState.endingTurn) return;
			target.side.removeSlotCondition(this.getAtSlot(this.effectState.targetSlot), 'futuremove');
		},
		onEnd(target) {
			const data = this.effectState;
			// time's up; time to hit! :D
			const move = this.dex.moves.get(data.move);
			if (target.fainted || target === data.source) {
				this.hint(`${move.name} did not hit because the target is ${(target.fainted ? 'fainted' : 'the user')}.`);
				return;
			}

			this.add('-end', target, 'move: ' + move.name);
			target.removeVolatile('Protect');
			target.removeVolatile('Endure');

			if (data.source.hasAbility('infiltrator') && this.gen >= 6) {
				data.moveData.infiltrates = true;
			}
			if (data.source.hasAbility('normalize') && this.gen >= 6) {
				data.moveData.type = 'Normal';
			}
			const hitMove = new this.dex.Move(data.moveData) as ActiveMove;

			this.actions.trySpreadMoveHit([target], data.source, hitMove, true);
			if (data.source.isActive && data.source.hasItem('lifeorb') && this.gen >= 5) {
				this.singleEvent('AfterMoveSecondarySelf', data.source.getItem(), data.source.itemState, data.source, target, data.source.getItem());
			}
			this.activeMove = null;

			this.checkWin();
		},
	},
	healreplacement: {
		// this is a slot condition
		name: 'healreplacement',
		onStart(target, source, sourceEffect) {
			this.effectState.sourceEffect = sourceEffect;
			this.add('-activate', source, 'healreplacement');
		},
		onSwitchIn(target) {
			if (!target.fainted) {
				target.heal(target.maxhp);
				this.add('-heal', target, target.getHealth, '[from] move: ' + this.effectState.sourceEffect, '[zeffect]');
				target.side.removeSlotCondition(target, 'healreplacement');
			}
		},
	},
	stall: {
		// Protect, Detect, Endure counter
		name: 'stall',
		duration: 2,
		counterMax: 729,
		onStart() {
			this.effectState.counter = 3;
		},
		onStallMove(pokemon) {
			// this.effectState.counter should never be undefined here.
			// However, just in case, use 1 if it is undefined.
			const counter = this.effectState.counter || 1;
			this.debug(`Success chance: ${Math.round(100 / counter)}%`);
			const success = this.randomChance(1, counter);
			if (!success) delete pokemon.volatiles['stall'];
			return success;
		},
		onRestart() {
			if (this.effectState.counter < (this.effect as Condition).counterMax!) {
				this.effectState.counter *= 3;
			}
			this.effectState.duration = 2;
		},
	},
	gem: {
		name: 'gem',
		duration: 1,
		affectsFainted: true,
		onBasePowerPriority: 14,
		onBasePower(basePower, user, target, move) {
			this.debug('Gem Boost');
			return this.chainModify([5325, 4096]);
		},
	},

	// weather is implemented here since it's so important to the game

	raindance: {
		name: 'RainDance',
		effectType: 'Weather',
		duration: 5,
		durationCallback(source, effect) {
			if (source?.hasItem('damprock')) {
				return 8;
			}
			return 5;
		},
		onWeatherModifyDamage(damage, attacker, defender, move) {
			if (defender.hasItem('utilityumbrella')) return;
			if (move.type === 'Water') {
				this.debug('rain water boost');
				return this.chainModify(1.5);
			}
			if (move.type === 'Fire') {
				this.debug('rain fire suppress');
				return this.chainModify(0.5);
			}
		},
		onFieldStart(field, source, effect) {
			if (effect?.effectType === 'Ability') {
				if (this.gen <= 5) this.effectState.duration = 0;
				this.add('-weather', 'RainDance', '[from] ability: ' + effect.name, `[of] ${source}`);
			} else {
				this.add('-weather', 'RainDance');
			}
		},
		onFieldResidualOrder: 1,
		onFieldResidual() {
			this.add('-weather', 'RainDance', '[upkeep]');
			this.eachEvent('Weather');
		},
		onFieldEnd() {
			this.add('-weather', 'none');
		},
	},
	primordialsea: {
		name: 'PrimordialSea',
		effectType: 'Weather',
		duration: 0,
		onTryMovePriority: 1,
		onTryMove(attacker, defender, move) {
			if (move.type === 'Fire' && move.category !== 'Status') {
				this.debug('Primordial Sea fire suppress');
				this.add('-fail', attacker, move, '[from] Primordial Sea');
				this.attrLastMove('[still]');
				return null;
			}
		},
		onWeatherModifyDamage(damage, attacker, defender, move) {
			if (defender.hasItem('utilityumbrella')) return;
			if (move.type === 'Water') {
				this.debug('Rain water boost');
				return this.chainModify(1.5);
			}
		},
		onFieldStart(field, source, effect) {
			this.add('-weather', 'PrimordialSea', '[from] ability: ' + effect.name, `[of] ${source}`);
		},
		onFieldResidualOrder: 1,
		onFieldResidual() {
			this.add('-weather', 'PrimordialSea', '[upkeep]');
			this.eachEvent('Weather');
		},
		onFieldEnd() {
			this.add('-weather', 'none');
		},
	},
	sunnyday: {
		name: 'SunnyDay',
		effectType: 'Weather',
		duration: 5,
		durationCallback(source, effect) {
			if (source?.hasItem('heatrock')) {
				return 8;
			}
			return 5;
		},
		onWeatherModifyDamage(damage, attacker, defender, move) {
			if (move.id === 'hydrosteam' && !attacker.hasItem('utilityumbrella')) {
				this.debug('Sunny Day Hydro Steam boost');
				return this.chainModify(1.5);
			}
			if (defender.hasItem('utilityumbrella')) return;
			if (move.type === 'Fire') {
				this.debug('Sunny Day fire boost');
				return this.chainModify(1.5);
			}
			if (move.type === 'Water') {
				this.debug('Sunny Day water suppress');
				return this.chainModify(0.5);
			}
		},
		onFieldStart(battle, source, effect) {
			if (effect?.effectType === 'Ability') {
				if (this.gen <= 5) this.effectState.duration = 0;
				this.add('-weather', 'SunnyDay', '[from] ability: ' + effect.name, `[of] ${source}`);
			} else {
				this.add('-weather', 'SunnyDay');
			}
		},
		onImmunity(type, pokemon) {
			if (pokemon.hasItem('utilityumbrella')) return;
			if (type === 'frz') return false;
		},
		onFieldResidualOrder: 1,
		onFieldResidual() {
			this.add('-weather', 'SunnyDay', '[upkeep]');
			this.eachEvent('Weather');
		},
		onFieldEnd() {
			this.add('-weather', 'none');
		},
	},
	desolateland: {
		name: 'DesolateLand',
		effectType: 'Weather',
		duration: 0,
		onTryMovePriority: 1,
		onTryMove(attacker, defender, move) {
			if (move.type === 'Water' && move.category !== 'Status') {
				this.debug('Desolate Land water suppress');
				this.add('-fail', attacker, move, '[from] Desolate Land');
				this.attrLastMove('[still]');
				return null;
			}
		},
		onWeatherModifyDamage(damage, attacker, defender, move) {
			if (defender.hasItem('utilityumbrella')) return;
			if (move.type === 'Fire') {
				this.debug('Sunny Day fire boost');
				return this.chainModify(1.5);
			}
		},
		onFieldStart(field, source, effect) {
			this.add('-weather', 'DesolateLand', '[from] ability: ' + effect.name, `[of] ${source}`);
		},
		onImmunity(type, pokemon) {
			if (pokemon.hasItem('utilityumbrella')) return;
			if (type === 'frz') return false;
		},
		onFieldResidualOrder: 1,
		onFieldResidual() {
			this.add('-weather', 'DesolateLand', '[upkeep]');
			this.eachEvent('Weather');
		},
		onFieldEnd() {
			this.add('-weather', 'none');
		},
	},
	sandstorm: {
		name: 'Sandstorm',
		effectType: 'Weather',
		duration: 5,
		durationCallback(source, effect) {
			if (source?.hasItem('smoothrock')) {
				return 8;
			}
			return 5;
		},
		// This should be applied directly to the stat before any of the other modifiers are chained
		// So we give it increased priority.
		onModifySpDPriority: 10,
		onModifySpD(spd, pokemon) {
			if (pokemon.hasType('Rock') && this.field.isWeather('sandstorm')) {
				return this.modify(spd, 1.5);
			}
		},
		onFieldStart(field, source, effect) {
			if (effect?.effectType === 'Ability') {
				if (this.gen <= 5) this.effectState.duration = 0;
				this.add('-weather', 'Sandstorm', '[from] ability: ' + effect.name, `[of] ${source}`);
			} else {
				this.add('-weather', 'Sandstorm');
			}
		},
		onFieldResidualOrder: 1,
		onFieldResidual() {
			this.add('-weather', 'Sandstorm', '[upkeep]');
			if (this.field.isWeather('sandstorm')) this.eachEvent('Weather');
		},
		onWeather(target) {
			this.damage(target.baseMaxhp / 16);
		},
		onFieldEnd() {
			this.add('-weather', 'none');
		},
	},
	hail: {
		name: 'Hail',
		effectType: 'Weather',
		duration: 5,
		durationCallback(source, effect) {
			if (source?.hasItem('icyrock')) {
				return 8;
			}
			return 5;
		},
		onFieldStart(field, source, effect) {
			if (effect?.effectType === 'Ability') {
				if (this.gen <= 5) this.effectState.duration = 0;
				this.add('-weather', 'Hail', '[from] ability: ' + effect.name, `[of] ${source}`);
			} else {
				this.add('-weather', 'Hail');
			}
		},
		onFieldResidualOrder: 1,
		onFieldResidual() {
			this.add('-weather', 'Hail', '[upkeep]');
			if (this.field.isWeather('hail')) this.eachEvent('Weather');
		},
		onWeather(target) {
			this.damage(target.baseMaxhp / 16);
		},
		onFieldEnd() {
			this.add('-weather', 'none');
		},
	},
	snowscape: {
		name: 'Snowscape',
		effectType: 'Weather',
		duration: 5,
		durationCallback(source, effect) {
			if (source?.hasItem('icyrock')) {
				return 8;
			}
			return 5;
		},
		onModifyDefPriority: 10,
		onModifyDef(def, pokemon) {
			if (pokemon.hasType('Ice') && this.field.isWeather('snowscape')) {
				return this.modify(def, 1.5);
			}
		},
		onFieldStart(field, source, effect) {
			if (effect?.effectType === 'Ability') {
				if (this.gen <= 5) this.effectState.duration = 0;
				this.add('-weather', 'Snowscape', '[from] ability: ' + effect.name, `[of] ${source}`);
			} else {
				this.add('-weather', 'Snowscape');
			}
		},
		onFieldResidualOrder: 1,
		onFieldResidual() {
			this.add('-weather', 'Snowscape', '[upkeep]');
			if (this.field.isWeather('snowscape')) this.eachEvent('Weather');
		},
		onFieldEnd() {
			this.add('-weather', 'none');
		},
	},
	deltastream: {
		name: 'DeltaStream',
		effectType: 'Weather',
		duration: 0,
		onEffectivenessPriority: -1,
		onEffectiveness(typeMod, target, type, move) {
			if (move && move.effectType === 'Move' && move.category !== 'Status' && type === 'Flying' && typeMod > 0) {
				this.add('-fieldactivate', 'Delta Stream');
				return 0;
			}
		},
		onFieldStart(field, source, effect) {
			this.add('-weather', 'DeltaStream', '[from] ability: ' + effect.name, `[of] ${source}`);
		},
		onFieldResidualOrder: 1,
		onFieldResidual() {
			this.add('-weather', 'DeltaStream', '[upkeep]');
			this.eachEvent('Weather');
		},
		onFieldEnd() {
			this.add('-weather', 'none');
		},
	},

	dynamax: {
		name: 'Dynamax',
		noCopy: true,
		onStart(pokemon) {
			this.effectState.turns = 0;
			pokemon.removeVolatile('minimize');
			pokemon.removeVolatile('substitute');
			if (pokemon.volatiles['torment']) {
				delete pokemon.volatiles['torment'];
				this.add('-end', pokemon, 'Torment', '[silent]');
			}
			if (['cramorantgulping', 'cramorantgorging'].includes(pokemon.species.id) && !pokemon.transformed) {
				pokemon.formeChange('cramorant');
			}
			this.add('-start', pokemon, 'Dynamax', pokemon.gigantamax ? 'Gmax' : '');
			if (pokemon.baseSpecies.name === 'Shedinja') return;

			// Changes based on dynamax level, 2 is max (at LVL 10)
			const ratio = 1.5 + (pokemon.dynamaxLevel * 0.05);

			pokemon.maxhp = Math.floor(pokemon.maxhp * ratio);
			pokemon.hp = Math.floor(pokemon.hp * ratio);
			this.add('-heal', pokemon, pokemon.getHealth, '[silent]');
		},
		onTryAddVolatile(status, pokemon) {
			if (status.id === 'flinch') return null;
		},
		onBeforeSwitchOutPriority: -1,
		onBeforeSwitchOut(pokemon) {
			pokemon.removeVolatile('dynamax');
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (move.id === 'behemothbash' || move.id === 'behemothblade' || move.id === 'dynamaxcannon') {
				return this.chainModify(2);
			}
		},
		onDragOutPriority: 2,
		onDragOut(pokemon) {
			this.add('-block', pokemon, 'Dynamax');
			return null;
		},
		onResidualPriority: -100,
		onResidual() {
			this.effectState.turns++;
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, 'Dynamax');
			if (pokemon.baseSpecies.name === 'Shedinja') return;
			pokemon.hp = pokemon.getUndynamaxedHP();
			pokemon.maxhp = pokemon.baseMaxhp;
			this.add('-heal', pokemon, pokemon.getHealth, '[silent]');
		},
	},

	// Commander needs two conditions so they are implemented here
	// Dondozo
	commanded: {
		name: "Commanded",
		noCopy: true,
		onStart(pokemon) {
			this.boost({ atk: 2, spa: 2, spe: 2, def: 2, spd: 2 }, pokemon);
		},
		onDragOutPriority: 2,
		onDragOut() {
			return false;
		},
		// Prevents Shed Shell allowing a swap
		onTrapPokemonPriority: -11,
		onTrapPokemon(pokemon) {
			pokemon.trapped = true;
		},
	},
	// Tatsugiri
	commanding: {
		name: "Commanding",
		noCopy: true,
		onDragOutPriority: 2,
		onDragOut() {
			return false;
		},
		// Prevents Shed Shell allowing a swap
		onTrapPokemonPriority: -11,
		onTrapPokemon(pokemon) {
			pokemon.trapped = true;
		},
		// Dodging moves is handled in BattleActions#hitStepInvulnerabilityEvent
		// This is here for moves that manually call this event like Perish Song
		onInvulnerability: false,
		onBeforeTurn(pokemon) {
			this.queue.cancelAction(pokemon);
		},
	},

	// Arceus and Silvally's actual typing is implemented here.
	// Their true typing for all their formes is Normal, and it's only
	// Multitype and RKS System, respectively, that changes their type,
	// but their formes are specified to be their corresponding type
	// in the Pokedex, so that needs to be overridden.
	// This is mainly relevant for Hackmons Cup and Balanced Hackmons.
	arceus: {
		name: 'Arceus',
		onTypePriority: 1,
		onType(types, pokemon) {
			if (pokemon.transformed || pokemon.ability !== 'multitype' && this.gen >= 8) return types;
			let type: string | undefined = 'Normal';
			if (pokemon.ability === 'multitype') {
				type = pokemon.getItem().onPlate;
				if (!type) {
					type = 'Normal';
				}
			}
			return [type];
		},
	},
	silvally: {
		name: 'Silvally',
		onTypePriority: 1,
		onType(types, pokemon) {
			if (pokemon.transformed || pokemon.ability !== 'rkssystem' && this.gen >= 8) return types;
			let type: string | undefined = 'Normal';
			if (pokemon.ability === 'rkssystem') {
				type = pokemon.getItem().onMemory;
				if (!type) {
					type = 'Normal';
				}
			}
			return [type];
		},
	},
	rolloutstorage: {
		name: 'rolloutstorage',
		duration: 2,
		onBasePower(relayVar, source, target, move) {
			let bp = Math.max(1, move.basePower);
			bp *= 2 ** source.volatiles['rolloutstorage'].contactHitCount;
			if (source.volatiles['defensecurl']) {
				bp *= 2;
			}
			source.removeVolatile('rolloutstorage');
			return bp;
		},
	},
	// In data/conditions.ts
twinvines: {
    // This is a volatile status. It should be a standalone object.
    name: 'twinvines',
    duration: 1,

    onStart(pokemon, source) {
        // We capture the source here to use it later for the damage calculation.
        this.effectState.source = source;
		this.effectState.didProc = false;
        this.add('-start', pokemon, 'Twin Vines', '[silent]');
    },
    

    onEnd(pokemon) {

		if (this.effectState.didProc) return;
		this.effectState.didProc = true;
		const source = this.effectState.source;
        if (!source || source.fainted || !pokemon.hp || pokemon.fainted) {
            this.debug('Ending Twin Vines effect due to fainted source or target');
            pokemon.removeVolatile('twinvines');
            return;
        }
		const moveData = {
			id: 'boop' as ID,
            name: 'Boop',
            accuracy: 100,
            basePower: 60,
            category: 'Physical',
            type: 'Grass',
            flags: {},
            priority: 0,
            target: 'normal',
		}


        // This is the correct way to get damage from a basePower.
        const damage = this.actions.getDamage(source, pokemon, moveData as any);
        if (typeof damage === 'number' && damage > 0) {
            this.damage(damage, pokemon, source, this.effect);
            this.add('-message', `${pokemon.name} was hit by the Twin Vines end-of-turn attack!`);
        }  
		this.add('-end', pokemon, 'Twin Vines')
    },
},
// data/conditions.ts
darkterrain: {
  name: "Dark Terrain",
  effectType: 'Terrain',
  duration: 5,
  durationCallback(source, effect) {
    if (source?.hasItem?.('terrainextender')) return 8;
    return 5;
  },
  onFieldStart(field, source, effect) {
    if (effect?.effectType === 'Ability') {
      this.add('-fieldstart', 'move: Dark Terrain', '[from] ability: ' + effect.name, '[of] ' + source);
    } else {
      this.add('-fieldstart', 'move: Dark Terrain');
    }
  },
  onFieldEnd() {
    this.add('-fieldend', 'Dark Terrain');
  },

  // Global accuracy modifier (like Gravity). This is the important one.
  onModifyAccuracy(accuracy, target, source, move) {
    if (typeof accuracy !== 'number') return;
    // Only affect grounded users (source is the attacker)
    if (!source || !source.isGrounded() || source.isSemiInvulnerable()) return;
    this.debug('dark terrain accuracy drop (global)');
    // 0.7× in fixed-point: 0.7 * 4096 ≈ 2867
    return this.chainModify([2867, 4096]);
  },

  // Optional: keep this too; some code paths consult source-side hooks
  onSourceModifyAccuracy(accuracy, attacker, defender, move) {
    if (typeof accuracy !== 'number') return;
    if (!attacker.isGrounded() || attacker.isSemiInvulnerable()) return;
    this.debug('dark terrain accuracy drop (source)');
    return this.chainModify([2867, 4096]);
  },
},
burningfield: {
  name: "Burning Field",

  // use the side residual hook (not onResidual)
  onSideResidualOrder: 6,
  onSideResidual(side) {
    for (const mon of side.active) {
      if (!mon || mon.fainted) continue;

      // 12.5% max HP chip
      this.damage(mon.baseMaxhp / 8, mon, null, this.dex.conditions.get('burningfield'));

      // 15% burn chance (respects immunities like Fire-type, Safeguard, etc.)
      if (!mon.status && mon.runStatusImmunity('brn') && this.randomChance(3, 20)) {
        mon.trySetStatus('brn', null, this.dex.conditions.get('burningfield'));
      }
    }
  },

  onSideStart(side) {
    this.add('-sidestart', side, 'Burning Field');
  },

  onSwitchIn(pokemon) {
    if (pokemon.hasType('Water') && pokemon.side.getSideCondition('burningfield')) {
      pokemon.side.removeSideCondition('burningfield');
      this.add('-sideend', pokemon.side, 'Burning Field', '[from] Water-type switch-in');
    }
  },

  onSideEnd(side) {
    this.add('-sideend', side, 'Burning Field');
  },
},
ultimateberrypriority: {
    name: "Ultimate Berry (Priority)",
    onStart(pokemon) {
      (this.effectState as any).primed = false;
    },

    // End-of-turn: arm it so it applies starting next turn
    onResidualOrder: 15,
    onResidualSubOrder: 1,
    onResidual(pokemon) {
      const st = this.effectState as any;
      if (!st.primed) {
        st.primed = true;
        // optional debug
         this.add('-message', `priority primed for ${pokemon.name}'s next action`);
      }
    },

    // Give +1 priority only if we’re primed (i.e., starting the turn after it was applied)
    onModifyPriority(priority, pokemon, _target, move) {
      if (!move) return;
      const st = this.effectState as any;
      if (!st.primed) return;          // not active this turn
      return priority + 1;              // active next turn
    },

    // Consume after the holder actually attempts a move (hit or miss)
    onAfterMove(pokemon) {
      const st = this.effectState as any;
      if (st.primed) pokemon.removeVolatile('ultimateberrypriority');
    },

    // If their action is aborted (flinch/full-para/etc.), still consume
    onMoveAborted(pokemon) {
      const st = this.effectState as any;
      if (st.primed) pokemon.removeVolatile('ultimateberrypriority');
    },

    // Clean up on switch
    onSwitchOut(pokemon) {
      if (pokemon.volatiles['ultimateberrypriority']) {
        pokemon.removeVolatile('ultimateberrypriority');
      }
    },
  },
aidofrevivalwatch: {
    name: 'Aid of Revival Watch',

    // Keep a simple "pending" toggle – the engine will force the revived mon
    // to switch in immediately after the slot condition is set.
    onSideStart(this: Battle, side: Side) {
      // effectState is safe to mutate; initialize a small state blob
      (this.effectState as any).pending = true;
    },

    onSwitchIn(this: Battle, pokemon: Pokemon) {
      const st = this.effectState as any;
      if (!st.pending) return;

      // We only want to act once – on the revived mon that just switched in.
      st.pending = false;

      // --- Begin makeover logic ---

      // 1) pick a random fully-evolved, standard species (no megas, no battleOnly, no Gmax)
      const all = this.dex.species.all().filter(s =>
        s.exists && !s.prevo && !s.nfe &&
        !(s as any).battleOnly && !(s as any).isNonstandard &&
        !(s as any).isMega && !(s as any).isPrimal && !(s as any).isGigantamax
      );
      const species = this.sample(all);

      // 2) build 3-move kit with preference for STABs
      const learnsets = (this.dex.data as any).Learnsets as
        Record<string, {learnset?: Record<string, AnyObject>}>;
      const ls = learnsets?.[species.id];
      let moveIds: ID[] = [];

      if (ls?.learnset) {
        const allIds = Object.keys(ls.learnset).filter(id => this.dex.moves.get(id).exists);
        const mObjs = allIds.map(id => this.dex.moves.get(id));
        const isDamaging = (m: Move) => m.category !== 'Status' && (m.basePower > 0 || (m as any).damage || (m as any).ohko);

        const [t1, t2] = species.types;
        const stab1 = mObjs.filter(m => m.type === t1 && isDamaging(m)).map(m => m.id as ID);
        const stab2 = t2 ? mObjs.filter(m => m.type === t2 && isDamaging(m)).map(m => m.id as ID) : [];

        const takeOne = (arr: ID[]) => {
          if (!arr.length) return;
          const pick = this.sample(arr);
          if (!moveIds.includes(pick)) moveIds.push(pick);
        };

        takeOne(stab1);
        if (t2) takeOne(stab2);

        const damagingLeft = mObjs.filter(m => isDamaging(m) && !moveIds.includes(m.id as ID)).map(m => m.id as ID);
        while (moveIds.length < 3 && damagingLeft.length) {
          const pick = damagingLeft.splice(this.random(damagingLeft.length), 1)[0];
          if (!moveIds.includes(pick)) moveIds.push(pick);
        }

        const fillers = allIds.filter(id => !moveIds.includes(id as ID)).map(id => id as ID);
        while (moveIds.length < 3 && fillers.length) {
          moveIds.push(fillers.splice(this.random(fillers.length), 1)[0]);
        }
      }

      if (moveIds.length < 3) moveIds = ['tackle' as ID, 'protect' as ID, 'substitute' as ID];

      // 3) ability – random from species’ ability slots
      const abilVals = Object.values((species as any).abilities || {}).filter(Boolean) as string[];
      const abilityId: ID = abilVals.length ? this.toID(this.sample(abilVals)) as ID : '' as ID;

      // 4) curated item pool + Z-Crystals
      const curated: ID[] = [
        'airballoon','assaultvest','blunderpolicy','choicescarf','choiceband','choicespecs',
        'covertcloak','expertbelt','focussash','heavydutyboots','kingsrock','leftovers',
        'lifeorb','lightclay','quickclaw','redcard','rockyhelmet','safetygoggles','scopelens',
        'shellbell','sitrusberry','weaknesspolicy','widelens','wiseglasses','muscleband',
        'charcoal','mysticwater','magnet','miracleseed','hardstone','sharpbeak','spelltag',
        'twistedspoon','metalcoat','dragonfang','nevermeltice','softsand','silverpowder',
        'poisonbarb','blackglasses','pixieplate',
      ].map(x => this.toID(x)) as ID[];

      const fixedItems = curated.map(id => this.dex.items.get(id)).filter(it => it?.exists);
      const zCrystals = this.dex.items.all().filter(it => it.exists && ((it as any).zMove || (it as any).zMoveType));
      const items = [...new Map([...fixedItems, ...zCrystals].map(it => [it.id, it])).values()];
      const itemId: ID = items.length ? (this.sample(items) as Item).id as ID : '' as ID;

      // 5) apply makeover
      // species
      const newForme = this.dex.species.get(species.id);
      // The third argument (true) bypasses ability/move legality checks; intended for scripted changes.
      pokemon.formeChange(newForme, this.effect, true);

      // ability
      if (abilityId) pokemon.setAbility(abilityId);

      // item
      if (itemId) pokemon.setItem(itemId);

      // --- overwrite moves (in place) ---
pokemon.moveSlots.splice(0, pokemon.moveSlots.length);
    (pokemon.baseMoveSlots as any).splice(0, (pokemon.baseMoveSlots as any).length);

    for (const id of moveIds) {
      const mv = this.dex.moves.get(id);
      const slot = {
        move: mv.name,
        id: mv.id as ID,
        pp: mv.pp,
        maxpp: mv.pp,
        target: mv.target,
        disabled: false,
        disabledSource: '',
        used: false,            // many forks require this field
      };
      pokemon.moveSlots.push({ ...slot });
      (pokemon.baseMoveSlots as any).push({ ...slot });
    }
     pokemon.hp = pokemon.maxhp;
	pokemon.fainted = false;
	this.add('-heal', pokemon, pokemon.getHealth, '[from] move: Aid of Revival');

    },

	// --- End makeover logic ---
    // If the side condition is still around another turn (rare), don’t keep triggering.
    onSideRestart() {
      // make sure we stay pending only once per application
      (this.effectState as any).pending = true;
    },

    onSideEnd() {
      // nothing special
    },
  },



};
