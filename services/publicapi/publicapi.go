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
		target       language.Tag
		payload      TranslatePayload
		translations []translate.Translation
		err          error
	)

	// Unmarshal the JSON payload
	if err = json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), 400)
		log.Println(err.Error())
		return
	}

	// Sets the target language.
	if target, err = language.Parse("ru"); err != nil {
		http.Error(w, err.Error(), 400)
		log.Printf("Failed to parse target language: %v", err)
		return
	}

	// Translates the text into Russian.
	if translations, err = a.TranslationClient.Translate(a.Context, []string{payload.InputText}, target, nil); err != nil {
		http.Error(w, err.Error(), 400)
		log.Printf("Failed to translate text: %v", err)
		return
	}

	fmt.Printf("Just sent response with translation text: %v\n", translations[0].Text)
	fmt.Fprint(w, translations[0].Text)
	fmt.Fprint(w, "hi")
}

// HealthCheckHandler is the handler for /_ah/health. It signals that the server is responding to requests.
func (a *API) HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")
}
