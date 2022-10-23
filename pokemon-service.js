/**
 * Provides pokemon data
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

class PokemonService {

    #req;
    #loadedPokemons;
    #selectedPokemon;

    constructor(){
        this.#req = new Requester();
        this.#loadedPokemons = {};
    }

    /**
     * Selects an loaded pokemon by its [id]
     * @param {string} id - the pokemon id
     * @returns {Pokemon}
     */
    selectPokemon(id){
        if(this.pokemonExists(id)){
            this.#selectedPokemon = id;
            return this.#loadedPokemons[this.#selectedPokemon];
        }
        throw new Error(`Pokemon of id [${id}] wasn't previously loaded!`);
    }

    /**
     * Returns the pokmon marked as selected
     * @returns {Pokemon}
     */
    getSelectedPokemon(){   
        return this.#loadedPokemons[this.#selectedPokemon];
    }

    /**
     * Checks if pokemon id exists in the loaded pokemon list
     * @param {string} id - the pokemon id
     * @returns {boolean}
     */
    pokemonExists(id){
        return this.#loadedPokemons[id] !== undefined;
    }

    /**
     * Fetches a single pokemon by [id], when checking [withDetails] it will throw an exception if the pokemon doesn't
     * exist on the api
     * @param {string} id
     * @returns {Promise<Pokemon>} 
     */
    async getPokemon(id, withDetails = true, reload = false){

        if(!this.pokemonExists(id) || reload){
            const pokemon = Pokemon.make(id);
            this.#loadedPokemons[pokemon.getName()] = pokemon;
                if(withDetails){
                try {
                    return this.getPokemonDetails(pokemon);
                } catch (e){
                    throw e;
                }
            }
            return pokemon;
        }

        return this.#loadedPokemons[id];

    }

    /**
     * Fetches all pokemons
     * 
     * Paramters reference: https://pokeapi.co/docs/v2#pokemon
     * @param {string} id - fetches an specific pokemon by name, in this case, it will return only one pokemon inside an array
     * @param {object} params - defines search params
     * @returns {any}
     */
    async getPokemons(params = null, withDetails = true){
        let url = 'https://pokeapi.co/api/v2/pokemon/';
        const urlData = new URLSearchParams();
        if(params){
            for(let key in params){
                urlData.set(key, params[key]);
            }
        }
        try {
            const pokemonData = await this.#req.get(url+"?"+urlData.toString());
            let promises = [];
            for(let i = 0; i < pokemonData.results.length; i++){
                promises.push( this.getPokemon( pokemonData.results[i].name ), withDetails );
            }
            await Promise.all(promises);
            return this.getLoadedPokemons();
        }catch(e){
            throw e;
        }
    }

    /**
     * Returns object with all loaded pokemons
     * @returns {any}
     */
    getLoadedPokemons(){
        return this.#loadedPokemons;
    }

    /**
     * Fetches details about a pokemon
     * @param {Pokemon} pokemon - an valid pokemon
     * @returns {Promise<Pokemon>}
     */
    async getPokemonDetails(pokemon){
        if(!(pokemon instanceof Pokemon)) throw new TypeError("param [pokemon] is not of type Pokemon!");
        let url = 'https://pokeapi.co/api/v2/pokemon/'+pokemon.getName();
        try {
            const pokemonData = await this.#req.get(url);
            const details = mapper(PokemonDetails, pokemonData);
            
            if(!this.pokemonExists(pokemon.getName()))
                this.#loadedPokemons[pokemon.getName()] = pokemon;
            
            const currentPokemon = this.#loadedPokemons[pokemon.getName()];
            currentPokemon.setDetails(details);
            return currentPokemon;
        }catch(e){
            throw e;
        }
    }

}