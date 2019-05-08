import React, { Component } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import Flux from './flux.js'
import Utils from './utils.js'
import Client from './client.js'
import Config from './config.js'
import './assets/css/app-720minus.css'
import './assets/css/app-720plus.css'

/* Define the view */
class App extends Component {
	constructor(props) {
		super(props)

		// Initalize state
		let initialState = Flux.store.getState()
		this.state = {'sourceText' : initialState.sourceText, 'width' : window.innerWidth}

		// Bind this
		this.handleStateUpdate = this.handleStateUpdate.bind(this)
		this.updateDimensions = this.updateDimensions.bind(this)
	}

	updateDimensions() {
		let oldWidth = this.state.width
		this.setState({
			'width': window.innerWidth
		})

		// If we move between mobile and laptop views, force update to make sure that the input and output boxes are sized appropriately. 
		if ((this.state.width > 720) && (oldWidth < 720)) {
			this.forceUpdate()
		}
		if ((this.state.width < 720) && (oldWidth > 720)) {
			this.forceUpdate()
		}

		// If sourceText is not empty and the window width changes, force update to make sure boxes are resized appropriately. 
		if ((this.state.sourceText.length !== 0) && (oldWidth != this.state.width)) {
			var maxHeight;
			let inputScrollHeight = document.getElementById("@sourceText").scrollHeight
			let outputTextElem = document.getElementById("@targetText")
			if (outputTextElem === null) {
				maxHeight = inputScrollHeight
			}
			maxHeight = Math.max(inputScrollHeight, outputTextElem.scrollHeight)
			Flux.store.dispatch(Flux.createNewSourceScrollHeightAction(maxHeight))
			console.log("Force updating")
			this.forceUpdate()
		}
	}

	componentWillMounth() {
		this.updateDimensions()
	}

	componentDidMount() {
		Flux.store.subscribe(this.handleStateUpdate)

		// Add a listener for window size changing, so we can re-render the app if they move between mobile and 
		// 720px+ views
		window.addEventListener("resize", this.updateDimensions);
	}

	handleStateUpdate() {
		let newState = Flux.store.getState()
		this.setState((state, props) => {
			return {'sourceText' : newState.sourceText}
		})
	}

  render() {
		let shouldDisplayError = (this.state.sourceText.length >= 5000)
    return (
      <div className="page">
            <Header />
            <TranslationContainer />
            <Background />
            <ErrorBar display={shouldDisplayError} ErrorMessage="Character limit: 5000"/>
        </div>
      );
  }
}

// Holds all the components of the Translation Module
class TranslationContainer extends Component {
  constructor(props) {
    super(props);

    // Set up initial state
    let initialState = Flux.store.getState();
    this.state = {
      'displaySelectLanguageDropdown': initialState.selectBoxOpen,
      'sourceLanguages': initialState.sourceLanguages,
      'targetLanguages': initialState.targetLanguages,
      'selectBoxOpen': initialState.selectBoxOpen,
      'sourceText' : initialState.sourceText,
			'searchText': initialState.searchText,
			'targetText' : initialState.targetText,
			'sourceScrollHeight' : initialState.sourceScrollHeight
    };

    // Bind methods to this
    this.handleStateUpdate = this.handleStateUpdate.bind(this);
		this.handleNewInput = this.handleNewInput.bind(this);
		this.getContainerHeight = this.getContainerHeight.bind(this);
		this.getInputBoxHeight = this.getInputBoxHeight.bind(this);
		this.getOutputBuxHeight = this.getOutputBoxHeight.bind(this);
  }

  componentDidMount() {
    Flux.store.subscribe(this.handleStateUpdate);
  }

  handleStateUpdate() {
    this.setState((state, props) => {
			let newState = Flux.store.getState();
			console.log("New scroll height: ", this.state.sourceScrollHeight);
      return {
        'displaySelectLanguageDropdown': newState.selectBoxOpen,
        'sourceLanguages': newState.sourceLanguages,
        'targetLanguages': newState.targetLanguages,
        'selectBoxOpen': newState.selectBoxOpen,
        'sourceText' : newState.sourceText,
				'searchText': newState.searchText,
				'sourceScrollHeight' : newState.sourceScrollHeight,
				'targetText' : newState.targetText
      };

    })

  }

