import Client from './client.js';
import { createStore, combineReducers } from 'redux';
import Config from './config.js'
import Utils from './utils.js';

/******* Definitions and Notes ********/
// --- 1: LanguageSelectionObject
// A LanguageSelectionObject is a JSON object with two fields: 'language' and 'selected'
// language: str. selected: bool. 
// It represents a language that is presented as an option for selection to the user
// e.g {'English', false}
// --- 2: JSON.parse(JSON.stringify(thing)) is a common pattern we use to deep-copy objects
// This is because Object.assign() only copies primitives by value. It copies nested objects
// by reference. 

// Action types
const SELECT_LANGUAGE_ACTION_TYPE = 'SELECT_LANGUAGE'
const SWITCH_SOURCE_TARGET_ACTION_TYPE = 'SWITCH_SOURCE_TARGET'
const TOGGLE_LANGUAGE_SELECTION_DROPDOWN_ACTION_TYPE = "TOGGLE_LANGUAGE_SELECTION_DROPDOWN"
const NEW_SOURCE_TEXT_ACTION_TYPE = "NEW_SOURCE_TEXT"
const NEW_TARGET_TEXT_ACTION_TYPE = "NEW_TARGET_TEXT"
const CLOSE_SELECT_LANGUAGE_DROPDOWN_ACTION_TYPE = "CLOSE_SELECT_LANGUAGE_DROPDOWN"
const NEW_SEARCH_TEXT_ACTION_TYPE = "NEW_SEARCH_TEXT"
const NEW_DETECTION_ACTION_TYPE = "NEW_DETECTION"

/********** ACTION CREATION FUNCTIONS *********/
// createSelectLanguageAction creates an action of type 'SELECT_LANGUAGE'
//    str str -> action
//    inputOrOutput must be one of "input" or "output"
//    selection must be a supported language for the given inputOrOutput
function createSelectLanguageAction(sourceOrTarget, selection, sourceText) {
  // insert checks for validity of inputOrOutput
  // insert a check to make sure selection is a supported language
  return {
    'type': SELECT_LANGUAGE_ACTION_TYPE,
    'sourceOrTarget': sourceOrTarget,
    'selection': selection,
    'sourceText': sourceText
  };
}

// createSwitchInputOutputAction creates an action of type "SWITCH_INPUT_OUTPUT"
// str str -> action
function createSwitchSourceTargetAction(newActiveSourceLanguage, newActiveTargetLanguage) {
  return {
    'type': SWITCH_SOURCE_TARGET_ACTION_TYPE,
    'newActiveSourceLanguage': newActiveSourceLanguage,
    'newActiveTargetLanguage': newActiveTargetLanguage
  };
}

/* createToggleLanguageSelectionDropdownAction creates an action of type 
  'TOGGLE_LANGUAGE_SELECTION_DROPDOWN'
   str -> action
   inputOrOutput must be one of "input" or "output" */
function createToggleLanguageSelectionDropdownAction(inputOrOutput) {
  // insert checks for validity of inputOrOutput
  return {
    'type': TOGGLE_LANGUAGE_SELECTION_DROPDOWN_ACTION_TYPE,
    'inputOrOutput': inputOrOutput
  };
}

function createNewDetectionAction(text) {
  return {
    'type': NEW_DETECTION_ACTION_TYPE,
    'text': text
  }
}

// createNewSourceAction creates an action that indicates the user entered new input text
// str str str -> action
function createNewSourceTextAction(text, sourceLanguage, targetLanguage) {
  return {
    'type': NEW_SOURCE_TEXT_ACTION_TYPE,
    'text': text,
    'sourceLanguage': sourceLanguage,
    'targetLanguage': targetLanguage
  };
}

// createNewSearchTextAction creates an action that indicates the user entered new search text
// str str str -> action
function createNewSearchTextAction(text) {
  return {
    'type': NEW_SEARCH_TEXT_ACTION_TYPE,
    'text': text,
  };
}

