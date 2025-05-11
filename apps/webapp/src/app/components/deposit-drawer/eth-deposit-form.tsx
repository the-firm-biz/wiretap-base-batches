import z from 'zod';
import { useForm } from 'react-hook-form';
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

interface EthDepositFormProps {
  userBalance: number;
}

const REQUIRED_FIELD_MESSAGE = 'Required';
const TRANSFER_GAS_ESTIMATE_ETH = 0.0000005; // @todo: Can run an actual estimate to get this

export function EthDepositForm({ userBalance }: EthDepositFormProps) {
  const trpc = useTRPC();

  const formSchema = z.object({
    ethToDeposit: z
      .number({ message: REQUIRED_FIELD_MESSAGE })
      .min(0.1e-17, { message: REQUIRED_FIELD_MESSAGE }) // 1 wei
      .max(userBalance, { message: 'Insufficient ETH in your wallet' })
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
    // Do something with the form values.
    console.log(values);
  }

  function getPercentOfBalance(percent: number, roundingDecimals = 5) {
    const value = (userBalance * percent) / 100;
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
                    variant="outline"
                    className="flex-1"
                    onClick={() => field.onChange(getPercentOfBalance(25))}
                  >
                    25%
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => field.onChange(getPercentOfBalance(50))}
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => field.onChange(getPercentOfBalance(75))}
                  >
                    75%
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const maxEth = userBalance - TRANSFER_GAS_ESTIMATE_ETH;
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
          <Button className="flex-1" disabled={hasError} type="submit">
            Confirm Deposit
          </Button>
        </div>
      </form>
    </Form>
  );
}