  handleNewInput(evt) {
		// Create new source text action
    Flux.store.dispatch(Flux.createNewSourceTextAction(
      evt.target.value,
      Utils.getActiveLanguage(this.state.sourceLanguages),
			Utils.getActiveLanguage(this.state.targetLanguages)));
			
		// Ask the store to update the scroll height
		let textareaElem = document.getElementById("@sourceText");
		let outputElem = document.getElementById("@targetText");
		let maxHeight = Math.max(outputElem.scrollHeight, textareaElem.scrollHeight);
		Flux.store.dispatch(Flux.createNewSourceScrollHeightAction(maxHeight));

  }

	// Container height must respond to height of text area. Formula is based on original height ratios 
	// when text area is empty
	getContainerHeight() {
		if (window.innerWidth > 720) {
			 return this.state.sourceScrollHeight + 120
		}
		return 182
	}

	// InputBox height must respond to height of text area. Formula is based on original height ratios 
	// when text area is empty
	getInputBoxHeight() {
		if (window.innerWidth > 720) {
			return this.state.sourceScrollHeight + 72
		}
		return 134
	}

	// Outputbox height must respond to height of text area. Formula is based on original height ratios 
	// when text area is empty
	getOutputBoxHeight() {
		if (window.innerWidth > 720) {
			return this.state.sourceScrollHeight + 72
		}	else {
			let targetText = document.getElementById("@targetText")
			if (targetText === null) {
				return 0
			}
			return targetText.scrollHeight + 72
		}
	}

  render() {
    // If the language selection dropdown menu is open, kill the box shadow on the translation container. 
    // Since the language selection dropdown menu has its own box shadow, it gets to be too much. To make up for
    // the lost box-shadow over the header, add a box shadow there
    let translationContainerConditionalCSS = ((this.state.selectBoxOpen !== "") ? "killBoxShadow" : "")
    let translationHeaderConditionalCSS = ((this.state.selectBoxOpen !== "") ? "addTranslationHeaderBoxShadow" : "")
    let conditionalCSSBasedOnSearchText = ((this.state.searchText !== "") ? "translationHeaderDontDisplayAsFunctionOfSearchText" : "")
    let shouldShrinkText = ((this.state.sourceText.length > 100) || (this.state.targetText > 100))
    return (
      <div style={{height: this.getContainerHeight() + "px"}} className={"translationContainer " + translationContainerConditionalCSS}>
				<TranslationHeader conditionalCSS={translationHeaderConditionalCSS + " " + conditionalCSSBasedOnSearchText}/>
				<TranslationInputBox height={this.getInputBoxHeight()} onInput={this.handleNewInput} shouldShrink={shouldShrinkText} inputLength={this.state.sourceText.length}/>
				<TranslationOutputBox height={this.getOutputBoxHeight()} shouldShrink={shouldShrinkText}/>
				<TranslationSelectLanguageDropdownContainer display={this.state.displaySelectLanguageDropdown}/>
			</div>
      );
  }
}

// TranslationHeader is the header bar above the main translation widget. 
class TranslationHeader extends Component {
  constructor(props) {
    super(props);

    // Set initial State
    let initialState = Flux.store.getState();
    this.state = {
      'sourceLanguages': initialState.sourceLanguages,
      'targetLanguages': initialState.targetLanguages,
      'selectBoxOpen': initialState.selectBoxOpen,
      "sourceText": initialState.sourceText,
      "sourceLanguageDetection": initialState.sourceLanguageDetection,
      "languageTagMap": Utils.getLanguageTagToLanguageMap(),
      'switchButtonActive': Utils.isSwitchButtonActive(
        initialState.sourceLanguages,
        initialState.targetLanguages)
    };

    // Bind methods to this
    this.handleStateUpdate = this.handleStateUpdate.bind(this);
    this.handleSwitchClick = this.handleSwitchClick.bind(this);
    this.handleLanguageSelectionClick = this.handleLanguageSelectionClick.bind(this);

    console.log("Language tag map in translationHeader: ", this.state.languageTagMap)
  }