// createNewOutputAction creates an action that indicates the app has received new output text
function createNewTargetTextAction(text) {
  return {
    'type': NEW_TARGET_TEXT_ACTION_TYPE,
    'text': text
  };
}

// createCloseSelectLanguageDropdownAction cretes an action that signals we want to close the 
// select language dropdown.
function createCloseSelectLanguageDropdownAction() {
  return {
    'type': CLOSE_SELECT_LANGUAGE_DROPDOWN_ACTION_TYPE
  };
}

/********* Create the Initial State, Store, and Reducers ************/
const INITIAL_SOURCE_LANGUAGES_STATE = [
  createLanguageSelectionObject(Config.detectLanguageHeaderBarHTML, true),
  createLanguageSelectionObject("Albanian", false),
  createLanguageSelectionObject('Spanish', false),
  createLanguageSelectionObject('English', false)];
const INITIAL_TARGET_LANGUAGES_STATE = [
  createLanguageSelectionObject('Spanish', false),
  createLanguageSelectionObject('Russian', false),
  createLanguageSelectionObject('Portuguese', true)];

const rootReducer = combineReducers({
  'sourceLanguages': sourceLanguagesReducer,
  'targetLanguages': targetLanguagesReducer,
  'recentLanguages': recentLanguagesReducer,
  'sourceText': sourceTextReducer,
  'targetText': targetTextReducer,
  'selectBoxOpen': selectBoxOpenReducer,
  'languages': languagesReducer,
  'searchText': searchTextReducer,
  'sourceLanguageDetection': sourceLanguageDetectionReducer
});
const store = createStore(rootReducer);

function sourceLanguageDetectionReducer(state = "", action) {
  var newState // str e.g "en"

  switch (action.type) {
    case NEW_SOURCE_TEXT_ACTION_TYPE:
      newState = state
      if ((action.sourceLanguage === Config.detectLanguageDropdownMenuHTML) || (action.sourceLanguage === Config.detectLanguageHeaderBarHTML)) {
        Client.getDetection(action.text)
      }
      break;
    case SELECT_LANGUAGE_ACTION_TYPE:
      newState = state
      if ((action.selection === Config.detectLanguageDropdownMenuHTML) || (action.selection === Config.detectLanguageHeaderBarHTML)) {
        Client.getDetection(action.sourceText)
      } else if (action.sourceOrTarget === "source") {
        newState = ""
      }
      break;
    case NEW_DETECTION_ACTION_TYPE:
      newState = action.text
      break;
    default:
      newState = state
  }

  return newState
}
// searchTextReducer acts on the searchText property
function searchTextReducer(state = "", action) {
  var newState; // str e.g "Spa"

  switch (action.type) {
    case NEW_SEARCH_TEXT_ACTION_TYPE:
      newState = action.text
      break;
    case TOGGLE_LANGUAGE_SELECTION_DROPDOWN_ACTION_TYPE:
    case CLOSE_SELECT_LANGUAGE_DROPDOWN_ACTION_TYPE:
      newState = ""
      break;
    default:
      newState = state;
  }

  return newState
}

// languagesReducer acts on the langauges property. It's mainly here to respond to searches.
function languagesReducer(state = Utils.getSupportedLanguagesArray(), action) {
  var newState; // ArrayOfStrings (e.g ["Spanish", "English" ..., "Italian"])
  var newLanguageArray; // ArrayOfStrings (e.g ["Spanish", "French"])

  switch (action.type) {
    case NEW_SEARCH_TEXT_ACTION_TYPE:
      newLanguageArray = Utils.searchLanguges(action.text)
      newState = newLanguageArray
      break;
    case CLOSE_SELECT_LANGUAGE_DROPDOWN_ACTION_TYPE:
    case TOGGLE_LANGUAGE_SELECTION_DROPDOWN_ACTION_TYPE:
      newState = Utils.getSupportedLanguagesArray();
      break;
    default:
      newState = state;
  }

  return newState
}

