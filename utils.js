/**
 * Utilities to help structure the app data
 * @author Eduardo Augusto da Silva Leite <eduardodsl@gmail.com>
 */

class Requester {

    async get(url){
        if(!url){
            throw new Error("url is required!");
        }
        try {
            const data = await fetch(url);
            const json = await data.json();
            return json;
        }catch(e){
            throw e;
        }
    }

}

/**
 * Basis for all objects extracted from the API, it contains the extracted data
 */
class BaseDataObj {
    #dataObj;
    constructor(data){
        if(typeof data !== "object") throw TypeError("[data] is not a valid object!");
        this.#dataObj = data;
    }
    getDataObj(){
        return this.#dataObj;
    }
}

/**
 * A single pokemon with name, for more details it needs to have a [PokemonDetail] loaded
 */
class Pokemon extends BaseDataObj {

    #name;
    #url;
    #details;
    #hasDetails;

    constructor(data){
        super(data);
        this.#name = data.name;
        this.#url = data.url;
        this.#hasDetails = false;
    }

    getName(){
        return this.#name;
    }

    getUrl(){
        return this.#url;
    }

    setDetails(details){
        if(details.getName() !== this.#name) throw Error(`[${details.name}] and [${this.#name}] are not the same pokemon!`);
        this.#details = details;
        this.#hasDetails = true;
    }
    
    getDetails(){
        if(this.#hasDetails){
            return this.#details;
        }else{
            throw new Error(`pokemon [${this.#name}] has no details loaded!`);
        }
    }

    getId(){
        return this.getDetails().getId();
    }

    getWeight(){
        return this.getDetails().getWeight();
    }

}

/**
 * Pokemon details
 */
class PokemonDetails extends BaseDataObj {
    
    #name;
    #weight;
    #id;

    constructor(data){
        super(data);
        this.#id = data.id;
        this.#name = data.name;
        this.#weight = data.weight;
    }

    getId(){
        return this.#id;
    }

    getName(){
        return this.#name;
    }

    getWeight(){
        return this.#weight;
    }

}

/**
 * Class builder, if data is an array, it will return the objects constructed inside an array
 * @param {any} className - an valid class to wrap the data
 * @param {any} data - json data used in the given class constructor
 * @returns {any|Array<any>}
 */
function mapper(className, data){
    if(Array.isArray(data)){
        let ret = [];
        for(let i = 0; i < data.length; i++){
            ret.push(new className(data[i]));
        }
        return ret;
    }else{
        return new className(data);
    }
}