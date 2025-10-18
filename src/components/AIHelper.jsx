import { useState } from 'react';
import {
  Modal,
  Button,
  Stack,
  Text,
  Textarea,
  Group,
  Title,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconBulb, IconCopy, IconCheck } from '@tabler/icons-react';

const AIHelper = ({ isOpen, onClose, adData, onSuggestionApply }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState({});

  const generateAISuggestions = () => {
    setLoading(true);
    
    // AI önerileri simülasyonu
    setTimeout(() => {
      const aiSuggestions = {
        headlines: [
          `${adData.businessName} - ${getIndustryKeyword(adData.industry)} Lideri`,
          `En Uygun ${getIndustryKeyword(adData.industry)} Çözümleri`,
          `${adData.businessName} ile %50 Tasarruf`,
          `Profesyonel ${getIndustryKeyword(adData.industry)} Hizmeti`,
          `${adData.businessName} - Güvenilir Partner`,
        ],
        descriptions: [
          `${adData.businessName} ile ${getIndustryKeyword(adData.industry)} alanında uzman hizmet alın. 10+ yıl deneyim, uygun fiyat garantisi.`,
          `Size özel ${getIndustryKeyword(adData.industry)} çözümleri sunuyoruz. Ücretsiz danışmanlık ve hızlı teslimat için hemen arayın.`,
          `${adData.targetAudience} için özel tasarlanmış hizmetlerimizi keşfedin. 7/24 destek ve memnuniyet garantisi.`,
        ],
        keywords: generateKeywordSuggestions(adData.industry, adData.businessName),
        tips: [
          'Başlıklarınızda güçlü eylem kelimeleri kullanın',
          'Rakamlar ve yüzdeler dikkat çeker',
          'Yerel hedefleme için şehir adları ekleyin',
          'Aciliyet yaratan kelimeler kullanın (bugün, hemen, şimdi)',
          'Benzersiz değer önerilerinizi vurgulayın',
        ]
      };
      
      setSuggestions(aiSuggestions);
      setLoading(false);
    }, 2000);
  };

  const getIndustryKeyword = (industry) => {
    const keywords = {
      'ecommerce': 'E-ticaret',
      'service': 'Hizmet',
      'healthcare': 'Sağlık',
      'education': 'Eğitim',
      'technology': 'Teknoloji',
      'real-estate': 'Gayrimenkul',
      'automotive': 'Otomotiv',
      'finance': 'Finans',
      'food': 'Gıda',
      'travel': 'Turizm',
      'other': 'İş'
    };
    return keywords[industry] || 'İş';
  };

  const generateKeywordSuggestions = (industry, businessName) => {
    const baseKeywords = {
      'ecommerce': ['online alışveriş', 'e-ticaret', 'uygun fiyat', 'hızlı kargo', 'güvenli ödeme'],
      'service': ['profesyonel hizmet', 'uzman ekip', 'kaliteli hizmet', 'güvenilir', 'deneyimli'],
      'healthcare': ['sağlık hizmeti', 'doktor', 'tedavi', 'sağlıklı yaşam', 'tıbbi danışman'],
      'education': ['eğitim', 'kurs', 'öğrenme', 'sertifika', 'uzaktan eğitim'],
      'technology': ['teknoloji', 'yazılım', 'dijital çözüm', 'IT hizmeti', 'sistem'],
    };
    
    const industryKeywords = baseKeywords[industry] || ['hizmet', 'kalite', 'profesyonel'];
    const businessKeywords = businessName.toLowerCase().split(' ');
    
    return [...industryKeywords, ...businessKeywords, 'istanbul', 'ankara', 'izmir'].join(', ');
  };

  const copyText = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => {
      setCopied({ ...copied, [type]: false });
    }, 2000);
  };

  const applySuggestion = (type, value, index = null) => {
    onSuggestionApply(type, value, index);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group spacing="xs">
          <IconBulb size={20} />
          <Text weight={600}>AI Önerileri</Text>
        </Group>
      }
      size="xl"
      centered
    >
      <Stack spacing="md">
        {!suggestions && !loading && (
          <Group position="center">
            <Button
              onClick={generateAISuggestions}
              size="lg"
              leftIcon={<IconBulb size={18} />}
            >
              AI Önerilerini Oluştur
            </Button>
          </Group>
        )}

        {loading && (
          <Group position="center" py="xl">
            <Text>AI önerileri oluşturuluyor...</Text>
          </Group>
        )}

        {suggestions && (
          <Stack spacing="lg">
            {/* Başlık Önerileri */}
            <div>
              <Title order={4} mb="md">Başlık Önerileri</Title>
              <Stack spacing="xs">
                {suggestions.headlines.map((headline, index) => (
                  <Group key={index} position="apart" p="xs" sx={{ border: '1px solid #e9ecef', borderRadius: 4 }}>
                    <Text size="sm">{headline}</Text>
                    <Group spacing="xs">
                      <Tooltip label="Kopyala">
                        <ActionIcon
                          size="sm"
                          onClick={() => copyText(headline, `headline-${index}`)}
                          color={copied[`headline-${index}`] ? 'green' : 'blue'}
                        >
                          {copied[`headline-${index}`] ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => applySuggestion('headlines', headline, index % 3)}
                      >
                        Uygula
                      </Button>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </div>

            {/* Açıklama Önerileri */}
            <div>
              <Title order={4} mb="md">Açıklama Önerileri</Title>
              <Stack spacing="xs">
                {suggestions.descriptions.map((description, index) => (
                  <Group key={index} position="apart" p="xs" sx={{ border: '1px solid #e9ecef', borderRadius: 4 }}>
                    <Text size="sm">{description}</Text>
                    <Group spacing="xs">
                      <Tooltip label="Kopyala">
                        <ActionIcon
                          size="sm"
                          onClick={() => copyText(description, `description-${index}`)}
                          color={copied[`description-${index}`] ? 'green' : 'blue'}
                        >
                          {copied[`description-${index}`] ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => applySuggestion('descriptions', description, index % 2)}
                      >
                        Uygula
                      </Button>
                    </Group>
                  </Group>
                ))}
              </Stack>
            </div>

            {/* Anahtar Kelime Önerileri */}
            <div>
              <Title order={4} mb="md">Anahtar Kelime Önerileri</Title>
              <Textarea
                value={suggestions.keywords}
                readOnly
                minRows={3}
                rightSection={
                  <Group spacing="xs">
                    <Tooltip label="Kopyala">
                      <ActionIcon
                        onClick={() => copyText(suggestions.keywords, 'keywords')}
                        color={copied.keywords ? 'green' : 'blue'}
                      >
                        {copied.keywords ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => applySuggestion('keywords', suggestions.keywords)}
                    >
                      Uygula
                    </Button>
                  </Group>
                }
              />
            </div>

            {/* İpuçları */}
            <div>
              <Title order={4} mb="md">İpuçları</Title>
              <Stack spacing="xs">
                {suggestions.tips.map((tip, index) => (
                  <Group key={index} spacing="xs" align="flex-start">
                    <Badge size="xs" variant="light" color="blue">{index + 1}</Badge>
                    <Text size="sm">{tip}</Text>
                  </Group>
                ))}
              </Stack>
            </div>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

export default AIHelper;