  componentDidMount() {
    Flux.store.subscribe(this.handleStateUpdate);
  }

  handleStateUpdate() {
    let newState = Flux.store.getState();
    this.setState((state, props) => {
      return {
        'sourceLanguages': newState.sourceLanguages,
        'targetLanguages': newState.targetLanguages,
        'selectBoxOpen': newState.selectBoxOpen,
        "sourceText": newState.sourceText,
        "sourceLanguageDetection": newState.sourceLanguageDetection,
        'switchButtonActive': Utils.isSwitchButtonActive(
          newState.sourceLanguages,
          newState.targetLanguages)
      }
    });
  }

  handleSwitchClick() {
      let newActiveSourceLanguage = Utils.getActiveLanguage(this.state.targetLanguages);
      let newActiveTargetLanguage = Utils.getActiveLanguage(this.state.sourceLanguages)
    if (this.state.switchButtonActive) {
      Flux.store.dispatch(Flux.createSwitchSourceTargetAction(
        newActiveSourceLanguage,newActiveTargetLanguage));
    }

    // Refresh the translation
    Client.getTranslation(this.state.sourceText, newActiveSourceLanguage, newActiveTargetLanguage, false)
  }

  // str str -> None
  // sourceOrTarget: one of "source" or "target"
  // selected language: e.g "French"
  handleLanguageSelectionClick(sourceOrTarget, selectedLanguage) {
    let activeSourceLanguage = Utils.getActiveLanguage(this.state.sourceLanguages);
    let activeTargetLanguage = Utils.getActiveLanguage(this.state.targetLanguages)

    // If the user selects a new source language that matches the current active target language, 
    // or the user selects a new target language that maches the current active source language, 
    // do a swap
    if ((sourceOrTarget === "source") && (selectedLanguage === activeTargetLanguage) && (activeSourceLanguage !== Config.detectLanguageHeaderBarHTML)) {
      Flux.store.dispatch(Flux.createSwitchSourceTargetAction(activeTargetLanguage, activeSourceLanguage));
    } else if ((sourceOrTarget === "target") && (selectedLanguage === activeSourceLanguage)) {
      Flux.store.dispatch(Flux.createSwitchSourceTargetAction(activeTargetLanguage, activeSourceLanguage));
    } else {
      Flux.store.dispatch(Flux.createSelectLanguageAction(sourceOrTarget, selectedLanguage, this.state.sourceText));
    }

    // If there is a translation open and the user selected a new target language, refresh the translation
    if ((this.state.sourceText !== "") && (sourceOrTarget === "target")) {
      let sourceLang = Utils.getActiveLanguage(this.state.sourceLanguages);
      let targetLang = Utils.getActiveLanguage(this.state.targetLanguages);
      if (sourceLang === Config.detectLanguageHeaderBarHTML) {
        Client.getTranslation(this.state.sourceText, sourceLang, targetLang, true);
      } else {
        Client.getTranslation(this.state.sourceText, sourceLang, targetLang, false);
      }
    }

    // If the select box was open, then close it
    if (this.state.selectBoxOpen !== "") {
      Flux.store.dispatch(Flux.createCloseSelectLanguageDropdownAction());
    }
  }

