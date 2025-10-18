import { useState, useEffect, useRef } from 'react';
import {
  Tabs,
  Stepper,
  TextInput,
  Textarea,
  Button,
  Group,
  Box,
  Card,
  Text,
  Title,
  Badge,
  NumberInput,
  Select,
  MultiSelect,
  Grid,
  Paper,
  Stack,
  Avatar,
  ActionIcon,
  Tooltip,
  Popover,
  Switch,
  Alert,
  Loader,
  Divider,
  Text as MantineText,
  Modal,
} from '@mantine/core';
import {
  IconSearch,
  IconTargetArrow,
  IconEye,
  IconCopy,
  IconCheck,
  IconChartBar,
  IconTemplate,
  IconFileExport,
  IconRobot,
  IconInfoCircle,
  IconWand,
} from '@tabler/icons-react';
import AdAnalytics from './AdAnalytics';
import TemplateLibrary from './TemplateLibrary';
import ExportImport from './ExportImport';
import { openAIService } from '../services/openAIService';
import SuggestionMenu from './SuggestionMenu';

const AdGenerator = () => {
  const DRAFT_KEY = 'adDataDraft_v1';
  const [activeTab, setActiveTab] = useState('search');
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [templateLibraryOpen, setTemplateLibraryOpen] = useState(false);
  const [exportImportOpen, setExportImportOpen] = useState(false);
  const [websiteAnalyzing, setWebsiteAnalyzing] = useState(false);
  const saveTimer = useRef(null);
  // Önizlemede cihaz seçimi kaldırıldı
  // Gelişmiş bölümler için anahtarlar
  const [showExtensions, setShowExtensions] = useState(false); // Sitelink & Callout
  const [showUtm, setShowUtm] = useState(false);
  
  const initialAdData = {
    // Genel bilgiler
    businessName: '',
    website: '',
    industry: '',
    targetAudience: '',
    
    // Arama reklamı
    headlines: ['', '', ''],
    descriptions: ['', ''],
    keywords: '',
    finalUrl: '',
    displayUrl: '',
  sitelinks: ['', '', '', ''],
  callouts: ['', '', '', ''],
  utm: { source: 'google', medium: 'cpc', campaign: '', term: '', content: '' },
    
    // Kampanya bilgileri
    budget: '',
    location: [],
    language: 'tr',
    deviceTargeting: 'all',
  };

  const [adData, setAdData] = useState(initialAdData);
  const [restorePromptOpen, setRestorePromptOpen] = useState(false);
  const draftRef = useRef(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [noDraftInfoOpen, setNoDraftInfoOpen] = useState(false);

  // Taslakta anlamlı içerik var mı?
  const hasAnyContent = (draft) => {
    if (!draft || typeof draft !== 'object') return false;
    const hasText = (v) => typeof v === 'string' && v.trim().length > 0;
    // Temel alanlar
    if (hasText(draft.businessName) || hasText(draft.website) || hasText(draft.industry) || hasText(draft.targetAudience)) return true;
    // Reklam metinleri
    if (Array.isArray(draft.headlines) && draft.headlines.some(hasText)) return true;
    if (Array.isArray(draft.descriptions) && draft.descriptions.some(hasText)) return true;
    if (hasText(draft.keywords) || hasText(draft.finalUrl) || hasText(draft.displayUrl)) return true;
    // Ek uzantılar
    if (Array.isArray(draft.sitelinks) && draft.sitelinks.some(hasText)) return true;
    if (Array.isArray(draft.callouts) && draft.callouts.some(hasText)) return true;
    // UTM
    if (draft.utm && typeof draft.utm === 'object') {
      const src = draft.utm.source?.trim().toLowerCase();
      const med = draft.utm.medium?.trim().toLowerCase();
      const { campaign, term, content } = draft.utm;
      // Kampanya/term/content doluysa içerik say
      if ([campaign, term, content].some(hasText)) return true;
      // source/medium sadece varsayılandan (google/cpc) farklıysa içerik say
      if ((hasText(src) && src !== 'google') || (hasText(med) && med !== 'cpc')) return true;
    }
    // Hedefleme
    if (Array.isArray(draft.location) && draft.location.length > 0) return true;
    if (hasText(draft.budget)) return true;
    // Dil varsayılan 'tr' olduğundan tek başına içerik sayma
    return false;
  };

  // Taslağı güvenli biçimde normalize et
  const sanitizeDraft = (d) => {
    const safe = typeof d === 'object' && d ? d : {};
    const norm = {
      ...initialAdData,
      ...safe,
      headlines: Array.isArray(safe.headlines) ? safe.headlines.slice(0, 3).concat(['', '', '']).slice(0, 3) : ['', '', ''],
      descriptions: Array.isArray(safe.descriptions) ? safe.descriptions.slice(0, 2).concat(['', '']).slice(0, 2) : ['', ''],
      sitelinks: Array.isArray(safe.sitelinks) ? safe.sitelinks.slice(0, 4).concat(['', '', '', '']).slice(0, 4) : ['', '', '', ''],
      callouts: Array.isArray(safe.callouts) ? safe.callouts.slice(0, 4).concat(['', '', '', '']).slice(0, 4) : ['', '', '', ''],
      utm: {
        source: safe?.utm?.source ?? initialAdData.utm.source,
        medium: safe?.utm?.medium ?? initialAdData.utm.medium,
        campaign: safe?.utm?.campaign ?? '',
        term: safe?.utm?.term ?? '',
        content: safe?.utm?.content ?? '',
      },
      location: Array.isArray(safe.location) ? safe.location : [],
      language: typeof safe.language === 'string' ? safe.language : 'tr',
      deviceTargeting: typeof safe.deviceTargeting === 'string' ? safe.deviceTargeting : 'all',
      budget: typeof safe.budget === 'string' || typeof safe.budget === 'number' ? String(safe.budget) : '',
      businessName: typeof safe.businessName === 'string' ? safe.businessName : '',
      website: typeof safe.website === 'string' ? safe.website : '',
      industry: typeof safe.industry === 'string' ? safe.industry : '',
      targetAudience: typeof safe.targetAudience === 'string' ? safe.targetAudience : '',
      keywords: typeof safe.keywords === 'string' ? safe.keywords : '',
      finalUrl: typeof safe.finalUrl === 'string' ? safe.finalUrl : '',
      displayUrl: typeof safe.displayUrl === 'string' ? safe.displayUrl : '',
    };
    return norm;
  };

  // Kayıtlı taslak var mı?
  const hasStoredDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return false;
      const parsed = sanitizeDraft(JSON.parse(saved));
      return hasAnyContent(parsed);
    } catch {
      return false;
    }
  };

  const industryOptions = [
    { value: 'ecommerce', label: 'E-ticaret' },
    { value: 'service', label: 'Hizmet' },
    { value: 'healthcare', label: 'Sağlık' },
    { value: 'education', label: 'Eğitim' },
    { value: 'technology', label: 'Teknoloji' },
    { value: 'real-estate', label: 'Gayrimenkul' },
    { value: 'automotive', label: 'Otomotiv' },
    { value: 'finance', label: 'Finans' },
    { value: 'food', label: 'Gıda & İçecek' },
    { value: 'travel', label: 'Turizm' },
    { value: 'other', label: 'Diğer' },
  ];

  const deviceOptions = [
    { value: 'all', label: 'Tüm Cihazlar' },
    { value: 'desktop', label: 'Masaüstü' },
    { value: 'mobile', label: 'Mobil' },
    { value: 'tablet', label: 'Tablet' },
  ];

  // Türkiye 81 il listesi
  const provinceOptions = [
    'Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkâri','Hatay','Isparta','Mersin','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir','Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman','Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce'
  ].map((name) => ({ value: name, label: name }));

  const steps = [
    { label: 'İşletme Bilgileri', description: 'Temel bilgiler' },
    { label: 'Reklam İçeriği', description: 'Başlık ve açıklama' },
    { label: 'Hedefleme', description: 'Kitle ve konum' },
    { label: 'Önizleme', description: 'Sonuç kontrolü' },
  ];

  // Yardımcı: URL'den domain çıkar
  const getDomain = (url) => {
    try {
      const d = new URL(url).hostname.replace(/^www\./, '');
      return d;
    } catch {
      return url;
    }
  };

  const buildUrlWithUtm = () => {
    const base = adData.finalUrl || adData.website || '';
    if (!base) return '';
    const url = new URL(base, base.startsWith('http') ? undefined : 'https://dummy');
    const params = adData.utm || {};
    Object.entries({ utm_source: params.source, utm_medium: params.medium, utm_campaign: params.campaign, utm_term: params.term, utm_content: params.content })
      .forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
    const result = url.toString();
    return base.startsWith('http') ? result : result.replace('https://dummy', '');
  };

  // Taslak: otomatik kaydet ve ilk açılışta geri yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = sanitizeDraft(JSON.parse(saved));
        if (parsed && typeof parsed === 'object' && hasAnyContent(parsed)) {
          draftRef.current = parsed;
          setRestorePromptOpen(true); // Otomatik yükleme yerine kullanıcıya sor
        } else {
          // Boş veya anlamsız taslakları temizle
          try { localStorage.removeItem(DRAFT_KEY); } catch {}
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        if (hasAnyContent(adData)) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(adData));
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch {}
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [adData]);

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  };

  const handleLoadDraft = () => {
    const draft = sanitizeDraft(draftRef.current);
    if (hasAnyContent(draft)) {
      setAdData(draft);
    } else {
      // Boş taslak durumda uyarıyı kapat ve kaydı temizle
      clearDraft();
    }
    setRestorePromptOpen(false);
  };

  const handleStartFresh = () => {
    clearDraft();
    setAdData(initialAdData);
    setRestorePromptOpen(false);
  };

  const handleInputChange = (field, value, index = null) => {
    if (field === 'headlines' && index !== null) {
      const newHeadlines = [...adData.headlines];
      newHeadlines[index] = value;
      setAdData({ ...adData, headlines: newHeadlines });
    } else if (field === 'descriptions' && index !== null) {
      const newDescriptions = [...adData.descriptions];
      newDescriptions[index] = value;
      setAdData({ ...adData, descriptions: newDescriptions });
    } else {
      setAdData({ ...adData, [field]: value });
    }
  };

  // generateSuggestions kaldırıldı (Alan bazlı öneriler kullanılıyor)

  const handleAISuggestionApply = (type, value, index = null) => {
    if (type === 'headlines' && index !== null) {
      const newHeadlines = [...adData.headlines];
      newHeadlines[index] = value;
      setAdData({ ...adData, headlines: newHeadlines });
    } else if (type === 'descriptions' && index !== null) {
      const newDescriptions = [...adData.descriptions];
      newDescriptions[index] = value;
      setAdData({ ...adData, descriptions: newDescriptions });
    } else if (type === 'keywords') {
      setAdData({ ...adData, keywords: value });
    }
  };

  // Alan bazlı öneri
  const suggestForField = async (type, index = null) => {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      alert('OpenAI API key gerekli. Lütfen .env dosyasına VITE_OPENAI_API_KEY ekleyin.');
      return;
    }
    const context = {
      businessName: adData.businessName || 'İşletme',
      industry: adData.industry || 'other',
      targetAudience: adData.targetAudience || 'Genel müşteri kitlesi',
      website: adData.website || ''
    };
    const res = await openAIService.generateFieldSuggestions({ type, context });
    if (!res.success) {
      alert('Öneri alınamadı: ' + res.error);
      return;
    }
    const suggestions = res.data;
    if (type === 'headline' && index !== null) {
      handleAISuggestionApply('headlines', suggestions[0], index);
    } else if (type === 'description' && index !== null) {
      handleAISuggestionApply('descriptions', suggestions[0], index);
    } else if (type === 'keywords') {
      handleAISuggestionApply('keywords', suggestions.join(', '));
    }
  };

  // Basit bütçe önerici
  const recommendBudget = () => {
    const keywordCount = adData.keywords.split(',').map(k=>k.trim()).filter(Boolean).length || 1;
    const locationFactor = Array.isArray(adData.location) ? Math.max(1, adData.location.length * 0.3) : 1;
    const industryBase = {
      finance: 350, technology: 250, healthcare: 220, education: 180, ecommerce: 160,
      'real-estate': 260, automotive: 240, food: 140, travel: 200, other: 170
    }[adData.industry || 'other'];
    const low = Math.round(industryBase * 0.6 * locationFactor * (1 + (keywordCount-1)*0.05));
    const mid = Math.round(industryBase * 1.0 * locationFactor * (1 + (keywordCount-1)*0.05));
    const high = Math.round(industryBase * 1.5 * locationFactor * (1 + (keywordCount-1)*0.05));
    return { low, mid, high };
  };

  const handleTemplateApply = (template) => {
    setAdData({
      ...adData,
      headlines: template.headlines,
      descriptions: template.descriptions,
      keywords: template.keywords,
      targetAudience: template.targetAudience,
      industry: template.id,
    });
    setCurrentStep(1); // Reklam içeriği adımına git
  };

  const handleImportData = (importedData) => {
    setAdData(importedData);
    setCurrentStep(0); // Baştan başla
  };

  const analyzeWebsite = async () => {
    if (!adData.website.trim()) return;
    
    setWebsiteAnalyzing(true);
    try {
      // OpenAI API key kontrolü
      const hasApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!hasApiKey) {
        alert('OpenAI API key tanımlanmamış. Lütfen .env dosyasına VITE_OPENAI_API_KEY ekleyin.');
        return;
      }
      
      const result = await openAIService.analyzeWebsite(adData.website);

      if (result.success) {
        setAdData({
          ...adData,
          ...result.data
        });
        setCurrentStep(1); // Reklam içeriği adımına git
      } else {
        alert('Web sitesi analizi başarısız oldu: ' + result.error);
      }
    } catch (error) {
      console.error('Analiz hatası:', error);
      alert('Web sitesi analizi sırasında bir hata oluştu.');
    }
    setWebsiteAnalyzing(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderBusinessInfoStep = () => (
    <Stack spacing="md">
      {websiteAnalyzing && (
        <Alert
          icon={<Loader size={16} />}
          title="Web Sitesi Analiz Ediliyor"
          color="blue"
          variant="light"
        >
          <Group spacing="xs">
            <IconRobot size={16} />
            <Text size="sm">
              AI teknolojisi ile web siteniz analiz ediliyor. Form alanları otomatik olarak doldurulacak...
            </Text>
          </Group>
        </Alert>
      )}

      {!import.meta.env.VITE_OPENAI_API_KEY && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="OpenAI API Key Gerekli"
          color="red"
          variant="light"
        >
          <Text size="sm">
            Web sitesi analizi için OpenAI API key gereklidir. 
            Lütfen .env dosyasına VITE_OPENAI_API_KEY ekleyin.
          </Text>
        </Alert>
      )}

      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="İşletme Adı"
            placeholder="Örn: ABC Şirketi"
            value={adData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            required
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Web Sitesi"
            placeholder="https://orneksite.com"
            value={adData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
          />
        </Grid.Col>
      </Grid>

      {adData.website.trim() && (
        <Paper withBorder radius="md" p="md">
          <Group position="apart" align="center">
            <Group>
              <Avatar
                src={`https://www.google.com/s2/favicons?sz=64&domain=${getDomain(adData.website)}`}
                radius="sm"
              />
              <div>
                <Text fw={600}>{getDomain(adData.website)}</Text>
                <Text size="xs" color="dimmed">
                  Bu siteden AI ile başlık, açıklama ve anahtar kelime çıkaracağız.
                </Text>
              </div>
            </Group>
            <Button
              leftIcon={<IconRobot size={16} />}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              onClick={analyzeWebsite}
              loading={websiteAnalyzing}
              disabled={websiteAnalyzing}
            >
              AI ile Web Sitesini Analiz Et
            </Button>
          </Group>
        </Paper>
      )}

      <Select
        label="Sektör"
        placeholder="Sektörünüzü seçin"
        data={industryOptions}
        value={adData.industry}
        onChange={(value) => handleInputChange('industry', value)}
        searchable
      />

      <Textarea
        label="Hedef Kitle"
        placeholder="Kimler için bu hizmeti sunuyorsunuz? (Örn: 25-45 yaş arası teknoloji meraklıları)"
        value={adData.targetAudience}
        onChange={(e) => handleInputChange('targetAudience', e.target.value)}
        minRows={3}
      />
    </Stack>
  );

  const renderAdContentStep = () => (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={4}>Reklam İçeriği</Title>
      </Group>

      <Box>
        <Text size="sm" weight={500} mb="xs">
          Başlıklar (En fazla 30 karakter)
        </Text>
        {adData.headlines.map((headline, index) => (
          <div key={index}>
            <Group spacing="xs" align="flex-end" noWrap>
              <TextInput
                style={{ flex: 1 }}
                placeholder={`Başlık ${index + 1}`}
                value={headline}
                onChange={(e) => handleInputChange('headlines', e.target.value, index)}
                rightSection={
                  <Text size="xs" color={headline.length > 30 ? 'red' : 'gray'}>
                    {headline.length}/30
                  </Text>
                }
              />
              <SuggestionMenu
                type="headline"
                limit={30}
                context={{ businessName: adData.businessName, industry: adData.industry, targetAudience: adData.targetAudience, website: adData.website }}
                onApply={(val) => handleAISuggestionApply('headlines', val, index)}
                disabled={!adData.businessName || !adData.industry}
              />
            </Group>
          </div>
        ))}
      </Box>

      <Box>
        <Text size="sm" weight={500} mb="xs">
          Açıklamalar (En fazla 90 karakter)
        </Text>
        {adData.descriptions.map((description, index) => (
          <div key={index}>
            <Group spacing="xs" align="flex-end" noWrap>
              <Textarea
                style={{ flex: 1 }}
                placeholder={`Açıklama ${index + 1}`}
                value={description}
                onChange={(e) => handleInputChange('descriptions', e.target.value, index)}
                mb="xs"
                minRows={2}
                rightSection={
                  <Text size="xs" color={description.length > 90 ? 'red' : 'gray'}>
                    {description.length}/90
                  </Text>
                }
              />
              <SuggestionMenu
                type="description"
                limit={90}
                context={{ businessName: adData.businessName, industry: adData.industry, targetAudience: adData.targetAudience, website: adData.website }}
                onApply={(val) => handleAISuggestionApply('descriptions', val, index)}
                disabled={!adData.businessName || !adData.industry}
              />
            </Group>
          </div>
        ))}
      </Box>

      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="Son URL"
            placeholder="https://orneksite.com/sayfa"
            value={adData.finalUrl}
            onChange={(e) => handleInputChange('finalUrl', e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Görünen URL"
            placeholder="orneksite.com/sayfa"
            value={adData.displayUrl}
            onChange={(e) => handleInputChange('displayUrl', e.target.value)}
          />
        </Grid.Col>
      </Grid>

      {/* Gelişmiş Bölümler Seçenekleri */}
      <Card withBorder p="md">
        <Stack spacing="sm">
          <Group position="apart" align="center">
            <Group spacing={8}>
              <Switch
                checked={showExtensions}
                onChange={(e) => setShowExtensions(e.currentTarget.checked)}
                label="Reklam Uzantılarını eklemek ister misiniz? (Sitelink & Callout)"
              />
              <Popover position="bottom" withArrow>
                <Popover.Target>
                  <ActionIcon variant="light" color="blue" aria-label="Bilgi">
                    <IconInfoCircle size={16} />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                  <Text size="sm">
                    Sitelink: Reklam altına ek bağlantılar ekler ve CTR’ı artırır. Callout: "Ücretsiz Kargo" gibi kısa fayda vurguları gösterir.
                  </Text>
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Group>

          {showExtensions && (
            <>
              <Divider label="Reklam Uzantıları" />
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" weight={500} mb="xs">Sitelinkler</Text>
                  {adData.sitelinks.map((sl, i) => (
                    <TextInput key={i} placeholder={`Sitelink ${i + 1}`} value={sl} onChange={(e)=>{
                      const arr=[...adData.sitelinks]; arr[i]=e.target.value; setAdData({...adData, sitelinks:arr});
                    }} mb="xs" />
                  ))}
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" weight={500} mb="xs">Callout'lar (kısa vurgu)</Text>
                  {adData.callouts.map((co, i) => (
                    <TextInput key={i} placeholder={`Callout ${i + 1}`} value={co} onChange={(e)=>{
                      const arr=[...adData.callouts]; arr[i]=e.target.value; setAdData({...adData, callouts:arr});
                    }} mb="xs" rightSection={<Text size="xs" color={co.length>25?'red':'gray'}>{co.length}/25</Text>} />
                  ))}
                </Grid.Col>
              </Grid>
            </>
          )}

          <Group position="apart" align="center" mt="xs">
            <Group spacing={8}>
              <Switch
                checked={showUtm}
                onChange={(e) => setShowUtm(e.currentTarget.checked)}
                label="UTM etiketlerini eklemek ister misiniz?"
              />
              <Popover position="bottom" withArrow>
                <Popover.Target>
                  <ActionIcon variant="light" color="blue" aria-label="Bilgi UTM">
                    <IconInfoCircle size={16} />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                  <Text size="sm">
                    UTM, URL’e eklenen izleme etiketleridir (utm_source, utm_medium, vb.). Analytics/CRM’de kampanya performansını ayrıntılı görmenizi sağlar.
                  </Text>
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Group>

          {showUtm && (
            <>
              <Divider label="UTM Oluşturucu" />
              <Grid>
                <Grid.Col span={6}>
                  <TextInput label="utm_source" placeholder="google" value={adData.utm.source} onChange={(e)=>setAdData({...adData, utm:{...adData.utm, source:e.target.value}})} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput label="utm_medium" placeholder="cpc" value={adData.utm.medium} onChange={(e)=>setAdData({...adData, utm:{...adData.utm, medium:e.target.value}})} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput label="utm_campaign" placeholder="brand-search" value={adData.utm.campaign} onChange={(e)=>setAdData({...adData, utm:{...adData.utm, campaign:e.target.value}})} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput label="utm_term" placeholder="anahtar kelime" value={adData.utm.term} onChange={(e)=>setAdData({...adData, utm:{...adData.utm, term:e.target.value}})} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput label="utm_content" placeholder="varyant-a" value={adData.utm.content} onChange={(e)=>setAdData({...adData, utm:{...adData.utm, content:e.target.value}})} />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text size="sm" color="dimmed">Önizleme URL:</Text>
                  <Text size="sm" sx={{wordBreak:'break-all'}}>{buildUrlWithUtm() || '-'}</Text>
                </Grid.Col>
              </Grid>
            </>
          )}
        </Stack>
      </Card>

      <div>
        <Group position="apart" mb={4}>
          <Text size="sm" weight={500}>Anahtar Kelimeler</Text>
          <SuggestionMenu
            type="keywords"
            context={{ businessName: adData.businessName, industry: adData.industry, targetAudience: adData.targetAudience, website: adData.website }}
            onApply={(val) => handleAISuggestionApply('keywords', val)}
            disabled={!adData.businessName || !adData.industry}
          />
        </Group>
        <Textarea
          placeholder="reklam, pazarlama, dijital, çözüm"
          value={adData.keywords}
          onChange={(e) => handleInputChange('keywords', e.target.value)}
          minRows={3}
        />
      </div>
    </Stack>
  );

  const renderTargetingStep = () => (
    <Stack spacing="md">
      <Grid>
        <Grid.Col span={6}>
          <NumberInput
            label="Günlük Bütçe (₺)"
            placeholder="100"
            value={adData.budget}
            onChange={(value) => handleInputChange('budget', value)}
            min={0}
          />
          <Group spacing="xs" mt={6}>
            <Button compact variant="light" onClick={() => {
              const { low, mid, high } = recommendBudget();
              handleInputChange('budget', mid);
              alert(`Önerilen aralık: ₺${low} - ₺${high}. Orta değer (₺${mid}) uygulandı.`);
            }}>
              Bütçe Öner
            </Button>
            <MantineText size="xs" color="dimmed">Sektör, il ve anahtar kelimeye göre</MantineText>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <MultiSelect
            label="Hedef Konum (İl)"
            placeholder="İl seçin (birden çok)"
            data={provinceOptions}
            searchable
            clearable
            value={adData.location}
            onChange={(value) => handleInputChange('location', value)}
            nothingFoundMessage="İl bulunamadı"
          />
        </Grid.Col>
      </Grid>

      <Select
        label="Cihaz Hedeflemesi"
        data={deviceOptions}
        value={adData.deviceTargeting}
        onChange={(value) => handleInputChange('deviceTargeting', value)}
      />

      <Select
        label="Dil"
        data={[
          { value: 'tr', label: 'Türkçe' },
          { value: 'en', label: 'İngilizce' },
          { value: 'de', label: 'Almanca' },
        ]}
        value={adData.language}
        onChange={(value) => handleInputChange('language', value)}
      />
    </Stack>
  );

  const renderPreviewStep = () => (
    <Stack spacing="md">
      <Title order={4}>Reklam Önizlemesi</Title>
      
      <Paper p="md" withBorder radius="md" bg="gray.0">
        <Stack spacing="xs">
          <Group spacing="xs">
            <Badge size="xs" color="green">Reklam</Badge>
            <Text size="xs" color="dimmed">{adData.displayUrl || adData.website}</Text>
          </Group>
          
          {adData.headlines.filter(h => h.trim()).map((headline, index) => (
            <Text key={index} weight={500} color="blue" size="lg">
              {headline}
            </Text>
          ))}
          
          {adData.descriptions.filter(d => d.trim()).map((description, index) => (
            <Text key={index} size="sm" color="dimmed">
              {description}
            </Text>
          ))}
        </Stack>
      </Paper>

      <Group>
        <Button
          leftIcon={<IconCopy size={16} />}
          onClick={() => copyToClipboard(generateAdText())}
          variant={copied ? 'light' : 'filled'}
          color={copied ? 'green' : 'blue'}
        >
          {copied ? 'Kopyalandı!' : 'Reklam Metnini Kopyala'}
        </Button>
      </Group>

      <Paper p="md" withBorder>
        <Title order={5} mb="md">Kampanya Özeti</Title>
        <Grid>
          <Grid.Col span={6}>
            <Text size="sm"><strong>İşletme:</strong> {adData.businessName}</Text>
            <Text size="sm"><strong>Sektör:</strong> {industryOptions.find(opt => opt.value === adData.industry)?.label}</Text>
            <Text size="sm"><strong>Günlük Bütçe:</strong> ₺{adData.budget}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm"><strong>Hedef Konum:</strong> {Array.isArray(adData.location) ? (adData.location.length ? adData.location.join(', ') : '-') : adData.location || '-'}</Text>
            <Text size="sm"><strong>Cihaz:</strong> {deviceOptions.find(opt => opt.value === adData.deviceTargeting)?.label}</Text>
            <Text size="sm"><strong>Anahtar Kelime Sayısı:</strong> {adData.keywords.split(',').filter(k => k.trim()).length}</Text>
            <Text size="sm"><strong>Final URL:</strong> <span style={{wordBreak:'break-all'}}>{adData.finalUrl || '-'}</span></Text>
          </Grid.Col>
        </Grid>
      </Paper>
    </Stack>
  );

  const generateAdText = () => {
    const headlines = adData.headlines.filter(h => h.trim()).join('\n');
    const descriptions = adData.descriptions.filter(d => d.trim()).join('\n');
    const locations = Array.isArray(adData.location) ? adData.location.join(', ') : adData.location;
    
    return `GOOGLE ARAMA REKLAMI
    
BAŞLIKLAR:
${headlines}

AÇIKLAMALAR:  
${descriptions}

SON URL: ${adData.finalUrl}
GÖRÜNEN URL: ${adData.displayUrl}
ANAHTAR KELİMELER: ${adData.keywords}

KAMPANYA BİLGİLERİ:
- İşletme: ${adData.businessName}
- Günlük Bütçe: ₺${adData.budget}
- Hedef Konum: ${locations}
- Cihaz Hedeflemesi: ${deviceOptions.find(opt => opt.value === adData.deviceTargeting)?.label}`;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBusinessInfoStep();
      case 1:
        return renderAdContentStep();
      case 2:
        return renderTargetingStep();
      case 3:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  return (
    <Box w="100%" p="md">
      <Stack spacing="xl">
        <Box>
          <Group position="apart" align="flex-start">
            <div>
              <Title order={2} mb="xs">
                <Group spacing="xs">
                  <IconSearch size={24} />
                  Google Arama Reklamı Oluşturucu
                </Group>
              </Title>
              <Text color="dimmed">
                Etkili Google Ads kampanyanız için profesyonel reklam metinleri oluşturun
              </Text>
            </div>
            <Group spacing="xs">
              <Button
                leftIcon={<IconFileExport size={16} />}
                variant="light"
                color="blue"
                onClick={() => setExportImportOpen(true)}
              >
                Dışa Aktar
              </Button>
              <Button
                leftIcon={<IconTemplate size={16} />}
                variant="light"
                color="violet"
                onClick={() => setTemplateLibraryOpen(true)}
              >
                Şablonlar
              </Button>
              <Button
                variant="light"
                color="red"
                onClick={() => {
                  if (hasStoredDraft()) {
                    setConfirmClearOpen(true);
                  } else {
                    setNoDraftInfoOpen(true);
                  }
                }}
              >
                Taslağı Temizle
              </Button>
            </Group>
          </Group>
        </Box>

  <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="search" icon={<IconSearch size={16} />}>
              Arama Reklamı
            </Tabs.Tab>
            <Tabs.Tab value="analytics" icon={<IconChartBar size={16} />}>
              Analiz & Raporlar
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="search" pt="xl">
            <Card withBorder p="xl">
              <Stepper
                active={currentStep}
                onStepClick={setCurrentStep}
                breakpoint="sm"
                mb="xl"
              >
                {steps.map((step, index) => (
                  <Stepper.Step
                    key={index}
                    label={step.label}
                    description={step.description}
                  />
                ))}
              </Stepper>

              <Box mt="xl">
                {renderCurrentStep()}
              </Box>

              <Group position="apart" mt="xl">
                <Button
                  variant="subtle"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                >
                  Geri
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    İleri
                  </Button>
                ) : (
                  <Button color="teal" onClick={() => setActiveTab('analytics')}>
                    Analiz & Raporlar'a Geç
                  </Button>
                )}
              </Group>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="analytics" pt="xl">
            <AdAnalytics adData={adData} onNavigate={({step})=>{ setActiveTab('search'); if (typeof step==='number') setCurrentStep(step); }} />
          </Tabs.Panel>
        </Tabs>

        {/* Alan bazlı öneriler (sihirli değnek) dışında ayrı AI modalı kaldırıldı */}

        <TemplateLibrary
          isOpen={templateLibraryOpen}
          onClose={() => setTemplateLibraryOpen(false)}
          onTemplateApply={handleTemplateApply}
        />

        <ExportImport
          isOpen={exportImportOpen}
          onClose={() => setExportImportOpen(false)}
          adData={adData}
          onImportData={handleImportData}
        />

        {/* Taslak geri yükleme sorusu */}
        <Modal opened={restorePromptOpen} onClose={handleStartFresh} title="Taslak bulundu" centered>
          <Stack>
            <Text size="sm">Önceki çalışmanız otomatik kaydedilmiş. Bu taslağı yüklemek ister misiniz?</Text>
            <Group position="apart" mt="sm">
              <Button variant="default" onClick={handleStartFresh}>Boş Başla</Button>
              <Button color="blue" onClick={handleLoadDraft}>Taslağı Yükle</Button>
            </Group>
          </Stack>
        </Modal>

        {/* Taslak temizleme onayı */}
        <Modal opened={confirmClearOpen} onClose={() => setConfirmClearOpen(false)} title="Taslak silinsin mi?" centered>
          <Stack>
            <Text size="sm">Taslak silinecektir. Bu işlem geri alınamaz. Emin misiniz?</Text>
            <Group position="apart" mt="sm">
              <Button variant="default" onClick={() => setConfirmClearOpen(false)}>Vazgeç</Button>
              <Button color="red" onClick={() => { clearDraft(); setAdData(initialAdData); setConfirmClearOpen(false); }}>Evet, Sil</Button>
            </Group>
          </Stack>
        </Modal>

        {/* Taslak bulunamadı bilgisi */}
        <Modal opened={noDraftInfoOpen} onClose={() => setNoDraftInfoOpen(false)} title="Taslak bulunamadı" centered>
          <Stack>
            <Text size="sm">Silinecek taslak bulunamamıştır.</Text>
            <Group position="right" mt="sm">
              <Button onClick={() => setNoDraftInfoOpen(false)}>Tamam</Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Box>
  );
};

export default AdGenerator;