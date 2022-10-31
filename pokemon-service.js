"use strict";
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
     * @returns {Boolean}
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
     * @param {String} id - the pokemon id
     * @returns {Boolean}
     */
    pokemonExists(id){
        return this.#loadedPokemons[id] !== undefined;
    }

    /**
     * Fetches a single pokemon by [id]
     * @param {String} id
     * @param {Object} withData - params to instruct the service to load certain Pokémon properties
     * @param {Boolean} withData.details - load data with pokemon details (images, stats)
     * @param {Boolean} withData.species - load data with species data (evolution, description)
     * @param {Boolean} withData.evolutionChain - load data with evolution chain (will set species to `true`)
     * @param {Object} config - additional service configuration
     * @param {Boolean} config.reload - force to reload the pokemon data despite already being saved
     * @param {Boolean} config.save - defines if pokemon data should be saved on the service
     * @returns {Promise<Pokemon>} 
     */
    async getPokemon(id, withData = {}, config = {}){

        const { details = true, species, evolutionChain } = withData;
        const { reload, save = true } = config;

        if(!this.pokemonExists(id) || reload){
            const pokemon = Pokemon.make(id);
            if(save) this.#loadedPokemons[pokemon.getName()] = pokemon;
            let promises = [];
            
            if(details && id == "zygarde-50" || id == "zygarde") debugger;
            if(details) promises.push( this.getPokemonDetails(pokemon) );
            if(species || evolutionChain) promises.push( this.getPokemonSpecies(pokemon, withData) );
            
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
     * @param {Object} params - the attributes will respectively be send as query string parameters to the api
     * @param {Object} withData - params to instruct the service to load certain Pokémon properties
     * @param {Boolean} withData.details - load data with pokemon details (images, stats)
     * @param {Boolean} withData.species - load data with species data (evolution, description)
     * @param {Boolean} withData.evolutionChain - load data with evolution chain (will set species to `true`)
     * @returns {Object}
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
     * @returns {Object}
     */
    getLoadedPokemons(){
        return this.#loadedPokemons;
    }

    /**
     * Requests pokemon data to the api and adds to the pokemon
     * @param {BaseDataObj} modelClass - an allowed class to add to the pokemon
     * @param {String} url - the API endpoint that contains the desired data
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
        // prioritizes saved pokemon
        const currentPokemon = this.#loadedPokemons[pokemon.getName()] ?? pokemon;
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
        const url = pokemon.getDetailsUrl();
        try {
            return await this.requestPokemonData(PokemonDetails, url, pokemon);
        }catch(e){
            throw new PokemonDetailsError(`unable to find details for pokemon [${pokemon.getName()}]`);
        }
    }

    /**
     * Fetches species data about a pokemon
     * @param {Pokemon} pokemon - an valid pokemon
     * @param {Object} withData - params to instruct the service to load certain Pokémon properties
     * @param {Boolean} withData.details - load data with pokemon details (images, stats)
     * @param {Boolean} withData.species - load data with species data (evolution, description)
     * @param {Boolean} withData.evolutionChain - load data with evolution chain (will set species to `true`)
     * @returns {Promise<Pokemon>}
     */
    async getPokemonSpecies(pokemon, withData = {}){
        
        const { evolutionChain } = withData;

        if(!(pokemon instanceof Pokemon)) throw new TypeError("param [pokemon] is not of type Pokemon!");

        let name = pokemon.getName(); // assuming the species id is the same as the pokemon name (most of the time it is)
        if(pokemon.hasDetails()) name = pokemon.getSpeciesName(); // if there is details loaded, loads the actual species id

        const url = `${this.#baseUrl}/pokemon-species/${name}`;

        try {
            // if [name] didn't came from details, there is a chance it might not find the species data and the request will fail
            // with an 404 error
            await this.requestPokemonData(PokemonSpecies, url, pokemon);
        }catch(e){
            // tries to recover and filter the pokemon name to try again
            // this method enables both getPokemonSpecies() and getPokemonDetails() to run in parallel
            // since the species id might be in the details data that wasn't loaded yet
            if(e instanceof RequestError){
                const filteredName = name.split("-")[0];
                const filteredUrl = `${this.#baseUrl}/pokemon-species/${name.split("-")[0]}`;
                try {
                    await this.requestPokemonData(PokemonSpecies, filteredUrl, pokemon);
                }catch(e){
                    throw new PokemonSpeciesError(`unable to find species data for pokemon [${name}] (forced ${filteredName})`);
                }
            }else{
                throw e;
            }
        }

        if(evolutionChain) await this.getPokemonEvolutionChain(pokemon);

        return pokemon;

    }
    
    /**
     * Loads an pokemon evolution chain
     * @param {Pokemon} pokemon - pokemon to receive the evolution chain
     * @returns {Promise<Pokemon>}
     */
    async getPokemonEvolutionChain(pokemon){

        if(!(pokemon instanceof Pokemon)) throw new TypeError("param [pokemon] is not of type Pokemon!");
        if(!pokemon.hasSpecies()) throw PokemonSpeciesError(`pokemon [${pokemon.getName()}] has no species defined!`);
        
        const url = pokemon.getSpecies().getEvolutionChainUrl();
        
        if(url === "") return pokemon;

        await this.requestPokemonData(PokemonEvolutionChain, url, pokemon);
        const evolutionChain = pokemon.getEvolutionChain();
        
        // iterates on the evolution chain and loads possible unloaded pokemons
        const promises = [];

        if(!evolutionChain.isSingle()){
            evolutionChain.linkMap((evolution) => {
                const oldPokemon = evolution.getPokemon();
                // TODO: improve how the pokemons are listed so it's not needed to load pokemons without saving,
                // because if they are saved before being loaded on the list they can appear in the wrong order
                // as the pagination progresses
                
                let name = oldPokemon.getName();

                promises.push(this.getPokemon(name, { details: true }, { save: false })
                .catch((e) => {
                    if(e instanceof PokemonDetailsError){
                        // some of the later pokemons have a lot of incoherences in their names, where kubufu is actually [kubfu] this is a way
                        // to give the pokemon its already loaded details if applicable
                        const speciesName = pokemon.getSpeciesName();
                        console.info(`details for [${name}] in evolution chain not found, therefore had no details to be loaded`);
                        if(speciesName === name){
                            evolution.setPokemon( {...pokemon} );
                        }
                    }else{
                        throw e;
                    }
                })
                .then((newPokemon) => {
                    evolution.setPokemon(newPokemon);
                }));
            });
        }

        await Promise.all(promises);

        return pokemon;

    }

}