import { GoogleGenAI } from '@google/genai';
import { ProjectData } from '../types';

async function executeWithKeyRotation<T>(keys: string[], operation: (key: string) => Promise<T>): Promise<T | null> {
  if (!keys || keys.length === 0) return null;
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!key.trim()) continue;
    try {
      return await operation(key);
    } catch (e: any) {
      // If error is 429 Quota Exceeded or Resource Exhausted, try next key
      if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('quota') || e?.message?.includes('exhausted')) {
        console.warn(`Key index ${i} exhausted/ratelimited, trying next...`);
        continue;
      }
      throw e; // Unhandled error (like bad request), let it bubble up
    }
  }
  return null;
}

export async function generateSuggestion(context: string, type: 'narrative' | 'dialogue' | 'proofread' | 'options' | 'plotholes' | 'chat', project?: ProjectData): Promise<string | null> {
  try {
    const settingsStr = localStorage.getItem('hikaya_ai_settings');
    let apiKeys: string[] = [];
    if (process.env.GEMINI_API_KEY) apiKeys.push(process.env.GEMINI_API_KEY);
    
    let modelName = 'gemini-2.5-flash';

    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        if (settings.apiKeys && Array.isArray(settings.apiKeys) && settings.apiKeys.length > 0) {
           apiKeys = settings.apiKeys.filter((k: string) => k.trim() !== '');
        } else if (settings.apiKey) {
           apiKeys = [settings.apiKey]; // legacy fallback
        }
        if (settings.modelName) modelName = settings.modelName;
      } catch (e) {
         console.warn("Failed to parse settings", e);
      }
    }

    if (apiKeys.length === 0) {
      alert("الرجاء إضافة مفتاح API الخاص بـ Gemini من إعدادات التطبيق لتمكين ميزات الذكاء الاصطناعي.");
      return null;
    }
    
    let fullContext = '';
    if (project) {
        fullContext = `
معلومات حول عالم القصة:
اسم الرواية: ${project.name || 'بدون اسم'}
السيناريو الأساسي: ${project.scenario || 'غير محدد'}
الشخصيات: ${project.characters?.map(c => `- ${c.name} (${c.details})`).join('\n') || 'لا يوجد'}
النقابات/الممالك: ${project.factions?.map(f => `- ${f.name} (${f.type})`).join('\n') || 'لا يوجد'}
المواقع الجغرافية: ${project.worldMap?.map(l => `- ${l.name} (${l.type}): ${l.description}`).join('\n') || 'لا يوجد'}
مفردات/قاموس العالم: ${project.dictionary?.map(d => `- ${d.word} (المعنى: ${d.meaning}) ${d.notes ? '- ملاحظة: ' + d.notes : ''}`).join('\n') || 'لا يوجد'}
`;
    }

    let commandPrompt = '';
    let systemInstruction = '';

    if (type === 'proofread') {
      commandPrompt = `كالآتي هو النص المراد تدقيقه:
"${context}"`;
      systemInstruction = `أنت مدقق لغوي محترف.
المطلوب منك: قم بتصحيح الأخطاء الإملائية والنحوية وتنسيق النص ليصبح أدبيًا واحترافيًا.
تحذير هام جداً: قم بإرجاع النص المصحح فقط بدون أي زيادة أو نقصان. لا تقم بتكملة القصة أبدًا. لا تضف أي ملاحظات أو شروحات. فقط النص المصحح.`;
    } else if (type === 'options') {
       commandPrompt = `النص الأخير في القصة هو:
"${context}"`;
       systemInstruction = `أنت كاتب سيناريو محترف. بناءً على هذا النص وعلى معلومات عالم القصة، اقترح خيارين مفاجئين لسير الأحداث (خيارين فقط)، ليكونا مشوقين وقصيرين.
\n${fullContext}
هام جداً: أرجع الخيارين بصيغة JSON array of strings فقط، مثال: ["الخيار الأول", "الخيار الثاني"] بدون أي كلام إضافي أو علامات الماركدوان البادئة للحقول (بدون \`\`\`json).`;
    } else if (type === 'chat') {
       commandPrompt = context;
       systemInstruction = `أنت مساعد وخبير جداً في كتابة الروايات والقصص المصورة والمانهوا وأساليبها وبناء العوالم.
وظيفتك: مساعدة الكاتب في صياغة الحبكة، بناء الشخصيات، اقتراح الأسماء، إعطاء أفكار لأحداث القصص، ومناقشة تطور الأحداث.
كن مُلهماً ومختصراً واحترافياً وقدم خيارات مذهلة عند الطلب.
إليك معلومات عالم القصة الذي يكتبه الكاتب حالياً لتكون بالصورة:
\n${fullContext}`;
    } else {
       commandPrompt = context.trim() 
         ? `السياق الحالي أو النص المراد التعامل معه: "${context}"\n\nالمطلوب: بناءً على هذا النص وعلى معلومات عالم القصة، قم بتقديم الإضافة الدقيقة بأفضل جودة تناسب القصة.` 
         : "اقترح فكرة مميزة لجملة واحدة لقصة مصورة مانهوا مبنية على عوالم القصة الحالية المحفوظة.";
         
       systemInstruction = type === 'narrative' 
         ? `أنت كاتب سيناريو لروايات مصورة مانهوا. قدم فقرة سردية واحدة تصف المشهد أو الأحداث الدائرة باستيعاب كامل لعالم القصة وشخصياتها، بدون كلام زائد أو مقدمات.\n${fullContext}`
         : `أنت كاتب سيناريوهات مانهوا. قدم جملة حوار واحدة لشخصية تنبض بالحياة متوافقة مع القصة والشخصيات، بدون مقدمات أو أقواس وصفية أو شرح.\n${fullContext}`;
    }

    const res = await executeWithKeyRotation(apiKeys, async (key) => {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
          model: modelName,
          contents: commandPrompt,
          config: {
              systemInstruction,
              temperature: type === 'proofread' ? 0.1 : 0.8
          }
      });
      return response.text;
    });

    if (!res) {
       alert('استنفذت جميع مفاتيح API الخاصة بك (Quota Exceeded)، يرجى إضافة مفاتيح جديدة للذكاء الاصطناعي.');
    }
    return res;
  } catch (error) {
    console.error("AI Error:", error);
    alert('تعذر جلب الاقتراح، الرجاء التحقق من صحة مفاتيح API واسم النموذج.');
    return null;
  }
}

