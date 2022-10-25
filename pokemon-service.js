/**
 * Provides pokemon data
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

class PokemonService {

    #req;
    #loadedPokemons;
    #selectedPokemon;
    #limit;

    constructor(){
        this.#req = new Requester();
        this.#limit = false;
        this.#loadedPokemons = {};
    }

    /**
     * All possible pokemons are loaded
     * @returns {boolean}
     */
    atLimit(){
        return this.#limit;
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
     * Fetches a single pokemon by [id], when checking [withData] it will throw an exception if the pokemon doesn't
     * exist on the api
     * @param {string} id
     * @returns {Promise<Pokemon>} 
     */
    async getPokemon(id, withData = {}, reload = false){

        const { details, species } = withData;

        if(!this.pokemonExists(id) || reload){
            const pokemon = Pokemon.make(id);
            this.#loadedPokemons[pokemon.getName()] = pokemon;
            let promises = [];
            
            if(details) promises.push( this.getPokemonDetails(pokemon) );
            if(species) promises.push( this.getPokemonSpecies(pokemon) );
            
            if(promises.length){
                try {
                    await Promise.all(promises);
                    return pokemon;
                }catch (e){
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
    async getPokemons(params = null, withData = {}){
        let url = 'https://pokeapi.co/api/v2/pokemon/';
        
        withData.details = true;
        
        const urlData = new URLSearchParams();
        if(params){
            for(let key in params){
                urlData.set(key, params[key]);
            }
        }
        try {
            const pokemonData = await this.#req.get(url+"?"+urlData.toString());
            if(pokemonData.next === null){
                this.#limit = true;
                console.info(`all pokemons are loaded`);
                return;
            }
            let promises = [];
            for(let i = 0; i < pokemonData.results.length; i++){
                promises.push( this.getPokemon( pokemonData.results[i].name, withData ) );
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
            const details = new PokemonDetails(pokemonData);
            
            if(!this.pokemonExists(pokemon.getName()))
                this.#loadedPokemons[pokemon.getName()] = pokemon;
            
            const currentPokemon = this.#loadedPokemons[pokemon.getName()];
            currentPokemon.setDetails(details);
            return currentPokemon;
        }catch(e){
            throw new PokemonDetailsError(`unable to find details for pokemon [${pokemon.getName()}]`);
        }
    }

    /**
     * Fetches species data about a pokemon
     * @param {Pokemon} pokemon - an valid pokemon
     * @returns {Promise<Pokemon>}
     */
    async getPokemonSpecies(pokemon, force = false){
        if(!(pokemon instanceof Pokemon)) throw new TypeError("param [pokemon] is not of type Pokemon!");

        let url = 'https://pokeapi.co/api/v2/pokemon-species/';
        let pokemonData = null;
        
        if(!pokemon.hasDetails() || force){
            // tries to download the species data when being used in parallel with getPokemonDetails(), since the species id is
            // only present in details, this method will attempt to guess the species name
            try {
                pokemonData = await this.#req.get(url+pokemon.getName());
            } catch (e){
                if(e instanceof RequestError){
                    const filteredName = pokemon.getName().split("-")[0];
                    try {
                        pokemonData = await this.#req.get(url+filteredName);
                    }catch(e){
                        throw new PokemonSpeciesError(`unable to find species data for pokemon [${pokemon.getName()}] (forced)`);
                    }
                    console.warn(`[${pokemon.getName()}] failed to load, loading [${filteredName}]`);
                }else{
                    throw e;
                }
            }
        }else{
            const species = pokemon.getSpeciesName();
            pokemonData = await this.#req.get(url+species);
        }

        const species = new PokemonSpecies(pokemonData);
        
        if(!this.pokemonExists(pokemon.getName()))
            this.#loadedPokemons[pokemon.getName()] = pokemon;
        
        const currentPokemon = this.#loadedPokemons[pokemon.getName()];
        currentPokemon.setSpecies(species);
        return currentPokemon;
        
    }

}