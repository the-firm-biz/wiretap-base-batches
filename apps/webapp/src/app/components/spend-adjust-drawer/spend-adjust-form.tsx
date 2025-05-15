import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { trpcClientUtils, useTRPC } from '@/app/trpc-clients/trpc-react-client';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { textStyles } from '../../styles/template-strings';
import { TargetTrackingStatus } from '../../utils/target/types';
import {
  FormMessage,
  Form,
  FormItem,
  FormControl,
  FormField
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatUsd } from '../../utils/format/format-usd';
import { useBalance } from 'wagmi';
import { formatUnits } from '../../utils/format/format-units';

const REQUIRED_FIELD_MESSAGE = 'Required';
const MAX_SPEND_LOW_LIMIT_ETH = 0.001;
const MAX_SPEND_HIGH_LIMIT_ETH = 0.2;

type SpendAdjustFormProps = {
  isDisabledForm: boolean;
  trackingStatus: TargetTrackingStatus;
};

export const SpendAdjustForm: React.FC<SpendAdjustFormProps> = ({
  isDisabledForm,
  trackingStatus
}) => {
  const trpc = useTRPC();

  const { mutate: updateTargetMaxSpend } = useMutation(
    trpc.wireTapAccount.updateTargetMaxSpend.mutationOptions({
      onSuccess: (response) => {
        trpcClientUtils.wireTapAccount.getAuthedAccountTargets.invalidate();
        toast(
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className={textStyles['compact-emphasis']}>
                Max Spend Confirmed
              </div>
              <div className={textStyles.label}>
                {response.newMaxSpendEth} ETH
              </div>
            </div>
          </div>
        );
      },
      onError: () => {
        toast(
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-1">
              <div className={textStyles['compact-emphasis']}>
                Failed to adjust Max Spend
              </div>
              <div className={textStyles.label}>Please try again</div>
            </div>
          </div>
        );
      }
    })
  );

  const { data: gliderPortfolio } = useQuery(
    trpc.wireTapAccount.getAuthedAccountGliderPortfolio.queryOptions()
  );

  const { data: portfolioBalance } = useBalance({
    address: gliderPortfolio?.address,
    query: {
      enabled: !!gliderPortfolio?.address
    }
  });

  const portfolioBalanceEth = formatUnits(
    portfolioBalance?.value || BigInt(0),
    18,
    5
  );

  const formSchema = z.object({
    newMaxSpendEth: z
      .number({ message: REQUIRED_FIELD_MESSAGE })
      .min(0.1e-17, { message: REQUIRED_FIELD_MESSAGE }) // 1 wei
      .min(MAX_SPEND_LOW_LIMIT_ETH, {
        message: `Min deposit ${MAX_SPEND_LOW_LIMIT_ETH} ETH`
      })
      .max(portfolioBalanceEth, {
        message: 'Insufficient ETH in your WireTap Balance'
      })
      .max(MAX_SPEND_HIGH_LIMIT_ETH, {
        message: `Max ${MAX_SPEND_HIGH_LIMIT_ETH} ETH: Alpha testing phase`
      })
  });
  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      newMaxSpendEth: undefined
    }
  });

  const hasError = !form.formState.isValid;
  const newMaxSpendEthFormValue = form.watch('newMaxSpendEth');

  const { data: ethPriceUsd } = useQuery(
    trpc.app.getEthPriceUsd.queryOptions()
  );
  const usdDisplayValue = formatUsd(
    newMaxSpendEthFormValue * (ethPriceUsd || 0)
  );

  function onSubmitForm(values: z.infer<typeof formSchema>) {
    // The targetAccountEntityId is guaranteed to be present within spend adjust form
    updateTargetMaxSpend({
      targetAccountEntityId: trackingStatus.targetAccountEntityId!,
      newMaxSpendEth: values.newMaxSpendEth
    });
  }

  function getFormMessage() {
    if (hasError) {
      return <FormMessage />;
    }

    if (isNaN(newMaxSpendEthFormValue)) {
      return null;
    }

    if (usdDisplayValue) {
      return <div className={textStyles.compact}>${usdDisplayValue}</div>;
    }

    return null;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)}>
        <div className="flex justify-between items-center">
          <div className={textStyles['compact-mid']}>
            Spend how much per token buy?
          </div>
          <div className={textStyles.compact}>
            Balance: {portfolioBalanceEth}
          </div>
        </div>

        <FormField
          control={form.control}
          name="newMaxSpendEth"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="pt-2">
                  <Input
                    type="number"
                    {...field}
                    disabled={isDisabledForm}
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
                </div>
              </FormControl>
              <div className="h-5">{getFormMessage()}</div>
              <div className="relative flex flex-row gap-1 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => field.onChange(0.01)}
                >
                  0.01
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => field.onChange(0.05)}
                >
                  0.05
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => field.onChange(0.1)}
                >
                  0.1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => field.onChange(0.2)}
                >
                  0.2
                </Button>
              </div>
            </FormItem>
          )}
        />
        <div className={`${textStyles.label} py-6 text-center`}>
          This is the amount that’ll be spent on automated token purchases. If
          your balance falls below this amount, your remaining balance will be
          used instead.
        </div>
        <div className="flex flex-col pb-4">
          <Button type="submit" disabled={hasError || isDisabledForm}>
            Confirm Quantity
          </Button>
        </div>
      </form>
    </Form>
  );
};
