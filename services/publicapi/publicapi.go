package publicapi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"cloud.google.com/go/translate"
	"github.com/frahman5/googletranslateclonebackend/services/config"
	"golang.org/x/text/language"
)

type translatePayload struct {
	InputText            string `json:"inputText"`
	InputLanguage        string `json:"inputLanguage"`
	OutputLanguage       string `json:"outputLanguage"`
	ShouldDetectLanguage bool   `json:"shouldDetectLanguage"`
}

type detectPayload struct {
	InputText string `json:"inputText"`
}

// API is a struct that holds all the other structs necessary to handle API requests.
type API struct {
	// Config is a type that holds all the configurations for the app
	Config config.Config

	// TranslationClient is the agent that speaks with the Google Translate API
	TranslationClient *translate.Client

	// Context is the HTTP context
	Context context.Context
}

// HandleTranslate is the request handler for /translate. It translates the given text,
// detecting the input language if needed, and returns the appropriate result
func (a *API) HandleTranslate(w http.ResponseWriter, r *http.Request) {
	var (
		inputTag, targetTag language.Tag
		opts                translate.Options
		payload             translatePayload
		translations        []translate.Translation
		matcher             language.Matcher
		err                 error
	)

	// Unmarshal the JSON payload
	if err = json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), 400)
		log.Println(err.Error())
		return
	}

	// get the matcher
	matcher = a.getSuppoortedLanguagesMatcher()

	// Get the input language
	inputTag, _ = language.MatchStrings(matcher, payload.InputLanguage)
	fmt.Println(inputTag)

	// Get the target language.
	targetTag, _ = language.MatchStrings(matcher, payload.OutputLanguage)
	fmt.Println(targetTag)

	// Translates the text.
	opts = translate.Options{Source: inputTag, Format: translate.Text, Model: "base"}
	if !payload.ShouldDetectLanguage {
		// If we're not detecting the language, pass in an opts with the best guess for input language
		translations, err = a.TranslationClient.Translate(a.Context, []string{payload.InputText}, targetTag, &opts)
	}
	// If we're detecting the language, then pass in a nil options and google will detect for us
	translations, err = a.TranslationClient.Translate(a.Context, []string{payload.InputText}, targetTag, nil)
	if err != nil {
		http.Error(w, err.Error(), 400)
		log.Printf("Failed to translate text: %v", err)
		return
	}

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	fmt.Fprint(w, translations[0].Text)
}

// HealthCheckHandler is the handler for /. It signals that the server is responding to requests.
func (a *API) HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")
}

// HandleDetectLanguage is the handler for /detectlanguage. It returns a best guess for the the
// language of the inputText
func (a *API) HandleDetectLanguage(w http.ResponseWriter, r *http.Request) {
	var (
		detections [][]translate.Detection
		payload    detectPayload
		guessTag   string
		err        error
	)

	// Unmarshal the JSON payload
	if err = json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), 400)
		log.Println(err.Error())
		return
	}

	if detections, err = a.TranslationClient.DetectLanguage(a.Context, []string{payload.InputText}); err != nil {
		http.Error(w, err.Error(), 400)
		log.Println(err.Error())
		return
	}

	// detections[0] because this endpoint expects to only receive ONE piece of text. So the first slice of dections
	// is what we want.
	for _, detectionSlice := range detections {
		var maxConfidence = -1.0
		for _, detection := range detectionSlice {
			if detection.Confidence > maxConfidence {
				guessTag = detection.Language.String()
			}
		}
	}

	fmt.Fprint(w, guessTag)
}

func (a *API) getSuppoortedLanguagesMatcher() (matcher language.Matcher) {
	var tags []language.Tag

	for langTagString := range a.Config.SupportedLanguages {
		tags = append(tags, language.Raw.Make(langTagString))
	}
	matcher = language.NewMatcher(tags)

	return
}