  render() {
    return (
      <div className={"translationHeader " + this.props.conditionalCSS}>
			<div className="translationHeader--input">
				<div className="translationHeader--input--languages">
                    {this.state.sourceLanguages.map((value) => {
                        let trueLanguage = value.language
                        if (value.language === Config.detectLanguageHeaderBarHTML) {
                            if ((this.state.sourceLanguageDetection !== "") && (this.state.sourceLanguageDetection !== "und")) {
                                trueLanguage = this.state.languageTagMap.get(this.state.sourceLanguageDetection) + "\u00A0-\u00A0Detected"
                            }
                        }
                        return <TranslationHeaderOptionButton
                        selected={value.selected}
                        text={trueLanguage}
                        sourceOrTarget="source"
                        onClick={this.handleLanguageSelectionClick}/>})}
                    <FadeBox />
                </div>
                <MenuButton flipped={(this.state.selectBoxOpen !== "")} sourceOrTarget="source"/>
            </div>
            <SwitchButton active={this.state.switchButtonActive} onClick={this.handleSwitchClick}/>
            <div className="translationHeader--output">
                <div className="translationHeader--output--languages">
                    {this.state.targetLanguages.map((value) => {
                        return <TranslationHeaderOptionButton
                        selected={value.selected}
                        text={value.language}
                        sourceOrTarget="target"
                        onClick={this.handleLanguageSelectionClick}/>})}
                    <FadeBox />
                </div>
                <MenuButton flipped={(this.state.selectBoxOpen !== "")} sourceOrTarget="target"/>
            </div>
        </div>
      );
  }
}

// TranslationSelectLanguageDropDownContainer renders the language selection container 
// that drops down to show additional supported languages.
// TODO: Simplify this. It's so complicated!
class TranslationSelectLanguageDropdownContainer extends Component {
  constructor(props) {
    super(props);

    // Set up initial state
    let initialState = Flux.store.getState();
    this.state = {
      'sourceLanguages': initialState.sourceLanguages,
      'targetLanguages': initialState.targetLanguages,
      'recentLanguages': initialState.recentLanguages,
      'languages': initialState.languages,
      'selectBoxOpen': initialState.selectBoxOpen,
      'searchText': initialState.searchText,
      'sourceText': initialState.sourceText
    };

    // Bind methods to 'this'
    this.handleStateUpdate = this.handleStateUpdate.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    Flux.store.subscribe(this.handleStateUpdate);
  }

  handleStateUpdate() {
    let newState = Flux.store.getState();
    this.setState((state, props) => {
      return {
        'sourceLanguages': newState.sourceLanguages,
        'targetLanguages': newState.targetLanguages,
        'recentLanguages': newState.recentLanguages,
        'languages': newState.languages,
        'selectBoxOpen': newState.selectBoxOpen,
        'searchText': newState.searchText,
        'sourceText': newState.sourceText
      };
    });
  }

  handleClick(evt) {
    // Was it a selection for source or target?
    let sourceOrTarget = "source";
    if (this.state.selectBoxOpen === "target") {
      sourceOrTarget = "target";
    }
    if (this.state.selectBoxOpen === "") {
      // throw error. This shouldn't happen
    }
    let newSelection = evt.target.innerHTML.replace("<b>", "").replace("</b>", "")

    // select the language and close the dropdown
    Flux.store.dispatch(Flux.createSelectLanguageAction(sourceOrTarget, newSelection, this.state.sourceText));
    Flux.store.dispatch(Flux.createCloseSelectLanguageDropdownAction());

    // Send off new source text, since changing the language is practically changing source text
    if (sourceOrTarget === "source") {
      Flux.store.dispatch(Flux.createNewSourceTextAction(this.state.sourceText, newSelection, Utils.getActiveLanguage(this.state.targetLanguages)))
    } else if (sourceOrTarget === "target") {
      Flux.store.dispatch(Flux.createNewSourceTextAction(this.state.sourceText, Utils.getActiveLanguage(this.state.sourceLanguages), newSelection))
    } else {
      // TODO: throw error. Shouldn't happen
    }

  }

