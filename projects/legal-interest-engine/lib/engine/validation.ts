import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isoDateString = z.string().regex(isoDateRegex, 'Must be a valid ISO date (YYYY-MM-DD)');

export const ComputationInputSchema = z
  .object({
    obligationType: z.enum(['loan_forbearance', 'non_loan']),
    claimType: z.enum(['liquidated', 'unliquidated']),
    principalAmount: z.number().positive('Principal amount must be greater than 0'),
    demandDate: isoDateString,
    filingDate: isoDateString,
    judgmentDate: isoDateString.optional(),
    judgmentFinalityDate: isoDateString.optional(),
    stipulatedRate: z.number().gt(0).lte(1).optional(),
    targetDate: isoDateString,
    additionalAwards: z
      .object({
        moralDamages: z.number().positive().optional(),
        exemplaryDamages: z.number().positive().optional(),
        attorneysFees: z.number().positive().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // filingDate >= demandDate
    if (data.filingDate < data.demandDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'filingDate must be on or after demandDate',
        path: ['filingDate'],
      });
    }

    // targetDate >= demandDate
    if (data.targetDate < data.demandDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'targetDate must be on or after demandDate',
        path: ['targetDate'],
      });
    }

    // judgmentDate required when claimType is 'unliquidated'
    if (data.claimType === 'unliquidated' && !data.judgmentDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'judgmentDate is required when claimType is unliquidated',
        path: ['judgmentDate'],
      });
    }
  });

export type ComputationInputValidated = z.infer<typeof ComputationInputSchema>;
