import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Phone, PhoneOff, Delete, Send, Volume2, Mic, Languages, LoaderCircle, Upload } from 'lucide-react'

const api = axios.create({ baseURL: '/api' })
const languageOptions = [
  { name: 'Tamil', locale: 'ta-IN' },
  { name: 'English', locale: 'en-IN' },
  { name: 'Hindi', locale: 'hi-IN' },
  { name: 'Telugu', locale: 'te-IN' },
  { name: 'Malayalam', locale: 'ml-IN' },
  { name: 'Kannada', locale: 'kn-IN' },
]

const copy = {
  English: {
    welcome: 'Welcome to TribalCare. Press a number to choose your language: 1 Tamil, 2 English, 3 Hindi, 4 Telugu, 5 Malayalam, 6 Kannada.',
    language: 'Language selected. Choose an option: 1 Emergency help, 2 Appointment details, 3 Pregnancy care, 4 Child healthcare and vaccination, 5 Contact your ASHA worker, 6 Nearby primary health centre, 0 Healthcare support.',
    menu: '1 Emergency help. 2 Appointment details. 3 Pregnancy care. 4 Child healthcare and vaccination. 5 Contact your ASHA worker. 6 Nearby primary health centre. 0 Healthcare support.',
    responses: ['Healthcare support callback requested.', 'Emergency help requested. Your care team has been alerted. This service does not dispatch an ambulance.', 'Appointment details are ready.', 'Pregnancy care information is ready.', 'Child healthcare and vaccination information is ready.', 'Your ASHA worker details are ready.', 'Nearby Primary Health Centre details are ready.'],
    error: 'We could not complete that request. Please try again or contact your local health centre.',
    noVoice: 'A matching English voice is not installed in this browser. Text instructions are still available.',
  },
  Tamil: {
    welcome: 'ட்ரைபல் கேர் வரவேற்கிறது. மொழியைத் தேர்ந்தெடுக்க எண்ணை அழுத்தவும்: 1 தமிழ், 2 ஆங்கிலம், 3 இந்தி, 4 தெலுங்கு, 5 மலையாளம், 6 கன்னடம்.',
    language: 'மொழி தேர்ந்தெடுக்கப்பட்டது. 1 அவசர உதவி, 2 சந்திப்பு விவரம், 3 கர்ப்பகால பராமரிப்பு, 4 குழந்தை நலம் மற்றும் தடுப்பூசி, 5 ஆஷா பணியாளர், 6 அருகிலுள்ள ஆரம்ப சுகாதார நிலையம், 0 சுகாதார ஆதரவு.',
    menu: '1 அவசர உதவி. 2 சந்திப்பு விவரம். 3 கர்ப்பகால பராமரிப்பு. 4 குழந்தை நலம் மற்றும் தடுப்பூசி. 5 ஆஷா பணியாளர். 6 அருகிலுள்ள ஆரம்ப சுகாதார நிலையம். 0 சுகாதார ஆதரவு.',
    responses: ['சுகாதார ஆதரவு திரும்ப அழைப்பு கோரப்பட்டது.', 'அவசர உதவி கோரிக்கை அனுப்பப்பட்டது. உங்கள் பராமரிப்பு குழுவுக்கு தெரிவிக்கப்பட்டது. ஆம்புலன்ஸ் அனுப்பப்படாது.', 'சந்திப்பு விவரம் தயார்.', 'கர்ப்பகால பராமரிப்பு தகவல் தயார்.', 'குழந்தை நலம் மற்றும் தடுப்பூசி தகவல் தயார்.', 'உங்கள் ஆஷா பணியாளர் விவரம் தயார்.', 'அருகிலுள்ள ஆரம்ப சுகாதார நிலைய விவரம் தயார்.'],
    error: 'கோரிக்கையை முடிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது சுகாதார நிலையத்தை தொடர்பு கொள்ளவும்.',
    noVoice: 'இந்த உலாவியில் பொருத்தமான தமிழ் குரல் இல்லை. உரை வழிமுறைகள் கிடைக்கும்.',
  },
  Hindi: {
    welcome: 'ट्राइबलकेयर में आपका स्वागत है। भाषा चुनने के लिए नंबर दबाएँ: 1 तमिल, 2 अंग्रेज़ी, 3 हिंदी, 4 तेलुगु, 5 मलयालम, 6 कन्नड़।',
    language: 'भाषा चुनी गई। 1 आपातकालीन सहायता, 2 अपॉइंटमेंट विवरण, 3 गर्भावस्था देखभाल, 4 बाल स्वास्थ्य और टीकाकरण, 5 आशा कार्यकर्ता, 6 नज़दीकी प्राथमिक स्वास्थ्य केंद्र, 0 स्वास्थ्य सहायता।',
    menu: '1 आपातकालीन सहायता। 2 अपॉइंटमेंट विवरण। 3 गर्भावस्था देखभाल। 4 बाल स्वास्थ्य और टीकाकरण। 5 आशा कार्यकर्ता। 6 नज़दीकी प्राथमिक स्वास्थ्य केंद्र। 0 स्वास्थ्य सहायता।',
    responses: ['स्वास्थ्य सहायता के लिए कॉलबैक माँगा गया है।', 'आपातकालीन सहायता का अनुरोध भेजा गया है। आपकी देखभाल टीम को सूचित किया गया है। एम्बुलेंस नहीं भेजी जाती है।', 'अपॉइंटमेंट विवरण तैयार हैं।', 'गर्भावस्था देखभाल की जानकारी तैयार है।', 'बच्चे के स्वास्थ्य और टीकाकरण की जानकारी तैयार है।', 'आपकी आशा कार्यकर्ता का विवरण तैयार है।', 'नज़दीकी प्राथमिक स्वास्थ्य केंद्र का विवरण तैयार है।'],
    error: 'अनुरोध पूरा नहीं हो सका। फिर से कोशिश करें या स्थानीय स्वास्थ्य केंद्र से संपर्क करें।',
    noVoice: 'इस ब्राउज़र में हिंदी की उपयुक्त आवाज़ उपलब्ध नहीं है। पाठ निर्देश उपलब्ध हैं।',
  },
  Telugu: {
    welcome: 'ట్రైబల్‌కేర్‌కు స్వాగతం. భాషను ఎంచుకోవడానికి నంబర్ నొక్కండి: 1 తమిళం, 2 ఇంగ్లీష్, 3 హిందీ, 4 తెలుగు, 5 మలయాళం, 6 కన్నడ.',
    language: 'భాష ఎంపికైంది. 1 అత్యవసర సహాయం, 2 అపాయింట్‌మెంట్ వివరాలు, 3 గర్భధారణ సంరక్షణ, 4 పిల్లల ఆరోగ్యం మరియు టీకాలు, 5 ఆశా కార్యకర్త, 6 సమీప ప్రాథమిక ఆరోగ్య కేంద్రం, 0 ఆరోగ్య సహాయం.',
    menu: '1 అత్యవసర సహాయం. 2 అపాయింట్‌మెంట్ వివరాలు. 3 గర్భధారణ సంరక్షణ. 4 పిల్లల ఆరోగ్యం మరియు టీకాలు. 5 ఆశా కార్యకర్త. 6 సమీప ప్రాథమిక ఆరోగ్య కేంద్రం. 0 ఆరోగ్య సహాయం.',
    responses: ['ఆరోగ్య సహాయం కోసం తిరిగి కాల్ చేయమని అభ్యర్థించారు.', 'అత్యవసర సహాయం అభ్యర్థన పంపబడింది. మీ సంరక్షణ బృందానికి సమాచారం అందింది. అంబులెన్స్ పంపబడదు.', 'అపాయింట్‌మెంట్ వివరాలు సిద్ధంగా ఉన్నాయి.', 'గర్భధారణ సంరక్షణ సమాచారం సిద్ధంగా ఉంది.', 'పిల్లల ఆరోగ్యం మరియు టీకాల సమాచారం సిద్ధంగా ఉంది.', 'మీ ఆశా కార్యకర్త వివరాలు సిద్ధంగా ఉన్నాయి.', 'సమీప ప్రాథమిక ఆరోగ్య కేంద్రం వివరాలు సిద్ధంగా ఉన్నాయి.'],
    error: 'అభ్యర్థనను పూర్తి చేయలేకపోయాం. మళ్లీ ప్రయత్నించండి లేదా స్థానిక ఆరోగ్య కేంద్రాన్ని సంప్రదించండి.',
    noVoice: 'ఈ బ్రౌజర్‌లో సరిపోలే తెలుగు స్వరం లేదు. వచన సూచనలు అందుబాటులో ఉన్నాయి.',
  },
  Malayalam: {
    welcome: 'ട്രൈബൽകെയറിലേക്ക് സ്വാഗതം. ഭാഷ തിരഞ്ഞെടുക്കാൻ നമ്പർ അമർത്തുക: 1 തമിഴ്, 2 ഇംഗ്ലീഷ്, 3 ഹിന്ദി, 4 തെലുങ്ക്, 5 മലയാളം, 6 കന്നഡ.',
    language: 'ഭാഷ തിരഞ്ഞെടുത്തു. 1 അടിയന്തര സഹായം, 2 അപ്പോയിന്റ്മെന്റ് വിവരങ്ങൾ, 3 ഗർഭകാല പരിചരണം, 4 ശിശു ആരോഗ്യവും വാക്സിനേഷനും, 5 ആശാ പ്രവർത്തക, 6 അടുത്തുള്ള പ്രാഥമികാരോഗ്യ കേന്ദ്രം, 0 ആരോഗ്യ സഹായം.',
    menu: '1 അടിയന്തര സഹായം. 2 അപ്പോയിന്റ്മെന്റ് വിവരങ്ങൾ. 3 ഗർഭകാല പരിചരണം. 4 ശിശു ആരോഗ്യവും വാക്സിനേഷനും. 5 ആശാ പ്രവർത്തക. 6 അടുത്തുള്ള പ്രാഥമികാരോഗ്യ കേന്ദ്രം. 0 ആരോഗ്യ സഹായം.',
    responses: ['ആരോഗ്യ സഹായത്തിനായി തിരികെ വിളിക്കാൻ അഭ്യർത്ഥിച്ചു.', 'അടിയന്തര സഹായ അഭ്യർത്ഥന അയച്ചു. പരിചരണ സംഘത്തെ അറിയിച്ചു. ആംബുലൻസ് അയയ്ക്കില്ല.', 'അപ്പോയിന്റ്മെന്റ് വിവരങ്ങൾ തയ്യാറാണ്.', 'ഗർഭകാല പരിചരണ വിവരങ്ങൾ തയ്യാറാണ്.', 'ശിശു ആരോഗ്യ, വാക്സിനേഷൻ വിവരങ്ങൾ തയ്യാറാണ്.', 'നിങ്ങളുടെ ആശാ പ്രവർത്തകയുടെ വിവരങ്ങൾ തയ്യാറാണ്.', 'അടുത്തുള്ള പ്രാഥമികാരോഗ്യ കേന്ദ്രത്തിന്റെ വിവരങ്ങൾ തയ്യാറാണ്.'],
    error: 'അഭ്യർത്ഥന പൂർത്തിയാക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക അല്ലെങ്കിൽ പ്രാദേശിക ആരോഗ്യ കേന്ദ്രവുമായി ബന്ധപ്പെടുക.',
    noVoice: 'ഈ ബ്രൗസറിൽ അനുയോജ്യമായ മലയാള ശബ്ദം ലഭ്യമല്ല. വാചക നിർദ്ദേശങ്ങൾ ലഭ്യമാണ്.',
  },
  Kannada: {
    welcome: 'ಟ್ರೈಬಲ್‌ಕೇರ್‌ಗೆ ಸ್ವಾಗತ. ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಲು ಸಂಖ್ಯೆಯನ್ನು ಒತ್ತಿ: 1 ತಮಿಳು, 2 ಇಂಗ್ಲಿಷ್, 3 ಹಿಂದಿ, 4 ತೆಲುಗು, 5 ಮಲಯಾಳಂ, 6 ಕನ್ನಡ.',
    language: 'ಭಾಷೆ ಆಯ್ಕೆಯಾಗಿದೆ. 1 ತುರ್ತು ಸಹಾಯ, 2 ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿವರಗಳು, 3 ಗರ್ಭಧಾರಣೆ ಆರೈಕೆ, 4 ಮಕ್ಕಳ ಆರೋಗ್ಯ ಮತ್ತು ಲಸಿಕೆ, 5 ಆಶಾ ಕಾರ್ಯಕರ್ತೆ, 6 ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ, 0 ಆರೋಗ್ಯ ಬೆಂಬಲ.',
    menu: '1 ತುರ್ತು ಸಹಾಯ. 2 ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿವರಗಳು. 3 ಗರ್ಭಧಾರಣೆ ಆರೈಕೆ. 4 ಮಕ್ಕಳ ಆರೋಗ್ಯ ಮತ್ತು ಲಸಿಕೆ. 5 ಆಶಾ ಕಾರ್ಯಕರ್ತೆ. 6 ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ. 0 ಆರೋಗ್ಯ ಬೆಂಬಲ.',
    responses: ['ಆರೋಗ್ಯ ಬೆಂಬಲಕ್ಕಾಗಿ ಮರಳಿ ಕರೆ ಮಾಡಲು ವಿನಂತಿಸಲಾಗಿದೆ.', 'ತುರ್ತು ಸಹಾಯ ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಆರೈಕೆ ತಂಡಕ್ಕೆ ತಿಳಿಸಲಾಗಿದೆ. ಆಂಬ್ಯುಲೆನ್ಸ್ ಕಳುಹಿಸಲಾಗುವುದಿಲ್ಲ.', 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿವರಗಳು ಸಿದ್ಧವಾಗಿವೆ.', 'ಗರ್ಭಧಾರಣೆ ಆರೈಕೆ ಮಾಹಿತಿ ಸಿದ್ಧವಾಗಿದೆ.', 'ಮಕ್ಕಳ ಆರೋಗ್ಯ ಮತ್ತು ಲಸಿಕೆ ಮಾಹಿತಿ ಸಿದ್ಧವಾಗಿದೆ.', 'ನಿಮ್ಮ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯ ವಿವರಗಳು ಸಿದ್ಧವಾಗಿವೆ.', 'ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರದ ವಿವರಗಳು ಸಿದ್ಧವಾಗಿವೆ.'],
    error: 'ವಿನಂತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಸ್ಥಳೀಯ ಆರೋಗ್ಯ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    noVoice: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯ ಕನ್ನಡ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ. ಪಠ್ಯ ಸೂಚನೆಗಳು ಲಭ್ಯವಿವೆ.',
  },
}

const optionFor = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6 }
const spokenDigits = {
  English: ['zero', 'one', 'two', 'three', 'four', 'five', 'six'],
  Tamil: ['பூஜ்ஜியம்', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு'],
  Hindi: ['शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह'],
  Telugu: ['సున్నా', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు'],
  Malayalam: ['പൂജ്യം', 'ഒന്ന്', 'രണ്ട്', 'മൂന്ന്', 'നാല്', 'അഞ്ച്', 'ആറ്'],
  Kannada: ['ಸೊನ್ನೆ', 'ಒಂದು', 'ಎರಡು', 'ಮೂರು', 'ನಾಲ್ಕು', 'ಐದು', 'ಆರು'],
}

const optionLabels = {
  English: ['Healthcare support', 'Emergency help', 'Appointment details', 'Pregnancy care', 'Child health and vaccination', 'ASHA worker', 'Nearby health centre'],
  Tamil: ['சுகாதார ஆதரவு', 'அவசர உதவி', 'சந்திப்பு விவரம்', 'கர்ப்பகால பராமரிப்பு', 'குழந்தை நலம் மற்றும் தடுப்பூசி', 'ஆஷா பணியாளர்', 'அருகிலுள்ள சுகாதார நிலையம்'],
  Hindi: ['स्वास्थ्य सहायता', 'आपातकालीन सहायता', 'अपॉइंटमेंट विवरण', 'गर्भावस्था देखभाल', 'बाल स्वास्थ्य और टीकाकरण', 'आशा कार्यकर्ता', 'नज़दीकी स्वास्थ्य केंद्र'],
  Telugu: ['ఆరోగ్య సహాయం', 'అత్యవసర సహాయం', 'అపాయింట్‌మెంట్ వివరాలు', 'గర్భధారణ సంరక్షణ', 'పిల్లల ఆరోగ్యం మరియు టీకాలు', 'ఆశా కార్యకర్త', 'సమీప ఆరోగ్య కేంద్రం'],
  Malayalam: ['ആരോഗ്യ സഹായം', 'അടിയന്തര സഹായം', 'അപ്പോയിന്റ്മെന്റ് വിവരങ്ങൾ', 'ഗർഭകാല പരിചരണം', 'ശിശു ആരോഗ്യവും വാക്സിനേഷനും', 'ആശാ പ്രവർത്തക', 'അടുത്തുള്ള ആരോഗ്യ കേന്ദ്രം'],
  Kannada: ['ಆರೋಗ್ಯ ಬೆಂಬಲ', 'ತುರ್ತು ಸಹಾಯ', 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ವಿವರಗಳು', 'ಗರ್ಭಧಾರಣೆ ಆರೈಕೆ', 'ಮಕ್ಕಳ ಆರೋಗ್ಯ ಮತ್ತು ಲಸಿಕೆ', 'ಆಶಾ ಕಾರ್ಯಕರ್ತೆ', 'ಹತ್ತಿರದ ಆರೋಗ್ಯ ಕೇಂದ್ರ'],
}

const spokenLanguageNames = {
  Tamil: ['tamil', 'தமிழ்'],
  English: ['english', 'ஆங்கிலம்', 'अंग्रेज़ी', 'ఇంగ్లీష్', 'ഇംഗ്ലീഷ്', 'ಇಂಗ್ಲಿಷ್'],
  Hindi: ['hindi', 'இந்தி', 'हिंदी', 'హిందీ', 'ഹിന്ദി', 'ಹಿಂದಿ'],
  Telugu: ['telugu', 'தெலுங்கு', 'तेलुगु', 'తెలుగు', 'തെലുങ്ക്', 'ತೆಲುಗು'],
  Malayalam: ['malayalam', 'மலையாளம்', 'मलयालम', 'మలయాళం', 'മലയാളം', 'ಮಲಯಾಳಂ'],
  Kannada: ['kannada', 'கன்னடம்', 'कन्नड़', 'కన్నడ', 'കന്നഡ', 'ಕನ್ನಡ'],
}

function parseSpokenChoice(transcript, language, languageSelection) {
  const normalized = transcript.toLowerCase().replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ').trim()
  const choiceText = normalized
    .replace(/^(?:(?:i choose|i select|i want)\s+)?(?:(?:option|number|press)\s+)/, '')
    .replace(/\s+please$/, '')
    .trim()
  if (languageSelection) {
    const languageIndex = languageOptions.findIndex(item =>
      spokenLanguageNames[item.name].includes(choiceText))
    if (languageIndex >= 0) return String(languageIndex + 1)
  }
  const digits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six']
  const digitIndex = digits.indexOf(choiceText)
  if (/^[0-6]$/.test(choiceText)) return choiceText
  if (digitIndex >= 0) return String(digitIndex)
  const localIndex = spokenDigits[language || 'English'].findIndex(word => word.toLowerCase() === choiceText)
  return localIndex >= 0 ? String(localIndex) : ''
}

function localizedResponse(language, digit, details) {
  const index = optionFor[digit]
  const response = copy[language].responses[index]
  if (!Object.keys(details || {}).length) return response
  const detail = {
    English: {
      '2': `Your appointment is on ${details.date} at ${details.time}, ${details.facility}.`,
      '3': `Next pregnancy checkup: ${details.next_checkup || 'not scheduled'}.`,
      '4': `Next vaccination: ${details.vaccine} on ${details.due_date}.`,
      '5': `Your ASHA worker is ${details.worker_name}${details.village ? `, ${details.village}` : ''}.`,
      '6': `Nearby Primary Health Centre: ${details.facility}${details.village ? `, ${details.village}` : ''}.`,
    },
    Tamil: {
      '2': `உங்கள் சந்திப்பு ${details.date} அன்று ${details.time} மணிக்கு, ${details.facility}.`,
      '3': `அடுத்த கர்ப்பகால பரிசோதனை: ${details.next_checkup || 'திட்டமிடப்படவில்லை'}.`,
      '4': `அடுத்த தடுப்பூசி: ${details.vaccine}, ${details.due_date}.`,
      '5': `உங்கள் ஆஷா பணியாளர் ${details.worker_name}${details.village ? `, ${details.village}` : ''}.`,
      '6': `அருகிலுள்ள ஆரம்ப சுகாதார நிலையம்: ${details.facility}${details.village ? `, ${details.village}` : ''}.`,
    },
    Hindi: {
      '2': `आपकी अपॉइंटमेंट ${details.date} को ${details.time} बजे, ${details.facility} में है।`,
      '3': `अगली गर्भावस्था जाँच: ${details.next_checkup || 'तय नहीं है'}।`,
      '4': `अगला टीका: ${details.vaccine}, ${details.due_date}।`,
      '5': `आपकी आशा कार्यकर्ता ${details.worker_name}${details.village ? `, ${details.village}` : ''} हैं।`,
      '6': `नज़दीकी प्राथमिक स्वास्थ्य केंद्र: ${details.facility}${details.village ? `, ${details.village}` : ''}।`,
    },
    Telugu: {
      '2': `మీ అపాయింట్‌మెంట్ ${details.date} తేదీన ${details.time} గంటలకు, ${details.facility} వద్ద.`,
      '3': `తదుపరి గర్భధారణ పరీక్ష: ${details.next_checkup || 'షెడ్యూల్ కాలేదు'}.`,
      '4': `తదుపరి టీకా: ${details.vaccine}, ${details.due_date}.`,
      '5': `మీ ఆశా కార్యకర్త ${details.worker_name}${details.village ? `, ${details.village}` : ''}.`,
      '6': `సమీప ప్రాథమిక ఆరోగ్య కేంద్రం: ${details.facility}${details.village ? `, ${details.village}` : ''}.`,
    },
    Malayalam: {
      '2': `നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് ${details.date} ന് ${details.time} മണിക്ക് ${details.facility} ൽ.`,
      '3': `അടുത്ത ഗർഭകാല പരിശോധന: ${details.next_checkup || 'നിശ്ചയിച്ചിട്ടില്ല'}.`,
      '4': `അടുത്ത വാക്സിൻ: ${details.vaccine}, ${details.due_date}.`,
      '5': `നിങ്ങളുടെ ആശാ പ്രവർത്തക ${details.worker_name}${details.village ? `, ${details.village}` : ''}.`,
      '6': `അടുത്തുള്ള പ്രാഥമികാരോഗ്യ കേന്ദ്രം: ${details.facility}${details.village ? `, ${details.village}` : ''}.`,
    },
    Kannada: {
      '2': `ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ${details.date} ರಂದು ${details.time} ಗಂಟೆಗೆ, ${details.facility} ನಲ್ಲಿ.`,
      '3': `ಮುಂದಿನ ಗರ್ಭಧಾರಣೆ ತಪಾಸಣೆ: ${details.next_checkup || 'ನಿಗದಿಯಾಗಿಲ್ಲ'}.`,
      '4': `ಮುಂದಿನ ಲಸಿಕೆ: ${details.vaccine}, ${details.due_date}.`,
      '5': `ನಿಮ್ಮ ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ${details.worker_name}${details.village ? `, ${details.village}` : ''}.`,
      '6': `ಹತ್ತಿರದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ: ${details.facility}${details.village ? `, ${details.village}` : ''}.`,
    },
  }[language][digit]
  return detail || response
}

function PatientAccess() {
  const [number, setNumber] = useState('9876543210')
  const [healthcareNumber, setHealthcareNumber] = useState('1800-123-4567')
  const [language, setLanguage] = useState('')
  const [stage, setStage] = useState('idle')
  const [screen, setScreen] = useState('Welcome to TribalCare AI. Press Call to begin.')
  const [status, setStatus] = useState('Ready')
  const [speed, setSpeed] = useState(1)
  const [voiceMessage, setVoiceMessage] = useState('')
  const [recognitionMessage, setRecognitionMessage] = useState('')
  const [lastSpeech, setLastSpeech] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [selectedOption, setSelectedOption] = useState('')
  const recognitionRef = useRef(null)
  const callActiveRef = useRef(false)
  const [smsKeyword, setSmsKeyword] = useState('HELP')
  const [smsResult, setSmsResult] = useState('')
  const [smsError, setSmsError] = useState('')
  const [smsLoading, setSmsLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [, refreshVoices] = useState(0)
  const [recording, setRecording] = useState(null)
  const [recordingStatus, setRecordingStatus] = useState('')
  const [recordingError, setRecordingError] = useState('')
  const [uploadingRecording, setUploadingRecording] = useState(false)

  useEffect(() => {
    api.get('/public/config').then(response => setHealthcareNumber(response.data.healthcare_number))
      .catch(() => setStatus('Backend unavailable. Call and SMS are simulation-only until the service reconnects.'))
    const voicesChanged = () => refreshVoices(version => version + 1)
    window.speechSynthesis?.addEventListener?.('voiceschanged', voicesChanged)
    return () => {
      callActiveRef.current = false
      recognitionRef.current?.abort()
      window.speechSynthesis?.cancel()
      window.speechSynthesis?.removeEventListener?.('voiceschanged', voicesChanged)
    }
  }, [])

  const speak = (message, selectedLanguage = language || 'English') => {
    setLastSpeech(message)
    setVoiceMessage('')
    if (!('speechSynthesis' in window)) {
      setVoiceMessage('Voice playback is not supported by this browser. Read the displayed instructions or use the keypad.')
      return
    }
    const locale = languageOptions.find(item => item.name === selectedLanguage)?.locale
    const selectedVoice = window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase() === locale.toLowerCase())
      || window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith(locale.slice(0, 2).toLowerCase()))
    if (!selectedVoice) {
      setVoiceMessage(copy[selectedLanguage].noVoice)
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = locale
    utterance.voice = selectedVoice
    utterance.rate = speed
    utterance.onerror = () => setVoiceMessage('Voice playback failed. You can continue using the keypad and on-screen instructions.')
    window.speechSynthesis.speak(utterance)
  }

  const startCall = () => {
    if (!/^\d{10}$/.test(number)) {
      setStatus('Enter a valid 10-digit patient mobile number before calling.')
      return
    }
    window.speechSynthesis?.cancel()
    callActiveRef.current = true
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setIsListening(false)
    setSelectedOption('')
    setVoiceMessage('')
    setRecognitionMessage('')
    setLanguage('')
    setStage('language')
    setScreen(copy.English.welcome)
    setStatus(`Simulated call connected · ${healthcareNumber}`)
    speak(copy.English.welcome, 'English')
  }

  const endCall = () => {
    callActiveRef.current = false
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setIsListening(false)
    window.speechSynthesis?.cancel()
    setStage('idle')
    setStatus('Call ended. No ambulance is dispatched through this demo.')
    setScreen('Call ended. Press Call to begin again.')
  }

  const chooseLanguage = (name, key = '') => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setIsListening(false)
    setLanguage(name)
    setStage('menu')
    setSelectedOption(key ? `${key} · ${name}` : `Language · ${name}`)
    setScreen(copy[name].language)
    setStatus(`Call connected · ${name}`)
    speak(copy[name].language, name)
  }

  const submitOption = async digit => {
    if (stage !== 'menu') return
    if (digit === '*') {
      setStage('language')
      setLanguage('')
      setScreen(copy.English.welcome)
      speak(copy.English.welcome, 'English')
      return
    }
    if (digit === '#') {
      setSelectedOption('')
      setScreen(copy[language].menu)
      speak(copy[language].menu)
      return
    }
    if (!(digit in optionFor)) {
      const message = copy[language].error
      setScreen(message)
      speak(message)
      return
    }
    const optionIndex = optionFor[digit]
    setSelectedOption(`${digit} · ${optionLabels[language][optionIndex]}`)
    setStatus('Saving your request…')
    try {
      const response = await api.post('/patient/ivr', { mobile: number, language, option: digit })
      const message = localizedResponse(language, digit, response.data.details)
      setScreen(message)
      setStatus(response.data.request_id ? `Request saved · ${response.data.request_id}` : 'Interaction saved')
      speak(message)
    } catch {
      const message = copy[language].error
      setScreen(message)
      setStatus(message)
      speak(message)
    }
  }

  const press = key => {
    setRecognitionMessage('')
    if (stage === 'language' && /^[1-6]$/.test(key)) {
      chooseLanguage(languageOptions[Number(key) - 1].name, key)
    } else {
      submitOption(key)
    }
  }

  const recognize = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setRecognitionMessage('Speech recognition is not supported in this browser. The keypad remains available; press a number to continue.')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecognitionMessage('Microphone access is unavailable in this browser or page context. Use the keypad below to continue.')
      return
    }
    if (isListening) return

    const startRecognition = async () => {
      window.speechSynthesis?.cancel()
      setRecognitionMessage('')
      setStatus(`Requesting microphone permission for ${language || 'English'} voice input…`)
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const microphone = stream.getAudioTracks().find(track => track.readyState === 'live')
        if (!microphone) {
          setRecognitionMessage('No active microphone was found. The keypad is ready; press a number to continue.')
          setStatus('Voice input unavailable · keypad ready')
          return
        }
        microphone.stop()
        const devices = await navigator.mediaDevices.enumerateDevices()
        if (!devices.some(device => device.kind === 'audioinput')) {
          setRecognitionMessage('No microphone is available. The keypad is ready; press a number to continue.')
          setStatus('Voice input unavailable · keypad ready')
          return
        }
      } catch (error) {
        const messages = {
          NotAllowedError: 'Microphone permission was denied. Allow microphone access in browser settings or use the keypad below.',
          NotFoundError: 'No microphone was found. Connect a microphone or use the keypad below.',
          NotReadableError: 'The microphone is busy or unavailable. Use the keypad below to continue.',
          SecurityError: 'Microphone access requires a secure page. Use the keypad below to continue.',
        }
        setRecognitionMessage(messages[error.name] || 'Microphone access failed. The keypad is ready; press a number to continue.')
        setStatus('Voice input unavailable · keypad ready')
        return
      } finally {
        stream?.getTracks().forEach(track => track.stop())
      }

      if (!callActiveRef.current) return
      let recognition
      try {
        recognition = new Recognition()
      } catch {
        setRecognitionMessage('Voice recognition is not available in this browser session. The IVR is still active; use the keypad.')
        setStatus('Voice input unavailable · keypad ready')
        return
      }
      recognitionRef.current = recognition
      recognition.lang = languageOptions.find(item => item.name === (language || 'English')).locale
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 3
      recognition.onstart = () => {
        setIsListening(true)
        setRecognitionMessage('')
        setStatus(`Listening in ${language || 'English'} · speak a menu number`)
      }
      recognition.onresult = event => {
        const selectedLanguage = language || 'English'
        const alternatives = Array.from(event.results?.[0] || [])
        const digit = alternatives
          .filter(result => !Number.isFinite(result.confidence) || result.confidence === 0 || result.confidence >= 0.35)
          .map(result => parseSpokenChoice(result.transcript || '', selectedLanguage, stage === 'language'))
          .find(Boolean)
        if (digit) {
          const label = stage === 'language'
            ? languageOptions[Number(digit) - 1]?.name
            : optionLabels[selectedLanguage][optionFor[digit]]
          if (label) {
            setSelectedOption(`${digit} · ${label}`)
            setStatus(`You selected ${label}.`)
          }
          press(digit)
        } else {
          setRecognitionMessage('I could not identify a clear menu choice. Your call is still active; speak one number or press the matching keypad number.')
          setStatus('No clear choice detected · call active · keypad ready')
        }
      }
      recognition.onnomatch = () => {
        setRecognitionMessage('I could not hear a menu number. The IVR is still active; press the matching number on the keypad.')
        setStatus('No menu number detected · keypad ready')
      }
      recognition.onerror = event => {
        if (!callActiveRef.current || event.error === 'aborted') return
        const messages = {
          'not-allowed': 'Microphone permission was denied. Allow microphone access or press a keypad number.',
          'audio-capture': 'The microphone is unavailable. The IVR is still active; use the keypad.',
          'no-speech': 'No voice was detected. The IVR is still active; press a keypad number to continue.',
          network: 'Voice recognition is temporarily unavailable. The IVR is still active; use the keypad.',
          aborted: 'Voice listening stopped. The keypad remains ready.',
        }
        setRecognitionMessage(messages[event.error] || 'Voice recognition could not complete. The IVR is still active; use the keypad.')
        setStatus('Voice input ended · keypad ready')
      }
      recognition.onend = () => {
        setIsListening(false)
        if (recognitionRef.current === recognition) recognitionRef.current = null
        if (callActiveRef.current && stage !== 'idle') {
          setStatus(current => current.startsWith('You selected') || current.startsWith('Saving') || current.startsWith('Interaction saved') || current.startsWith('Request saved')
            ? current
            : 'Voice listening ended · keypad ready')
        }
      }
      try {
        recognition.start()
      } catch (error) {
        recognitionRef.current = null
        setIsListening(false)
        setRecognitionMessage(error.name === 'InvalidStateError'
          ? 'Voice listening is already active. The keypad remains ready.'
          : 'Voice recognition could not start. The IVR is still active; use the keypad.')
        setStatus('Voice input unavailable · keypad ready')
      }
    }
    startRecognition()
  }

  const sendSms = async event => {
    event.preventDefault()
    setSmsError('')
    setSmsResult('')
    if (!/^\d{10}$/.test(number)) {
      setSmsError('Enter a valid 10-digit mobile number.')
      return
    }
    setSmsLoading(true)
    try {
      const response = await api.post('/sms/process', { mobile: number, keyword: smsKeyword })
      setSmsResult(response.data.response)
      setHistory(items => [response.data, ...items])
    } catch (error) {
      setSmsError(error.response?.data?.detail || 'SMS service unavailable. Please try again when the service is online.')
    } finally {
      setSmsLoading(false)
    }
  }

  const uploadRecording = async event => {
    event.preventDefault()
    setRecordingStatus('')
    setRecordingError('')
    if (!/^\d{10}$/.test(number)) {
      setRecordingError('Enter a valid 10-digit mobile number.')
      return
    }
    if (!recording) {
      setRecordingError('Choose an audio recording before uploading.')
      return
    }
    const form = new FormData()
    form.append('file', recording)
    form.append('patient_mobile', number)
    setUploadingRecording(true)
    try {
      await api.post('/voice/upload', form)
      setRecordingStatus('Voice recording saved. Your care team can review the original audio; automated transcription is not configured.')
      setRecording(null)
      event.target.reset()
    } catch (error) {
      setRecordingError(error.response?.data?.detail || 'Unable to save the voice recording.')
    } finally {
      setUploadingRecording(false)
    }
  }

  return (
    <div id="ivr" className="patient-access">
      <div className="access-heading">
        <span className="eyebrow">PATIENT ACCESS · NO APP REQUIRED</span>
        <h2>Call or text from any phone.</h2>
        <p>Central healthcare number <a href={`tel:${healthcareNumber.replaceAll('-', '')}`}>{healthcareNumber}</a> <span>· simulated demo line</span></p>
      </div>
      <div className="access-grid">
        <section className="access-card">
          <div className="access-card-heading"><div><Phone size={18}/><b>Interactive IVR call</b></div><span className="access-state">{status}</span></div>
          <label className="access-number">Patient mobile number<input aria-label="Patient mobile number" inputMode="numeric" maxLength="10" value={number} onChange={event => setNumber(event.target.value.replace(/\D/g, ''))}/></label>
          <div className="phone-simulator">
            <div className="phone-speaker"/>
            <div className="phone-screen">
              <div className="screen-top"><span>{language || 'TribalCare'}</span><span>{stage === 'idle' ? 'Ready' : 'On call'}</span></div>
              {selectedOption && <div className="selected-option" aria-live="polite">Selected: {selectedOption}</div>}
              <p>{screen}</p>
            </div>
            <div className="keypad">{['1','2','3','4','5','6','7','8','9','*','0','#'].map(key => (
              <button key={key} type="button" onClick={() => press(key)} disabled={stage === 'idle'} aria-label={`Press ${key}`}><b>{key}</b></button>
            ))}</div>
            <div className="call-controls">
              <button className="call" type="button" onClick={startCall} aria-label="Start call"><Phone size={18}/></button>
              <button className="clear" type="button" onClick={() => { setScreen(''); setStatus('Display cleared. The call remains connected.') }} aria-label="Clear display"><Delete size={18}/></button>
              <button className="end" type="button" onClick={endCall} aria-label="End call"><PhoneOff size={18}/></button>
            </div>
          </div>
          <div className="voice-controls">
            <label><Languages size={16}/> <span>Language</span><select value={language} onChange={event => event.target.value && chooseLanguage(event.target.value)} disabled={stage === 'idle'}><option value="">Select with keypad</option>{languageOptions.map(item => <option key={item.name}>{item.name}</option>)}</select></label>
            <label><span>Voice speed</span><select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value="0.8">Slow</option><option value="1">Normal</option><option value="1.2">Fast</option></select></label>
            <button type="button" onClick={() => lastSpeech && speak(lastSpeech)} disabled={!lastSpeech}><Volume2 size={16}/> Replay</button>
            <button type="button" className={isListening ? 'listening-button' : ''} onClick={recognize} disabled={stage === 'idle' || isListening}><Mic size={16}/> {isListening ? 'Listening…' : 'Speak'}</button>
            {isListening && <button type="button" onClick={() => recognitionRef.current?.stop()}>Stop listening</button>}
          </div>
          {isListening && <p className="listening-indicator" role="status"><span className="listening-pulse"/> Listening in {language || 'English'} — speak a menu number. The keypad remains available.</p>}
          {stage !== 'idle' && !isListening && <p className="dtmf-indicator">Keypad ready — press the number for your choice anytime.</p>}
          {voiceMessage && <p className="voice-note" role="status">{voiceMessage}</p>}
          {recognitionMessage && <p className="voice-note recognition-note" role="status">{recognitionMessage}</p>}
          {stage === 'language' && <div className="language-choices">{languageOptions.map((item, index) => <button key={item.name} type="button" onClick={() => chooseLanguage(item.name)}>{index + 1} · {item.name}</button>)}</div>}
          {stage !== 'idle' && <p className="ivr-hint">Voice and keypad are both available. Press a number anytime · * to choose another language · # to replay menu</p>}
        </section>

        <section className="access-card sms-card">
          <div className="access-card-heading"><div><Send size={18}/><b>SMS keyword simulator</b></div><span className="demo-badge">DEMO</span></div>
          <p>Send a keyword to <b>{healthcareNumber}</b>. Your assigned care team receives the request.</p>
          <form onSubmit={sendSms}>
            <label>Patient mobile number<input inputMode="numeric" maxLength="10" value={number} onChange={event => setNumber(event.target.value.replace(/\D/g, ''))} required/></label>
            <label>Message keyword<select value={smsKeyword} onChange={event => setSmsKeyword(event.target.value)}>{['HELP','APPT','VACCINE','WORKER','CALL'].map(key => <option key={key} value={key}>{key}</option>)}</select></label>
            <button type="submit" className="btn primary full" disabled={smsLoading}>{smsLoading ? <LoaderCircle className="spin" size={17}/> : <Send size={17}/>} {smsLoading ? 'Sending…' : 'Send SMS'}</button>
          </form>
          {smsError && <p className="access-error" role="alert">{smsError}</p>}
          {smsResult && <div className="sms-result" role="status"><b>Request recorded · Simulated delivery</b><p>{smsResult}</p></div>}
          <div className="keyword-list"><b>Keywords</b><span>HELP · emergency</span><span>APPT · appointments</span><span>VACCINE · child health</span><span>WORKER · ASHA contact</span><span>CALL · callback request</span></div>
          {history.length > 0 && <div className="sms-history"><b>Recent messages</b>{history.map(item => <div key={item.id}><span>{item.keyword} · {item.status}</span><small>{item.response}</small></div>)}</div>}
        </section>
      </div>
      <section className="access-card recording-card">
        <div className="access-card-heading"><div><Mic size={18}/><b>Send a voice message</b></div><span className="demo-badge">AUDIO REVIEW</span></div>
        <p>Attach an audio recording for your care team. The original audio is saved; transcription is not generated without an AI service.</p>
        <form className="recording-form" onSubmit={uploadRecording}>
          <label>Patient mobile number<input inputMode="numeric" maxLength="10" value={number} onChange={event => setNumber(event.target.value.replace(/\D/g, ''))} required/></label>
          <label>Audio recording<input type="file" accept="audio/*" onChange={event => setRecording(event.target.files?.[0] || null)} required/></label>
          <button type="submit" className="btn primary" disabled={uploadingRecording}>{uploadingRecording ? <LoaderCircle className="spin" size={17}/> : <Upload size={17}/>} {uploadingRecording ? 'Uploading…' : 'Send voice message'}</button>
        </form>
        {recordingError && <p className="access-error" role="alert">{recordingError}</p>}
        {recordingStatus && <p className="sms-result" role="status">{recordingStatus}</p>}
      </section>
    </div>
  )
}

export default PatientAccess
