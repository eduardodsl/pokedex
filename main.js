/**
 * Main class
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

class Main {

    constructor(){
        this.pokemonService = new PokemonService();
        this.listTemplate = new PokemonListTemplate();
        this.detailsTemplate = new PokemonDetailsTemplate({ show: false });
        this.offset = 0;
        this.limit = 20;
        this.loading = false;
    }

    /**
     * Toggles the page's loading status
     * @param {bool} isLoading 
     */
    setLoading(isLoading){
        if(isLoading)document.body.classList.add("loading");
        else document.body.classList.remove("loading");
        this.loading = isLoading;
    }

    /**
     * Increments the pagination offset
     * @returns {number}
     */
    addOffset(){
        return this.offset += 20;
    }

    /**
     * Adds events to the templates
     */
    addEvents(){

        // when the pokemon details template is loaded/updated, adds an event listener to the close button
        this.detailsTemplate.onMount((data) => {
            if(data.show){
                document.querySelector("#close-details").addEventListener("click", (e) => {
                    data.show = false;
                    this.detailsTemplate.update();
                });
            }
        });

        // when the pokemon list template is loaded/updated, adds scrolling and item click events
        this.listTemplate.onMount((data) => {
            document.querySelectorAll("#pokemon-list li.pokemon-item").forEach((el) => {
                el.addEventListener("click", async (ev) => {
                    ev.stopPropagation();
                    const pokemon = this.pokemonService.selectPokemon(ev.currentTarget.dataset.pkmid);
                    await this.pokemonService.getPokemonSpecies(pokemon);
                    this.detailsTemplate.data.pokemon = this.pokemonService.getSelectedPokemon();
                    this.detailsTemplate.data.show = true;
                    this.detailsTemplate.update();
                });
            });

            document.querySelector("#search").addEventListener("scroll", async (e) => {
                const scrollStatus = new ScrollStatus(e.currentTarget);
                if(scrollStatus.isBottom() && !this.loading && !this.pokemonService.atLimit()){
                    this.setLoading(true);
                    const currentItems = this.listTemplate.data.items;
                    const newItems = await this.pokemonService.getPokemons({ offset: this.addOffset(), limit: this.limit });
                    this.listTemplate.data.items = { ...currentItems, ...newItems };
                    this.listTemplate.update();
                    this.setLoading(false);
                }
            });
        });

    }

    /**
     * Main application execution method
     */
    async main(){
        
        let items = null;

        try {
            items = await this.pokemonService.getPokemons({ offset: this.offset, limit: this.limit });
        }catch(e){
            console.error(e);
        }finally {
            if(items){
                this.listTemplate.data.items = items;
                this.addEvents();
                this.listTemplate.mount("#list");
                this.detailsTemplate.mount("#details");
            }else{
                console.info("it wasn't possible to load the pokemon data, please check your connection settings!");
            }
        }
    }

}

const app = new Main();

document.addEventListener("DOMContentLoaded", () => app.main());