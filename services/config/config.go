package config

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
)

// Config holds all the configurations for the entire app.
type Config struct {

	// SupportedLanguages is a map that holds language tags and human-readable names of every language
	// the application supports.
	SupportedLanguages map[string]string `json:"supportedLanguages"`

	// "HI" For some reason, if this isn't here, Config doesn't get read in properly...

}

// NewConfig creates a Config struct and returns a pointer to it, along with an error
// Either the Config or the error will always be nil/empty, but not both
// dev is true if the runtime is development, false otherwise
// staging is true if the runtime is staging, false otherwise.
// production is true if the runtime is production, false otherwise.
// Only one of dev, staging and production should ever be true.
func NewConfig(dev, staging, production bool) (cfg Config, err error) {
	var (
		f  *os.File
		fp string
	)

	// Open the config file
	if fp, err = getConfigFilepath(dev, staging, production); err != nil {
		return
	}
	if f, err = os.Open(fp); err != nil {
		return
	}
	defer f.Close()

	// Read it into the Config struct
	if err = json.NewDecoder(f).Decode(&cfg); err != nil {
		return
	}

	return
}

func getConfigFilepath(dev, staging, production bool) (fp string, err error) {
	var relFilepath string

	// Make sure only one of the flags is set to true
	if err = checkEnvFlags(dev, staging, production); err != nil {
		return
	}

	// Get the filepath
	if dev {
		relFilepath = "/config/dev.json"
	} else if staging {
		relFilepath = "/config/staging.json"
	} else if production {
		relFilepath = "/config/production.json"
	} else {
		err = errors.New("at least one environment flag must be set to true. All of dev, staging, and production are false")
	}
	if fp, err = getAbsoluteFilepath(relFilepath); err != nil {
		return
	}

	return

}

// // checkEnvFlags checks to make sure that only one of either the dev, staging,
// // or production environment flags is set to true.
func checkEnvFlags(dev, staging, production bool) (err error) {
	i := 0
	if dev {
		i = i + 1
	}
	if staging {
		i = i + 1
	}
	if production {
		i = i + 1
	}
	if i != 1 {
		err = errors.New("only one of dev, staging, and production should be set to true")
	}

	return
}

// GetAbsoluteFilepath returns the absolute filepath of an asset given its filepath relative
// to eitherthe applications root directory
func getAbsoluteFilepath(relativeFilepath string) (absoluteFilepath string, err error) {
	var cwd, maindir string

	if cwd, err = os.Getwd(); err != nil {
		return
	}
	maindir = strings.SplitAfter(cwd, "googletranslateclonebackend")[0]

	absoluteFilepath = filepath.Join(maindir, relativeFilepath)

	return
}
