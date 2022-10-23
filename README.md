# Pokedex

A simple javascript app that reads the pokemon api for the DIO bootcamp

How to load them programmatically, it requires at least `utils.js` and `pokemon-service.js` to be loaded in this order.
```javascript
// load the pokemon service
const pokemonService = new PokemonService();
// get one pokemon...
const raichu = await pokemonService.getPokemon('raichu');
// ... or multiple pokemons
const pokemons = await pokemonService.getPokemons();
```