export async function editImageWithAI(imageUrl: string, prompt: string): Promise<string | null> {
  try {
    const settingsStr = localStorage.getItem('hikaya_ai_settings');
    let imageApiKeys: string[] = [];
    
    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        if (settings.imageApiKeys && Array.isArray(settings.imageApiKeys)) {
           imageApiKeys = settings.imageApiKeys.filter((k: string) => k.trim() !== '');
        }
      } catch (e) {}
    }

    if (imageApiKeys.length === 0) {
      alert("الرجاء إضافة مفتاح API خاص بتعديل الصور (Nano Banana / Gemini Image) من الإعدادات.");
      return null;
    }

    const commandPrompt = `قم بتعديل هذه الصورة بناءً على الوصف التالي: ${prompt}\n\nيجب عليك إرجاع الصورة المعدلة بصيغة base64 image data url فقط.`;
    
    let base64Image = imageUrl;
    // Extract base64 part if it's dataurl
    if (imageUrl.startsWith('data:image')) {
      base64Image = imageUrl.split(',')[1];
    } else {
      // If it's not base64, currently not supported in this simple proxy
      alert('يجب أن تكون الصورة المرفوعة من نوع Data URL لتعديلها. حاول رفعها مجدداً.');
      return null;
    }

    const res = await executeWithKeyRotation(imageApiKeys, async (key) => {
      const ai = new GoogleGenAI({ apiKey: key });
      // Using gemini-2.5-flash as default, or whatever custom image model is set
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
             commandPrompt,
             { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
          ],
          config: {
              temperature: 0.8
          }
      });
      return response.text;
    });

    if (!res) {
      alert('استنفذت جميع مفاتيح تحديث الصور الخاصة بك (Quota Exceeded).');
      return null;
    }
    
    // Attempt to extract base64 from response if AI returned it
    // Usually standard text models won't return raw images unless they are specifically designed to return base64 strings.
    // If it's a real Nano Banana API, this logic shouldn't use GoogleGenAI SDK but a raw fetch to their specific API.
    // For the context of this prompt, we parse out standard data URI if present.
    const match = res.match(/(data:image\/[a-zA-Z]*;base64,[^\s"']+)/);
    if(match && match[1]) {
      return match[1];
    } else {
      alert('تم إرسال الطلب لكن النموذج لم يقم بإرجاع صورة بنسق صحيح. النموذج أرجع النص التالي:\n\n' + res.substring(0, 150));
      return null;
    }

  } catch (error) {
    console.error("AI Edit Image Error:", error);
    alert('حدث خطأ أثناء الاتصال بخدمة تعديل الصور.');
    return null;
  }
}
