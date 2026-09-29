import { Language } from '../types';

export class VoiceAssistant {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;

  public static getSpeechLocale(language: Language): string {
    switch (language) {
      case 'kn': return 'kn-IN';
      case 'hi': return 'hi-IN';
      case 'ta': return 'ta-IN';
      case 'te': return 'te-IN';
      case 'ml': return 'ml-IN';
      case 'mr': return 'mr-IN';
      case 'bn': return 'bn-IN';
      case 'en':
      default:
        return 'en-IN';
    }
  }

  public static isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public static isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  public static speak(text: string, language: Language = 'en', onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel ongoing speech
    this.synth.cancel();

    // Clean markdown or technical brackets for natural speech
    const cleanText = text
      .replace(/\[.*?\]/g, '')
      .replace(/[*_#`]/g, '')
      .replace(/https?:\/\/\S+/g, 'official portal');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const locale = this.getSpeechLocale(language);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = locale;

    // Search available system voices for matched Indian regional language
    const voices = this.synth.getVoices();
    const targetTag = language.toLowerCase();
    const matchedVoice = voices.find((v) => {
      const vLang = v.lang.toLowerCase();
      const vName = v.name.toLowerCase();
      if (language === 'en') {
        return vLang.includes('en-in') || vLang.includes('en-gb') || vLang.includes('en-us');
      }
      return vLang.includes(targetTag) || vName.includes(targetTag);
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public static stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public static startListening(
    language: Language,
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      onError('Browser does not support direct mic capture. You can choose a pre-recorded test utterance.');
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      const rec = new SpeechRec();
      this.recognition = rec;
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = this.getSpeechLocale(language);

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onResult(transcript);
        }
      };

      rec.onerror = (e: any) => {
        onError(e);
      };

      rec.onend = () => {
        onEnd();
      };

      rec.start();
    } catch (e) {
      onError(e);
    }
  }

  public static stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }
}