  render() {
    // Prepare information about languages
    var activeSourceLanguage = Utils.getActiveLanguage(this.state.sourceLanguages);
    var activeTargetLanguage = Utils.getActiveLanguage(this.state.targetLanguages);

    // Prepare conditional CSS clases
    let conditionalCSSForTopMostContainer = ((this.props.display === "") ? "dontDisplay" : "");
    let conditionalCSSForRecentLanguages = ((this.state.recentLanguages.length === 0) ? "dontDisplay" : "");
    let conditionalCSSForDetectLanguageBox = ((this.props.display === "source") ? "" : "dontDisplay");
    let conditionalCSSForDetectLanguageH5 = getConditionalCSSForLanguageListItem(activeSourceLanguage, activeTargetLanguage, this.props.display, Config.detectLanguageDropdownMenuHTML);
    let conditionalCSSBasedOnSearchText = ((this.state.searchText !== "") ? "dontDisplay" : "")

    return (
      <div className={"TranslationSelectLanguageDropdownContainer " + conditionalCSSForTopMostContainer}>
				<SelectLanguageSearchBar/>
				<div className={"DetectLanguagesBox " + conditionalCSSForDetectLanguageBox + "" + conditionalCSSBasedOnSearchText}>
					<h5 onClick={this.handleClick} className={conditionalCSSForDetectLanguageH5}>Detect language</h5>
                    <img src="https://ssl.gstatic.com/images/icons/material/system/1x/auto_awesome_grey600_24dp.png"
      alt="Sparkle icon" />
				</div>
				<div className={"RecentLanguages " + conditionalCSSForRecentLanguages + " " + conditionalCSSBasedOnSearchText}>
					<h4 className={conditionalCSSBasedOnSearchText}>Recent languages</h4>
					<div className={"LanguageList " + conditionalCSSForRecentLanguages}>
						{this.state.recentLanguages.map((value) => {
        let conditionalCSSForLanguageListItem = getConditionalCSSForLanguageListItem(activeSourceLanguage, activeTargetLanguage, this.props.display, value)
        let recentLanguageConditionalCSS = ((this.state.recentLanguages.includes(value)) ? "recentLanguage" : "")
        return <LanguageListItem
          h5conditionalCSS={conditionalCSSForLanguageListItem + " " + recentLanguageConditionalCSS}
          onClick={this.handleClick}
          initialBoldingLength={this.state.searchText.length}
          value={value}/>
      })}
				
					</div>
				</div>
				<div className="AllLanguages">
					<h4 className={conditionalCSSBasedOnSearchText}>All languages</h4>
					<div className="LanguageList">
						{(this.props.display === "source" && this.state.languages.length === 67) ? <LanguageListItem
      h5conditionalCSS={"detectLanguageItem " +
      getConditionalCSSForLanguageListItem(
        activeSourceLanguage,
        activeTargetLanguage,
        this.props.display,
        Config.detectLanguageDropdownMenuHTML)}
      onClick={this.handleClick}
      initialBoldingLength={this.state.searchText.length}
      value={Config.detectLanguageDropdownMenuHTML}
      /> : <div/>}
						{this.state.languages.map((value) => {
        let conditionalCSSForLanguageListItem = getConditionalCSSForLanguageListItem(activeSourceLanguage, activeTargetLanguage, this.props.display, value)
        let recentLanguageConditionalCSS = ((this.state.recentLanguages.includes(value)) ? "recentLanguage" : "")
        return <LanguageListItem
          h5conditionalCSS={conditionalCSSForLanguageListItem + " " + recentLanguageConditionalCSS}
          onClick={this.handleClick}
          initialBoldingLength={this.state.searchText.length}
          value={value}
          />

      })}
					</div>
				</div>
			</div>
      );
  }
}

class SelectLanguageSearchBar extends Component {
  constructor(props) {
    super(props);

    // Set initialState
    let initialState = Flux.store.getState()
    this.state = {
      'searchText': initialState.searchText
    }

    // Bind methods to this
    this.handleStateUpdate = this.handleStateUpdate.bind(this)
  }

  componentDidMount() {
    Flux.store.subscribe(this.handleStateUpdate)
  }

  handleClick() {
    Flux.store.dispatch(Flux.createCloseSelectLanguageDropdownAction());
  }

  handleInput(evt) {
    Flux.store.dispatch(Flux.createNewSearchTextAction(evt.target.value));
  }

  handleStateUpdate() {
    let newState = Flux.store.getState();
    console.log("Value of newState in handleStateUpdate in searchbar", newState);
    this.setState((state, props) => {
      return {
        'searchText': newState.searchText
      }
    });
  }

