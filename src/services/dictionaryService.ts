
// Basic dictionary service with common Arabic and English words
// In a real app, this would use a much larger dataset or a server-side API

const commonArabicWords = [
  // Pronouns & Basic Particles
  "أنا", "أنت", "أنتما", "أنتم", "أنتن", "هو", "هي", "هما", "هم", "هن", "نحن",
  "هذا", "هذه", "هذان", "هاتان", "هؤلاء", "ذلك", "تلك", "أولئك",
  "الذي", "التي", "اللذان", "اللتان", "الذين", "الللاتي", "اللواتي", "اللائي",
  "من", "ما", "أين", "متى", "كيف", "كم", "أيا", "أنى", "حيثما",
  "في", "إلى", "على", "عن", "بـ", "لـ", "كـ", "مع", "عند", "بين", "منذ", "حتى",
  "أن", "إن", "لأن", "لكن", "بل", "بينما", "إذا", "لو", "كي", "ليت", "لعل",
  "لا", "لم", "لن", "ليس", "ماذا", "لماذا", "هل", "أو", "ثم", "فـ", "ثم",

  // Verbs (Past/Present/Imperative Bases)
  "كان", "يكون", "كن", "صار", "أصبح", "أمسى", "ظل", "بات", "ليس",
  "قال", "يقول", "قل", "جاء", "يأتي", "ذهب", "يذهب", "رأى", "يرى", "سمع", "يسمع",
  "كتب", "يكتب", "قرأ", "يقرأ", "فعل", "يفعل", "اعمال", "يعمل", "نام", "ينام",
  "قام", "يقوم", "جلس", "يجلس", "وقف", "يقف", "مشى", "يمشي", "ركض", "يركض",
  "أكل", "يأكل", "شرب", "يشرب", "ضحك", "يضحك", "بكى", "يبكي", "فكر", "يفكر",
  "عرف", "يعرف", "علم", "يعلم", "فهم", "يفهم", "سأل", "يسأل", "أجاب", "يجيب",
  "ساعد", "يساعد", "أحب", "يحب", "كره", "يكره", "خاف", "يخاف", "شعر", "يشعر",
  "خرج", "يخرج", "دخل", "يدخل", "فتح", "يفتح", "أغلق", "يغلق", "بدأ", "يبدأ", "انتهى", "ينتهي",
  "وجد", "يجد", "أخذ", "يأخذ", "أعطى", "يعطي", "وضع", "يضع", "حمل", "يحمل",
  "استطاع", "يستطيع", "حاول", "يحاول", "نجح", "ينجح", "فشل", "يفشل",

  // Nouns - People & Relations
  "رجل", "امرأة", "طفل", "بنت", "ولد", "فتى", "فتاة", "شباب", "شيب",
  "أب", "أُم", "والد", "والدة", "أخ", "أخت", "ابن", "ابنة", "جد", "جدة",
  "زوج", "زوجة", "عائلة", "أهل", "قريب", "أصدقاء", "صديق", "صاحب", "رفيق", "زميل",
  "إنسان", "بشر", "ناس", "مجتمع", "شعب", "ملك", "أمير", "رئيس", "قائد", "بطل",

  // Nouns - Places & Nature
  "بيت", "منزل", "دار", "غرفة", "مطبخ", "مكتب", "مدرسة", "جامعة", "مستشفى", "مسجد",
  "مدينة", "قرية", "شارع", "طريق", "جسر", "ساحة", "حديقة", "غابة", "جبل", "تلة",
  "نهر", "بحر", "محيط", "سماء", "كوكب", "نجم", "قمر", "شمس", "أرض", "صحراء",
  "وادي", "كهف", "جزيرة", "دولة", "بلد", "وطن", "عالم", "فضاء",

  // Nouns - Objects & Abstract
  "كتاب", "قلم", "ورقة", "دفتر", "كرسي", "طاولة", "باب", "نافذة", "مفتاح", "حقيبة",
  "هاتف", "حاسوب", "ساعة", "مال", "نقود", "سعر", "فوز", "خسارة", "حرب", "سلام",
  "حب", "كره", "حزن", "فرح", "ألم", "أمل", "خوف", "شجاعة", "ذكاء", "جمال",
  "صحة", "مرض", "موت", "حياة", "وقت", "زمن", "يوم", "شهر", "سنة", "صباح", "مساء",
  "نور", "ظلام", "لون", "شكل", "سر", "لغز", "حقيقة", "خيال", "حلم", "هدف",

  // Adjectives
  "كبير", "صغير", "طويل", "قصير", "واسع", "ضيق", "سريع", "بطيء", "قوي", "ضعيف",
  "جميل", "قبيح", "غني", "فقير", "سعيد", "حزين", "طيب", "خبيث", "جديد", "قديم",
  "كثير", "قليل", "صعب", "سهل", "مهم", "عادي", "غريب", "مشهور", "مجهول",
  "بارد", "حار", "لطيف", "قاس", "ذكي", "غبي", "شجاع", "جبان", "كريم", "بخيل",

  // Literary & RPG terms (Specific to the app's vibe)
  "فارس", "محارب", "ساحر", "تنين", "وحش", "مغامرة", "مهمة", "كنز", "خريطة", "سيف",
  "درع", "رمح", "قوس", "سهم", "قلعة", "برج", "مملكة", "إمبراطورية", "قبيلة", "جيش",
  "نصر", "هزيمة", "خيانة", "وفاء", "تضحية", "انتقام", "عدالة", "قانون", "قدر", "مصير",
  "نبوءة", "رمز", "أسطورة", "رواية", "قصة", "حكاية", "فصل", "صفحة", "عنوان", "بطل",
  "شرير", "شخصية", "عقدة", "حل", "بداية", "نهاية", "منذ", "قديما", "يوما", "فجأة",
  "توهج", "وميض", "شرارة", "ظلال", "ارتقاء", "مستوى", "قوة", "مهارة", "قدرة", "سحر",
  "لكن", "بينما", "خلال", "تقريبا", "تماما", "جدا", "ربما", "غالبا", "دائما", "أبدا",
  "بسرعة", "بهدوء", "بقوة", "بشدة", "بعمق", "بوضوح", "فورا", "لاحقا", "سابقا", "قريبا",
  "الآن", "غدا", "أمس", "منذ", "حين", "وقتما", "كلما", "أنى", "كيفما", "أينما",
  "أول", "ثان", "ثالث", "آخر", "جديد", "سابق", "تالي", "منتصف", "نهاية", "بداية",
  "أبيض", "أسود", "أحمر", "أزرق", "أخضر", "أصفر", "بني", "رمادي", "ذهبي", "فضي",
  "سيد", "سيدة", "آنية", "أوان", "لحظة", "دقيقة", "ثانية", "ساعة", "يوم", "ليل", "نهار",
  "شتاء", "صيف", "ربيع", "خريف", "مطر", "ثلج", "رياح", "عاصفة", "غيم", "سحاب",
  "شمس", "قمر", "نور", "ضياء", "شروق", "غروب", "فجر", "ضحى", "عصر", "عشاء",
  "دم", "عظم", "جلد", "شعر", "قلب", "كبد", "رئة", "عقل", "روح", "نفس",
  "فطنة", "حيلة", "مكر", "دهاء", "بشرى", "خبر", "نبأ", "حدث", "تاريخ", "أثر"
];

const commonEnglishWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he",
  "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about",
  "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than",
  "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two",
  "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give",
  "day", "most", "us"
];

class DictionaryService {
  private customWords: Set<string> = new Set();
  private ignoredWords: Set<string> = new Set();
  private builtInWords: Set<string> = new Set();
  private normalizedBuiltIn: Map<string, string> = new Map();

  constructor() {
    commonEnglishWords.forEach(w => this.builtInWords.add(w.toLowerCase()));
    commonArabicWords.forEach(w => {
      this.builtInWords.add(w);
      this.normalizedBuiltIn.set(this.deepNormalize(w), w);
    });
    
    const savedCustom = localStorage.getItem('novel_custom_dictionary');
    if (savedCustom) {
      try {
        const words = JSON.parse(savedCustom);
        words.forEach((w: string) => this.customWords.add(w));
      } catch (e) {
        console.error("Failed to load custom dictionary", e);
      }
    }
  }

  private deepNormalize(text: string): string {
    if (!text) return "";
    return text
      .replace(/[\u064B-\u0652\u0670]/g, "") // Remove Harakat
      .replace(/[أإآ]/g, "ا") // Unify Alef
      .replace(/ة/g, "ه") // Teh Marbuta -> Heh
      .replace(/ى/g, "ي") // Alef Maksura -> Yeh
      .replace(/[،.,!?;:()]/g, "")
      .trim()
      .toLowerCase();
  }

