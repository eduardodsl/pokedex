# Pokedex

A simple javascript app that reads the pokemon api for the DIO bootcamp. This app is able to load all pokemons on the API through lazy loading.

To load only the data, at least `utils.js` and `pokemon-service.js` are required.

```javascript
// load the pokemon service
const pokemonService = new PokemonService();
// get one pokemon...
const raichu = await pokemonService.getPokemon('raichu');
// get one pokemon with additional data
const starmie = await pokemonService.getPokemon('starmie', { species: true });
// ... or multiple pokemons ...
const pokemons = await pokemonService.getPokemons({ offset: 0, limit: 20 });
// ... with additional data
const pokemons = await pokemonService.getPokemons({ offset: 0, limit: 20 }, { species: true });
```

All loaded data is cached on `PokemonService()`