// sourceLanguagesReducer handles all updates to the 'sourceLanguages' property
function sourceLanguagesReducer(state = INITIAL_SOURCE_LANGUAGES_STATE, action) {
  var newState; // ArrayOfLanguageSelectionObjects 
  var newSourceLanguageArray; // ArrayOfLanguageSelectionObjects
  var newActiveSourceLanguage; // str e.g "French"

  newSourceLanguageArray = state.slice(); // deep copy of source language array

  // Get the new active source language
  switch (action.type) {
    case SELECT_LANGUAGE_ACTION_TYPE:
      newActiveSourceLanguage = action.selection;
      break;
    case SWITCH_SOURCE_TARGET_ACTION_TYPE:
      newActiveSourceLanguage = action.newActiveSourceLanguage;
      break;
    default:
  // do nothing
  }

  // Implement the reduction
  switch (action.type) {
    case SELECT_LANGUAGE_ACTION_TYPE:
    case SWITCH_SOURCE_TARGET_ACTION_TYPE:
      // Check if this was a target selection. If so, return state as is. 
      if ((action.sourceOrTarget === "target") && (action.type === SELECT_LANGUAGE_ACTION_TYPE)) {
        newState = state;
        break;
      }

      // Update the active language and create the new state
      updateActiveLanguageInLanguageSelectionArray(newSourceLanguageArray, newActiveSourceLanguage)
      newState = newSourceLanguageArray

      break;
    default:
      newState = state;
  }

  return newState
}

// targetLanguagesReducer handles all updates to the 'targetLanguages' property
function targetLanguagesReducer(state = INITIAL_TARGET_LANGUAGES_STATE, action) {
  var newState; // ArrayOfLanguageSelectionObjects 
  var newTargetLanguageArray; // ArrayOfLanguageSelectionObjects
  var newActiveTargetLanguage; // str e.g "French"

  newTargetLanguageArray = state.slice(); // deep copy of target language array

  // Get the new active source language
  switch (action.type) {
    case SELECT_LANGUAGE_ACTION_TYPE:
      newActiveTargetLanguage = action.selection;
      break;
    case SWITCH_SOURCE_TARGET_ACTION_TYPE:
      newActiveTargetLanguage = action.newActiveTargetLanguage;
      break;
    default:
    // do nothing
  }

  // Implement the reduction
  switch (action.type) {
    case SELECT_LANGUAGE_ACTION_TYPE:
    case SWITCH_SOURCE_TARGET_ACTION_TYPE:
      // Check if this was a source selection. If so, return state as is. 
      if ((action.sourceOrTarget === "source") && (action.type === SELECT_LANGUAGE_ACTION_TYPE)) {
        newState = state;
        break;
      }

      // Update the active language and create the new state
      updateActiveLanguageInLanguageSelectionArray(newTargetLanguageArray, newActiveTargetLanguage)
      newState = newTargetLanguageArray

      break;
    default:
      newState = state;
  }

  return newState
}

// recentLanguagesReducer handles all updates to the 'recentLanguages' property
function recentLanguagesReducer(state = [], action) {
  var newRecentLanguageArray = state.slice() // ArrayOfStrings e.g ['english', 'Russian', 'Spanish']
  switch (action.type) {
    // If the user selects a new language, update the recent languages array
    case SELECT_LANGUAGE_ACTION_TYPE:
      if ((action.selection === Config.detectLanguageDropdownMenuHTML) || (action.selection === Config.detectLanguageHeaderBarHTML)) {
        // If they selected "Detect Language", make no change
      } else if (newRecentLanguageArray.indexOf(action.selection) >= 0) {

        // If the language is already in recentLanguages, move it to the top of the stack
        newRecentLanguageArray = newRecentLanguageArray.filter((lang) => {
          return lang !== action.selection
        })
        newRecentLanguageArray = [action.selection].concat(newRecentLanguageArray)
      } else if (state.length === 0) {

        // If there are not yet any recent languages, create a length 1 recent languages array
        newRecentLanguageArray = [action.selection]
      } else if (state.length < 5) {

        // If the recent language array is less than 5 items long, add the selection to the end of the array
        newRecentLanguageArray.push(action.selection)
      } else {

        // TODO: assert that its equal to 5

        // If we have a full recentLanguages stack, then pop off the end and add the new one at the beginning
        newRecentLanguageArray.pop()
        newRecentLanguageArray = [action.selection].concat(newRecentLanguageArray)
      }
      break;
    default:
  // Do nothing
  }

  return newRecentLanguageArray
}

