import { useEffect, useState } from 'react';
import { Popover, ActionIcon, Stack, Button, Text, Group, Badge, Tooltip, Loader, ScrollArea } from '@mantine/core';
import { IconWand, IconRefresh, IconCheck } from '@tabler/icons-react';
import { openAIService } from '../services/openAIService';

export default function SuggestionMenu({ type, context, limit, onApply, disabled }) {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const apiReady = !!import.meta.env.VITE_OPENAI_API_KEY;

  const fetchSuggestions = async () => {
    if (!apiReady) return;
    setLoading(true);
    const res = await openAIService.generateFieldSuggestions({ type, context });
    if (res.success) setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (opened && items.length === 0) {
      fetchSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const apply = (value) => {
    onApply?.(value);
    setOpened(false);
  };

  const renderItem = (val, i) => {
    const len = val?.length || 0;
    const over = limit ? len > limit : false;
    return (
      <Button key={i} variant="light" color={over ? 'red' : 'blue'} onClick={() => apply(val)} rightIcon={<IconCheck size={14} />} fullWidth>
        <Group position="apart" spacing="xs" w="100%">
          <Text size="sm" lineClamp={1}>{val}</Text>
          {limit ? <Badge size="xs" color={over ? 'red' : len >= (limit*0.75) ? 'yellow' : 'teal'}>{len}/{limit}</Badge> : null}
        </Group>
      </Button>
    );
  };

  return (
    <Popover opened={opened} onChange={setOpened} width={320} position="bottom-end" withArrow shadow="md">
      <Popover.Target>
        <Tooltip label={apiReady ? 'Öneriler' : 'API key gerekli'}>
          <ActionIcon variant="light" color="violet" onClick={() => setOpened((o) => !o)} disabled={!apiReady || disabled}>
            <IconWand size={16} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        {loading ? (
          <Group spacing="xs"><Loader size={16} /><Text size="sm">Öneriler yükleniyor…</Text></Group>
        ) : (
          <Stack spacing="xs">
            {type === 'keywords' && items.length > 0 && (
              <Button variant="subtle" onClick={() => apply(items.join(', '))}>Hepsini uygula</Button>
            )}
            <ScrollArea.Autosize mah={260}>
              <Stack spacing="xs">
                {items.map((val, i) => renderItem(val, i))}
                {items.length === 0 && <Text size="sm" color="dimmed">Öneri bulunamadı</Text>}
              </Stack>
            </ScrollArea.Autosize>
            <Group position="right" spacing="xs">
              <Button compact variant="light" leftIcon={<IconRefresh size={14} />} onClick={fetchSuggestions}>Yenile</Button>
            </Group>
          </Stack>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
