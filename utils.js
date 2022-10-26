/**
 * Utilities to help structure the app data
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

/**
 * Class that makes basic requests
 */
class Requester {

    async get(url){
        if(!url){
            throw new Error("url is required!");
        }
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
 * A single pokemon with name, for more details it needs to have a [PokemonDetail] or [PokemonSpecies] loaded
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

    constructor(data){
        super(data);
        this.#name = data.name;
        this.#url = data.url;
        this.#details = null;
    }

    getName(){
        return this.#name;
    }

    getUrl(){
        return this.#url;
    }

    /**
     * Sets either details or species data for the pokemon
     * @param {PokemonDetails|PokemonSpecies} data - data to be loaded
     */
    setData(data){
        if(data instanceof PokemonDetails) this.setDetails(data);
        else if(data instanceof PokemonSpecies) this.setSpecies(data);
        else throw new TypeError(`[data] is not allowed`);
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

    getFlavorText(){
        return this.getSpecies().getFlavorText();
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
    }

    getId(){
        return this.#id;
    }

    getName(){
        return this.#name;
    }

    getWeight(){
        return this.#weight;
    }

    getFrontSprite(){
        return this.#frontSprite;
    }

    getBackSprite(){
        return this.#backSprite;
    }

    getTypes(){
        return this.#types;
    }

    getOrder(){
        return this.#order;
    }

    getId(){
        return this.#id;
    }

    getOfficialArtwork(){
        return this.#officialArtwork;
    }

    getSpeciesName(){
        return this.#speciesName;
    }

}

/**
 * Contains basis data about multiple pokemons of the same species
 * 
 * @reference https://pokeapi.co/docs/v2#pokemon-species
 */
class PokemonSpecies extends BaseDataObj{

    #flavorText;

    constructor(data){
        super(data);
        this.#flavorText = data.flavor_text_entries[0].flavor_text;
    }

    getFlavorText(){
        return this.#flavorText;
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