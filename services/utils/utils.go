package utils

import (
	"context"
	"fmt"

	"cloud.google.com/go/translate"
	"golang.org/x/text/language"
)

// ListSupportedLanguages gets all the supported languages from GOOGLE, NOT specific to this app.
func ListSupportedLanguages(targetLanguage string) (err error) {
	var (
		ctx    context.Context
		lang   language.Tag
		client *translate.Client
		langs  []translate.Language
	)
	ctx = context.Background()

	if lang, err = language.Parse(targetLanguage); err != nil {
		return
	}

	if client, err = translate.NewClient(ctx); err != nil {
		return
	}
	defer client.Close()

	if langs, err = client.SupportedLanguages(ctx, lang); err != nil {
		return
	}

	for _, lang := range langs {
		fmt.Printf("%q: %s\n", lang.Tag, lang.Name)
	}

	return nil
}
