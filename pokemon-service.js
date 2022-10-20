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

    selectPokemon(id){
        this.#selectedPokemon = id;
    }

    getSelectedPokemon(){
        return this.#loadedPokemons[this.#selectedPokemon];
    }

    /**
     * Fetches all pokemons
     * 
     * Paramters reference: https://pokeapi.co/docs/v2#pokemon
     * @param {string} id - fetches an specific pokemon by name, in this case, it will return only one pokemon inside an array
     * @param {object} params - defines search params
     * @returns {any|null}
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
            const pokemons = mapper(Pokemon, pokemonData.results);
            let promises = [];
            for(let i = 0; i < pokemons.length; i++){
                if(!this.#loadedPokemons[pokemons[i].getName()]){
                    this.#loadedPokemons[pokemons[i].getName()] = pokemons[i];
                    if(withDetails) promises.push(this.getPokemonDetails(pokemons[i]));
                }
            }
            await Promise.all(promises);
            return this.getLoadedPokemons();
        }catch(e){
            console.error(e);
            return null;
        }
    }

    getLoadedPokemons(){
        return this.#loadedPokemons;
    }

    /**
     * Fetches details about a pokemon
     * @param {Pokemon} pokemon - an valid pokemon
     * @returns {any|null}
     */
    async getPokemonDetails(pokemon){
        if(!(pokemon instanceof Pokemon)) throw new TypeError("param [pokemon] is not of type Pokemon!");
        let url = 'https://pokeapi.co/api/v2/pokemon/'+pokemon.getName();
        try {
            const pokemonData = await this.#req.get(url);
            const details = mapper(PokemonDetails, pokemonData);
            const currentPokemon = this.#loadedPokemons[pokemon.getName()];
            currentPokemon.setDetails(details);
            return currentPokemon;
        }catch(e){
            console.error(e);
            return null;
        }
    }

}