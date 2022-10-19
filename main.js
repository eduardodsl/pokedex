/**
 * Main class
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

class Main {

    constructor(){
        this.pokemonService = new PokemonService();
    }

    async main(){
        const pokemons = await this.pokemonService.getPokemons();
        console.log(pokemons);
    }

}

const app = new Main();

document.addEventListener("DOMContentLoaded", () => app.main());