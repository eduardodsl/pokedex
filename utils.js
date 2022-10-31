"use strict";
/**
 * Utilities to help structure the app data
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

/**
 * Class that makes basic requests
 */
class Requester {

    async get(url){
        if(!url) throw new Error("url is required!");
        try {
            const data = await fetch(url);
            const json = await data.json();
            return json;
        }catch(e){
            throw new RequestError(e.message);
        }
    }

}

/**
 * Basic class that serves as an wrapper for the scroll event
 */
class ScrollStatus {

    el;
    scrollTop;
    scrollHeight;
    scrollBarHeight;
    clientHeight;;
    offsetHeight;
    innerHeight;

    constructor(el){
        this.el = el;
        this.scrollTop = this.el.scrollTop;
        this.scrollHeight = this.el.scrollHeight;
        this.clientHeight = this.el.clientHeight;
        this.offsetHeight = this.el.offsetHeight;
        this.scrollBarHeight = this.el.scrollHeight - this.scrollTop;
    }

    /**
     * Checks if the element has scrolled to the bottom
     * @returns {boolean}
     */
    isBottom(){
        return this.scrollBarHeight <= this.clientHeight+3;
    }

}

/**
 * Basis for all objects extracted from the API
 */
class BaseDataObj {

    // stores the object extracted from the api
    #dataObj;

    constructor(data){
        if(typeof data !== "object") throw TypeError("[data] is not a valid object!");
        this.#dataObj = data;
    }

    /**
     * Optional method to retrieve the json response used to build the derived objects
     * @returns {any}
     */
    getDataObj(){
        return this.#dataObj;
    }
}

/**
 * A single pokemon with name, for more details it needs to have a [PokemonDetail] or [PokemonSpecies] loaded. This
 * class unifies and validates all data of an particular pokemon extracted from the api's json response
 * 
 * @reference https://pokeapi.co/docs/v2#pokemon
 * 
 * usage:
 * ```javascript
 * // with an json object:
 * const pokemon = new Pokemon(jsonObject);
 * // it also can be created without an json object, if you are sure about the data being
 * // present on the API:
 * const pokemon = Pokemon.make(name);
 * // adding details
 * pokemon.setDetails(details);
 * // adding species
 * pokemon.setSpecies(species);
 * ```
 */
class Pokemon extends BaseDataObj {

    #name;
    #url;
    #details;
    #species;
    #evolutionChain;

    constructor(data){
        super(data);
        this.#name = data.name;
        this.#url = data.url;
        this.#details = null;
    }

    getName(){
        return this.#name;
    }

    getDetailsUrl(){
        return this.#url;
    }

    /**
     * Sets either details or species data for the pokemon
     * @param {PokemonDetails|PokemonSpecies|PokemonEvolutionChain} data - data to be loaded
     */
    setData(data){
        if(data instanceof PokemonDetails) this.setDetails(data);
        else if(data instanceof PokemonSpecies) this.setSpecies(data);
        else if(data instanceof PokemonEvolutionChain) this.setEvolutionChain(data);
        else throw new TypeError(`[data] is not allowed`);
    }

    /**
     * Returns all contained details status
     * @returns {any}
     */
    contains(){
        return {
            hasDetails: this.hasDetails(),
            hasSpecies: this.hasSpecies(),
            hasEvolutionChain: this.hasEvolutionChain(),
        };
    }

