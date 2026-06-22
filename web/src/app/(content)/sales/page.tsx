'use client';

import { Container, Title, Paper, Stack, Grid, Select, NumberInput, Button, Divider, Box } from '@mantine/core';
import { IconShoppingCart, IconEye, IconTrash } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { GenericTable, Column, TableAction } from '../components/GenericTable';

// Definição das interfaces para o estado local
interface Product {
  id: string;
  name: string;
  price: number;
}

interface Promotion {
  id: string;
  productId: string;
  minQty: number;
  discountValue: number;
  label: string;
}

interface Sale {
  id: string;
  productName: string;
  quantity: number;
  promotionLabel: string;
  totalPrice: number;
  date: string;
}

export default function SalesPage() {
  // 1. Dados simulados (Mock) para os Dropdowns
  const products: Product[] = [
    { id: 'p1', name: 'Notebook Dell', price: 4500.00 },
    { id: 'p2', name: 'Mouse Sem Fio', price: 150.00 },
    { id: 'p3', name: 'Monitor LG 29"', price: 1200.00 },
  ];

  const promotions: Promotion[] = [
    { id: 'prom1', productId: 'p1', minQty: 2, discountValue: 300.00, label: 'Leve 2 Notebooks - R$300 desc.' },
    { id: 'prom2', productId: 'p2', minQty: 5, discountValue: 50.00, label: 'Atacado Mouse - R$50 desc.' },
  ];

  // 2. Estado do Formulário
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number | string>(1);

  // 3. Estado da Tabela (Últimas Vendas)
  const [salesHistory, setSalesHistory] = useState<Sale[]>([
    { id: 's1', productName: 'Monitor LG 29"', quantity: 1, promotionLabel: 'Nenhuma', totalPrice: 1200.00, date: '21/06/2026' },
    { id: 's2', productName: 'Notebook Dell', quantity: 2, promotionLabel: 'Leve 2 Notebooks', totalPrice: 8700.00, date: '21/06/2026' },
  ]);

  // 4. Filtrar as promoções elegíveis baseadas no produto selecionado
  const availablePromotions = useMemo(() => {
    if (!selectedProductId) return [];
    return promotions.filter((prom) => prom.productId === selectedProductId);
  }, [selectedProductId]);

  // Resetar promoção se o produto mudar
  const handleProductChange = (val: string | null) => {
    setSelectedProductId(val);
    setSelectedPromotionId(null); 
  };

  // 5. Submit da Venda
  const handlePlaceSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const product = products.find((p) => p.id === selectedProductId)!;
    const qty = Number(quantity);
    
    // Calcula o preço bruto
    let total = product.price * qty;

    // Aplica o desconto caso uma promoção válida esteja selecionada
    let appliedPromoLabel = 'Nenhuma';
    if (selectedPromotionId) {
      const promo = promotions.find((p) => p.id === selectedPromotionId);
      if (promo && qty >= promo.minQty) {
        total -= promo.discountValue;
        appliedPromoLabel = promo.label;
      }
    }

    const newSale: Sale = {
      id: `s`,
      productName: product.name,
      quantity: qty,
      promotionLabel: appliedPromoLabel,
      totalPrice: Math.max(0, total), // Garante que o total não seja negativo
      date: new Date().toLocaleDateString('pt-BR'),
    };

    // Adiciona ao topo e mantém apenas as 5 últimas vendas
    setSalesHistory((prev) => [newSale, ...prev].slice(0, 5));

    // Resetar campos do formulário
    setSelectedProductId(null);
    setSelectedPromotionId(null);
    setQuantity(1);
  };

  // 6. Configuração da Tabela Genérica
  const columns: Column<Sale>[] = [
    { key: 'productName', header: 'Produto' },
    { key: 'quantity', header: 'Qtd.' },
    { key: 'promotionLabel', header: 'Promoção Aplicada' },
    { 
      key: 'totalPrice', 
      header: 'Total Pago', 
      render: (sale) => `R$ ${sale.totalPrice.toFixed(2)}` 
    },
    { key: 'date', header: 'Data' },
    { key: 'actions', header: 'Ações' },
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
      onClick: (sale) => {
        setSalesHistory((prev) => prev.filter((s) => s.id !== sale.id));
      },
    },
  ];

  return (
    <Container size="xl">
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
                  data={products.map((p) => ({ value: p.id, label: `${p.name} (R$ ${p.price.toFixed(2)})` }))}
                  required
                  value={selectedProductId}
                  onChange={handleProductChange}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="Promoção Aplicável"
                  placeholder={selectedProductId ? "Nenhuma selecionada" : "Selecione um produto primeiro"}
                  data={availablePromotions.map((p) => ({ value: p.id, label: p.label }))}
                  disabled={!selectedProductId || availablePromotions.length === 0}
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
                >
                  Registrar
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Paper>

        <Divider my="md" />

        {/* Seção Histórico */}
        <Box>
          <Title order={3} mb="md">Últimas 5 Vendas Efetuadas</Title>
          <GenericTable data={salesHistory} columns={columns} actions={actions} rowKey="id" />
        </Box>
      </Stack>
    </Container>
  );
}