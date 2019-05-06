package publicapi

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/frahman5/danso-backend/main-server/services/config"
	"github.com/frahman5/danso-backend/main-server/services/form"
	_ "github.com/lib/pq" // to allow initialization of database
)

// API is a struct that holds all the other structs necessary to handle API requests.
// It is also the type that holds handlers and helpers to handle API requests.
type API struct {
	// Config is a type that holds all the configurations for the app
	Config config.Config
}

// HandleTranslate is the request handler for /translate. It translates the given text,
// detecting the input language if needed, and returns the appropriate result
func (a *API) HandleTranslate(w http.ResponseWriter, r *http.Request) {
	var payload form.SubmissionPayload
	var err error

	// Unmarshal the JSON payload
	if err = json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), 400)
		log.Println(err.Error())
		return
	}
}

// HealthCheckHandler is the handler for /_ah/health. It signals that the server is responding to requests.
func (a *API) HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "ok")
}