// sourceTextReducer handles all updates to the 'sourceText' property
function sourceTextReducer(state = "", action) {
  var newState // JSON Object

  switch (action.type) {
    case NEW_SOURCE_TEXT_ACTION_TYPE:
      console.log("Value of NEW_SOURCE_TEXT action in sourceTextReducer: ", action)
      // Initiate the translation process
      if (action.sourceLanguage === Config.detectLanguageHeaderBarHTML) {
        Client.getTranslation(action.text, "", action.targetLanguage, true);
      } else {
        Client.getTranslation(action.text, action.sourceLanguage, action.targetLanguage, false);
      }

      // Update the state
      newState = action.text;

      break;
    default:
      newState = state;
  }

  return newState;
}

// targetTextReducer handles all updates to the 'targetText' property
function targetTextReducer(state = "", action) {
  var newState // JSON Object

  switch (action.type) {
    case NEW_TARGET_TEXT_ACTION_TYPE:
      newState = action.text
      break;
    case SELECT_LANGUAGE_ACTION_TYPE:
    default:
      newState = state;
  }

  return newState
}

// selectBoxOpenReducer handles all updates to the 'selectBoxOpen' property
function selectBoxOpenReducer(state = "", action) {
  var newState; // JSON Object e.g {'selectBoxOpen' : "source"}

  switch (action.type) {
    case TOGGLE_LANGUAGE_SELECTION_DROPDOWN_ACTION_TYPE:
      newState = ((state === "") ? action.inputOrOutput : "");
      break;
    case CLOSE_SELECT_LANGUAGE_DROPDOWN_ACTION_TYPE:
      newState = "";
      break;
    case SWITCH_SOURCE_TARGET_ACTION_TYPE:
      newState = ((state !== "") ? "" : state)
      break;
    default:
      newState = state;
  }

  return newState;
}


/********* HELPER FUNCTIONS *********/
// doesLanguageSelectionArrayContainLanguage checks if the given languageSelectionArray contains
// the given language. It does not modify the original array
// ArrayOfLanguageSelectionObjects str -> bool
// e.g [{'language': Russian', 'selected': true}, {'language': 'English', 'selected': false}] 'french' -> false
// It handles the "Detect Language" case specifically, considering any of the multiple ways Detect Language is
// written to be equal (see Config for more on detect language specifications)
function doesLanguageSelectionArrayContainLanguage(languageArray, language) {
  for (var index in languageArray) {
    // Handle ordinary case
    if (languageArray[index].language === language) {
      return true;
    }

    // Handle the Detect Language case
    let detectLanguageIsInArray = (languageArray[index].language === Config.detectLanguageHeaderBarHTML);
    let languageIsDetectLanguage = (language === Config.detectLanguageHeaderBarHTML || language === Config.detectLanguageDropdownMenuHTML);
    if (detectLanguageIsInArray && languageIsDetectLanguage) {
      return true;
    }
  }

  return false;
}

// changeActiveLanguageInSourceOrTargetLanguageArray modifies the original array such that the given 
// language is selected and all others are not
// ArrayOfLanguageSelectionObjects str -> None
// e.g [{'language': Russian', 'selected': true}, {'language': 'English', 'selected': false}] 'french' -> None
// It handles the "Detect Language" case as well, since getIndexOfLanguageInLanguageArray handles Detect Language
function changeActiveLanguageInSourceOrTargetLanguageArray(languageArray, language) {
  var index = getIndexOfLanguageInLanguageArray(languageArray, language);
  resetLanguageArrayToAllFalses(languageArray);
  languageArray[index].selected = true;
}

