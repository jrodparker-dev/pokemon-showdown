/**
 * Random Chaos Teams (copy-paste teams.ts)
 *
 * Goals:
 * - All fully evolved Pokémon eligible (no sets.json required)
 * - All Pokémon hold "Mystery Box"
 * - Moves are NOT limited to learnset overall, but we prefer learnset for 1 slot:
 *   1) 1 STAB attacking move from the Pokémon's OWN learnset
 *   2) 1 STAB attacking move from ANYWHERE
 *   3) 1 Status move from ANYWHERE
 *   4) 1 Attacking move from ANYWHERE matching its higher attacking stat (Atk vs SpA)
 *
 * Guardrails:
 * - Avoid weak attacking moves: basePower < 60 are rejected UNLESS:
 *   - multihit move
 *   - priority move
 *   - scaling/basePowerCallback
 *   - fixed/scaling damage via damage/damageCallback
 *
 * Notes:
 * - This file assumes your format sets `team: "randomChaos"` so getTeam() calls randomChaosTeam().
 * - Item "Mystery Box" must exist in your mod's items.ts (or base data if you put it there).
 */

import {Dex, toID} from '../../../sim/dex';
import {PRNG, type PRNGSeed} from '../../../sim/prng';
import type {RuleTable} from '../../../sim/dex-formats';
import type {PokemonSet} from '../../../sim/teams';

type StatsTable = {hp: number; atk: number; def: number; spa: number; spd: number; spe: number};

export class RandomTeams {
	readonly dex: ModdedDex;
	readonly format: Format;
	readonly gen: number;
	prng: PRNG;

	readonly maxTeamSize: number;
	readonly maxMoveCount: number;
	readonly adjustLevel: number | null;
	readonly forceMonotype: string | undefined;
	readonly forceTeraType: string | undefined;

	constructor(format: Format | string, prng: PRNG | PRNGSeed | null) {
		format = Dex.formats.get(format);
		this.dex = Dex.forFormat(format);
		this.format = format;
		this.gen = this.dex.gen;

		const ruleTable = Dex.formats.getRuleTable(format);
		this.maxTeamSize = ruleTable.maxTeamSize;
		this.maxMoveCount = ruleTable.maxMoveCount;
		this.adjustLevel = ruleTable.adjustLevel;

		const forceMonotype = ruleTable.valueRules.get('forcemonotype');
		this.forceMonotype = forceMonotype && this.dex.types.get(forceMonotype).exists ?
			this.dex.types.get(forceMonotype).name : undefined;

		const forceTeraType = ruleTable.valueRules.get('forceteratype');
		this.forceTeraType = forceTeraType && this.dex.types.get(forceTeraType).exists ?
			this.dex.types.get(forceTeraType).name : undefined;

		this.prng = PRNG.get(prng);
	}

	setSeed(prng?: PRNG | PRNGSeed) {
		this.prng = PRNG.get(prng);
	}

	// ------------------------------------------------------------
	// RNG helpers
	// ------------------------------------------------------------
	randomChance(numerator: number, denominator: number) {
		return this.prng.randomChance(numerator, denominator);
	}
	random(m?: number, n?: number) {
		return this.prng.random(m, n);
	}
	sample<T>(items: readonly T[]): T {
		return this.prng.sample(items);
	}
	fastPop<T>(list: T[], index: number): T {
		const length = list.length;
		if (index < 0 || index >= length) throw new Error(`Index ${index} out of bounds`);
		const element = list[index];
		list[index] = list[length - 1];
		list.pop();
		return element;
	}
	sampleNoReplace<T>(list: T[]): T | null {
		if (!list.length) return null;
		const index = this.random(list.length);
		return this.fastPop(list, index);
	}

	// ------------------------------------------------------------
	// Public entrypoint
	// ------------------------------------------------------------
	getTeam(options: PlayerOptions | null = null): PokemonSet[] {
		const generatorName = (
			typeof this.format.team === 'string' && this.format.team.startsWith('random')
		) ? this.format.team + 'Team' : '';
		// @ts-expect-error dynamic access
		return this[generatorName || 'randomChaosTeam'](options);
	}

	// ------------------------------------------------------------
	// Core policy: Fully evolved pool
	// ------------------------------------------------------------
	private isEligibleSpecies(species: Species, ruleTable: RuleTable, pickedBaseSpecies: Set<string>) {
		if (!species.exists) return false;
		if (species.num <= 0) return false;

		// Keep it sane by default (you can loosen later)
		if (species.isNonstandard) return false;

		// ✅ Fully evolved only
		if (species.nfe) return false;

		// Monotype support if you ever enable it
		if (this.forceMonotype && !species.types.includes(this.forceMonotype)) return false;

		// Respect bans (if any)
		if (ruleTable.check('pokemon:' + species.id)) return false;
		if (ruleTable.check('basepokemon:' + toID(species.baseSpecies))) return false;

		// Species clause by base species
		if (pickedBaseSpecies.has(species.baseSpecies)) return false;

		return true;
	}

