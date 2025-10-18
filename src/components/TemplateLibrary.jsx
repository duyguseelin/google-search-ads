import { useState } from 'react';
import {
  Modal,
  Button,
  Stack,
  Text,
  Group,
  Title,
  Card,
  Badge,
  Grid,
  Textarea,
} from '@mantine/core';
import {
  IconTemplate,
  IconShoppingCart,
  IconBuilding,
  IconStethoscope,
  IconBook,
  IconCar,
  IconHome,
  IconPlane,
  IconCoin,
} from '@tabler/icons-react';

const TemplateLibrary = ({ isOpen, onClose, onTemplateApply }) => {
  const templates = [
    {
      id: 'ecommerce',
      name: 'E-ticaret',
      icon: IconShoppingCart,
      color: 'blue',
      headlines: [
        'En Uygun Fiyatlarla Online Alışveriş',
        'Ücretsiz Kargo + Hızlı Teslimat',
        'İndirimli Ürünler - Kaçırma!'
      ],
      descriptions: [
        'Binlerce ürün arasından seçim yapın. Güvenli ödeme, kolay iade. 7/24 müşteri desteği ile yanınızdayız.',
        'En kaliteli markaların en uygun fiyatları burada. Ücretsiz kargo fırsatını kaçırmayın!'
      ],
      keywords: 'online alışveriş, e-ticaret, uygun fiyat, ücretsiz kargo, güvenli ödeme, hızlı teslimat',
      targetAudience: '18-45 yaş arası online alışveriş yapan kullanıcılar'
    },
    {
      id: 'service',
      name: 'Hizmet Sektörü',
      icon: IconBuilding,
      color: 'green',
      headlines: [
        'Profesyonel Hizmet Garantisi',
        'Uzman Ekip - Kaliteli İş',
        'Ücretsiz Keşif + Fiyat Teklifi'
      ],
      descriptions: [
        'Alanında uzman ekibimizle size özel çözümler sunuyoruz. 10+ yıl deneyim, memnuniyet garantisi.',
        'Kaliteli hizmet arayanlar için doğru adres. Uygun fiyat, zamanında teslimat garantisi.'
      ],
      keywords: 'profesyonel hizmet, uzman ekip, kalite, deneyim, güvenilir, uygun fiyat',
      targetAudience: 'Profesyonel hizmet arayan bireysel ve kurumsal müşteriler'
    },
    {
      id: 'healthcare',
      name: 'Sağlık',
      icon: IconStethoscope,
      color: 'red',
      headlines: [
        'Uzman Doktor Kadrosu',
        'Modern Cihazlar - Güvenli Tedavi',
        'Randevu Al - Hemen Başla'
      ],
      descriptions: [
        'Alanında uzman doktorlarımızla sağlığınızı güvene alın. Modern teknoloji, hasta odaklı yaklaşım.',
        'Sağlığınız bizim önceliğimiz. 7/24 acil hizmet, sigorta anlaşmaları mevcut.'
      ],
      keywords: 'sağlık, doktor, tedavi, hastane, klinik, uzman, randevu, sigorta',
      targetAudience: 'Sağlık hizmeti arayan her yaş grubundan bireyler'
    },
    {
      id: 'education',
      name: 'Eğitim',
      icon: IconBook,
      color: 'violet',
      headlines: [
        'Uzaktan Eğitim Fırsatı',
        'Sertifikalı Kurslar - İş Garantisi',
        'Ücretsiz Deneme Dersi'
      ],
      descriptions: [
        'Alanında uzman eğitmenlerden online eğitim alın. Esnek saatler, uygun fiyatlar, iş garantisi.',
        'Kariyerinizi ilerletmek için doğru adres. Sertifikalı eğitimler, iş yerleştirme desteği.'
      ],
      keywords: 'eğitim, kurs, sertifika, online eğitim, uzaktan eğitim, iş garantisi',
      targetAudience: 'Kendini geliştirmek isteyen çalışanlar ve öğrenciler'
    },
    {
      id: 'automotive',
      name: 'Otomotiv',
      icon: IconCar,
      color: 'orange',
      headlines: [
        'Güvenilir Araç Servisi',
        'Orijinal Yedek Parça Garantisi',
        'Ücretsiz Araç Check-up'
      ],
      descriptions: [
        'Aracınız güvende! Uzman teknisyen kadromuz ve orijinal yedek parçalarla hizmetinizdeyiz.',
        '25+ yıl deneyim, müşteri memnuniyeti %98. Tüm marka araçlar için profesyonel servis.'
      ],
      keywords: 'otomotiv, servis, yedek parça, araç bakım, onarım, güvenilir',
      targetAudience: 'Araç sahibi bireyler ve kurumsal filolar'
    },
    {
      id: 'realestate',
      name: 'Gayrimenkul',
      icon: IconHome,
      color: 'teal',
      headlines: [
        'Hayalinizdeki Ev Burada',
        'Sıfır Komisyon + Ücretsiz Danışmanlık',
        'En Uygun Fiyatlarla Satılık Daireler'
      ],
      descriptions: [
        'Geniş portföyümüzden size uygun ev bulun. Profesyonel danışmanlık, güvenli alım-satım işlemleri.',
        'Gayrimenkul yatırımında doğru tercih. Şeffaf fiyatlandırma, hukuki güvence, ekspert raporu.'
      ],
      keywords: 'gayrimenkul, satılık, kiralık, daire, ev, yatırım, komisyonsuz',
      targetAudience: 'Ev almak/satmak/kiralamak isteyen bireyler'
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const applyTemplate = (template) => {
    onTemplateApply(template);
    onClose();
  };

  const renderTemplatePreview = (template) => (
    <Modal
      opened={selectedTemplate?.id === template.id}
      onClose={() => setSelectedTemplate(null)}
      title={`${template.name} Şablonu`}
      size="lg"
      centered
    >
      <Stack spacing="md">
        <div>
          <Text weight={500} mb="xs">Başlıklar:</Text>
          {template.headlines.map((headline, index) => (
            <Text key={index} size="sm" p="xs" bg="gray.0" mb="xs">
              {headline}
            </Text>
          ))}
        </div>

        <div>
          <Text weight={500} mb="xs">Açıklamalar:</Text>
          {template.descriptions.map((description, index) => (
            <Textarea
              key={index}
              value={description}
              readOnly
              minRows={2}
              mb="xs"
            />
          ))}
        </div>

        <div>
          <Text weight={500} mb="xs">Anahtar Kelimeler:</Text>
          <Text size="sm" p="xs" bg="gray.0">
            {template.keywords}
          </Text>
        </div>

        <div>
          <Text weight={500} mb="xs">Hedef Kitle:</Text>
          <Text size="sm" p="xs" bg="gray.0">
            {template.targetAudience}
          </Text>
        </div>

        <Group position="right" mt="md">
          <Button variant="subtle" onClick={() => setSelectedTemplate(null)}>
            Kapat
          </Button>
          <Button onClick={() => applyTemplate(template)}>
            Şablonu Kullan
          </Button>
        </Group>
      </Stack>
    </Modal>
  );

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={onClose}
        title={
          <Group spacing="xs">
            <IconTemplate size={20} />
            <Text weight={600}>Şablon Kütüphanesi</Text>
          </Group>
        }
        size="xl"
        centered
      >
        <Stack spacing="md">
          <Text color="dimmed">
            Sektörünüze uygun hazır şablonları kullanarak hızlıca reklam oluşturun.
          </Text>

          <Grid>
            {templates.map((template) => (
              <Grid.Col key={template.id} span={6}>
                <Card
                  withBorder
                  p="md"
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}
                >
                  <Group spacing="sm" mb="md">
                    <template.icon size={24} color={`var(--mantine-color-${template.color}-6)`} />
                    <div>
                      <Text weight={500}>{template.name}</Text>
                      <Badge size="sm" color={template.color} variant="light">
                        Hazır Şablon
                      </Badge>
                    </div>
                  </Group>

                  <Text size="sm" color="dimmed" mb="md">
                    {template.descriptions[0].substring(0, 80)}...
                  </Text>

                  <Group spacing="xs">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Önizle
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => applyTemplate(template)}
                    >
                      Kullan
                    </Button>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Modal>

      {templates.map((template) => (
        selectedTemplate?.id === template.id && renderTemplatePreview(template)
      ))}
    </>
  );
};

export default TemplateLibrary;