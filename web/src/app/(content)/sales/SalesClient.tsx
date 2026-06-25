'use client';

import { Container, Title, Paper, Stack, Grid, Select, NumberInput, Button, Divider, Box } from '@mantine/core';
import { IconShoppingCart, IconEye, IconTrash } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { GenericTable, Column, TableAction } from '../components/GenericTable';
import { createSaleAction, refundSaleAction } from './actions';
import { Product } from '../products/ProductsClient';
import { Promotion } from '../promotions/PromotionsClient';

export interface Sale {
  id: string;
  productName: string;
  quantity: number;
  promotionLabel: string;
  totalPrice: number;
  date: string;
}

interface SalesClientProps {
  products: Product[];
  promotions: Promotion[];
  initialHistory: Sale[];
}

export default function SalesClient({ products, promotions, initialHistory }: SalesClientProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtra as promoções elegíveis baseadas no produto selecionado
  const availablePromotions = useMemo(() => {
    if (!selectedProductId) return [];
    return promotions.filter((prom) => prom.productId === selectedProductId);
  }, [selectedProductId, promotions]);

  const handleProductChange = (val: string | null) => {
    setSelectedProductId(val);
    setSelectedPromotionId(null); 
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
      setQuantity(1);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao processar venda');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefund = async (sale: Sale) => {
    if (confirm(`Deseja mesmo estornar a venda do item: ${sale.productName}?`)) {
      try {
        await refundSaleAction(sale.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erro ao estornar venda');
      } 
    }
  };

  // Configuração da Tabela Genérica
  const columns: Column<Sale>[] = [
    { key: 'productName', header: 'Produto' },
    { key: 'quantity', header: 'Qtd.' },
    { key: 'promotionLabel', header: 'Promoção Aplicada' },
    { 
      key: 'totalPrice', 
      header: 'Total Pago', 
      render: (sale) => `R$ ${sale.value}` 
    },
    { key: 'date', header: 'Data' },
  ];

  const actions: TableAction<Sale>[] = [
    {
      label: 'Detalhes',
      icon: <IconEye size={14} />,
      onClick: (sale) => alert(`Detalhes da venda ID: ${sale.id}`),
    },
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

        <Paper withBorder p="xl" radius="md">
          <form onSubmit={handlePlaceSale}>
            <Grid align="flex-end">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="Selecione o Produto"
                  placeholder="Escolha o item"
                  data={products.map((p) => ({ value: p.id, label: `${p.name} (R$ ${p.value.toFixed(2)})` }))}
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
                  onChange={setSelectedPromotionId}
                  clearable
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 2 }}>
                <NumberInput
                  label="Quantidade"
                  min={1}
                  required
                  disabled={isSubmitting}
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

        <Divider my="md" />

        <Box>
          <Title order={3} mb="md">Últimas 5 Vendas Efetuadas</Title>
          <GenericTable<Sale> data={initialHistory} columns={columns} actions={actions} rowKey="id" />
        </Box>
      </Stack>
    </Container>
  );
}