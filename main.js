"use strict";
/**
 * Main class
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

class Main {

    constructor(){
        this.pokemonService = new PokemonService();
        this.listTemplate = new PokemonListTemplate();
        this.detailsTemplate = new PokemonDetailsTemplate({ show: false });
        this.noPokemonLoadedTemplate = new NoPokemonLoadedTemplate();
        this.errorTemplate = new ErrorTemplate();
        this.offset = 0;
        this.firstStep = this.getResolutionStep(window.innerWidth);
        this.step = 20;
        this.loading = false;
        this.activeEl = null;
    }

    getResolutionStep(resolution){
        if(resolution >= 3400) return 60;
        if(resolution > 2999) return 40;
        if(resolution > 1800) return 30;
        return 20;
    }

    /**
     * Checks if the page is allowed to load
     * @returns {Boolean}
     */
    canLoad(){
        const scrollStatus = new ScrollStatus(document.querySelector("#search #list"));
        return (scrollStatus.isBottom() && !this.loading && !this.pokemonService.atLimit());
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
        return this.offset += this.step;
    }

    /**
     * Adds data to the list template
     * @param {Number} offset 
     * @param {Number} limit 
     */
    async loadData(offset, limit){
        this.setLoading(true);
        const currentItems = this.listTemplate.data.items;
        const newItems = await this.pokemonService.getPokemons({ offset, limit });
        this.listTemplate.data.items = { ...currentItems, ...newItems };
        this.listTemplate.update();
        this.setLoading(false);
    }

    /**
     * Adds events to the templates
     */
    addEvents(){

        // if pages resizes and there is not enough pokemons to fill the screen
        window.addEventListener("resize", async () => {
            if(this.canLoad()) this.loadData(this.addOffset(), this.step);
        });

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
                    await this.pokemonService.getPokemonSpecies(pokemon, { evolutionChain: true });
                    this.detailsTemplate.data.pokemon = this.pokemonService.getSelectedPokemon();
                    this.detailsTemplate.data.show = true;
                    if(this.activeEl) this.activeEl.classList.remove("active");
                    this.activeEl = el;
                    this.activeEl.classList.add("active");
                    this.detailsTemplate.update();
                });
            });

            // loads more pokemons as the list comes to the end
            document.querySelector("#search #list").addEventListener("scroll", async (e) => {
                if(this.canLoad()) this.loadData(this.addOffset(), this.step);
            });
        });

    }

    /**
     * Main application execution method
     */
    async main(){
        
        try {
            // mount events on the template
            this.addEvents();
            this.listTemplate.mount("#list");
            this.detailsTemplate.mount("#details");
            this.detailsTemplate.mount("#details");
            // [firstStep] is resolution-dependant, the bigger the window width, the more it will try to load
            this.loadData(this.offset, this.firstStep);
            // from now on [offset] will increment by the value of [firstStep] minus the default value of [step]
            if(this.firstStep > this.step) this.offset = this.firstStep - this.step;
        }catch(e){
            console.error(e);
            this.errorTemplate.mount("#main");
            console.info("it wasn't possible to load the pokemon data, please check your connection settings!");
        }
    }

}

const app = new Main();

document.addEventListener("DOMContentLoaded", () => app.main());