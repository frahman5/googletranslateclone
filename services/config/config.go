// package config

// import (
// 	"encoding/json"
// 	"errors"
// 	"os"

// 	"github.com/frahman5/danso-backend/main-server/services/files"
// )

// // Config holds all the configurations for the entire app.
// type Config struct {
// 	// DB is a struct that holds all the configs for connecting to the database
// 	DB DBConfig `json:"DB"`

// }

// // NewConfig creates a Config struct and returns a pointer to it, along with an error
// // Either the Config or the error will always be nil/empty, but not both
// // dev is true if the runtime is development, false otherwise
// // staging is true if the runtime is staging, false otherwise.
// // production is true if the runtime is production, false otherwise.
// // Only one of dev, staging and production should ever be true.
// func NewConfig(dev, staging, production bool) (cfg Config, err error) {
// 	var (
// 		fp, SSLRootCertAbsFP, SSLCertAbsFP, SSLKeyAbsFP    string
// 		PythonRootDirectoryAbsFP, PythonExeAbsFP           string
// 		PythonMUACScriptAbsFP, PythonHeadCircumScriptAbsFP string
// 		PythonHeightScriptAbsFP                            string
// 		f                                                  *os.File
// 	)

// 	// Open the config file
// 	if fp, err = getConfigFilepath(dev, staging, production); err != nil {
// 		return
// 	}
// 	if f, err = os.Open(fp); err != nil {
// 		return
// 	}
// 	defer f.Close()

// 	// Read it into the Config struct
// 	if err = json.NewDecoder(f).Decode(&cfg); err != nil {
// 		return
// 	}

// 	// Convert SSL relative filepaths to absolute filepaths
// 	if SSLRootCertAbsFP, err = files.GetAbsoluteFilepath(cfg.DB.SSLRootCert); err != nil {
// 		return
// 	}
// 	if SSLCertAbsFP, err = files.GetAbsoluteFilepath(cfg.DB.SSLCert); err != nil {
// 		return
// 	}
// 	if SSLKeyAbsFP, err = files.GetAbsoluteFilepath(cfg.DB.SSLKey); err != nil {
// 		return
// 	}
// 	cfg.DB.SSLRootCert = SSLRootCertAbsFP
// 	cfg.DB.SSLCert = SSLCertAbsFP
// 	cfg.DB.SSLKey = SSLKeyAbsFP

// 	// Convert Python relative filepaths to absolute filepaths
// 	if PythonRootDirectoryAbsFP, err = files.GetAbsoluteFilepath(cfg.Python.RootDirPath); err != nil {
// 		return
// 	}
// 	if PythonExeAbsFP, err = files.GetAbsoluteFilepath(cfg.Python.EXEFilepath); err != nil {
// 		return
// 	}
// 	if PythonMUACScriptAbsFP, err = files.GetAbsoluteFilepath(cfg.Python.MUACScriptFilepath); err != nil {
// 		return
// 	}
// 	if PythonHeadCircumScriptAbsFP, err = files.GetAbsoluteFilepath(cfg.Python.HeadCircumferenceScriptFilepath); err != nil {
// 		return
// 	}
// 	if PythonHeightScriptAbsFP, err = files.GetAbsoluteFilepath(cfg.Python.HeightScriptFilepath); err != nil {
// 		return
// 	}
// 	cfg.Python.RootDirPath = PythonRootDirectoryAbsFP
// 	cfg.Python.EXEFilepath = PythonExeAbsFP
// 	cfg.Python.MUACScriptFilepath = PythonMUACScriptAbsFP
// 	cfg.Python.HeadCircumferenceScriptFilepath = PythonHeadCircumScriptAbsFP
// 	cfg.Python.HeightScriptFilepath = PythonHeightScriptAbsFP

// 	return
// }

// func getConfigFilepath(dev, staging, production bool) (fp string, err error) {
// 	var relFilepath string

// 	// Make sure only one of the flags is set to true
// 	if err = checkEnvFlags(dev, staging, production); err != nil {
// 		return
// 	}

// 	// Get the filepath
// 	if dev {
// 		relFilepath = "/config/dev.json"
// 	} else if staging {
// 		relFilepath = "/config/staging.json"
// 	} else if production {
// 		relFilepath = "/config/production.json"
// 	} else {
// 		err = errors.New("at least one environment flag must be set to true. All of dev, staging, and production are false")
// 	}
// 	if fp, err = files.GetAbsoluteFilepath(relFilepath); err != nil {
// 		return
// 	}

// 	return

// }

// // checkEnvFlags checks to make sure that only one of either the dev, staging,
// // or production environment flags is set to true.
// func checkEnvFlags(dev, staging, production bool) (err error) {
// 	i := 0
// 	if dev {
// 		i = i + 1
// 	}
// 	if staging {
// 		i = i + 1
// 	}
// 	if production {
// 		i = i + 1
// 	}
// 	if i != 1 {
// 		err = errors.New("only one of dev, staging, and production should be set to true")
// 	}

// 	return
// }
