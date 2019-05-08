package utils

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

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

// GetAbsoluteFilepath returns the absolute filepath of an asset given its filepath relative
// to eitherthe applications root directory
func GetAbsoluteFilepath(relativeFilepath string) (absoluteFilepath string, err error) {
	var cwd, maindir string

	if cwd, err = os.Getwd(); err != nil {
		return
	}
	maindir = strings.SplitAfter(cwd, "googletranslateclone")[0]

	absoluteFilepath = filepath.Join(maindir, relativeFilepath)

	return
}
