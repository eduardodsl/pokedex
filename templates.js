/**
 * Simple templating system to help structure the data on the html document
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

class BaseTemplate {

    data;
    el;
    constructor(data){
        this.data = data || {};
    }
    /**
     * Sets the template to render its contents in the defined [query] selector
     * @param {string} query - query selector as in `document.querySelector()`
     */
    mount(query){
        this.el = document.querySelector(query);
        this.update();
    }
    /**
     * Renders the page and applies its event listeners
     */
    update(){
        this.el.innerHTML = this.render();
        this.mountEvent(this.data);
    }
    mountEvent() { return null; }
    render() { return ""; }
    onMount(func){
        this.mountEvent = func;
    }

}

class PokemonListTemplate extends BaseTemplate {

    render(){
        let template = "<ul id='pokemon-list'>";
        for(let i in this.data.items){
            const pokemonItem = new PokemonItemTemplate({ pokemon: this.data.items[i] });
            template += pokemonItem.render();
        }
        template += "</ul>";
        return template;
    }

}

class PokemonItemTemplate extends BaseTemplate {
    
    render(){
        
        const pokemon = this.data?.pokemon;
        let template = "a pokemon is required to load this template!";
        
        if(!pokemon) return template;

        const name = pokemon.getName();
        const types = pokemon.getTypes();
        const frontImage = pokemon.getFrontSprite();
        const id = pokemon.getId();

        template = `
        <li id="pokemon-${name}" class="pokemon-item" data-pkmid="${name}">
            <div class="content">
                <div class="image"><img src="${frontImage}" alt="front image of ${name}"></div>
                <div class="title">
                    <h2>${name}<span class="id">#${id}</span></h2>
                </div>
                <div class='details'>
                    <ul>`;
                        types.forEach( type => template += `<li class="type-tag bg-${type}">${type}</li>` );
                    template += `
                    </ul>
                </div>
            </div>
        </li>`;
        
        return template;

    }

}

class PokemonDetailsTemplate extends BaseTemplate {

    render(){

        const pokemon = this.data?.pokemon;

        if(this.data?.show) this.el.classList.add("show");
        else this.el.classList.remove("show");

        let template = `<div>`;
        
        if(!pokemon) return template+"no pokemon selected</div>";
        
        const name = pokemon.getName();
        const id = pokemon.getId();
        const frontImage = pokemon.getFrontSprite();
        const backImage = pokemon.getBackSprite();
        const officialArtwork = pokemon.getOfficialArtwork();
        const flavorText = pokemon.getFlavorText();

        template += `
        <button id="close-details">close</button>
        <div class="bg"></div>
        <div class="bg layer">camada 1</div>
        <div class="bg layer">camada 2</div>
        <div class="title">
            <h3>${name}#${id}</h3>
        </div>
        <div class="artwork">
            <img src="${officialArtwork}" alt="official artwork of ${name}">
        </div>
        <div class="sprites">
            <div class="img-front">
                <img src="${frontImage}" alt="front image of ${name}">
                <div>Front</div>
            </div>
            <div class="img-back">
                <img src="${backImage}" alt="back image of ${name}">
                <div>Back</div>
            </div>
        </div>
        <div class="desc">
            ${flavorText}
        </div>
        `;
        
        template += `</div>`;

        return template;
    }

}

class ErrorTemplate extends BaseTemplate {
    
    render(){
        return `<div class="error">failure loading data, please check your connection or try again later</div>`;
    }

}