  public isWordCorrect(word: string): boolean {
    const rawWord = word.trim().toLowerCase().replace(/[،.,!?;:()]/g, '');
    if (!rawWord || rawWord.length <= 1) return true;
    if (/^\d+$/.test(rawWord)) return true;
    
    const normalized = this.deepNormalize(rawWord);

    // Direct match
    if (this.builtInWords.has(rawWord) || this.customWords.has(rawWord) || this.ignoredWords.has(rawWord)) {
      return true;
    }

    // Normalized match
    if (this.normalizedBuiltIn.has(normalized)) {
      return true;
    }

    // Handle Arabic prefixes (الـ، و، بـ، لـ، فـ، كـ)
    const prefixes = ['ال', 'و', 'ب', 'ل', 'ف', 'ك', 'وال', 'فال', 'بال', 'لل'];
    for (const prefix of prefixes) {
      if (normalized.startsWith(prefix) && normalized.length > prefix.length + 2) {
        const withoutPrefix = normalized.substring(prefix.length);
        if (this.normalizedBuiltIn.has(withoutPrefix)) return true;
      }
    }

    // Handle common Arabic suffixes (ات، ون، ين، ه، ها، هم، كما، ك، نا)
    const suffixes = ['ات', 'ون', 'ين', 'ه', 'ها', 'هم', 'كما', 'كم', 'ك', 'نا', 'ي'];
    for (const suffix of suffixes) {
      if (normalized.endsWith(suffix) && normalized.length > suffix.length + 2) {
        const withoutSuffix = normalized.substring(0, normalized.length - suffix.length);
        if (this.normalizedBuiltIn.has(withoutSuffix)) return true;
      }
    }
    
    return false;
  }

  public getSuggestions(word: string): string[] {
    const normalized = this.deepNormalize(word);
    const allWords = [...this.builtInWords, ...this.customWords];
    
    // Calculate Levenshtein distance to find the closest matches
    const getLevenshteinDistance = (a: string, b: string): number => {
      const matrix = Array.from({ length: a.length + 1 }, () => 
        Array.from({ length: b.length + 1 }, (_, j) => j)
      );
      for (let i = 1; i <= a.length; i++) matrix[i][0] = i;

      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }
      return matrix[a.length][b.length];
    };

    // Find words with low edit distance or common prefixes
    const scored = allWords
      .map(w => ({
        word: w,
        score: getLevenshteinDistance(normalized, this.deepNormalize(w))
      }))
      .filter(item => item.score <= 2) // Only very close matches
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map(item => item.word);

    // Complement with prefix matches if suggestions are sparse
    if (scored.length < 3) {
      const prefixMatches = allWords
        .filter(w => w.startsWith(normalized.substring(0, 3)))
        .slice(0, 5 - scored.length);
      return [...new Set([...scored, ...prefixMatches])];
    }
    
    return scored;
  }

  public addToDictionary(word: string) {
    this.customWords.add(word.trim().toLowerCase());
    this.saveCustomWords();
  }

  public ignoreWord(word: string) {
    this.ignoredWords.add(word.trim().toLowerCase());
  }

  private saveCustomWords() {
    localStorage.setItem('novel_custom_dictionary', JSON.stringify([...this.customWords]));
  }
}

export const dictionaryService = new DictionaryService();
