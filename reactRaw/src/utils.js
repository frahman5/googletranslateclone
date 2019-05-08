import Config from './config.js'

function isSwitchButtonActive(sourceLanguageArray, targetLanguageArray) {
  let activeSourceLang = getActiveLanguage(sourceLanguageArray)
  let activeTargetLang = getActiveLanguage(targetLanguageArray)
  // If the user has selected "Detect Language", switchButton is inactive
  return !(sourceLanguageArray["0"].selected || (activeSourceLang === activeTargetLang))
}

/* given a language array from the state tree, return the language that
   corresponds to the active language
   ArrayOfLanguageObjects -> str (e.g "French")
*/
function getActiveLanguage(languageArray) {
  for (var index in languageArray) {
    var languageObject = languageArray[index]
    if (languageObject.selected) {
      return languageObject.language
    }
  }
}

// getSupportedLanguagesArray returns an array of all the supported languages in human-readable
// format. e.g ["English", "Spanish", ...]
function getSupportedLanguagesArray() {
  var langArray = []
  for (let langtag in Config.Languages) {
    langArray.push(Config.Languages[langtag])
  }

  return langArray
}

// getLanguageTagMap returns a map that translates human-readable formats into language tags
// for all the supported languages e.g {"English" : "en", "Russian", "ru", ...}
function getLanguageTagMap() {
  var langTagMapArray = []
  for (let langtag in Config.Languages) {
    langTagMapArray.push([Config.Languages[langtag], langtag])
  }
  var languageTagMap = new Map(langTagMapArray)
  return languageTagMap
}

// getLanguageTagToLanguageMap returns a map that translates language tags (e.g "en") to human 
// readable language names (e.g "english")
function getLanguageTagToLanguageMap() {
  var langTagMapArray = []
  for (let langtag in Config.Languages) {
    langTagMapArray.push([langtag, Config.Languages[langtag]])
  }
  var languageTagMap = new Map(langTagMapArray)
  return languageTagMap
}
// searchArray searches over all supported languages (e.g ["English", "French", "Spanish"])
// and returns a new languageArray that contains the best matches for the given searchText
function searchLanguges(searchText) {
  let allLanguages = getSupportedLanguagesArray()
  var newLanguageArray = allLanguages.filter((lang) => {
    return lang.toLowerCase().startsWith(searchText.toLowerCase())
  })
  console.log("New language array at end of search array function", newLanguageArray)
  return newLanguageArray
}

// Export as a ES6 module
const Utils = {
  isSwitchButtonActive,
  getActiveLanguage,
  getSupportedLanguagesArray,
  getLanguageTagMap,
  searchLanguges,
  getLanguageTagToLanguageMap
}
export default Utils;