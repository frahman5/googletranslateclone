/*Package main initalizes the application services and sets up the serveMux that handles http requests. */
package main

import (
	"context"
	"flag"
	"log"
	"net/http"

	"cloud.google.com/go/translate"
	"github.com/frahman5/googletranslateclonebackend/services/publicapi"
	"github.com/frahman5/googletranslateclonebackend/services/utils"
)

// Services
var api publicapi.API

func main() {
	var (
		dev, staging, production bool
		ctx                      context.Context
		client                   *translate.Client
		err                      error
	)

	// Determine the environment
	flag.BoolVar(&dev, "dev", true, "Use -dev to tell the program to run on the dev environment."+
		"Default value is true. i.e program runs on dev by default")
	flag.BoolVar(&staging, "staging", false, "Use -staging to tell the program to run on the staging environment."+
		"Default value is false. program runs on dev by default")
	flag.BoolVar(&production, "production", false, "Use -production to tell the program to run on the production environment."+
		"Default value is false. Program runs on dev by default")
	flag.Parse()
	if production || staging {
		dev = false
	}

	// Create google translate client
	ctx = context.Background()
	if client, err = translate.NewClient(ctx); err != nil {
		log.Fatalf("Failed to create client: %v", err)
	} // We don't do a defer client.Close() because the client should never close! :)

	// Create the API object
	api = publicapi.API{TranslationClient: client, Context: ctx}

	// List supported languages
	if err = utils.ListSupportedLanguages("en"); err != nil {
		log.Fatalf("Failed to get supported languages: %v", err)
	}

	// Set up ServeMux
	http.HandleFunc("/translate", api.HandleTranslate)
	http.HandleFunc("/", api.HealthCheckHandler)
	// appengine.Main()
	if dev {
		log.Print("Listening on port 8080")
		log.Fatal(http.ListenAndServe(":8080", nil))
	}
	if staging {
		log.Print("Listening on port 443, http")
		log.Fatal(http.ListenAndServe(":443", nil))
	}
}
