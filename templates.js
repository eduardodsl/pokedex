"use strict";
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
                    ${ pokemonTypesPartial(types) }
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
        
        if(!pokemon) return template+"<div class='no-selected'>Select an Pokémon in the list</div></div>";
        
        const name = pokemon.getName();
        const id = pokemon.getId();
        const officialArtwork = pokemon.getOfficialArtwork();
        const flavorText = pokemon.getFlavorText();
        const types = pokemon.hasDetails() ? pokemon.getTypes() : [];
        const stats = pokemon.getStats();
        const evolutionChain = pokemon.getEvolutionChain();

        template += `
        <button id="close-details">x</button>
        <div class="bg"></div>
        <div class="bg layer l0"></div>
        <div class="bg layer l1"></div>
        <div class="bg layer l2"></div>
        <div class="artwork">
            <img src="${ officialArtwork }" alt="official artwork of ${ name }">
        </div>
        <div class="title">
            <h3>
                <span class="pokemon-name">${ name }</span>
                <span class="pokemon-id">#${ id }</span>
            </h3>
        </div>
        <div class="desc">
            ${ flavorText }
        </div>
        ${ pokemonTypesPartial(types) }
        ${ pokemonStatsPartial(stats) }
        ${ evolutionChain ? pokemonEvolutionPartial(evolutionChain) : '' }
        `;
        
        template += `</div>`;

        return template;
    }

}

const pokemonEvolutionPartial = (chain) => {

    if(chain.isSingle()) return "";

    let template = "";
    let lastPhase = -1;

    template += `<div class="pokemon-evolution">`;
    chain.linkMap((evolution, phase, phaseIndex, totalIndex) => {
        
        // TODO: some pokemons have irregular evolution chains that are not yielding the correct pokemon data.
        // needs to check their cases and bring an appropriate solution

        const pokemon = evolution.getPokemon();

        if(!pokemon) return; // it should always have a pokemon (quirk for irregular evolutions)

        let frontSprite = "";
        if(!pokemon.hasDetails()){ // it should always have details (quirk for irregular evolutions)
            console.info(`pokémon [${pokemon.getName()}] had no details found, no pictures will be loaded.`);
        }else{
            frontSprite = pokemon.getFrontSprite();
        }

        const phaseNumber = phase+1;
        if(lastPhase !== phase) template += `<ul class="evolution-chain phase-${phaseNumber}">`;
        template += `<li class="evolution-phase phase-${phaseNumber}" data-phase="${phaseNumber}">
            <div class="evolution-phase-pokemon">
                <img src="${ frontSprite }">
                ${ pokemon.getName() }
            </div>
        </li>`;
        if(phaseIndex === (totalIndex - 1))
            template += `</ul>`;
        lastPhase = phase;

    });
    template += `</div>`;

    return template;

}

const pokemonStatsPartial = (stats) => {

    let total = 0;
    for(const key in stats){
        total += stats[key];
    }

    const maxAbility = 300; // the highest pokemon individual stats
    const maxTotal = 1300; // the highest pokemon total stats

    const showStatData = (type, stat, compare) => {
        return `
            <span class="stat-value">${stat}</span>
            <span class="stat-proportion">
                <span class="stat-proportion-wrapper">
                    <span style="width: ${ Calc.percentOf(stat, compare) }%" class="stat-proportion-bar stat-bg-${type}"></span>
                </span>
            </span>`;
    }

    return `<div class="pokemon-stats">
        <dl>
            <dt>hp</dt><dd>${ showStatData('hp', stats.hp, maxAbility) }</dd>
            <dt>attack</dt><dd>${ showStatData('attack', stats.attack, maxAbility) }</dd>
            <dt>defense</dt><dd>${ showStatData('defense', stats.defense, maxAbility) }</dd>
            <dt>s. attack</dt><dd>${ showStatData('sattack', stats["special-attack"], maxAbility)}</dd>
            <dt>s. defense</dt><dd>${ showStatData('sdefense', stats["special-defense"], maxAbility) }</dd>
            <dt>speed</dt><dd>${ showStatData('speed', stats.speed, maxAbility) }</dd>
            <dt>total</dt><dd>${ showStatData('total', total, maxTotal) }</dd>
        </dl>
    </div>`;
}

const pokemonAbilitiesPartial = (abilities) => {

    if(abilities.length){
        return `<div class="pokemon-abilities">
            <ul>
                ${ abilities.map( ability => `<li>${ability}</li>` ).join('') }
            </ul>
        </div>`;
    }

    return '';

}

const pokemonTypesPartial = (types, hasColor = true) => {
    
    if(types.length){
        return `<ul class="pokemon-types">
            ${ types.map( type => `<li class="type-tag ${ (hasColor) ? `bg-${type}` : `` } ">${type}</li>` ).join("") }
        </ul>`;
    }

    return '';
}

class ErrorTemplate extends BaseTemplate {
    
    render(){
        return `<div class="error">failure loading data, please check your connection or try again later</div>`;
    }

}