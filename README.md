# Pokedex

## Other Languages

* [Português](https://github.com/eduardodsl/pokedex/blob/main/README.pt.md);

![Image of the pokédex](/pokedex.png "Pokédex")

A simple javascript app that reads and presents the data read from the [pokeapi](https://pokeapi.co/) for the DIO bootcamp.

## Features

The original project was a list of the first generation of Pokémons with a pagination button to load more, this one was made from scratch with the following additional features:

* Lazy Loading: Pokémons will load as you scroll;
* Responsive: from mobile up to 4k (the bigger the resolution, more pokemons will be listed);
* Pokémon details: official art, description, stats, and evolution chain;
* All Pokémons: all Pokémons in the API can be loaded as you scroll;

## Pokémon Service

You can get the data from the API by only using the `PokemonService()` class by including `utils.js` and `pokemon-service.js`:

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