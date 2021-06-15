import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const { async } = require('q');

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    //* 0) Update Results with active selection
    resultsView.update(model.getSearchResultsPage());

    //+ Spinner
    recipeView.renderSpinner();

    //*1)  Loading Recipe
    await model.loadRecipe(id);

    //*2) Rendering Recipe
    recipeView.render(model.state.recipe);

    //* 3)Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //+ Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //+ Load Search Query
    await model.loadSearchResults(query);

    //+ Render Results
    resultsView.render(model.getSearchResultsPage());

    //+ Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //+ Render New Results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //+ Update pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update Recipe Servings
  model.updateServings(newServings);

  //Update View
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //+ 1) Add/remove bookmark

  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //+ 2) Render bookmarks

  bookmarksView.render(model.state.bookmarks);

  //+ 3) Update recipe view

  recipeView.update(model.state.recipe);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //+ Render Spinner
    addRecipeView.renderSpinner();

    //+ Upload New Recipe Data
    await model.uploadRecipe(newRecipe);

    //+ Render Recipe
    recipeView.render(model.state.recipe);

    //+ Display success message
    addRecipeView.renderMessage();

    //+ Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //+ Change URL to new recipe link
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //+ Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
  setTimeout(function () {
    location.reload();
  }, MODAL_CLOSE_SEC * 1000);
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHanlderUpload(controlAddRecipe);
};
init();