	private buildSpeciesPool(ruleTable: RuleTable) {
		const pickedBaseSpecies = new Set<string>();
		const pool = this.dex.species.all().filter(s => this.isEligibleSpecies(s, ruleTable, pickedBaseSpecies));

		// We want unique base species when sampling; easiest is make a baseSpecies list:
		const byBase: {[base: string]: Species[]} = {};
		for (const s of pool) {
			if (!byBase[s.baseSpecies]) byBase[s.baseSpecies] = [];
			byBase[s.baseSpecies].push(s);
		}
		const baseSpeciesList = Object.keys(byBase);
		return {byBase, baseSpeciesList};
	}

	// ------------------------------------------------------------
	// Move quality filters
	// ------------------------------------------------------------
	private isGoodAttackMove(move: Move): boolean {
		if (!move.exists) return false;
		if (move.category === 'Status') return false;
		if (move.isNonstandard) return false;

		// Allow exceptions even if "low BP"
		if (move.multihit) return true;
		if (move.priority && move.priority > 0) return true;
		if (move.basePowerCallback) return true; // scaling BP (Electro Ball etc)
		if (move.damageCallback || move.damage) return true; // fixed/scaling damage (Seismic Toss etc)

		const bp = move.basePower || 0;
		return bp >= 60;
	}

	private isGoodStatusMove(move: Move): boolean {
		if (!move.exists) return false;
		if (move.category !== 'Status') return false;
		if (move.isNonstandard) return false;
		return true;
	}

	private moveIdListAllMoves(): ID[] {
		// Convert to IDs once; light cost but fine for chaos mode
		return this.dex.moves.all()
			.filter(m => m.exists && !m.isNonstandard)
			.map(m => m.id);
	}

	// ------------------------------------------------------------
	// Move picking rules (your requested 4 slots)
	// ------------------------------------------------------------
	private pickStabFromLearnset(species: Species, preferredPhysical: boolean, already: Set<string>): string | null {
		const learnset = [...this.dex.species.getMovePool(species.id)];
		const types = species.types;

		const candidates: string[] = [];
		for (const id of learnset) {
			if (already.has(id)) continue;
			const move = this.dex.moves.get(id);
			if (!this.isGoodAttackMove(move)) continue;
			if (!types.includes(move.type)) continue;
			// optional: lean toward the higher offense, but don't hard force
			if (preferredPhysical && move.category === 'Special') continue;
			if (!preferredPhysical && move.category === 'Physical') continue;
			candidates.push(id);
		}

		// If none match preferred category, allow either category (still STAB, still learnset)
		if (!candidates.length) {
			for (const id of learnset) {
				if (already.has(id)) continue;
				const move = this.dex.moves.get(id);
				if (!this.isGoodAttackMove(move)) continue;
				if (!types.includes(move.type)) continue;
				candidates.push(id);
			}
		}

		return candidates.length ? this.sample(candidates) : null;
	}

	private pickStabFromAnywhere(species: Species, preferredPhysical: boolean, already: Set<string>, allMoveIds: ID[]): string | null {
		const types = species.types;
		const candidates: string[] = [];

		for (const id of allMoveIds) {
			if (already.has(id)) continue;
			const move = this.dex.moves.get(id);
			if (!this.isGoodAttackMove(move)) continue;
			if (!types.includes(move.type)) continue;

			// prefer matching attack stat, but don't block if empty
			if (preferredPhysical && move.category === 'Special') continue;
			if (!preferredPhysical && move.category === 'Physical') continue;

			candidates.push(id);
		}

		if (!candidates.length) {
			for (const id of allMoveIds) {
				if (already.has(id)) continue;
				const move = this.dex.moves.get(id);
				if (!this.isGoodAttackMove(move)) continue;
				if (!types.includes(move.type)) continue;
				candidates.push(id);
			}
		}

		return candidates.length ? this.sample(candidates) : null;
	}

	private pickStatusFromAnywhere(already: Set<string>, allMoveIds: ID[]): string {
		const candidates: string[] = [];
		for (const id of allMoveIds) {
			if (already.has(id)) continue;
			const move = this.dex.moves.get(id);
			if (!this.isGoodStatusMove(move)) continue;
			candidates.push(id);
		}

		// If somehow empty (shouldn't happen), fall back to Protect
		return candidates.length ? this.sample(candidates) : 'protect';
	}

	private pickAttackFromAnywhere(preferredPhysical: boolean, already: Set<string>, allMoveIds: ID[]): string {
		const candidates: string[] = [];
		for (const id of allMoveIds) {
			if (already.has(id)) continue;
			const move = this.dex.moves.get(id);
			if (!this.isGoodAttackMove(move)) continue;

			if (preferredPhysical && move.category !== 'Physical') continue;
			if (!preferredPhysical && move.category !== 'Special') continue;

			candidates.push(id);
		}

		// If none exist, relax category constraint
		if (!candidates.length) {
			for (const id of allMoveIds) {
				if (already.has(id)) continue;
				const move = this.dex.moves.get(id);
				if (!this.isGoodAttackMove(move)) continue;
				candidates.push(id);
			}
		}

		// If STILL none exist (very unlikely), Struggle
		return candidates.length ? this.sample(candidates) : 'struggle';
	}

