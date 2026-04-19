import { GoogleGenAI } from '@google/genai';
import { ProjectData } from '../types';

export async function generateSuggestion(context: string, type: 'narrative' | 'dialogue', project?: ProjectData): Promise<string | null> {
  try {
    const settingsStr = localStorage.getItem('hikaya_ai_settings');
    let apiKey = process.env.GEMINI_API_KEY; // fallback
    let modelName = 'gemini-2.5-flash';

    if (settingsStr) {
      try {
        const settings = JSON.parse(settingsStr);
        if (settings.apiKey) apiKey = settings.apiKey;
        if (settings.modelName) modelName = settings.modelName;
      } catch (e) {
         console.warn("Failed to parse settings", e);
      }
    }

    if (!apiKey) {
      alert("الرجاء إضافة مفتاح API الخاص بـ Gemini من إعدادات التطبيق لتمكين ميزات الذكاء الاصطناعي.");
      return null;
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    let fullContext = '';
    if (project) {
        fullContext = `
معلومات حول عالم القصة:
اسم الرواية: ${project.name || 'بدون اسم'}
السيناريو الأساسي: ${project.scenario || 'غير محدد'}
الشخصيات: ${project.characters?.map(c => `- ${c.name} (${c.details})`).join('\n') || 'لا يوجد'}
النقابات/الممالك: ${project.factions?.map(f => `- ${f.name} (${f.type})`).join('\n') || 'لا يوجد'}
المواقع الجغرافية: ${project.worldMap?.map(l => `- ${l.name} (${l.type}): ${l.description}`).join('\n') || 'لا يوجد'}
`;
    }

    const commandPrompt = context.trim() 
      ? `السياق الحالي أو النص المراد التعامل معه: "${context}"\n\nالمطلوب: بناءً على هذا النص وعلى معلومات عالم القصة، قم بتقديم الإضافة الدقيقة بأفضل جودة تناسب القصة.` 
      : "اقترح فكرة مميزة لجملة واحدة لقصة مصورة مانهوا مبنية على عوالم القصة الحالية المحفوظة.";
      
    const systemInstruction = type === 'narrative' 
      ? `أنت كاتب سيناريو لروايات مصورة مانهوا. قدم فقرة سردية واحدة تصف المشهد أو الأحداث الدائرة باستيعاب كامل لعالم القصة وشخصياتها، بدون كلام زائد أو مقدمات.\n${fullContext}`
      : `أنت كاتب سيناريوهات مانهوا. قدم جملة حوار واحدة لشخصية تنبض بالحياة متوافقة مع القصة والشخصيات، بدون مقدمات أو أقواس وصفية أو شرح.\n${fullContext}`;

    const response = await ai.models.generateContent({
        model: modelName,
        contents: commandPrompt,
        config: {
            systemInstruction,
            temperature: 0.8
        }
    });

    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    alert('تعذر جلب الاقتراح، الرجاء التحقق من صحة مفتاح API واسم النموذج.');
    return null;
  }
}
