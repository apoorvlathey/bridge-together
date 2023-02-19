import NextImg from "next/image";
import {
  Button,
  Text,
  Stack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  HStack,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useNetwork, useSwitchNetwork, useAccount } from "wagmi";
import { supportedChains } from "@/config";
import useSupportedChain from "@/hooks/useSupportedChain";

function SwitchNetwork() {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork({
    onSuccess() {
      closeModal();
    },
  });
  const { address } = useAccount();
  const { isSupportedChain } = useSupportedChain();

  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();

  return (
    <>
      {address && isSupportedChain && (
        <Button
          mr="1rem"
          py="1.3rem"
          bg="whiteAlpha.700"
          _hover={{
            bg: "white",
          }}
          color="black"
          borderRadius="lg"
          onClick={() => openModal()}
        >
          <HStack>
            <NextImg
              src={`/icons/chains/${chain?.name}.png`}
              width="24px"
              height="24px"
            />
            <Text>{chain?.name}</Text>
          </HStack>
        </Button>
      )}
      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent bg="gray.300">
          <ModalHeader color="black">🔁 Switch Network</ModalHeader>
          <ModalCloseButton color={"black"} />
          <ModalBody>
            <Stack spacing={3} my="1rem" mx="auto" w="12rem">
              {supportedChains.map((_chain, i) => (
                <Button
                  key={i}
                  bg="white"
                  color="black"
                  _hover={
                    chain && _chain.id !== chain.id
                      ? {
                          bgColor: "blackAlpha.300",
                        }
                      : {}
                  }
                  onClick={() => {
                    switchNetwork!(_chain.id);
                  }}
                  isDisabled={chain && _chain.id === chain.id}
                >
                  <HStack>
                    <NextImg
                      src={`/icons/chains/${_chain.name}.png`}
                      width="24px"
                      height="24px"
                    />
                    <Text>{_chain.name}</Text>
                  </HStack>
                </Button>
              ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default SwitchNetwork;