	private getMoves(species: Species): string[] {
		const moves = new Set<string>();

		const allMoveIds = this.moveIdListAllMoves();

		// Highest attack stat preference
		let preferredPhysical = false;
		if (species.baseStats.atk > species.baseStats.spa) preferredPhysical = true;
		else if (species.baseStats.spa > species.baseStats.atk) preferredPhysical = false;
		else preferredPhysical = this.randomChance(1, 2); // tie = chaos

		// 1) STAB from learnset
		const stabLearnset = this.pickStabFromLearnset(species, preferredPhysical, moves);
		if (stabLearnset) moves.add(stabLearnset);

		// 2) STAB from anywhere
		const stabAny = this.pickStabFromAnywhere(species, preferredPhysical, moves, allMoveIds);
		if (stabAny) moves.add(stabAny);

		// 3) Status from anywhere
		moves.add(this.pickStatusFromAnywhere(moves, allMoveIds));

		// 4) Attacking from anywhere matching higher stat
		moves.add(this.pickAttackFromAnywhere(preferredPhysical, moves, allMoveIds));

		return [...moves];
	}

	// ------------------------------------------------------------
	// Ability / item / nature / level
	// ------------------------------------------------------------
	private getAbility(species: Species): string {
		const abilities = Object.values(species.abilities).filter(Boolean);
		if (!abilities.length) return 'No Ability';
		return this.sample(abilities);
	}

	private getNature(species: Species): string {
		// Keep it simple and “good enough”
		const atk = species.baseStats.atk;
		const spa = species.baseStats.spa;
		const spe = species.baseStats.spe;

		if (atk > spa) return this.sample(spe >= 80 ? ['Jolly', 'Adamant'] : ['Adamant', 'Brave']);
		if (spa > atk) return this.sample(spe >= 80 ? ['Timid', 'Modest'] : ['Modest', 'Quiet']);
		return this.sample(['Hardy', 'Docile', 'Serious', 'Bashful', 'Quirky']);
	}

	private getLevel(species: Species): number {
		if (this.adjustLevel) return this.adjustLevel;

		// simple tier scale (you can replace with your own)
		const tier = species.tier;
		const tierScale: Partial<Record<Species['tier'], number>> = {
			Uber: 76,
			OU: 80,
			UUBL: 81,
			UU: 82,
			RUBL: 83,
			RU: 84,
			NUBL: 85,
			NU: 86,
			PUBL: 87,
			PU: 88, "(PU)": 88, NFE: 88,
		};
		return tierScale[tier] || 80;
	}

	private getItem(_species: Species): string {
		// ✅ forced item for chaos mode
		return 'Mystery Box';

		// --- LIGHT ITEM PICKER (commented out for later) ---
		// const pool = ['Leftovers', 'Life Orb', 'Choice Scarf', 'Heavy-Duty Boots', 'Focus Sash'];
		// return this.sample(pool);
	}

	// ------------------------------------------------------------
	// The actual team generator for `team: "randomChaos"`
	// ------------------------------------------------------------
	randomChaosTeam(_options: PlayerOptions | null = null): PokemonSet[] {
		const ruleTable = this.dex.formats.getRuleTable(this.format);
		const team: PokemonSet[] = [];

		const {byBase, baseSpeciesList} = this.buildSpeciesPool(ruleTable);
		if (!baseSpeciesList.length) throw new Error(`Random Chaos: no eligible fully-evolved species in dex.`);

		const pickedBase = new Set<string>();

		// Create a mutable list for no-replace sampling
		const bases = baseSpeciesList.slice();

		while (bases.length && team.length < this.maxTeamSize) {
			const base = this.sampleNoReplace(bases);
			if (!base) break;

			if (pickedBase.has(base)) continue;
			pickedBase.add(base);

			// Pick a random forme/species entry under this base (still must be eligible)
			const candidates = (byBase[base] || []).filter(s => this.isEligibleSpecies(s, ruleTable, new Set()));
			if (!candidates.length) continue;

			const species = this.sample(candidates);

			const level = this.getLevel(species);

			// Simple, neutral EV/IV baseline (tweak later)
			const evs: StatsTable = {hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85};
			const ivs: StatsTable = {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31};

			const moves = this.getMoves(species);
			const ability = this.getAbility(species);
			const item = this.getItem(species);
			const nature = this.getNature(species);

			// Tera: random from all types (excluding Stellar like PS usually does)
			let teraType = this.sample(this.dex.types.names().filter(t => t !== 'Stellar'));
			if (this.forceTeraType) teraType = this.forceTeraType;

			team.push({
				name: species.baseSpecies,
				species: species.name,
				gender: species.gender || (this.randomChance(1, 2) ? 'F' : 'M'),
				shiny: this.randomChance(1, 1024),
				level,
				moves,
				ability,
				item,
				nature,
				evs,
				ivs,
				teraType,
			});
		}

		if (team.length < this.maxTeamSize) {
			throw new Error(`Random Chaos: could not fill team (${team.length}/${this.maxTeamSize}).`);
		}

		return team;
	}
}

export default RandomTeams;
