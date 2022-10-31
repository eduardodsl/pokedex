# Pokedex

## Outros Idiomas

* [English](https://github.com/eduardodsl/pokedex/blob/main/README.md);

![Image of the pokédex](/pokedex.png "Pokédex")

Pokédex é um simples aplicativo em javascript que lê e apresenta os dados da [pokeapi](https://pokeapi.co/), para o bootcamp da DIO.

## Características

O projeto original consistia em uma lista da primeira geração de Pokémons com um botão de paginação para carregar mais, este em particular foi feito do zero contendo as seguintes características adicionais:

* Lazy Loading: Pokémons serão carregados conforme você rola a lista;
* Responsivo: de mobile até 4k (quanto maior a resolução, mais Pokémons serão listados de uma vez);
* Detalhes do Pokémon: arte oficial, descrição, status e fases de evolução;
* Todos os Pokémons: todos os Pokémons existentes na API podem ser carregados conforme você rola a lista;

## Pokémon Service

Você pode carregar os dados da API apenas usando o `PokemonService()` ao incluir `utils.js` e `pokemon-service.js`:

```javascript
// instancia o serviço
const pokemonService = new PokemonService();
// carrega um pokemon...
const raichu = await pokemonService.getPokemon('raichu');
// carrega um pokemon com dados adicionais
const starmie = await pokemonService.getPokemon('starmie', { species: true });
// ... ou múltiplos pokemons ...
const pokemons = await pokemonService.getPokemons({ offset: 0, limit: 20 });
// ... com dados adicionais
const pokemons = await pokemonService.getPokemons({ offset: 0, limit: 20 }, { species: true });
```