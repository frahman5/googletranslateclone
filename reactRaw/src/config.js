// detectLanguageHeaderBarHTML is the HTML that we use in the translation container header. 
// It includes the unicode string for a non-breaking space. We define this so it can be used consistently
// across the app, especially in cases of equality checks.
const detectLanguageHeaderBarHTML = "Detect\u00A0Languages";

// detectLanguageDropdownMenuHTML is the HTML that we use for Detect language in the select language dropdown 
// menu. We define this so it can be used consistently across the app, especially in cases of equality checks.
const detectLanguageDropdownMenuHTML = "Detect language"

// Languages holds the tags (e.g "en") and human-readable forms (e.g "English") of all supported languages.
const Languages = {
            "af":"Afrikaans",
            "sq":"Albanian",
            "am":"Amharic",
            "ar":"Arabic",
            "hy":"Armenian",
            "az":"Azerbaijani",
            "bn":"Bengali",
            "bg":"Bulgarian",
            "ca":"Catalan",
            "zh":"Chinese",
            "hr":"Croatian",
            "cs":"Czech",
            "da":"Danish",
            "nl":"Dutch",
            "en":"English",
            "et":"Estonian",
            "fil":"Filipino",
            "fi":"Finnish",
            "fr":"French",
            "ka":"Georgian",
            "de":"German",
            "el":"Greek",
            "gu":"Gujarati",
            "he":"Hebrew",
            "hi":"Hindi",
            "hu":"Hungarian",
            "is":"Icelandic",
            "id":"Indonesian",
            "it":"Italian",
            "ja":"Japanese",
            "kn":"Kannada",
            "kk":"Kazakh",
            "km":"Khmer",
            "ko":"Korean",
            "ky":"Kyrgyz",
            "lo":"Lao",
            "lv":"Latvian",
            "lt":"Lithuanian",
            "mk":"Macedonian",
            "ms":"Malay",
            "ml":"Malayalam",
            "mr":"Marathi",
            "mn":"Mongolian",
            "my":"Myanmar(Burmese)",
            "ne":"Nepali",
            "no":"Norwegian",
            "fa":"Persian",
            "pl":"Polish",
            "pt":"Portuguese",
            "pa":"Punjabi",
            "ro":"Romanian",
            "ru":"Russian",
            "sr":"Serbian",
            "si":"Sinhala",
            "sk":"Slovak",
            "sl":"Slovenian",
            "es":"Spanish",
            "sw":"Swahili",
            "sv":"Swedish",
            "ta":"Tamil",
            "te":"Telugu",
            "th":"Thai",
            "tr":"Turkish",
            "uk":"Ukrainian",
            "uz":"Uzbek",
            "vi":"Vietnamese",
            "zu":"Zulu"
}

// Export it as a ES6 module
const Config = {
    detectLanguageDropdownMenuHTML, 
    detectLanguageHeaderBarHTML, 
    Languages
}
export default Config;