/**
 * Main class
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

class Main {

    constructor(){
        this.pokemonService = new PokemonService();
    }

    async main(){
        
        let items;

        try {
            items = await this.pokemonService.getPokemons({ offset: 0, limit: 20 });
        }catch(e){
            console.error(e);
        }finally {
            if(items){
                const listTemplate = new PokemonListTemplate({ items });
                const detailsTemplate = new PokemonDetailsTemplate({ show: false });
                listTemplate.onMount((data) => {
                    document.querySelectorAll("#pokemon-list li.pokemon-item").forEach((el) => {
                        el.addEventListener("click", (ev) => {
                            ev.stopPropagation();
                            this.pokemonService.selectPokemon(ev.currentTarget.dataset.pkmid);
                            detailsTemplate.data.pokemon = this.pokemonService.getSelectedPokemon();
                            detailsTemplate.data.show = true;
                            detailsTemplate.update();
                        });
                    });
                });
                listTemplate.mount("#list");
                detailsTemplate.mount("#details");
            }else{
                console.info("it wasn't possible to load the pokemon data, please check your connection settings!");
            }
        }
        
    }

}

const app = new Main();

document.addEventListener("DOMContentLoaded", () => app.main());