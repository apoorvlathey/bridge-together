import { FormControl, FormLabel, Input } from "@chakra-ui/react";

interface Props {
  tokenName: string;
  tokenAmount: number | undefined;
  setTokenAmount: (value: number) => void;
}

export default function TokenInput({
  tokenName,
  tokenAmount,
  setTokenAmount,
}: Props) {
  return (
    <FormControl>
      <FormLabel fontSize={"lg"} color="black" fontWeight={"bold"}>
        Enter {tokenName} Amount
      </FormLabel>
      <Input
        type={"number"}
        value={tokenAmount === 0 ? "" : tokenAmount}
        onChange={(e) => {
          const _val = e.target.value;
          if (_val) {
            setTokenAmount(parseFloat(_val));
          } else {
            setTokenAmount(0);
          }
        }}
        bg={"white"}
        color={"black"}
      />
    </FormControl>
  );
}
