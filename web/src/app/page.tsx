import { Button, Flex, Input } from "@mantine/core";

export default function Home() {
  return (
    <Flex mih="100vh" justify="center" align="center">
      <Flex direction="column" p="md" bd="1px solid black" gap="sm">
        <Input placeholder="Login" /> 
        <Input placeholder="Senha" /> 
        <Button>Entrar</Button>
      </Flex>
    </Flex>
  );
}