  render() {
    return (
      <div className="SelectLanguageSearchBar">
				<div onClick={this.handleClick} className="backButton"></div>
                <input type="text" onInput={this.handleInput}
      placeholder="Search languages" className="languageSearchBar"
      value={(this.state.searchText !== "") ? this.state.searchText : ""} ></input>
			</div>
      );
  }

}

class TranslationInputBox extends Component {
  constructor(props) {
    super(props);

    // Set up initial state
    let initialState = Flux.store.getState();
    this.state = {
      'sourceText': initialState.sourceText,
      'selectBoxOpen': initialState.selectBoxOpen
    };

    // Bind methods to 'this'
    this.handleStateUpdate = this.handleStateUpdate.bind(this)
  }

  componentDidMount() {
    Flux.store.subscribe(this.handleStateUpdate);
  }

  handleStateUpdate() {
    let newState = Flux.store.getState();
    this.setState((state, props) => {
      return {
        'sourceText': newState.sourceText,
        'selectBoxOpen': newState.selectBoxOpen
      };
    })
	}
	
	// If we;re on mobile, text input box shouldn't auto resize. So use a normal textarea element. 
	// If we're at > 720px, use a auto resizing text area
	renderTextareaAsFunctionOfWindowSize() {
		let reduceFontIfLongInputCSS = (this.props.shouldShrink ? "smallFont" : "")
		if (window.innerWidth > 720) {
			return (< TextareaAutosize
									id="@sourceText"
									className={reduceFontIfLongInputCSS}
									onInput={this.props.onInput}
									value={this.state.sourceText}
									maxLength="5000"
									uniqueKey="fancytextarea"/>)
		}
		return  <textarea id="@sourceText"
										  className={reduceFontIfLongInputCSS}
										  onInput={this.props.onInput}
										  value={this.state.sourceText}
										  maxLength="5000"
											uniqueKey="normaltextarea">"
						</textarea>
	}

  render() {
    let dontDisplayIfSelectBoxOpen = ((this.state.selectBoxOpen !== "") ? "dontDisplay" : "")
		
		let redColorIfTooLongInputCSS = ((this.props.inputLength >= 5000) ? "charcountError" : "")
    return (
      <div style={{height: this.props.height + "px"}} className={dontDisplayIfSelectBoxOpen + " translationInputBox"}>
				<form className='translationInputTextArea'> 
					{this.renderTextareaAsFunctionOfWindowSize()}
				</form>
				<Widget className={redColorIfTooLongInputCSS + " charCount"} text={this.props.inputLength + "/5000"}/>
			</div>
      );
  }
}
class TranslationOutputBox extends Component {
  constructor(props) {
    super(props);

    // Set up initial state
    let initialState = Flux.store.getState();
    this.state = {
      'targetText': initialState.targetText
    };

    // Bind methods to 'this'
    this.handleStateUpdate = this.handleStateUpdate.bind(this)
  }

  componentDidMount() {
    Flux.store.subscribe(this.handleStateUpdate);
  }

  handleStateUpdate() {
    let newState = Flux.store.getState();
    this.setState((state, props) => {
      return {
        'targetText': newState.targetText
      };
    })
  }

  render() {
    let emptyOrFilledCSS = (this.state.targetText === "" ? "translationOutputBox--empty" : "translationOutputBox--filled");
    let reduceFontIfLongInputCSS = (this.props.shouldShrink ? "smallFont" : "")
    return (
      <div style={{height: this.props.height + "px"}} className={emptyOrFilledCSS + " " + reduceFontIfLongInputCSS}>
                <h1 id="@targetText" className={reduceFontIfLongInputCSS + " " + (this.state.targetText === "" ? "emptyTranslateBox" : "")}>
                    {(this.state.targetText === "" ? "Translation" : this.state.targetText)}
                </h1>
			</div>
      );
  }
}

