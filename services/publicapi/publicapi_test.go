package publicapi

import (
	"context"
	"fmt"
	"log"
	"testing"

	"cloud.google.com/go/translate"
	"github.com/frahman5/googletranslateclone/services/config"
	"golang.org/x/text/language"
)

var cfg config.Config
var api API

func init() {
	var (
		ctx    context.Context
		client *translate.Client
	)
	var err error

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
	api = API{Config: cfg, TranslationClient: client, Context: ctx}
}

func TestGetSupportedLanguagesMatcher(t *testing.T) {
	var (
		matcher             language.Matcher
		inputTagString      string
		inputTag, outputTag language.Tag
		confidence          language.Confidence
	)
	matcher = api.getSuppoortedLanguagesMatcher()

	for inputTagString = range cfg.SupportedLanguages {
		fmt.Printf("Processing tag: %s\n", inputTagString)
		inputTag = language.Make(inputTagString)
		outputTag, _, confidence = matcher.Match(inputTag)
		if inputTag != outputTag {
			t.Errorf("outputTag does not match inputTag. inputTag -- %v. outputTag -- %v\n", inputTag, outputTag)
		}
		if confidence != language.Exact {
			t.Errorf("Confidence should be Exact. Actual confidence -- %v\n", confidence)
		}
	}
}