    setDetails(details){
        if(!(details instanceof PokemonDetails)) throw TypeError("param [details] is not of type PokemonDetails!");
        if(details.getName() !== this.#name) throw Error(`[${details.name}] and [${this.#name}] are not the same pokemon!`);
        this.#details = details;
    }

    setSpecies(species){
        if(!(species instanceof PokemonSpecies)) throw TypeError("param [species] is not of type PokemonSpecies!");
        this.#species = species;
    }

    setEvolutionChain(evolutionChain){
        if(!(evolutionChain instanceof PokemonEvolutionChain)) throw TypeError("param [evolutionChain] is not of type PokemonSpecies!");
        this.#evolutionChain = evolutionChain;
    }
    
    getDetails(){
        if(this.hasDetails()) return this.#details;
        throw new PokemonDetailsError(`pokemon [${this.#name}] has no details loaded!`);
    }

    getSpecies(){
        if(this.hasSpecies()) return this.#species;
        throw new PokemonSpeciesError(`pokemon [${this.#name}] has no species loaded!`);
    }

    hasDetails(){
        return this.#details !== null;
    }

    hasSpecies(){
        return this.#species !== null;
    }

    hasEvolutionChain(){
        return this.#evolutionChain !== null;
    }

    getId(){
        return this.getDetails().getId();
    }

    getWeight(){
        return this.getDetails().getWeight();
    }

    getFrontSprite(){
        return this.getDetails().getFrontSprite();
    }

    getBackSprite(){
        return this.getDetails().getBackSprite();
    }

    getOfficialArtwork(){
        return this.getDetails().getOfficialArtwork();
    }

    getTypes(){
        return this.getDetails().getTypes();
    }

    getId(){
        return this.getDetails().getId();
    }

    getOrder(){
        return this.getDetails().getOrder();
    }

    getSpeciesName(){
        return this.getDetails().getSpeciesName();
    }

    getAbilities(){
        return this.getDetails().getAbilities();
    }

    getStats(){
        return this.getDetails().getStats();
    }

    getStat(name){
        return this.getDetails().getStat(name);
    }

    getFlavorText(language = 'en'){
        return this.getSpecies().getFlavorText(language);
    }

    getEvolutionChain(){
        return this.#evolutionChain;
    }

    getChain(){
        return this.getEvolutionChain().getChain();
    }

    /**
     * makes a new pokemon without the json object
     * @param {string} name - id or name of the pokemon
     * @param {PokemonDetails} details - pokemon details
     * @returns {Pokemon}
     */
    static make(name, details = null){
        const url = "https://pokeapi.co/api/v2/pokemon/"+name;
        const pokemon = new Pokemon({ name, url });
        if(details){
            pokemon.setDetails(details);
        }
        return pokemon;
    }

}

/**
 * Pokemon details, it contains the equivalent data to a pokemon loaded with the id/name parameter from the API
 * 
 * @reference https://pokeapi.co/docs/v2#pokemon
 */
class PokemonDetails extends BaseDataObj {
    
    #name;
    #weight;
    #id;
    #frontSprite;
    #backSprite;
    #types;
    #order;
    #officialArtwork;
    #speciesName;
    #abilities;
    #stats;

    constructor(data){
        super(data);
        this.#id = data.id;
        this.#name = data.name;
        this.#weight = data.weight;
        this.#frontSprite = data.sprites.front_default;
        this.#backSprite = data.sprites.back_default;
        this.#types = data.types.map( type => type.type.name);
        this.#order = data.order;
        this.#id = data.id;
        this.#officialArtwork = data.sprites.other["official-artwork"].front_default;
        this.#speciesName = data.species.name;
        this.#abilities = data.abilities.map( item => item.ability.name );
        this.#stats = {};
        data.stats.forEach( stat_data => {
            this.#stats[stat_data.stat.name] = stat_data.base_stat;
        });
    }