class MenuButton extends Component {
  constructor(props) {
    super(props);

    // Bind methods to 'this'
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(evt) {
    Flux.store.dispatch(Flux.createToggleLanguageSelectionDropdownAction(this.props.sourceOrTarget));
  }

  render() {
    let conditionalCSS = (this.props.flipped ? "menuButton--flipped" : "")
    return (
      <div onClick={this.handleClick} className={"menuButton " + conditionalCSS}></div>
      );
  }
}

class TranslationHeaderOptionButton extends Component {
  constructor(props) {
    super(props);

    // Bind methods to 'this'
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(evt) {
    if (window.innerWidth < 720) { // TODO: Is this cross-browser compatible?
        console.log("Toggle selection dropdown action sent")
      Flux.store.dispatch(Flux.createToggleLanguageSelectionDropdownAction(this.props.sourceOrTarget));
    }
    this.props.onClick(this.props.sourceOrTarget, this.props.text);
  }

  render() {
    const selectCssClass = (this.props.selected ? "selectedLanguage" : "unselectedLanguage");
    const conditionalCSSIfItsDetectLanguage = ((this.props.text === Config.detectLanguageHeaderBarHTML) ? "firstHeaderLanguage" : "")
    return (
      <div onClick={this.handleClick}
      className={selectCssClass + " translationHeader--button " + conditionalCSSIfItsDetectLanguage}>
                <h3>{this.props.text}</h3>
            </div>
      );
  }
}

/********* Stateless Components ***********/
const LanguageListItem = props => {
  return (
    <div className="languagelistItemWrapper" >
			<h5 className={"languageListItem " + props.h5conditionalCSS}
    onClick={props.onClick}>
                <b>{props.value.substr(0, props.initialBoldingLength)}</b>{props.value.substr(props.initialBoldingLength, props.value.length)}
			</h5>
		</div>
    );
}

// Displays the background for the page
const Background = props => {
  return (
    <div>
            <div className="background-1"></div>
            <div className="background-2"></div>
        </div>
    );
}

// Handles the header bar at the top of the app 
const Header = props => {
  return (
    <header className="header">
        </header>
    );
}

// Fadebox is an invisible div that we use to create the allusion of languages "sliding away"
// in the translation header bar
const FadeBox = props => {
  return (
    <div className="fadeBox"></div>
    );
}

// SwitchButton is the button in the middle of the translation header that can be used to switch source and target languages
const SwitchButton = (props) => {
  return (
    <div className={props.active ? "switchButtonWrapperActive" : "switchButtonWrapperInactive"} >
            <div
    onClick={props.onClick}
    className={props.active ? 'switchButtonActive' : 'switchButtonInactive'}
    >
            </div>
        </div>
    );
}

const ErrorBar = (props) => {
		console.log("Value of display prop in ErrorBar: ", props.display)
    return (
        <footer className={!props.display? "dontDisplay" : ""}><p>{props.ErrorMessage}</p></footer>
    )
}

const Widget = (props) => {
	return (
		<div className={props.className}><p>{props.text}</p></div>
	)
}
// getConditionalCSSForLanguageListItem returns the conditional CSS for a languageListItem. 
// str str str str -> str
// e.g "English" "Russian" "source" "English" -> "selectCheck"
// activeSourceLanguage: any human-readable language among supported languages (see config/languages.js)
// activeTargetLanguage: any human-readable language among supported languages (see config/languages.js)
// selectBoxOpen: one of "source", "target" or ""
// language: any human-readable language among supported languages (see config/languages.js)
function getConditionalCSSForLanguageListItem(activeSourceLanguage, activeTargetLanguage, selectBoxOpen, language) {
  var conditionalCSS;

  switch (selectBoxOpen) {
    case "source":
      conditionalCSS = ((activeSourceLanguage === language) ? "selectCheck" : "");

      // Handle the special Detect Languages case
      if ((activeSourceLanguage === Config.detectLanguageHeaderBarHTML) && (language === Config.detectLanguageDropdownMenuHTML)) {
        conditionalCSS = "selectCheck";
      }
      break;
    case "target":
      conditionalCSS = ((activeTargetLanguage === language) ? "selectCheck" : "");
      break;
    case "":
      conditionalCSS = "";
      break;
    default:
  // throw error
  }

  return conditionalCSS;
}

export default App;


