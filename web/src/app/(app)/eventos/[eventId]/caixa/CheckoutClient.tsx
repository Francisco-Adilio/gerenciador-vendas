'use client';

import { Box, Button, Drawer, Grid, Group, Notification, Paper, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconChevronUp, IconPackage, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createSaleAction, deleteSaleAction } from '../../../../lib/actions';
import { formatBRL } from '../../../../lib/pricing';
import { PAYMENT_LABELS, type EventProduct, type PaymentMethod, type Sale } from '../../../../lib/types';
import { BOTTOM_NAV_HEIGHT } from '../EventNav';
import { Cart } from './Cart';
import { ProductGrid } from './ProductGrid';
import { useCart, type CartLine } from './useCart';

const UNDO_MS = 8000;

type Toast =
  | { kind: 'sale'; sale: Sale; lines: CartLine[] }
  | { kind: 'info'; message: string }
  | { kind: 'error'; message: string };

interface Props {
  eventId: string;
  products: EventProduct[];
}

export default function CheckoutClient({ eventId, products }: Props) {
  const cart = useCart();
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [drawerOpened, drawer] = useDisclosure(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((t: Toast, ms = UNDO_MS) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // An empty cart has nothing to show: close the phone drawer (e.g. after "Limpar" or removing the last line)
  const cartEmpty = cart.lines.length === 0;
  useEffect(() => { if (cartEmpty) drawer.close(); }, [cartEmpty, drawer]);

  const pay = async (method: PaymentMethod) => {
    if (pending || cart.lines.length === 0) return;
    const snapshot = cart.lines;
    setPending(true);
    // Optimistic: clear right away so the next customer can be served
    cart.clear();
    drawer.close();

    const result = await createSaleAction(
      eventId,
      method,
      snapshot.map((l) => ({ productId: l.product.id, promotionId: l.promotion?.id ?? null, quantity: l.quantity })),
    );
    setPending(false);

    if (result.ok) {
      showToast({ kind: 'sale', sale: result.data, lines: snapshot });
    } else {
      cart.setLines(snapshot);
      showToast({ kind: 'error', message: result.error }, 6000);
    }
  };

  const undo = async (sale: Sale, lines: CartLine[]) => {
    setToast(null);
    setPending(true);
    const result = await deleteSaleAction(eventId, sale.id);
    setPending(false);
    if (result.ok) {
      // Bring the items back so a wrong payment method can be fixed with one more tap
      cart.setLines((current) => (current.length === 0 ? lines : current));
      showToast({ kind: 'info', message: 'Venda desfeita. Os itens voltaram para o carrinho.' }, 4000);
    } else {
      showToast({ kind: 'error', message: result.error }, 6000);
    }
  };

  if (products.length === 0) {
    return (
      <Stack align="center" py={60} px="md" gap="md">
        <IconPackage size={48} color="var(--mantine-color-gray-5)" />
        <Text c="dimmed" ta="center">Este evento ainda não tem produtos.</Text>
        <Button component={Link} href={`/eventos/${eventId}/produtos`}>Adicionar produtos</Button>
      </Stack>
    );
  }

  const cartProps = {
    lines: cart.lines,
    total: cart.total,
    pending,
    onIncrement: cart.increment,
    onDecrement: cart.decrement,
    onChangePromotion: cart.changePromotion,
    onClear: cart.clear,
    onPay: pay,
  };

  return (
    <Box p="sm">
      <Grid gap="sm">
        <Grid.Col span={{ base: 12, sm: 7, md: 8 }}>
          <ProductGrid products={products} quantityByProduct={cart.quantityByProduct} onAdd={cart.add} />
          {/* room for the sticky cart bar on phones */}
          <Box hiddenFrom="sm" h={72} />
        </Grid.Col>

        {/* Side panel on tablet/desktop */}
        <Grid.Col span={{ sm: 5, md: 4 }} visibleFrom="sm">
          <Paper withBorder radius="md" p="sm" style={{ position: 'sticky', top: 60 }}>
            <Cart {...cartProps} listMaxHeight="calc(100dvh - 380px)" />
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Sticky cart bar on phones, above the bottom tab bar */}
      <Paper
        hiddenFrom="sm"
        shadow="lg"
        radius={0}
        p="xs"
        style={{ position: 'fixed', left: 0, right: 0, bottom: BOTTOM_NAV_HEIGHT, zIndex: 140, borderTop: '1px solid var(--mantine-color-gray-3)' }}
      >
        <Button
          fullWidth
          size="lg"
          h={52}
          color="orange"
          disabled={cart.lines.length === 0 || pending}
          onClick={drawer.open}
          rightSection={<IconChevronUp size={18} />}
          justify="space-between"
        >
          {cart.items === 0 ? 'Carrinho vazio' : `${cart.items} ${cart.items === 1 ? 'item' : 'itens'} · ${formatBRL(cart.total)}`}
        </Button>
      </Paper>

      <Drawer opened={drawerOpened} onClose={drawer.close} position="bottom" size="auto" withCloseButton={false} padding="md" radius="md">
        <Cart {...cartProps} listMaxHeight="50dvh" onBack={drawer.close} />
      </Drawer>

      {/* Toast with undo */}
      {toast && (
        <Box style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 400, display: 'flex', justifyContent: 'center', padding: '0 12px', pointerEvents: 'none' }}>
          <Notification
            style={{ pointerEvents: 'auto', width: '100%', maxWidth: 420 }}
            withBorder
            color={toast.kind === 'error' ? 'red' : 'teal'}
            icon={toast.kind === 'error' ? <IconX size={18} /> : <IconCheck size={18} />}
            onClose={() => setToast(null)}
            title={toast.kind === 'sale' ? `Venda registrada · ${formatBRL(toast.sale.totalValue)}` : undefined}
          >
            {toast.kind === 'sale' ? (
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm">{PAYMENT_LABELS[toast.sale.paymentMethod]}</Text>
                <Button size="compact-sm" variant="light" color="red" onClick={() => undo(toast.sale, toast.lines)}>
                  Desfazer
                </Button>
              </Group>
            ) : (
              toast.message
            )}
          </Notification>
        </Box>
      )}
    </Box>
  );
}
