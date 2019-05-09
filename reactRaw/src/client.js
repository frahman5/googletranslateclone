import Flux from './flux.js'
import Utils from './utils.js'

// API Endpoints
// const TRANSLATE_ENDPOINT = "https://gtranslateclone-1557162436236.appspot.com/api/v1/translate"
// const DETECT_ENDPOINT = "https://gtranslateclone-1557162436236.appspot.com/api/v1/detectlanguage"
const TRANSLATE_ENDPOINT = "/api/v1/translate"
const DETECT_ENDPOINT = "/api/v1/detectlanguage"

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
	var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
	xmlhttp.onreadystatechange = () => { 
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				Flux.store.dispatch(Flux.createNewTargetTextAction(xmlhttp.responseText))
    }
	}
	xmlhttp.open("POST", TRANSLATE_ENDPOINT);
	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.send(JSON.stringify(data));
}

function getDetection(inputText) {
  let data = {
    "inputText": inputText
	}
	
	var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
	xmlhttp.open("POST", DETECT_ENDPOINT);
	xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlhttp.send(JSON.stringify(data));
	xmlhttp.onreadystatechange = () => { 
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				Flux.store.dispatch(Flux.createNewDetectionAction(xmlhttp.responseText))
    }
	}
}

// Export as a ES6 module
const Client = {
  getTranslation,
  getDetection
}
export default Client;