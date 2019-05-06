package publicapi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"cloud.google.com/go/translate"
	_ "github.com/lib/pq" // to allow initialization of database
	"golang.org/x/text/language"
)

type TranslatePayload struct {
	InputText            string `json:"inputText"`
	InputLanguage        string `json:"inputLanguage"`
	OutputLanguage       string `json:"outputLanguage"`
	ShouldDetectLanguage bool   `json:"shouldDetectLanguage"`
}

// API is a struct that holds all the other structs necessary to handle API requests.
type API struct {
	// Config is a type that holds all the configurations for the app
	// Config config.Config

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
		payload             TranslatePayload
		translations        []translate.Translation
		err                 error
	)

	// Unmarshal the JSON payload
	if err = json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), 400)
		log.Println(err.Error())
		return
	}

	tags := []language.Tag{
		language.English,
		language.Albanian,
		language.Spanish,
		language.Azerbaijani,
		language.Russian,
		language.BritishEnglish,
		language.French,
		language.Afrikaans,
		language.BrazilianPortuguese,
		language.EuropeanPortuguese,
		language.Croatian,
		language.SimplifiedChinese,
		language.Raw.Make("iw-IL"),
		language.Raw.Make("iw"),
		language.Raw.Make("he"),
	}
	m := language.NewMatcher(tags)

	// Get the input language
	inputTag, _ = language.MatchStrings(m, payload.InputLanguage)
	fmt.Println(inputTag)

	// Get the target language.
	targetTag, _ = language.MatchStrings(m, payload.OutputLanguage)
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

	fmt.Printf("Just sent response with translation text: %v\n", translations[0].Text)
	fmt.Fprint(w, translations[0].Text)
	fmt.Fprint(w, "hi")
}

// HealthCheckHandler is the handler for /_ah/health. It signals that the server is responding to requests.
func (a *API) HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")
}
