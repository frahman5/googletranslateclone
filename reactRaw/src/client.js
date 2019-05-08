import Flux from './flux.js'
import Utils from './utils.js'

// API Endpoints
const TRANSLATE_ENDPOINT = "https://gtranslateclone-1557162436236.appspot.com/api/v1/translate"
const DETECT_ENDPOINT = "https://gtranslateclone-1557162436236.appspot.com/api/v1/detectlanguage"

// languageTagMap translates human-readable language names into ~2-3 character language tags that are compatable with
// Google Translate's machine algorthms. This is needed for compatability with the server
// e.g "English" -> "en". e.g "Russian" -> "ru"
const languageTagMap = Utils.getLanguageTagMap()

/*  getTranslation makes a request to the server to get the given text translated
    if shouldDetectLanguage is true, then it asks the server to the detect the language as well
    str bool -> str */
function getTranslation(inputText, inputLang, outputLang, shouldDetectLanguage) {
  let data = {
    "inputText": inputText,
    "inputLanguage": languageTagMap.get(inputLang),
    "outputLanguage": languageTagMap.get(outputLang),
    "shouldDetectLanguage": shouldDetectLanguage
  }
  // Should add something that checks status
  return fetch(TRANSLATE_ENDPOINT, {
    method: 'post',
    body: JSON.stringify(data),
  }).then(loadTranslationFromServer);
}

function getDetection(inputText) {
  let data = {
    "inputText": inputText
  }
  console.log("data sent out in getDetection", data)

  return fetch(DETECT_ENDPOINT, {
    method: 'post',
    body: JSON.stringify(data),
  }).then(loadDetectionFromServer);

}

async function loadDetectionFromServer(response) {
  let text = await response.text()
  console.log("Text in loadDetectionFromServer", text)
  Flux.store.dispatch(Flux.createNewDetectionAction(text))
}

async function loadTranslationFromServer(response) {
  let text = await response.text()
  Flux.store.dispatch(Flux.createNewTargetTextAction(text))
}


// Export as a ES6 module
const Client = {
  getTranslation,
  getDetection
}
export default Client;