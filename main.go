/*Package main initalizes the application services and sets up the serveMux that handles http requests. */
package main

import (
	"context"
	"log"
	"net/http"

	"cloud.google.com/go/translate"
	"github.com/frahman5/googletranslateclonebackend/services/config"
	"github.com/frahman5/googletranslateclonebackend/services/publicapi"
	"github.com/frahman5/googletranslateclonebackend/services/utils"
	"google.golang.org/appengine"
)

// Services
var cfg config.Config
var api publicapi.API

func main() {
	var (
		ctx      context.Context
		client   *translate.Client
		buildDir string
		err      error
	)

	// Create COnfig
	if cfg, err = config.NewConfig(); err != nil {
		log.Fatalf("Failed to create config: %v", err)
	}

	// Create google translate client
	ctx = context.Background()
	if client, err = translate.NewClient(ctx); err != nil {
		log.Fatalf("Failed to create client: %v", err)
	} // We don't do a defer client.Close() because the client should never close! :)

	// Create the API object
	api = publicapi.API{Config: cfg, TranslationClient: client, Context: ctx}

	// List supported languages
	if err = utils.ListSupportedLanguages("en"); err != nil {
		log.Fatalf("Failed to get supported languages: %v", err)
	}

	// Set up ServeMux
	if buildDir, err = utils.GetAbsoluteFilepath("/build"); err != nil {
		log.Fatal(err)
	}
	http.HandleFunc("/api/v1/translate", api.HandleTranslate)
	http.HandleFunc("/api/v1/detectlanguage", api.HandleDetectLanguage)
	http.HandleFunc("/_ah/health", api.HealthCheckHandler)
	http.Handle("/", http.FileServer(http.Dir(buildDir)))

	// Load her up for app engine
	appengine.Main()

	// Load her up for dev
	// log.Print("Listening on port 8080")
	// log.Fatal(http.ListenAndServe(":8080", nil))
}
