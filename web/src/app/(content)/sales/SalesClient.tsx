'use client';

import { 
  Container, 
  Title, 
  Paper, 
  Stack, 
  Grid, 
  Select, 
  NumberInput, 
  Button, 
  Divider, 
  Box,
  SimpleGrid,
  Text,
  Group
} from '@mantine/core';
import { 
  IconShoppingCart, 
  IconTrash, 
  IconCoin, 
  IconBox 
} from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { GenericTable, Column, TableAction } from '../components/GenericTable';
import { createSaleAction, refundSaleAction } from './actions';
import { Product } from '../products/ProductsClient';
import { Promotion } from '../promotions/PromotionsClient';

export interface Sale {
  id: string;
  product: Product;
  quantity: number;
  promotion?: Promotion;
  totalValue: number;
  createdAt: string;
}

export interface SalesResponse {
  sales: Sale[];
  totalValue: number;
  totalQuantity: number;
}

interface SalesClientProps {
  products: Product[];
  promotions: Promotion[];
  salesResponse: SalesResponse;
}

export default function SalesClient({ products, promotions, salesResponse }: SalesClientProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtra as promoções elegíveis baseadas no produto selecionado
  const availablePromotions = useMemo(() => {
    if (!selectedProductId) return [];
    return promotions.filter((prom) => prom.product.id === selectedProductId);
  }, [selectedProductId, promotions]);

  const handleProductChange = (val: string | null) => {
    setSelectedProductId(val);
    setSelectedPromotionId(null); 
    setMinQuantity(1);
  };

  const handlePromotionChange = (val: string | null) => {
    setSelectedPromotionId(val);
    const promotion = availablePromotions.find(p => p.id === val);
    const minQty = promotion?.minQuantity || 1;
    setMinQuantity(minQty);
    if(Number(quantity) < minQty) setQuantity(minQty);
  };

  // Submit da Venda integrando com a Server Action
  const handlePlaceSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      setIsSubmitting(true);

      await createSaleAction({
        productId: selectedProductId,
        promotionId: selectedPromotionId,
        quantity: Number(quantity),
      });

      // Limpa os campos após persistir com sucesso no banco através do servidor
      setSelectedProductId(null);
      setSelectedPromotionId(null);
      setMinQuantity(1);
      setQuantity(1);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao processar venda');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefund = async (sale: Sale) => {
    if (confirm(`Deseja mesmo estornar a venda do item: ${sale.product.name}?`)) {
      try {
        await refundSaleAction(sale.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao estornar venda');
      } 
    }
  };

  // Configuração da Tabela Genérica
  const columns: Column<Sale>[] = [
    { key: 'product', header: 'Produto', render: (sale) => sale.product?.name || 'N/A' },
    { key: 'quantity', header: 'Qtd.' },
    { key: 'promotion', header: 'Promoção Aplicada', render: (sale) => sale.promotion?.name || 'Sem Promoção' },
    { 
      key: 'totalValue', 
      header: 'Total Pago', 
      render: (sale) => `R$ ${sale.totalValue}` 
    },
    { 
      key: 'createdAt', 
      header: 'Data', 
      render: (sale) => {
        if (!sale.createdAt) return '-';
        
        const date = new Date(sale.createdAt);
        if (isNaN(date.getTime())) return sale.createdAt; 

        const formatedDate = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        const formatedHour = date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return `${formatedDate} ${formatedHour}`;
      }
    },
    { key: 'actions', header: 'Ações' },
  ];

  const actions: TableAction<Sale>[] = [
    {
      label: 'Estornar',
      icon: <IconTrash size={14} />,
      color: 'red',
      onClick: handleRefund,
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Title order={2}>Nova Venda</Title>

        {/* Seção do Formulário */}
        <Paper withBorder p="xl" radius="md">
          <form onSubmit={handlePlaceSale}>
            <Grid align="flex-end">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="Selecione o Produto"
                  placeholder="Escolha o item"
                  data={products.map((p) => ({ value: p.id, label: `${p.name} (R$ ${p.value?.toFixed(2)})` }))}
                  required
                  disabled={isSubmitting}
                  value={selectedProductId}
                  onChange={handleProductChange}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="Promoção Aplicável"
                  placeholder={selectedProductId ? "Nenhuma selecionada" : "Selecione um produto primeiro"}
                  data={availablePromotions.map((p) => ({ value: p.id, label: p.name }))}
                  disabled={!selectedProductId || availablePromotions.length === 0 || isSubmitting}
                  value={selectedPromotionId}
                  onChange={handlePromotionChange}
                  clearable
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 2 }}>
                <NumberInput
                  label="Quantidade"
                  required
                  disabled={isSubmitting}
                  min={minQuantity}
                  value={quantity}
                  onChange={setQuantity}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 2 }}>
                <Button 
                  type="submit" 
                  color="blue" 
                  fullWidth 
                  leftSection={<IconShoppingCart size={16} />}
                  disabled={!selectedProductId}
                  loading={isSubmitting}
                >
                  Registrar
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Paper>

        {/* BLOCO NOVO: Indicadores Baseados no salesResponse */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} >
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <Stack gap={0}>
                <Text size="xs" color="dimmed" fw={700} tt="uppercase">Valor Total Faturado</Text>
                <Text size="xl" fw={700}>
                  R$ {salesResponse.totalValue}
                </Text>
              </Stack>
              <IconCoin size={32} stroke={1.5} color="var(--mantine-color-green-6)" />
            </Group>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <Stack gap={0}>
                <Text size="xs" color="dimmed" fw={700} tt="uppercase">Quantidade Total Vendida</Text>
                <Text size="xl" fw={700}>{salesResponse.totalQuantity} itens</Text>
              </Stack>
              <IconBox size={32} stroke={1.5} color="var(--mantine-color-blue-6)" />
            </Group>
          </Paper>
        </SimpleGrid>

        <Divider my="md" />

        {/* Seção Tabela */}
        <Box>
          <Title order={3} mb="md">Vendas Efetuadas</Title>
          <GenericTable<Sale> data={salesResponse.sales} columns={columns} actions={actions} rowKey="id" />
        </Box>
      </Stack>
    </Container>
  );
}
