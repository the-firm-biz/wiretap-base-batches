import z from 'zod';
import { useForm } from 'react-hook-form';
import { Dispatch, SetStateAction } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { textStyles } from '@/app/styles/template-strings';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  FormMessage,
  Form,
  FormItem,
  FormControl,
  FormField
} from '../ui/form';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { formatUsd } from '@/app/utils/format/format-usd';
import { formatUnits } from '@/app/utils/format/format-units';
import { MIN_TRADE_THRESHOLD_WEI } from '@wiretap/config';
import { DepositState, DepositDrawerStep } from './deposit-drawer';
import { Address, formatEther } from 'viem';

interface EthDepositFormProps {
  userBalance: number;
  setDepositState: Dispatch<SetStateAction<DepositState>>;
}

const REQUIRED_FIELD_MESSAGE = 'Required';
const TRANSFER_GAS_ESTIMATE_ETH = 0.0000005; // @todo: Could be improved by running an eth transfer gas estimate
const MAX_ALPHA_TESTING_DEPOSIT_AMOUNT = 0.05;

export function EthDepositForm({
  userBalance,
  setDepositState
}: EthDepositFormProps) {
  const trpc = useTRPC();

  const { data: portfolio, isLoading: isLoadingPortfolio } = useQuery(
    trpc.wireTapAccount.getAuthedAccountGliderPortfolio.queryOptions()
  );
  const hasExistingPortfolio = !!portfolio;

  const portfolioBalanceEth = formatUnits(
    portfolio?.balanceWei || BigInt(0),
    18,
    false
  );

  const maxDepositAmount = Math.min(
    userBalance,
    MAX_ALPHA_TESTING_DEPOSIT_AMOUNT - portfolioBalanceEth
  );

  const minDepositAmount = Number(formatEther(MIN_TRADE_THRESHOLD_WEI));

  const formSchema = z.object({
    ethToDeposit: z
      .number({ message: REQUIRED_FIELD_MESSAGE })
      .min(minDepositAmount, {
        message: `Min deposit ${minDepositAmount} ETH`
      })
      .max(userBalance, { message: 'Insufficient ETH in your wallet' })
      .max(MAX_ALPHA_TESTING_DEPOSIT_AMOUNT, {
        message: `Max ${MAX_ALPHA_TESTING_DEPOSIT_AMOUNT} ETH: Alpha testing phase`
      })
  });
  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      ethToDeposit: undefined
    }
  });

  const hasError = !form.formState.isValid;
  const ethToDepositFormValue = form.watch('ethToDeposit');

  const { data: ethPriceUsd } = useQuery(
    trpc.app.getEthPriceUsd.queryOptions()
  );
  const usdDisplayValue = formatUsd(ethToDepositFormValue * (ethPriceUsd || 0));

  function onSubmitForm(values: z.infer<typeof formSchema>) {
    const nextStep: DepositDrawerStep = hasExistingPortfolio
      ? 'confirm-deposit-tx'
      : 'sign-glider-message';

    setDepositState(() => ({
      amountEthToDeposit: values.ethToDeposit,
      step: nextStep,
      gliderPortfolioAddress: portfolio?.address as Address | undefined
    }));
  }

  function getPercentOfMaxDeposit(percent: number, roundingDecimals = 5) {
    const value = (maxDepositAmount * percent) / 100;
    const roundingFactor = Math.pow(10, roundingDecimals);
    return Math.round(value * roundingFactor) / roundingFactor;
  }

  function getFormMessage() {
    if (hasError) {
      return <FormMessage />;
    }

    if (isNaN(ethToDepositFormValue)) {
      return null;
    }

    if (usdDisplayValue) {
      return <p className={textStyles['compact']}>${usdDisplayValue}</p>;
    }

    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)}>
        <div className="flex flex-col gap-2">
          <p className={textStyles['compact-mid']}>Transfer ETH</p>
          <FormField
            control={form.control}
            name="ethToDeposit"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (value === '') {
                        field.onChange(undefined);
                      } else {
                        const numValue = parseFloat(value);
                        field.onChange(isNaN(numValue) ? undefined : numValue);
                      }
                    }}
                  />
                </FormControl>

                {getFormMessage()}

                <div className="relative flex flex-row gap-1 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => field.onChange(getPercentOfMaxDeposit(25))}
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => field.onChange(getPercentOfMaxDeposit(50))}
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => field.onChange(getPercentOfMaxDeposit(75))}
                  >
                    75%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const maxEth =
                        maxDepositAmount - TRANSFER_GAS_ESTIMATE_ETH;
                      field.onChange(maxEth);
                    }}
                  >
                    Max
                  </Button>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="mt-8 flex w-full">
          <Button
            className="flex-1"
            disabled={hasError || isLoadingPortfolio}
            type="submit"
          >
            Confirm Deposit
          </Button>
        </div>
      </form>
    </Form>
  );
}