    getId(){ return this.#id; }

    getName(){ return this.#name; }

    getWeight(){ return this.#weight; }

    getFrontSprite(){ return this.#frontSprite; }

    getBackSprite(){ return this.#backSprite; }

    getTypes(){ return this.#types; }

    getOrder(){ return this.#order; }

    getId(){ return this.#id; }

    getOfficialArtwork(){ return this.#officialArtwork; }

    getSpeciesName(){ return this.#speciesName; }

    getAbilities() { return this.#abilities };

    getStats() { return this.#stats };

    getStat(name) { return this.#stats[name] ?? "" };

}

/**
 * Contains basis data about multiple pokemons of the same species
 * 
 * @reference https://pokeapi.co/docs/v2#pokemon-species
 */
class PokemonSpecies extends BaseDataObj{

    #flavorText;
    #evolutionChainUrl;

    constructor(data){
        super(data);
        this.#flavorText = data.flavor_text_entries;
        this.#evolutionChainUrl = data.evolution_chain.url ?? "";
    }

    #filterText(text){
        return text.replace('\u000c', " "); 
    }

    getEvolutionChainUrl(){
        return this.#evolutionChainUrl;
    }

    getFlavorText(language = 'en', mustFind = false){
        
        for(let i = 0; i < this.#flavorText.length; i++){
            if(this.#flavorText[i].language.name === language)
                return this.#filterText(this.#flavorText[i].flavor_text);
        }
        if(mustFind) throw new PokemonSpeciesError(`flavor text for language [${language}] not found! `);
        return "";

    }

}

/**
 * Groups evolution levels
 */
class PokemonEvolutionChain extends BaseDataObj{
    
    #chain;
    #id;
    #single;

    constructor(data, single = false){
        super(data);
        // this.#evolvesTo = [];
        this.#id = data.id;
        this.#single = single;
        this.#makeChain(data.chain);
    }

    /**
     * Checks if is single evolution
     * @returns {Boolean}
     */
    isSingle(){
        return this.#single;
    }

    #makeChain(level, evolution = null){
        
        const pokemon = Pokemon.make(level.species.name);
        let newEvolution = null;

        if(level.evolves_to.length === 0 && evolution == null){
            this.#single = true;
        }

        if(evolution){
            newEvolution = new PokemonEvolution(pokemon);
            evolution.setEvolvesTo(newEvolution);
        }else{
            evolution = new PokemonEvolution(pokemon);
            this.#chain = evolution;
        }

        for(let i = 0; i < level.evolves_to.length; i++){
            this.#makeChain(level.evolves_to[i], newEvolution ?? evolution);
        }

    }

    /**
     * Maps through all the evolution chain
     * @param {Function} onEvolution - callback function to run when a evolution is found
     */
    linkMap(onEvolution){
        this.#onLinkMap(this.#chain, 0, 0, 1, onEvolution);
    }

    #onLinkMap(evolution, level, phaseIndex, totalIndex, onEvolution){
        onEvolution(evolution, level, phaseIndex, totalIndex);
        level++;
        const evolutions = evolution.getEvolvesTo();
        for(let i = 0; i < evolutions.length; i++){
            this.#onLinkMap(evolutions[i], level, i, evolution.getEvolvesTo().length, onEvolution);
        }
    }

    getId(){
        return this.#id;
    }

    getChain(){
        return this.#chain;
    }

}

/**
 * Represents one pokemon evolution level
 */
class PokemonEvolution {

    #pokemon;
    #evolvesTo;

    constructor(pokemon){
        this.#pokemon = pokemon;
        this.#evolvesTo = [];
    }

    setEvolvesTo(pokemon){
        this.#evolvesTo.push(pokemon);
    }

    setPokemon(pokemon){
        this.#pokemon = pokemon;
    }

    getPokemon(){
        return this.#pokemon;
    }

    getEvolvesTo(){
        return this.#evolvesTo;
    }

}

/**
 * Class that organizes simple calc functions
 */
class Calc {

    /**
     * Calculates how much percent is [value] from [compare]
     * @param {Number} value - the value to be checked
     * @param {Number} compare - the comparison value
     * @returns {Number}
     */
    static percentOf(value, compare){
        return (value / compare) * 100;
    }

}

class PokemonDetailsError extends Error{
    constructor(message){
        super(message);
        this.name = this.constructor.name;
    }
}

class PokemonSpeciesError extends Error{
    constructor(message){
        super(message);
        this.name = this.constructor.name;
    }
}

class RequestError extends Error{
    constructor(message){
        super(message);
        this.name = this.constructor.name;
    }
}

class TemplateError extends Error{
    constructor(message){
        super(message);
        this.name = this.constructor.name;
    }
}