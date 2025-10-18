class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async analyzeWebsite(url) {
    try {


      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Sen bir dijital pazarlama uzmanısın. Web sitelerini analiz ederek Google Ads reklamları oluşturuyorsun.

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir metin ekleme:

{
  "businessName": "şirket adı",
  "industry": "ecommerce|service|healthcare|education|technology|real-estate|automotive|finance|food|travel|other",
  "targetAudience": "hedef kitle tanımı",
  "headlines": ["başlık 1 (max 30 kar)", "başlık 2 (max 30 kar)", "başlık 3 (max 30 kar)"],
  "descriptions": ["açıklama 1 (max 90 karakter)", "açıklama 2 (max 90 karakter)"],
  "keywords": "anahtar kelime1, anahtar kelime2, anahtar kelime3",
  "displayUrl": "domain.com"
}`
            },
            {
              role: 'user',
              content: `Web sitesi: ${url}\n\nBu web sitesini analiz ederek yukarıdaki JSON formatında Google Ads reklam verilerini oluştur. Türkçe içerik oluştur.`
            }
          ],
          response_format: {
            type: 'json_object'
          },
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Response kontrolü
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API response formatı geçersiz');
      }

      let parsedData = null;

      // Message content'i parse et
      try {
        const content = data.choices[0].message.content;
        if (content) {
          parsedData = JSON.parse(content);
        }
      } catch (e) {
        console.error('JSON parse hatası:', e);
        console.log('Raw response:', data.choices[0].message.content);
      }

      // Eğer parse edilemezse hata döndür
      if (!parsedData || !parsedData.businessName) {
        throw new Error('OpenAI API\'den geçersiz yanıt alındı. Lütfen tekrar deneyin.');
      }

      // Veriyi normalize et ve validate et
      return {
        success: true,
        data: {
          businessName: parsedData.businessName || 'Bilinmeyen İşletme',
          industry: parsedData.industry || 'other',
          targetAudience: parsedData.targetAudience || 'Genel müşteri kitlesi',
          headlines: Array.isArray(parsedData.headlines) && parsedData.headlines.length >= 3 
            ? parsedData.headlines.slice(0, 3) 
            : ['Güvenilir Hizmet', 'Kaliteli Çözümler', 'Profesyonel Yaklaşım'],
          descriptions: Array.isArray(parsedData.descriptions) && parsedData.descriptions.length >= 2
            ? parsedData.descriptions.slice(0, 2)
            : ['Uzman ekibimizle size özel çözümler sunuyoruz.', 'Memnuniyet garantisi ile hizmetinizdeyiz.'],
          keywords: parsedData.keywords || 'hizmet, kalite, güvenilir',
          website: url,
          finalUrl: url,
          displayUrl: parsedData.displayUrl || this.extractDomainFromUrl(url)
        }
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        success: false,
        error: error.message || 'API isteği başarısız oldu'
      };
    }
  }

  async generateQuickSuggestions(data) {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key tanımlanmamış'
      };
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Sen bir Google Ads uzmanısın. Verilen bilgilere göre etkili reklam başlıkları ve açıklamaları oluştur.

SADECE aşağıdaki JSON formatında yanıt ver:

{
  "headlines": ["başlık 1 (max 30 kar)", "başlık 2 (max 30 kar)", "başlık 3 (max 30 kar)"],
  "descriptions": ["açıklama 1 (max 90 karakter)", "açıklama 2 (max 90 karakter)"],
  "keywords": "anahtar kelime1, anahtar kelime2, anahtar kelime3"
}`
            },
            {
              role: 'user',
              content: `İşletme: ${data.businessName}
Sektör: ${data.industry}
Hedef Kitle: ${data.targetAudience}
Web Site: ${data.website}

Bu bilgilere göre Google Ads için etkili başlık ve açıklamalar oluştur. Türkçe olsun.`
            }
          ],
          response_format: {
            type: 'json_object'
          },
          temperature: 0.8,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const apiData = await response.json();

      if (!apiData.choices || !apiData.choices[0] || !apiData.choices[0].message) {
        throw new Error('API response formatı geçersiz');
      }

      let parsedData = null;
      try {
        const content = apiData.choices[0].message.content;
        if (content) {
          parsedData = JSON.parse(content);
        }
      } catch (e) {
        console.error('JSON parse hatası:', e);
        throw new Error('API yanıtı parse edilemedi');
      }

      if (!parsedData || !parsedData.headlines) {
        throw new Error('API\'den geçersiz veri alındı');
      }

      return {
        success: true,
        data: {
          headlines: Array.isArray(parsedData.headlines) && parsedData.headlines.length >= 3 
            ? parsedData.headlines.slice(0, 3) 
            : ['Güvenilir Hizmet', 'Kaliteli Çözümler', 'Profesyonel Yaklaşım'],
          descriptions: Array.isArray(parsedData.descriptions) && parsedData.descriptions.length >= 2
            ? parsedData.descriptions.slice(0, 2)
            : ['Uzman ekibimizle hizmetinizdeyiz.', 'Kaliteli hizmet garantisi.'],
          keywords: parsedData.keywords || 'hizmet, kalite, güvenilir'
        }
      };

    } catch (error) {
      console.error('Quick Suggestions API Error:', error);
      return {
        success: false,
        error: error.message || 'Öneri oluşturulamadı'
      };
    }
  }

  async generateFieldSuggestions({ type, context }) {
    if (!this.apiKey) {
      return { success: false, error: 'OpenAI API key tanımlanmamış' };
    }

    const limits = type === 'headline' ? 30 : type === 'description' ? 90 : 0;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Google Ads için alan bazlı öneriler üret.
Sadece şu JSON formatında cevap ver:
{ "suggestions": ["değer 1", "değer 2", "değer 3"] }
- Tür: ${type}
- Kısıt: ${limits > 0 ? `${limits} karakteri geçme` : 'anahtar kelimeleri virgülle döndür'}
- Dil: Türkçe`
            },
            {
              role: 'user',
              content: `İşletme: ${context.businessName}\nSektör: ${context.industry}\nHedef Kitle: ${context.targetAudience}\nWeb Site: ${context.website}\nTür: ${type}. 3 adet güçlü öneri üret.`
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 400,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status}`);
      }

      const apiData = await response.json();
      const content = apiData?.choices?.[0]?.message?.content;
      const parsed = content ? JSON.parse(content) : null;
      const items = Array.isArray(parsed?.suggestions) ? parsed.suggestions.filter(Boolean) : [];
      if (items.length === 0) throw new Error('Öneri alınamadı');

      return { success: true, data: items.slice(0, 3) };
    } catch (error) {
      console.error('Field Suggestions API Error:', error);
      return { success: false, error: error.message || 'Öneri alınamadı' };
    }
  }



  guessIndustryFromDomain(domain) {
    const keywords = {
      'shop': 'ecommerce',
      'store': 'ecommerce',
      'market': 'ecommerce',
      'health': 'healthcare',
      'medical': 'healthcare',
      'clinic': 'healthcare',
      'hospital': 'healthcare',
      'edu': 'education',
      'school': 'education',
      'university': 'education',
      'tech': 'technology',
      'software': 'technology',
      'digital': 'technology',
      'car': 'automotive',
      'auto': 'automotive',
      'real': 'real-estate',
      'estate': 'real-estate',
      'property': 'real-estate',
      'travel': 'travel',
      'tour': 'travel',
      'hotel': 'travel',
      'bank': 'finance',
      'finance': 'finance',
      'food': 'food',
      'restaurant': 'food'
    };

    for (const [keyword, industry] of Object.entries(keywords)) {
      if (domain.toLowerCase().includes(keyword)) {
        return industry;
      }
    }

    return 'other';
  }

  extractDomainFromUrl(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      // URL geçersizse basit string işlemi yap
      return url.replace(/https?:\/\//g, '').replace('www.', '').split('/')[0];
    }
  }
}

// OpenAI API key'ini environment variable'dan al veya boş bırak
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export const openAIService = new OpenAIService(OPENAI_API_KEY);

export default OpenAIService;