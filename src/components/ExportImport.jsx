import { useState } from 'react';
import {
  Modal,
  Button,
  Stack,
  Text,
  Textarea,
  Group,
  Title,
  Tabs,
  Alert,
  FileButton,
  JsonInput,
} from '@mantine/core';
import {
  IconDownload,
  IconUpload,
  IconFileExport,
  IconFileImport,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';

const ExportImport = ({ isOpen, onClose, adData, onImportData }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportToJSON = () => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      adData: adData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `google-ad-${new Date().getTime()}.json`;
    link.click();
    
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const exportToCSV = () => {
    const csvData = [
      ['Alan', 'Değer'],
      ['İşletme Adı', adData.businessName],
      ['Web Site', adData.website],
      ['Sektör', adData.industry],
      ['Hedef Kitle', adData.targetAudience],
      ['Başlık 1', adData.headlines[0]],
      ['Başlık 2', adData.headlines[1]],
      ['Başlık 3', adData.headlines[2]],
      ['Açıklama 1', adData.descriptions[0]],
      ['Açıklama 2', adData.descriptions[1]],
      ['Anahtar Kelimeler', adData.keywords],
      ['Son URL', adData.finalUrl],
      ['Görünen URL', adData.displayUrl],
      ['Günlük Bütçe', adData.budget],
      ['Hedef Konum', adData.location],
      ['Dil', adData.language],
      ['Cihaz Hedeflemesi', adData.deviceTargeting],
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const dataBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `google-ad-${new Date().getTime()}.csv`;
    link.click();
    
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const exportToTXT = () => {
    const txtContent = `GOOGLE ARAMA REKLAMI - ${new Date().toLocaleDateString('tr-TR')}
==========================================

İŞLETME BİLGİLERİ:
- İşletme Adı: ${adData.businessName}
- Web Site: ${adData.website}
- Sektör: ${adData.industry}
- Hedef Kitle: ${adData.targetAudience}

REKLAM İÇERİĞİ:
BAŞLIKLAR:
1. ${adData.headlines[0] || '-'}
2. ${adData.headlines[1] || '-'}
3. ${adData.headlines[2] || '-'}

AÇIKLAMALAR:
1. ${adData.descriptions[0] || '-'}
2. ${adData.descriptions[1] || '-'}

URL BİLGİLERİ:
- Son URL: ${adData.finalUrl}
- Görünen URL: ${adData.displayUrl}

ANAHTAR KELİMELER:
${adData.keywords}

HEDEFLEME BİLGİLERİ:
- Günlük Bütçe: ₺${adData.budget}
- Hedef Konum: ${adData.location}
- Dil: ${adData.language}
- Cihaz Hedeflemesi: ${adData.deviceTargeting}

==========================================
Bu reklam metni Google Ads Reklam Oluşturucu ile oluşturulmuştur.`;

    const dataBlob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `google-ad-${new Date().getTime()}.txt`;
    link.click();
    
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData);
      
      if (!parsedData.adData) {
        throw new Error('Geçersiz dosya formatı');
      }
      
      onImportData(parsedData.adData);
      setImportError('');
      onClose();
    } catch (error) {
      setImportError('Geçersiz JSON formatı. Lütfen doğru bir dosya seçin.');
    }
  };

  const handleFileImport = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportData(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group spacing="xs">
          <IconFileExport size={20} />
          <Text weight={600}>Dışa Aktar / İçe Aktar</Text>
        </Group>
      }
      size="lg"
      centered
    >
  <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="export" icon={<IconDownload size={16} />}>
            Dışa Aktar
          </Tabs.Tab>
          <Tabs.Tab value="import" icon={<IconUpload size={16} />}>
            İçe Aktar
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="export" pt="md">
          <Stack spacing="lg">
            <Text color="dimmed">
              Reklam verilerinizi farklı formatlarda dışa aktarın
            </Text>

            {exportSuccess && (
              <Alert
                icon={<IconCheck size={16} />}
                title="Başarılı!"
                color="green"
                variant="light"
              >
                Dosya başarıyla indirildi
              </Alert>
            )}

            <Stack spacing="md">
              <Button
                leftIcon={<IconFileExport size={16} />}
                onClick={exportToJSON}
                variant="light"
                fullWidth
              >
                JSON Formatında İndir
                <Text size="xs" color="dimmed" ml="auto">
                  (.json - Tekrar içe aktarılabilir)
                </Text>
              </Button>

              <Button
                leftIcon={<IconFileExport size={16} />}
                onClick={exportToCSV}
                variant="light"
                fullWidth
              >
                CSV Formatında İndir
                <Text size="xs" color="dimmed" ml="auto">
                  (.csv - Excel'de açılabilir)
                </Text>
              </Button>

              <Button
                leftIcon={<IconFileExport size={16} />}
                onClick={exportToTXT}
                variant="light"
                fullWidth
              >
                Metin Formatında İndir
                <Text size="xs" color="dimmed" ml="auto">
                  (.txt - Okunabilir format)
                </Text>
              </Button>
            </Stack>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="import" pt="md">
          <Stack spacing="lg">
            <Text color="dimmed">
              Daha önce kaydettiğiniz reklam verilerini içe aktarın
            </Text>

            {importError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Hata!"
                color="red"
                variant="light"
              >
                {importError}
              </Alert>
            )}

            <FileButton
              onChange={handleFileImport}
              accept=".json"
            >
              {(props) => (
                <Button
                  {...props}
                  leftIcon={<IconFileImport size={16} />}
                  variant="light"
                  fullWidth
                >
                  JSON Dosyası Seç
                </Button>
              )}
            </FileButton>

            <div>
              <Text size="sm" weight={500} mb="xs">
                Veya JSON içeriğini doğrudan yapıştırın:
              </Text>
              <JsonInput
                placeholder='{"adData": {...}}'
                value={importData}
                onChange={setImportData}
                minRows={6}
                maxRows={12}
                autosize
              />
            </div>

            <Group position="right">
              <Button variant="subtle" onClick={onClose}>
                İptal
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importData.trim()}
              >
                İçe Aktar
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

export default ExportImport;