// addNewActiveLanguageToSourceOrTargetLanguageArray modifies the original array such that the given 
// language is in the "first" position and the other languages are moved along accordingly. 
// If the given languageArray is a sourceLanguagesArray, then "first" is actually "second", since "Detect Languages"
// never movies. 
// ArrayOfLanguageSelectionObjects str -> None
// e.g [{'language': Russian', 'selected': true}, {'language': 'English', 'selected': false}] 'french' -> None
function addNewActiveLanguageToSourceOrTargetLanguageArray(languageArray, language) {
  resetLanguageArrayToAllFalses(languageArray)
  if (languageArray[0].language === Config.detectLanguageHeaderBarHTML) {
    languageArray["3"] = languageArray["2"];
    languageArray["2"] = languageArray["1"];
    languageArray["1"] = createLanguageSelectionObject(language, true);
  } else {
    languageArray["2"] = languageArray["1"];
    languageArray["1"] = languageArray["0"];
    languageArray["0"] = createLanguageSelectionObject(language, true);
  }
}

// getIndexOfLanguageInLanguageArray gets the index of the given language in the given 
// language array. It does not modify the original array.
// ArrayOfLanguageSelectionObjects str -> int
// e.g [{'language': Russian', 'selected': true}, {'language': 'English', 'selected': false}] 'English' -> 1
// It handles the "Detect Language" case specifically, considering any of the multiple ways Detect Language is
// written to be equal (see Config for more on detect language specifications)
// It assumes the language is in the array. If it is not, it throws an error
function getIndexOfLanguageInLanguageArray(languageArray, language) {
  // TODO: Check that it's in there. If it's not, throw an error

  for (var index in languageArray) {
    // Handle normal case
    if (languageArray[index].language === language) {
      return index;
    }

    // Handle the Detect Language case
    let arrayLangIsDetectLanguage = (languageArray[index].language === Config.detectLanguageHeaderBarHTML);
    let givenLangIsDetectLanguage = (language === Config.detectLanguageHeaderBarHTML || language === Config.detectLanguageDropdownMenuHTML);
    if (arrayLangIsDetectLanguage && givenLangIsDetectLanguage) {
      // TODO: Check that index is 0. If not, throw an error
      return index;
    }
  }

  return -1 // TODO: Shoudln't ever get here. Put in error handling to make sure
}

// updateActiveLanguageInLanguageSelectionArray updates the active language in a language selection array. 
// It modifies the original array. 
// // ArrayOfLanguageSelectionObjects str -> None
// e.g [{'language': Russian', 'selected': true}, {'language': 'English', 'selected': false}] 'English' -> None
function updateActiveLanguageInLanguageSelectionArray(languageArray, newActiveLanguage) {
  if (doesLanguageSelectionArrayContainLanguage(languageArray, newActiveLanguage)) {
    // If the newActiveLanguage is in the current Languages array, then mark its "selected" 
    // property true and mark the "selected" property of all other languages false
    changeActiveLanguageInSourceOrTargetLanguageArray(languageArray, newActiveLanguage)
  } else {
    // If the newActiveSourceLanguage is NOT in the current languages array, then make it the 
    // second item (we don't remove "Detect Language" and bump up the other languages accordingly)
    addNewActiveLanguageToSourceOrTargetLanguageArray(languageArray, newActiveLanguage)
  }
}
// resetLanguageArrayToAllFalses sets the value of "selected" to value in every object in the 
// given languageArray
function resetLanguageArrayToAllFalses(languageArray) {
  for (var index in languageArray) {
    languageArray[index].selected = false;
  }
}

// createLanguageSelectionObject creates a LanguageSelectionObject
// str bool -> LanguageSelectionObject
function createLanguageSelectionObject(language, isSelected) {
  return {
    'language': language,
    'selected': isSelected
  }
}



const Flux = {
  store,
  createSelectLanguageAction,
  createSwitchSourceTargetAction,
  createToggleLanguageSelectionDropdownAction,
  createNewSourceTextAction,
  createNewTargetTextAction,
  createCloseSelectLanguageDropdownAction,
  createNewSearchTextAction,
  createNewDetectionAction
}

export default Flux;
