package config

import (
	"encoding/json"
	"os"

	"github.com/frahman5/googletranslateclone/services/utils"
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
func NewConfig() (cfg Config, err error) {
	var (
		f  *os.File
		fp string
	)

	// Open the config file
	if fp, err = getConfigFilepath(); err != nil {
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

func getConfigFilepath() (fp string, err error) {
	var relFilepath = "/config/config.json"
	if fp, err = utils.GetAbsoluteFilepath(relFilepath); err != nil {
		return
	}

	return

}
