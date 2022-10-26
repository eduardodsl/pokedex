/**
 * Provides pokemon data
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

class PokemonService {

    #req;
    #loadedPokemons;
    #selectedPokemon;
    #limit;
    #baseUrl;

    constructor(){
        this.#req = new Requester();
        this.#limit = false;
        this.#loadedPokemons = {};
        this.#baseUrl = 'https://pokeapi.co/api/v2';
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
     * Checks if pokemon [id] exists in the loaded pokemon list
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
     * Requests pokemon data to the api and adds to the pokemon
     * @param {BaseDataObj} modelClass - an allowed class to add to the pokemon
     * @param {string} url - the API endpoint that contains the desired data
     * @param {Pokemon} pokemon the pokemon that will receive the data
     * @returns {Promise<Pokemon>}
     */
    async requestPokemonData(modelClass, url, pokemon){
        if(!(pokemon instanceof Pokemon)) throw new TypeError("param [pokemon] is not of type Pokemon!");
        if(!(pokemon instanceof BaseDataObj)) throw new TypeError("param [modelClass] is not an allowed data object!");
        let pokemonData = null;
        try {
            pokemonData = await this.#req.get(url);
        } catch(e){
            throw e;
        }
        const details = new modelClass(pokemonData);
        if(!this.pokemonExists(pokemon.getName()))
            this.#loadedPokemons[pokemon.getName()] = pokemon;
        const currentPokemon = this.#loadedPokemons[pokemon.getName()];
        currentPokemon.setData(details);
        return currentPokemon;
    }

    /**
     * Fetches details about a pokemon
     * @param {Pokemon} pokemon - an valid pokemon
     * @returns {Promise<Pokemon>}
     */
    async getPokemonDetails(pokemon){
        if(!(pokemon instanceof Pokemon)) throw new TypeError("param [pokemon] is not of type Pokemon!");
        const url = `${this.#baseUrl}/pokemon/${pokemon.getName()}`;
        try {
            return await this.requestPokemonData(PokemonDetails, url, pokemon);
        }catch(e){
            throw new PokemonDetailsError(`unable to find details for pokemon [${pokemon.getName()}]`);
        }
    }

    /**
     * Fetches species data about a pokemon
     * @param {Pokemon} pokemon - an valid pokemon
     * @returns {Promise<Pokemon>}
     */
    async getPokemonSpecies(pokemon){
        
        if(!(pokemon instanceof Pokemon)) throw new TypeError("param [pokemon] is not of type Pokemon!");

        let name = pokemon.getName(); // assuming the species id is the same as the pokemon name (most of the time it is)
        if(pokemon.hasDetails()) name = pokemon.getSpeciesName(); // if there is details loaded, loads the actual species id

        const url = `${this.#baseUrl}/pokemon-species/${name}`;
        try {
            // if [name] didn't came from details, there is a chance it might not find the species data and the request will fail
            // with an 404 error
            return await this.requestPokemonData(PokemonSpecies, url, pokemon);
        }catch(e){
            // tries to recover and filter the pokemon name to try again
            // this method enables both getPokemonSpecies() and getPokemonDetails() to run in parallel
            // since the species id might be in the details data that wasn't loaded yet
            if(e instanceof RequestError){
                const filteredName = name.split("-")[0];
                const filteredUrl = `${this.#baseUrl}/pokemon-species/${name.split("-")[0]}`;
                try {
                    return await this.requestPokemonData(PokemonSpecies, filteredUrl, pokemon);
                }catch(e){
                    throw new PokemonSpeciesError(`unable to find species data for pokemon [${name}] (forced ${filteredName})`);
                }
            }else{
                throw e;
            }
        }

    }

}