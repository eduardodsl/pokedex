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
    mount(query){
        this.el = document.querySelector(query);
        this.update();
    }
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
        const pokemon = this.data.pokemon;
        
        const name = pokemon.getName();
        const types = pokemon.getTypes();
        const image = pokemon.getFrontSprite();
        const id = pokemon.getId();

        let template = `<li id="pokemon-${name}" class="pokemon-item bg-${types[0]}" data-pkmid="${name}">`;
        template += "<h2>"+name+"</h2>";
        template += "<h3>#"+id+"</h3>";
        template += "<img src="+image+">";
        template += "<ul class='types'>";
        types.forEach( type => template += `<li class="type-tag bg-${type}">${type}</li>` );
        template += "</ul>";
        template += `</li>`;
        return template;
    }

}

class PokemonDetailsTemplate extends BaseTemplate {

    render(){
        let template = `<div id="details" class="${this.data.show ? 'show' : ''}">`;
        if(this.data?.pokemon){
            const pokemon = this.data.pokemon;
            template += `<img src="${pokemon.getFrontSprite()}">`
            template += "Weight: "+pokemon.getWeight();
        }else{
            template += "no pokemon selected";
        }
        template += "</div>";
        return template;
    }

}