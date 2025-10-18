import {
  Card,
  Text,
  Progress,
  Group,
  Badge,
  Stack,
  Title,
  Grid,
  RingProgress,
  ThemeIcon,
  Button,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconTarget,
  IconEye,
  IconClick,
  IconAlertCircle,
  IconCheck,
  IconCurrencyLira,
} from '@tabler/icons-react';

const AdAnalytics = ({ adData, onNavigate }) => {
  // Reklam kalite skoru: içerik + hedefleme + bütçe (toplam 100)
  const calculateQualityScore = () => {
    let score = 0;

    // Başlıklar (35)
    const filledHeadlines = adData.headlines.filter(h => h.trim()).length;
    score += (filledHeadlines / 3) * 35;

    // Açıklamalar (25)
    const filledDescriptions = adData.descriptions.filter(d => d.trim()).length;
    score += (filledDescriptions / 2) * 25;

    // Anahtar kelimeler (20)
    const keywordCount = adData.keywords.split(',').filter(k => k.trim()).length;
    if (keywordCount >= 10) score += 20;
    else if (keywordCount >= 5) score += 15;
    else if (keywordCount >= 1) score += 10;

    // URL'ler (8)
    if (adData.finalUrl) score += 5;
    if (adData.displayUrl) score += 3;

    // Hedefleme (7): Konum ve cihaz
    const hasLocation = Array.isArray(adData.location) ? adData.location.length > 0 : !!adData.location;
    if (hasLocation) score += 5;
    if (adData.deviceTargeting && adData.deviceTargeting !== 'all') score += 2;

    // Bütçe (5): mevcutsa puan
    const budgetNum = Number(adData.budget);
    if (Number.isFinite(budgetNum) && budgetNum > 0) score += 5;

    return Math.round(Math.min(100, score));
  };

  const qualityScore = calculateQualityScore();
  const filledHeadlines = adData.headlines.filter(h => h.trim()).length;

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Zayıf';
  };

  // Veri yeterliliği ve deterministik tahminler
  const cleanKeywords = adData.keywords.split(',').map(k=>k.trim()).filter(Boolean);
  const hasSufficientData = filledHeadlines > 0 && adData.descriptions.filter(d=>d.trim()).length > 0 && cleanKeywords.length > 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const parseBudget = (b) => {
    if (b === null || b === undefined || b === '') return 0;
    const n = Number(b);
    return Number.isFinite(n) ? n : 0;
  };

  const industryCpcAdd = (() => {
    switch (adData.industry) {
      case 'finance': return 2.0;
      case 'technology': return 1.2;
      case 'healthcare': return 1.0;
      case 'education': return 0.7;
      case 'ecommerce': return 0.5;
      default: return 0.8;
    }
  })();

  // CTR: 0.5% – 10% arası, kalite skoruna ve CTA varlığına göre
  const hasCtaWord = adData.headlines.some(h=>/\b(ücretsiz|indirim|hemen|bugün|fırsat|keşfet|satın al)\b/i.test(h));
  const ctr = clamp(0.8 + (qualityScore * 0.07) + (hasCtaWord ? 0.6 : 0), 0.5, 10.0);

  // CPC: 0.8 – 12 TL arası, kalite skoru yükseldikçe düşer, sektöre göre artar
  const cpc = clamp(1.2 + (80 - qualityScore) * 0.03 + industryCpcAdd + (cleanKeywords.length > 10 ? 0.4 : 0), 0.8, 12.0);

  // Bütçe varsa tıklama ve gösterim tahmini (aylık)
  const budget = parseBudget(adData.budget);
  const clicksMonthly = budget > 0 && hasSufficientData ? Math.max(0, Math.round((budget / cpc) * 30)) : null;
  const impressionsMonthly = clicksMonthly !== null ? Math.max(0, Math.round(clicksMonthly / (ctr / 100))) : null;

  const estimatedMetrics = clicksMonthly === null ? null : {
    ctr: ctr.toFixed(2),
    impressions: impressionsMonthly,
    clicks: clicksMonthly,
    cpc: cpc.toFixed(2),
  };

  // Gelir tahmini: sektör bazlı varsayılan CR ve sipariş/lead değeri
  const baseCrByIndustry = {
    ecommerce: 2.0,
    service: 4.0,
    healthcare: 3.0,
    education: 3.5,
    technology: 2.5,
    finance: 5.0,
    other: 2.5,
  };
  const valueByIndustry = {
    ecommerce: 700,
    service: 350,
    healthcare: 500,
    education: 800,
    technology: 1500,
    finance: 1000,
    other: 600,
  };

  const baseCr = baseCrByIndustry[adData.industry || 'other'] ?? baseCrByIndustry.other;
  const avgValue = valueByIndustry[adData.industry || 'other'] ?? valueByIndustry.other;
  // Kalite skoruna göre CR ayarı: her 10 puan +0.5 puan
  const adjustedCr = clamp(baseCr + Math.max(0, (qualityScore - 60)) * 0.05, baseCr * 0.8, baseCr * 1.8);
  const revenueMonthly = estimatedMetrics ? Math.round(estimatedMetrics.clicks * (adjustedCr / 100) * avgValue) : null;
  const costMonthly = estimatedMetrics ? Math.round(estimatedMetrics.clicks * parseFloat(estimatedMetrics.cpc)) : null;
  const roas = revenueMonthly && costMonthly && costMonthly > 0 ? (revenueMonthly / costMonthly).toFixed(1) : null;

  const recommendations = [];
  
  // Öneri sistemi
  if (adData.headlines.filter(h => h.trim()).length < 3) {
    recommendations.push({
      type: 'warning',
      message: 'En az 3 başlık eklemeniz önerilir',
      icon: IconAlertCircle
    });
  }

  if (adData.descriptions.filter(d => d.trim()).length < 2) {
    recommendations.push({
      type: 'warning', 
      message: 'En az 2 açıklama eklemeniz önerilir',
      icon: IconAlertCircle
    });
  }

  if (cleanKeywords.length < 5) {
    recommendations.push({
      type: 'warning',
      message: `Anahtar kelime sayısı az (${cleanKeywords.length}). En az 5-10 arası kelime ekleyin. Örn: marka, ürün tipi, fiyat/avantaj, şehir`,
      icon: IconAlertCircle
    });
  }

  if (adData.headlines.some(h => h.length > 30)) {
    recommendations.push({
      type: 'error',
      message: 'Bazı başlıklar 30 karakteri aşıyor. Örn: “Ücretsiz Kargo – Bugün Sipariş Verin”',
      icon: IconAlertCircle
    });
  }

  if (adData.descriptions.some(d => d.length > 90)) {
    recommendations.push({
      type: 'error',
      message: 'Bazı açıklamalar 90 karakteri aşıyor. CTA ekleyin: “Hemen İncele”, “%20 İndirim”',
      icon: IconAlertCircle
    });
  }

  // İçerik niteliğine göre öneriler
  if (!adData.finalUrl) {
    recommendations.push({ type: 'warning', message: 'Son URL boş. Reklam tıklaması nereye gidecek?', icon: IconAlertCircle });
  }
  if (!adData.displayUrl) {
    recommendations.push({ type: 'warning', message: 'Görünen URL ekleyin (güven verir ve kalite puanını artırır).', icon: IconAlertCircle });
  }
  if (filledHeadlines === 3 && !adData.headlines.some(h=>/\b(ücretsiz|indirim|hemen|bugün|fırsat)\b/i.test(h))) {
    recommendations.push({ type: 'info', message: 'Başlıklarda güçlü bir CTA veya fayda odaklı kelime kullanın (Örn: Ücretsiz, İndirim, Hemen).', icon: IconCheck });
  }
  if (cleanKeywords.length >= 5 && !cleanKeywords.some(k=>/marka|ürün|şehir|fiyat/i.test(k))) {
    recommendations.push({ type: 'info', message: 'Anahtar kelimelere marka, ürün tipi ve şehir varyasyonları ekleyin.', icon: IconCheck });
  }

  return (
    <Stack spacing="lg">
      <Title order={3}>Reklam Analizi</Title>

      {/* Yayıma Hazırlık Checklist (iki sütun) */}
      <Card withBorder p="lg">
        <Title order={4} mb="sm">Yayıma Hazırlık Checklist</Title>
        <Grid gutter="sm">
          {[
            { ok: !!adData.finalUrl, label: 'Son URL girildi', step: 1 },
            { ok: filledHeadlines >= 1, label: 'En az 1 başlık', step: 1 },
            { ok: adData.descriptions.filter(d=>d.trim()).length >= 1, label: 'En az 1 açıklama', step: 1 },
            { ok: adData.keywords.split(',').map(k=>k.trim()).filter(Boolean).length >= 1, label: 'En az 1 anahtar kelime', step: 1 },
            { ok: !!adData.budget, label: 'Bütçe belirlendi', step: 2 },
          ].map((c, i) => (
            <Grid.Col span={6} key={i}>
              <Group position="apart">
                <Group spacing="xs">
                  <Badge color={c.ok ? 'teal' : 'red'} variant="light">{c.ok ? 'Tamam' : 'Eksik'}</Badge>
                  <Text>{c.label}</Text>
                </Group>
                {!c.ok && (
                  <Button size="xs" variant="light" onClick={()=>onNavigate?.({step:c.step})}>Düzelt</Button>
                )}
              </Group>
            </Grid.Col>
          ))}
        </Grid>
      </Card>

      {/* Kalite Skoru */}
      <Card withBorder p="lg">
        <Grid align="center">
          <Grid.Col span={6}>
            <Group position="left" align="center">
              <div>
                <Text size="lg" weight={600}>Kalite Skoru</Text>
                <Text size="sm" color="dimmed">Reklam performans tahmini</Text>
              </div>
              <RingProgress
                size={120}
                thickness={12}
                sections={[{ value: qualityScore, color: getScoreColor(qualityScore) }]}
                label={
                  <div style={{ textAlign: 'center' }}>
                    <Text weight={700} size="lg">{qualityScore}</Text>
                    <Text size="xs" color="dimmed">{getScoreLabel(qualityScore)}</Text>
                  </div>
                }
              />
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack spacing={6}>
              {[
                {
                  label: 'Başlıklar',
                  color: 'blue',
                  value: `${Math.round((filledHeadlines/3)*35)}/35`,
                },
                {
                  label: 'Açıklamalar',
                  color: 'violet',
                  value: `${Math.round((adData.descriptions.filter(d=>d.trim()).length/2)*25)}/25`,
                },
                {
                  label: 'Anahtar Kelimeler',
                  color: 'green',
                  value: `${(() => { const kc=adData.keywords.split(',').map(k=>k.trim()).filter(Boolean).length; return kc>=10?20:kc>=5?15:kc>=1?10:0; })()}/20`,
                },
                {
                  label: 'URL',
                  color: 'gray',
                  value: `${(adData.finalUrl?5:0)+(adData.displayUrl?3:0)}/8`,
                },
                {
                  label: 'Hedefleme',
                  color: 'teal',
                  value: `${(Array.isArray(adData.location)?(adData.location.length>0?5:0):adData.location?5:0) + (adData.deviceTargeting && adData.deviceTargeting!=='all'?2:0)}/7`,
                },
                {
                  label: 'Bütçe',
                  color: 'orange',
                  value: `${(Number.isFinite(Number(adData.budget)) && Number(adData.budget)>0)?5:0}/5`,
                },
              ]
                .sort((a, b) => a.label.length - b.label.length)
                .map((item, idx) => (
                  <Group spacing={8} key={idx}>
                    <Badge color={item.color} variant="light">{item.label}</Badge>
                    <Text size="sm">{item.value}</Text>
                  </Group>
                ))}
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Tahmini Metrikler */}
      <Grid>
        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Group spacing="xs" mb="xs">
              <ThemeIcon variant="light" color="blue">
                <IconEye size={16} />
              </ThemeIcon>
              <Text size="sm" weight={500}>Tahmini Görüntüleme</Text>
            </Group>
            {estimatedMetrics ? (
              <>
                <Text size="xl" weight={700}>{estimatedMetrics.impressions.toLocaleString()}</Text>
                <Text size="xs" color="dimmed">aylık</Text>
              </>
            ) : (
              <Text size="sm" color="dimmed">Veri yetersiz</Text>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Group spacing="xs" mb="xs">
              <ThemeIcon variant="light" color="green">
                <IconClick size={16} />
              </ThemeIcon>
              <Text size="sm" weight={500}>Tahmini Tıklama</Text>
            </Group>
            {estimatedMetrics ? (
              <>
                <Text size="xl" weight={700}>{estimatedMetrics.clicks.toLocaleString()}</Text>
                <Text size="xs" color="dimmed">aylık</Text>
              </>
            ) : (
              <Text size="sm" color="dimmed">Veri yetersiz</Text>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Group spacing="xs" mb="xs">
              <ThemeIcon variant="light" color="orange">
                <IconTrendingUp size={16} />
              </ThemeIcon>
              <Text size="sm" weight={500}>Tahmini CTR</Text>
            </Group>
            {estimatedMetrics ? (
              <>
                <Text size="xl" weight={700}>%{estimatedMetrics.ctr}</Text>
                <Text size="xs" color="dimmed">tıklama oranı</Text>
              </>
            ) : (
              <Text size="sm" color="dimmed">Veri yetersiz</Text>
            )}
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Group spacing="xs" mb="xs">
              <ThemeIcon variant="light" color="violet">
                <IconTarget size={16} />
              </ThemeIcon>
              <Text size="sm" weight={500}>Tahmini CPC</Text>
            </Group>
            {estimatedMetrics ? (
              <>
                <Text size="xl" weight={700}>₺{estimatedMetrics.cpc}</Text>
                <Text size="xs" color="dimmed">tıklama başına</Text>
              </>
            ) : (
              <Text size="sm" color="dimmed">Veri yetersiz</Text>
            )}
          </Card>
        </Grid.Col>

        {/* Gelir Tahmini */}
        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Group spacing="xs" mb="xs">
              <ThemeIcon variant="light" color="teal">
                <IconCurrencyLira size={16} />
              </ThemeIcon>
              <Text size="sm" weight={500}>Tahmini Gelir</Text>
            </Group>
            {estimatedMetrics ? (
              <>
                <Text size="xl" weight={700}>₺{revenueMonthly?.toLocaleString?.() ?? '0'}</Text>
                <Text size="xs" color="dimmed">aylık {roas ? `(ROAS ~ ${roas}x)` : ''}</Text>
              </>
            ) : (
              <Text size="sm" color="dimmed">Veri yetersiz</Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      {/* Karakter Analizi */}
      <Card withBorder p="lg">
        <Title order={4} mb="md">Karakter Analizi (ideal uzunluklar)</Title>
        <Stack spacing="md">
          {adData.headlines.map((headline, index) => {
            if (!headline.trim()) return null;
            const len = headline.length;
            const percent = (len / 30) * 100;
            const status = len > 30 ? 'Aşıyor' : len >= 22 ? 'İyi' : 'Kısa';
            const color = len > 30 ? 'red' : len >= 22 ? 'teal' : 'yellow';
            return (
              <div key={`headline-${index}`}>
                <Group position="apart" mb={4}>
                  <Text size="sm" weight={500}>Başlık {index + 1}</Text>
                  <Badge color={color} variant="light">{status} • {len}/30</Badge>
                </Group>
                <Progress value={percent} color={color} size="sm" />
                <Text size="xs" color="dimmed" mt={4}>İdeal: 22-30 karakter, güçlü CTA önerilir.</Text>
              </div>
            );
          })}

          {adData.descriptions.map((description, index) => {
            if (!description.trim()) return null;
            const len = description.length;
            const percent = (len / 90) * 100;
            const status = len > 90 ? 'Aşıyor' : len >= 70 ? 'İyi' : 'Kısa';
            const color = len > 90 ? 'red' : len >= 70 ? 'teal' : 'yellow';
            return (
              <div key={`description-${index}`}>
                <Group position="apart" mb={4}>
                  <Text size="sm" weight={500}>Açıklama {index + 1}</Text>
                  <Badge color={color} variant="light">{status} • {len}/90</Badge>
                </Group>
                <Progress value={percent} color={color} size="sm" />
                <Text size="xs" color="dimmed" mt={4}>İdeal: 70-90 karakter, fayda + CTA önerilir.</Text>
              </div>
            );
          })}
        </Stack>
      </Card>

      {/* Öneriler */}
      {recommendations.length > 0 && (
        <Card withBorder p="lg">
          <Title order={4} mb="md">Öneriler</Title>
          <Stack spacing="sm">
            {recommendations.map((rec, index) => (
              <Group key={index} spacing="xs" align="flex-start">
                <ThemeIcon
                  size="sm"
                  variant="light"
                  color={rec.type === 'success' ? 'green' : rec.type === 'error' ? 'red' : rec.type === 'info' ? 'blue' : 'yellow'}
                >
                  <rec.icon size={14} />
                </ThemeIcon>
                <Text size="sm">{rec.message}</Text>
              </Group>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default AdAnalytics;